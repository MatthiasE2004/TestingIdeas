package nl.learn.courses;

import com.google.gson.*;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.*;
import java.util.concurrent.*;

/** Desktop-JVM test of the llama.cpp path of NativeLlm with a real GGUF. Usage: GgufTest <fixtureDir> <ggufFile> */
public class GgufTest {
    static BlockingQueue<JsonObject> events = new LinkedBlockingQueue<JsonObject>();
    static JsonObject waitFor(String type, int id, long ms) throws Exception {
        long end = System.currentTimeMillis() + ms;
        while (System.currentTimeMillis() < end) {
            JsonObject o = events.poll(200, TimeUnit.MILLISECONDS);
            if (o == null) continue;
            if ("error".equals(o.get("type").getAsString()) && o.get("id").getAsInt() == id) throw new RuntimeException(o.get("message").getAsString());
            if (type.equals(o.get("type").getAsString()) && o.has("id") && o.get("id").getAsInt() == id) return o;
        }
        throw new RuntimeException("timeout waiting for " + type);
    }

    public static void main(String[] a) throws Exception {
        final File fixture = new File(a[0]);
        HttpServer srv = HttpServer.create(new InetSocketAddress(0), 0);
        srv.createContext("/", ex -> {
            String p = ex.getRequestURI().getPath();
            File f = new File(fixture, p.substring(p.indexOf("/resolve/main/") + 14));
            if (!f.exists()) { ex.sendResponseHeaders(404, -1); ex.close(); return; }
            ex.sendResponseHeaders(200, f.length()); Files.copy(f.toPath(), ex.getResponseBody()); ex.close();
        });
        srv.start();
        final int[] progress = {0};
        NativeLlm llm = new NativeLlm(Files.createTempDirectory("gguf").toFile(), "http://localhost:" + srv.getAddress().getPort(), new NativeLlm.Sink() {
            public void event(String json) { JsonObject o = JsonParser.parseString(json).getAsJsonObject(); if ("progress".equals(o.get("type").getAsString())) progress[0]++; events.add(o); }
            public void inflight(boolean on) { }
        });
        String repo = "test/" + fixture.getName();
        JsonObject load = new JsonObject();
        load.addProperty("type", "load"); load.addProperty("id", 1); load.addProperty("repo", repo); load.addProperty("gguf", a[1]); load.addProperty("threads", Integer.parseInt(System.getProperty("threads", "4")));
        long t0 = System.currentTimeMillis();
        llm.handle(load.toString());
        JsonObject loaded = waitFor("loaded", 1, 300000);
        long loadMs = System.currentTimeMillis() - t0;
        JsonArray msgs = JsonParser.parseString("[{\"role\":\"system\",\"content\":\"You are a tutor.\"},{\"role\":\"user\",\"content\":\"Explain what a project is, in a few words: temporary, unique, budget. Ünïcödé ✓\"}]").getAsJsonArray();
        JsonArray promptIds = new JsonArray();
        for (int i : LlamaJni.tokenize(llm.gguf, NativeLlm.applyTemplate(llm.template, msgs).getBytes("UTF-8"))) promptIds.add(i);
        JsonObject g = new JsonObject();
        g.addProperty("type", "generate"); g.addProperty("id", 2); g.addProperty("max", 48); g.addProperty("temp", 0); g.add("msgs", msgs);
        llm.handle(g.toString());
        JsonObject done = waitFor("done", 2, 300000);
        // emoji / multi-byte streaming
        JsonArray m2 = JsonParser.parseString("[{\"role\":\"user\",\"content\":\"Repeat exactly this text and nothing else: café 中文 😀 ✓\"}]").getAsJsonArray();
        JsonObject g3 = new JsonObject(); g3.addProperty("type", "generate"); g3.addProperty("id", 3); g3.addProperty("max", 40); g3.addProperty("temp", 0); g3.add("msgs", m2);
        llm.handle(g3.toString());
        JsonObject emoji = waitFor("done", 3, 300000);
        // cancel
        JsonObject g2 = g.deepCopy(); g2.addProperty("id", 4); g2.addProperty("max", 400);
        llm.handle(g2.toString()); Thread.sleep(400); llm.handle("{\"type\":\"interrupt\"}");
        JsonObject cancelled = waitFor("done", 4, 120000);
        String storage = llm.storageJson();
        JsonObject out = new JsonObject();
        out.add("promptIds", promptIds); out.addProperty("text", done.get("text").getAsString()); out.addProperty("tps", done.get("tps").getAsDouble());
        out.addProperty("prefillMs", done.get("prefillMs").getAsDouble()); out.addProperty("promptTokens", done.get("promptTokens").getAsInt());
        out.addProperty("emoji", emoji.get("text").getAsString()); out.addProperty("cancelledFlag", cancelled.get("cancelled").getAsBoolean());
        out.addProperty("cancelledChars", cancelled.get("text").getAsString().length()); out.addProperty("loadMs", loadMs); out.addProperty("progress", progress[0] > 0);
        out.addProperty("storage", storage); out.addProperty("sys", LlamaJni.systemInfo());
        long freed = llm.purge(repo);
        out.addProperty("purged", freed); out.addProperty("afterPurge", llm.storageJson());
        System.out.println(out);
        llm.close(); srv.stop(0); System.exit(0);
    }
}

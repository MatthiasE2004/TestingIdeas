package nl.learn.courses;

import com.google.gson.*;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

/** Desktop-JVM test of NativeLlm (same class that ships in the APK). Usage: NativeLlmTest <fixtureDir> <stringsJson> <maxTokens> */
public class NativeLlmTest {
    static BlockingQueue<JsonObject> events = new LinkedBlockingQueue<JsonObject>();
    static JsonObject waitFor(String type, int id, long ms) throws Exception {
        long end = System.currentTimeMillis() + ms;
        while (System.currentTimeMillis() < end) {
            JsonObject o = events.poll(200, TimeUnit.MILLISECONDS);
            if (o == null) continue;
            if (type.equals(o.get("type").getAsString()) && (!o.has("id") || o.get("id").getAsInt() == id)) return o;
            if ("error".equals(o.get("type").getAsString())) throw new RuntimeException(o.get("message").getAsString());
        }
        throw new RuntimeException("timeout waiting for " + type);
    }

    public static void main(String[] a) throws Exception {
        final File fixture = new File(a[0]);
        HttpServer srv = HttpServer.create(new InetSocketAddress(0), 0);
        srv.createContext("/", ex -> {
            String p = ex.getRequestURI().getPath();                    // /test/<name>/resolve/main/<file>
            String rel = p.substring(p.indexOf("/resolve/main/") + 14);
            File f = new File(fixture, rel);
            if (!f.exists()) { ex.sendResponseHeaders(404, -1); ex.close(); return; }
            ex.sendResponseHeaders(200, f.length()); Files.copy(f.toPath(), ex.getResponseBody()); ex.close();
        });
        srv.start();
        File root = Files.createTempDirectory("nativellm").toFile();
        final int[] progressEvents = {0};
        NativeLlm llm = new NativeLlm(root, "http://localhost:" + srv.getAddress().getPort(), new NativeLlm.Sink() {
            public void event(String json) { JsonObject o = JsonParser.parseString(json).getAsJsonObject(); if ("progress".equals(o.get("type").getAsString())) progressEvents[0]++; events.add(o); }
            public void inflight(boolean on) { }
        });
        JsonObject load = new JsonObject();
        load.addProperty("type", "load"); load.addProperty("id", 1); load.addProperty("repo", "test/" + fixture.getName()); load.addProperty("dtype", "q4"); load.addProperty("threads", Integer.parseInt(System.getProperty("threads", "2")));
        llm.handle(load.toString());
        waitFor("loaded", 1, 120000);
        JsonArray strings = JsonParser.parseString(new String(Files.readAllBytes(Paths.get(a[1])), "UTF-8")).getAsJsonArray();
        JsonArray enc = new JsonArray();
        for (JsonElement s : strings) { JsonArray ids = new JsonArray(); for (int i : llm.tok.encode(s.getAsString())) ids.add(i); enc.add(ids); }
        JsonArray msgs = JsonParser.parseString("[{\"role\":\"system\",\"content\":\"You are a tutor.\"},{\"role\":\"user\",\"content\":\"Explain what a project is, in a few words: temporary, unique, budget. Ünïcödé ✓\"}]").getAsJsonArray();
        JsonArray prompt = new JsonArray();
        for (int i : llm.tok.encode(NativeLlm.applyTemplate(llm.template, msgs))) prompt.add(i);
        JsonObject g = new JsonObject();
        g.addProperty("type", "generate"); g.addProperty("id", 2); g.addProperty("max", Integer.parseInt(a[2])); g.addProperty("temp", 0); g.add("msgs", msgs);
        llm.handle(g.toString());
        JsonObject done = waitFor("done", 2, 120000);
        // cancel test: start a long generation and interrupt
        JsonObject g2 = g.deepCopy(); g2.addProperty("id", 3); g2.addProperty("max", 100000 > 0 ? 400 : 0);
        llm.handle(g2.toString()); Thread.sleep(150); llm.handle("{\"type\":\"interrupt\"}");
        JsonObject cancelled = waitFor("done", 3, 60000);
        String storage = llm.storageJson();
        long freed = llm.purge("test/" + fixture.getName());
        JsonObject out = new JsonObject();
        out.add("enc", enc); out.add("prompt", prompt); out.addProperty("text", done.get("text").getAsString()); out.addProperty("tps", done.get("tps").getAsDouble());
        out.addProperty("cancelledFlag", cancelled.get("cancelled").getAsBoolean()); out.addProperty("progressEvents", progressEvents[0] > 0);
        out.addProperty("storage", storage); out.addProperty("purgedBytes", freed); out.addProperty("afterPurge", llm.storageJson());
        System.out.println(out);
        llm.close(); srv.stop(0); System.exit(0);
    }
}

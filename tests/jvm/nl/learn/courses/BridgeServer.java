package nl.learn.courses;

import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

/** Test double for MainActivity's Android bridge: exposes the REAL NativeLlm over HTTP so the real app JS can drive it in a desktop browser.
 *  Also serves the fixture models as a fake Hugging Face hub at /hub/<owner>/<name>/resolve/main/<file>. Usage: BridgeServer <outDir> <port> */
public class BridgeServer {
    static final BlockingQueue<String> events = new LinkedBlockingQueue<String>();

    public static void main(String[] a) throws Exception {
        final File out = new File(a[0]);
        int port = Integer.parseInt(a[1]);
        HttpServer srv = HttpServer.create(new InetSocketAddress(port), 0);
        srv.setExecutor(Executors.newCachedThreadPool());
        final NativeLlm llm = new NativeLlm(Files.createTempDirectory("bridge").toFile(), "http://localhost:" + port + "/hub", new NativeLlm.Sink() {
            public void event(String json) { events.add(json); }
            public void inflight(boolean on) { }
        });
        srv.createContext("/", new HttpHandler() {
            public void handle(HttpExchange ex) throws IOException {
                ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                String path = ex.getRequestURI().getPath(), q = ex.getRequestURI().getQuery() == null ? "" : ex.getRequestURI().getQuery();
                String repo = q.startsWith("repo=") ? URLDecoder.decode(q.substring(5), "UTF-8") : "";
                byte[] body;
                try {
                    if (path.startsWith("/hub/")) {
                        String rel = path.substring(path.indexOf("/resolve/main/") + 14);
                        String name = path.split("/")[3];
                        File f = new File(new File(out, name), rel);
                        if (!f.exists()) { ex.sendResponseHeaders(404, -1); ex.close(); return; }
                        body = Files.readAllBytes(f.toPath());
                    } else if (path.equals("/post")) { llm.handle(new String(ex.getRequestBody().readAllBytes(), "UTF-8")); body = "ok".getBytes(); }
                    else if (path.equals("/storage")) body = llm.storageJson().getBytes("UTF-8");
                    else if (path.equals("/complete")) body = String.valueOf(llm.isComplete(repo)).getBytes();
                    else if (path.equals("/purge")) body = String.valueOf(llm.purge(repo)).getBytes();
                    else if (path.equals("/purgeall")) { llm.purgeAll(); body = "ok".getBytes(); }
                    else if (path.equals("/events")) {
                        List<String> got = new ArrayList<String>();
                        String first = events.poll(20, TimeUnit.SECONDS);
                        if (first != null) { got.add(first); events.drainTo(got); }
                        body = ("[" + String.join(",", got) + "]").getBytes("UTF-8");
                    } else { ex.sendResponseHeaders(404, -1); ex.close(); return; }
                } catch (Exception e) { body = String.valueOf(e).getBytes(); }
                ex.sendResponseHeaders(200, body.length);
                ex.getResponseBody().write(body);
                ex.close();
            }
        });
        srv.start();
        System.out.println("bridge ready " + port);
    }
}

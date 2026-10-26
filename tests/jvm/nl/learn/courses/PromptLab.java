package nl.learn.courses;

import com.google.gson.*;
import java.nio.file.*;

/** Runs prompts from a JSON file ([{system,user}...]) against a local GGUF and prints the replies. Usage: PromptLab <gguf> <prompts.json> */
public class PromptLab {
    public static void main(String[] a) throws Exception {
        if (!LlamaJni.init()) throw new RuntimeException("jni");
        long h = LlamaJni.load(a[0], Integer.getInteger("threads", 4), 2048);
        JsonArray arr = JsonParser.parseString(new String(Files.readAllBytes(Paths.get(a[1])), "UTF-8")).getAsJsonArray();
        for (JsonElement e : arr) {
            JsonObject o = e.getAsJsonObject();
            JsonArray msgs = new JsonArray();
            JsonObject s = new JsonObject(); s.addProperty("role", "system"); s.addProperty("content", o.get("system").getAsString()); msgs.add(s);
            JsonObject u = new JsonObject(); u.addProperty("role", "user"); u.addProperty("content", o.get("user").getAsString()); msgs.add(u);
            final java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
            long t0 = System.currentTimeMillis();
            LlamaJni.generate(h, NativeLlm.applyTemplate("chatml-nothink", msgs).getBytes("UTF-8"), 110, 0f, 1.08f, new LlamaJni.Callback() { public void onBytes(byte[] b) { bo.write(b, 0, b.length); } });
            System.out.println("### " + o.get("name").getAsString() + " (" + (System.currentTimeMillis() - t0) + " ms)\n" + new String(bo.toByteArray(), "UTF-8") + "\n");
        }
        System.exit(0);
    }
}

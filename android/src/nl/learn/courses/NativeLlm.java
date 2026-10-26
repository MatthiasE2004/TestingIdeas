package nl.learn.courses;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OnnxValue;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.FloatBuffer;
import java.nio.LongBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Native on-device LLM: runs Hugging Face "transformers.js style" ONNX decoder models (KV-cache inputs, fp32 activations, e.g. onnx/model_q4.onnx)
 * with ONNX Runtime's native CPU kernels. Speaks the same message protocol as js/llm-worker.js so the JS side is engine-agnostic.
 * No Android classes are used here so the whole class can be unit-tested on a desktop JVM.
 */
public class NativeLlm {
    public interface Sink {
        /** JSON object string, delivered to JS as an event */
        void event(String json);
        /** true right before native code that could take the process down, false after it returned */
        void inflight(boolean on);
    }

    static final String[] REQUIRED = {"config.json", "tokenizer.json", "onnx/model_%s.onnx"};
    static final String[] OPTIONAL = {"generation_config.json", "tokenizer_config.json", "onnx/model_%s.onnx_data"};

    final File root;
    final Sink sink;
    final String hub;
    final ExecutorService exec = Executors.newSingleThreadExecutor(new java.util.concurrent.ThreadFactory() {
        public Thread newThread(Runnable r) { return new Thread(null, r, "native-llm", 16L * 1024 * 1024); }
    });
    volatile boolean cancel;
    OrtEnvironment env;
    OrtSession session;
    BpeTokenizer tok;
    String template = "chatml";
    int layers, kvHeads, headDim;
    final Set<Integer> eos = new HashSet<Integer>();
    String loadedRepo;
    volatile long gguf;   // llama.cpp handle when a GGUF model is loaded
    List<String> pastNames = new ArrayList<String>();
    boolean hasPos, hasMask;

    public NativeLlm(File root, String hubBase, Sink sink) {
        this.root = root;
        this.hub = hubBase;
        this.sink = sink;
        root.mkdirs();
    }

    /* ------------------------------------------------------------ protocol */

    public void handle(String json) {
        final JsonObject m = JsonParser.parseString(json).getAsJsonObject();
        String type = m.get("type").getAsString();
        if ("interrupt".equals(type)) { cancel = true; long g = gguf; if (g != 0) LlamaJni.cancel(g); return; }
        if ("unload".equals(type)) { exec.submit(new Runnable() { public void run() { closeSession(); } }); return; }
        if ("load".equals(type)) exec.submit(new Runnable() { public void run() { load(m); } });
        else if ("generate".equals(type)) exec.submit(new Runnable() { public void run() { generate(m); } });
    }

    void emit(JsonObject o) { sink.event(o.toString()); }

    void error(int id, Throwable t) {
        JsonObject o = new JsonObject();
        o.addProperty("type", "error");
        o.addProperty("id", id);
        String msg = t.getMessage() == null ? t.toString() : t.getMessage();
        o.addProperty("message", msg);
        emit(o);
    }

    /* ------------------------------------------------------------ load */

    void load(JsonObject m) {
        int id = m.get("id").getAsInt();
        if (m.has("gguf") && !m.get("gguf").isJsonNull()) { loadGguf(id, m); return; }
        try {
            String repo = m.get("repo").getAsString();
            String dtype = m.has("dtype") ? m.get("dtype").getAsString() : "q4";
            if (dtype.contains("f16")) dtype = "q4"; // fp16 KV caches are not supported natively; the fp32-activation q4 file is
            int threads = m.has("threads") ? m.get("threads").getAsInt() : 4;
            closeSession();
            File dir = new File(root, repo);
            ensureDownloaded(repo, dir, dtype);
            readConfig(dir);
            tok = BpeTokenizer.load(new File(dir, "tokenizer.json"));
            readEos(dir);
            if (m.has("template")) template = m.get("template").getAsString();
            else template = detectTemplate(dir);
            File model = new File(dir, "onnx/model_" + dtype + ".onnx");
            sink.inflight(true);
            try {
                env = OrtEnvironment.getEnvironment();
                OrtSession.SessionOptions opts = new OrtSession.SessionOptions();
                opts.setIntraOpNumThreads(threads);
                opts.setInterOpNumThreads(1);
                opts.setMemoryPatternOptimization(false);
                session = env.createSession(model.getAbsolutePath(), opts);
            } finally { sink.inflight(false); }
            inspect();
            loadedRepo = repo;
            JsonObject o = new JsonObject();
            o.addProperty("type", "loaded");
            o.addProperty("id", id);
            o.addProperty("device", "native");
            o.addProperty("threads", threads);
            o.addProperty("isolated", true);
            emit(o);
        } catch (Throwable t) {
            closeSession();
            error(id, t);
        }
    }

    void closeSession() {
        if (gguf != 0) { long g = gguf; gguf = 0; try { LlamaJni.free(g); } catch (Throwable ignored) { } }
        try { if (session != null) session.close(); } catch (Throwable ignored) { }
        session = null;
        loadedRepo = null;
    }

    void readConfig(File dir) throws IOException {
        JsonObject c = readJson(new File(dir, "config.json"));
        int heads = c.has("num_attention_heads") ? c.get("num_attention_heads").getAsInt() : 0;
        layers = c.get("num_hidden_layers").getAsInt();
        kvHeads = c.has("num_key_value_heads") ? c.get("num_key_value_heads").getAsInt() : heads;
        if (c.has("head_dim") && !c.get("head_dim").isJsonNull()) headDim = c.get("head_dim").getAsInt();
        else headDim = c.get("hidden_size").getAsInt() / heads;
    }

    void readEos(File dir) throws IOException {
        eos.clear();
        File g = new File(dir, "generation_config.json");
        if (g.exists()) {
            JsonObject o = readJson(g);
            if (o.has("eos_token_id") && !o.get("eos_token_id").isJsonNull()) {
                JsonElement e = o.get("eos_token_id");
                if (e.isJsonArray()) for (JsonElement x : e.getAsJsonArray()) eos.add(x.getAsInt()); else eos.add(e.getAsInt());
            }
        }
        File c = new File(dir, "config.json");
        JsonObject o = readJson(c);
        if (o.has("eos_token_id") && !o.get("eos_token_id").isJsonNull()) {
            JsonElement e = o.get("eos_token_id");
            if (e.isJsonArray()) for (JsonElement x : e.getAsJsonArray()) eos.add(x.getAsInt()); else eos.add(e.getAsInt());
        }
        for (String t : new String[]{"<|im_end|>", "<|endoftext|>", "<|eot_id|>"}) { int i = tok.tokenId(t); if (i >= 0) eos.add(i); }
    }

    String detectTemplate(File dir) throws IOException {
        File f = new File(dir, "tokenizer_config.json");
        if (f.exists()) {
            JsonObject o = readJson(f);
            if (o.has("chat_template") && o.get("chat_template").isJsonPrimitive()) {
                String t = o.get("chat_template").getAsString();
                if (t.contains("<|start_header_id|>")) return "llama3";
                if (t.contains("<|im_start|>")) return t.contains("<think>") ? "chatml-nothink" : "chatml";
            }
        }
        return tok.tokenId("<|im_start|>") >= 0 ? "chatml" : "llama3";
    }

    void inspect() throws Exception {
        pastNames.clear();
        hasPos = false; hasMask = false;
        for (String n : session.getInputNames()) {
            if (n.startsWith("past_key_values")) pastNames.add(n);
            else if (n.equals("position_ids")) hasPos = true;
            else if (n.equals("attention_mask")) hasMask = true;
        }
        if (pastNames.isEmpty()) throw new Exception("This model has no KV-cache inputs, so it cannot be run natively");
        Map<String, ai.onnxruntime.NodeInfo> in = session.getInputInfo();
        ai.onnxruntime.NodeInfo ni = in.get(pastNames.get(0));
        if (ni.getInfo() instanceof ai.onnxruntime.TensorInfo) {
            ai.onnxruntime.TensorInfo ti = (ai.onnxruntime.TensorInfo) ni.getInfo();
            if (ti.type != ai.onnxruntime.OnnxJavaType.FLOAT) throw new Exception("Model uses " + ti.type + " KV cache; only fp32 is supported natively");
            long[] s = ti.getShape();
            if (s.length == 4) { if (s[1] > 0) kvHeads = (int) s[1]; if (s[3] > 0) headDim = (int) s[3]; }
        }
    }

    static JsonObject readJson(File f) throws IOException {
        InputStreamReader r = new InputStreamReader(new FileInputStream(f), StandardCharsets.UTF_8);
        try { return JsonParser.parseReader(r).getAsJsonObject(); } finally { r.close(); }
    }


    /* ------------------------------------------------------------ GGUF via llama.cpp */

    void loadGguf(int id, JsonObject m) {
        try {
            String repo = m.get("repo").getAsString();
            String file = m.get("gguf").getAsString();
            int threads = m.has("threads") ? m.get("threads").getAsInt() : 4;
            closeSession();
            File dir = new File(root, repo);
            File f = new File(dir, file);
            if (!f.exists() || f.length() == 0) { dir.mkdirs(); lastProgress = 0; download(repo, file, f, false); }
            new File(dir, ".complete-" + file).createNewFile();
            if (!LlamaJni.init()) throw new Exception("Unsupported: the llama.cpp native library is not available on this device");
            template = m.has("template") && !m.get("template").isJsonNull() ? m.get("template").getAsString() : (file.toLowerCase().contains("qwen3") ? "chatml-nothink" : "chatml");
            long h;
            sink.inflight(true);
            try { h = LlamaJni.load(f.getAbsolutePath(), threads, 2048); } finally { sink.inflight(false); }
            if (h == 0) throw new Exception("Unsupported or damaged model file: " + LlamaJni.lastError());
            gguf = h;
            loadedRepo = repo;
            JsonObject o = new JsonObject();
            o.addProperty("type", "loaded");
            o.addProperty("id", id);
            o.addProperty("device", "llama");
            o.addProperty("threads", threads);
            o.addProperty("isolated", true);
            emit(o);
        } catch (Throwable t) {
            closeSession();
            error(id, t);
        }
    }

    void generateGguf(final int id, JsonObject m) {
        try {
            int max = m.has("max") ? m.get("max").getAsInt() : 128;
            float temp = m.has("temp") ? (float) m.get("temp").getAsDouble() : 0f;
            float rep = m.has("rep") ? (float) m.get("rep").getAsDouble() : 1.08f;
            String prompt = applyTemplate(template, m.getAsJsonArray("msgs"));
            final ByteArrayOutputStream all = new ByteArrayOutputStream();
            long g = gguf;
            sink.inflight(true);
            int n;
            try {
                n = LlamaJni.generate(g, prompt.getBytes(StandardCharsets.UTF_8), max, temp, rep, new LlamaJni.Callback() {
                    public void onBytes(byte[] b) {
                        all.write(b, 0, b.length);
                        JsonObject o = new JsonObject();
                        o.addProperty("type", "token");
                        o.addProperty("id", id);
                        o.addProperty("text", new String(all.toByteArray(), StandardCharsets.UTF_8));
                        emit(o);
                    }
                });
            } finally { sink.inflight(false); }
            if (n < 0) throw new Exception(LlamaJni.lastError());
            double[] st = LlamaJni.stats();
            JsonObject o = new JsonObject();
            o.addProperty("type", "done");
            o.addProperty("id", id);
            o.addProperty("text", new String(all.toByteArray(), StandardCharsets.UTF_8));
            o.addProperty("tps", st[0]);
            o.addProperty("prefillMs", st[1]);
            o.addProperty("promptTokens", (int) st[2]);
            o.addProperty("cancelled", cancel);
            emit(o);
        } catch (Throwable t) {
            error(id, t);
        }
    }

    /* ------------------------------------------------------------ download */

    void ensureDownloaded(String repo, File dir, String dtype) throws IOException {
        if (new File(dir, ".complete").exists() && new File(dir, "onnx/model_" + dtype + ".onnx").exists()) return;
        dir.mkdirs();
        List<String> files = new ArrayList<String>();
        List<Boolean> optional = new ArrayList<Boolean>();
        for (String r : OPTIONAL) { if (!r.contains("_data")) { files.add(String.format(r, dtype)); optional.add(true); } }
        for (String r : REQUIRED) { files.add(String.format(r, dtype)); optional.add(false); }
        files.add(String.format(OPTIONAL[2], dtype)); optional.add(true);
        for (int i = 0; i < files.size(); i++) download(repo, files.get(i), new File(dir, files.get(i)), optional.get(i));
        new File(dir, ".complete").createNewFile();
    }

    long lastProgress;

    void download(String repo, String path, File dest, boolean optional) throws IOException {
        if (dest.exists() && dest.length() > 0) return;
        dest.getParentFile().mkdirs();
        HttpURLConnection c = (HttpURLConnection) new URL(hub + "/" + repo + "/resolve/main/" + path).openConnection();
        c.setConnectTimeout(20000);
        c.setReadTimeout(60000);
        c.setInstanceFollowRedirects(true);
        c.setRequestProperty("User-Agent", "LearnCourses/1.0");
        int code = c.getResponseCode();
        if (code == 404 && optional) { c.disconnect(); return; }
        if (code != 200) { c.disconnect(); throw new IOException("Download failed: HTTP " + code + " for " + repo + "/" + path); }
        long total = c.getContentLengthLong();
        File part = new File(dest.getPath() + ".part");
        InputStream in = c.getInputStream();
        OutputStream out = new FileOutputStream(part);
        try {
            byte[] buf = new byte[1 << 16];
            long done = 0;
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n);
                done += n;
                long now = System.currentTimeMillis();
                if (now - lastProgress > 300 && total > 0) { lastProgress = now; progress(path, done, total); }
            }
            if (total > 0 && done != total) throw new IOException("Download incomplete for " + path + " (" + done + " of " + total + " bytes)");
            if (total > 0) progress(path, done, total);
        } finally { out.close(); in.close(); c.disconnect(); }
        if (!part.renameTo(dest)) throw new IOException("Could not save " + path);
    }

    void progress(String file, long loaded, long total) {
        JsonObject p = new JsonObject();
        p.addProperty("status", "progress");
        p.addProperty("file", file);
        p.addProperty("loaded", loaded);
        p.addProperty("total", total);
        JsonObject o = new JsonObject();
        o.addProperty("type", "progress");
        o.add("p", p);
        emit(o);
    }

    /* ------------------------------------------------------------ storage */

    public String storageJson() {
        JsonArray arr = new JsonArray();
        File[] owners = root.listFiles();
        if (owners != null) for (File o : owners) {
            File[] names = o.listFiles();
            if (names != null) for (File n : names) {
                if (!n.isDirectory()) continue;
                long[] acc = new long[2];
                size(n, acc);
                JsonObject e = new JsonObject();
                e.addProperty("repo", o.getName() + "/" + n.getName());
                e.addProperty("bytes", acc[0]);
                e.addProperty("files", acc[1]);
                e.addProperty("complete", isComplete(o.getName() + "/" + n.getName()));
                arr.add(e);
            }
        }
        return arr.toString();
    }

    static void size(File f, long[] acc) {
        if (f.isFile()) { acc[0] += f.length(); acc[1]++; return; }
        File[] k = f.listFiles();
        if (k != null) for (File x : k) size(x, acc);
    }

    public boolean isComplete(String repo) {
        String[] names = new File(root, repo).list();
        if (names != null) for (String n : names) if (n.startsWith(".complete")) return true;
        return false;
    }

    public long purge(String repo) {
        if (repo.equals(loadedRepo)) closeSession();
        File dir = new File(root, repo);
        long[] acc = new long[2];
        size(dir, acc);
        deleteTree(dir);
        File parent = dir.getParentFile();
        if (parent != null && parent.list() != null && parent.list().length == 0) parent.delete();
        return acc[0];
    }

    static void deleteTree(File f) {
        File[] k = f.listFiles();
        if (k != null) for (File x : k) deleteTree(x);
        f.delete();
    }

    public void purgeAll() {
        closeSession();
        File[] k = root.listFiles();
        if (k != null) for (File x : k) deleteTree(x);
    }

    /* ------------------------------------------------------------ chat templates */

    static String applyTemplate(String template, JsonArray msgs) {
        StringBuilder sb = new StringBuilder();
        if ("llama3".equals(template)) {
            sb.append("<|begin_of_text|>");
            for (JsonElement e : msgs) {
                JsonObject m = e.getAsJsonObject();
                sb.append("<|start_header_id|>").append(m.get("role").getAsString()).append("<|end_header_id|>\n\n").append(m.get("content").getAsString().trim()).append("<|eot_id|>");
            }
            sb.append("<|start_header_id|>assistant<|end_header_id|>\n\n");
            return sb.toString();
        }
        for (JsonElement e : msgs) {
            JsonObject m = e.getAsJsonObject();
            sb.append("<|im_start|>").append(m.get("role").getAsString()).append('\n').append(m.get("content").getAsString()).append("<|im_end|>\n");
        }
        sb.append("<|im_start|>assistant\n");
        if ("chatml-nothink".equals(template)) sb.append("<think>\n\n</think>\n\n");
        return sb.toString();
    }

    /* ------------------------------------------------------------ generation */

    void generate(JsonObject m) {
        int id = m.get("id").getAsInt();
        cancel = false;
        if (gguf != 0) { generateGguf(id, m); return; }
        OrtSession.Result prev = null;
        try {
            if (session == null) throw new Exception("no-model");
            int max = m.has("max") ? m.get("max").getAsInt() : 128;
            double temp = m.has("temp") ? m.get("temp").getAsDouble() : 0;
            double rep = m.has("rep") ? m.get("rep").getAsDouble() : 1.08;
            String prompt = applyTemplate(template, m.getAsJsonArray("msgs"));
            int[] promptIds = tok.encode(prompt);
            List<Integer> all = new ArrayList<Integer>();
            for (int p : promptIds) all.add(p);
            Random rnd = new Random(1234);
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            String sent = "";
            long past = 0;
            int[] feed = promptIds;
            int generated = 0;
            long t0 = System.nanoTime();
            List<OnnxTensor> initial = new ArrayList<OnnxTensor>();
            sink.inflight(true);
            try {
                for (int step = 0; step < max && !cancel; step++) {
                    Map<String, OnnxTensor> in = new HashMap<String, OnnxTensor>();
                    long[] ids = new long[feed.length];
                    for (int i = 0; i < ids.length; i++) ids[i] = feed[i];
                    in.put("input_ids", OnnxTensor.createTensor(env, LongBuffer.wrap(ids), new long[]{1, ids.length}));
                    long total = past + ids.length;
                    if (hasMask) {
                        long[] mask = new long[(int) total];
                        java.util.Arrays.fill(mask, 1L);
                        in.put("attention_mask", OnnxTensor.createTensor(env, LongBuffer.wrap(mask), new long[]{1, total}));
                    }
                    if (hasPos) {
                        long[] pos = new long[ids.length];
                        for (int i = 0; i < pos.length; i++) pos[i] = past + i;
                        in.put("position_ids", OnnxTensor.createTensor(env, LongBuffer.wrap(pos), new long[]{1, pos.length}));
                    }
                    for (String pn : pastNames) {
                        OnnxTensor t;
                        if (prev == null) {
                            t = OnnxTensor.createTensor(env, FloatBuffer.allocate(0), new long[]{1, kvHeads, 0, headDim});
                            initial.add(t);
                        } else {
                            t = (OnnxTensor) prev.get(presentName(pn)).get();
                        }
                        in.put(pn, t);
                    }
                    OrtSession.Result res = session.run(in);
                    closeInputs(in, prev);
                    for (OnnxTensor t : initial) t.close();
                    initial.clear();
                    if (prev != null) prev.close();
                    prev = res;
                    OnnxTensor logits = (OnnxTensor) res.get("logits").get();
                    long[] shape = logits.getInfo().getShape();
                    int vocab = (int) shape[2];
                    int rows = (int) shape[1];
                    float[] row = new float[vocab];
                    FloatBuffer fb = logits.getFloatBuffer();
                    fb.position((rows - 1) * vocab);
                    fb.get(row);
                    if (rep != 1.0) {
                        Set<Integer> seen = new HashSet<Integer>(all);
                        for (int t : seen) if (t >= 0 && t < vocab) row[t] = row[t] > 0 ? (float) (row[t] / rep) : (float) (row[t] * rep);
                    }
                    int next = temp > 0 ? sample(row, temp, 40, rnd) : argmax(row);
                    past = total;
                    if (eos.contains(next)) break;
                    all.add(next);
                    generated++;
                    feed = new int[]{next};
                    byte[] tb = tok.tokenBytes(next);
                    bytes.write(tb, 0, tb.length);
                    String text = new String(bytes.toByteArray(), StandardCharsets.UTF_8);
                    if (!text.endsWith("�") && text.length() > sent.length()) {
                        sent = text;
                        JsonObject o = new JsonObject();
                        o.addProperty("type", "token");
                        o.addProperty("id", id);
                        o.addProperty("text", text);
                        emit(o);
                    }
                }
            } finally { sink.inflight(false); for (OnnxTensor t : initial) t.close(); }
            String text = new String(bytes.toByteArray(), StandardCharsets.UTF_8);
            JsonObject o = new JsonObject();
            o.addProperty("type", "done");
            o.addProperty("id", id);
            o.addProperty("text", text);
            o.addProperty("tps", generated / Math.max(0.001, (System.nanoTime() - t0) / 1e9));
            o.addProperty("cancelled", cancel);
            emit(o);
        } catch (Throwable t) {
            error(id, t);
        } finally {
            if (prev != null) prev.close();
        }
    }

    /** closes the tensors we allocated (ids/mask/pos); past tensors belong to the previous result and are closed with it */
    void closeInputs(Map<String, OnnxTensor> in, OrtSession.Result prev) {
        for (Map.Entry<String, OnnxTensor> e : in.entrySet()) if (!e.getKey().startsWith("past_key_values")) e.getValue().close();
    }

    String presentName(String past) {
        String p = past.replace("past_key_values", "present");
        try { if (session.getOutputNames().contains(p)) return p; } catch (Exception ignored) { }
        return past.replace("past_key_values", "present_key_values");
    }

    static int argmax(float[] a) {
        int b = 0;
        for (int i = 1; i < a.length; i++) if (a[i] > a[b]) b = i;
        return b;
    }

    static int sample(float[] logits, double temp, int topK, Random rnd) {
        int k = Math.min(topK, logits.length);
        int[] idx = new int[k];
        float[] val = new float[k];
        java.util.Arrays.fill(val, Float.NEGATIVE_INFINITY);
        for (int i = 0; i < logits.length; i++) {
            if (logits[i] <= val[k - 1]) continue;
            int j = k - 1;
            while (j > 0 && val[j - 1] < logits[i]) { val[j] = val[j - 1]; idx[j] = idx[j - 1]; j--; }
            val[j] = logits[i];
            idx[j] = i;
        }
        double sum = 0;
        double[] p = new double[k];
        for (int i = 0; i < k; i++) { p[i] = Math.exp((val[i] - val[0]) / temp); sum += p[i]; }
        double r = rnd.nextDouble() * sum;
        for (int i = 0; i < k; i++) { r -= p[i]; if (r <= 0) return idx[i]; }
        return idx[0];
    }

    public void close() { closeSession(); exec.shutdownNow(); }
}

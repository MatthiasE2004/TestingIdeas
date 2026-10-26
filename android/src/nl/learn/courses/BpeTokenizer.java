package nl.learn.courses;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Byte-level BPE tokenizer read from a Hugging Face tokenizer.json (Qwen2/2.5/3, Llama-3, SmolLM, GPT-2 style). */
public class BpeTokenizer {
    static final String GPT2_REGEX = "'s|'t|'re|'ve|'m|'ll|'d| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+";

    final HashMap<String, Integer> vocab = new HashMap<String, Integer>();
    final HashMap<String, Integer> ranks = new HashMap<String, Integer>();
    String[] idToTok = new String[0];
    final HashMap<String, Integer> specialMap = new HashMap<String, Integer>();
    final Set<Integer> specialIds = new HashSet<Integer>();
    final List<Pattern> splits = new ArrayList<Pattern>();
    Pattern specialPattern;
    boolean byteLevel, nfc, ignoreMerges;
    final HashMap<String, int[]> cache = new HashMap<String, int[]>();
    static final char[] B2U = new char[256];
    static final int[] U2B = new int[0x200];

    static {
        List<Integer> bs = new ArrayList<Integer>();
        for (int i = '!'; i <= '~'; i++) bs.add(i);
        for (int i = 0xA1; i <= 0xAC; i++) bs.add(i);
        for (int i = 0xAE; i <= 0xFF; i++) bs.add(i);
        boolean[] in = new boolean[256];
        for (int b : bs) { B2U[b] = (char) b; in[b] = true; }
        int n = 0;
        for (int b = 0; b < 256; b++) if (!in[b]) { B2U[b] = (char) (256 + n); n++; }
        java.util.Arrays.fill(U2B, -1);
        for (int b = 0; b < 256; b++) U2B[B2U[b]] = b;
    }

    public static BpeTokenizer load(File f) throws Exception {
        BpeTokenizer t = new BpeTokenizer();
        Reader r = new InputStreamReader(new FileInputStream(f), StandardCharsets.UTF_8);
        JsonObject root;
        try { root = JsonParser.parseReader(r).getAsJsonObject(); } finally { r.close(); }
        JsonObject model = root.getAsJsonObject("model");
        String type = model.has("type") ? model.get("type").getAsString() : "BPE";
        if (!"BPE".equals(type)) throw new Exception("Unsupported tokenizer model: " + type);
        t.ignoreMerges = model.has("ignore_merges") && model.get("ignore_merges").getAsBoolean();
        int max = 0;
        for (java.util.Map.Entry<String, JsonElement> e : model.getAsJsonObject("vocab").entrySet()) {
            int id = e.getValue().getAsInt();
            t.vocab.put(e.getKey(), id);
            if (id > max) max = id;
        }
        JsonArray added = root.has("added_tokens") && !root.get("added_tokens").isJsonNull() ? root.getAsJsonArray("added_tokens") : new JsonArray();
        for (JsonElement el : added) { int id = el.getAsJsonObject().get("id").getAsInt(); if (id > max) max = id; }
        t.idToTok = new String[max + 1];
        for (java.util.Map.Entry<String, Integer> e : t.vocab.entrySet()) t.idToTok[e.getValue()] = e.getKey();
        JsonArray merges = model.getAsJsonArray("merges");
        int rank = 0;
        for (JsonElement m : merges) {
            String key = m.isJsonArray() ? m.getAsJsonArray().get(0).getAsString() + " " + m.getAsJsonArray().get(1).getAsString() : m.getAsString();
            t.ranks.put(key, rank++);
        }
        List<String> specialTexts = new ArrayList<String>();
        for (JsonElement el : added) {
            JsonObject o = el.getAsJsonObject();
            int id = o.get("id").getAsInt();
            String c = o.get("content").getAsString();
            t.idToTok[id] = c;
            t.vocab.put(c, id);
            t.specialMap.put(c, id);
            specialTexts.add(c);
            if (o.has("special") && o.get("special").getAsBoolean()) t.specialIds.add(id);
        }
        Collections.sort(specialTexts, new Comparator<String>() {
            public int compare(String a, String b) { return b.length() - a.length(); }
        });
        if (!specialTexts.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (String s : specialTexts) { if (sb.length() > 0) sb.append('|'); sb.append(Pattern.quote(s)); }
            t.specialPattern = Pattern.compile(sb.toString());
        }
        t.readNormalizer(root.get("normalizer"));
        boolean[] implicitRegex = new boolean[1];
        t.readPre(root.get("pre_tokenizer"), implicitRegex);
        if (t.splits.isEmpty() && t.byteLevel && implicitRegex[0]) t.splits.add(Pattern.compile(GPT2_REGEX));
        if (!t.byteLevel) throw new Exception("Only byte-level BPE tokenizers are supported natively");
        return t;
    }

    void readNormalizer(JsonElement n) {
        if (n == null || n.isJsonNull()) return;
        JsonObject o = n.getAsJsonObject();
        String type = o.get("type").getAsString();
        if ("NFC".equals(type)) nfc = true;
        else if ("Sequence".equals(type)) for (JsonElement e : o.getAsJsonArray("normalizers")) readNormalizer(e);
    }

    void readPre(JsonElement p, boolean[] implicitRegex) {
        if (p == null || p.isJsonNull()) return;
        JsonObject o = p.getAsJsonObject();
        String type = o.get("type").getAsString();
        if ("Sequence".equals(type)) { for (JsonElement e : o.getAsJsonArray("pretokenizers")) readPre(e, implicitRegex); }
        else if ("Split".equals(type)) {
            JsonObject pat = o.getAsJsonObject("pattern");
            if (pat.has("Regex")) splits.add(Pattern.compile(pat.get("Regex").getAsString()));
            else splits.add(Pattern.compile(Pattern.quote(pat.get("String").getAsString())));
        } else if ("ByteLevel".equals(type)) {
            byteLevel = true;
            implicitRegex[0] = !o.has("use_regex") || o.get("use_regex").getAsBoolean();
        }
    }

    public int tokenId(String content) { Integer i = vocab.get(content); return i == null ? -1 : i; }
    public int vocabSize() { return idToTok.length; }

    public int[] encode(String text) {
        List<Integer> out = new ArrayList<Integer>();
        int pos = 0;
        if (specialPattern != null) {
            Matcher m = specialPattern.matcher(text);
            while (m.find()) {
                if (m.start() > pos) ordinary(text.substring(pos, m.start()), out);
                out.add(specialMap.get(m.group()));
                pos = m.end();
            }
        }
        if (pos < text.length()) ordinary(text.substring(pos), out);
        int[] r = new int[out.size()];
        for (int i = 0; i < r.length; i++) r[i] = out.get(i);
        return r;
    }

    void ordinary(String seg, List<Integer> out) {
        if (nfc) seg = Normalizer.normalize(seg, Normalizer.Form.NFC);
        List<String> pieces = new ArrayList<String>();
        pieces.add(seg);
        for (Pattern p : splits) {
            List<String> next = new ArrayList<String>();
            for (String piece : pieces) {
                Matcher m = p.matcher(piece);
                int last = 0;
                while (m.find()) {
                    if (m.end() == m.start()) continue;
                    if (m.start() > last) next.add(piece.substring(last, m.start()));
                    next.add(m.group());
                    last = m.end();
                }
                if (last < piece.length()) next.add(piece.substring(last));
            }
            pieces = next;
        }
        for (String piece : pieces) {
            byte[] b = piece.getBytes(StandardCharsets.UTF_8);
            char[] c = new char[b.length];
            for (int i = 0; i < b.length; i++) c[i] = B2U[b[i] & 0xFF];
            String mapped = new String(c);
            int[] ids = cache.get(mapped);
            if (ids == null) { ids = bpe(mapped); if (cache.size() < 50000) cache.put(mapped, ids); }
            for (int id : ids) out.add(id);
        }
    }

    int[] bpe(String word) {
        if (ignoreMerges) { Integer whole = vocab.get(word); if (whole != null) return new int[]{whole}; }
        List<String> sym = new ArrayList<String>();
        for (int i = 0; i < word.length(); i++) sym.add(String.valueOf(word.charAt(i)));
        while (sym.size() > 1) {
            int best = Integer.MAX_VALUE; String bl = null, br = null;
            for (int i = 0; i < sym.size() - 1; i++) {
                Integer r = ranks.get(sym.get(i) + " " + sym.get(i + 1));
                if (r != null && r < best) { best = r; bl = sym.get(i); br = sym.get(i + 1); }
            }
            if (bl == null) break;
            List<String> merged = new ArrayList<String>();
            int i = 0;
            while (i < sym.size()) {
                if (i < sym.size() - 1 && sym.get(i).equals(bl) && sym.get(i + 1).equals(br)) { merged.add(bl + br); i += 2; }
                else { merged.add(sym.get(i)); i++; }
            }
            sym = merged;
        }
        int[] ids = new int[sym.size()];
        for (int i = 0; i < ids.length; i++) {
            Integer id = vocab.get(sym.get(i));
            ids[i] = id == null ? 0 : id;
        }
        return ids;
    }

    /** raw bytes a token contributes to the output text (special tokens contribute nothing) */
    public byte[] tokenBytes(int id) {
        if (id < 0 || id >= idToTok.length || idToTok[id] == null || specialIds.contains(id)) return new byte[0];
        String t = idToTok[id];
        if (specialMap.containsKey(t)) return t.getBytes(StandardCharsets.UTF_8);
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        for (int i = 0; i < t.length(); i++) {
            char c = t.charAt(i);
            int b = c < U2B.length ? U2B[c] : -1;
            if (b >= 0) o.write(b); else { byte[] u = String.valueOf(c).getBytes(StandardCharsets.UTF_8); o.write(u, 0, u.length); }
        }
        return o.toByteArray();
    }
}

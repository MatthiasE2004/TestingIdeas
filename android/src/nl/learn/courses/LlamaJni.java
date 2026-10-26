package nl.learn.courses;

/** JNI bindings to llama.cpp (android/jni/llama_jni.cpp). */
public final class LlamaJni {
    public interface Callback { void onBytes(byte[] utf8); }

    static boolean loaded;

    public static synchronized boolean init() {
        if (loaded) return true;
        try { System.loadLibrary("llama_jni"); loaded = true; } catch (Throwable t) { return false; }
        return true;
    }

    /** returns an opaque handle, or 0 (see lastError) */
    public static native long load(String path, int threads, int nCtx);
    public static native String lastError();
    public static native String systemInfo();
    /** {tokens/sec of the last run, prompt-processing ms, prompt tokens} */
    public static native double[] stats();
    public static native void cancel(long handle);
    public static native void free(long handle);
    public static native int[] tokenize(long handle, byte[] text);
    /** returns generated token count or -1 (see lastError) */
    public static native int generate(long handle, byte[] prompt, int maxTokens, float temp, float repeatPenalty, Callback cb);
}

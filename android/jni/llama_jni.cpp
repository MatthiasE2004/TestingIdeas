// Thin JNI wrapper around llama.cpp: load a GGUF, run a streaming generation loop with cancel. All text crosses JNI as UTF-8 byte[].
#include <jni.h>
#include <atomic>
#include <chrono>
#include <cstring>
#include <string>
#include <vector>
#include "llama.h"
#ifdef __ANDROID__
#include <android/log.h>
#endif

namespace {
struct Handle {
    llama_model * model = nullptr;
    llama_context * ctx = nullptr;
    const llama_vocab * vocab = nullptr;
    std::atomic<bool> cancel{false};
    int n_ctx = 0;
};
std::string g_error;
double g_tps = 0, g_prefill_ms = 0;
int g_prompt_tokens = 0;

void log_cb(enum ggml_log_level level, const char * text, void *) {
    if (level >= GGML_LOG_LEVEL_ERROR) {
        g_error = text;
#ifdef __ANDROID__
        __android_log_print(ANDROID_LOG_ERROR, "llama", "%s", text);
#endif
    }
}

// length of the longest prefix of s that does not end in the middle of a UTF-8 sequence
size_t utf8_complete_prefix(const std::string & s) {
    size_t n = s.size();
    if (n == 0) return 0;
    size_t i = n;
    int back = 0;
    while (i > 0 && back < 4 && (static_cast<unsigned char>(s[i - 1]) & 0xC0) == 0x80) { i--; back++; }
    if (i == 0) return n;
    unsigned char lead = static_cast<unsigned char>(s[i - 1]);
    int need = lead >= 0xF0 ? 4 : lead >= 0xE0 ? 3 : lead >= 0xC0 ? 2 : 1;
    if (need == 1) return n;
    return (back + 1 >= need) ? n : i - 1;
}

jbyteArray to_bytes(JNIEnv * env, const std::string & s) {
    jbyteArray a = env->NewByteArray((jsize) s.size());
    env->SetByteArrayRegion(a, 0, (jsize) s.size(), reinterpret_cast<const jbyte *>(s.data()));
    return a;
}
}  // namespace

extern "C" {

JNIEXPORT jlong JNICALL Java_nl_learn_courses_LlamaJni_load(JNIEnv * env, jclass, jstring jpath, jint threads, jint n_ctx) {
    g_error.clear();
    const char * path = env->GetStringUTFChars(jpath, nullptr);
    llama_log_set(log_cb, nullptr);
    llama_backend_init();
    llama_model_params mp = llama_model_default_params();
    mp.n_gpu_layers = 0;
    llama_model * model = llama_model_load_from_file(path, mp);
    env->ReleaseStringUTFChars(jpath, path);
    if (!model) { if (g_error.empty()) g_error = "could not load the GGUF model"; return 0; }
    llama_context_params cp = llama_context_default_params();
    cp.n_ctx = n_ctx;
    cp.n_batch = 512;
    cp.n_ubatch = 512;
    cp.n_threads = threads;
    cp.n_threads_batch = threads;
    cp.no_perf = true;
    llama_context * ctx = llama_init_from_model(model, cp);
    if (!ctx) { llama_model_free(model); if (g_error.empty()) g_error = "could not create the context"; return 0; }
    Handle * h = new Handle();
    h->model = model; h->ctx = ctx; h->vocab = llama_model_get_vocab(model); h->n_ctx = (int) llama_n_ctx(ctx);
    return reinterpret_cast<jlong>(h);
}

JNIEXPORT jstring JNICALL Java_nl_learn_courses_LlamaJni_lastError(JNIEnv * env, jclass) { return env->NewStringUTF(g_error.c_str()); }

JNIEXPORT jstring JNICALL Java_nl_learn_courses_LlamaJni_systemInfo(JNIEnv * env, jclass) { return env->NewStringUTF(llama_print_system_info()); }

JNIEXPORT jdoubleArray JNICALL Java_nl_learn_courses_LlamaJni_stats(JNIEnv * env, jclass) {
    jdoubleArray a = env->NewDoubleArray(3);
    jdouble v[3] = {g_tps, g_prefill_ms, (jdouble) g_prompt_tokens};
    env->SetDoubleArrayRegion(a, 0, 3, v);
    return a;
}

JNIEXPORT void JNICALL Java_nl_learn_courses_LlamaJni_cancel(JNIEnv *, jclass, jlong handle) { if (handle) reinterpret_cast<Handle *>(handle)->cancel = true; }

JNIEXPORT void JNICALL Java_nl_learn_courses_LlamaJni_free(JNIEnv *, jclass, jlong handle) {
    Handle * h = reinterpret_cast<Handle *>(handle);
    if (!h) return;
    llama_free(h->ctx);
    llama_model_free(h->model);
    delete h;
}

JNIEXPORT jintArray JNICALL Java_nl_learn_courses_LlamaJni_tokenize(JNIEnv * env, jclass, jlong handle, jbyteArray jtext) {
    Handle * h = reinterpret_cast<Handle *>(handle);
    jsize n = env->GetArrayLength(jtext);
    std::string text(n, '\0');
    env->GetByteArrayRegion(jtext, 0, n, reinterpret_cast<jbyte *>(&text[0]));
    std::vector<llama_token> toks(text.size() + 16);
    int c = llama_tokenize(h->vocab, text.data(), (int32_t) text.size(), toks.data(), (int32_t) toks.size(), false, true);
    if (c < 0) { toks.resize(-c); c = llama_tokenize(h->vocab, text.data(), (int32_t) text.size(), toks.data(), (int32_t) toks.size(), false, true); }
    jintArray out = env->NewIntArray(c);
    env->SetIntArrayRegion(out, 0, c, reinterpret_cast<const jint *>(toks.data()));
    return out;
}

/** returns number of generated tokens, or -1 on error (see lastError). onBytes(byte[]) is called with complete UTF-8 chunks. */
JNIEXPORT jint JNICALL Java_nl_learn_courses_LlamaJni_generate(JNIEnv * env, jclass, jlong handle, jbyteArray jprompt, jint max_tokens, jfloat temp, jfloat repeat_penalty, jobject callback) {
    Handle * h = reinterpret_cast<Handle *>(handle);
    g_error.clear();
    h->cancel = false;
    jclass cbClass = env->GetObjectClass(callback);
    jmethodID onBytes = env->GetMethodID(cbClass, "onBytes", "([B)V");

    jsize pn = env->GetArrayLength(jprompt);
    std::string prompt(pn, '\0');
    env->GetByteArrayRegion(jprompt, 0, pn, reinterpret_cast<jbyte *>(&prompt[0]));
    std::vector<llama_token> toks(prompt.size() + 16);
    int c = llama_tokenize(h->vocab, prompt.data(), (int32_t) prompt.size(), toks.data(), (int32_t) toks.size(), false, true);
    if (c < 0) { toks.resize(-c); c = llama_tokenize(h->vocab, prompt.data(), (int32_t) prompt.size(), toks.data(), (int32_t) toks.size(), false, true); }
    if (c <= 0) { g_error = "empty prompt"; return -1; }
    toks.resize(c);
    g_prompt_tokens = c;
    if (c + max_tokens > h->n_ctx) { g_error = "prompt too long for the context window"; return -1; }

    llama_memory_clear(llama_get_memory(h->ctx), true);
    llama_sampler * smpl = llama_sampler_chain_init(llama_sampler_chain_default_params());
    if (repeat_penalty != 1.0f) llama_sampler_chain_add(smpl, llama_sampler_init_penalties(llama_vocab_n_tokens(h->vocab), 4096, repeat_penalty, 0.0f, 0.0f));
    if (temp > 0.0f) {
        llama_sampler_chain_add(smpl, llama_sampler_init_top_k(40));
        llama_sampler_chain_add(smpl, llama_sampler_init_temp(temp));
        llama_sampler_chain_add(smpl, llama_sampler_init_dist(1234));
    } else {
        llama_sampler_chain_add(smpl, llama_sampler_init_greedy());
    }
    for (llama_token t : toks) llama_sampler_accept(smpl, t);

    using clk = std::chrono::steady_clock;
    auto t0 = clk::now();
    int rc = 0, produced = 0;
    for (size_t i = 0; i < toks.size() && rc == 0; i += 512) {
        if (h->cancel) break;
        int32_t n = (int32_t) std::min<size_t>(512, toks.size() - i);
        llama_batch b = llama_batch_get_one(toks.data() + i, n);
        rc = llama_decode(h->ctx, b);
    }
    auto t1 = clk::now();
    g_prefill_ms = std::chrono::duration<double, std::milli>(t1 - t0).count();
    if (rc != 0) { llama_sampler_free(smpl); if (g_error.empty()) g_error = "decode failed"; return -1; }

    std::string pending;
    char buf[256];
    while (produced < max_tokens && !h->cancel) {
        llama_token tok = llama_sampler_sample(smpl, h->ctx, -1);
        if (llama_vocab_is_eog(h->vocab, tok)) break;
        int n = llama_token_to_piece(h->vocab, tok, buf, sizeof(buf), 0, false);
        if (n > 0) pending.append(buf, n);
        produced++;
        size_t ok = utf8_complete_prefix(pending);
        if (ok > 0) {
            jbyteArray arr = to_bytes(env, pending.substr(0, ok));
            env->CallVoidMethod(callback, onBytes, arr);
            env->DeleteLocalRef(arr);
            pending.erase(0, ok);
            if (env->ExceptionCheck()) { env->ExceptionClear(); break; }
        }
        llama_batch b = llama_batch_get_one(&tok, 1);
        if (llama_decode(h->ctx, b) != 0) { g_error = "decode failed"; produced = -1; break; }
    }
    auto t2 = clk::now();
    double secs = std::chrono::duration<double>(t2 - t1).count();
    g_tps = secs > 0 ? produced / secs : 0;
    llama_sampler_free(smpl);
    return produced;
}

}  // extern "C"

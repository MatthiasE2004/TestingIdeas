# Learn: offline course app (Android)

Two OpenLearn courses (Project management; Entrepreneurship) as one APK: home screen with progress %, chapter overview with resume,
short pages, quizzes, written activities with on-device AI feedback, 15 interactive tools, Bluetooth progress sync.

- Install: `dist/learn-courses.apk` (sideload; signed with `android/learn-debug.keystore`, so updates install over it).
- Build: `./build.sh` (needs apt: aapt apksigner zipalign dalvik-exchange android-sdk-platform-23, JDK, python3). Content parts in `app/www/content/parts`, merged by `tools/assemble.py`.
- On-device AI: transformers.js + ONNX Runtime Web (WebGPU, WASM fallback). Models are downloaded in-app (Settings > Local AI).
- Content: The Open University, OpenLearn, CC BY-NC-SA 4.0.

## Local AI engines
1. **Native CPU (default on Android)**: `android/src/.../NativeLlm.java` + `BpeTokenizer.java` run Hugging Face ONNX decoder models (`onnx/model_q4.onnx`, fp32 KV cache; Qwen2.5/Qwen3/SmolLM-style byte-level BPE + ChatML) with ONNX Runtime Android's native arm64 kernels (no WebView, no GPU, no wasm). Models are downloaded by Java into app storage.
2. **WebView CPU / GPU (fallback, e.g. Gemma)**: transformers.js + ONNX Runtime Web inside a Web Worker.
A renderer or native crash is detected on the next start and switches the app to the WebView CPU engine with a notice.

## Testing the local AI
- In the app: Settings > Local AI > **Run AI self-test** (loads the selected model, generates, runs a real feedback request, measures UI freezes; PASS / PASSED with warnings / FAILED).
- Automated (no real model needed): `./build.sh` once, then `tests/run_all.sh`. It builds random-weight fixture models in the real ONNX layout and checks: the Java tokenizer against Python `tokenizers` on 400+ strings, the Java generation loop token-for-token against Python `onnxruntime`, download/storage/purge, cancel, the app UI driving the real Java engine, and the WebView worker engine (isolated and not).

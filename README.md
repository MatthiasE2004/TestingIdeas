# Learn: offline course app (Android)

Six OpenLearn courses (Project management; Entrepreneurship; Leadership and followership; Personal branding; Hybrid working; Introduction to cyber security) as one APK: home screen with progress %, chapter overview with resume,
short pages, quizzes, written activities with on-device AI feedback, 15 interactive tools, Bluetooth progress sync.

- Install: `dist/learn-courses.apk` (sideload; signed with `android/learn-debug.keystore`, so updates install over it).
- Build: `./build.sh` (needs apt: aapt apksigner zipalign dalvik-exchange android-sdk-platform-23, JDK, python3). Content parts in `app/www/content/parts`, merged by `tools/assemble.py`.
- On-device AI: transformers.js + ONNX Runtime Web (WebGPU, WASM fallback). Models are downloaded in-app (Settings > Local AI).
- Content: The Open University, OpenLearn, CC BY-NC-SA 4.0.

## Notes, highlights, documents, AI modes
- Press and hold a word in a course page: handles appear (drag them, or keep sliding the finger), then **Highlight**, **Note** or **Ask AI**. Marks are light grey in the course; open the **notes viewer** (book icon) for yellow highlights / blue notes, ticks in the progress bar and the side panel (chapter > page title > entry).
- Home > **Notes**: all courses, notes viewer and a **General document** (rich text with auto bullet/numbered lists, AI rewrite/shorten/expand/fix/summarize/combine, import from the side panel). Home > **AI**: chat about the course and your notes with selectable context.
- Settings > Local AI: response **modes** (add/edit/delete your own) and what activity answers are checked against (model answer / course content / both).
- Data model: highlights, notes and documents are stored in `Store` with timestamps and tombstones, so they sync over Bluetooth like progress.

## Local AI engines (Settings > Local AI > engine)
1. **llama.cpp (default on Android)**: `android/jni/llama_jni.cpp` + `NativeLlm.java` run GGUF models (Qwen3 0.6B Q4_K_M from `unsloth/Qwen3-0.6B-GGUF`) with llama.cpp (pinned commit in `build.sh`, built with the NDK for arm64, dot-product NEON kernels). Memory-mapped model, logits only for the last token.
2. **ONNX Runtime native**: `NativeLlm.java` + `BpeTokenizer.java` run Hugging Face ONNX decoder models with ONNX Runtime Android.
3. **WebView CPU / GPU**: transformers.js + ONNX Runtime Web in a Web Worker (fallback; GPU is experimental).
A renderer or native crash is detected on the next start and switches the app to the WebView CPU engine with a notice.

## Testing the local AI
- In the app: Settings > Local AI > **Run AI self-test** (loads the selected model, generates, runs a real feedback request, measures UI freezes; PASS / PASSED with warnings / FAILED).
- Automated: `./build.sh` once (downloads NDK, llama.cpp, ORT), then `tests/run_all.sh`. If `out/qwen3` (ONNX files) and `out/qwen3-gguf` (the GGUF) exist it also tests the real Qwen3 0.6B (tokenizer + chat template vs Hugging Face, generation vs the ONNX Runtime reference, llama.cpp through JNI, the real app UI). It always builds random-weight fixture models in the real ONNX layout and checks: the Java tokenizer against Python `tokenizers` on 400+ strings, the Java generation loop token-for-token against Python `onnxruntime`, download/storage/purge, cancel, the app UI driving the real Java engine, and the WebView worker engine (isolated and not).

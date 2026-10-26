# Learn: offline course app (Android)

Two OpenLearn courses (Project management; Entrepreneurship) as one APK: home screen with progress %, chapter overview with resume,
short pages, quizzes, written activities with on-device AI feedback, 15 interactive tools, Bluetooth progress sync.

- Install: `dist/learn-courses.apk` (sideload; signed with `android/learn-debug.keystore`, so updates install over it).
- Build: `./build.sh` (needs apt: aapt apksigner zipalign dalvik-exchange android-sdk-platform-23, JDK, python3). Content parts in `app/www/content/parts`, merged by `tools/assemble.py`.
- On-device AI: transformers.js + ONNX Runtime Web (WebGPU, WASM fallback). Models are downloaded in-app (Settings > Local AI).
- Content: The Open University, OpenLearn, CC BY-NC-SA 4.0.

## Testing the local AI
- In the app: Settings > Local AI > **Run AI self-test** (loads the selected model, generates, runs a real feedback request, measures UI freezes; PASS / PASSED with warnings / FAILED).
- On a dev machine (no real model needed): `python3 tests/make_tiny_model.py out/tiny-fast 2 128; python3 tests/make_tiny_model.py out/tiny-slow 16 512; node tests/e2e_ai.js iso` (also `noiso`, and `iso gpu` for WebGPU via software Vulkan).
  The fixtures are random-weight models in the same ONNX layout real models use, so they exercise the same engine, worker, streaming, cancel and timeout code.

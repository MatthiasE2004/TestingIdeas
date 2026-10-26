# Learn: offline course app (Android)

Two OpenLearn courses (Project management; Entrepreneurship) as one APK: home screen with progress %, chapter overview with resume,
short pages, quizzes, written activities with on-device AI feedback, 15 interactive tools, Bluetooth progress sync.

- Install: `dist/learn-courses.apk` (sideload; signed with `android/learn-debug.keystore`, so updates install over it).
- Build: `./build.sh` (needs apt: aapt apksigner zipalign dalvik-exchange android-sdk-platform-23, JDK, python3). Content parts in `app/www/content/parts`, merged by `tools/assemble.py`.
- On-device AI: transformers.js + ONNX Runtime Web (WebGPU, WASM fallback). Models are downloaded in-app (Settings > Local AI).
- Content: The Open University, OpenLearn, CC BY-NC-SA 4.0.

#!/usr/bin/env bash
# Runs every automated check. Prereqs: ./build.sh once (downloads jars), python venv with onnx numpy tokenizers onnxruntime jinja2, Playwright.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"; FAIL=0
PY=${PY:-python3}
[ -d out/tiny-fast ]  || $PY tests/make_tiny_model.py out/tiny-fast 2 128
[ -d out/tiny-qwen ]  || $PY tests/make_tiny_model.py out/tiny-qwen 2 128 qwen
[ -d out/tiny-slow ]  || $PY tests/make_tiny_model.py out/tiny-slow 16 512
[ -f out/jni-host/libllama_jni.so ] || { cmake -S android/jni -B out/jni-host -G Ninja -DCMAKE_BUILD_TYPE=Release -DLLAMA_DIR="$ROOT/out/cache/llama.cpp" >/dev/null && cmake --build out/jni-host -j"$(nproc)" >/dev/null; }
for m in tiny-fast tiny-qwen tiny-slow; do echo "### Java engine vs Python reference: $m"; tests/jvm/run.sh out/$m || FAIL=1; done
if [ -f out/qwen3-gguf/Qwen3-0.6B-Q4_K_M.gguf ] && [ -d out/qwen3 ]; then echo "### Real Qwen3 0.6B: ONNX engine vs reference"; tests/jvm/run.sh out/qwen3 || FAIL=1; echo "### Real Qwen3 0.6B GGUF through llama.cpp"; tests/jvm/run_gguf.sh out/qwen3-gguf Qwen3-0.6B-Q4_K_M.gguf out/qwen3 || FAIL=1; fi
echo "### App UI + real Java engines (native paths)"; node tests/e2e_native.js | grep -E "PASS|FAIL|ALL|CRASH" || FAIL=1
echo "### WebView engine (worker/WASM), cross-origin isolated"; node tests/e2e_ai.js iso | grep -E "FAIL|ALL|CRASH" || FAIL=1
echo "### WebView engine, not isolated (single thread)"; node tests/e2e_ai.js noiso | grep -E "FAIL|ALL|CRASH" || FAIL=1
[ $FAIL = 0 ] && echo "=== ALL SUITES PASSED ===" || echo "=== SOME SUITE FAILED ==="; exit $FAIL

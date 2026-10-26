#!/usr/bin/env bash
# Real GGUF model through NativeLlm + JNI + llama.cpp (host build of the same code that ships for arm64). Usage: tests/jvm/run_gguf.sh out/qwen3-gguf Qwen3-0.6B-Q4_K_M.gguf out/qwen3(for HF tokenizer reference)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; C="$ROOT/out/cache"; T="$ROOT/out/jvmtest"; mkdir -p "$T/classes"
javac -nowarn --release 17 -cp "$C/onnxruntime-desktop-1.20.0.jar:$C/gson.jar" -d "$T/classes" "$ROOT"/android/src/nl/learn/courses/{BpeTokenizer,NativeLlm,LlamaJni}.java "$ROOT/tests/jvm/nl/learn/courses/GgufTest.java" 2>&1 | grep -v JAVA_TOOL || true
OUT=$(java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Xmx3g -Dthreads=${THREADS:-4} -Djava.library.path="$ROOT/out/jni-host" -cp "$T/classes:$C/onnxruntime-desktop-1.20.0.jar:$C/gson.jar" nl.learn.courses.GgufTest "$ROOT/$1" "$2" 2>&1 | grep -v JAVA_TOOL | tail -1)
SCRATCH=/tmp/claude-0/-home-user-TestingIdeas/5f829c21-dcab-5cfc-b415-a90a75546e9d/scratchpad
"$SCRATCH/venv/bin/python" - "$OUT" "$ROOT/$3" <<'PY'
import json,sys
from tokenizers import Tokenizer
try: j=json.loads(sys.argv[1])
except Exception: print("FAIL could not parse harness output:", sys.argv[1][:600]); sys.exit(1)
tok=Tokenizer.from_file(sys.argv[2]+"/tokenizer.json"); bad=0
prompt="<|im_start|>system\nYou are a tutor.<|im_end|>\n<|im_start|>user\nExplain what a project is, in a few words: temporary, unique, budget. Ünïcödé ✓<|im_end|>\n<|im_start|>assistant\n<think>\n\n</think>\n\n"
ref=tok.encode(prompt,add_special_tokens=False).ids
ok=ref==j['promptIds']; print('PASS' if ok else 'FAIL','llama.cpp tokenization of the chat prompt == Hugging Face tokenizer ('+str(len(ref))+' tokens)'); bad+=0 if ok else 1
print('  text:',repr(j['text'])); ok='project' in j['text'].lower() and len(j['text'])>40; print('PASS' if ok else 'FAIL','answer is a sensible sentence'); bad+=0 if ok else 1
print('  tokens/s',round(j['tps'],1),'| prompt',j['promptTokens'],'tokens in',round(j['prefillMs']),'ms | model load',j['loadMs'],'ms')
print('  emoji reply:',repr(j['emoji']));ok='�' not in j['emoji'] and len(j['emoji'])>0; print('PASS' if ok else 'FAIL','multi-byte text streams without broken characters'); bad+=0 if ok else 1
ok=j['cancelledFlag'] and j['cancelledChars']<400; print('PASS' if ok else 'FAIL','interrupt stops llama.cpp generation'); bad+=0 if ok else 1
print('PASS' if j['progress'] else 'FAIL','download progress events'); bad+=0 if j['progress'] else 1
s=json.loads(j['storage']); ok=len(s)==1 and s[0]['complete'] and s[0]['bytes']>3e8; print('PASS' if ok else 'FAIL','storage listing',s); bad+=0 if ok else 1
ok=j['purged']>3e8 and j['afterPurge']=='[]'; print('PASS' if ok else 'FAIL','purge frees',j['purged']); bad+=0 if ok else 1
print('  cpu:',j['sys'][:160].replace('\n',' '))
sys.exit(bad)
PY

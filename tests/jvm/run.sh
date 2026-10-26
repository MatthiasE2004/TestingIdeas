#!/usr/bin/env bash
# Verifies the Java tokenizer + native generation loop against Python tokenizers/onnxruntime on a fixture model dir.
# Usage: tests/jvm/run.sh out/tiny-qwen   (needs the scratch jars; see build.sh for where they are cached)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; FIX="$ROOT/$1"; C="$ROOT/out/cache"; T="$ROOT/out/jvmtest"
mkdir -p "$T/classes"
javac -nowarn --release 17 -cp "$C/onnxruntime-desktop-1.20.0.jar:$C/gson.jar" -d "$T/classes" "$ROOT/android/src/nl/learn/courses/BpeTokenizer.java" "$ROOT/android/src/nl/learn/courses/NativeLlm.java" "$ROOT/tests/jvm/nl/learn/courses/NativeLlmTest.java" 2>&1 | grep -v JAVA_TOOL || true
python3 - "$T/strings.json" "$ROOT/out/cache/strings_src.txt" <<'PY'
import json,sys,random
src=open(sys.argv[2],encoding='utf-8').read().split('\n') if __import__('os').path.exists(sys.argv[2]) else []
random.seed(3); lines=[l for l in src if len(l.strip())>3]; random.shuffle(lines)
extra=["Hello, world!","  leading and trailing  ","tabs\tand\nnewlines\r\n\r\nend","It's we'll they've I'M DON'T","12345 6789 3.14159 £1,000","café naïve Über 中文测试 日本語 😀 emoji ✓","<|im_start|>user\nhi<|im_end|>","a"*50,"","x","!!!???...---"]
json.dump(extra+lines[:400],open(sys.argv[1],'w'))
PY
SCRATCH=/tmp/claude-0/-home-user-TestingIdeas/5f829c21-dcab-5cfc-b415-a90a75546e9d/scratchpad
JAVA_OUT=$(java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -cp "$T/classes:$C/onnxruntime-desktop-1.20.0.jar:$C/gson.jar" nl.learn.courses.NativeLlmTest "$FIX" "$T/strings.json" 24 2>&1 | grep -v JAVA_TOOL | tail -1)
PY_OUT=$("$SCRATCH/venv/bin/python" "$ROOT/tests/oracle.py" "$FIX" "$T/strings.json" 24)
python3 - "$JAVA_OUT" "$PY_OUT" <<'PY'
import json,sys
j=json.loads(sys.argv[1]); p=json.loads(sys.argv[2]); bad=0
mism=[i for i,(a,b) in enumerate(zip(j['enc'],p['enc'])) if a!=b]
print(('PASS' if not mism else 'FAIL'),'tokenizer parity on',len(p['enc']),'strings;',len(mism),'mismatches')
if mism: bad+=1; i=mism[0]; print('  first mismatch',i,j['enc'][i][:20],p['enc'][i][:20])
ok=j['prompt']==p['prompt']; print('PASS' if ok else 'FAIL','chat template + prompt tokens identical'); bad+=0 if ok else 1
ok=j['text']==p['text']; print('PASS' if ok else 'FAIL','greedy generation identical to onnxruntime reference ('+str(len(p['text']))+' chars,',round(j['tps'],1),'tok/s)'); bad+=0 if ok else 1
if not ok: print('  java:',repr(j['text'][:80]),'\n  ref :',repr(p['text'][:80]))
print('PASS' if j['cancelledFlag'] else 'FAIL','interrupt stops generation'); bad+=0 if j['cancelledFlag'] else 1
print('PASS' if j['progressEvents'] else 'FAIL','download progress events'); bad+=0 if j['progressEvents'] else 1
s=json.loads(j['storage']); ok=len(s)==1 and s[0]['complete'] and s[0]['bytes']>1000; print('PASS' if ok else 'FAIL','storage listing',s); bad+=0 if ok else 1
ok=j['purgedBytes']>1000 and j['afterPurge']=='[]'; print('PASS' if ok else 'FAIL','purge frees',j['purgedBytes'],'bytes'); bad+=0 if ok else 1
sys.exit(bad)
PY

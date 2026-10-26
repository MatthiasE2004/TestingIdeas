#!/usr/bin/env python3
"""Reference implementation (Python tokenizers + onnxruntime) used to verify the Java NativeLlm: prints JSON with token ids and greedy generation."""
import sys, json, numpy as np, onnxruntime as ort
from tokenizers import Tokenizer
d = sys.argv[1]
tok = Tokenizer.from_file(d + "/tokenizer.json")
cfg = json.load(open(d + "/config.json")); H = cfg["num_key_value_heads"]; HD = cfg.get("head_dim") or cfg["hidden_size"] // cfg["num_attention_heads"]; L = cfg["num_hidden_layers"]
strings = json.load(open(sys.argv[2]))
enc = [tok.encode(s, add_special_tokens=False).ids for s in strings]
import os
TC = json.load(open(d + "/tokenizer_config.json")) if os.path.exists(d + "/tokenizer_config.json") else {}
def chat(msgs):
    if isinstance(TC.get("chat_template"), str) and "<think>" in TC["chat_template"]:   # real Qwen3: render the official Jinja template with thinking disabled
        import jinja2
        env = jinja2.Environment(); env.globals["raise_exception"] = lambda m: (_ for _ in ()).throw(Exception(m))
        return env.from_string(TC["chat_template"]).render(messages=msgs, add_generation_prompt=True, enable_thinking=False, tools=None)
    return "".join(f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>\n" for m in msgs) + "<|im_start|>assistant\n"
msgs = [{"role": "system", "content": "You are a tutor."}, {"role": "user", "content": "Explain what a project is, in a few words: temporary, unique, budget. Ünïcödé ✓"}]
ids = tok.encode(chat(msgs), add_special_tokens=False).ids
sess = ort.InferenceSession(d + "/onnx/model_q4.onnx", providers=["CPUExecutionProvider"])
eos = {tok.token_to_id("<|im_end|>"), tok.token_to_id("<|endoftext|>")}
print("PROMPT:", repr(chat(msgs)), file=sys.stderr)
past = {f"past_key_values.{i}.{k}": np.zeros((1, H, 0, HD), np.float32) for i in range(L) for k in ("key", "value")}
all_ids = list(ids); feed = ids; plen = 0; gen = []
for step in range(int(sys.argv[3]) if len(sys.argv) > 3 else 24):
    inp = {"input_ids": np.array([feed], np.int64), "attention_mask": np.ones((1, plen + len(feed)), np.int64), "position_ids": np.arange(plen, plen + len(feed), dtype=np.int64)[None]}
    inp.update(past); names = [o.name for o in sess.get_outputs()]; out = dict(zip(names, sess.run(None, inp)))
    row = out["logits"][0, -1].copy()
    for t in set(all_ids): row[t] = row[t] / 1.08 if row[t] > 0 else row[t] * 1.08
    nxt = int(np.argmax(row)); plen += len(feed)
    past = {k.replace("present", "past_key_values"): v for k, v in out.items() if k.startswith("present")}
    if nxt in eos: break
    gen.append(nxt); all_ids.append(nxt); feed = [nxt]
print(json.dumps({"enc": enc, "prompt": ids, "gen": gen, "text": tok.decode(gen)}))

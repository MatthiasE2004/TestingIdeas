#!/usr/bin/env python3
"""Builds a tiny random-weight causal LM in transformers.js/ONNX layout (KV cache, ChatML tokenizer).
It produces gibberish but exercises exactly the code path real models use. Usage: make_tiny_model.py OUT_DIR [layers] [hidden]"""
import sys, os, json, numpy as np, onnx
from onnx import helper as oh, TensorProto as TP, numpy_helper as nh
from tokenizers import Tokenizer, models, trainers, pre_tokenizers, decoders, normalizers, Regex
out = sys.argv[1]; L = int(sys.argv[2]) if len(sys.argv) > 2 else 2; D = int(sys.argv[3]) if len(sys.argv) > 3 else 128
H = 4; HD = D // H; V = 3000
os.makedirs(out + "/onnx", exist_ok=True)
# ---- tokenizer (byte-level BPE trained on course text) ----
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
corpus = [open(f, encoding="utf-8").read() for f in ("/tmp/claude-0/-home-user-TestingIdeas/5f829c21-dcab-5cfc-b415-a90a75546e9d/scratchpad/src/pm.txt",) if os.path.exists(f)] or ["a project is a temporary endeavour " * 200]
QWEN = len(sys.argv) > 4 and sys.argv[4] == "qwen"   # Qwen2.5-style tokenizer: NFC + regex Split + byte-level (use_regex=False)
QRE = r"(?i:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+"
tok = Tokenizer(models.BPE())
if QWEN:
    tok.normalizer = normalizers.NFC()
    tok.pre_tokenizer = pre_tokenizers.Sequence([pre_tokenizers.Split(Regex(QRE), behavior="isolated", invert=False), pre_tokenizers.ByteLevel(add_prefix_space=False, use_regex=False)])
else:
    tok.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
tok.decoder = decoders.ByteLevel()
special = ["<|endoftext|>", "<|im_start|>", "<|im_end|>"]
tok.train_from_iterator(corpus, trainers.BpeTrainer(vocab_size=V, special_tokens=special, initial_alphabet=pre_tokenizers.ByteLevel.alphabet()))
tok.save(out + "/tokenizer.json"); eos = tok.token_to_id("<|im_end|>")
chat = "{% for m in messages %}{{'<|im_start|>' + m['role'] + '\n' + m['content'] + '<|im_end|>' + '\n'}}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}"
json.dump({"tokenizer_class": "PreTrainedTokenizerFast", "chat_template": chat, "eos_token": "<|im_end|>", "bos_token": None, "pad_token": "<|endoftext|>", "model_max_length": 2048,
           "added_tokens_decoder": {str(tok.token_to_id(t)): {"content": t, "special": True} for t in special}}, open(out + "/tokenizer_config.json", "w"))
json.dump({"model_type": "qwen2", "architectures": ["Qwen2ForCausalLM"], "hidden_size": D, "num_attention_heads": H, "num_key_value_heads": H, "num_hidden_layers": L,
           "vocab_size": V, "max_position_embeddings": 2048, "eos_token_id": eos, "bos_token_id": None, "torch_dtype": "float32"}, open(out + "/config.json", "w"))
json.dump({"eos_token_id": eos, "do_sample": False, "max_new_tokens": 64}, open(out + "/generation_config.json", "w"))
# ---- ONNX graph ----
rng = np.random.default_rng(0); inits = []; nodes = []
def W(name, shape, scale): inits.append(nh.from_array((rng.standard_normal(shape) * scale).astype(np.float32), name)); return name
def C(name, arr): inits.append(nh.from_array(np.array(arr), name)); return name
C("shape_heads", np.array([0, 0, H, HD], dtype=np.int64)); C("shape_model", np.array([0, 0, D], dtype=np.int64)); C("inv_sqrt", np.array(1.0 / np.sqrt(HD), dtype=np.float32))
W("embed", (V, D), 0.5); W("lm_head", (D, V), 1.0 / np.sqrt(D) * 3)
inputs = [oh.make_tensor_value_info("input_ids", TP.INT64, ["b", "s"]), oh.make_tensor_value_info("attention_mask", TP.INT64, ["b", "t"]), oh.make_tensor_value_info("position_ids", TP.INT64, ["b", "s"])]
outputs = [oh.make_tensor_value_info("logits", TP.FLOAT, ["b", "s", V])]
nodes.append(oh.make_node("Gather", ["embed", "input_ids"], ["x0"]))
x = "x0"
for i in range(L):
    p = f"l{i}_"
    for n in ("q", "k", "v", "o"): W(p + "w" + n, (D, D), 1.0 / np.sqrt(D))
    for n in ("q", "k", "v"):
        nodes += [oh.make_node("MatMul", [x, p + "w" + n], [p + n + "m"]), oh.make_node("Reshape", [p + n + "m", "shape_heads"], [p + n + "r"]), oh.make_node("Transpose", [p + n + "r"], [p + n + "t"], perm=[0, 2, 1, 3])]
    pk, pv = f"past_key_values.{i}.key", f"past_key_values.{i}.value"
    inputs += [oh.make_tensor_value_info(pk, TP.FLOAT, ["b", H, "p", HD]), oh.make_tensor_value_info(pv, TP.FLOAT, ["b", H, "p", HD])]
    outputs += [oh.make_tensor_value_info(f"present.{i}.key", TP.FLOAT, ["b", H, "t", HD]), oh.make_tensor_value_info(f"present.{i}.value", TP.FLOAT, ["b", H, "t", HD])]
    nodes += [oh.make_node("Concat", [pk, p + "kt"], [f"present.{i}.key"], axis=2), oh.make_node("Concat", [pv, p + "vt"], [f"present.{i}.value"], axis=2),
              oh.make_node("Transpose", [f"present.{i}.key"], [p + "kT"], perm=[0, 1, 3, 2]), oh.make_node("MatMul", [p + "qt", p + "kT"], [p + "sc"]),
              oh.make_node("Mul", [p + "sc", "inv_sqrt"], [p + "scs"]), oh.make_node("Softmax", [p + "scs"], [p + "att"], axis=-1),
              oh.make_node("MatMul", [p + "att", f"present.{i}.value"], [p + "ctx"]), oh.make_node("Transpose", [p + "ctx"], [p + "ctxt"], perm=[0, 2, 1, 3]),
              oh.make_node("Reshape", [p + "ctxt", "shape_model"], [p + "ctxr"]), oh.make_node("MatMul", [p + "ctxr", p + "wo"], [p + "ao"]), oh.make_node("Add", [x, p + "ao"], [p + "x"])]
    x = p + "x"
nodes.append(oh.make_node("MatMul", [x, "lm_head"], ["logits"]))
g = oh.make_graph(nodes, "tiny", inputs, outputs, inits)
m = oh.make_model(g, opset_imports=[oh.make_opsetid("", 17)]); m.ir_version = 8
onnx.checker.check_model(m)
for name in ("model_q4.onnx", "model_q4f16.onnx"): onnx.save(m, f"{out}/onnx/{name}")
print("tiny model", L, "layers, hidden", D, "->", out, round(os.path.getsize(out + "/onnx/model_q4.onnx") / 1e6, 1), "MB")

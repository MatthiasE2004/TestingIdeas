/* Dedicated worker: owns the ONNX Runtime session so inference never blocks the UI thread. */
let tf=null,gen=null,stopper=null,lastDevice=null;
const post=m=>postMessage(m);
async function lib(origin,threads,device){
  if(tf)return tf;
  tf=await import(origin+'/vendor/transformers.min.js');
  const env=tf.env;env.allowLocalModels=false;env.useBrowserCache=true;
  const w=env.backends.onnx.wasm;
  // WebGPU needs the asyncify build (it contains webgpuInit); plain CPU runs the faster non-asyncify build
  const flavour=device==='webgpu'?'.asyncify':'';
  w.wasmPaths={mjs:origin+'/vendor/ort-wasm-simd-threaded'+flavour+'.mjs',wasm:origin+'/vendor/ort-wasm-simd-threaded'+flavour+'.wasm'};
  w.simd=true;w.proxy=false;
  try{env.backends.onnx.webgpu.powerPreference='high-performance'}catch(_){}
  w.numThreads=threads;
  return tf;
}
onmessage=async e=>{
  const m=e.data;
  try{
    if(m.type==='interrupt'){if(stopper)stopper.interrupt();return}
    if(m.type==='load'){
      if(tf&&m.device!==lastDevice){/* ORT wasm paths are fixed at first use */}
      const t=await lib(m.origin,m.threads,m.device);lastDevice=m.device;
      if(gen){try{await gen.dispose()}catch(_){}gen=null}
      gen=await t.pipeline('text-generation',m.repo,{device:m.device,dtype:m.dtype,progress_callback:p=>post({type:'progress',p:{status:p.status,file:p.file,loaded:p.loaded,total:p.total}})});
      post({type:'loaded',id:m.id,device:m.device,threads:m.threads,isolated:self.crossOriginIsolated===true});
    }else if(m.type==='generate'){
      stopper=new tf.InterruptableStoppingCriteria();
      let text='',n=0;const t0=performance.now();
      const streamer=new tf.TextStreamer(gen.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:s=>{text+=s;n++;post({type:'token',id:m.id,text})}});
      const out=await gen(m.msgs,{max_new_tokens:m.max,do_sample:m.temp>0,temperature:m.temp>0?m.temp:undefined,top_k:40,repetition_penalty:1.08,streamer,stopping_criteria:stopper});
      const g=out&&out[0]&&out[0].generated_text,last=Array.isArray(g)?(g[g.length-1]||{}).content:g;
      post({type:'done',id:m.id,text:(last||text),tps:n/Math.max(0.001,(performance.now()-t0)/1000)});
    }
  }catch(err){post({type:'error',id:m.id,message:String(err&&err.message||err)})}
};

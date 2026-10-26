/* On-device LLM runtime: transformers.js (ONNX Runtime Web) on WebGPU, falling back to WASM/CPU.
   Models are downloaded once from Hugging Face by the app itself and cached (Cache API). */
(function(){
  var CATALOG=[
    {id:'qwen2.5-0.5b',name:'Qwen2.5 0.5B Instruct',params:'0.5B',repo:'onnx-community/Qwen2.5-0.5B-Instruct',mb:450,note:'Fastest. Good for short feedback.'},
    {id:'qwen3-0.6b',name:'Qwen3 0.6B',params:'0.6B',repo:'onnx-community/Qwen3-0.6B-ONNX',mb:520,note:'Small reasoning-capable model (thinking is switched off).',qwen3:true},
    {id:'gemma3-1b',name:'Gemma 3 1B IT',params:'1B',repo:'onnx-community/gemma-3-1b-it-ONNX-GQA',mb:760,note:'Closest available Gemma 1B; best quality/size balance.'},
    {id:'llama3.2-1b',name:'Llama 3.2 1B Instruct',params:'1.2B',repo:'onnx-community/Llama-3.2-1B-Instruct-q4f16',mb:1000,gpuOnly:true,fixedDtype:'q4f16',note:'GPU only.'},
    {id:'qwen2.5-1.5b',name:'Qwen2.5 1.5B Instruct',params:'1.5B',repo:'onnx-community/Qwen2.5-1.5B-Instruct',mb:1100,note:'Noticeably better answers; slower.'},
    {id:'qwen3-1.7b',name:'Qwen3 1.7B',params:'1.7B',repo:'onnx-community/Qwen3-1.7B-ONNX',mb:1250,note:'Thinking switched off.',qwen3:true},
    {id:'smollm2-1.7b',name:'SmolLM2 1.7B Instruct',params:'1.7B',repo:'HuggingFaceTB/SmolLM2-1.7B-Instruct',mb:1200,note:'Needs the ONNX files in the repo; if it fails use another model.'},
    {id:'gemma4-1b',name:'Gemma 4 1B (unverified id)',params:'1B',repo:'onnx-community/gemma-4-1b-it-ONNX',mb:800,note:'Repo id could not be verified from the build machine. If the download fails, paste the correct ONNX repo id under Custom model.'}
  ];
  var tf=null,gen=null,cur=null,backend=null,state='idle',lastErr=null,queue=Promise.resolve(),subs=[],prog={};
  function emit(extra){subs.forEach(function(f){try{f(Object.assign({state:state,model:cur,backend:backend,error:lastErr},extra||{}))}catch(e){}})}
  function abs(p){return location.origin+p}
  function lib(){
    if(tf)return Promise.resolve(tf);
    return import(abs('/vendor/transformers.min.js')).then(function(m){
      tf=m; var env=m.env; env.allowLocalModels=false; env.useBrowserCache=true;
      var w=env.backends.onnx.wasm; w.wasmPaths={mjs:abs('/vendor/ort-wasm-simd-threaded.asyncify.mjs'),wasm:abs('/vendor/ort-wasm-simd-threaded.asyncify.wasm')};
      w.numThreads=self.crossOriginIsolated?Math.min(4,navigator.hardwareConcurrency||2):1; return tf;});
  }
  function gpuInfo(){
    if(!navigator.gpu)return Promise.resolve({webgpu:false});
    return navigator.gpu.requestAdapter().then(function(a){
      if(!a)return {webgpu:false};
      var info=a.info||{}; return {webgpu:true,f16:a.features.has('shader-f16'),desc:[info.vendor,info.architecture,info.description].filter(Boolean).join(' ')};
    }).catch(function(){return {webgpu:false}});
  }
  function resolve(model){ // model may be catalog entry or {repo:'..'}
    var m=typeof model==='string'?(CATALOG.filter(function(c){return c.id===model})[0]||{repo:model,name:model,custom:true}):model; return m}
  var t0dl=0,lastB=0,lastT=0,speed=0;
  function progressCb(p){
    if(p.status==='progress'&&p.total){prog[p.file]={l:p.loaded,t:p.total}; var l=0,t=0;for(var k in prog){l+=prog[k].l;t+=prog[k].t}
      var now=Date.now(); if(!lastT){lastT=now;lastB=l}else if(now-lastT>800){speed=(l-lastB)/((now-lastT)/1000);lastT=now;lastB=l}
      emit({progress:t?l/t:0,loadedMB:l/1048576,totalMB:t/1048576,file:p.file,speedMBs:speed/1048576,phase:(t&&l>=t)?'init':'download'});}
    else if(p.status==='initiate'||p.status==='download')emit({file:p.file,phase:'download'});
    else if(p.status==='ready'||p.status==='done')emit({file:p.file});
  }
  var LLM={
    catalog:CATALOG, gpuInfo:gpuInfo,
    on:function(f){subs.push(f)}, status:function(){return {state:state,model:cur,backend:backend,error:lastErr}},
    isReady:function(){return state==='ready'&&!!gen},
    /** opts:{device:'auto'|'webgpu'|'wasm'} */
    load:function(model,opts){
      opts=opts||{}; var m=resolve(model); state='loading'; lastErr=null; prog={}; lastT=0;speed=0; cur=m; gen=null; var hadFlag=LLM.downloaded(m); emit({progress:0,phase:'start'});
      return Promise.all([lib(),gpuInfo()]).then(function(r){
        var gi=r[1],want=opts.device||'auto';
        var devs=want==='wasm'?['wasm']:want==='webgpu'?['webgpu']:(gi.webgpu?['webgpu','wasm']:['wasm']);
        if(m.gpuOnly)devs=devs.filter(function(d){return d==='webgpu'}); if(!devs.length)throw new Error('This model needs WebGPU, which this WebView does not provide.');
        function attempt(i){var dev=devs[i],dtype=m.fixedDtype||(dev==='webgpu'&&gi.f16?'q4f16':'q4');
          return tf.pipeline('text-generation',m.repo,{device:dev,dtype:dtype,progress_callback:progressCb}).then(function(p){backend=dev==='webgpu'?'GPU (WebGPU)':'CPU (WASM)';return p})
            .catch(function(e){ if(i+1<devs.length){console.warn('load on '+dev+' failed, trying next',e);return attempt(i+1)} throw e});}
        return attempt(0);
      }).then(function(p){gen=p;state='ready';try{localStorage.setItem('learn.dl.'+m.repo,'1')}catch(e){} emit({progress:1});return m})
        .catch(function(e){state='error';lastErr=String(e&&e.message||e);gen=null;
          // a failed first download leaves partial files behind: remove them so storage is not wasted
          var cleanup=hadFlag?Promise.resolve():LLM.purgeRepo(m.repo);
          return cleanup.then(function(){lastErr+=hadFlag?'':' (partial files were removed)';emit();throw e})});
    },
    downloaded:function(model){var repo=typeof model==='string'&&model.indexOf('/')>0?model:resolve(model).repo;try{return localStorage.getItem('learn.dl.'+repo)==='1'}catch(e){return false}},
    unload:function(){gen=null;state='idle';backend=null;emit()},
    /** removes cached files of a model */
    purge:function(model){return LLM.purgeRepo(resolve(model).repo)},
    purgeRepo:function(repo){try{localStorage.removeItem('learn.dl.'+repo)}catch(e){}
      if(!self.caches)return Promise.resolve(0); var n=0;
      return caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.open(k).then(function(c){return c.keys().then(function(reqs){
        return Promise.all(reqs.filter(function(r){return r.url.indexOf('huggingface.co/'+repo+'/')>=0}).map(function(r){n++;return c.delete(r)}))})})}))}).then(function(){return n})},
    purgeAll:function(){var jobs=[];LLM.unload();
      try{Object.keys(localStorage).filter(function(k){return k.indexOf('learn.dl.')===0}).forEach(function(k){localStorage.removeItem(k)})}catch(e){}
      if(self.caches)jobs.push(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))})); return Promise.all(jobs)},
    /** scans the cache: -> {repos:[{repo,bytes,files,complete}], usage, quota} */
    storage:function(){
      var est=(navigator.storage&&navigator.storage.estimate)?navigator.storage.estimate().catch(function(){return {}}):Promise.resolve({});
      var scan=!self.caches?Promise.resolve({}):caches.keys().then(function(ks){var by={};
        return Promise.all(ks.map(function(k){return caches.open(k).then(function(c){return c.keys().then(function(reqs){
          return Promise.all(reqs.map(function(r){var m=/huggingface\.co\/([^\/]+\/[^\/]+)\//.exec(r.url);if(!m)return;
            return c.match(r).then(function(res){if(!res)return;var cl=+res.headers.get('content-length');
              var sz=cl>0?Promise.resolve(cl):res.clone().blob().then(function(b){return b.size});
              return sz.then(function(b){var e=by[m[1]]||(by[m[1]]={repo:m[1],bytes:0,files:0});e.bytes+=b;e.files++})})}))})})})).then(function(){return by})});
      return Promise.all([scan,est]).then(function(r){var list=Object.keys(r[0]).map(function(k){var e=r[0][k];e.complete=LLM.downloaded(e.repo);return e});
        list.sort(function(a,b){return b.bytes-a.bytes});return {repos:list,usage:r[1].usage||0,quota:r[1].quota||0}})},
    /** opts:{system,prompt,maxTokens,temperature,onToken} */
    generate:function(o){
      var run=function(){
        if(!gen)return Promise.reject(new Error('no-model'));
        var msgs=[]; if(o.system)msgs.push({role:'system',content:o.system});
        msgs.push({role:'user',content:o.prompt+((cur&&cur.qwen3)?' /no_think':'')});
        var text='',t0=Date.now(),n=0;
        var streamer=new tf.TextStreamer(gen.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:function(t){text+=t;n++;if(o.onToken)o.onToken(clean(text))}});
        var temp=o.temperature==null?0.5:o.temperature;
        return gen(msgs,{max_new_tokens:o.maxTokens||200,do_sample:temp>0,temperature:temp>0?temp:undefined,top_k:40,repetition_penalty:1.08,streamer:streamer}).then(function(out){
          var g=out&&out[0]&&out[0].generated_text,last=Array.isArray(g)?(g[g.length-1]||{}).content:g;
          LLM.lastTps=n/Math.max(0.001,(Date.now()-t0)/1000); return clean(last||text)});
      };
      var p=queue.then(run,run); queue=p.catch(function(){}); return p;
    },
    lastTps:0
  };
  function clean(t){return String(t||'').replace(/<think>[\s\S]*?(<\/think>|$)/g,'').trim()}
  window.LLM=LLM;
})();

/* On-device LLM runtime. Inference runs in a dedicated Web Worker (js/llm-worker.js) so the UI can never freeze;
   transformers.js + ONNX Runtime Web (CPU/WASM by default, WebGPU opt-in). Models are cached with the Cache API. */
(function(){
  // Focus build: a single model. Qwen3 0.6B runs on the native engine (ONNX Runtime, CPU); WebView engines remain as fallbacks.
  var CATALOG=[
    {id:'qwen3-0.6b',name:'Qwen3 0.6B',params:'0.6B',repo:'onnx-community/Qwen3-0.6B-ONNX',mb:919,
     gguf:{repo:'unsloth/Qwen3-0.6B-GGUF',file:'Qwen3-0.6B-Q4_K_M.gguf',mb:397},template:'chatml-nothink',
     note:'Small chat model; thinking is switched off.',qwen3:true}
  ];
  var NATIVE=!!(window.Android&&window.Android.llmPost),useNative=false;
  var worker=null,cur=null,backend=null,state='idle',lastErr=null,subs=[],prog={},seq=0,calls={},lastInfo={};
  var t0dl=0,lastB=0,lastT=0,speed=0;
  function emit(extra){subs.forEach(function(f){try{f(Object.assign({state:state,model:cur,backend:backend,error:lastErr},extra||{}))}catch(e){}})}
  function mark(o){try{if(o)localStorage.setItem('learn.inflight',JSON.stringify(Object.assign({t:Date.now()},o)));else localStorage.removeItem('learn.inflight')}catch(e){}}
  function threads(){return self.crossOriginIsolated?Math.max(1,Math.min(4,Math.floor((navigator.hardwareConcurrency||4)/2))):1}
  function gpuInfo(){
    if(!navigator.gpu)return Promise.resolve({webgpu:false});
    return navigator.gpu.requestAdapter().then(function(a){
      if(!a)return {webgpu:false};
      var info=a.info||{}; return {webgpu:true,f16:a.features.has('shader-f16'),desc:[info.vendor,info.architecture,info.description].filter(Boolean).join(' ')};
    }).catch(function(){return {webgpu:false}});
  }
  function resolve(model){return typeof model==='string'?(CATALOG.filter(function(c){return c.id===model})[0]||{repo:model,id:model,name:model,custom:true}):model}
  function progressCb(p){
    if(p.status==='progress'&&p.total){prog[p.file]={l:p.loaded,t:p.total}; var l=0,t=0;for(var k in prog){l+=prog[k].l;t+=prog[k].t}
      var now=Date.now(); if(!lastT){lastT=now;lastB=l}else if(now-lastT>800){speed=(l-lastB)/((now-lastT)/1000);lastT=now;lastB=l}
      emit({progress:t?l/t:0,loadedMB:l/1048576,totalMB:t/1048576,file:p.file,speedMBs:speed/1048576,phase:(t&&l>=t)?'init':'download'});}
    else if(p.status==='initiate'||p.status==='download')emit({file:p.file,phase:'download'});
  }
  function startWorker(){
    killWorker();
    worker=new Worker(location.origin+'/js/llm-worker.js',{type:'module'});
    worker.onmessage=function(e){onMsg(e.data)};
    worker.onerror=function(e){failAll(new Error('AI worker error: '+(e.message||'failed to start')));};
    return worker}
  function onMsg(m){
      if(m.type==='progress')return progressCb(m.p);
      var c=calls[m.id];if(!c)return;
      if(m.type==='token'){if(c.onToken)c.onToken(clean(m.text))}
      else if(m.type==='loaded'){delete calls[m.id];c.res(m)}
      else if(m.type==='done'){delete calls[m.id];c.res(m)}
      else if(m.type==='error'){delete calls[m.id];c.rej(new Error(m.message))}}
  window.__llmEvent=onMsg;
  function send(msg){if(useNative)window.Android.llmPost(JSON.stringify(msg));else worker.postMessage(msg)}
  function killWorker(){if(worker){try{worker.terminate()}catch(e){}worker=null}}
  function failAll(err){var cs=calls;calls={};Object.keys(cs).forEach(function(k){cs[k].rej(err)})}
  function call(msg,extra){return new Promise(function(res,rej){var id=++seq;calls[id]=Object.assign({res:res,rej:rej},extra||{});msg.id=id;send(msg)})}
  function clean(t){return String(t||'').replace(/<think>[\s\S]*?(<\/think>|$)/g,'').trim()}
  function loadNative(m){
    killWorker();useNative=true;
    mark({stage:'load',dev:'native',model:m.id||m.repo});
    var th=Math.max(2,Math.min(4,Math.floor((navigator.hardwareConcurrency||8)/2)));
    return call({type:'load',repo:m.repo,dtype:'q4',threads:th,template:m.template}).then(function(r){
      backend='CPU (native x'+r.threads+')';lastInfo={isolated:true,threads:r.threads,device:'native',dtype:'q4'};return m})}
  function loadLlama(m){
    killWorker();useNative=true;
    mark({stage:'load',dev:'llama',model:m.id||m.repo});
    var th=Math.max(2,Math.min(4,Math.floor((navigator.hardwareConcurrency||8)/2)));
    return call({type:'load',repo:m.gguf.repo,gguf:m.gguf.file,threads:th,template:m.template}).then(function(r){
      backend='CPU (llama.cpp x'+r.threads+')';lastInfo={isolated:true,threads:r.threads,device:'llama',dtype:'q4_k_m'};return m})}
  function loadWeb(m,want){
    useNative=false;startWorker();
    return gpuInfo().then(function(gi){
      if(want==='webgpu'&&!gi.webgpu)throw new Error('WebGPU is not available in this WebView - use CPU mode.');
      if(m.gpuOnly&&want!=='webgpu')throw new Error('This model needs GPU mode (experimental).');
      var dtype=m.fixedDtype||(want==='webgpu'&&gi.f16?'q4f16':'q4');
      mark({stage:'load',dev:want,model:m.id||m.repo});
      return call({type:'load',origin:location.origin,repo:m.repo,device:want,dtype:dtype,threads:threads()}).then(function(r){
        backend=want==='webgpu'?'GPU (WebGPU)':'CPU (WebView WASM x'+r.threads+')';lastInfo={isolated:r.isolated,threads:r.threads,device:want,dtype:dtype};return m})})}
  function nativeList(){if(!NATIVE)return [];try{return JSON.parse(window.Android.llmStorage())}catch(e){return []}}
  function engineIsLlama(m){return NATIVE&&Store.settings.device==='llama'&&!!(m&&m.gguf)}
  var LLM={
    repoOf:function(m){m=resolve(m);return engineIsLlama(m)?m.gguf.repo:m.repo},
    sizeMB:function(m){m=resolve(m);return engineIsLlama(m)?m.gguf.mb:m.mb},
    catalog:CATALOG, gpuInfo:gpuInfo,
    on:function(f){subs.push(f)}, status:function(){return {state:state,model:cur,backend:backend,error:lastErr}},
    isReady:function(){return state==='ready'&&(useNative||!!worker)},
    nativeAvailable:function(){return NATIVE},
    info:function(){return lastInfo},
    /** opts:{device:'native'|'wasm'|'webgpu'}. Native (Android only) = ONNX Runtime CPU kernels via JNI; wasm/webgpu = WebView worker. */
    load:function(model,opts){
      opts=opts||{}; var m=resolve(model); state='loading'; lastErr=null; prog={}; lastT=0;speed=0; cur=m; backend=null; var hadFlag=LLM.downloaded(m);
      var wantLlama=NATIVE&&opts.device==='llama'&&!!m.gguf,wantNative=NATIVE&&opts.device==='native'&&m.native!==false;
      var usedRepo=wantLlama?m.gguf.repo:m.repo;hadFlag=LLM.downloaded(m);
      emit({progress:0,phase:'start'});
      var p=wantLlama?loadLlama(m):wantNative?loadNative(m):loadWeb(m,opts.device==='webgpu'?'webgpu':'wasm');
      if(wantNative)p=p.catch(function(e){ // model not supported by the native engine (tokenizer / dtype): transparently use the WebView CPU engine
        if(/Unsupported|only fp32|no KV-cache|Only byte-level/i.test(String(e.message))){console.warn('native engine cannot run this model, using WebView CPU',e.message);return loadWeb(m,'wasm')}
        throw e});
      return p.then(function(){state='ready';mark(null);try{localStorage.setItem('learn.dl.'+usedRepo,'1')}catch(e){}emit({progress:1});return m})
      .catch(function(e){mark(null);state='error';lastErr=String(e&&e.message||e);if(!useNative)killWorker();
        var cleanup=hadFlag?Promise.resolve():LLM.purgeRepo(usedRepo);
        return cleanup.then(function(){if(!hadFlag)lastErr+=' (partial files were removed)';emit();throw e})});
    },
    downloaded:function(model){var repo=typeof model==='string'&&model.indexOf('/')>0?model:LLM.repoOf(model);try{if(NATIVE&&window.Android.llmComplete(repo))return true;return localStorage.getItem('learn.dl.'+repo)==='1'}catch(e){return false}},
    unload:function(){if(useNative){try{window.Android.llmPost(JSON.stringify({type:'unload'}))}catch(e){}}killWorker();state='idle';backend=null;emit()},
    /** removes cached files of a model */
    purge:function(model){var m=resolve(model);return Promise.all([LLM.purgeRepo(m.repo)].concat(m.gguf?[LLM.purgeRepo(m.gguf.repo)]:[])).then(function(){return 0})},
    purgeRepo:function(repo){try{localStorage.removeItem('learn.dl.'+repo)}catch(e){}
      if(NATIVE){try{window.Android.llmPurge(repo)}catch(e){}}
      if(!self.caches)return Promise.resolve(0); var n=0;
      return caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.open(k).then(function(c){return c.keys().then(function(reqs){
        return Promise.all(reqs.filter(function(r){return r.url.indexOf('huggingface.co/'+repo+'/')>=0}).map(function(r){n++;return c.delete(r)}))})})}))}).then(function(){return n})},
    purgeAll:function(){var jobs=[];LLM.unload();if(NATIVE){try{window.Android.llmPurgeAll()}catch(e){}}
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
      return Promise.all([scan,est]).then(function(r){var by=r[0];
        nativeList().forEach(function(n){var e=by[n.repo]||(by[n.repo]={repo:n.repo,bytes:0,files:0});e.bytes+=n.bytes;e.files+=n.files;e.nativeDone=n.complete});
        var list=Object.keys(by).map(function(k){var e=by[k];e.complete=!!e.nativeDone||LLM.downloaded(e.repo);return e});
        list.sort(function(a,b){return b.bytes-a.bytes});return {repos:list,usage:r[1].usage||0,quota:r[1].quota||0}})},
    /** opts:{system,prompt,maxTokens,temperature,onToken,timeoutMs} -> Promise<string>. Rejects with Error('cancelled'|'timeout'|...) */
    generate:function(o){
      if(!LLM.isReady())return Promise.reject(new Error('no-model'));
      var dev=lastInfo.device||'wasm',msgs=[];
      if(o.system)msgs.push({role:'system',content:o.system});
      msgs.push({role:'user',content:o.prompt+((cur&&cur.qwen3)?' /no_think':'')});
      mark({stage:'generate',dev:dev,model:cur&&(cur.id||cur.repo)});
      var temp=o.temperature==null?0.5:o.temperature,t0=Date.now(),first=0,timer=null,cancelled=false;
      var myId=seq+1;
      var p=new Promise(function(res,rej){
        var c=call({type:'generate',msgs:msgs,max:o.maxTokens||160,temp:temp},{onToken:function(t){if(!first)first=Date.now();if(o.onToken)o.onToken(t)}});
        c.then(function(r){LLM.lastTps=r.tps||0;LLM.lastPrefillMs=r.prefillMs||0;LLM.lastPromptTokens=r.promptTokens||0;LLM.lastFirstMs=first?first-t0:0;res(clean(r.text))},rej);
        var limit=o.timeoutMs||(dev==='webgpu'?90000:useNative?120000:240000);
        function hardStop(why){ // nothing finished in time / cancel not honoured: native keeps its model, the web worker is killed so nothing stays stuck
          cancelled=true;
          if(useNative){try{window.Android.llmPost(JSON.stringify({type:'interrupt'}))}catch(e){}failAll(new Error(why))}
          else{killWorker();state='idle';backend=null;failAll(new Error(why));emit()}}
        timer=setTimeout(function(){hardStop('timeout')},limit);
        LLM._cancel=function(){cancelled=true;try{send({type:'interrupt'})}catch(e){}
          setTimeout(function(){if(calls[myId])hardStop('cancelled')},2500)};
      });
      var fin=function(){clearTimeout(timer);LLM._cancel=null;mark(null)};
      return p.then(function(t){fin();if(cancelled&&!t)throw new Error('cancelled');return t},function(e){fin();throw e});
    },
    cancel:function(){if(LLM._cancel)LLM._cancel()},
    lastTps:0,lastFirstMs:0
  };
  window.LLM=LLM;
})();

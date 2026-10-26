/* Persistent learner state. Every entry carries a timestamp so two devices can be merged (newest wins; "done" is a union). */
(function(){
  var KEY='learn.state.v1', SKEY='learn.settings.v1';
  function blank(){return {v:1,done:{},ans:{},quiz:{},tool:{},pos:{},t:0}}
  function read(k,d){try{var s=JSON.parse(localStorage.getItem(k));if(s)return s}catch(e){}return d}
  var st=read(KEY,blank()); if(!st||st.v!==1)st=blank();
  var NAT=!!(window.Android&&window.Android.llmPost);
  var set=read(SKEY,{theme:'auto',model:'qwen3-0.6b',autoload:true,device:NAT?'native':'wasm',custom:'',dev2:1});
  if(NAT&&!set.dev2){set.device='native';set.dev2=1}   // one-time move to the native engine for existing installs
  var subs=[];
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){} subs.forEach(function(f){try{f()}catch(e){}})}
  function saveSet(){try{localStorage.setItem(SKEY,JSON.stringify(set))}catch(e){}}
  var Store={
    on:function(f){subs.push(f)},
    settings:set, saveSettings:saveSet,
    isDone:function(id){return !!st.done[id]},
    markDone:function(id){if(!st.done[id]){st.done[id]=Date.now();st.t=Date.now();persist()}},
    unmarkDone:function(id){delete st.done[id];persist()},
    getAns:function(id){return st.ans[id]?st.ans[id].v:''},
    setAns:function(id,v){st.ans[id]={v:v,t:Date.now()};persist()},
    getQuiz:function(id){return st.quiz[id]?st.quiz[id].v:null},
    setQuiz:function(id,v){st.quiz[id]={v:v,t:Date.now()};persist()},
    getTool:function(k){return st.tool[k]?st.tool[k].v:null},
    setTool:function(k,v){st.tool[k]={v:v,t:Date.now()};persist()},
    getPos:function(c){return st.pos[c]||null},
    setPos:function(c,ch,pg,pid){st.pos[c]={ch:ch,pg:pg,pid:pid,t:Date.now()};persist()},
    snapshot:function(){return JSON.parse(JSON.stringify(st))},
    /** merge a remote snapshot; returns number of local entries changed */
    merge:function(r){if(!r||r.v!==1)return 0;var n=0;
      Object.keys(r.done||{}).forEach(function(k){if(!st.done[k]||st.done[k]<r.done[k]){if(!st.done[k])n++;st.done[k]=Math.max(st.done[k]||0,r.done[k])}});
      ['ans','quiz','tool','pos'].forEach(function(m){Object.keys(r[m]||{}).forEach(function(k){
        var a=st[m][k],b=r[m][k]; if(!a||(b&&b.t>a.t)){st[m][k]=b;n++}})});
      if(n){st.t=Date.now();persist()} return n},
    resetAll:function(){st=blank();persist()},
    stats:function(){return {done:Object.keys(st.done).length,ans:Object.keys(st.ans).length}}
  };
  window.Store=Store;
})();

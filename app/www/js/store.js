/* Persistent learner state. Every entry carries a timestamp so two devices can be merged (newest wins; "done" is a union). */
(function(){
  var KEY='learn.state.v1', SKEY='learn.settings.v1';
  function blank(){return {v:1,done:{},ans:{},quiz:{},tool:{},pos:{},notes:{},docs:{},act:{},t:0}}
  function read(k,d){try{var s=JSON.parse(localStorage.getItem(k));if(s)return s}catch(e){}return d}
  var st=read(KEY,blank()); if(!st||st.v!==1)st=blank(); st.notes=st.notes||{}; st.docs=st.docs||{}; st.act=st.act||{};
  var NAT=!!(window.Android&&window.Android.llmPost);
  var set=read(SKEY,{theme:'auto',model:'qwen3-0.6b',autoload:true,device:NAT?'llama':'wasm',custom:'',dev3:1,aiMode:'standard',feedbackBasis:'model',aiModes:[]});
  if(NAT&&!set.dev3){set.device='llama';set.dev3=1}   // one-time move to the native engine for existing installs
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
    /* highlights & notes: entries {id,course,cid,pid,type:'hl'|'note',segs,text,note,c,u}; deletes are tombstones (v:null) so they sync */
    allNotes:function(course){return Object.keys(st.notes).map(function(k){return st.notes[k].v}).filter(function(e){return e&&(!course||e.course===course)})},
    getNote:function(id){return st.notes[id]?st.notes[id].v:null},
    putNote:function(e){e.u=Date.now();st.notes[e.id]={v:e,t:e.u};persist()},
    delNote:function(id){st.notes[id]={v:null,t:Date.now()};persist()},
    getDoc:function(course){return st.docs[course]?st.docs[course].v:null},
    setDoc:function(course,html){st.docs[course]={v:{html:html},t:Date.now()};persist()},
    /* reading activity per local day: {'2026-11-10': [pageIds read that day]} (streak + weekly badges) */
    dayKey:function(t){var d=t?new Date(t):new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)},
    logRead:function(pid){var k=Store.dayKey(),a=(st.act[k]&&st.act[k].v)||[];if(a.indexOf(pid)<0){a=a.concat([pid]);st.act[k]={v:a,t:Date.now()};persist()}
      try{if(window.Android&&Android.markReadToday)Android.markReadToday(k)}catch(e){}},
    readOn:function(k){return ((st.act[k]&&st.act[k].v)||[]).length},
    activity:function(){
      if(!st.actSeeded){st.actSeeded=1;Object.keys(st.done).forEach(function(pid){var k=Store.dayKey(st.done[pid]),a=(st.act[k]&&st.act[k].v)||[];if(a.indexOf(pid)<0){a.push(pid);st.act[k]={v:a,t:st.done[pid]}}});persist()}
      return st.act},
    snapshot:function(){return JSON.parse(JSON.stringify(st))},
    /** merge a remote snapshot; returns number of local entries changed */
    merge:function(r){if(!r||r.v!==1)return 0;var n=0;
      Object.keys(r.done||{}).forEach(function(k){if(!st.done[k]||st.done[k]<r.done[k]){if(!st.done[k])n++;st.done[k]=Math.max(st.done[k]||0,r.done[k])}});
      Object.keys(r.act||{}).forEach(function(d){var a=(st.act[d]&&st.act[d].v)||[],b=(r.act[d]&&r.act[d].v)||[],u=a.slice();b.forEach(function(x){if(u.indexOf(x)<0)u.push(x)});if(u.length>a.length){st.act[d]={v:u,t:Date.now()};n++}});
      ['ans','quiz','tool','pos','notes','docs'].forEach(function(m){Object.keys(r[m]||{}).forEach(function(k){
        var a=st[m][k],b=r[m][k]; if(!a||(b&&b.t>a.t)){st[m][k]=b;n++}})});
      if(n){st.t=Date.now();persist()} return n},
    resetAll:function(){st=blank();persist()},
    stats:function(){return {done:Object.keys(st.done).length,ans:Object.keys(st.ans).length,notes:Store.allNotes().length}}
  };
  window.Store=Store;
})();

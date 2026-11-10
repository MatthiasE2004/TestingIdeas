/* AI behaviour: response modes, course/notes retrieval and prompt building (sized for a small ~2K-token on-device model) */
(function(){
  var h=H.h;
  /* ---------------- modes: two independent sets, 'grade' (activity feedback) and 'chat' (questions, AI chat, writing help) ---------------- */
  var BUILTIN={
    chat:[
      {id:'auto',name:'Auto',builtin:true,length:'medium',instructions:'Adapt to the request: answer simple questions in 1-3 sentences, give more detail and an example when asked to explain.'},
      {id:'extended',name:'Extended',builtin:true,length:'long',instructions:'Give a fuller, step-by-step explanation with a concrete example. Use up to 8 sentences.'},
      {id:'critical',name:'Critical',builtin:true,length:'medium',instructions:'Focus on improvements: point out weaknesses, gaps and mistakes and say exactly how to fix them. Do not praise unless it is deserved.'}],
    grade:[
      {id:'standard',name:'Standard',builtin:true,length:'short',instructions:'Be concise and friendly. Use at most 3 short sentences.'},
      {id:'extended',name:'Extended',builtin:true,length:'long',instructions:'Explain in more depth what is right and what is missing, with a short example of a better answer. Up to 7 sentences.'},
      {id:'critical',name:'Critical',builtin:true,length:'medium',instructions:'Grade strictly. Focus on what is missing or wrong and exactly how to improve it. Only praise what is clearly correct.'}]};
  var KEYS={chat:{list:'aiModes',active:'aiMode',edits:'aiModeEdits',def:'auto'},grade:{list:'aiGradeModes',active:'aiGradeMode',edits:'aiGradeModeEdits',def:'standard'}};
  var TOKENS={short:130,medium:220,long:340};
  function sc(scope){return scope==='grade'?'grade':'chat'}
  var Modes={
    list:function(scope){scope=sc(scope);var k=KEYS[scope],S=Store.settings,u=(S[k.list]||[]).filter(function(m){return m&&m.id}),over=S[k.edits]||{};
      return BUILTIN[scope].map(function(b){return Object.assign({},b,over[b.id]||{})}).concat(u)},
    get:function(id,scope){var l=Modes.list(scope);return l.filter(function(m){return m.id===id})[0]||l[0]},
    active:function(scope){scope=sc(scope);var id=Store.settings[KEYS[scope].active]||KEYS[scope].def;if(scope==='chat'&&id==='standard')id='auto';return Modes.get(id,scope)},
    setActive:function(id,scope){Store.settings[KEYS[sc(scope)].active]=id;Store.saveSettings()},
    add:function(name,instructions,length,scope){var k=KEYS[sc(scope)],m={id:'m'+Date.now().toString(36),name:name.trim()||'My mode',instructions:instructions.trim(),length:length||'medium'};
      Store.settings[k.list]=(Store.settings[k.list]||[]).concat([m]);Store.saveSettings();return m},
    update:function(id,patch,scope){var k=KEYS[sc(scope)],l=Store.settings[k.list]||[],i=l.map(function(m){return m.id}).indexOf(id);
      if(i>=0){l[i]=Object.assign({},l[i],patch)}else{Store.settings[k.edits]=Store.settings[k.edits]||{};Store.settings[k.edits][id]=Object.assign({},Store.settings[k.edits][id]||{},patch)}
      Store.saveSettings()},
    reset:function(id,scope){var k=KEYS[sc(scope)];if(Store.settings[k.edits])delete Store.settings[k.edits][id];Store.saveSettings()},
    remove:function(id,scope){var k=KEYS[sc(scope)];Store.settings[k.list]=(Store.settings[k.list]||[]).filter(function(m){return m.id!==id});
      if(Store.settings[k.active]===id)Store.settings[k.active]=k.def;Store.saveSettings()},
    tokens:function(m,min){return Math.max(min||0,TOKENS[(m||Modes.active()).length]||200)},
    basis:function(){return Store.settings.feedbackBasis||'model'},
    setBasis:function(b){Store.settings.feedbackBasis=b;Store.saveSettings()},
    gradeCommand:function(){return (Store.settings.gradeCommand||'').trim()},
    setGradeCommand:function(t){Store.settings.gradeCommand=t;Store.saveSettings()}
  };

  /* ---------------- course text + retrieval ---------------- */
  function blockText(b){
    switch(b.t){
      case 'h':case 'p':return b.text;
      case 'ul':case 'ol':return b.items.join('. ');
      case 'callout':return (b.title?b.title+': ':'')+b.text;
      case 'quote':return b.text;
      case 'table':return b.head.join(' | ')+'. '+b.rows.map(function(r){return r.join(' | ')}).join('. ');
      case 'video':return (b.title||'')+'. '+(b.note||'');
      case 'flash':return b.cards.map(function(c){return c.front+': '+c.back}).join('. ');
      case 'activity':return b.prompt+(b.model?' Answer: '+b.model:'');
      case 'quiz':return b.q+' '+(Array.isArray(b.answer)?b.answer:[b.answer]).map(function(i){return b.options[i]}).join(', ')+(b.explain?'. '+b.explain:'');
      case 'tf':return b.q+' '+(b.answer?'True':'False')+(b.explain?'. '+b.explain:'');
    }return ''}
  function plain(s){return String(s).replace(/\*\*|\*/g,'').replace(/\s+/g,' ').trim()}
  var STOP={the:1,a:1,an:1,and:1,or:1,of:1,to:1,in:1,on:1,for:1,is:1,are:1,was:1,be:1,what:1,how:1,why:1,does:1,do:1,it:1,this:1,that:1,with:1,as:1,by:1,at:1,from:1,about:1,me:1,my:1,i:1,you:1,can:1,explain:1,tell:1};
  function terms(s){return String(s).toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(function(w){return w.length>2&&!STOP[w]}).map(function(w){return w.replace(/(ing|ed|es|s)$/,'')})}
  var idx={};
  function index(course){
    if(idx[course.id])return idx[course.id];
    var docs=[],df={};
    course.chapters.forEach(function(ch,ci){ch.pages.forEach(function(pg,pi){
      var text=plain([pg.title].concat(pg.blocks.map(blockText)).join('. '));
      var tf={};terms(text).forEach(function(t){tf[t]=(tf[t]||0)+1});
      var tt={};terms(pg.title).forEach(function(t){tt[t]=1});
      Object.keys(tf).forEach(function(t){df[t]=(df[t]||0)+1});
      docs.push({ci:ci,pi:pi,id:pg.id,title:pg.title,chapter:ch.title,text:text,tf:tf,tt:tt})})});
    return idx[course.id]={docs:docs,df:df,N:docs.length};
  }
  var Retriever={
    pageText:function(course,pid){var d=index(course).docs.filter(function(x){return x.id===pid})[0];return d?d.text:''},
    /** top-k pages for a query -> [{title,chapter,text}] */
    top:function(course,query,k){
      var ix=index(course),q=terms(query);if(!q.length)return [];
      var sc=ix.docs.map(function(d){var s=0;q.forEach(function(t){if(d.tf[t]){s+=(1+Math.log(d.tf[t]))*Math.log(1+ix.N/(ix.df[t]||1))}if(d.tt[t])s+=2});return {d:d,s:s}})
        .filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s}).slice(0,k||3);
      return sc.map(function(x){return x.d})},
    /** the best-matching passage inside a page text (sentence window) */
    passage:function(text,query,chars){
      if(text.length<=chars)return text;var q=terms(query),sents=text.split(/(?<=[.!?])\s+/),best=0,bi=0;
      sents.forEach(function(s,i){var ts=terms(s),sc=0;q.forEach(function(t){if(ts.indexOf(t)>=0)sc++});if(sc>best){best=sc;bi=i}});
      var out='',i=bi;while(i<sents.length&&out.length+sents[i].length<chars){out+=(out?' ':'')+sents[i];i++}
      return out||text.slice(0,chars)}
  };
  function clip(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s}

  /* ---------------- prompt building ---------------- */
  function sys(extra,scope){var m=Modes.active(scope);return 'You are a helpful study tutor for an online course. '+m.instructions+(extra?' '+extra:'')}
  var Prompts={
    sys:sys,
    /** course material for a question: [{title,text}] -> text block within a char budget */
    courseContext:function(course,query,chars,opts){
      opts=opts||{};var parts=[],left=chars;
      if(opts.pid){var cur=Retriever.pageText(course,opts.pid);if(cur){var t=Retriever.passage(cur,query,Math.min(left,opts.curChars||900));parts.push('[Current page] '+t);left-=t.length}}
      Retriever.top(course,query,4).forEach(function(d){if(left<200||d.id===opts.pid)return;var t=Retriever.passage(d.text,query,Math.min(left,700));parts.push('['+d.title+'] '+t);left-=t.length});
      return parts.join('\n')},
    notesContext:function(course,query,chars){
      var q=terms(query),list=Store.allNotes(course.id).map(function(e){var tx=(e.note?e.note+' ':'')+e.text,ts=terms(tx),s=0;q.forEach(function(t){if(ts.indexOf(t)>=0)s++});return {e:e,s:s,tx:tx}})
        .sort(function(a,b){return b.s-a.s||b.e.u-a.e.u}).slice(0,5),out=[],left=chars;
      list.forEach(function(x){if(left<60)return;var t=clip((x.e.type==='note'?'My note: '+x.e.note+' (about "'+clip(x.e.text,100)+'")':'I highlighted: '+clip(x.e.text,200)),Math.min(left,260));out.push('- '+t);left-=t.length});
      var d=Store.getDoc(course.id);if(d&&d.html&&left>150){var tmp=document.createElement('div');tmp.innerHTML=d.html;var tx=plain(tmp.innerText||tmp.textContent);if(tx)out.push('My document: '+Retriever.passage(tx,query,Math.min(left,500)))}
      return out.join('\n')},
    feedback:function(o){ // activity feedback with the active mode and basis
      var basis=Modes.basis(),parts=['Question: '+clip(o.question,280)];
      if(basis!=='course'&&(o.points||[]).length)parts.push('Ideas a complete answer should cover:\n'+o.points.slice(0,4).map(function(p){return '- '+p}).join('\n'));
      if(basis!=='model'&&o.course)parts.push('Course material:\n'+Prompts.courseContext(o.course,o.question+' '+o.answer,1500,{pid:o.pid,curChars:700}));
      if(basis==='model'&&o.model&&(o.points||[]).length<2)parts.push('Model answer: '+clip(o.model,400));
      parts.push('Student\'s answer: "'+clip(o.answer,500)+'"');parts.push('Write your feedback now.');
      var cmd=Modes.gradeCommand();
      return {system:sys("Never repeat the student's answer. Speak to the student as 'you'. First say what the student got right, then what is missing or wrong.",'grade')+(basis==='course'?' Judge the answer using the course material.':'')+(cmd?' Extra instruction from the student: '+cmd:''),
        prompt:parts.join('\n\n'),maxTokens:Modes.tokens(Modes.active('grade'),110)}},
    ask:function(o){ // o:{question,course,pid,selection,useCourse,useNotes,history}
      var parts=[];
      if(o.selection)parts.push('Selected text: "'+clip(o.selection,600)+'"');
      if(o.useCourse&&o.course){var c=Prompts.courseContext(o.course,(o.selection||'')+' '+o.question,o.selection?1400:1900,{pid:o.pid,curChars:o.selection?1000:700});if(c)parts.push('Course material:\n'+c)}
      if(o.useNotes&&o.course){var n=Prompts.notesContext(o.course,(o.selection||'')+' '+o.question,700);if(n)parts.push('My notes:\n'+n)}
      if(o.history&&o.history.length)parts.push('Earlier in this chat:\n'+o.history.slice(-2).map(function(m){return (m.role==='user'?'Me: ':'You: ')+clip(m.text,260)}).join('\n'));
      parts.push((o.selection?'Task about the selected text: ':'Question: ')+o.question);
      return {system:sys(o.general?'Answer from your general knowledge.':'Use the provided course material and notes when they are relevant. If they do not contain the answer, say so briefly instead of inventing facts.','chat'),prompt:parts.join('\n\n'),maxTokens:Modes.tokens(Modes.active('chat'),160)}},
    transform:function(kind,text,instr){
      var task={rewrite:'Rewrite the text so it is clearer and better written. Keep the meaning.',shorten:'Shorten the text to its essentials.',expand:'Expand the text with a little more detail.',fix:'Fix spelling and grammar only.',summarize:'Summarize the text in 2-3 sentences.',combine:'Combine the separate pieces of text below into one coherent paragraph. Keep all important points. Do not add new facts.',custom:instr||'Improve the text.'}[kind]||instr;
      return {system:'You are a careful writing assistant. '+Modes.active('chat').instructions+' Output only the resulting text, no preface or explanation.',prompt:task+'\n\nText:\n"""\n'+clip(text,1800)+'\n"""',maxTokens:Modes.tokens(Modes.active('chat'),200)}}
  };
  window.Modes=Modes;window.Retriever=Retriever;window.Prompts=Prompts;window.clipText=clip;window.plainText=plain;

  /* ---------------- reusable UI: mode manager + chips ---------------- */
  var LEN=[['short','Short'],['medium','Medium'],['long','Long']];
  window.ModesUI={
    chips:function(onChange,scope){scope=sc(scope);
      var box=h('div',{class:'row'});
      function draw(){box.innerHTML='';Modes.list(scope).forEach(function(m){box.appendChild(h('button',{class:'chip'+(Modes.active(scope).id===m.id?' on':''),onclick:function(){Modes.setActive(m.id,scope);draw();onChange&&onChange(m)}},m.name))})}
      draw();return box},
    basisToggle:function(onChange){
      var box=h('div',{class:'row'});
      function draw(){box.innerHTML='';[['model','Model answer'],['course','Course content'],['both','Both']].forEach(function(o){box.appendChild(h('button',{class:'chip'+(Modes.basis()===o[0]?' on':''),onclick:function(){Modes.setBasis(o[0]);draw();onChange&&onChange(o[0])}},o[1]))})}
      draw();return box},
    /** list of modes with Use / Edit / Delete + "Add my own mode" form */
    manager:function(onChange,scope){scope=sc(scope);
      var box=h('div');
      function form(m){
        var name=h('input',{class:'input',placeholder:scope==='grade'?'Mode name, e.g. Exam marker':'Mode name, e.g. Exam coach',value:m?m.name:''}),ins=h('textarea',{class:'textarea',style:{minHeight:'80px'},placeholder:scope==='grade'?'Instructions, e.g. Mark like a strict examiner and give a score out of 10.':'Instructions, e.g. Explain like I am 12 and end with one follow-up question.'});ins.value=m?m.instructions:'';
        var len=m?m.length:'medium',lenRow=h('div',{class:'row'});
        function drawLen(){lenRow.innerHTML='';lenRow.appendChild(h('span',{class:'tiny muted'},'Answer length:'));LEN.forEach(function(l){lenRow.appendChild(h('button',{class:'chip'+(len===l[0]?' on':''),onclick:function(){len=l[0];drawLen()}},l[1]))})}drawLen();
        return h('div',{class:'card flat',style:{marginTop:'8px'}},name,h('div',{style:{height:'8px'}}),ins,h('div',{style:{height:'8px'}}),lenRow,
          h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn primary sm',onclick:function(){if(!ins.value.trim()){H.toast('Write some instructions');return}
            if(m){Modes.update(m.id,{name:name.value||m.name,instructions:ins.value,length:len},scope)}else{var nm=Modes.add(name.value,ins.value,len,scope);Modes.setActive(nm.id,scope)}draw();onChange&&onChange()}},m?'Save':'Add mode'),
            m&&m.builtin?h('button',{class:'btn ghost sm',onclick:function(){Modes.reset(m.id,scope);draw();onChange&&onChange()}},'Reset to default'):null,
            h('button',{class:'btn ghost sm',onclick:draw},'Cancel')))}
      function draw(){box.innerHTML='';
        Modes.list(scope).forEach(function(m){
          var act=Modes.active(scope).id===m.id;
          var row=h('div',{class:'model-row',style:{alignItems:'flex-start'}},h('div',{style:{flex:1,minWidth:0}},h('b',{style:{fontWeight:500}},m.name),m.builtin?h('span',{class:'label',style:{marginLeft:'8px'}},'built-in'):null,act?h('span',{class:'label',style:{marginLeft:'8px',color:'var(--green)'}},'active'):null,h('div',{class:'tiny muted'},clipText(m.instructions,160))),
            h('div',{class:'row',style:{gap:'6px',flexShrink:0}},!act?h('button',{class:'btn sm',onclick:function(){Modes.setActive(m.id,scope);draw();onChange&&onChange()}},'Use'):null,
              h('button',{class:'btn ghost sm',onclick:function(){row.replaceWith(form(m))}},'Edit'),
              m.builtin?null:h('button',{class:'btn ghost sm',onclick:function(){if(confirm('Delete the mode "'+m.name+'"?')){Modes.remove(m.id,scope);draw();onChange&&onChange()}}},'Delete')));
          box.appendChild(row)});
        var add=h('button',{class:'btn sm primary',style:{marginTop:'12px'},onclick:function(){add.replaceWith(form(null))}},'+ Add my own mode');box.appendChild(add)}
      draw();return box}
  };
})();

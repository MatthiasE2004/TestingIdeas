/* Notes UI: notes/highlights tree + side panel, Notes home, general document editor, AI chat page */
(function(){
  var h=H.h,A=function(){return window.__app};
  function icon(n,px){return h('span',{html:Dot.icon(n,px),style:{display:'inline-flex'}})}
  function homeBtn(){return h('button',{class:'round','aria-label':'Home',onclick:function(){A().go('#/')},html:Dot.icon('home')})}
  function loadAll(){return Promise.all(A().index().map(function(i){return A().loadCourse(i.id)}))}
  function esc(s){return H.esc(s)}

  /* ================= tree of notes: chapter > page title > entry ================= */
  var openState={};   // expansion survives re-renders: key -> true
  function entrySnippet(e){return e.type==='note'?e.note:e.text}
  /** opts:{mode:'jump'|'insert', filter:'all'|'hl'|'note', query, picked:{}, onJump(e,ci,pi), onInsert(e), onChange()} */
  function tree(course,opts){
    var box=h('div',{class:'ntree'}),all=Store.allNotes(course.id),q=(opts.query||'').toLowerCase();
    var list=all.filter(function(e){if(opts.filter==='hl'&&e.type!=='hl')return false;if(opts.filter==='note'&&e.type!=='note')return false;
      return !q||(e.text+' '+e.note+' '+e.title).toLowerCase().indexOf(q)>=0});
    if(!list.length){box.appendChild(h('p',{class:'muted',style:{padding:'8px 4px'}},all.length?'Nothing matches this filter.':'No highlights or notes yet. Press and hold a word in the course, drag the handles, then choose Highlight or Note.'));return box}
    function key(){return [course.id].concat([].slice.call(arguments)).join('|')}
    function chev(open){return h('span',{class:'chev'+(open?' open':''),html:Dot.icon('next',16)})}
    course.chapters.forEach(function(ch,ci){
      var inCh=list.filter(function(e){return e.cid===ch.id});if(!inCh.length)return;
      var ck=key('c',ch.id),cOpen=opts.query?true:!!openState[ck];
      var cn=inCh.filter(function(e){return e.type==='note'}).length,chh=inCh.length-cn;
      var cWrap=h('div',{class:'nch'}),cHead=h('div',{class:'nrow ch',onclick:function(){openState[ck]=!openState[ck];opts.onChange()}},chev(cOpen),h('div',{class:'ttl'},(ci+1)+'. '+ch.title),counts(chh,cn));
      cWrap.appendChild(cHead);
      if(cOpen)ch.pages.forEach(function(pg,pi){
        var inPg=inCh.filter(function(e){return e.pid===pg.id});if(!inPg.length)return;
        var pk=key('p',pg.id),pOpen=opts.query?true:!!openState[pk],pn=inPg.filter(function(e){return e.type==='note'}).length;
        var pWrap=h('div',{class:'npg'}),pHead=h('div',{class:'nrow pg',onclick:function(){openState[pk]=!openState[pk];opts.onChange()}},chev(pOpen),h('div',{class:'ttl'},pg.title),counts(inPg.length-pn,pn));
        pWrap.appendChild(pHead);
        if(pOpen)inPg.sort(function(a,b){return a.c-b.c}).forEach(function(e){
          var ek=key('e',e.id),eOpen=!!openState[ek],picked=opts.picked&&opts.picked[e.id];
          var row=h('div',{class:'nent '+(e.type==='note'?'note':'hl')+(picked?' picked':'')});
          var head=h('div',{class:'nrow en',onclick:function(){openState[ek]=!openState[ek];opts.onChange()}},chev(eOpen),h('div',{class:'snip'},clipText(entrySnippet(e),eOpen?400:110)));
          if(opts.mode==='insert')head.insertBefore(h('input',{type:'checkbox',class:'pick',checked:picked?true:null,onclick:function(ev){ev.stopPropagation()},onchange:function(ev){opts.picked[e.id]=ev.target.checked?e:null;opts.onChange(true)}}),head.firstChild);
          row.appendChild(head);
          if(eOpen){var full=h('div',{class:'nfull'});
            if(e.type==='note')full.appendChild(h('div',{class:'nnote'},e.note));
            full.appendChild(h('div',{class:'nquote'},'“'+e.text+'”'));
            var acts=h('div',{class:'row',style:{gap:'6px',marginTop:'8px'}});
            if(opts.mode==='insert')acts.appendChild(h('button',{class:'btn sm primary',onclick:function(){opts.onInsert(e)}},'Insert in document'));
            acts.appendChild(h('button',{class:'btn sm',onclick:function(){opts.onJump(e,ci,pi)}},opts.mode==='insert'?'Open page':'Open in course'));
            acts.appendChild(h('button',{class:'btn sm ghost',onclick:function(){NoteSheet(e,function(t){e.note=t;e.type=t?'note':'hl';Notes.save(e);opts.onChange()},function(){Notes.remove(e.id);opts.onChange()})}},e.type==='note'?'Edit note':'Add note'));
            acts.appendChild(h('button',{class:'btn sm ghost',onclick:function(){if(confirm('Delete this '+(e.type==='note'?'note':'highlight')+'?')){Notes.remove(e.id);opts.onChange()}}},'Delete'));
            full.appendChild(acts);row.appendChild(full)}
          pWrap.appendChild(row)});
        cWrap.appendChild(pWrap)});
      box.appendChild(cWrap)});
    function counts(hl,n){return h('div',{class:'cnts'},hl?h('span',{class:'cb hl'},String(hl)):null,n?h('span',{class:'cb note'},String(n)):null)}
    return box}
  function setAll(course,open){Store.allNotes(course.id).forEach(function(e){openState[[course.id,'c',e.cid].join('|')]=open;openState[[course.id,'p',e.pid].join('|')]=open})}

  /* ================= full-screen side panel ================= */
  var panelEl=null;
  function closePanel(){if(!panelEl)return;var p=panelEl;panelEl=null;p.classList.remove('in');setTimeout(function(){p.remove()},220)}
  /** o:{course, mode:'jump'|'insert', onJump(e,ci,pi), onInsert(e), onCombine(entries), title} */
  function openPanel(o){
    closePanel();
    var state={filter:'all',query:'',picked:{}},body=h('div',{class:'panel-body'}),tools=h('div');
    var p=h('div',{class:'panel'},h('div',{class:'panel-scrim',onclick:closePanel}),
      h('div',{class:'panel-in'},h('div',{class:'panel-head'},h('button',{class:'round','aria-label':'Close',onclick:closePanel,html:Dot.icon('back')}),h('div',{style:{flex:1}},h('div',{class:'label'},o.course.title),h('div',{style:{fontWeight:500}},o.title||'Highlights & notes')),
        h('button',{class:'btn sm',onclick:function(){setAll(o.course,true);draw()}},'Expand'),h('button',{class:'btn sm ghost',onclick:function(){setAll(o.course,false);draw()}},'Collapse')),tools,body));
    function draw(keepScroll){
      var all=Store.allNotes(o.course.id),nn=all.filter(function(e){return e.type==='note'}).length;
      tools.innerHTML='';
      var f=h('div',{class:'row',style:{padding:'8px 16px 0'}});[['all','All ('+all.length+')'],['hl','Highlights ('+(all.length-nn)+')'],['note','Notes ('+nn+')']].forEach(function(x){f.appendChild(h('button',{class:'chip'+(state.filter===x[0]?' on':''),onclick:function(){state.filter=x[0];draw()}},x[1]))});
      var s=h('input',{class:'input',placeholder:'Search notes...',value:state.query,style:{margin:'8px 16px 0',width:'calc(100% - 32px)'}});s.addEventListener('input',function(){state.query=s.value;drawBody()});
      tools.appendChild(f);tools.appendChild(s);
      if(o.mode==='insert'){var cnt=Object.keys(state.picked).filter(function(k){return state.picked[k]}).length;
        tools.appendChild(h('div',{class:'row',style:{padding:'8px 16px 0'}},h('button',{class:'btn sm primary',disabled:cnt<1,onclick:function(){var es=Object.keys(state.picked).map(function(k){return state.picked[k]}).filter(Boolean);closePanel();o.onInsert(es)}},'Insert '+cnt+' selected'),
          h('button',{class:'btn sm',disabled:cnt<2,onclick:function(){var es=Object.keys(state.picked).map(function(k){return state.picked[k]}).filter(Boolean);closePanel();o.onCombine(es)}},'Combine '+cnt+' with AI')))}
      drawBody()}
    function drawBody(){var sc=body.scrollTop;body.innerHTML='';body.appendChild(tree(o.course,{mode:o.mode||'jump',filter:state.filter,query:state.query,picked:state.picked,
      onJump:function(e,ci,pi){closePanel();o.onJump(e,ci,pi)},onInsert:function(e){closePanel();o.onInsert([e])},onChange:function(pickOnly){if(pickOnly)draw();else drawBody()}}));body.scrollTop=sc}
    document.body.appendChild(p);draw();requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('in')})});panelEl=p}

  /* ================= Notes home ================= */
  function viewNotesHome(root){
    root.appendChild(h('div',{class:'topbar'},homeBtn(),h('div',{html:Dot.text('NOTES',{size:5}),style:{width:'150px'}}),h('span',{style:{width:'46px'}})));
    var list=h('div');root.appendChild(list);
    function draw(){list.innerHTML='';loadAll().then(function(cs){cs.forEach(function(c){
      var all=Store.allNotes(c.id),nn=all.filter(function(e){return e.type==='note'}).length,doc=Store.getDoc(c.id),docWords=0;
      if(doc&&doc.html){var t=document.createElement('div');t.innerHTML=doc.html;docWords=(t.textContent.trim().match(/\S+/g)||[]).length}
      var card=h('div',{class:'card'},h('div',{class:'label'},c.subtitle),h('h2',{style:{margin:'2px 0 6px'}},c.title),
        h('div',{class:'row',style:{margin:'0 0 12px'}},h('span',{class:'cb hl'},String(all.length-nn)),h('span',{class:'tiny muted'},'highlights'),h('span',{class:'cb note',style:{marginLeft:'8px'}},String(nn)),h('span',{class:'tiny muted'},'notes'),h('span',{class:'tiny muted',style:{marginLeft:'8px'}},'· document: '+(docWords?docWords+' words':'empty'))),
        h('div',{class:'row'},h('button',{class:'btn primary',onclick:function(){var pos=localStorage.getItem('learn.nvpos.'+c.id);var target=pos||(function(){var e=all.slice().sort(function(a,b){return a.c-b.c})[0];if(e){for(var ci=0;ci<c.chapters.length;ci++){var pi=c.chapters[ci].pages.map(function(p){return p.id}).indexOf(e.pid);if(pi>=0)return ci+'/'+pi}}return '0/0'})();A().go('#/n/'+c.id+'/'+target)}},'Notes viewer'),
          h('button',{class:'btn ghost',onclick:function(){A().go('#/doc/'+c.id)}},'General document')));
      var tw=h('div',{style:{marginTop:'12px'}}),shown=false,tb=h('button',{class:'btn ghost sm',onclick:function(){shown=!shown;tb.textContent=shown?'Hide all notes':'Show all notes ('+all.length+')';drawT()}},'Show all notes ('+all.length+')');
      function drawT(){tw.innerHTML='';if(shown)tw.appendChild(tree(c,{mode:'jump',filter:'all',query:'',onJump:function(e,ci,pi){A().go('#/n/'+c.id+'/'+ci+'/'+pi+'?e='+e.id)},onChange:function(){drawT();}}))}
      card.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},tb,all.length?h('button',{class:'btn ghost sm',onclick:function(){openPanel({course:c,mode:'jump',onJump:function(e,ci,pi){A().go('#/n/'+c.id+'/'+ci+'/'+pi+'?e='+e.id)}})}},'Open as panel'):null));card.appendChild(tw);list.appendChild(card)})})}
    draw()}

  /* ================= general document ================= */
  function sanitize(html){
    var t=document.createElement('template');t.innerHTML=html;
    t.content.querySelectorAll('script,style,iframe,object,embed,link,meta,form,input,button,img,svg').forEach(function(n){n.remove()});
    t.content.querySelectorAll('*').forEach(function(n){[].slice.call(n.attributes).forEach(function(a){if(/^on/i.test(a.name)||a.name==='style'||/javascript:/i.test(a.value))n.removeAttribute(a.name)})});
    return t.innerHTML}
  function viewDoc(root,courseId){
    A().loadCourse(courseId).then(function(c){
      var tbOpen=localStorage.getItem('learn.doc.tb')!=='0',saved=null,timer=null;
      var ed=h('div',{class:'doc-ed',contenteditable:'true',spellcheck:'true','data-ph':'Write your own thoughts about this course...'});
      var d=Store.getDoc(c.id);ed.innerHTML=d&&d.html?sanitize(d.html):'<div><br></div>';
      try{document.execCommand('defaultParagraphSeparator',false,'div')}catch(e){}
      var status=h('span',{class:'tiny muted'},'Saved');
      function empty(){var e=!ed.textContent.trim()&&!ed.querySelector('li,blockquote,h1,h2,h3');ed.classList.toggle('is-empty',e)}
      function save(){empty();status.textContent='Saving...';clearTimeout(timer);timer=setTimeout(function(){Store.setDoc(c.id,ed.innerHTML);status.textContent='Saved'},500)}
      function cmd(c1,v){ed.focus();document.execCommand(c1,false,v||null);save();refreshState()}
      function block(tag){ed.focus();document.execCommand('formatBlock',false,tag);save();refreshState()}
      var tb=h('div',{class:'doc-tb'+(tbOpen?'':' hide')}),btns={};
      function tbtn(id,label,fn,title){var b=h('button',{class:'tbb','aria-label':title||label,title:title||label,onmousedown:function(e){e.preventDefault()},ontouchstart:function(e){e.preventDefault();fn()},onclick:fn},label);btns[id]=b;tb.appendChild(b)}
      tbtn('h1','H1',function(){block('h1')},'Heading 1');tbtn('h2','H2',function(){block('h2')},'Heading 2');tbtn('h3','H3',function(){block('h3')},'Heading 3');tbtn('p','¶',function(){block('p')},'Normal text');
      tb.appendChild(h('span',{class:'tsep'}));tbtn('b','B',function(){cmd('bold')},'Bold');tbtn('i','I',function(){cmd('italic')},'Italic');tbtn('u','U',function(){cmd('underline')},'Underline');
      tb.appendChild(h('span',{class:'tsep'}));tbtn('ul','• List',function(){cmd('insertUnorderedList')},'Bullet list');tbtn('ol','1. List',function(){cmd('insertOrderedList')},'Numbered list');
      tb.appendChild(h('span',{class:'tsep'}));tbtn('undo','↶',function(){cmd('undo')},'Undo');tbtn('redo','↷',function(){cmd('redo')},'Redo');
      btns.b.style.fontWeight='700';btns.u.style.textDecoration='underline';btns.i.style.fontStyle='italic';
      function refreshState(){['bold','italic','underline','insertUnorderedList','insertOrderedList'].forEach(function(k,i){var id=['b','i','u','ul','ol'][i];try{btns[id].classList.toggle('on',document.queryCommandState(k))}catch(e){}});
        var fb='';try{fb=document.queryCommandValue('formatBlock')}catch(e){}fb=String(fb).toLowerCase();['h1','h2','h3','p'].forEach(function(t){btns[t].classList.toggle('on',fb===t)})}
      /* automatic lists: "- " or "* " -> bullets, "1. " -> numbered; Enter continues, Enter on an empty item ends the list (native behaviour) */
      ed.addEventListener('input',function(){
        var sel=getSelection();if(sel.rangeCount&&sel.isCollapsed){var n=sel.anchorNode,blk=n&&(n.nodeType===3?n.parentElement:n);
          while(blk&&blk!==ed&&blk.parentElement!==ed&&!/^(P|DIV|H1|H2|H3|LI)$/.test(blk.tagName))blk=blk.parentElement;
          if(blk&&blk!==ed&&blk.tagName!=='LI'&&!blk.closest('li')){var tx=blk.textContent;
            if(/^[-*•][\s ]$/.test(tx)){blk.innerHTML='<br>';var r=document.createRange();r.setStart(blk,0);r.collapse(true);sel.removeAllRanges();sel.addRange(r);document.execCommand('insertUnorderedList')}
            else if(/^\d{1,3}[.)][\s ]$/.test(tx)){blk.innerHTML='<br>';var r2=document.createRange();r2.setStart(blk,0);r2.collapse(true);sel.removeAllRanges();sel.addRange(r2);document.execCommand('insertOrderedList')}}}
        save()});
      empty();document.addEventListener('selectionchange',onSel);
      function onSel(){var s=getSelection();if(!s.rangeCount||!ed.contains(s.anchorNode)){return}saved=s.getRangeAt(0).cloneRange();refreshState();aiBarUpdate()}
      /* ---------- AI actions on the selection ---------- */
      var result=h('div',{class:'doc-res hide'}),aiBar=h('div',{class:'doc-ai'});
      function selText(){return saved&&!saved.collapsed?saved.toString().trim():''}
      function aiBarUpdate(){var has=!!selText();aiBar.classList.toggle('has',has)}
      function runAI(kind,text){
        if(!AI.available()){result.classList.remove('hide');result.innerHTML='';result.appendChild(h('div',null,'No AI model is loaded. Open Settings > Local AI to download and select one.'));result.appendChild(h('button',{class:'btn sm',onclick:function(){A().go('#/settings')}},'Open settings'));return}
        result.classList.remove('hide');result.innerHTML='';var tx=h('div',{class:'t',style:{whiteSpace:'pre-wrap'}},'Thinking...'),t0=Date.now(),got=false;
        var tick=setInterval(function(){if(!got)tx.textContent='Thinking... '+Math.round((Date.now()-t0)/1000)+' s'},1000);
        var cancel=h('button',{class:'btn sm ghost',onclick:function(){LLM.cancel()}},'Cancel');
        result.appendChild(h('div',{class:'label'},'AI · '+Modes.active().name+' mode'));result.appendChild(tx);result.appendChild(cancel);
        var p=Prompts.transform(kind,text);
        AI.ask({system:p.system,prompt:p.prompt,maxTokens:p.maxTokens,temperature:0,onToken:function(t){got=true;tx.textContent=t}}).then(function(t){clearInterval(tick);cancel.remove();tx.textContent=t;
          var acts=h('div',{class:'row',style:{marginTop:'10px'}});
          if(saved&&!saved.collapsed&&kind!=='combine')acts.appendChild(h('button',{class:'btn sm primary',onclick:function(){restore();document.execCommand('insertText',false,t);save();result.classList.add('hide')}},'Replace selection'));
          acts.appendChild(h('button',{class:'btn sm '+(kind==='combine'?'primary':''),onclick:function(){insertHTML('<p>'+esc(t).replace(/\n+/g,'</p><p>')+'</p>');result.classList.add('hide')}},'Insert below'));
          acts.appendChild(h('button',{class:'btn sm ghost',onclick:function(){try{navigator.clipboard.writeText(t);H.toast('Copied')}catch(e){}}},'Copy'));
          acts.appendChild(h('button',{class:'btn sm ghost',onclick:function(){result.classList.add('hide')}},'Discard'));result.appendChild(acts)},
          function(e){clearInterval(tick);cancel.remove();tx.textContent=e.message==='timeout'?'The AI took too long.':e.message==='cancelled'?'Cancelled.':'AI error: '+e.message})}
      function restore(){ed.focus();if(saved){var s=getSelection();s.removeAllRanges();s.addRange(saved)}}
      function insertHTML(html){ // at the saved caret, else at the end
        if(!saved||!ed.contains(saved.endContainer)){var r=document.createRange();r.selectNodeContents(ed);r.collapse(false);saved=r}
        else{var r2=saved.cloneRange();r2.collapse(false);saved=r2}
        // move caret after the current block so inserted block elements do not split a list item
        var blk=saved.endContainer.nodeType===3?saved.endContainer.parentElement:saved.endContainer;while(blk&&blk!==ed&&blk.parentElement!==ed)blk=blk.parentElement;
        if(blk&&blk!==ed){var r3=document.createRange();r3.setStartAfter(blk);r3.collapse(true);saved=r3}
        restore();document.execCommand('insertHTML',false,sanitize(html));save()}
      function mk(label,kind,cls){return h('button',{class:'btn sm '+(cls||''),onmousedown:function(e){e.preventDefault()},ontouchstart:function(e){e.preventDefault()},onclick:function(){var t=selText();if(!t){H.toast('Select some text in the document first');return}runAI(kind,t)}},label)}
      aiBar.appendChild(h('div',{class:'row',style:{gap:'6px',flexWrap:'wrap'}},h('span',{class:'label',style:{alignSelf:'center'}},'AI on selection'),mk('Rewrite','rewrite'),mk('Shorten','shorten'),mk('Expand','expand'),mk('Fix grammar','fix'),mk('Summarize','summarize'),
        h('button',{class:'btn sm',onmousedown:function(e){e.preventDefault()},onclick:function(){var t=selText();if(!t){H.toast('Select some text first');return}AskSheet.open({course:c,pid:null,selection:t,onSaveNote:function(a){insertHTML('<p>'+esc(a).replace(/\n+/g,'</p><p>')+'</p>')}})}},'Ask about it')));
      aiBar.appendChild(h('div',{class:'row',style:{marginTop:'6px',alignItems:'center'}},h('span',{class:'tiny muted'},'Mode:'),ModesUI.chips(null,'chat')));
      /* ---------- side panel: import highlights / notes ---------- */
      function importPanel(){
        function quote(e){return '<blockquote>'+esc(e.text)+'</blockquote>'+(e.type==='note'?'<p>'+esc(e.note).replace(/\n/g,'<br>')+'</p>':'')}
        openPanel({course:c,mode:'insert',title:'Insert into document',onJump:function(e,ci,pi){A().go('#/n/'+c.id+'/'+ci+'/'+pi+'?e='+e.id)},
          onInsert:function(es){insertHTML(es.map(quote).join(''));H.toast('Inserted')},
          onCombine:function(es){var text=es.map(function(e){return e.text+(e.type==='note'?' (my note: '+e.note+')':'')}).join('\n---\n');saved=null;runAI('combine',text)}})}
      var topbar=h('div',{class:'topbar'},homeBtn(),h('div',{style:{flex:1,minWidth:0,textAlign:'center'}},h('div',{class:'label'},c.title),h('div',{style:{fontWeight:500}},'General document')),
        h('div',{class:'row',style:{gap:'8px',flexWrap:'nowrap'}},h('button',{class:'round','aria-label':'Show or hide formatting',title:'Formatting',onclick:function(){tbOpen=!tbOpen;tb.classList.toggle('hide',!tbOpen);try{localStorage.setItem('learn.doc.tb',tbOpen?'1':'0')}catch(e){}},html:'<span style="font-weight:700;font-family:serif">Aa</span>'}),
          h('button',{class:'round','aria-label':'Highlights and notes',title:'Highlights & notes',onclick:importPanel,html:Dot.icon('list')})));
      root.appendChild(topbar);root.appendChild(tb);root.appendChild(h('div',{class:'doc-wrap'},ed));root.appendChild(result);
      root.appendChild(h('div',{class:'doc-foot'},aiBar,h('div',{class:'row between',style:{marginTop:'8px'}},status,h('div',{class:'row'},h('button',{class:'btn sm',onclick:importPanel},'Insert notes'),h('button',{class:'btn sm primary',onclick:function(){A().go('#/ai/'+c.id)}},'Ask AI about the course')))));
      root.__cleanup=function(){document.removeEventListener('selectionchange',onSel);Store.setDoc(c.id,ed.innerHTML)}})}

  /* ================= AI chat page ================= */
  function viewAI(root,courseId){
    A().loadCourse(courseId).then(function(c0){
      var cur=c0,useCourse=true,useNotes=true,msgs=[],busy=false;
      function key(){return 'learn.chat.'+cur.id}
      function loadMsgs(){try{msgs=JSON.parse(localStorage.getItem(key()))||[]}catch(e){msgs=[]}}
      function saveMsgs(){try{localStorage.setItem(key(),JSON.stringify(msgs.slice(-30)))}catch(e){}}
      loadMsgs();
      var log=h('div',{class:'chat-log'}),inp=h('textarea',{class:'textarea chat-in',rows:'1',placeholder:'Ask about the course or your notes...'}),send=h('button',{class:'btn primary',onclick:function(){go()}},'Send'),
        ctxBox=h('div'),manage=h('div',{class:'hide card flat'}),stat=h('div',{class:'tiny muted'});
      function drawCtx(){ctxBox.innerHTML='';
        var cr=h('div',{class:'row'});A().index().forEach(function(i){cr.appendChild(h('button',{class:'chip'+(cur.id===i.id?' on':''),onclick:function(){A().loadCourse(i.id).then(function(c){cur=c;loadMsgs();drawCtx();drawLog()})}},i.title))});
        ctxBox.appendChild(cr);
        ctxBox.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},h('span',{class:'tiny muted'},'Use as context:'),
          h('button',{class:'chip'+(useCourse?' on':''),onclick:function(){useCourse=!useCourse;drawCtx()}},'Course content'),h('button',{class:'chip'+(useNotes?' on':''),onclick:function(){useNotes=!useNotes;drawCtx()}},'My notes & document')));
        ctxBox.appendChild(h('div',{class:'row',style:{marginTop:'8px',alignItems:'center'}},h('span',{class:'tiny muted'},'Mode:'),ModesUI.chips(null,'chat'),h('button',{class:'btn sm ghost',onclick:function(){manage.classList.toggle('hide');if(!manage.classList.contains('hide')){manage.innerHTML='';manage.appendChild(h('div',{class:'label',style:{marginBottom:'6px'}},'Your AI modes'));manage.appendChild(ModesUI.manager(function(){drawCtx()},'chat'))}}},'Edit modes')));
        stat.textContent=AI.available()?'Model: '+(LLM.status().model?LLM.status().model.name:'')+' · '+(LLM.status().backend||''):'No AI model loaded - open Settings > Local AI.'}
      function drawLog(){log.innerHTML='';
        if(!msgs.length)log.appendChild(h('div',{class:'muted',style:{padding:'20px 4px'}},'Ask a question about '+cur.title+'. The AI looks up the most relevant course pages'+(useNotes?' and your notes':'')+' and answers from them. Try: “What is the difference between a project and operations?”'));
        msgs.forEach(function(m,i){var b=h('div',{class:'bub '+m.role},h('div',{style:{whiteSpace:'pre-wrap'}},m.text));
          if(m.src&&m.src.length)b.appendChild(h('div',{class:'row',style:{marginTop:'8px',gap:'6px'}},h('span',{class:'tiny muted'},'Sources:'),m.src.map(function(s){return h('button',{class:'chip',style:{fontSize:'.75rem',padding:'3px 10px'},onclick:function(){A().go('#/n/'+cur.id+'/'+s.ci+'/'+s.pi)}},clipText(s.title,34))})));
          if(m.role==='ai')b.appendChild(h('div',{class:'row',style:{marginTop:'6px',gap:'6px'}},h('button',{class:'btn sm ghost',onclick:function(){try{navigator.clipboard.writeText(m.text);H.toast('Copied')}catch(e){}}},'Copy'),h('button',{class:'btn sm ghost',onclick:function(){var d=Store.getDoc(cur.id);Store.setDoc(cur.id,(d&&d.html?d.html:'')+'<p>'+esc(m.text).replace(/\n+/g,'</p><p>')+'</p>');H.toast('Added to your document')}},'Add to document')));
          log.appendChild(b)});
        window.scrollTo(0,document.body.scrollHeight)}
      function go(){
        var q=inp.value.trim();if(!q||busy)return;
        if(!AI.available()){H.toast('Load a model first (Settings > Local AI)');return}
        inp.value='';busy=true;send.disabled=true;msgs.push({role:'user',text:q});var m={role:'ai',text:'Thinking...',src:[]};msgs.push(m);drawLog();
        var p=Prompts.ask({question:q,course:cur,pid:null,selection:'',useCourse:useCourse,useNotes:useNotes,history:msgs.slice(0,-2)});
        var srcs=useCourse?Retriever.top(cur,q,3).map(function(d){return {ci:d.ci,pi:d.pi,title:d.title}}):[];
        var t0=Date.now(),got=false,tick=setInterval(function(){if(!got){m.text='Thinking... '+Math.round((Date.now()-t0)/1000)+' s';drawLogLast()}},1000);
        send.textContent='Stop';send.disabled=false;send.onclick=function(){LLM.cancel()};
        AI.ask({system:p.system,prompt:p.prompt,maxTokens:p.maxTokens,temperature:0,onToken:function(t){got=true;m.text=t;drawLogLast()}}).then(function(t){m.text=t||'(no answer)';m.src=srcs;fin()},function(e){m.text=e.message==='cancelled'?'Stopped.':e.message==='timeout'?'The AI took too long.':'AI error: '+e.message;fin()});
        function fin(){clearInterval(tick);busy=false;send.textContent='Send';send.onclick=function(){go()};saveMsgs();drawLog()}}
      function drawLogLast(){var bs=log.querySelectorAll('.bub.ai');if(bs.length){bs[bs.length-1].firstChild.textContent=msgs[msgs.length-1].text;window.scrollTo(0,document.body.scrollHeight)}}
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});
      root.appendChild(h('div',{class:'topbar'},homeBtn(),h('div',{html:Dot.text('AI',{size:5}),style:{width:'60px'}}),h('button',{class:'round',onclick:function(){A().go('#/settings')},html:Dot.icon('gear')})));
      root.appendChild(h('div',{class:'card'},ctxBox,manage,stat));root.appendChild(log);
      root.appendChild(h('div',{class:'chat-bar'},h('div',{class:'row',style:{flexWrap:'nowrap',alignItems:'flex-end'}},inp,send,h('button',{class:'btn ghost sm',title:'Clear chat',onclick:function(){if(confirm('Clear this chat?')){msgs=[];saveMsgs();drawLog()}}},'Clear'))));
      drawCtx();drawLog()})}

  window.NotesUI={viewNotesHome:viewNotesHome,viewDoc:viewDoc,viewAI:viewAI,openPanel:openPanel,closePanel:closePanel,tree:tree,icon:icon};
})();

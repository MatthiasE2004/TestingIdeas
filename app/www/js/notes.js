/* Highlights & notes: anchoring, painting, custom touch selection (long-press, drag handles), action bar, popovers and the Ask-AI sheet. */
(function(){
  var h=H.h;
  function uid(){return 'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function offsetIn(el,node,off){var r=document.createRange();r.setStart(el,0);r.setEnd(node,off);return r.toString().length}

  /* ---------------- data + painting ---------------- */
  function wrap(el,s,e,id,cls){
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),pos=0,n,jobs=[];
    while((n=w.nextNode())){var len=n.nodeValue.length,a=pos,b=pos+len;pos=b;if(b<=s)continue;if(a>=e)break;jobs.push([n,Math.max(s,a)-a,Math.min(e,b)-a])}
    jobs.forEach(function(j){var mid=j[0],from=j[1],to=j[2];if(to<=from)return;if(from>0)mid=mid.splitText(from);if(to-from<mid.nodeValue.length)mid.splitText(to-from);
      var sp=document.createElement('span');sp.className='mk '+cls;sp.setAttribute('data-id',id);mid.parentNode.insertBefore(sp,mid);sp.appendChild(mid)})}
  function unpaint(root){root.querySelectorAll('[data-img].mk-img').forEach(function(f){f.classList.remove('mk-img','hl','note');f.removeAttribute('data-id')});
    root.querySelectorAll('span.mk').forEach(function(m){var p=m.parentNode;while(m.firstChild)p.insertBefore(m.firstChild,m);p.removeChild(m);p.normalize()})}
  var Notes={
    uid:uid,
    forPage:function(course,pid){return Store.allNotes(course).filter(function(e){return e.pid===pid})},
    paint:function(root,course,pid){unpaint(root);
      Notes.forPage(course,pid).sort(function(a,b){return a.c-b.c}).forEach(function(e){(e.segs||[]).forEach(function(sg){
        if(sg.img){var f=root.querySelector('[data-img="'+sg.k+'"]');if(f){f.classList.add('mk-img',e.type==='note'?'note':'hl');f.setAttribute('data-id',e.id)}return}
        var el=root.querySelector('[data-sel="'+sg.k+'"]');if(!el)return;
        if(sg.t&&el.textContent.slice(sg.s,sg.e)!==sg.t)return;   // content changed since: skip rather than mis-highlight
        wrap(el,sg.s,sg.e,e.id,e.type==='note'?'note':'hl')})})},
    create:function(ctx,type,segs,text,note){var e={id:uid(),course:ctx.course.id,cid:ctx.cid,pid:ctx.pid,title:ctx.title||'',type:type,segs:segs,text:text,note:note||'',c:Date.now()};Store.putNote(e);return e},
    save:function(e){Store.putNote(e)},
    remove:function(id){Store.delNote(id)},
    counts:function(course,pid){var n=0,hl=0;Notes.forPage(course,pid).forEach(function(e){if(e.type==='note')n++;else hl++});return {notes:n,hl:hl}}
  };

  /* ---------------- bottom sheet ---------------- */
  var sheetEl=null;
  function sheet(){if(sheetEl&&document.body.contains(sheetEl))return sheetEl;sheetEl=h('div',{class:'sheet hide'});document.body.appendChild(sheetEl);return sheetEl}
  var Sheet={
    show:function(node){var s=sheet();s.innerHTML='';s.appendChild(node);s.classList.remove('hide')},
    hide:function(){if(sheetEl){sheetEl.classList.add('hide');sheetEl.innerHTML=''}},
    visible:function(){return sheetEl&&!sheetEl.classList.contains('hide')}
  };

  /* ---------------- Ask-AI sheet ---------------- */
  var PRESETS=['Explain this simply','Summarize this','Give me an example','Why does this matter?'];
  var Ask={
    /** o:{course,pid,selection,onSaveNote(text)} */
    open:function(o){
      var out=h('div',{class:'ai-box hide',style:{marginTop:'10px',maxHeight:'34vh',overflow:'auto'}}),box=h('div',{class:'sheet-in'}),running=false,last='';
      var inp=h('input',{class:'input',placeholder:'Ask something about this text...'});
      function run(q){
        if(!AI.available()){out.classList.remove('hide');out.textContent='No AI model is loaded. Open Settings > Local AI, pick a model and press Download / Select.';return}
        if(running)return;running=true;out.classList.remove('hide');out.innerHTML='';var lbl=h('span',{class:'label'},'AI · '+Modes.active().name+' mode'),tx=h('span',{class:'t'},'Thinking...'),t0=Date.now(),got=false;
        var tick=setInterval(function(){if(!got)tx.textContent='Thinking... '+Math.round((Date.now()-t0)/1000)+' s'},1000);
        var cancel=h('button',{class:'btn sm',style:{marginTop:'8px',background:'#2a2a2a',color:'#fff'},onclick:function(){LLM.cancel()}},'Cancel');
        out.appendChild(lbl);out.appendChild(tx);out.appendChild(h('br'));out.appendChild(cancel);
        var p=Prompts.ask({question:q,course:o.course,pid:o.pid,selection:o.selection,useCourse:true,useNotes:true});
        AI.ask({system:p.system,prompt:p.prompt,maxTokens:p.maxTokens,temperature:0,onToken:function(t){got=true;tx.textContent=t}}).then(function(t){last=t;tx.textContent=t;finish()},function(e){tx.textContent=e.message==='timeout'?'The AI took too long.':e.message==='cancelled'?'Cancelled.':'AI error: '+e.message;finish()});
        function finish(){clearInterval(tick);running=false;cancel.remove();if(last&&o.onSaveNote){out.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},
          h('button',{class:'btn sm',style:{background:'#2a2a2a',color:'#fff'},onclick:function(){o.onSaveNote(last);H.toast('Saved as a note')}},'Save as note'),
          h('button',{class:'btn sm',style:{background:'#2a2a2a',color:'#fff'},onclick:function(){try{navigator.clipboard.writeText(last);H.toast('Copied')}catch(e){}}},'Copy')))}}}
      box.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'Ask AI about the selection'),h('button',{class:'btn sm ghost',onclick:Sheet.hide},'Close')));
      box.appendChild(h('div',{class:'sel-quote'},clipText(o.selection,220)));
      var pr=h('div',{class:'row',style:{margin:'8px 0'}});PRESETS.forEach(function(p){pr.appendChild(h('button',{class:'chip',onclick:function(){run(p)}},p))});box.appendChild(pr);
      box.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap'}},inp,h('button',{class:'btn primary sm',onclick:function(){if(inp.value.trim())run(inp.value.trim())}},'Ask')));
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&inp.value.trim())run(inp.value.trim())});
      box.appendChild(h('div',{class:'row',style:{marginTop:'8px',alignItems:'center'}},h('span',{class:'tiny muted'},'Mode:'),ModesUI.chips(null,'chat')));
      box.appendChild(out);Sheet.show(box)}
  };

  /* ---------------- note editor sheet ---------------- */
  function noteSheet(entry,onSave,onDelete){
    var ta=h('textarea',{class:'textarea',placeholder:'Write your note...',style:{minHeight:'90px'}});ta.value=entry.note||'';
    var box=h('div',{class:'sheet-in'},h('div',{class:'row between'},h('div',{class:'label'},entry.type==='note'?'Edit note':'Add a note'),h('button',{class:'btn sm ghost',onclick:Sheet.hide},'Close')),
      h('div',{class:'sel-quote'},clipText(entry.text,200)),ta,
      h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn primary sm',onclick:function(){onSave(ta.value.trim());Sheet.hide()}},'Save note'),
        onDelete?h('button',{class:'btn ghost sm',onclick:function(){onDelete();Sheet.hide()}},'Delete'):null));
    Sheet.show(box);setTimeout(function(){ta.focus()},50)}

  /* ---------------- popover when tapping a mark ---------------- */
  var popEl=null;
  function closePop(){if(popEl){popEl.remove();popEl=null}}
  function popover(mk,ctx,api){
    closePop();var id=mk.getAttribute('data-id'),e=Store.getNote(id);if(!e)return;
    var r=mk.getBoundingClientRect(),w=Math.min(340,innerWidth-24);
    popEl=h('div',{class:'mk-pop',style:{width:w+'px',left:Math.max(12,Math.min(innerWidth-w-12,r.left))+'px'}});
    if(e.type==='note')popEl.appendChild(h('div',{class:'mk-pop-note'},e.note));else popEl.appendChild(h('div',{class:'tiny muted'},'Highlight · no note yet'));
    var acts=h('div',{class:'row',style:{marginTop:'8px',gap:'6px'}});
    acts.appendChild(h('button',{class:'btn sm',onclick:function(){closePop();noteSheet(e,function(t){e.note=t;e.type=t?'note':'hl';Notes.save(e);api.refresh()},function(){Notes.remove(e.id);api.refresh()})}},e.type==='note'?'Edit':'Add note'));
    acts.appendChild(h('button',{class:'btn sm',onclick:function(){closePop();Ask.open({course:ctx.course,pid:ctx.pid,selection:e.text,onSaveNote:function(t){e.note=(e.note?e.note+'\n\n':'')+t;e.type='note';Notes.save(e);api.refresh()}})}},'Ask AI'));
    acts.appendChild(h('button',{class:'btn sm ghost',onclick:function(){closePop();Notes.remove(e.id);api.refresh()}},'Delete'));
    if(api.openNotesView)acts.appendChild(h('button',{class:'btn sm ghost',onclick:function(){closePop();api.openNotesView()}},'Notes view'));
    popEl.appendChild(acts);document.body.appendChild(popEl);
    var ph=popEl.getBoundingClientRect().height,top=r.bottom+8;if(top+ph>innerHeight-10)top=Math.max(10,r.top-ph-8);popEl.style.top=top+'px'}

  /* ---------------- selection engine ---------------- */
  var WORD=/[\p{L}\p{N}'’_-]/u;
  function caretAt(x,y){
    var r=null;
    if(document.caretPositionFromPoint){var p=document.caretPositionFromPoint(x,y);if(p&&p.offsetNode){r=document.createRange();r.setStart(p.offsetNode,p.offset);r.collapse(true)}}
    if(!r&&document.caretRangeFromPoint)r=document.caretRangeFromPoint(x,y);
    return r}
  function selEl(node){var n=node&&node.nodeType===3?node.parentElement:node;return n&&n.closest?n.closest('[data-sel]'):null}
  function wordBounds(node,off){ // -> {s,e} offsets in a text node
    var t=node.nodeValue,s=off,e=off;
    while(s>0&&WORD.test(t[s-1]))s--;while(e<t.length&&WORD.test(t[e]))e++;
    if(s===e&&off<t.length){e=off+1}   // punctuation / space: select that character
    return {s:s,e:e}}
  function cmp(a,b){ // order two {node,off}
    var r1=document.createRange();r1.setStart(a.node,a.off);r1.collapse(true);var r2=document.createRange();r2.setStart(b.node,b.off);r2.collapse(true);
    return r1.compareBoundaryPoints(Range.START_TO_START,r2)}

  /** attach(root,ctx,api) -> {destroy}. ctx:{course,cid,pid,title}; api:{refresh,openNotesView?,onSelect?} */
  function attach(root,ctx,api){
    var layer=h('div',{class:'sel-layer'}),bar=null,rects=[],hs=h('div',{class:'sel-h s'}),he=h('div',{class:'sel-h e'}),rng=null,timer=null,start=null,pressing=false,sliding=null,dragH=null,lastTouch=0,anchorWord=null;
    layer.appendChild(hs);layer.appendChild(he);document.body.appendChild(layer);root.classList.add('sel-on');
    hs.style.display=he.style.display='none';
    function pt(e){var t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;return {x:t.clientX,y:t.clientY}}
    function clear(){rng=null;rects.forEach(function(r){r.remove()});rects=[];hs.style.display=he.style.display='none';if(bar){bar.remove();bar=null}if(Sheet.visible()&&sheet().querySelector('.sel-quote')&&!sheet().querySelector('textarea'))Sheet.hide()}
    function draw(){
      rects.forEach(function(r){r.remove()});rects=[];if(!rng){return}
      var list=[].slice.call(rng.getClientRects()).filter(function(r){return r.width>0&&r.height>0});
      list.forEach(function(r){var d=h('div',{class:'sel-rect',style:{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'}});layer.insertBefore(d,hs);rects.push(d)});
      if(list.length){var a=list[0],b=list[list.length-1];hs.style.display=he.style.display='block';hs.style.left=(a.left-11)+'px';hs.style.top=(a.bottom+3)+'px';he.style.left=(b.right-11)+'px';he.style.top=(b.bottom+3)+'px'}}
    function setRange(a,b){ // a,b: {node,off}, any order
      if(cmp(a,b)>0){var t=a;a=b;b=t}
      var r=document.createRange();r.setStart(a.node,a.off);r.setEnd(b.node,b.off);rng=r;draw()}
    function pointAt(x,y){var c=caretAt(x,y);if(!c)return null;var el=selEl(c.startContainer);if(!el||!root.contains(el))return null;
      var n=c.startContainer;if(n.nodeType!==3){ // landed on an element: use its first text node
        var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),t=w.nextNode();if(!t)return null;return {node:t,off:0}}
      return {node:n,off:c.startOffset}}
    function showBar(){
      if(!rng||rng.collapsed){if(bar){bar.remove();bar=null}return}
      if(!bar){bar=h('div',{class:'sel-bar'});document.body.appendChild(bar)}
      bar.innerHTML='';
      bar.appendChild(h('button',{class:'sb hl',onclick:function(){commit('hl')}},'Highlight'));
      bar.appendChild(h('button',{class:'sb nt',onclick:function(){askNote()}},'Note'));
      bar.appendChild(h('button',{class:'sb ai',onclick:function(){var ex=extract();if(!ex)return;Ask.open({course:ctx.course,pid:ctx.pid,selection:ex.text,onSaveNote:function(t){var e=Notes.create(ctx,'note',ex.segs,ex.text,t);clear();api.refresh()}})}},'Ask AI'));
      bar.appendChild(h('button',{class:'sb x','aria-label':'Close',onclick:clear},'✕'))}
    function extract(){
      if(!rng||rng.collapsed)return null;var segs=[];
      root.querySelectorAll('[data-sel]').forEach(function(el){if(!rng.intersectsNode(el))return;
        var len=el.textContent.length,s=el.contains(rng.startContainer)?offsetIn(el,rng.startContainer,rng.startOffset):0,e=el.contains(rng.endContainer)?offsetIn(el,rng.endContainer,rng.endOffset):len;
        if(e>s)segs.push({k:el.getAttribute('data-sel'),s:s,e:e,t:el.textContent.slice(s,e)})});
      if(!segs.length)return null;
      return {segs:segs,text:segs.map(function(s){return s.t}).join(' … ').replace(/\s+/g,' ').trim().slice(0,2000)}}
    function commit(type,note){var ex=extract();if(!ex)return;Notes.create(ctx,type,ex.segs,ex.text,note);clear();api.refresh()}
    function askNote(){var ex=extract();if(!ex)return;noteSheet({type:'hl',text:ex.text,note:''},function(t){Notes.create(ctx,t?'note':'hl',ex.segs,ex.text,t);clear();api.refresh()})}
    /* --- gestures --- */
    function onDown(e){
      if(e.type==='mousedown'&&Date.now()-lastTouch<700)return;if(e.type==='touchstart')lastTouch=Date.now();
      if(e.target.closest&&(e.target.closest('.sel-h')||e.target.closest('.sel-bar')||e.target.closest('.sheet')||e.target.closest('.mk-pop')))return;
      closePop();var p=pt(e);start=p;pressing=true;sliding=null;
      var el=e.target.closest&&e.target.closest('[data-sel]');
      if(rng&&!(el)){clear()}
      if(!el)return;
      clearTimeout(timer);timer=setTimeout(function(){
        if(!pressing)return;var a=pointAt(start.x,start.y);if(!a)return;
        var wb=wordBounds(a.node,a.off);anchorWord={node:a.node,s:wb.s,e:wb.e};
        setRange({node:a.node,off:wb.s},{node:a.node,off:wb.e});sliding=true;if(navigator.vibrate)try{navigator.vibrate(15)}catch(x){}
        showBar()},450)}
    function onMove(e){
      var p=pt(e);
      if(dragH){e.preventDefault&&e.preventDefault();moveHandle(p);return}
      if(sliding){e.preventDefault&&e.preventDefault();
        var c=pointAt(p.x,p.y);if(!c)return;var wb=wordBounds(c.node,c.off),aS={node:anchorWord.node,off:anchorWord.s},aE={node:anchorWord.node,off:anchorWord.e};
        if(cmp({node:c.node,off:c.off},aS)<0)setRange({node:c.node,off:wb.s},aE);else setRange(aS,{node:c.node,off:wb.e});edgeScroll(p);return}
      if(pressing&&start&&(Math.abs(p.x-start.x)>9||Math.abs(p.y-start.y)>9)){clearTimeout(timer);pressing=false}}
    function onUp(){clearTimeout(timer);pressing=false;if(sliding){sliding=null;showBar()}if(dragH){dragH=null;showBar()}}
    function moveHandle(p){
      var c=pointAt(p.x,p.y-26);if(!c||!rng)return;
      var fixed=dragH==='s'?{node:rng.endContainer,off:rng.endOffset}:{node:rng.startContainer,off:rng.startOffset};
      var was=dragH,moving={node:c.node,off:c.off};setRange(fixed,moving);
      dragH=cmp(moving,fixed)<0?'s':'e';edgeScroll(p)}
    var scrolling=0;
    function edgeScroll(p){if(scrolling)return;var d=p.y>innerHeight-130?14:p.y<130?-14:0;if(!d)return;scrolling=1;window.scrollBy(0,d);setTimeout(function(){scrolling=0;draw()},16)}
    [hs,he].forEach(function(el){var begin=function(e){e.preventDefault();e.stopPropagation();dragH=el===hs?'s':'e'};el.addEventListener('touchstart',begin,{passive:false});el.addEventListener('mousedown',begin)});
    root.addEventListener('touchstart',onDown,{passive:true});root.addEventListener('mousedown',onDown);
    document.addEventListener('touchmove',onMove,{passive:false});document.addEventListener('mousemove',onMove);
    document.addEventListener('touchend',onUp);document.addEventListener('mouseup',onUp);document.addEventListener('touchcancel',onUp);
    root.addEventListener('contextmenu',function(e){e.preventDefault()});
    var onScroll=function(){if(rng)draw();closePop()};window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);
    root.addEventListener('click',function(e){var mk=e.target.closest&&e.target.closest('.mk');if(mk&&!rng){e.stopPropagation();popover(mk,ctx,api)}else if(!mk)closePop()});
    return {destroy:function(){clear();closePop();layer.remove();window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);document.removeEventListener('touchmove',onMove);document.removeEventListener('mousemove',onMove);document.removeEventListener('touchend',onUp);document.removeEventListener('mouseup',onUp);document.removeEventListener('touchcancel',onUp)},
      selection:function(){return extract()},clear:clear}
  }
  window.Notes=Notes;window.Sel={attach:attach};window.Sheet=Sheet;window.AskSheet=Ask;window.NoteSheet=noteSheet;
})();

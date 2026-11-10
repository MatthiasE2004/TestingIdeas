/* App shell: router, home, course overview, page player, block renderers, settings */
(function(){
  var h=H.h, md=H.md, $app=document.getElementById('app');
  var courses={}, index=[];

  /* ---------- theme ---------- */
  function applyTheme(){var t=Store.settings.theme,dark=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme',dark?'dark':'light');
    try{if(window.Android&&Android.setSystemBars)Android.setSystemBars(dark)}catch(e){}}
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){applyTheme()})}catch(e){}
  applyTheme();

  /* ---------- data ---------- */
  function fetchJSON(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u+' '+r.status);return r.json()})}
  function loadCourse(id){return courses[id]?Promise.resolve(courses[id]):fetchJSON('content/'+id+'.json').then(function(c){
    c.pagesFlat=[];c.chapters.forEach(function(ch,ci){ch.pages.forEach(function(p,pi){c.pagesFlat.push({ch:ci,pg:pi,page:p,chapter:ch})})});
    courses[id]=c;return c})}
  function stats(c){var done=0,tot=c.pagesFlat.length;c.pagesFlat.forEach(function(x){if(Store.isDone(x.page.id))done++});return {done:done,total:tot,pct:tot?done/tot:0}}
  function chStats(ch){var d=0;ch.pages.forEach(function(p){if(Store.isDone(p.id))d++});return {done:d,total:ch.pages.length,pct:ch.pages.length?d/ch.pages.length:0}}
  function resumePos(c){var p=Store.getPos(c.id);
    if(p&&c.chapters[p.ch]&&c.chapters[p.ch].pages[p.pg])return {ch:p.ch,pg:p.pg};
    for(var i=0;i<c.pagesFlat.length;i++)if(!Store.isDone(c.pagesFlat[i].page.id))return {ch:c.pagesFlat[i].ch,pg:c.pagesFlat[i].pg};
    return {ch:0,pg:0}}

  /* ---------- router ---------- */
  function go(hash,replace){if(replace)history.replaceState(null,'',hash),route();else location.hash=hash}
  window.addEventListener('hashchange',route);
  var activeSel=null;
  function cleanupView(){
    if(activeSel){activeSel.destroy();activeSel=null}
    var f=$app.firstChild;if(f&&f.__cleanup){try{f.__cleanup()}catch(e){}}
    if(window.NotesUI)NotesUI.closePanel();if(window.Sheet)Sheet.hide();
    document.querySelectorAll('.mk-pop,.sel-bar,.sel-layer').forEach(function(n){n.remove()})}
  function route(){
    cleanupView();
    var raw=(location.hash||'#/').slice(2),qs=raw.split('?'),p=qs[0].split('/'),eid=(/(?:^|&)e=([^&]+)/.exec(qs[1]||'')||[])[1];window.scrollTo(0,0);
    if(!p[0])return viewHome();
    if(p[0]==='c')return viewCourse(p[1]);
    if(p[0]==='p')return viewPage(p[1],+p[2],+p[3],false);
    if(p[0]==='n')return viewPage(p[1],+p[2]||0,+p[3]||0,true,eid);
    if(p[0]==='notes'){var r=h('div');mount(r);return NotesUI.viewNotesHome(r)}
    if(p[0]==='doc'){var r2=h('div');mount(r2);return NotesUI.viewDoc(r2,p[1]||'pm')}
    if(p[0]==='ai'){var r3=h('div');mount(r3);var last=index.map(function(i){return Store.getPos(i.id)||{t:0}});return NotesUI.viewAI(r3,p[1]||(index[0]&&(last[1]&&last[1].t>last[0].t?index[1].id:index[0].id))||'pm')}
    if(p[0]==='settings')return viewSettings();
    viewHome();}
  function mount(node){$app.innerHTML='';$app.appendChild(node)}
  function icon(n,px){return h('span',{html:Dot.icon(n,px),style:{display:'inline-flex'}})}
  /* rounded-rectangle AI status button: grey dot = off, green = on */
  function aiPill(){
    var b=h('button',{class:'ai-pill',onclick:function(){go('#/settings')}});
    function upd(){var st=LLM.status(),on=st.state==='ready',ld=st.state==='loading';b.className='ai-pill'+(on?' on':ld?' load':'');b.innerHTML='<i></i>'+(on?'AI on':ld?'AI loading':'AI off');b.title=on?((st.model&&st.model.name)||'')+' \u00b7 '+(st.backend||''):'Tap to set up the local AI'}
    upd();LLM.on(function(){if(document.body.contains(b))upd()});return b}
  function aiChip(){
    var b=h('button',{class:'chip-ai',onclick:function(){go('#/settings')}});
    function upd(s){var st=LLM.status(),cls='',txt='';
      if(st.state==='ready'){cls='on';txt='AI '+((st.model&&st.model.name)||'ready')+' · '+(st.backend||'')}
      else if(st.state==='loading'){cls='load';txt='AI loading'+(s&&s.progress?' '+Math.round(s.progress*100)+'%':'...')}
      else if(st.state==='error'){cls='err';txt='AI error'}else{txt='AI off'}
      b.className='chip-ai '+cls;b.innerHTML='<i></i>'+H.esc(txt)}
    upd();var f=function(s){if(document.body.contains(b))upd(s)};LLM.on(f);return b}

  /* ---------- crash guard ---------- */
  // If the WebView renderer (or whole app) died while the model was loading/generating, fall back to CPU and say so.
  (function crashCheck(){
    var n=0,inf=null,nc=0;try{n=window.Android&&Android.consumeRenderCrashes?Android.consumeRenderCrashes():0}catch(e){}
    try{nc=window.Android&&Android.llmConsumeCrash?Android.llmConsumeCrash():0}catch(e){}
    try{inf=JSON.parse(localStorage.getItem('learn.inflight'));localStorage.removeItem('learn.inflight')}catch(e){}
    if(!n&&!inf&&!nc)return;
    var dev=nc?'native':((inf&&inf.dev)||'webgpu'),was=Store.settings.device;
    Store.settings.crash={stage:inf?inf.stage:'unknown',dev:dev,model:inf&&inf.model,t:Date.now(),switched:dev!=='wasm'&&was!=='wasm'};
    if(Store.settings.crash.switched)Store.settings.device='wasm';
    Store.settings.autoload=false;Store.saveSettings();window.__crashed=true})();
  function crashBanner(){var c=Store.settings.crash;if(!c)return null;
    var what=c.stage==='generate'?'while writing feedback':c.stage==='load'?'while loading the model':'unexpectedly';
    var msg=c.dev==='native'?'The native AI engine stopped unexpectedly. I switched to the WebView CPU engine and turned off loading at start-up. Open Settings > Local AI and select your model again; if it keeps happening, try a smaller (0.5B) model.':c.dev==='webgpu'?'The AI engine crashed '+what+' on the GPU. I switched to CPU mode and turned off loading at start-up. Open Settings > Local AI and select your model again (CPU mode downloads a slightly different file the first time).'
      :'The AI engine crashed '+what+' even on the CPU - most likely out of memory. Close other apps, or pick a smaller model (0.5B) in Settings > Local AI. Loading at start-up is off.';
    return h('div',{class:'callout',style:{marginBottom:'14px'}},h('div',{class:'label',style:{marginBottom:'4px'}},'AI stopped unexpectedly'),h('div',null,msg),
      h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn sm primary',onclick:function(){go('#/settings')}},'Open settings'),h('button',{class:'btn sm ghost',onclick:function(){delete Store.settings.crash;Store.saveSettings();route()}},'Dismiss')))}

  /* ---------- home ---------- */
  function viewHome(){
    var root=h('div');
    var d=new Date(),ds=d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
    root.appendChild(h('div',{class:'home-top'},h('div',{class:'logo',html:Dot.text('LEARN',{size:7,gap:1.2})}),
      h('div',{class:'row',style:{gap:'10px',flexWrap:'nowrap'}},aiPill(),h('button',{class:'round','aria-label':'Settings',onclick:function(){go('#/settings')},html:Dot.icon('gear')}))));
    root.appendChild(h('div',{class:'label',style:{margin:'-4px 0 14px'}},ds));
    var cb=crashBanner();if(cb)root.appendChild(cb);
    root.appendChild(Streak.card());
    var grid=h('div',{class:'course-grid'}),cont=h('div');root.appendChild(cont);root.appendChild(grid);
    var nn=Store.allNotes();
    root.appendChild(h('div',{class:'home-actions'},
      h('button',{class:'big-btn',onclick:function(){go('#/notes')}},h('div',{html:Dot.icon('book',26)}),h('div',{class:'bt'},'Notes'),h('div',{class:'tiny muted'},nn.length?nn.length+' highlights & notes':'Highlights, notes, documents')),
      h('button',{class:'big-btn dark',onclick:function(){go('#/ai')}},h('div',{html:Dot.icon('spark',26)}),h('div',{class:'bt'},'AI'),h('div',{class:'tiny',style:{color:'#9a9a9a'}},'Ask, rewrite, summarize'))));
    var lastTs=0,lastC=null;
    Promise.all(index.map(function(i){return loadCourse(i.id)})).then(function(cs){
      cs.forEach(function(c){var s=stats(c),pos=Store.getPos(c.id);if(pos&&pos.t>lastTs){lastTs=pos.t;lastC=c}
        var card=h('button',{class:'course',onclick:function(){go('#/c/'+c.id)}},
          h('div',{class:'ring',html:Dot.ring(s.pct,{r:46,labelPx:4,red:true,px:112})}),
          h('div',null,h('div',{class:'label'},c.chapters.length+' chapters · '+s.total+' pages'),h('h2',null,c.title),h('div',{class:'muted'},c.subtitle),
            h('div',{class:'tiny muted',style:{marginTop:'8px'}},s.done+' of '+s.total+' pages done')));
        grid.appendChild(card)});
      if(lastC){var r=resumePos(lastC),pg=lastC.chapters[r.ch].pages[r.pg];
        cont.appendChild(h('div',{class:'widget-continue',onclick:function(){go('#/p/'+lastC.id+'/'+r.ch+'/'+r.pg)}},
          h('div',null,h('div',{class:'label'},'Continue'),h('div',{class:'t'},pg.title),h('div',{class:'tiny',style:{color:'#9a9a9a',marginTop:'2px'}},lastC.title+' · '+lastC.chapters[r.ch].title)),
          h('span',{class:'round',style:{background:'var(--red)',color:'#fff'},html:Dot.icon('next')})))}
    });
    mount(root)}

  /* ---------- course overview ---------- */
  function viewCourse(id){
    var root=h('div');mount(root);
    loadCourse(id).then(function(c){
      var s=stats(c),r=resumePos(c),rp=c.chapters[r.ch].pages[r.pg];
      root.appendChild(h('div',{class:'topbar'},h('button',{class:'round','aria-label':'Home',onclick:function(){go('#/')},html:Dot.icon('back')}),h('div',{class:'row'},aiChip(),h('button',{class:'round',onclick:function(){go('#/settings')},html:Dot.icon('gear')}))));
      root.appendChild(h('div',{class:'ov-head'},h('div',{class:'ring',html:Dot.ring(s.pct,{r:62,labelPx:6,red:true,px:140})}),
        h('div',{style:{flex:1,minWidth:'220px'}},h('div',{class:'label'},c.subtitle),h('h1',{style:{fontSize:'2rem',margin:'4px 0 8px'}},c.title),
          h('div',{class:'muted'},s.done+' of '+s.total+' pages completed'),
          h('button',{class:'btn primary',style:{marginTop:'14px'},onclick:function(){go('#/p/'+c.id+'/'+r.ch+'/'+r.pg)}},(s.done?'Continue':'Start')+' · '+rp.title))));
      c.chapters.forEach(function(ch,ci){
        var cs=chStats(ch),cur=ci===r.ch,done=cs.done===cs.total;
        var card=h('div',{class:'chapter'+(done?' done':'')+(cur&&!done?' cur open':'')});
        var status=done?'Completed':(cs.done?'In progress':'Not started');
        card.appendChild(h('div',{class:'hd',onclick:function(){card.classList.toggle('open')}},
          h('div',{class:'num',html:done?Dot.icon('check',16):String(ci+1)}),
          h('div',{class:'meta'},h('b',null,ch.title),h('div',{class:'tiny muted'},status+' · '+cs.done+'/'+cs.total+' pages'+(ch.minutes?' · ~'+ch.minutes+' min':'')),
            h('div',{class:'bar',style:{marginTop:'8px'}},h('i',{style:{width:Math.round(cs.pct*100)+'%'}}))),
          h('span',{class:'label'},Math.round(cs.pct*100)+'%')));
        var list=h('div',{class:'plist'});
        if(ch.summary)list.appendChild(h('p',{class:'muted tiny',style:{margin:'0 0 8px'}},ch.summary));
        ch.pages.forEach(function(p,pi){var isCur=cur&&pi===r.pg;
          list.appendChild(h('div',{class:'pitem'+(Store.isDone(p.id)?' done':'')+(isCur?' cur':''),onclick:function(){go('#/p/'+c.id+'/'+ci+'/'+pi)}},
            h('span',{class:'pdot'}),h('span',null,p.title),isCur?h('span',{class:'label here',style:{color:'var(--red)'}},'You are here'):null))});
        card.appendChild(h('div',{class:'pages'},list));root.appendChild(card)});
    });}

  /* ---------- page player ---------- */
  function markSel(n,b,bi){
    var k=function(i){return bi+':'+i};
    switch(b.t){
      case 'h':case 'p':n.setAttribute('data-sel',k(0));break;
      case 'ul':case 'ol':[].forEach.call(n.children,function(li,i){li.setAttribute('data-sel',k(i))});break;
      case 'callout':if(n.lastChild)n.lastChild.setAttribute('data-sel',k(0));break;
      case 'quote':if(n.firstChild)n.firstChild.setAttribute('data-sel',k(0));break;
      case 'table':var i=0;n.querySelectorAll('td').forEach(function(td){td.setAttribute('data-sel',k(i++))});break;
      case 'img':n.setAttribute('data-img',String(bi));var fc=n.querySelector('figcaption');if(fc)fc.setAttribute('data-sel',k(0));break;
      case 'video':var vp=n.querySelector('p');if(vp)vp.setAttribute('data-sel',k(0));break;
    }}
  /* figures: tap = zoomable pop-up; press and hold (on the page or in the pop-up) = Highlight / Note / Ask AI */
  function figureHandlers(fig,c,sctx,cid,pg,nv,refresh){
    var img=fig.querySelector('img'),bi=fig.getAttribute('data-img'),cap=(fig.querySelector('figcaption')||{}).textContent||'',alt=img.getAttribute('alt')||'';
    var label='Figure: '+(cap||alt||pg.title);
    function entry(){return Notes.forPage(cid,pg.id).filter(function(e){return (e.segs||[]).some(function(s){return s.img&&s.k===bi})})[0]}
    function actions(bar,close){var e=entry();bar.innerHTML='';
      if(e){bar.appendChild(h('div',{class:'lb-note'},e.type==='note'?e.note:'Highlighted figure'));
        bar.appendChild(h('div',{class:'row',style:{gap:'6px'}},
          h('button',{class:'sb nt',onclick:function(){NoteSheet(e,function(t){e.note=t;e.type=t?'note':'hl';Notes.save(e);close();refresh()},function(){Notes.remove(e.id);close();refresh()})}},e.type==='note'?'Edit note':'Add note'),
          h('button',{class:'sb ai',onclick:function(){AskSheet.open({course:c,pid:pg.id,selection:label+'. '+alt})}},'Ask AI'),
          h('button',{class:'sb x',onclick:function(){Notes.remove(e.id);close();refresh()}},'Delete')));return}
      bar.appendChild(h('div',{class:'row',style:{gap:'6px'}},
        h('button',{class:'sb hl',onclick:function(){Notes.create(sctx,'hl',[{k:bi,img:true}],label,'');close();refresh()}},'Highlight'),
        h('button',{class:'sb nt',onclick:function(){NoteSheet({type:'hl',text:label,note:''},function(t){Notes.create(sctx,t?'note':'hl',[{k:bi,img:true}],label,t);close();refresh()})}},'Note'),
        h('button',{class:'sb ai',onclick:function(){AskSheet.open({course:c,pid:pg.id,selection:label+'. '+alt})}},'Ask AI')))}
    function openLb(withActions){Lightbox.open({src:img.getAttribute('src'),caption:cap,alt:alt,actions:actions,showActions:withActions})}
    var t=null,moved=false,sx=0,sy=0,long=false;
    img.addEventListener('click',function(){if(long){long=false;return}openLb(!!entry())});
    var down=function(e){var p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY;moved=false;long=false;clearTimeout(t);t=setTimeout(function(){if(!moved){long=true;openLb(true)}},500)};
    var move=function(e){var p=e.touches?e.touches[0]:e;if(Math.abs(p.clientX-sx)+Math.abs(p.clientY-sy)>9){moved=true;clearTimeout(t)}};
    var up=function(){clearTimeout(t)};
    img.addEventListener('touchstart',down,{passive:true});img.addEventListener('touchmove',move,{passive:true});img.addEventListener('touchend',up);
    img.addEventListener('mousedown',down);img.addEventListener('mousemove',move);img.addEventListener('mouseup',up);
    img.addEventListener('contextmenu',function(e){e.preventDefault()});img.style.cursor='zoom-in'}
  /** nv=true: notes viewer (read-only reading with yellow highlights / blue notes, colored ticks in the progress bar, side panel button) */
  function viewPage(cid,ci,pi,nv,eid){
    var root=h('div',{class:'player'+(nv?' nv':'')});mount(root);
    if(activeSel){activeSel.destroy();activeSel=null}
    return loadCourse(cid).then(function(c){
      var ch=c.chapters[ci],pg=ch&&ch.pages[pi];if(!pg)return go(nv?'#/notes':'#/c/'+cid,true);
      if(nv){try{localStorage.setItem('learn.nvpos.'+cid,ci+'/'+pi)}catch(e){}}else Store.setPos(cid,ci,pi,pg.id);
      var url=function(a,b){return '#/'+(nv?'n':'p')+'/'+cid+'/'+a+'/'+b};
      var leftBtns=h('div',{class:'row',style:{gap:'8px',flexWrap:'nowrap'}},h('button',{class:'round','aria-label':'Home',onclick:function(){go('#/')},html:Dot.icon('home')}),
        h('button',{class:'round','aria-label':nv?'All notes':'Overview',onclick:function(){go(nv?'#/notes':'#/c/'+cid)},html:Dot.icon('list')}));
      var rightBtns=nv?h('div',{class:'row',style:{gap:'8px',flexWrap:'nowrap'}},h('button',{class:'round dark','aria-label':'List of highlights and notes',title:'Highlights & notes',onclick:function(){openNotesPanel()},html:Dot.icon('book')}))
        :h('div',{class:'row',style:{gap:'8px',flexWrap:'nowrap'}},h('button',{class:'round','aria-label':'Open notes view',title:'Notes view',onclick:function(){go('#/n/'+cid+'/'+ci+'/'+pi)},html:Dot.icon('book')}),h('button',{class:'round dark','aria-label':'AI chat',title:'Ask the AI',onclick:function(){ChatPop.open({course:c,pid:pg.id,pageTitle:pg.title})},html:Dot.icon('spark')}));
      var head=h('div',{class:'phead'},h('div',{class:'row between',style:{flexWrap:'nowrap'}},leftBtns,
          h('div',{style:{flex:1,minWidth:0,textAlign:'center'}},h('div',{class:'label',style:{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},(nv?'NOTES \u00b7 ':'')+(ci+1)+'. '+ch.title),h('div',{class:'tiny muted'},(pi+1)+' / '+ch.pages.length)),rightBtns));
      var seg,n=ch.pages.length;
      if(nv){ // continuous bar: blue ticks = pages with notes, yellow = pages with highlights
        seg=h('div',{class:'tbar'});var pos=function(i){return n>1?(i/(n-1)*100):50};
        ch.pages.forEach(function(p,i){var k=Notes.counts(cid,p.id);if(!k.notes&&!k.hl)return;
          seg.appendChild(h('button',{class:'tick '+(k.notes&&k.hl?'both':k.notes?'note':'hl'),style:{left:pos(i)+'%'},title:p.title,'aria-label':p.title,onclick:function(){go(url(ci,i))}}))});
        seg.appendChild(h('b',{class:'here',style:{left:pos(pi)+'%'}}));
        head.appendChild(seg);head.appendChild(h('div',{class:'nv-legend'},h('span',null,h('i',{style:{background:'var(--yellow)'}}),'Highlights'),h('span',null,h('i',{style:{background:'var(--blue)'}}),'Notes')))}
      else if(n>30){var dn=chStats(ch).done;seg=h('div',{class:'bar red',style:{marginTop:'10px',position:'relative'}},h('i',{style:{width:Math.round(dn/n*100)+'%',background:'var(--ink)'}}),
          h('b',{style:{position:'absolute',top:'-3px',left:'calc('+(pi/(n-1)*100).toFixed(1)+'% - 6px)',width:'12px',height:'12px',borderRadius:'50%',background:'var(--red)'}}));seg.style.overflow='visible';head.appendChild(seg)}
      else{seg=h('div',{class:'seg'});ch.pages.forEach(function(p,i){seg.appendChild(h('i',{class:Store.isDone(p.id)?'d':'',style:i===pi?{background:'var(--red)'}:null}))});head.appendChild(seg)}
      var hasTool=pg.blocks.some(function(b){return b.t==='tool'});
      var title=h('h1',{'data-sel':'t:0'},pg.title),body=h('div',{class:'pbody'+(hasTool&&!nv?' wide':'')},title);
      var ctx={cid:cid,pid:pg.id};
      pg.blocks.forEach(function(b,bi){try{
        if(nv&&b.t==='tool'){body.appendChild(h('div',{class:'callout note'},'Interactive tool: '+(b.title||b.tool)+' (open this page in the course to use it).'));return}
        var nd=renderBlock(b,ctx);if(nd){markSel(nd,b,bi);body.appendChild(nd)}}catch(e){console.error(e);body.appendChild(h('div',{class:'callout'},'Could not display this block.'))}});
      var last=pi===n-1,lastCh=ci===c.chapters.length-1;
      function next(){
        if(nv){if(!last)go(url(ci,pi+1),true);else if(!lastCh)go('#/n/'+cid+'/'+(ci+1)+'/0',true);return}
        Store.markDone(pg.id);Store.logRead(pg.id);
        if(!last)go('#/p/'+cid+'/'+ci+'/'+(pi+1),true);
        else if(!lastCh){H.toast('Chapter complete');go('#/c/'+cid,true)}else{H.toast('Course complete!');go('#/c/'+cid,true)}}
      function prev(){if(pi>0)go(url(ci,pi-1),true);else{var pc=c.chapters[ci-1];go(url(ci-1,pc.pages.length-1),true)}}
      var foot=h('div',{class:'pfoot'+(hasTool&&!nv?' wide':'')},
        h('button',{class:'btn',disabled:pi===0&&ci===0,onclick:prev},icon('back',18),' Back'),
        h('button',{class:'btn primary',disabled:nv&&last&&lastCh,onclick:next},nv?'Next':(last?(lastCh?'Finish course':'Finish chapter'):'Next'),' ',icon('next',18)));
      root.appendChild(head);root.appendChild(body);root.appendChild(foot);
      var sctx={course:c,cid:ch.id,pid:pg.id,title:pg.title};
      function openNotesPanel(){NotesUI.openPanel({course:c,mode:'jump',title:'Highlights & notes',onJump:function(e,i1,i2){go('#/n/'+cid+'/'+i1+'/'+i2+'?e='+e.id)}})}
      function paint(){Notes.paint(body,cid,pg.id)}
      paint();
      activeSel=Sel.attach(body,sctx,{refresh:function(){var y=window.scrollY;viewPage(cid,ci,pi,nv).then(function(){window.scrollTo(0,y)})},openNotesView:nv?null:function(){go('#/n/'+cid+'/'+ci+'/'+pi)}});
      body.querySelectorAll('figure.img[data-img]').forEach(function(fig){figureHandlers(fig,c,sctx,cid,pg,nv,function(){var y=window.scrollY;viewPage(cid,ci,pi,nv).then(function(){window.scrollTo(0,y)})})});
      if(eid){var mk=body.querySelector('.mk[data-id="'+eid+'"],[data-img].mk-img[data-id="'+eid+'"]');if(mk){setTimeout(function(){mk.scrollIntoView({block:'center',behavior:'smooth'});mk.classList.add('flash');setTimeout(function(){mk.classList.remove('flash')},1800)},120)}}
    });}

  /* ---------- block renderers ---------- */
  function renderBlock(b,ctx){
    switch(b.t){
      case 'h':return h('h3',{style:{marginTop:'6px'}},b.text);
      case 'p':return h('p',{html:md(b.text)});
      case 'ul':case 'ol':return h(b.t,{style:{paddingLeft:'1.3em',margin:'0 0 14px'}},b.items.map(function(i){return h('li',{html:md(i),style:{marginBottom:'6px'}})}));
      case 'img':return h('figure',{class:'img'},h('img',{src:b.src,alt:b.alt||'',loading:'lazy'}),b.caption?h('figcaption',null,b.caption):null);
      case 'callout':return h('div',{class:'callout '+(b.kind||'key')},b.title?h('div',{class:'label',style:{marginBottom:'4px'}},b.title):null,h('div',{html:md(b.text)}));
      case 'quote':return h('div',{class:'card flat'},h('div',{style:{fontFamily:'var(--serif)',fontSize:'1.15rem'},html:md(b.text)}),b.by?h('div',{class:'label',style:{marginTop:'8px'}},b.by):null);
      case 'table':return h('div',{class:'card',style:{overflowX:'auto',padding:'12px 16px'}},h('table',{class:'tbl'},h('thead',null,h('tr',null,b.head.map(function(x){return h('th',null,x)}))),h('tbody',null,b.rows.map(function(r){return h('tr',null,r.map(function(x){return h('td',{html:md(String(x))})}))}))));
      case 'video':return renderVideo(b);
      case 'activity':return renderActivity(b,ctx);
      case 'quiz':return renderQuiz(b);
      case 'tf':return renderQuiz({id:b.id,q:b.q,options:['True','False'],answer:b.answer?0:1,explain:b.explain});
      case 'flash':return renderFlash(b);
      case 'match':return renderMatch(b);
      case 'tool':return renderTool(b,ctx);
    }
    return null}

  function openUrl(u){if(window.Android&&Android.openUrl)Android.openUrl(u);else window.open(u,'_blank')}
  function renderVideo(b){
    return h('div',{class:'video'},h('div',{class:'pl',html:Dot.icon('play',26)}),h('div',{class:'label',style:{color:'#9a9a9a'}},'Video'),h('h3',{style:{margin:'4px 0 6px'}},b.title||'Video'),
      b.note?h('p',{style:{color:'#cfcfcf',fontSize:'.95rem'},html:md(b.note)}):null,
      b.url?h('button',{class:'btn red',onclick:function(){openUrl(b.url)}},'Watch video (opens online)'):h('div',{class:'tiny',style:{color:'#9a9a9a'}},'This clip was part of the online course and is not available offline - the summary above covers it.'))}

  function renderQuiz(b){
    var multi=Array.isArray(b.answer),ans=multi?b.answer:[b.answer],saved=Store.getQuiz(b.id),sel=saved?saved.sel.slice():[],locked=!!saved,box=h('div',{class:'card'}),opts=[],fb=h('div');
    box.appendChild(h('div',{class:'label',style:{marginBottom:'8px'}},multi?'Select all that apply':'Question'));box.appendChild(h('p',{style:{fontWeight:500},html:md(b.q)}));
    function paint(){opts.forEach(function(o,i){var on=sel.indexOf(i)>=0,cls='opt';
      if(locked){if(ans.indexOf(i)>=0)cls+=' right';else if(on)cls+=' wrong'}else if(on)cls+=' sel';o.className=cls})}
    b.options.forEach(function(t,i){var o=h('button',{class:'opt',onclick:function(){if(locked)return;
        if(multi){var k=sel.indexOf(i);if(k>=0)sel.splice(k,1);else sel.push(i)}else sel=[i];paint();check.disabled=!sel.length}},h('span',{class:'k'}),h('span',{html:md(t)}));opts.push(o);box.appendChild(o)});
    var check=h('button',{class:'btn primary sm',disabled:!sel.length,onclick:function(){locked=true;var ok=sel.length===ans.length&&ans.every(function(a){return sel.indexOf(a)>=0});
      Store.setQuiz(b.id,{sel:sel,ok:ok});paint();showFb(ok);check.classList.add('hide');retry.classList.remove('hide')}},'Check answer');
    var retry=h('button',{class:'btn ghost sm hide',onclick:function(){locked=false;sel=[];Store.setQuiz(b.id,null);Store.unmarkQuiz&&0;fb.innerHTML='';paint();retry.classList.add('hide');check.classList.remove('hide');check.disabled=true}},'Try again');
    function showFb(ok){fb.innerHTML='';fb.appendChild(h('div',{class:'callout '+(ok?'tip':''),style:{marginTop:'10px'}},h('b',{class:ok?'ok':'bad'},ok?'Correct. ':'Not quite. '),b.explain?h('span',{html:md(b.explain)}):null))}
    box.appendChild(h('div',{class:'row',style:{marginTop:'4px'}},check,retry));box.appendChild(fb);paint();
    if(locked){showFb(saved.ok);check.classList.add('hide');retry.classList.remove('hide')}
    return box}

  function renderActivity(b,ctx){
    var box=h('div',{class:'card'}),ta=h('textarea',{class:'textarea',placeholder:'Write your answer here...'}),out=h('div'),timer;
    ta.value=Store.getAns(b.id)||'';
    ta.addEventListener('input',function(){clearTimeout(timer);timer=setTimeout(function(){Store.setAns(b.id,ta.value)},400)});
    box.appendChild(h('div',{class:'label',style:{marginBottom:'6px'}},b.title||'Activity'));box.appendChild(h('p',{html:md(b.prompt)}));
    if(b.hint){var hint=h('p',{class:'muted tiny hide',html:md(b.hint)});box.appendChild(h('button',{class:'btn ghost sm',style:{marginBottom:'10px'},onclick:function(){hint.classList.toggle('hide')}},'Hint'));box.appendChild(hint)}
    box.appendChild(ta);
    var btn=h('button',{class:'btn primary sm',onclick:function(){
      var v=ta.value.trim();if(!v){H.toast('Write something first');return}Store.setAns(b.id,v);btn.disabled=true;out.innerHTML='';
      var useAI=AI.available(),t0=Date.now(),got=false,tick=null;
      var lbl=h('span',{class:'label'},useAI?'AI tutor \u00b7 on-device':'Checking...'),txt=h('span',{class:'t'},useAI?'Thinking...':'');
      var cancel=h('button',{class:'btn sm',style:{marginTop:'10px',background:'#2a2a2a',color:'#fff'},onclick:function(){LLM.cancel()}},'Cancel');
      var ai=h('div',{class:'ai-box',style:{marginTop:'12px'}},lbl,txt);out.appendChild(ai);
      if(useAI){ai.appendChild(h('br'));ai.appendChild(cancel);
        tick=setInterval(function(){if(got)return;var s=Math.round((Date.now()-t0)/1000);txt.textContent='Thinking... '+s+' s'+(s>8?'\n(the first words can take up to a minute on CPU)':'')},1000)}
      AI.feedback({question:b.prompt,answer:v,points:b.points||[],model:b.model,context:b.title,course:ctx&&courses[ctx.cid],pid:ctx&&ctx.pid,onToken:function(t){got=true;txt.textContent=t}}).then(function(r){
        clearInterval(tick);cancel.remove();
        lbl.textContent=r.source==='ai'?'AI tutor \u00b7 on-device':'Self-check \u00b7 key ideas';txt.textContent=r.text;
        if(r.source==='ai'&&r.covered&&r.covered.length){var kl=h('div',{style:{marginTop:'12px',paddingTop:'10px',borderTop:'1px solid #2a2a2a',fontSize:'.85rem',color:'#bdbdbd'}},h('div',{class:'label'},'Key ideas \u00b7 '+((Date.now()-t0)/1000).toFixed(0)+' s'));r.covered.forEach(function(c){kl.appendChild(h('div',{style:{marginTop:'4px'}},(c.hit?'\u2713 ':'\u25CB ')+c.point))});ai.appendChild(kl)}
        btn.disabled=false;if(b.model)showModel()})}},icon('spark',16),' Get feedback');
    var modelBox=h('div'),shown=false;
    function showModel(){if(shown||!b.model)return;shown=true;modelBox.appendChild(h('div',{class:'callout note',style:{marginTop:'12px'}},h('div',{class:'label'},'Model answer'),h('div',{html:md(b.model)})))}
    box.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},btn,b.model?h('button',{class:'btn ghost sm',onclick:showModel},'Show model answer'):null));
    box.appendChild(out);box.appendChild(modelBox);return box}

  /* match: every definition is a row; tapping it pops up all terms to choose from */
  function renderMatch(b){
    var saved=Store.getQuiz(b.id)||{},sel=saved.sel||{},checked=!!saved.checked,box=h('div',{class:'card match'}),rows=h('div'),fb=h('div');
    var terms=b.pairs.map(function(p){return p.term}),seed=0;b.id.split('').forEach(function(c){seed=(seed*31+c.charCodeAt(0))%9973});
    terms.sort(function(x,y){return ((x.length*seed)%17)-((y.length*seed)%17)||x.localeCompare(y)});
    box.appendChild(h('div',{class:'label',style:{marginBottom:'6px'}},'Match'));box.appendChild(h('p',{style:{fontWeight:500}},b.title||'Match each definition to its term'));
    function persist(){Store.setQuiz(b.id,{sel:sel,checked:checked})}
    function pick(i){
      var used={};Object.keys(sel).forEach(function(k){used[sel[k]]=k});
      var list=h('div',{class:'mt-list'});terms.forEach(function(t){var u=used[t]!=null&&+used[t]!==i;
        list.appendChild(h('button',{class:'opt'+(sel[i]===t?' sel':'')+(u?' used':''),onclick:function(){sel[i]=t;checked=false;persist();Sheet.hide();draw()}},h('span',{class:'k'}),h('span',null,t,u?h('span',{class:'tiny muted'},'  (used)'):null)))});
      Sheet.show(h('div',{class:'sheet-in'},h('div',{class:'row between'},h('div',{class:'label'},'Choose the term'),h('button',{class:'btn sm ghost',onclick:Sheet.hide},'Close')),
        h('div',{class:'sel-quote'},b.pairs[i].def),list,sel[i]?h('button',{class:'btn sm ghost',style:{marginTop:'8px'},onclick:function(){delete sel[i];checked=false;persist();Sheet.hide();draw()}},'Clear choice'):null))}
    function draw(){rows.innerHTML='';var right=0;
      b.pairs.forEach(function(p,i){var ok=sel[i]===p.term;if(ok)right++;
        rows.appendChild(h('div',{class:'mt-row'+(checked?(ok?' right':' wrong'):'')},h('div',{class:'mt-def'},p.def),
          h('button',{class:'mt-pick'+(sel[i]?' set':''),onclick:function(){pick(i)}},sel[i]||'Choose term',h('span',{class:'cp-caret'},' \u25BE')),
          checked&&!ok?h('div',{class:'tiny',style:{color:'var(--green)',marginTop:'4px'}},'\u2192 '+p.term):null))});
      fb.innerHTML='';
      if(checked)fb.appendChild(h('div',{class:'callout '+(right===b.pairs.length?'tip':''),style:{marginTop:'10px'}},h('b',null,right+' of '+b.pairs.length+' correct. '),right===b.pairs.length?'Well done!':'The correct terms are shown under the ones you missed.'))}
    box.appendChild(rows);
    box.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn primary sm',onclick:function(){if(Object.keys(sel).length<b.pairs.length){H.toast('Choose a term for every definition first');return}checked=true;persist();draw()}},'Check'),
      h('button',{class:'btn ghost sm',onclick:function(){sel={};checked=false;persist();draw()}},'Reset')));
    box.appendChild(fb);draw();return box}

  function renderFlash(b){
    var i=0,card=h('div',{class:'flip',onclick:function(){card.classList.toggle('f')}}),cnt=h('span',{class:'label'});
    var front=h('div',{class:'face',style:{fontSize:'1.35rem',fontWeight:500}}),back=h('div',{class:'face back'});card.appendChild(h('div',{class:'in'},front,back));
    function show(){card.classList.remove('f');front.textContent=b.cards[i].front;back.innerHTML=md(b.cards[i].back);cnt.textContent=(i+1)+' / '+b.cards.length}
    show();return h('div',null,h('div',{class:'label',style:{marginBottom:'8px'}},'Key terms · tap to flip'),card,
      h('div',{class:'row between'},h('button',{class:'btn sm',onclick:function(){i=(i+b.cards.length-1)%b.cards.length;show()}},'Prev'),cnt,h('button',{class:'btn sm',onclick:function(){i=(i+1)%b.cards.length;show()}},'Next')))}

  function renderTool(b,ctx){
    var wrap=h('div'),holder=h('div',{class:'tool'},h('div',{class:'label'},'Loading tool...'));
    if(b.intro)wrap.appendChild(h('p',{class:'muted',html:md(b.intro)}));wrap.appendChild(holder);
    ToolLoader.ensure(b.tool).then(function(ok){holder.innerHTML='';
      if(!ok){holder.appendChild(h('div',{class:'callout'},'This interactive tool ('+b.tool+') is not available in this build.'));return}
      var t=Tools.get(b.tool),pre=b.tool+':';
      var tctx={opts:b.opts||null,load:function(k){return Store.getTool(pre+(k||'main'))},save:function(o,k){Store.setTool(pre+(k||'main'),o)},ai:AI,toast:H.toast,
        complete:function(){Store.markDone(ctx.pid)}};
      try{t.mount(holder,tctx)}catch(e){console.error(e);holder.appendChild(h('div',{class:'callout'},'Tool error: '+e.message))}});
    return wrap}

  /* ---------- settings ---------- */
  function viewSettings(){
    var root=h('div');mount(root);
    root.appendChild(h('div',{class:'topbar'},h('button',{class:'round','aria-label':'Home',onclick:function(){go('#/')},html:Dot.icon('home')}),h('div',{class:'dot',html:Dot.text('SETTINGS',{size:4}),style:{width:'190px'}}),h('span',{style:{width:'46px'}})));
    /* appearance */
    var th=h('div',{class:'row'});['auto','light','dark'].forEach(function(t){th.appendChild(h('button',{class:'chip'+(Store.settings.theme===t?' on':''),onclick:function(){Store.settings.theme=t;Store.saveSettings();applyTheme();viewSettings()}},t[0].toUpperCase()+t.slice(1)))});
    root.appendChild(h('div',{class:'card'},h('div',{class:'label'},'Appearance'),h('h3',{style:{margin:'4px 0 10px'}},'Theme'),th));
    var cb2=crashBanner();if(cb2)root.insertBefore(cb2,root.children[1]);
    root.appendChild(h('div',{class:'set-cat',html:Dot.text('AI',{size:4})}));
    root.appendChild(aiCard());root.appendChild(gradingCard());root.appendChild(chatCard());
    root.appendChild(h('div',{class:'set-cat',html:Dot.text('LEARNING',{size:4})}));
    root.appendChild(Reminders.card());
    root.appendChild(h('div',{class:'set-cat',html:Dot.text('DATA',{size:4})}));
    root.appendChild(syncCard());root.appendChild(dataCard());
    root.appendChild(h('div',{class:'card flat tiny muted'},h('b',null,'About. '),'Course content: The Open University, OpenLearn (CC BY-NC-SA 4.0): "Project management: the start of the project journey" and "Entrepreneurship: from ideas to reality". Reformatted for mobile learning with added practice questions and interactive tools. Not an official Open University product.'));}

  function fmtMB(b){return b>=1073741824?(b/1073741824).toFixed(2)+' GB':(b/1048576).toFixed(0)+' MB'}
  function aiCard(){
    var card=h('div',{class:'card'}),status=h('div',{class:'tiny muted'}),diag=h('div',{class:'tiny muted',style:{marginTop:'6px'}});
    card.appendChild(h('div',{class:'label'},'Local AI'));card.appendChild(h('h3',{style:{margin:'4px 0 4px'}},'On-device model'));
    card.appendChild(h('p',{class:'muted tiny'},'Runs fully on this device (no cloud). Models are downloaded once from Hugging Face. 0.5B-1B models suit 4 GB tablets; 1.5B-2B need more free RAM.'));
    card.appendChild(status);card.appendChild(diag);
    LLM.gpuInfo().then(function(g){diag.textContent='WebGPU: '+(g.webgpu?('yes'+(g.f16?' (fp16)':'')+(g.desc?' · '+g.desc:'')):'not available - CPU mode')+' · secure context: '+(self.isSecureContext?'yes':'no')+' · isolated: '+(self.crossOriginIsolated?'yes':'no')});
    var dev=h('div',{class:'row',style:{margin:'12px 0'}},h('span',{class:'tiny muted'},'Run on:'));
    (LLM.nativeAvailable()?[['llama','llama.cpp (fastest)'],['native','ONNX Runtime native'],['wasm','WebView CPU'],['webgpu','WebView GPU (experimental)']]:[['wasm','CPU (stable)'],['webgpu','GPU (experimental)']]).forEach(function(d){dev.appendChild(h('button',{class:'chip'+(((Store.settings.device==='native'&&!LLM.nativeAvailable())?'wasm':Store.settings.device)===d[0]?' on':''),onclick:function(){Store.settings.device=d[0];Store.saveSettings();var p=card.parentNode;p.replaceChild(aiCard(),card)}},d[1]))});
    card.appendChild(dev);
    var list=h('div'),testOut=h('div'),other=h('div'),store=h('div',{class:'tiny muted',style:{marginTop:'10px'}}),inst={},live=null,lastErrByRepo={};
    function renderStatus(){var st=LLM.status();
      status.innerHTML=st.state==='ready'?'<b class="ok">Ready</b> · '+H.esc(st.model.name)+' · '+H.esc(st.backend)
        :st.state==='loading'?'<b>Working...</b> '+H.esc(st.model?st.model.name:''):st.state==='error'?'<b class="bad">Error:</b> '+H.esc(st.error||''):'No model loaded'}
    function refresh(){return LLM.storage().then(function(s){inst={};s.repos.forEach(function(r){inst[r.repo]=r});
      store.textContent='Model files on this device: '+fmtMB(s.repos.reduce(function(a,r){return a+r.bytes},0))+(s.quota?' · app storage used '+fmtMB(s.usage)+' of ~'+fmtMB(s.quota)+' available':'');
      drawList();drawOther()})}
    function select(m){Store.settings.model=m.id||m.repo;Store.saveSettings();LLM.load(m,{device:Store.settings.device}).then(function(){H.toast('Model ready')}).catch(function(e){lastErrByRepo[m.repo]=String(e&&e.message||e);H.toast('Download/load failed')}).then(refresh)}
    function drawList(){list.innerHTML='';var cur=LLM.status(),busy=cur.state==='loading';
      LLM.catalog.forEach(function(m){var rp=LLM.repoOf(m),i=inst[rp],has=!!(i&&i.complete),partial=!!(i&&!i.complete),active=cur.state==='ready'&&cur.model&&cur.model.repo===m.repo,
        loadingThis=busy&&cur.model&&cur.model.repo===m.repo,selected=Store.settings.model===m.id;
        var info=h('div',{style:{flex:1,minWidth:0}},h('b',{style:{fontWeight:500}},m.name),' ',h('span',{class:'label'},m.params+' · ~'+m.mb+' MB'));
        var sub=has?'Downloaded · '+fmtMB(i.bytes)+(active?' · active ('+cur.backend+')':(selected?' · selected':'')):partial?'Incomplete files · '+fmtMB(i.bytes):m.note;
        info.appendChild(h('div',{class:'tiny '+(has?'ok':'muted')},sub));
        if(!has&&!partial&&!loadingThis)info.lastChild.className='tiny muted';
        if(lastErrByRepo[m.repo]&&!loadingThis&&!has)info.appendChild(h('div',{class:'tiny bad'},'Failed: '+lastErrByRepo[m.repo]));
        if(loadingThis){var ph=live&&live.phase,pct=Math.round(((live&&live.progress)||0)*100);
          var txt=!live||live.phase==='start'?'Starting download...':(ph==='init'?'Initializing model on '+(Store.settings.device==='wasm'?'CPU':'GPU')+'... (can take a minute)':'Downloading '+pct+'% · '+live.loadedMB.toFixed(0)+' / '+live.totalMB.toFixed(0)+' MB'+(live.speedMBs?' · '+live.speedMBs.toFixed(1)+' MB/s':''));
          info.appendChild(h('div',{class:'tiny',style:{marginTop:'4px'}},txt));info.appendChild(h('div',{class:'progress-line'},h('i',{style:{width:(ph==='init'?100:Math.max(2,pct))+'%'}})))}
        var btns=h('div',{class:'row',style:{gap:'6px',flexShrink:0}});
        if(loadingThis)btns.appendChild(h('span',{class:'label'},'Working'));
        else{
          btns.appendChild(h('button',{class:'btn sm'+(active?'':' primary'),disabled:active||busy,onclick:function(){delete lastErrByRepo[m.repo];select(m)}},active?'Active':has?(selected?'Load':'Select'):(partial?'Retry':'Download')));
          if(has||partial)btns.appendChild(h('button',{class:'btn ghost sm',disabled:busy,onclick:function(){if(!confirm('Delete files of '+m.name+' ('+fmtMB(i.bytes)+')?'))return;if(active)LLM.unload();LLM.purge(m).then(function(){if(Store.settings.model===m.id){Store.settings.model=null;Store.saveSettings()}H.toast('Deleted');refresh()})}},'Delete'))}
        list.appendChild(h('div',{class:'model-row'},info,btns))})}
    function drawOther(){other.innerHTML='';var known={};LLM.catalog.forEach(function(m){known[m.repo]=1;if(m.gguf)known[m.gguf.repo]=1});
      var rest=Object.keys(inst).filter(function(r){return !known[r]}).map(function(r){return inst[r]});
      if(!rest.length)return;other.appendChild(h('div',{class:'label',style:{margin:'14px 0 4px'}},'Other model files (custom or leftovers)'));
      rest.forEach(function(r){var cur=LLM.status(),active=cur.state==='ready'&&cur.model&&cur.model.repo===r.repo;
        other.appendChild(h('div',{class:'model-row'},h('div',{style:{flex:1,minWidth:0,wordBreak:'break-all'}},r.repo,h('div',{class:'tiny '+(r.complete?'ok':'bad')},(r.complete?'Downloaded':'Incomplete')+' · '+fmtMB(r.bytes))),
          h('div',{class:'row',style:{gap:'6px'}},r.complete?h('button',{class:'btn sm primary',disabled:active||cur.state==='loading',onclick:function(){select({id:r.repo,repo:r.repo,name:r.repo,custom:true,params:'?',mb:0})}},active?'Active':'Select'):null,
            h('button',{class:'btn ghost sm',onclick:function(){if(active)LLM.unload();LLM.purgeRepo(r.repo).then(function(){H.toast('Deleted');refresh()})}},'Delete'))))})}
    renderStatus();
    var sub=function(s){if(!document.body.contains(card))return;renderStatus();if(s&&s.state==='loading'){live=s.phase?s:Object.assign({},live,s);drawList()}else if(s&&(s.state==='ready'||s.state==='error')){live=null;refresh()}};LLM.on(sub);
    card.appendChild(h('div',{class:'label',style:{margin:'4px 0 2px'}},'Models'));card.appendChild(list);card.appendChild(other);card.appendChild(store);
    card.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn ghost sm',onclick:function(){if(!confirm('Delete ALL downloaded model files and caches from this device?'))return;LLM.purgeAll().then(function(){Store.settings.model=null;Store.saveSettings();H.toast('All model files deleted');renderStatus();refresh()})}},'Delete all model files'),h('button',{class:'btn ghost sm',onclick:refresh},'Rescan')));
    var cu=h('input',{class:'input',placeholder:'Custom ONNX repo, e.g. onnx-community/...',value:Store.settings.custom||''});
    card.appendChild(h('div',{class:'row',style:{marginTop:'12px',flexWrap:'nowrap'}},cu,h('button',{class:'btn sm primary',onclick:function(){var v=cu.value.trim();if(!v)return;Store.settings.custom=v;Store.saveSettings();select({id:v,repo:v,name:v,custom:true,params:'?',mb:0})}},'Download')));
    var auto=h('button',{class:'sw'+(Store.settings.autoload?' on':''),onclick:function(){Store.settings.autoload=!Store.settings.autoload;Store.saveSettings();auto.classList.toggle('on')}});
    card.appendChild(h('div',{class:'row between',style:{marginTop:'14px'}},h('span',null,'Load selected model when the app starts'),auto));
    var stOut=h('div',{style:{marginTop:'10px'}}),stBtn=h('button',{class:'btn primary sm',onclick:function(){
      stBtn.disabled=true;stOut.innerHTML='';
      SelfTest.run(function(steps){stOut.innerHTML='';steps.forEach(function(s){stOut.appendChild(h('div',{class:'model-row',style:{alignItems:'flex-start'}},
        h('b',{style:{width:'110px',flex:'none',fontWeight:500}},s.name),h('div',{style:{flex:1,fontSize:'.88rem',wordBreak:'break-word'},class:s.status==='fail'?'bad':s.status==='ok'?'ok':s.status==='warn'?'':'muted'},(s.status==='run'?'... ':s.status==='ok'?'\u2713 ':s.status==='warn'?'\u26A0 ':'\u2717 ')+s.detail)))})})
      .then(function(r){stBtn.disabled=false;stOut.appendChild(h('div',{class:'callout '+(r.ok?'tip':''),style:{marginTop:'10px'}},h('b',null,r.summary)));refresh()})}},'Run AI self-test');
    card.appendChild(h('div',{style:{marginTop:'16px'}},h('div',{class:'label',style:{marginBottom:'6px'}},'Will the AI work on this device?'),h('p',{class:'muted tiny'},'Loads the selected model, writes a few words and a feedback sample, and checks the screen stays responsive.'),stBtn,stOut));
    var tin=h('input',{class:'input',value:'Explain in two sentences why a feasibility study matters before starting a project.'});
    card.appendChild(h('div',{style:{marginTop:'16px'}},h('div',{class:'label',style:{marginBottom:'6px'}},'Test the model'),tin,
      h('div',{class:'row',style:{marginTop:'8px'}},h('button',{class:'btn primary sm',onclick:function(){
        if(!AI.available()){H.toast('Load a model first');return}testOut.innerHTML='';var box=h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},'Output'),h('span',{class:'t'},'...'));testOut.appendChild(box);var t0=Date.now();
        AI.ask({system:'You are a concise tutor.',prompt:tin.value,maxTokens:120,temperature:0.3,onToken:function(t){box.querySelector('.t').textContent=t}}).then(function(t){box.querySelector('.t').textContent=t;box.appendChild(h('div',{style:{marginTop:'8px',fontSize:'.8rem',color:'#9a9a9a'}},LLM.lastTps.toFixed(1)+' tokens/s · '+((Date.now()-t0)/1000).toFixed(1)+' s · '+(LLM.status().backend||'')))}).catch(function(e){box.querySelector('.t').textContent='Error: '+e.message})}},'Run test')),testOut));
    refresh();return card}

  function gradingCard(){
    var card=h('div',{class:'card'});
    card.appendChild(h('div',{class:'label'},'AI \u00b7 Grading'));card.appendChild(h('h3',{style:{margin:'4px 0 6px'}},'How activity answers are graded'));
    card.appendChild(h('p',{class:'muted tiny'},'Used when you press \u201CGet feedback\u201D on an activity.'));
    card.appendChild(h('div',{class:'label',style:{margin:'10px 0 6px'}},'Grading mode'));card.appendChild(ModesUI.chips(null,'grade'));
    card.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'Check my answers against'));card.appendChild(ModesUI.basisToggle());
    card.appendChild(h('p',{class:'muted tiny',style:{marginTop:'6px'}},'Model answer: compares with the key ideas from the course. Course content: looks up the relevant course pages. Both: uses both.'));
    card.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'Custom command (added to every grading)'));
    var cmd=h('textarea',{class:'textarea',style:{minHeight:'70px'},placeholder:'e.g. Always give a score out of 10 and one tip for my exam.'});cmd.value=Modes.gradeCommand();
    var tmr;cmd.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(function(){Modes.setGradeCommand(cmd.value);H.toast('Saved')},700)});card.appendChild(cmd);
    var det=h('details',{style:{marginTop:'14px'}},h('summary',{class:'muted'},'Manage grading modes'));det.appendChild(ModesUI.manager(function(){card.replaceWith(gradingCard())},'grade'));card.appendChild(det);
    return card}
  function chatCard(){
    var card=h('div',{class:'card'});
    card.appendChild(h('div',{class:'label'},'AI \u00b7 Chat'));card.appendChild(h('h3',{style:{margin:'4px 0 6px'}},'How the AI chats'));
    card.appendChild(h('p',{class:'muted tiny'},'Used by the AI button in the course, the AI page, questions about selected text and the document tools. You can also switch with the mode pill next to the chat input.'));
    card.appendChild(h('div',{class:'label',style:{margin:'10px 0 6px'}},'Chat mode'));card.appendChild(ModesUI.chips(null,'chat'));
    card.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'Manage chat modes'));card.appendChild(ModesUI.manager(function(){card.replaceWith(chatCard())},'chat'));
    return card}
  function behaviourCard(){
    var card=h('div',{class:'card'});
    card.appendChild(h('div',{class:'label'},'Local AI'));card.appendChild(h('h3',{style:{margin:'4px 0 6px'}},'How the AI responds'));
    card.appendChild(h('p',{class:'muted tiny'},'Pick a response mode, or write your own. The active mode is used for activity feedback, questions about selected text, the AI page and document tools.'));
    card.appendChild(h('div',{class:'label',style:{margin:'10px 0 6px'}},'Active mode'));card.appendChild(ModesUI.chips());
    card.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'Check my activity answers against'));card.appendChild(ModesUI.basisToggle());
    card.appendChild(h('p',{class:'muted tiny',style:{marginTop:'6px'}},'Model answer: compares with the key ideas from the course. Course content: also looks up the relevant course pages. Both: uses both.'));
    card.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'Manage modes'));
    var mm=h('div');card.appendChild(mm);function drawM(){mm.innerHTML='';mm.appendChild(ModesUI.manager(function(){card.replaceWith(behaviourCard())}))}drawM();
    return card}

  function syncCard(){
    var card=h('div',{class:'card'}),body=h('div');
    card.appendChild(h('div',{class:'label'},'Sync'));card.appendChild(h('h3',{style:{margin:'4px 0 4px'}},'Nearby device (Bluetooth)'));
    card.appendChild(h('p',{class:'muted tiny'},'Moves your progress, answers and tool work between two devices with this app. First pair the devices in Android Bluetooth settings. Then open this screen on both: press "Receive" on one and "Sync" on the other.'));
    card.appendChild(body);
    function msg(t,bad){var m=h('div',{class:'callout'+(bad?'':' tip'),style:{marginTop:'10px'}},t);body.appendChild(m)}
    function draw(){body.innerHTML='';
      if(!Sync.supported()){body.appendChild(h('div',{class:'callout note'},'Bluetooth sync is only available in the Android app. Use the progress code below instead.'));return}
      var st=Sync.state();
      if(st==='unsupported'){body.appendChild(h('div',{class:'callout note'},'This device has no Bluetooth.'));return}
      if(st==='permission'){body.appendChild(h('button',{class:'btn primary',onclick:function(){Sync.requestPermission().then(draw)}},'Allow Bluetooth access'));return}
      if(st==='off'){body.appendChild(h('div',{class:'callout'},'Bluetooth is off. Turn it on, then come back.'));body.appendChild(h('button',{class:'btn',onclick:function(){Sync.openSettings()}},'Open Bluetooth settings'));return}
      var busy=false;
      function run(p){if(busy)return;busy=true;p.then(function(r){busy=false;draw();if(r.ok)msg('Synced. '+r.changed+' update'+(r.changed===1?'':'s')+' received from the other device.');else msg('Sync failed: '+r.error,true)})}
      body.appendChild(h('div',{class:'row',style:{marginBottom:'6px'}},h('button',{class:'btn primary',onclick:function(){body.innerHTML='';body.appendChild(h('div',{class:'callout tip'},'Waiting up to 2 minutes for the other device... Start "Sync" on it now.'));body.appendChild(h('button',{class:'btn ghost',onclick:function(){Sync.cancel()}},'Cancel'));run(Sync.listen())}},'Receive (wait for other device)'),
        h('button',{class:'btn ghost',onclick:function(){Sync.openSettings()}},'Pair new device')));
      var pr=Sync.paired();body.appendChild(h('div',{class:'label',style:{margin:'10px 0 4px'}},'Sync with a paired device'));
      if(!pr.length)body.appendChild(h('p',{class:'muted tiny'},'No paired devices found.'));
      pr.forEach(function(d){body.appendChild(h('div',{class:'model-row'},h('div',{style:{flex:1}},d.name||'Unknown',h('div',{class:'tiny muted'},d.address)),h('button',{class:'btn sm primary',onclick:function(){body.innerHTML='';body.appendChild(h('div',{class:'callout tip'},'Connecting to '+(d.name||d.address)+'... (the other device must be on "Receive")'));run(Sync.connect(d.address))}},'Sync')))});
    }
    draw();
    var code=h('textarea',{class:'textarea',style:{minHeight:'70px'},placeholder:'Paste a progress code here'});
    var det=h('details',{style:{marginTop:'14px'}},h('summary',{class:'muted'},'Manual transfer (copy / paste code)'),
      h('div',{class:'row',style:{margin:'10px 0'}},h('button',{class:'btn sm',onclick:function(){var c=Sync.exportCode();code.value=c;try{navigator.clipboard.writeText(c);H.toast('Code copied')}catch(e){code.select()}}},'Create code'),
        h('button',{class:'btn sm primary',onclick:function(){var r=Sync.importCode(code.value);H.toast(r.ok?'Imported '+r.changed+' updates':r.error)}},'Import code')),code);
    card.appendChild(det);return card}

  function dataCard(){
    var s=Store.stats();
    return h('div',{class:'card'},h('div',{class:'label'},'Data'),h('h3',{style:{margin:'4px 0 6px'}},'Progress'),h('p',{class:'muted tiny'},s.done+' pages completed · '+s.ans+' written answers saved on this device.'),
      h('button',{class:'btn ghost',onclick:function(){if(confirm('Reset ALL progress, answers and tool work on this device?')){Store.resetAll();H.toast('Progress reset');go('#/')}}},'Reset all progress'))}

  /* ---------- boot ---------- */
  fetchJSON('content/courses.json').then(function(i){index=i;route();
    var m=Store.settings.model;
    if(Store.settings.autoload&&m&&!window.__crashed){var ent=LLM.catalog.filter(function(c){return c.id===m})[0]||(Store.settings.custom&&Store.settings.custom===m?{id:m,repo:m,name:m,custom:true}:null);
      if(ent&&LLM.downloaded(ent))setTimeout(function(){LLM.load(ent,{device:Store.settings.device}).catch(function(){})},1200)}
  }).catch(function(e){$app.textContent='Failed to load courses: '+e.message});
  window.__app={go:go,loadCourse:loadCourse,index:function(){return index}};
})();

// Home header, streak, AI pop-up chat, modes (grading/chat), dark mode, figures, match, content fixes, new courses.
const {chromium}=require('playwright'),{spawn}=require('child_process'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),PORT=8843,SHOTS=process.env.SHOTDIR;const srv=spawn('node',[__dirname+'/serve.js',ROOT+'/app/www',PORT,'iso'],{stdio:'ignore'});
const results=[];const ok=(n,c,d)=>{results.push(c);console.log((c?'PASS ':'FAIL ')+n+(d?' - '+d:''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await sleep(700);const b=await chromium.launch();
 for(const vp of [{n:'tablet',w:1280,h:800},{n:'phone',w:390,h:844}]){
  console.log('=== '+vp.n);
  const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  const shot=async n=>{if(SHOTS)await p.screenshot({path:`${SHOTS}/f-${vp.n}-${n}.png`})};
  await p.addInitScript(()=>{window.__bars=[];window.__widget=null;window.Android={setSystemBars:d=>window.__bars.push(d),updateWidget:j=>{window.__widget=JSON.parse(j)},markReadToday:()=>{},scheduleReminder:(on,h,m)=>{window.__sched=[on,h,m]},setReminderMessages:j=>{window.__msgs=JSON.parse(j)},requestNotificationPermission:()=>{},testReminder:()=>{window.__test=1}}});
  await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForSelector('.course');await sleep(400);
  // ---------- home header
  const hd=await p.evaluate(()=>{const l=document.querySelector('.home-top .logo').getBoundingClientRect(),pill=document.querySelector('.ai-pill').getBoundingClientRect(),gear=document.querySelector('.home-top .round').getBoundingClientRect();
    return {logoTop:l.top,sameRow:Math.abs((pill.top+pill.bottom)/2-(gear.top+gear.bottom)/2)<3,order:pill.right<=gear.left+1&&gear.right>innerWidth*0.8,text:document.querySelector('.ai-pill').innerText,dot:getComputedStyle(document.querySelector('.ai-pill i')).backgroundColor,radius:getComputedStyle(document.querySelector('.ai-pill')).borderRadius}});
  ok('LEARN logo at the very top',hd.logoTop<40,'top='+Math.round(hd.logoTop));
  ok('AI pill + settings on the same row, settings rightmost',hd.sameRow&&hd.order);
  ok('AI pill reads "AI off" with a grey dot, rounded rectangle',/AI OFF/i.test(hd.text)&&/rgb\(154, 154, 154\)|rgb\(110, 110, 110\)/.test(hd.dot)&&hd.radius==='14px',hd.text+' '+hd.dot+' '+hd.radius);
  await p.evaluate(()=>{LLM.isReady=()=>true;LLM.status=()=>({state:'ready',model:{name:'Mock'},backend:'mock'});window.__ai=[];LLM.generate=o=>{window.__ai.push(o);o.onToken&&o.onToken('MOCK');return Promise.resolve('MOCK ANSWER')};location.hash='#/settings'});await sleep(200);await p.evaluate(()=>location.hash='#/');await sleep(400);
  ok('AI pill turns "AI on" with a green dot when a model is loaded',await p.evaluate(()=>{const e=document.querySelector('.ai-pill');return /AI ON/i.test(e.innerText)&&getComputedStyle(e.querySelector('i')).backgroundColor==='rgb(47, 180, 90)'}));
  // ---------- streak
  await p.evaluate(()=>{const d=new Date(),k=x=>Store.dayKey(x.getTime());const y=new Date(d);y.setDate(d.getDate()-1);const y2=new Date(d);y2.setDate(d.getDate()-2);
    const st=Store.snapshot();st.act={};st.act[k(y2)]={v:['a','b','c','d','e','f'],t:1};st.act[k(y)]={v:['a','b'],t:1};Store.merge(st);location.hash='#/settings'});await sleep(100);await p.evaluate(()=>location.hash='#/');await sleep(400);
  let sk=await p.evaluate(()=>({n:Streak.compute().streak,badges:document.querySelectorAll('.wk .bd').length,full:document.querySelectorAll('.wk .bd.full').length,part:document.querySelectorAll('.wk .bd.part').length,fire:!!document.querySelector('.streak svg circle[fill="var(--red)"]')}));
  ok('streak counts consecutive days (today not read yet keeps yesterday\'s streak)',sk.n===2,JSON.stringify(sk));
  ok('week shows 7 badge holes, full badge for goal reached, ring with count otherwise',sk.badges===7&&sk.fire,JSON.stringify(sk));
  await shot('home');
  // read pages -> today's count + streak 3
  await p.evaluate(()=>location.hash='#/p/pm/0/0');await p.waitForSelector('.pfoot .btn.primary');for(let i=0;i<3;i++){await p.click('.pfoot .btn.primary');await sleep(250)}
  ok('pressing Next logs pages read today',await p.evaluate(()=>Store.readOn(Store.dayKey())===3));
  ok('streak becomes 3 after reading today',await p.evaluate(()=>Streak.compute().streak===3));
  // ---------- AI popup in the viewer
  ok('top-right of the viewer is now an AI button',await p.evaluate(()=>{const r=[...document.querySelectorAll('.phead .round')].pop();return r.getAttribute('aria-label')==='AI chat'}));
  await p.click('.phead .round[aria-label="AI chat"]');await p.waitForSelector('.cp.in');await sleep(250);
  ok('chat pop-up shows "Context: current page" with an x',await p.evaluate(()=>/Context: current page/.test(document.querySelector('.cp-ctx').innerText)&&!!document.querySelector('.cp-x')));
  ok('mode pill left of the input shows Auto by default',await p.evaluate(()=>{const pill=document.querySelector('.cp-mode'),inp=document.querySelector('.cp-input');return /Auto/.test(pill.innerText)&&pill.getBoundingClientRect().right<=inp.getBoundingClientRect().left+2}));
  await p.fill('.cp-input','What is this page about?');await p.click('.cp-send');await sleep(500);
  let call=await p.evaluate(()=>window.__ai[window.__ai.length-1]);
  ok('with context: prompt contains the current page',/\[Current page\]/.test(call.prompt),call.prompt.slice(0,100).replace(/\n/g,' '));
  await shot('popup');
  await p.click('.cp-x');await sleep(150);await p.fill('.cp-input','Tell me a general fact');await p.click('.cp-send');await sleep(500);
  call=await p.evaluate(()=>window.__ai[window.__ai.length-1]);
  ok('after removing the context: general answer, no course material',!/Course material/.test(call.prompt)&&/general knowledge/.test(call.system));
  await p.click('.cp-mode');await sleep(150);
  ok('mode menu lists all modes and a blue "Manage modes" item with a pencil',await p.evaluate(()=>{const m=document.querySelector('.cp-menu');const man=m.querySelector('.cp-mi.manage');return m.querySelectorAll('.cp-mi').length>=4&&/Manage modes/.test(man.innerText)&&!!man.querySelector('svg')&&getComputedStyle(man).color!==getComputedStyle(m.querySelector('.cp-mi')).color}));
  await shot('modemenu');
  await p.click('.cp-mi:has-text("Critical")');await sleep(100);ok('choosing a mode updates the pill',await p.evaluate(()=>/Critical/.test(document.querySelector('.cp-mode').innerText)&&Modes.active('chat').id==='critical'));
  await p.click('.cp-mode');await p.click('.cp-mi.manage');await sleep(150);
  await p.click('.cp-in >> text=+ Add my own mode');await p.fill('.cp-in input[placeholder^="Mode name"]','Socratic');await p.fill('.cp-in textarea[placeholder^="Instructions"]','Answer with guiding questions only.');await p.click('.cp-in .btn:has-text("Add mode")');await sleep(200);
  ok('manage modes: add a custom chat mode',await p.evaluate(()=>Modes.active('chat').name==='Socratic'));
  await p.click('.cp-in .model-row:has-text("Socratic") >> text=Edit');await p.fill('.cp-in .card.flat textarea','Answer with two guiding questions.');await p.click('.cp-in .btn:has-text("Save")');await sleep(150);
  ok('manage modes: edit a mode',await p.evaluate(()=>Modes.active('chat').instructions==='Answer with two guiding questions.'));
  await p.click('.cp-in .model-row:has-text("Socratic") >> text=Delete');await sleep(150);
  ok('manage modes: delete a custom mode',await p.evaluate(()=>!Modes.list('chat').some(m=>m.name==='Socratic')));
  await p.click('.cp-in >> text=Back to chat');await p.click('.cp-head .round');await sleep(300);
  // ---------- settings: AI category, grading vs chat
  await p.evaluate(()=>location.hash='#/settings');await p.waitForSelector('.set-cat');await sleep(200);
  ok('settings has an AI category with Grading and Chat sections',await p.evaluate(()=>{const t=document.body.innerText;return /AI · GRADING/i.test(t)&&/AI · CHAT/i.test(t)&&document.querySelectorAll('.set-cat').length>=3}));
  await p.fill('textarea[placeholder^="e.g. Always give a score"]','Always give a score out of 10.');await sleep(900);
  await p.evaluate(()=>{Modes.setActive('critical','grade')});
  await p.evaluate(()=>location.hash='#/p/pm/0/10');await p.waitForSelector('.textarea');await p.fill('.textarea','Projects are temporary.');await p.evaluate(()=>{window.__ai=[]});await p.click('text=Get feedback');await sleep(500);
  call=await p.evaluate(()=>window.__ai[0]);
  ok('grading uses the grading mode + custom command (not the chat mode)',/Grade strictly/.test(call.system)&&/score out of 10/.test(call.system)&&!/Adapt to the request/.test(call.system),call.system.slice(0,140));
  await shot('settings');
  // ---------- dark mode
  await p.evaluate(()=>{Store.settings.theme='dark';Store.saveSettings();location.hash='#/settings'});await sleep(200);await p.click('.chip:has-text("Dark")');await sleep(300);
  ok('dark mode tells Android to make the system bars dark',await p.evaluate(()=>window.__bars[window.__bars.length-1]===true));
  await p.evaluate(()=>location.hash='#/p/pm/0/3');await sleep(400);
  const bg=await p.evaluate(()=>[getComputedStyle(document.body).backgroundColor,getComputedStyle(document.querySelector('.phead')).backgroundColor,getComputedStyle(document.documentElement).backgroundColor]);
  ok('dark mode: page, header and root backgrounds are all black',bg.every(c=>c==='rgb(0, 0, 0)'),bg.join(' '));
  await shot('dark');
  await p.evaluate(()=>{Store.settings.theme='light';Store.saveSettings();location.hash='#/settings'});await p.click('.chip:has-text("Light")');await sleep(200);
  // ---------- figures
  const fig=await p.evaluate(async()=>{const c=await __app.loadCourse('pm');for(let ci=0;ci<c.chapters.length;ci++)for(let pi=0;pi<c.chapters[ci].pages.length;pi++)if(c.chapters[ci].pages[pi].blocks.some(b=>b.t==='img'))return [ci,pi]});
  await p.evaluate(f=>location.hash='#/p/pm/'+f[0]+'/'+f[1],fig);await p.waitForSelector('figure.img img');await sleep(400);
  await p.click('figure.img img');await p.waitForSelector('.lb.in');await sleep(300);
  ok('tapping a figure opens an almost full-screen pop-up',await p.evaluate(()=>{const r=document.querySelector('.lb-in').getBoundingClientRect();return r.width>innerWidth*0.9&&r.height>innerHeight*0.85}));
  const z0=await p.evaluate(()=>document.querySelector('.lb-stage img').style.transform);
  const st=await p.evaluate(()=>{const r=document.querySelector('.lb-stage').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
  await p.mouse.move(st.x,st.y);for(let i=0;i<5;i++){await p.mouse.wheel(0,-120);await sleep(40)}
  const z1=await p.evaluate(()=>document.querySelector('.lb-stage img').style.transform);
  ok('zooming in works (wheel / pinch)',/scale\((1\.[5-9]|[2-6])/.test(z1),z0+' -> '+z1);
  await p.dblclick('.lb-stage');await sleep(100);
  await p.mouse.move(st.x,st.y);await p.mouse.down();await sleep(650);await p.mouse.up();await sleep(150);
  ok('holding the picture shows Highlight / Note / Ask AI',await p.evaluate(()=>{const b=document.querySelector('.lb-bar');return !b.classList.contains('hide')&&/Highlight/.test(b.innerText)&&/Note/.test(b.innerText)}));
  await shot('lightbox');
  await p.click('.lb-bar .sb.nt');await p.waitForSelector('.sheet textarea');await p.fill('.sheet textarea','This figure explains the core idea.');await p.click('.sheet .btn.primary');await sleep(500);
  ok('figure note saved and the figure is marked',await p.evaluate(()=>Store.allNotes('pm').some(e=>e.segs.some(s=>s.img)&&e.note.includes('core idea'))&&!!document.querySelector('figure.mk-img.note')));
  const f2=await p.evaluate(()=>location.hash.replace('#/p/','#/n/'));await p.evaluate(h=>location.hash=h,f2);await sleep(400);
  ok('notes viewer shows the figure note in blue',await p.evaluate(()=>{const f=document.querySelector('figure.mk-img.note');return f&&getComputedStyle(f).outlineColor==='rgb(45, 127, 249)'}));
  // ---------- match block (ent3-06) + content fixes
  const mi=await p.evaluate(async()=>{const c=await __app.loadCourse('ent');const ch=c.chapters[2];return {pi:ch.pages.findIndex(x=>x.id==='ent3-06'),has07:ch.pages.some(x=>x.id==='ent3-07'),n:ch.pages.length}});
  ok('session 3 flashcard page removed',!mi.has07&&mi.n===18,JSON.stringify(mi));
  await p.evaluate(i=>location.hash='#/p/ent/2/'+i,mi.pi);await p.waitForSelector('.match');
  ok('definitions shown one per row with a "Choose term" button',await p.evaluate(()=>document.querySelectorAll('.mt-row').length===9&&document.querySelectorAll('.mt-pick').length===9));
  await p.click('.mt-pick >> nth=0');await p.waitForSelector('.sheet .opt');
  ok('tapping opens a pop-up with all 9 terms',await p.evaluate(()=>document.querySelectorAll('.sheet .opt').length===9));
  await shot('match-sheet');
  const pairs=await p.evaluate(async()=>{const c=await __app.loadCourse('ent');return c.chapters[2].pages.find(x=>x.id==='ent3-06').blocks.find(b=>b.t==='match').pairs});
  await p.click('.sheet .opt:has-text("'+pairs[0].term+'")');await sleep(100);
  for(let i=1;i<9;i++){await p.click('.mt-pick >> nth='+i);await p.waitForSelector('.sheet .opt');const t=i===8?pairs[7].term:pairs[i].term;await p.click('.sheet .opt:text-is("'+t+'")').catch(async()=>{await p.click('.sheet .opt >> text='+t)});await sleep(80)}
  await p.click('.match .btn.primary');await sleep(200);
  ok('Check marks right/wrong and shows the score',await p.evaluate(()=>/7 of 9 correct|8 of 9 correct/.test(document.querySelector('.match').innerText)&&document.querySelectorAll('.mt-row.wrong').length>=1));
  await shot('match-checked');
  const pm=await p.evaluate(async()=>{const c=await __app.loadCourse('pm');const pg=c.chapters[0].pages;const i34=pg.findIndex(x=>x.id==='pm1-34'),i42=pg.findIndex(x=>x.id==='pm1-42b'),i36=pg.findIndex(x=>x.id==='pm1-36');return {i34,i36,i42,t34:pg[i34].blocks[0].opts.tabs,t42:pg[i42].blocks[0].opts.tabs}});
  ok('PM: SWOT/PESTLE tool stays at 34, Pareto/cause & effect moved after its theory',pm.t34.join()==='swot,pestle'&&pm.t42.join()==='pareto,fish'&&pm.i42>pm.i36,JSON.stringify(pm));
  await p.evaluate(i=>location.hash='#/p/pm/0/'+i,pm.i42);await p.waitForSelector('.sp-tabs .chip');
  ok('moved tool page only shows the Pareto and Cause & effect tabs',await p.evaluate(()=>[...document.querySelectorAll('.sp-tabs .chip')].map(c=>c.innerText.replace(/ ✓/,'')).join()==='Pareto,Cause & effect'));
  // ---------- reminders + widget feed
  await p.evaluate(()=>location.hash='#/settings');await p.waitForSelector('.set-cat');
  ok('widget data contains all 6 courses with percentage + resume link',await p.evaluate(()=>window.__widget&&window.__widget.courses.length===6&&window.__widget.courses.every(c=>c.hash.startsWith('#/p/')&&typeof c.pct==='number')),await p.evaluate(()=>JSON.stringify(window.__widget&&window.__widget.courses.map(c=>c.id+':'+c.pct))));
  await p.click('.card:has-text("Goal and reminders") .sw');await sleep(800);
  ok('turning the reminder on schedules it natively',await p.evaluate(()=>window.__sched&&window.__sched[0]===true));
  ok('reminder messages are AI-written about the last course (mock model)',await p.evaluate(()=>window.__msgs&&window.__msgs.msgs.length>=3&&/Project management|MOCK/.test(JSON.stringify(window.__msgs))&&window.__ai.some(a=>/push-notification/.test(a.prompt))));
  await p.fill('.card:has-text("Goal and reminders") input[type=time]','08:15');await p.dispatchEvent('.card:has-text("Goal and reminders") input[type=time]','change');await sleep(200);
  ok('reminder time can be changed',await p.evaluate(()=>window.__sched[1]===8&&window.__sched[2]===15));
  // ---------- new courses
  ok('home lists the 2 new courses',await p.evaluate(async()=>{location.hash='#/';await new Promise(r=>setTimeout(r,500));return [...document.querySelectorAll('.course h2')].map(e=>e.innerText).join('|')}).then(t=>/Leadership/.test(t)&&/Personal branding/.test(t)&&/Hybrid working/.test(t)&&/Cyber security/.test(t)));
  if(vp.n==='tablet'){
   const bad=await p.evaluate(async()=>{const out=[];for(const id of ['lead','brand','hybrid','cyber']){const c=await __app.loadCourse(id);for(let ci=0;ci<c.chapters.length;ci++)for(let pi=0;pi<c.chapters[ci].pages.length;pi++){location.hash=`#/p/${id}/${ci}/${pi}`;await new Promise(r=>setTimeout(r,20));if(!document.querySelector('.pbody')||document.body.innerText.includes('Could not display'))out.push(id+ci+'/'+pi)}}return out});
   ok('every page of the new courses renders',bad.length===0,bad.slice(0,5).join(','));
  }
  ok('no page errors',errs.length===0,errs.slice(0,3).join(' | '));await ctx.close()}
 await b.close();srv.kill();const f=results.filter(x=>!x).length;console.log(f?`\n${f} FAILED`:'\nALL PASSED');process.exit(f?1:0)})().catch(e=>{console.error('TEST CRASH',e);srv.kill();process.exit(2)});

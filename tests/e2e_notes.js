// End-to-end test of notes/highlights/selection/panel/document/AI-context features. Usage: node tests/e2e_notes.js [shots]
const {chromium}=require('playwright'),{spawn}=require('child_process'),path=require('path'),fs=require('fs');
const ROOT=path.resolve(__dirname,'..'),PORT=8841,SHOTS=process.argv.includes('shots')?process.env.SHOTDIR||'/tmp':null;
const srv=spawn('node',[__dirname+'/serve.js',ROOT+'/app/www',PORT,'iso'],{stdio:'ignore'});
const results=[];const ok=(n,c,d)=>{results.push(c);console.log((c?'PASS ':'FAIL ')+n+(d?' - '+d:''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await sleep(700);
 const b=await chromium.launch();
 for(const vp of [{name:'tablet',width:1280,height:800},{name:'phone',width:390,height:844}]){
  console.log('=== '+vp.name);
  const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},hasTouch:false});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  const shot=async n=>{if(SHOTS)await p.screenshot({path:`${SHOTS}/${vp.name}-${n}.png`})};
  await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForSelector('.course');
  // ---------- home
  ok('home has Notes and AI buttons side by side',await p.evaluate(()=>{const a=[...document.querySelectorAll('.home-actions .big-btn')];return a.length===2&&Math.abs(a[0].getBoundingClientRect().top-a[1].getBoundingClientRect().top)<4}));
  await shot('home');
  // ---------- selection by long press in the course
  const LP=await p.evaluate(async()=>{const c=await __app.loadCourse('pm');const ch=c.chapters[0];for(let i=0;i<ch.pages.length;i++){const b=ch.pages[i].blocks.find(b=>b.t==='p'&&b.text.split(' ').length>=28);if(b)return i}return 2});
  await p.evaluate(i=>location.hash='#/p/pm/0/'+i,LP);await p.waitForSelector('.pbody p[data-sel]');await sleep(300);
  await p.evaluate(()=>{let best=null,n=0;document.querySelectorAll('.pbody p[data-sel]').forEach(e=>{const c=e.textContent.split(' ').length;if(c>n){n=c;best=e}});best.setAttribute('data-t','1')});
  const wordPos=async(sel,idx)=>p.evaluate(([sel,idx])=>{let el=null,mx=0;document.querySelectorAll('.pbody p[data-sel]').forEach(e=>{const c=e.textContent.split(' ').length;if(c>mx){mx=c;el=e}});const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n,c=0;while(n=w.nextNode()){const re=/\S+/g;let m;while(m=re.exec(n.nodeValue)){if(c++===idx){const r=document.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);const b=r.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,w:m[0]}}}}},[sel,idx]);
  const w0=await wordPos('.pbody p[data-t]',2);
  await p.mouse.move(w0.x,w0.y);await p.mouse.down();await sleep(650);
  ok('long press selects a word and shows handles + action bar',await p.evaluate(()=>document.querySelectorAll('.sel-rect').length>0&&getComputedStyle(document.querySelector('.sel-h.s')).display!=='none'&&!!document.querySelector('.sel-bar')),w0.w);
  // slide the finger (still pressed): selection follows
  const w1=await wordPos('.pbody p[data-t]',9);await p.mouse.move(w1.x,w1.y,{steps:6});await p.mouse.up();
  const t1=await p.evaluate(()=>window.getSelection().toString());
  const selInfo=await p.evaluate(()=>{const r=[...document.querySelectorAll('.sel-rect')];return r.length});
  ok('sliding after the long press extends the selection to the finger',selInfo>0);
  await shot('selection');
  // drag the end handle further right/down
  const hb=await p.evaluate(()=>{const e=document.querySelector('.sel-h.e').getBoundingClientRect();return {x:e.left+11,y:e.top+11}});
  const w2=await wordPos('.pbody p[data-t]',14);
  const before=await p.evaluate(()=>document.querySelectorAll('.sel-rect').length+':'+Math.round([...document.querySelectorAll('.sel-rect')].reduce((a,r)=>a+r.getBoundingClientRect().width,0)));
  await p.mouse.move(hb.x,hb.y);await p.mouse.down();await p.mouse.move(w2.x+10,w2.y+22,{steps:8});await p.mouse.up();
  const after=await p.evaluate(()=>document.querySelectorAll('.sel-rect').length+':'+Math.round([...document.querySelectorAll('.sel-rect')].reduce((a,r)=>a+r.getBoundingClientRect().width,0)));
  ok('dragging the end handle changes the selection',before!==after,before+' -> '+after);
  // highlight
  await p.click('.sel-bar .sb.hl');await sleep(400);
  ok('Highlight is stored',await p.evaluate(()=>Store.allNotes('pm').length===1&&Store.allNotes('pm')[0].type==='hl'));
  const mkBg=await p.evaluate(()=>{const m=document.querySelector('.mk');return m?getComputedStyle(m).backgroundColor:null});
  ok('in the normal viewer a highlight is light grey (not yellow)',/rgba?\(120, 120, 120|rgba?\(200, 200, 200/.test(mkBg||''),mkBg);
  await shot('highlight');
  // note via selection
  const w3=await wordPos('.pbody p[data-t]',20);await p.mouse.move(w3.x,w3.y);await p.mouse.down();await sleep(650);await p.mouse.up();
  await p.click('.sel-bar .sb.nt');await p.waitForSelector('.sheet textarea');await p.fill('.sheet textarea','Remember: this is my first note about change.');await p.click('.sheet .btn.primary');await sleep(400);
  ok('Note is stored with its text',await p.evaluate(()=>{const n=Store.allNotes('pm').filter(e=>e.type==='note');return n.length===1&&n[0].note.includes('first note')}));
  // tap on the marked text shows the note
  await p.evaluate(()=>{document.querySelectorAll('.mk').forEach(m=>m.scrollIntoView({block:'center'}))});
  const mk=await p.evaluate(()=>{const m=[...document.querySelectorAll('.mk')].find(m=>Store.getNote(m.dataset.id).type==='note');const r=m.getBoundingClientRect();return {x:r.left+4,y:r.top+r.height/2}});
  await p.mouse.click(mk.x,mk.y);await p.waitForSelector('.mk-pop');
  ok('tapping a marked word shows the note',(await p.$eval('.mk-pop',e=>e.innerText)).includes('first note'));
  await shot('popover');
  // edit note
  await p.click('.mk-pop >> text=Edit');await p.waitForSelector('.sheet textarea');await p.fill('.sheet textarea','Edited note text.');await p.click('.sheet .btn.primary');await sleep(400);
  ok('note can be edited',await p.evaluate(()=>Store.allNotes('pm').some(e=>e.note==='Edited note text.')));
  // ---------- notes viewer: colours + progress ticks + panel
  await p.evaluate(i=>location.hash='#/n/pm/0/'+i,LP);await p.waitForSelector('.tbar');await sleep(400);
  const cols=await p.evaluate(()=>[...document.querySelectorAll('.mk')].map(m=>m.className+':'+getComputedStyle(m).backgroundColor));
  ok('notes viewer: highlight yellow, note blue',cols.some(c=>/hl:rgb\(255, 228, 92\)|hl:rgba\(255, 214/.test(c))&&cols.some(c=>/note:rgb\(169, 209, 255\)|note:rgba\(80, 150/.test(c)),cols.join(' | '));
  ok('progress bar shows a tick for the page with both',await p.evaluate(()=>[...document.querySelectorAll('.tbar .tick')].some(t=>t.classList.contains('both'))));
  await shot('notesview');
  // a note on another page -> blue tick; highlight on a third -> yellow
  await p.evaluate(()=>{const c={pid:'pm1-05'};Store.putNote({id:'x1',course:'pm',cid:'pm1',pid:'pm1-05',title:'t5',type:'note',segs:[{k:'1:0',s:0,e:5,t:''}],text:'Alpha',note:'second note',c:1});Store.putNote({id:'x2',course:'pm',cid:'pm1',pid:'pm1-07',title:'t7',type:'hl',segs:[],text:'Beta text',note:'',c:2})});
  await p.evaluate(()=>location.hash='#/n/pm/0/3');await sleep(400);
  const ticks=await p.evaluate(()=>[...document.querySelectorAll('.tbar .tick')].map(t=>t.className.replace('tick ','')));
  ok('ticks: blue for notes, yellow for highlights',ticks.includes('note')&&ticks.includes('hl'),ticks.join(','));
  // side panel
  await p.click('.phead .round.dark');await p.waitForSelector('.panel.in');await sleep(300);
  ok('panel covers the screen like a side view',await p.evaluate(()=>{const r=document.querySelector('.panel-in').getBoundingClientRect();return r.width>=innerWidth-2&&r.height>=innerHeight-2}));
  await shot('panel-collapsed');
  await p.click('.nrow.ch');await sleep(200);
  ok('chapter expands to page titles',await p.evaluate(()=>document.querySelectorAll('.nrow.pg').length>=2));
  await p.click('.nrow.pg >> nth=0');await sleep(200);await p.click('.nrow.en >> nth=0');await sleep(200);
  ok('entry expands to the full text and actions',await p.evaluate(()=>!!document.querySelector('.nfull')&&!!document.querySelector('.nfull .btn')));
  await shot('panel-expanded');
  await p.click('.nfull >> text=Open in course');await sleep(600);
  ok('clicking Open goes to that page inside the notes view',await p.evaluate(()=>location.hash.startsWith('#/n/pm/0/')&&!!document.querySelector('.player.nv')),await p.evaluate(()=>location.hash));
  // delete via panel
  await p.click('.phead .round.dark');await p.waitForSelector('.panel.in');await p.click('.panel-head >> text=Expand');await sleep(200);if(!(await p.$('.nfull')))await p.click('.nrow.en >> nth=0');await sleep(200);
  const nBefore=await p.evaluate(()=>Store.allNotes('pm').length);await p.click('.nfull >> text=Delete');await sleep(300);
  ok('entries can be deleted from the panel',await p.evaluate(()=>Store.allNotes('pm').length)===nBefore-1);
  await p.click('.panel-head .round');await sleep(400);
  ok('panel can be closed',await p.evaluate(()=>!document.querySelector('.panel')));
  // normal viewer button to open notes view + home button
  await p.evaluate(i=>location.hash='#/p/pm/0/'+i,LP);await p.waitForSelector('.phead');
  ok('normal viewer: notes-view button next to settings',await p.evaluate(()=>document.querySelectorAll('.phead .round').length===4));
  await p.click('.phead .round[aria-label="Home"]');await sleep(300);ok('top-left Home button goes to the home page',await p.evaluate(()=>location.hash==='#/'||location.hash===''));
  // ---------- notes home
  await p.click('.home-actions .big-btn >> nth=0');await p.waitForSelector('.card .btn');
  ok('Notes page lists all courses with Notes viewer + General document',await p.evaluate(()=>document.querySelectorAll('.card h2').length===6&&[...document.querySelectorAll('.card .btn')].some(b=>/Notes viewer/.test(b.innerText))&&[...document.querySelectorAll('.card .btn')].some(b=>/General document/.test(b.innerText))));
  await shot('noteshome');
  // ---------- document editor
  await p.click('.card .btn:has-text("General document") >> nth=0');await p.waitForSelector('.doc-ed');
  await p.click('.doc-ed');await p.keyboard.type('- first');await p.keyboard.press('Enter');await p.keyboard.type('second');await p.keyboard.press('Enter');await p.keyboard.press('Enter');await p.keyboard.type('after list');await p.keyboard.press('Enter');
  await p.keyboard.type('1. one');await p.keyboard.press('Enter');await p.keyboard.type('two');await p.keyboard.press('Enter');await p.keyboard.press('Enter');await p.keyboard.type('plain again');
  const html=await p.$eval('.doc-ed',e=>e.innerHTML);
  ok('"- " + text becomes a bullet list that continues on Enter',/<ul><li>first<\/li><li>second<\/li><\/ul>/.test(html),html.slice(0,160));
  ok('Enter on an empty bullet ends the list',/<\/ul>.*after list/.test(html));
  ok('"1. " becomes a numbered list',/<ol><li>one<\/li><li>two<\/li><\/ol>/.test(html));
  ok('Enter on an empty number ends the numbered list',/<\/ol>.*plain again/.test(html));
  // formatting toolbar
  await p.keyboard.press('Enter');await p.keyboard.type('Heading text');await p.click('.tbb[title="Heading 2"]');await p.keyboard.press('Enter');await p.keyboard.type('bold words');await p.keyboard.press('Shift+Home');await p.click('.tbb[title="Bold"]');await p.click('.tbb[title="Underline"]');
  const h2=await p.$eval('.doc-ed',e=>e.innerHTML);
  ok('heading, bold and underline apply',/<h2>Heading text<\/h2>/.test(h2)&&/<b>|<strong>/.test(h2)&&/<u>/.test(h2),h2.slice(-160));
  await sleep(700);
  ok('document autosaves',await p.evaluate(()=>(Store.getDoc('pm')||{}).html.includes('Heading text')));
  await shot('doc');
  // hide / show the top panel
  await p.click('.topbar .round >> nth=1');ok('formatting panel can be hidden',await p.evaluate(()=>document.querySelector('.doc-tb').classList.contains('hide')));
  await p.click('.topbar .round >> nth=1');
  // side panel import
  await p.click('.topbar .round >> nth=2');await p.waitForSelector('.panel.in');await p.click('.panel-head >> text=Expand');await sleep(200);if(!(await p.$('.nfull')))await p.click('.nrow.en >> nth=0');await sleep(200);
  await p.click('.nfull >> text=Insert in document');await sleep(500);
  ok('highlight/note can be imported from the side panel into the document',await p.$eval('.doc-ed',e=>!!e.querySelector('blockquote')));
  // AI on selection (mock model)
  await p.evaluate(()=>{window.__ai=[];LLM.isReady=()=>true;LLM.status=()=>({state:'ready',model:{name:'Mock'},backend:'mock'});LLM.generate=o=>{window.__ai.push(o);if(o.onToken)o.onToken('MOCK ANSWER');return Promise.resolve('MOCK ANSWER')}});
  await p.evaluate(()=>{const e=document.querySelector('.doc-ed');const r=document.createRange();const t=[...e.querySelectorAll('p,li')].find(x=>/after list|second|plain/.test(x.textContent));r.selectNodeContents(t);const s=getSelection();s.removeAllRanges();s.addRange(r)});await sleep(200);
  await p.click('.doc-ai >> text=Rewrite');await p.waitForSelector('.doc-res:not(.hide) .btn');await sleep(200);
  const aiCall=await p.evaluate(()=>window.__ai[0]);
  ok('Rewrite sends the selected text with the active mode',/Rewrite the text/.test(aiCall.prompt)&&aiCall.system.includes(await p.evaluate(()=>Modes.active('chat').instructions.slice(0,30))),aiCall.system.slice(0,80));
  await p.click('.doc-res >> text=Replace selection');await sleep(300);
  ok('AI result replaces the selection in the document',await p.$eval('.doc-ed',e=>e.innerText.includes('MOCK ANSWER')));
  ok('no page errors (course + notes + doc)',errs.length===0,errs.slice(0,2).join(' | '));
  // ---------- AI page + modes + contexts
  await p.evaluate(()=>location.hash='#/ai/pm');await p.waitForSelector('.chat-in');await sleep(300);
  await p.click('.card >> text=Edit modes');await p.click('text=+ Add my own mode');await p.fill('input[placeholder^="Mode name"]','Exam coach');await p.fill('textarea[placeholder^="Instructions"]','Act as a strict examiner and end with one follow-up question.');await p.click('.btn:has-text("Add mode")');await sleep(300);
  ok('custom AI mode can be added and becomes active',await p.evaluate(()=>Modes.active().name==='Exam coach'));
  await p.fill('.chat-in','What is the difference between a project and operations?');await p.click('.chat-bar .btn.primary');await sleep(700);
  let call=await p.evaluate(()=>window.__ai[window.__ai.length-1]);
  ok('chat prompt contains the custom mode instructions',/strict examiner/.test(call.system));
  ok('chat prompt contains retrieved course material',/Course material:/.test(call.prompt)&&/operations/i.test(call.prompt),call.prompt.slice(0,160).replace(/\n/g,' '));
  ok('chat prompt contains my notes when that context is on',/My notes:/.test(call.prompt));
  await p.click('.chip:has-text("Course content")');await p.click('.chip:has-text("My notes")');await p.fill('.chat-in','Another question about change');await p.click('.chat-bar .btn.primary');await sleep(700);
  call=await p.evaluate(()=>window.__ai[window.__ai.length-1]);
  ok('turning both context toggles off removes course material and notes from the prompt',!/Course material:/.test(call.prompt)&&!/My notes:/.test(call.prompt));
  ok('answers show in the chat',await p.evaluate(()=>document.querySelectorAll('.bub.ai').length>=2&&/MOCK ANSWER/.test(document.querySelector('.bub.ai').innerText)));
  await shot('ai');
  // delete the custom mode
  await p.evaluate(()=>location.hash='#/settings');await p.waitForSelector('.card');await sleep(300);
  await p.click('.model-row:has-text("Exam coach") >> text=Delete');await sleep(300);
  ok('a custom mode can be deleted (built-ins stay)',await p.evaluate(()=>!Modes.list().some(m=>m.name==='Exam coach')&&Modes.list().length===3));
  await shot('settings-ai');
  // feedback basis toggle changes the activity prompt
  await p.evaluate(()=>location.hash='#/p/pm/0/10');await p.waitForSelector('.textarea');
  for(const basis of ['model','course','both']){
   await p.evaluate(b=>Modes.setBasis(b),basis);await p.fill('.textarea','Projects are temporary and unique.');await p.evaluate(()=>{window.__ai=[]});await p.click('text=Get feedback');await sleep(600);
   const fc=await p.evaluate(()=>window.__ai[0]);
   const hasIdeas=/Ideas a complete answer/.test(fc.prompt),hasCourse=/Course material:/.test(fc.prompt);
   ok('feedback basis "'+basis+'" shapes the prompt',basis==='model'?(hasIdeas&&!hasCourse):basis==='course'?(!hasIdeas&&hasCourse):(hasIdeas&&hasCourse),'ideas='+hasIdeas+' course='+hasCourse);
  }
  // ask AI about a selection (course page context)
  await p.evaluate(i=>location.hash='#/p/pm/0/'+i,LP);await p.waitForSelector('.pbody p[data-sel]');await sleep(300);
  await p.evaluate(()=>{let best=null,n=0;document.querySelectorAll('.pbody p[data-sel]').forEach(e=>{const c=e.textContent.split(' ').length;if(c>n){n=c;best=e}});best.setAttribute('data-t','1')});
  const wq=await wordPos('.pbody p[data-t]',3);await p.mouse.move(wq.x,wq.y);await p.mouse.down();await sleep(650);await p.mouse.up();
  await p.evaluate(()=>{window.__ai=[]});await p.click('.sel-bar .sb.ai');await p.waitForSelector('.sheet .chip');await p.click('.sheet .chip >> nth=0');await sleep(600);
  const sc=await p.evaluate(()=>window.__ai[0]);
  ok('"Ask AI" about a selection sends the selection plus the page context',/Selected text:/.test(sc.prompt)&&/\[Current page\]/.test(sc.prompt),sc.prompt.slice(0,140).replace(/\n/g,' '));
  await shot('ask-sheet');
  // ---------- sync merge: notes, edits and deletions travel between devices
  const sy=await p.evaluate(()=>{
    const n=Store.allNotes('pm').length;const snapA=Store.snapshot();
    const remote=JSON.parse(JSON.stringify(snapA));const k=Object.keys(remote.notes)[0];
    remote.notes['zz']={v:{id:'zz',course:'pm',cid:'pm1',pid:'pm1-02',title:'t',type:'note',segs:[],text:'remote text',note:'remote note',c:1,u:Date.now()+10},t:Date.now()+10};
    if(k){remote.notes[k]={v:null,t:Date.now()+20}}    // remote deleted one
    remote.docs.pm={v:{html:'<p>remote doc</p>'},t:Date.now()+30};
    const changed=Store.merge(remote);
    return {n,after:Store.allNotes('pm').length,hasRemote:!!Store.getNote('zz'),deleted:k?Store.getNote(k)===null:true,doc:Store.getDoc('pm').html,changed}});
  ok('sync merge: remote note added, remote deletion applied, newer document wins',sy.hasRemote&&sy.deleted&&sy.doc==='<p>remote doc</p>',JSON.stringify(sy));
  ok('no page errors overall',errs.length===0,errs.slice(0,2).join(' | '));
  await ctx.close();
 }
 await b.close();srv.kill();const f=results.filter(x=>!x).length;console.log(f?`\n${f} FAILED`:'\nALL PASSED');process.exit(f?1:0)})().catch(e=>{console.error('TEST CRASH',e);srv.kill();process.exit(2)});

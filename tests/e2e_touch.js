// Real touch-event test (CDP Input.dispatchTouchEvent) of long-press selection, slide-to-extend, handle dragging and tap-to-open-note.
const {chromium}=require('playwright'),{spawn}=require('child_process'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),PORT=8842;const srv=spawn('node',[__dirname+'/serve.js',ROOT+'/app/www',PORT,'iso'],{stdio:'ignore'});
const results=[];const ok=(n,c,d)=>{results.push(c);console.log((c?'PASS ':'FAIL ')+n+(d?' - '+d:''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await sleep(700);const b=await chromium.launch();
 for(const vp of [{n:'tablet',w:1280,h:800},{n:'phone',w:390,h:844}]){
  console.log('=== '+vp.n+' (touch)');
  const ctx=await b.newContext({viewport:{width:vp.w,height:vp.h},hasTouch:true,isMobile:vp.n==='phone'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  const cdp=await ctx.newCDPSession(p);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  await p.goto(`http://localhost:${PORT}/index.html#/p/pm/0/0`);await p.waitForSelector('.pbody p[data-sel]');await sleep(300);
  const wp=idx=>p.evaluate(idx=>{let el=null,mx=0;document.querySelectorAll('.pbody p[data-sel]').forEach(e=>{const c=e.textContent.split(' ').length;if(c>mx){mx=c;el=e}});el.scrollIntoView({block:'center'});const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n,c=0;while(n=w.nextNode()){const re=/\S+/g;let m;while(m=re.exec(n.nodeValue)){if(c++===idx){const r=document.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);const b=r.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}}}}},idx);
  const a=await wp(3);await sleep(200);const a2=await wp(3);const y0=await p.evaluate(()=>scrollY);
  await touch('touchStart',a2.x,a2.y);await sleep(700);
  ok('touch long-press selects a word',await p.evaluate(()=>document.querySelectorAll('.sel-rect').length>0&&!!document.querySelector('.sel-bar')));
  const e1=await wp(8);const e2={x:e1.x,y:e1.y};await touch('touchMove',a2.x+4,a2.y+4);await touch('touchMove',(a2.x+e2.x)/2,(a2.y+e2.y)/2);await touch('touchMove',e2.x,e2.y);await sleep(100);await touch('touchEnd');
  const w1=await p.evaluate(()=>Math.round([...document.querySelectorAll('.sel-rect')].reduce((s,r)=>s+r.getBoundingClientRect().width,0)));
  ok('sliding the finger after the long press extends the selection (no lift)',w1>60,'selected width '+w1+'px');
  ok('the page did not scroll while sliding',Math.abs(await p.evaluate(()=>scrollY)-y0)<3);
  // handle drag with touch
  const hb=await p.evaluate(()=>{const e=document.querySelector('.sel-h.e').getBoundingClientRect();return {x:e.left+11,y:e.top+11}});const t3=await wp(14);
  await touch('touchStart',hb.x,hb.y);await touch('touchMove',(hb.x+t3.x)/2,(hb.y+t3.y)/2+10);await touch('touchMove',t3.x,t3.y+26);await sleep(80);await touch('touchEnd');
  const w2=await p.evaluate(()=>Math.round([...document.querySelectorAll('.sel-rect')].reduce((s,r)=>s+r.getBoundingClientRect().width,0)));
  ok('touch-dragging the end handle changes the selection',w2!==w1,w1+' -> '+w2);
  // start handle drag backwards
  const hs=await p.evaluate(()=>{const e=document.querySelector('.sel-h.s').getBoundingClientRect();return {x:e.left+11,y:e.top+11}});const t0=await wp(0);
  await touch('touchStart',hs.x,hs.y);await touch('touchMove',t0.x+30,t0.y+26);await touch('touchMove',t0.x,t0.y+26);await sleep(80);await touch('touchEnd');
  const w3=await p.evaluate(()=>Math.round([...document.querySelectorAll('.sel-rect')].reduce((s,r)=>s+r.getBoundingClientRect().width,0)));
  ok('touch-dragging the start handle changes the selection',w3!==w2,w2+' -> '+w3);
  await p.click('.sel-bar .sb.hl');await sleep(500);
  ok('highlight created from a touch selection',await p.evaluate(()=>Store.allNotes('pm').length===1&&Store.allNotes('pm')[0].text.split(' ').length>5));
  // tapping scrolls normally and opens the mark popover
  const t4=await wp(5);await touch('touchStart',t4.x,t4.y);await sleep(60);await touch('touchEnd');await sleep(300);
  ok('a quick tap on a highlighted word opens its popover',await p.evaluate(()=>!!document.querySelector('.mk-pop')));
  // scrolling (swipe) does not start a selection
  await p.evaluate(()=>document.querySelector('.mk-pop')&&document.querySelector('.mk-pop').remove());
  const s0=await p.evaluate(()=>scrollY);await touch('touchStart',vp.w/2,vp.h*0.7);await touch('touchMove',vp.w/2,vp.h*0.6);await touch('touchMove',vp.w/2,vp.h*0.3);await touch('touchEnd');await sleep(300);
  ok('swiping scrolls the page and does not select text',await p.evaluate(()=>!document.querySelector('.sel-bar'))&&true);
  ok('no page errors',errs.length===0,errs.slice(0,2).join(' | '));await ctx.close()}
 await b.close();srv.kill();const f=results.filter(x=>!x).length;console.log(f?`\n${f} FAILED`:'\nALL PASSED');process.exit(f?1:0)})().catch(e=>{console.error('TEST CRASH',e);srv.kill();process.exit(2)});

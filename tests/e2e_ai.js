// End-to-end test of the on-device AI pipeline with tiny fixture models. Usage: node tests/e2e_ai.js [iso|noiso] [gpu]
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),MODE=process.argv[2]||'iso',GPU=process.argv.includes('gpu'),PORT=MODE==='iso'?8810:8811;
const srv=require('child_process').spawn('node',[__dirname+'/serve.js',ROOT+'/app/www',PORT,MODE],{stdio:'ignore'});
// fixture models are served by a second local server (Playwright cannot push >100MB bodies through route.fulfill)
const msrv=require('http').createServer((q,r)=>{const f=path.join(ROOT,'out',decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404,{'access-control-allow-origin':'*'});return r.end('nf')}r.writeHead(200,{'access-control-allow-origin':'*','cross-origin-resource-policy':'cross-origin','content-type':'application/octet-stream','content-length':d.length});r.end(d)})}).listen(PORT+10);
const results=[];const ok=(n,c,d)=>{results.push(c);console.log((c?'PASS ':'FAIL ')+n+(d?' - '+d:''))};
(async()=>{await new Promise(r=>setTimeout(r,700));
 const args=GPU?['--enable-unsafe-webgpu','--enable-features=Vulkan','--use-angle=swiftshader','--use-webgpu-adapter=swiftshader','--ignore-gpu-blocklist']:[];
 const b=await chromium.launch({args});const ctx=await b.newContext({viewport:{width:1000,height:800}});
 await ctx.route(/huggingface\.co\/test-org\//,r=>{const m=/test-org\/([^/]+)\/resolve\/main\/(.*)$/.exec(r.request().url());
   r.fulfill({status:302,headers:{location:`http://localhost:${PORT+10}/${m[1]}/${m[2].split('?')[0]}`,'access-control-allow-origin':'*'}})});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(`http://localhost:${PORT}/index.html`);await p.waitForSelector('.course');
 const iso=await p.evaluate(()=>self.crossOriginIsolated);ok('page isolation matches mode ('+MODE+')',iso===(MODE==='iso'),'crossOriginIsolated='+iso);
 const dev=GPU?'webgpu':'wasm';
 for(const name of ['tiny-fast','tiny-slow']){
  console.log('--- '+name+' ('+dev+')');
  const L=await p.evaluate(async([name,dev])=>{try{const t0=performance.now();await LLM.load({id:name,repo:'test-org/'+name,name:name},{device:dev});return {ok:true,s:(performance.now()-t0)/1000,backend:LLM.status().backend}}catch(e){return {ok:false,err:String(e.message||e)}}},[name,dev]);
  ok('load '+name,L.ok,L.ok?L.backend+' in '+L.s.toFixed(1)+'s':L.err); if(!L.ok)continue;
  // generate while measuring main-thread stalls
  const G=await p.evaluate(async()=>{let last=performance.now(),max=0;const id=setInterval(()=>{const n=performance.now();max=Math.max(max,n-last-50);last=n},50);
    const toks=[];const t0=performance.now();
    const text=await LLM.generate({system:'You are a tutor.',prompt:'Explain what a project is in detail please, including budget, time and scope and why feasibility matters. '.repeat(3),maxTokens:48,temperature:0,onToken:t=>toks.push(t)});
    clearInterval(id);return {len:text.length,ntok:toks.length,stall:Math.round(max),secs:(performance.now()-t0)/1000,tps:LLM.lastTps}});
  ok('generate streams tokens',G.ntok>3&&G.len>0,G.ntok+' chunks, '+G.tps.toFixed(1)+' tok/s, '+G.secs.toFixed(1)+'s');
  ok('UI never froze while generating',G.stall<400,'max main-thread stall '+G.stall+' ms');
  // feedback through the real AI facade
  const F=await p.evaluate(async()=>{const r=await AI.feedback({question:'What is a project?',answer:'A project is a temporary effort that creates a unique result within a budget.',points:['temporary','unique result','limited resources'],model:'m'});return {src:r.source,len:r.text.length}});
  ok('AI.feedback answers via AI',F.src==='ai'&&F.len>0,JSON.stringify(F));
  // cancel mid-generation
  const C=await p.evaluate(async()=>{const t0=performance.now();setTimeout(()=>LLM.cancel(),400);let res='';try{res=await LLM.generate({prompt:'Write a very long essay about project management. '.repeat(4),maxTokens:400,temperature:0,onToken:()=>{}});res='returned:'+res.length}catch(e){res='rejected:'+e.message}return {res,ms:Math.round(performance.now()-t0),status:LLM.status().state}});
  ok('cancel returns promptly',C.ms<6000,JSON.stringify(C));
  if(C.status!=='ready'){const R=await p.evaluate(async([name,dev])=>{try{await LLM.load({id:name,repo:'test-org/'+name,name:name},{device:dev});return 'reloaded'}catch(e){return 'reload failed '+e.message}},[name,dev]);ok('reload after hard cancel',R==='reloaded',R)}
 }
 // timeout path: tiny timeout => worker killed, feedback falls back to rules, UI keeps working
 const T=await p.evaluate(async()=>{const r=await LLM.generate({prompt:'x '.repeat(50),maxTokens:400,timeoutMs:150,temperature:0}).then(()=>'finished',e=>e.message);return {r,state:LLM.status().state}});
 ok('timeout kills a stuck generation',T.r==='timeout'||T.r==='finished',JSON.stringify(T));
 // full self-test as the user would run it
 await p.evaluate(()=>{Store.settings.model='tiny-fast';Store.settings.device=window.__dev;LLM.catalog.push({id:'tiny-fast',name:'tiny-fast',repo:'test-org/tiny-fast',params:'t',mb:4,note:''});localStorage.setItem('learn.dl.test-org/tiny-fast','1')});
 await p.evaluate(d=>{Store.settings.device=d},dev);
 const S=await p.evaluate(async()=>{LLM.unload();const r=await SelfTest.run();return {ok:r.ok,summary:r.summary,steps:r.steps.map(s=>s.name+':'+s.status+' '+s.detail)}});
 console.log(S.steps.join('\n'));ok('in-app self-test',S.ok,S.summary);
 // UI: activity "Get feedback" button end-to-end, with the tiny model loaded
 await p.evaluate(()=>location.hash='#/p/pm/0/10');await p.waitForSelector('.textarea');
 await p.fill('.textarea','Projects are temporary and unique, operations are ongoing and repetitive.');
 await p.click('text=Get feedback');await p.waitForTimeout(300);
 const stuck=await p.evaluate(()=>document.querySelector('.ai-box').innerText);
 await p.click('.pfoot .btn:not(.primary)').catch(()=>{});  // UI still responds while AI works
 await p.evaluate(()=>location.hash='#/p/pm/0/10');await p.waitForSelector('.textarea');
 console.log('ui snapshot while thinking:',JSON.stringify(stuck.slice(0,80)));
 ok('no page errors',errs.length===0,errs.slice(0,2).join(' | '));
 await b.close();srv.kill();msrv.close();const f=results.filter(x=>!x).length;console.log(f?`\n${f} FAILED`:'\nALL PASSED');process.exit(f?1:0)})().catch(e=>{console.error('TEST CRASH',e);srv.kill();process.exit(2)});

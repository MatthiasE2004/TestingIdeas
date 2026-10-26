// Real app UI (Chromium) <-> real Java NativeLlm + ONNX Runtime (via HTTP bridge standing in for window.Android). Usage: node tests/e2e_native.js
const {chromium}=require('playwright'),{spawn,execSync}=require('child_process'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),C=ROOT+'/out/cache',T=ROOT+'/out/jvmtest',BP=8830,AP=8831;
const results=[];const ok=(n,c,d)=>{results.push(c);console.log((c?'PASS ':'FAIL ')+n+(d?' - '+d:''))};
execSync(`mkdir -p ${T}/classes && javac -nowarn --release 17 -cp ${C}/onnxruntime-desktop-1.20.0.jar:${C}/gson.jar -d ${T}/classes ${ROOT}/android/src/nl/learn/courses/BpeTokenizer.java ${ROOT}/android/src/nl/learn/courses/NativeLlm.java ${ROOT}/tests/jvm/nl/learn/courses/BridgeServer.java 2>&1 | grep -v JAVA_TOOL || true`,{shell:'/bin/bash'});
const bridge=spawn('java',['-cp',`${T}/classes:${C}/onnxruntime-desktop-1.20.0.jar:${C}/gson.jar`,'nl.learn.courses.BridgeServer',ROOT+'/out',String(BP)],{stdio:['ignore','pipe','inherit']});
const app=spawn('node',[__dirname+'/serve.js',ROOT+'/app/www',AP,'iso'],{stdio:'ignore'});
const stop=()=>{bridge.kill();app.kill()};
(async()=>{await new Promise(r=>{bridge.stdout.on('data',d=>{if(String(d).includes('ready'))r()})});await new Promise(r=>setTimeout(r,500));
 const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(B=>{const sx=(m,u,body)=>{const x=new XMLHttpRequest();x.open(m,B+u,false);x.send(body||null);return x.responseText};
  window.Android={llmPost:j=>sx('POST','/post',j),llmStorage:()=>sx('GET','/storage'),llmComplete:r=>sx('GET','/complete?repo='+encodeURIComponent(r))==='true',llmPurge:r=>+sx('GET','/purge?repo='+encodeURIComponent(r)),llmPurgeAll:()=>sx('GET','/purgeall'),llmConsumeCrash:()=>0,consumeRenderCrashes:()=>0,openUrl(){}};
  (async function poll(){for(;;){try{const r=await fetch(B+'/events');const a=await r.json();a.forEach(e=>window.__llmEvent&&window.__llmEvent(e))}catch(e){await new Promise(r=>setTimeout(r,500))}}})()},`http://localhost:${BP}`);
 await p.goto(`http://localhost:${AP}/index.html`);await p.waitForSelector('.course');
 ok('app defaults to the native engine',await p.evaluate(()=>Store.settings.device==='native'&&LLM.nativeAvailable()));
 // register the fixture as a catalog model whose "Hugging Face" is the bridge's /hub
 await p.evaluate(()=>{LLM.catalog.unshift({id:'tiny-qwen',name:'Tiny test model',params:'0.01B',repo:'test/tiny-qwen',mb:4,note:'fixture'})});
 await p.evaluate(()=>location.hash='#/settings');await p.waitForSelector('.model-row');
 await p.click('.model-row:has-text("Tiny test model") button:has-text("Download")');
 await p.waitForFunction(()=>LLM.status().state==='ready',null,{timeout:60000});
 const row=await p.$eval('.model-row:has-text("Tiny test model")',e=>e.innerText.replace(/\n/g,' | '));
 ok('model downloaded + loaded natively, row shows state',/Downloaded/.test(row)&&/native/.test(row),row);
 ok('backend reports native CPU',(await p.evaluate(()=>LLM.status().backend)).startsWith('CPU (native'));
 // self-test button end to end
 await p.click('text=Run AI self-test');await p.waitForSelector('text=/PASSED|FAILED/',{timeout:60000});
 const st=await p.evaluate(()=>[...document.querySelectorAll('.model-row')].map(r=>r.innerText.replace(/\n/g,' ')).filter(t=>/Environment|Model |Generate|Feedback test/.test(t)));
 console.log(st.join('\n'));ok('in-app self-test passes natively',await p.isVisible('text=PASSED'));
 // the real activity page
 await p.evaluate(()=>location.hash='#/p/pm/0/10');await p.waitForSelector('.textarea');
 await p.fill('.textarea','Projects are temporary and unique, operations are ongoing and repetitive.');
 await p.click('text=Get feedback');await p.waitForFunction(()=>{const b=document.querySelector('.ai-box');return b&&!b.querySelector('button')&&!/Thinking|Checking/.test(b.innerText)},null,{timeout:60000});
 const fb=await p.$eval('.ai-box',e=>e.innerText);ok('Get feedback answered by the native AI',/AI tutor/i.test(fb)&&fb.length>60,JSON.stringify(fb.slice(0,90)));
 // cancel via UI while a longer generation runs
 const C2=await p.evaluate(async()=>{setTimeout(()=>LLM.cancel(),120);try{const t=await LLM.generate({prompt:'Write a long essay. '.repeat(5),maxTokens:400,temperature:0});return 'returned '+t.length}catch(e){return 'rejected '+e.message}});
 ok('cancel stops native generation promptly',/returned|cancelled/.test(C2)&&await p.evaluate(()=>LLM.isReady()),C2);
 // storage listing + delete from model manager
 await p.evaluate(()=>location.hash='#/settings');await p.waitForSelector('.model-row');await p.waitForTimeout(600);
 const sz=await p.$eval('.model-row:has-text("Tiny test model")',e=>e.innerText.replace(/\n/g,' | '));ok('model manager lists size of native files',/MB/.test(sz)&&/Downloaded/.test(sz),sz);
 p.on('dialog',d=>d.accept());await p.click('.model-row:has-text("Tiny test model") button:has-text("Delete")');await p.waitForTimeout(800);
 const after=await p.$eval('.model-row:has-text("Tiny test model")',e=>e.innerText.replace(/\n/g,' | '));ok('delete removes native files',/Download/.test(after)&&!/Downloaded/.test(after),after);
 ok('no page errors',errs.length===0,errs.slice(0,2).join(' | '));
 await b.close();stop();const f=results.filter(x=>!x).length;console.log(f?`\n${f} FAILED`:'\nALL PASSED');process.exit(f?1:0)})().catch(e=>{console.error('TEST CRASH',e);stop();process.exit(2)});

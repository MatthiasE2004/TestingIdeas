/* crypto-lab: Week 5 Cryptography (Introduction to cyber security).
   Hands-on demos that mirror the week, each opened by a predict-then-check question:
   1 Ciphers   - Caesar shift and substitution ciphers (plaintext, ciphertext, cipher, key, encryption, decryption)
                 and a crack-it challenge: brute force by trying every key until you get recognisable plaintext.
   2 Keys      - key length (2^n keys; DES 56-bit brute forced in under a day; AES 128/192/256; Blowfish up to 448)
                 and the key distribution problem (n(n-1)/2 keys; meeting, post, armed courier, internet + Eve).
   3 Public key - Alice, Bob and Eve with the padlock analogy, using a real (toy-sized) RSA key pair.
   4 Hashing   - live SHA-256 (SubtleCrypto, JS fallback): fixed length, one-way, a tiny change changes everything;
                 checking a download against a published hash; MD5/SHA-1 broken, SHA-2 recommended.
   5 Signatures - case study 1 (Alice signs the profit statement; Eve alters it) and case study 2 (Eve's fake key
                 for Bob; digital certificates from a Certificate Authority).
   Tool id: crypto-lab. Plain ES2017. State saved with ctx.save; completes when all predictions and the crack challenge are done. */
(function(){
var h=H.h, KEY='crypto-lab';
var css=
'.cl-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.cl-tabs .chip{min-height:44px}'+
'.cl-wrap{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}.cl-wrap>*{min-width:0}.cl-w .cl-wrap{grid-template-columns:1fr 1fr}'+
'.cl-seg{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.cl-seg .chip{min-height:44px}'+
'.cl-range{width:100%;height:44px;accent-color:#0B0B0B;margin:0}'+
'.cl-mono{font-family:var(--mono);word-break:break-all}'+
'.cl-out{font-family:var(--mono);font-size:1.05rem;background:var(--surface2);border-radius:var(--r-sm);padding:12px 14px;word-break:break-word;min-height:48px;margin:6px 0}'+
'.cl-out.dark{background:#0B0B0B;color:#EDEDED}'+
'.cl-alpha{display:grid;grid-template-columns:repeat(13,1fr);gap:3px;margin:8px 0}.cl-w .cl-alpha{grid-template-columns:repeat(13,1fr)}'+
'.cl-alpha div{display:flex;flex-direction:column;align-items:center;font-family:var(--mono);font-size:.78rem;border-radius:8px;background:var(--surface2);padding:3px 0;line-height:1.35}'+
'.cl-alpha div b{color:var(--red);font-weight:600}.cl-alpha div.on{outline:2px solid var(--ink)}'+
'.cl-pred{border:1.5px dashed var(--ink3);border-radius:var(--r-md);padding:14px 16px;margin:0 0 14px;background:var(--surface)}'+
'.cl-pred.isok{border:1.5px solid var(--green)}.cl-pred.isbad{border:1.5px solid var(--red)}'+
'.cl-opts{display:flex;flex-direction:column;gap:8px;margin-top:10px}.cl-opts button{text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);padding:10px 14px;min-height:44px;cursor:pointer;font:inherit;color:inherit}'+
'.cl-opts button.right{border-color:var(--green);background:rgba(62,142,82,.1)}.cl-opts button.wrong{border-color:var(--red);background:rgba(215,25,33,.07)}.cl-opts button[disabled]{cursor:default}'+
'.cl-pill{display:inline-block;border-radius:99px;padding:2px 12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;background:var(--surface2);border:1px solid var(--line)}'+
'.cl-pill.r{background:var(--red);color:#fff;border-color:var(--red)}.cl-pill.g{background:var(--green);color:#fff;border-color:var(--green)}'+
'.cl-locked{border:1.5px dashed var(--line);border-radius:var(--r-md);padding:18px;text-align:center;color:var(--ink2);font-size:.92rem}'+
'.cl-all{display:grid;grid-template-columns:1fr;gap:4px;margin-top:8px}.cl-w .cl-all{grid-template-columns:1fr 1fr}'+
'.cl-all button{display:grid;grid-template-columns:36px 1fr;gap:8px;text-align:left;border:1px solid var(--line);background:var(--surface);border-radius:10px;padding:8px 10px;min-height:44px;cursor:pointer;font-family:var(--mono);font-size:.8rem;color:inherit;align-items:center}'+
'.cl-all button b{color:var(--ink2)}.cl-all button.right{border-color:var(--green);background:rgba(62,142,82,.1)}.cl-all button.wrong{border-color:var(--red)}'+
'.cl-kv{display:grid;grid-template-columns:1fr auto;gap:4px 12px;font-size:.92rem;padding:8px 0;border-top:1px dotted var(--line)}.cl-kv:first-of-type{border-top:0}.cl-kv b{font-family:var(--mono);text-align:right}'+
'.cl-kv small{grid-column:1/3;color:var(--ink2);font-size:.8rem}'+
'.cl-bits{font-family:var(--mono);font-size:.8rem;color:var(--ink2);margin:4px 0 8px}'+
'.cl-net{width:100%;max-width:300px;display:block;margin:6px auto}'+
'.cl-deliv{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.cl-deliv button{border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);padding:10px;min-height:52px;cursor:pointer;font:inherit;color:inherit;text-align:left}'+
'.cl-deliv button.on{border-color:var(--ink);border-width:2px}.cl-deliv button.seen{background:var(--surface2)}'+
'.cl-steps{display:flex;gap:4px;margin:8px 0 12px}.cl-steps i{flex:1;height:6px;border-radius:99px;background:var(--line)}.cl-steps i.on{background:var(--ink)}'+
'.cl-cast{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:6px 0 12px}.cl-cast>div{border-radius:var(--r-sm);background:var(--surface2);padding:10px;font-size:.82rem;min-height:84px}'+
'.cl-cast>div.act{outline:2px solid var(--ink)}.cl-cast>div.eve{background:rgba(215,25,33,.07)}'+
'.cl-cast .label{display:block;margin-bottom:4px}.cl-key{display:inline-block;font-family:var(--mono);font-size:.7rem;border-radius:99px;padding:2px 8px;margin:2px 2px 0 0;border:1.5px solid var(--ink)}'+
'.cl-key.priv{background:var(--ink);color:var(--bg)}'+
'.cl-hash{font-family:var(--mono);font-size:.82rem;line-height:1.55;word-break:break-all;background:var(--surface2);border-radius:var(--r-sm);padding:10px 12px;margin:4px 0 8px}'+
'.cl-hash span.d{color:var(--red);font-weight:700}'+
'.cl-flow{display:flex;flex-direction:column;gap:6px;margin:8px 0}.cl-flow>div{display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:start;font-size:.9rem;padding:8px 10px;border-radius:var(--r-sm);background:var(--surface2)}'+
'.cl-flow>div>span{font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);padding-top:3px}'+
'.cl-flow>div.eve{background:rgba(215,25,33,.08)}.cl-flow>div.res{background:#0B0B0B;color:#EDEDED}.cl-flow>div.res>span{color:#8f8f8f}'+
'.cl-sw{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;font-size:.93rem}.cl-sw input{width:22px;height:22px;accent-color:#D71921}'+
'.cl-note{font-size:.8rem;color:var(--ink2);margin:8px 0 0}'+
'@media(max-width:480px){.cl-cast{grid-template-columns:1fr 1fr}.cl-cast>div.eve{grid-column:1/3;min-height:0}.cl-deliv{grid-template-columns:1fr}.cl-flow>div{grid-template-columns:1fr;gap:2px}}';
if(!document.getElementById('cl-css')){var st=document.createElement('style');st.id='cl-css';st.textContent=css;document.head.appendChild(st)}

/* ---------- helpers ---------- */
var AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function shiftText(t,k){k=((k%26)+26)%26;return t.replace(/[A-Za-z]/g,function(c){var up=c<='Z',i=AZ.indexOf(c.toUpperCase()),o=AZ[(i+k)%26];return up?o:o.toLowerCase()})}
function subText(t,key,dec){return t.replace(/[A-Za-z]/g,function(c){var up=c<='Z',C=c.toUpperCase(),o=dec?AZ[key.indexOf(C)]:key[AZ.indexOf(C)];return up?o:o.toLowerCase()})}
function randInt(n){try{var a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}catch(e){return Math.floor(Math.random()*n)}}
function randKey(){var a=AZ.split('');for(var i=a.length-1;i>0;i--){var j=randInt(i+1),t=a[i];a[i]=a[j];a[j]=t}return a.join('')}
function modpow(b,e,m){var r=1;b%=m;while(e>0){if(e&1)r=(r*b)%m;b=(b*b)%m;e=Math.floor(e/2)}return r}
function sci(x){if(x<1e6)return Math.round(x).toLocaleString('en-GB');var e=Math.floor(Math.log10(x));return (x/Math.pow(10,e)).toFixed(1).replace(/\.0$/,'')+' × 10^'+e}
function sciPow2(n){if(n<20)return Math.pow(2,n).toLocaleString('en-GB');var l=n*Math.log10(2),e=Math.floor(l);return Math.pow(10,l-e).toFixed(1).replace(/\.0$/,'')+' × 10^'+e}
function fmtTimeLog(l10){/* l10 = log10(seconds) */ if(l10<0)return 'less than a second';var s=Math.pow(10,l10);
  if(l10<1.78)return Math.round(s)+' seconds';if(l10<3.56)return Math.round(s/60)+' minutes';if(l10<4.94)return Math.round(s/3600)+' hours';if(l10<7.5)return Math.round(s/86400)+' days';
  var ly=l10-7.499;if(ly<3)return Math.round(Math.pow(10,ly))+' years';if(ly<6)return Math.round(Math.pow(10,ly-3))+' thousand years';if(ly<9)return Math.round(Math.pow(10,ly-6))+' million years';
  if(ly<10.14)return Math.round(Math.pow(10,ly-9))+' billion years';return '10^'+Math.floor(ly)+' years (the universe is about 1.4 × 10^10 years old)'}

/* SHA-256: SubtleCrypto (secure context) with a JS fallback */
var K256=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function rotr(x,n){return (x>>>n)|(x<<(32-n))}
function sha256js(str){var b=new TextEncoder().encode(str),l=b.length,tot=Math.ceil((l+9)/64)*64,m=new Uint8Array(tot);m.set(b);m[l]=0x80;
  var bl=l*8,hi=Math.floor(bl/4294967296);m[tot-4]=(bl>>>24)&255;m[tot-3]=(bl>>>16)&255;m[tot-2]=(bl>>>8)&255;m[tot-1]=bl&255;m[tot-8]=(hi>>>24)&255;m[tot-7]=(hi>>>16)&255;m[tot-6]=(hi>>>8)&255;m[tot-5]=hi&255;
  var HH=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],w=new Array(64);
  for(var o=0;o<tot;o+=64){for(var i=0;i<16;i++)w[i]=(m[o+4*i]<<24)|(m[o+4*i+1]<<16)|(m[o+4*i+2]<<8)|m[o+4*i+3];
    for(i=16;i<64;i++){var s0=rotr(w[i-15],7)^rotr(w[i-15],18)^(w[i-15]>>>3),s1=rotr(w[i-2],17)^rotr(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
    var a=HH[0],bb=HH[1],c=HH[2],d=HH[3],e=HH[4],f=HH[5],g=HH[6],hh=HH[7];
    for(i=0;i<64;i++){var S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K256[i]+w[i])|0,S0=rotr(a,2)^rotr(a,13)^rotr(a,22),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;
      hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
    HH[0]=(HH[0]+a)|0;HH[1]=(HH[1]+bb)|0;HH[2]=(HH[2]+c)|0;HH[3]=(HH[3]+d)|0;HH[4]=(HH[4]+e)|0;HH[5]=(HH[5]+f)|0;HH[6]=(HH[6]+g)|0;HH[7]=(HH[7]+hh)|0}
  return HH.map(function(x){return ('00000000'+(x>>>0).toString(16)).slice(-8)}).join('')}
var subtleOK=!!(window.crypto&&crypto.subtle&&crypto.subtle.digest);
function sha256(str){
  if(subtleOK){try{return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(buf){return Array.prototype.map.call(new Uint8Array(buf),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}).catch(function(){return sha256js(str)})}catch(e){}}
  return Promise.resolve(sha256js(str))}
window.__clSha256js=sha256js;

/* toy RSA key pairs (textbook-sized so the numbers stay readable) */
var BOB={n:3233,e:17,d:2753,pq:'61 × 53'}, ALICE={n:2773,e:17,d:157,pq:'47 × 59'}, EVEKEY={n:2881,e:5,d:1109,pq:'43 × 67'};
function hashNum(hex,n){return parseInt(hex.slice(0,6),16)%n}

/* ---------- predictions ---------- */
var P={
 p1:{q:'A Caesar shift cipher moves every letter the same number of places along the alphabet. How many different keys are worth trying?',o:['25','About a thousand','More than a million'],a:0,
   w:'Only 25 (a shift of 26 gets you back where you started). A key space that small falls to a brute force attack - try every key until recognisable plaintext appears - even by hand.'},
 p2:{q:'You make an encryption key one bit longer. What happens to the number of possible keys?',o:['It goes up by one','It doubles','It goes up by ten'],a:1,
   w:'Every extra bit doubles the number of keys: a 1-bit key has 2 values, 2 bits 4, 3 bits 8 - in general 2^(key length). So 8 bits gives 256 keys.'},
 p3:{q:'Ten people each want to share a separate secret (symmetric) key with every other person in the group. How many keys are needed?',o:['10','20','45','100'],a:2,
   w:'n(n-1)/2 = 10 × 9 / 2 = 45. With 100 people it is 4,950 - and every one of them has to be delivered secretly. This is part of the key distribution problem.'},
 p4:{q:'Alice encrypts a message with Bob\'s public key. Eve intercepts the ciphertext and also has a copy of Bob\'s public key. Can Eve decrypt it?',o:['Yes - she has the key it was locked with','No - only Bob\'s private key can decrypt it','Only if she also intercepts Alice\'s public key'],a:1,
   w:'Ciphertext encrypted with a public key can only be decrypted with the matching private key. Eve gets rubbish. She would have to steal Bob\'s private key or use brute force, which could take billions of years.'},
 p5:{q:'You change just one character of a message and hash it again with SHA-256. How much of the 64-character hash changes?',o:['One character','A few characters near the end','Almost all of it - it looks completely different'],a:2,
   w:'A change of even a single bit gives a vastly different hash: typically about half of the 256 bits flip, so nearly every hex character changes. That is what makes tampering easy to spot.'},
 p6:{q:'Alice signs a document by encrypting its hash with her private key. Which key does Bob use to check the signature?',o:['Alice\'s private key','Alice\'s public key','Bob\'s private key','Bob\'s public key'],a:1,
   w:'Anyone with Alice\'s public key can decrypt the signature to reveal the hash and compare it. Because only Alice holds her private key, a matching hash shows it was signed by her and not changed.'},
 p7:{q:'An invoice "from Bob" has a signature that checks out using a "Bob" public key Alice found on a public key server. Can she be sure Bob sent it?',o:['Yes - the signature is valid','No - anyone can create a key pair in Bob\'s name; she needs a certificate that binds the key to Bob'],a:1,
   w:'A digital signature only proves who holds the private key. Eve can create a key pair in Bob\'s name and upload the public key. A digital certificate from a Certificate Authority binds a public key to its verified owner.'}
};
var PORDER=['p1','p2','p3','p4','p5','p6','p7'];
var MSGS=['MEET ME AT THE OLD BRIDGE AT NOON','THE SPARE KEY IS UNDER THE BLUE POT','SEND MORE TROOPS TO THE NORTH GATE','EVE IS LISTENING SO USE THE NEW KEY','ATTACK AT DAWN FROM THE WEST HILL','THE GENERALS MARCH ON ROME TOMORROW'];

Tools.register('crypto-lab',{title:'Cryptography lab',desc:'Encrypt and crack ciphers, explore keys and the key distribution problem, walk through public key encryption, hashing and digital signatures.',
mount:function(el,ctx){
  function fresh(){return {tab:'cipher',pred:{},mode:'caesar',dir:'enc',text:'ATTACK AT DAWN',shift:3,subkey:randKey(),
    crack:{msg:randInt(MSGS.length),k:1+randInt(25),try:0,tries:0,solved:false,all:false,pick:null},
    bits:56,n:10,deliv:{},dsel:null,pk:{step:0,msg:'MEET AT 6',k3:null,k5:null},
    ha:'Pay Bob £100 on Friday.',hb:'Pay Bob £900 on Friday.',dl:{},
    sg:{msg:'Quarterly profit: £1.2 million',eve:false},inv:{paid:null,cert:false},done:false}}
  var S=ctx.load(KEY);if(!S||!S.pred||!S.crack)S=fresh();
  function save(){try{ctx.save(S,KEY)}catch(e){}}
  var root=h('div',{class:'tool'});el.innerHTML='';el.appendChild(root);

  function progress(){var n=0,r=0;PORDER.forEach(function(k){if(S.pred[k]!=null){n++;if(S.pred[k]===P[k].a)r++}});if(S.crackDone){n++;r++}return {n:n,r:r,t:PORDER.length+1}}
  function checkDone(){var p=progress();if(!S.done&&p.n===p.t){S.done=true;try{ctx.complete(p.r/p.t)}catch(e){}try{ctx.toast('Lab complete: '+p.r+' / '+p.t)}catch(e){}}}

  function header(){
    var rb=h('button',{class:'btn ghost sm',onclick:function(){if(rb._c){S=fresh();save();render()}else{rb._c=true;rb.textContent='Tap again to reset';setTimeout(function(){rb._c=false;if(rb.isConnected)rb.textContent='Reset'},3000)}}},'Reset');
    var p=progress();
    return h('div',null,h('div',{class:'row between',style:{marginBottom:'8px'}},h('span',{class:'label'},'Cryptography lab • Week 5'),rb),
      h('div',{class:'cl-tabs',role:'tablist'},[['cipher','1 Ciphers'],['keys','2 Keys'],['pk','3 Public key'],['hash','4 Hashing'],['sig','5 Signatures']].map(function(t){
        return h('button',{class:'chip'+(S.tab===t[0]?' on':''),role:'tab','aria-selected':S.tab===t[0]?'true':'false',onclick:function(){S.tab=t[0];save();render()}},t[1])})),
      h('div',{class:'row between',style:{margin:'0 0 12px'}},h('span',{class:'tiny muted'},'Predictions and challenge: '+p.n+' / '+p.t+' done, '+p.r+' right'),
        h('div',{class:'bar',style:{flex:'1',minWidth:'120px',maxWidth:'260px'}},h('i',{style:{width:Math.round(p.n/p.t*100)+'%'}}))));
  }
  /* predict-then-check card; returns true if answered */
  function predict(id,into){var p=P[id],a=S.pred[id],done=a!=null,ok=a===p.a;
    into.appendChild(h('div',{class:'cl-pred'+(done?(ok?' isok':' isbad'):'')},h('div',{class:'row between'},h('span',{class:'label'},'Predict first'),done?h('span',{class:'cl-pill '+(ok?'g':'r')},ok?'Right':'Not quite'):null),
      h('p',{style:{margin:'6px 0 0'}},p.q),
      h('div',{class:'cl-opts'},p.o.map(function(o,i){var cls=done?(i===p.a?'right':i===a?'wrong':''):'';
        return h('button',{class:cls,disabled:done,onclick:function(){S.pred[id]=i;save();checkDone();render()}},o)})),
      done?h('div',{class:'callout '+(ok?'tip':'note'),style:{margin:'10px 0 0'}},h('b',null,'Check: '),p.w):null));
    return done}
  function locked(msg){return h('div',{class:'cl-locked'},msg||'Make your prediction above to open the demo.')}

  /* ===== 1 Ciphers ===== */
  function cipherTab(){
    var left=h('div',{class:'card'}),right=h('div');
    left.appendChild(h('span',{class:'label'},'Encrypt and decrypt'));
    left.appendChild(h('h3',{style:{margin:'2px 0 6px'}},S.mode==='caesar'?'Caesar shift cipher':'Substitution cipher'));
    left.appendChild(h('div',{class:'cl-seg'},[['caesar','Shift (Caesar)'],['sub','Substitution']].map(function(x){return h('button',{class:'chip'+(S.mode===x[0]?' on':''),onclick:function(){S.mode=x[0];save();render()}},x[1])}),
      h('span',{style:{width:'8px'}}),[['enc','Encrypt'],['dec','Decrypt']].map(function(x){return h('button',{class:'chip'+(S.dir===x[0]?' on':''),onclick:function(){S.dir=x[0];save();render()}},x[1])})));
    var ta=h('textarea',{class:'textarea',style:{minHeight:'70px',fontFamily:'var(--mono)'},'aria-label':S.dir==='enc'?'Plaintext':'Ciphertext',spellcheck:'false'});ta.value=S.text;
    var out=h('div',{class:'cl-out dark','aria-live':'polite'});
    var alpha=h('div',{class:'cl-alpha'});
    function key(){return S.mode==='caesar'?null:S.subkey}
    function upd(){var t=S.text,r;
      if(S.mode==='caesar')r=shiftText(t,S.dir==='enc'?S.shift:-S.shift);else r=subText(t,S.subkey,S.dir==='dec');out.textContent=r||'—';
      alpha.innerHTML='';var used={};t.toUpperCase().replace(/[A-Z]/g,function(c){used[c]=1});
      for(var i=0;i<26;i++){var p=AZ[i],c=S.mode==='caesar'?AZ[(i+S.shift)%26]:S.subkey[i];var on=S.dir==='enc'?used[p]:used[c];
        alpha.appendChild(h('div',{class:on?'on':''},h('span',null,p),h('b',null,c)))}}
    ta.addEventListener('input',function(){S.text=ta.value.slice(0,300);save();upd()});
    left.appendChild(h('div',{class:'label'},S.dir==='enc'?'Plaintext':'Ciphertext'));left.appendChild(ta);
    if(S.mode==='caesar'){
      var kl=h('b',{style:{fontFamily:'var(--mono)'}},String(S.shift));
      var rng=h('input',{type:'range',class:'cl-range',min:'0',max:'25',value:String(S.shift),'aria-label':'Key (shift)',oninput:function(){S.shift=+rng.value;kl.textContent=S.shift;save();upd()}});
      left.appendChild(h('div',{class:'row between',style:{marginTop:'8px'}},h('span',{class:'label'},'Key = shift'),kl));left.appendChild(rng);
    } else {
      left.appendChild(h('div',{class:'row between',style:{marginTop:'8px'}},h('span',{class:'label'},'Key = a scrambled alphabet'),h('button',{class:'btn ghost sm',onclick:function(){S.subkey=randKey();save();render()}},'New random key')));
      left.appendChild(h('div',{class:'cl-out',style:{fontSize:'.85rem',letterSpacing:'.08em'}},S.subkey));
    }
    left.appendChild(h('div',{class:'label',style:{marginTop:'8px'}},'Key table (plain over cipher)'));left.appendChild(alpha);
    left.appendChild(h('div',{class:'label'},S.dir==='enc'?'Ciphertext':'Plaintext'));left.appendChild(out);
    left.appendChild(h('p',{class:'cl-note'},S.mode==='caesar'?'The cipher (the method: "shift each letter") is public; only the key is secret. Julius Caesar used simple ciphers like this to send military orders to his generals.':'The cipher is the same idea, but the key is any of 26! ≈ 4 × 10^26 scrambled alphabets - far too many to try by hand. Ciphers like this still fell, because common letters such as E and T show through in the ciphertext. Modern ciphers are designed so no such patterns leak.'));
    upd();
    /* crack challenge */
    var cardR=h('div',{class:'card'},h('span',{class:'label'},'Crack-it challenge'),h('h3',{style:{margin:'2px 0 6px'}},'You are Eve'));
    right.appendChild(cardR);
    if(predict('p1',cardR))crackUI(cardR);else cardR.appendChild(locked());
    root.appendChild(h('div',{class:'cl-wrap'},left,right));
  }
  function crackUI(card){var C=S.crack,plain=MSGS[C.msg],ct=shiftText(plain,C.k);
    card.appendChild(h('p',{style:{margin:'0 0 6px',fontSize:'.93rem'}},'You intercepted this Caesar-encrypted order. Find the key by brute force: try keys until recognisable plaintext appears.'));
    card.appendChild(h('div',{class:'cl-out dark'},ct));
    var tl=h('b',{style:{fontFamily:'var(--mono)'}},String(C.try));
    var trial=h('div',{class:'cl-out'});
    function upd(){trial.textContent=shiftText(ct,-C.try)}
    var rng=h('input',{type:'range',class:'cl-range',min:'0',max:'25',value:String(C.try),'aria-label':'Key to try',disabled:C.solved,oninput:function(){C.try=+rng.value;tl.textContent=C.try;C.tries++;save();upd()}});
    card.appendChild(h('div',{class:'row between',style:{marginTop:'6px'}},h('span',{class:'label'},'Try key'),tl));card.appendChild(rng);
    card.appendChild(h('div',{class:'label'},'Decrypted with this key'));card.appendChild(trial);upd();
    var fb=h('div');
    function solve(k){C.pick=k;if(k===C.k){C.solved=true;C.try=k;S.crackDone=true;save();checkDone();render()}else{save();fb.innerHTML='';fb.appendChild(h('div',{class:'callout',style:{margin:'10px 0 0'}},'Key '+k+' gives "'+shiftText(ct,-k).slice(0,24)+'..." - not recognisable plaintext. Keep trying.'))}}
    if(!C.solved){card.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},h('button',{class:'btn primary',onclick:function(){solve(C.try)}},'This is it'),
      h('button',{class:'btn ghost',onclick:function(){C.all=!C.all;save();render()}},C.all?'Hide all keys':'Try all 25 keys')));card.appendChild(fb)}
    if(C.all&&!C.solved){card.appendChild(h('p',{class:'cl-note'},'This is what a computer does in a brute force attack. Tap the line that reads as plain English.'));
      var g=h('div',{class:'cl-all'});for(var k=1;k<26;k++)(function(k){g.appendChild(h('button',{class:C.pick===k&&k!==C.k?'wrong':'',onclick:function(){solve(k)}},h('b',null,'k='+k),shiftText(ct,-k)))})(k);card.appendChild(g)}
    if(C.solved){card.appendChild(h('div',{class:'callout tip',style:{margin:'10px 0 0'}},h('b',null,'Cracked: key '+C.k+'. '),'"'+plain+'". You needed at most 25 tries. Real ciphers use keys with so many possible values that trying them all is not feasible - see tab 2.'));
      card.appendChild(h('button',{class:'btn ghost',style:{marginTop:'6px'},onclick:function(){var m;do{m=randInt(MSGS.length)}while(m===C.msg&&MSGS.length>1);S.crack={msg:m,k:1+randInt(25),try:0,tries:0,solved:false,all:false,pick:null,was:true};save();render()}},'New message'))}
    if(C.was&&!C.solved)card.appendChild(h('p',{class:'cl-note'},'Challenge already counted - this one is for practice.'));
  }

  /* ===== 2 Keys ===== */
  function keysTab(){
    var a=h('div',{class:'card'},h('span',{class:'label'},'Encryption keys'),h('h3',{style:{margin:'2px 0 6px'}},'How long should a key be?'));
    if(predict('p2',a)){
      var b=S.bits,bl=h('b',{style:{fontFamily:'var(--mono)'}},b+' bits');
      var res=h('div');
      function upd(){res.innerHTML='';b=S.bits;bl.textContent=b+' bits';
        if(b<=4){var list=[];for(var i=0;i<Math.pow(2,b);i++)list.push(('0000'+i.toString(2)).slice(-b));res.appendChild(h('div',{class:'cl-bits'},'All keys: '+list.join(' ')))}
        res.appendChild(h('div',{class:'cl-kv'},h('span',null,'Possible keys (2^'+b+')'),h('b',null,sciPow2(b))));
        var l10=b*Math.log10(2)-12-Math.log10(2);/* average: half the keys, at 10^12 keys per second */
        res.appendChild(h('div',{class:'cl-kv'},h('span',null,'Average brute force time at a million million keys per second'),h('b',{style:{color:l10<7.5?'var(--red)':''}},fmtTimeLog(l10))));
        var note=b===56?'DES (1970s, 56-bit keys): increases in computing power mean it can now be brute forced in less than a day. That led the US government to adopt other standards such as AES.':
          b===128||b===192||b===256?'AES (US standard since 2001) uses 128, 192 or 256-bit keys. Known weaknesses are mostly theoretical; it is easiest to break when implemented badly, not by brute force.':
          b===448?'Blowfish supports keys from 1 to 448 bits. No known successful attack on the full cipher, though weak keys cause problems; most users have switched to AES.':
          b===8?'A key of length eight has 2^8 = 256 values - a computer tries them all instantly.':'Each extra bit doubles the work for a brute force attack.';
        res.appendChild(h('p',{class:'cl-note'},note))}
      var rng=h('input',{type:'range',class:'cl-range',min:'1',max:'448',value:String(b),'aria-label':'Key length in bits',oninput:function(){S.bits=+rng.value;save();upd()}});
      a.appendChild(h('div',{class:'row between'},h('span',{class:'label'},'Key length'),bl));a.appendChild(rng);
      a.appendChild(h('div',{class:'cl-seg'},[[3,'3-bit'],[8,'8-bit'],[56,'DES 56'],[128,'AES 128'],[256,'AES 256'],[448,'Blowfish 448']].map(function(x){return h('button',{class:'chip'+(S.bits===x[0]?' on':''),onclick:function(){S.bits=x[0];rng.value=x[0];save();upd();Array.prototype.forEach.call(this.parentNode.children,function(c){c.classList.remove('on')});this.classList.add('on')}},x[1])})));
      a.appendChild(res);upd();
      a.appendChild(h('p',{class:'cl-note'},'Speed assumed for illustration: 10^12 keys per second, which is consistent with the course\'s statement that a 56-bit DES key can be brute forced in less than a day. Triple DES (three 56-bit keys) was deprecated by NIST in 2017.'));
    } else a.appendChild(locked());
    var b2=h('div',{class:'card'},h('span',{class:'label'},'The key distribution problem'),h('h3',{style:{margin:'2px 0 6px'}},'Sharing secret keys'));
    if(predict('p3',b2)){distUI(b2);delivUI(b2)}else b2.appendChild(locked());
    root.appendChild(h('div',{class:'cl-wrap'},a,b2));
  }
  function distUI(card){var n=S.n,nl=h('b',{style:{fontFamily:'var(--mono)'}},n+' people'),svgBox=h('div'),info=h('div');
    function draw(){n=S.n;nl.textContent=n+' people';var m=Math.min(n,16),R=84,cx=100,cy=100,pts=[];for(var i=0;i<m;i++){var t=-Math.PI/2+i*2*Math.PI/m;pts.push([cx+R*Math.cos(t),cy+R*Math.sin(t)])}
      var s='<svg class="cl-net" viewBox="0 0 200 200" role="img" aria-label="Each pair of people needs its own key">';
      for(i=0;i<m;i++)for(var j=i+1;j<m;j++)s+='<line x1="'+pts[i][0].toFixed(1)+'" y1="'+pts[i][1].toFixed(1)+'" x2="'+pts[j][0].toFixed(1)+'" y2="'+pts[j][1].toFixed(1)+'" stroke="currentColor" stroke-opacity="'+(m>10?0.25:0.45)+'" stroke-width="'+(m>10?0.6:1)+'"/>';
      pts.forEach(function(p,i){s+='<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(m>10?5:7)+'" fill="'+(i===0?'#D71921':'currentColor')+'"/>'});s+='</svg>';
      svgBox.innerHTML=s;svgBox.style.color='var(--ink)';
      info.innerHTML='';var k=n*(n-1)/2;
      info.appendChild(h('div',{class:'cl-kv'},h('span',null,'Shared secret keys: n(n-1)/2'),h('b',{style:{color:'var(--red)'}},k.toLocaleString('en-GB'))));
      info.appendChild(h('div',{class:'cl-kv'},h('span',null,'With public key cryptography: one key pair each'),h('b',null,String(n))));
      info.appendChild(h('p',{class:'cl-note'},(n>16?'Showing 16 of '+n+' people. ':'')+'Every line is a key that must be created and delivered secretly, and could be stolen or copied in transit. With public keys, only the public half is shared - openly.'))}
    var rng=h('input',{type:'range',class:'cl-range',min:'2',max:'100',value:String(n),'aria-label':'Number of people',oninput:function(){S.n=+rng.value;save();draw()}});
    card.appendChild(h('div',{class:'row between'},h('span',{class:'label'},'People who want to talk securely'),nl));card.appendChild(rng);card.appendChild(svgBox);card.appendChild(info);draw()}
  var DEL=[['meet','Meet in person','Secure - they each go away with a copy of the key. But Alice and Bob live far apart, meeting is not always possible, and it may be dangerous to share a key.'],
    ['post','Send it by post','Things get lost in the post. Or Eve waits by Bob\'s post box and makes her own copy when it is delivered.'],
    ['guard','Armed courier','Safe, but armed guards are very expensive. Historically only governments, banks and the largest companies could afford them, so most people could not use cryptography at all.'],
    ['net','Send it over the internet','The key passes through computers Alice and Bob do not control. Eve has compromised one of them with a packet sniffer: she copies the key and reads every message - and neither of them knows.']];
  function delivUI(card){var seen=S.deliv,sel=S.dsel;
    card.appendChild(h('div',{class:'label',style:{marginTop:'14px'}},'Alice has made a key. How does she get it to Bob?'));
    card.appendChild(h('div',{class:'cl-deliv'},DEL.map(function(d){return h('button',{class:(sel===d[0]?'on ':'')+(seen[d[0]]?'seen':''),onclick:function(){S.dsel=d[0];S.deliv[d[0]]=1;save();render()}},(seen[d[0]]?'✓ ':'')+d[1])})));
    if(sel){var d=DEL.filter(function(x){return x[0]===sel})[0];card.appendChild(h('div',{class:'callout'+(sel==='meet'||sel==='guard'?' note':''),style:{margin:'10px 0 0'}},d[2]))}
    if(Object.keys(seen).length===DEL.length)card.appendChild(h('div',{class:'callout tip',style:{margin:'10px 0 0'}},h('b',null,'The way out: '),'in the 1970s a method of distributing keys without actually sending them was developed independently by GCHQ and by Whitfield Diffie and Martin Hellman - the Diffie-Hellman key exchange. Public key cryptography side-steps the problem altogether (tab 3).'));
  }

  /* ===== 3 Public key ===== */
  var PKSTEPS=['Bob makes a key pair','Bob shares his public key','Alice locks the message','Eve intercepts','Bob unlocks it'];
  function pkTab(){
    var c=h('div',{class:'card'},h('span',{class:'label'},'Asymmetric (public key) cryptography'),h('h3',{style:{margin:'2px 0 6px'}},'Alice, Bob and the padlock'));
    root.appendChild(c);
    if(!predict('p4',c)){c.appendChild(locked());return}
    var K=S.pk,st=K.step;
    c.appendChild(h('div',{class:'cl-steps'},PKSTEPS.map(function(s,i){return h('i',{class:i<=st?'on':''})})));
    c.appendChild(h('div',{class:'label'},'Step '+(st+1)+' of '+PKSTEPS.length+' • '+PKSTEPS[st]));
    var msg=K.msg.toUpperCase().slice(0,16),codes=msg.split('').map(function(ch){return ch.charCodeAt(0)});
    var ct=codes.map(function(m){return modpow(m,BOB.e,BOB.n)});
    var cast=h('div',{class:'cl-cast'},
      h('div',{class:st===2?'act':''},h('span',{class:'label'},'Alice'),st>=1?h('span',{class:'cl-key'},'Bob public'):h('span',{class:'tiny muted'},'no keys yet'),st>=2&&K.k3===1?h('div',{class:'tiny',style:{marginTop:'4px'}},'locked message sent'):null),
      h('div',{class:st===0||st===4?'act':''},h('span',{class:'label'},'Bob'),h('span',{class:'cl-key'},'Bob public'),h('span',{class:'cl-key priv'},'Bob private')),
      h('div',{class:'eve'+(st===3?' act':'')},h('span',{class:'label',style:{color:'var(--red)'}},'Eve'),st>=1?h('span',{class:'cl-key'},'Bob public (copy)'):h('span',{class:'tiny muted'},'watching the network'),st>=3?h('div',{class:'tiny',style:{marginTop:'4px'}},'has the ciphertext'):null));
    c.appendChild(cast);
    var body=h('div');c.appendChild(body);
    var canNext=true;
    if(st===0){body.appendChild(h('p',null,'Bob orders lots of identical padlocks and one key that opens them all. He will post a padlock to anyone who asks, but never gives away the key.'));
      body.appendChild(h('div',{class:'cl-kv'},h('span',null,'Public key (the padlock): n, e'),h('b',null,BOB.n+', '+BOB.e)));
      body.appendChild(h('div',{class:'cl-kv'},h('span',null,'Private key (the key): d'),h('b',null,String(BOB.d))));
      body.appendChild(h('p',{class:'cl-note'},'The software makes the pair from secret random information (typing, mouse movements, network traffic). Here n = '+BOB.pq+'. Real keys use numbers hundreds of digits long, so the private key cannot be worked out from the public one; these toy numbers could be.'))}
    else if(st===1){body.appendChild(h('p',null,'Bob sends a copy of his public key to Alice - by email, or via a public key server. Eve copies it too. That does not matter: a padlock can only lock, not unlock.'))}
    else if(st===2){body.appendChild(h('p',{style:{margin:'0 0 6px'}},'Alice writes her message:'));
      var mi=h('input',{class:'input',maxlength:'16',value:K.msg,'aria-label':'Alice\'s message',style:{fontFamily:'var(--mono)'},oninput:function(){K.msg=mi.value;save()},onchange:function(){render()}});body.appendChild(mi);
      body.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'Which key should Alice lock it with?'));
      var opts=[[0,'Alice\'s private key','Alice has not made keys in this story - and anything locked with a private key can be opened by anyone with the public key.'],[1,'Bob\'s public key','Right: the padlock Bob sent her. Only Bob\'s private key opens it.'],[2,'Bob\'s private key','Alice does not have it - only Bob does, and he never shares it.']];
      body.appendChild(h('div',{class:'cl-opts'},opts.map(function(o){return h('button',{class:K.k3===o[0]?(o[0]===1?'right':'wrong'):'',onclick:function(){K.k3=o[0];save();render()}},o[1])})));
      if(K.k3!=null)body.appendChild(h('div',{class:'callout '+(K.k3===1?'tip':''),style:{margin:'10px 0 0'}},opts[K.k3][2]));
      if(K.k3===1){body.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'Each letter code m becomes c = m^'+BOB.e+' mod '+BOB.n));body.appendChild(h('div',{class:'cl-out dark',style:{fontSize:'.85rem'}},ct.join(' ')))}
      canNext=K.k3===1}
    else if(st===3){var garb=ct.map(function(x){return modpow(x,BOB.e,BOB.n)});
      body.appendChild(h('p',null,'The ciphertext crosses the internet and Eve copies it. She tries to decrypt it with the only key she has - Bob\'s public key:'));
      body.appendChild(h('div',{class:'cl-out dark',style:{fontSize:'.85rem'}},ct.join(' ')));
      body.appendChild(h('div',{class:'label'},'Eve\'s result'));
      body.appendChild(h('div',{class:'cl-out',style:{fontSize:'.85rem',color:'var(--red)'}},garb.map(function(x){return x>=32&&x<127?String.fromCharCode(x):'□'}).join('')+'   ('+garb.slice(0,4).join(' ')+'…)'));
      body.appendChild(h('p',{class:'cl-note'},'Rubbish. To read it she would have to steal Bob\'s private key or brute force it - which with real key sizes could take billions of years.'))}
    else if(st===4){body.appendChild(h('div',{class:'label'},'Which key does Bob use to open it?'));
      var o5=[[0,'Bob\'s public key','That is what Eve just tried. The public key only locks.'],[1,'Bob\'s private key','Right. He is the only person in the world with it.'],[2,'Alice\'s public key','Alice\'s keys have nothing to do with this message. Bob would use Alice\'s public key to send a reply to her.']];
      body.appendChild(h('div',{class:'cl-opts'},o5.map(function(o){return h('button',{class:K.k5===o[0]?(o[0]===1?'right':'wrong'):'',onclick:function(){K.k5=o[0];save();render()}},o[1])})));
      if(K.k5!=null)body.appendChild(h('div',{class:'callout '+(K.k5===1?'tip':''),style:{margin:'10px 0 0'}},o5[K.k5][2]));
      if(K.k5===1){var back=ct.map(function(x){return String.fromCharCode(modpow(x,BOB.d,BOB.n))}).join('');
        body.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'m = c^'+BOB.d+' mod '+BOB.n));body.appendChild(h('div',{class:'cl-out dark'},back));
        body.appendChild(h('div',{class:'callout note',style:{margin:'10px 0 0'}},h('b',null,'Trade-offs. '),'No secret key ever had to travel, so the key distribution problem is side-stepped. But public key cryptography is far slower than symmetric encryption and traditional methods need much longer keys for the same protection (elliptic curve cryptography does better). In practice the two are combined.'))}
      canNext=false}
    c.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},st>0?h('button',{class:'btn ghost',onclick:function(){K.step--;save();render()}},'Back'):null,
      st<PKSTEPS.length-1?h('button',{class:'btn primary',disabled:!canNext,onclick:function(){K.step++;save();render()}},'Next'):h('button',{class:'btn ghost',onclick:function(){K.step=0;K.k3=null;K.k5=null;save();render()}},'Start again')));
  }

  /* ===== 4 Hashing ===== */
  function hashTab(){
    var c=h('div',{class:'card'},h('span',{class:'label'},'Hashing (SHA-256, a SHA-2 algorithm)'),h('h3',{style:{margin:'2px 0 6px'}},'A fingerprint for data'));
    var right=h('div');
    if(!predict('p5',c)){c.appendChild(locked());root.appendChild(h('div',{class:'cl-wrap'},c,right));return}
    var ta=h('textarea',{class:'textarea',style:{minHeight:'60px'},'aria-label':'Message A',spellcheck:'false'});ta.value=S.ha;
    var tb=h('textarea',{class:'textarea',style:{minHeight:'60px'},'aria-label':'Message B',spellcheck:'false'});tb.value=S.hb;
    var ha=h('div',{class:'cl-hash'}),hb=h('div',{class:'cl-hash'}),la=h('div',{class:'tiny muted'}),lb=h('div',{class:'tiny muted'}),diff=h('div');
    var seq=0;
    function upd(){var my=++seq;Promise.all([sha256(S.ha),sha256(S.hb)]).then(function(r){if(my!==seq)return;var A=r[0],B=r[1],nd=0,bits=0;
      function paint(box,X,Y){box.innerHTML='';for(var i=0;i<64;i++){if(i&&i%8===0)box.appendChild(document.createTextNode(' '));var d=X[i]!==Y[i];box.appendChild(h('span',{class:d?'d':''},X[i]))}}
      for(var i=0;i<64;i++){if(A[i]!==B[i])nd++;var x=parseInt(A[i],16)^parseInt(B[i],16);while(x){bits+=x&1;x>>=1}}
      paint(ha,A,B);paint(hb,B,A);
      la.textContent=S.ha.length+' characters in → 64 hex characters (256 bits) out';lb.textContent=S.hb.length+' characters in → 64 hex characters (256 bits) out';
      diff.innerHTML='';
      diff.appendChild(h('div',{class:'cl-kv'},h('span',null,'Hex characters that differ'),h('b',{style:{color:nd?'var(--red)':'var(--green)'}},nd+' / 64')));
      diff.appendChild(h('div',{class:'cl-kv'},h('span',null,'Bits that differ'),h('b',null,bits+' / 256 ('+Math.round(bits/2.56)+'%)')));
      diff.appendChild(h('p',{class:'cl-note'},nd===0?'Identical input, identical hash - every time. That is how a server checks a password, or you check a download, without needing the original.':'One small edit and the hash is unrecognisable - roughly half the bits flip. Any edit between two hashing operations reveals that the data has been tampered with.'))})}
    ta.addEventListener('input',function(){S.ha=ta.value.slice(0,2000);save();upd()});
    tb.addEventListener('input',function(){S.hb=tb.value.slice(0,2000);save();upd()});
    function tweak(){var t=S.hb;if(!t){t=S.ha}var i=randInt(Math.max(1,t.length)),ch=t[i]||'a',nc=ch;while(nc===ch)nc='abcdefghijklmnopqrstuvwxyz0123456789'[randInt(36)];S.hb=t.slice(0,i)+nc+t.slice(i+1);tb.value=S.hb;save();upd()}
    c.appendChild(h('div',{class:'label'},'Message A'));c.appendChild(ta);c.appendChild(ha);c.appendChild(la);
    c.appendChild(h('div',{class:'label',style:{marginTop:'12px'}},'Message B'));c.appendChild(tb);c.appendChild(hb);c.appendChild(lb);
    c.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn primary',onclick:tweak},'Change one character in B'),
      h('button',{class:'btn ghost',onclick:function(){S.hb=S.ha;tb.value=S.hb;save();upd()}},'Make B = A'),
      h('button',{class:'btn ghost',onclick:function(){S.ha='It is not an exaggeration to say that encryption makes much of the modern world possible: secure banking and payments, mobile phone conversations, wireless networks, files on disks and memory sticks, electronic documents, electronic voting and digital rights management all depend on it.';ta.value=S.ha;save();upd()}},'Long text in A')));
    c.appendChild(diff);
    c.appendChild(h('p',{class:'cl-note'},'One-way: there is no way to get the message back from its hash. '+(subtleOK?'Computed on your device with the browser\'s SubtleCrypto.':'Computed on your device.')));
    upd();
    /* download check */
    var d=h('div',{class:'card'},h('span',{class:'label'},'Checking a download'),h('h3',{style:{margin:'2px 0 6px'}},'Is this the file the author published?'),
      h('p',{style:{margin:'0 0 6px',fontSize:'.93rem'}},'Software authors often publish the hash of each file. You hash your download and compare. You downloaded the same installer from two mirror sites:'));
    var pub=h('div',{class:'cl-hash'}),boxes=h('div');d.appendChild(h('div',{class:'label'},'Published by the author'));d.appendChild(pub);d.appendChild(boxes);
    var FILE='crypto-tool-setup-2.4.1.exe|MZ\u0090\u0003 this is the genuine program code ... v2.4.1 build 7781',BAD=FILE.replace('7781','7791');
    Promise.all([sha256(FILE),sha256(BAD)]).then(function(r){pub.textContent=r[0].replace(/(.{8})/g,'$1 ').trim();
      [['A',r[0]],['B',r[1]]].forEach(function(x){var ans=S.dl[x[0]],ok=x[1]===r[0],right=ans!=null&&((ans==='y')===ok);
        boxes.appendChild(h('div',{style:{borderTop:'1px dotted var(--line)',paddingTop:'8px',marginTop:'8px'}},h('div',{class:'label'},'Your download from mirror '+x[0]),h('div',{class:'cl-hash'},x[1].replace(/(.{8})/g,'$1 ').trim()),
          h('div',{class:'row'},h('button',{class:'chip'+(ans==='y'?' on':''),style:{minHeight:'44px'},onclick:function(){S.dl[x[0]]='y';save();render()}},'Matches - install'),h('button',{class:'chip'+(ans==='n'?' on':''),style:{minHeight:'44px'},onclick:function(){S.dl[x[0]]='n';save();render()}},'Different - don\'t')),
          ans!=null?h('div',{class:'callout '+(right?'tip':''),style:{margin:'8px 0 0'}},right?(ok?'Correct: identical hashes, so the file is an exact match.':'Correct: the hashes differ completely - even one changed byte. This copy has been altered (perhaps with malware).'):(ok?'Look again: every character matches the published hash.':'Look again: compare the first few characters - they are different. Never install a file whose hash does not match.')):null))})});
    d.appendChild(h('div',{class:'callout note',style:{margin:'12px 0 0'}},h('b',null,'Broken algorithms. '),'MD5 and SHA-1 are still common but flawed: under controlled conditions two different pieces of data can produce the same hash (a collision) - an MD5 weakness was used in malware targeting Windows. Use SHA-2 (such as SHA-256). Week 2 link: servers store a salted hash of your password, not the password.'));
    right.appendChild(d);
    root.appendChild(h('div',{class:'cl-wrap'},c,right));
  }

  /* ===== 5 Signatures ===== */
  function sigTab(){
    var c=h('div',{class:'card'},h('span',{class:'label'},'Case study 1 • Digital signatures'),h('h3',{style:{margin:'2px 0 6px'}},'Alice signs the profit statement'));
    var r2=h('div');
    if(predict('p6',c))sig1(c);else c.appendChild(locked());
    var c2=h('div',{class:'card'},h('span',{class:'label'},'Case study 2 • The fake invoice'),h('h3',{style:{margin:'2px 0 6px'}},'Who really signed it?'));
    if(S.pred.p6==null)c2.appendChild(locked('Finish case study 1 first.'));else if(predict('p7',c2))sig2(c2);else c2.appendChild(locked());
    r2.appendChild(c2);
    root.appendChild(h('div',{class:'cl-wrap'},c,r2));
  }
  function sig1(c){var G=S.sg;
    c.appendChild(h('p',{style:{margin:'0 0 6px',fontSize:'.93rem'}},'Alice sends the company\'s quarterly profit statement to Bob for public announcement. Both want to be confident Eve has not altered it en route.'));
    var mi=h('input',{class:'input',value:G.msg,'aria-label':'Statement',maxlength:'60',oninput:function(){G.msg=mi.value;save()},onchange:function(){render()}});
    c.appendChild(h('div',{class:'label'},'Alice\'s statement'));c.appendChild(mi);
    var sw=h('input',{type:'checkbox',checked:G.eve,onchange:function(){G.eve=sw.checked;save();render()}});
    c.appendChild(h('label',{class:'cl-sw'},sw,h('span',null,'Eve intercepts and alters the statement in transit')));
    var flow=h('div',{class:'cl-flow'},h('div',null,h('span',null,'Working'),'Computing hashes…'));c.appendChild(flow);
    var recv=G.eve?G.msg.replace(/[0-9]+(\.[0-9]+)?/,function(x){return x.indexOf('.')>=0?x.replace('.',''):x+'0'}):G.msg;
    if(G.eve&&recv===G.msg)recv=G.msg+' (revised upwards)';
    Promise.all([sha256(G.msg),sha256(recv)]).then(function(r){flow.innerHTML='';
      var hA=hashNum(r[0],ALICE.n),sig=modpow(hA,ALICE.d,ALICE.n),dec=modpow(sig,ALICE.e,ALICE.n),hB=hashNum(r[1],ALICE.n),ok=dec===hB;
      flow.appendChild(h('div',null,h('span',null,'Alice'),h('div',null,'1. Hashes the statement: ',h('span',{class:'cl-mono tiny'},r[0].slice(0,16)+'…'),' → toy hash value ',h('b',null,hA))));
      flow.appendChild(h('div',null,h('span',null,'Alice'),h('div',null,'2. Encrypts the hash with her ',h('b',null,'private key'),' (d = '+ALICE.d+'): signature = '+hA+'^'+ALICE.d+' mod '+ALICE.n+' = ',h('b',null,sig))));
      flow.appendChild(h('div',{class:G.eve?'eve':''},h('span',null,G.eve?'Eve':'Network'),h('div',null,G.eve?'Changes the statement to "'+recv+'" but cannot make a new signature without Alice\'s private key.':'Statement + signature travel to Bob unchanged.')));
      flow.appendChild(h('div',null,h('span',null,'Bob'),h('div',null,'3. Decrypts the signature with ',h('b',null,'Alice\'s public key'),' (e = '+ALICE.e+'): '+sig+'^'+ALICE.e+' mod '+ALICE.n+' = ',h('b',null,dec))));
      flow.appendChild(h('div',null,h('span',null,'Bob'),h('div',null,'4. Hashes the statement he received ("'+recv+'"): ',h('span',{class:'cl-mono tiny'},r[1].slice(0,16)+'…'),' → ',h('b',null,hB))));
      flow.appendChild(h('div',{class:'res'},h('span',null,'Result'),h('div',null,h('b',{style:{color:ok?'#7fd08f':'#ff6b6b'}},ok?'Hashes match - signature valid. ':'Hashes differ - signature INVALID. '),ok?'The statement came from the holder of Alice\'s private key and was not altered.':'Bob knows the statement was changed after Alice signed it, and must not publish it.')));
    });
    c.appendChild(h('p',{class:'cl-note'},'Alice may also encrypt the statement and signature with Bob\'s public key so the details stay secret. Toy keys: n = '+ALICE.pq+'; the first digits of the real SHA-256 hash are reduced to fit. Real signatures use the whole hash and keys thousands of bits long.'));
  }
  function sig2(c){var I=S.inv;
    c.appendChild(h('p',{style:{margin:'0 0 6px',fontSize:'.93rem'}},'A digitally signed business invoice arrives in Alice\'s mailbox from "Bob": "Please pay £4,800 to account 55-01-23 / 87654321". She downloads Bob\'s public key from a public key server and checks the signature.'));
    var invoice='Invoice from Bob: pay 4800 to 55-01-23 87654321';
    var flow=h('div',{class:'cl-flow'});c.appendChild(flow);
    var sw=h('input',{type:'checkbox',checked:I.cert,onchange:function(){I.cert=sw.checked;save();render()}});
    sha256(invoice).then(function(hx){var hv=hashNum(hx,EVEKEY.n),sig=modpow(hv,EVEKEY.d,EVEKEY.n);
      var server=modpow(sig,EVEKEY.e,EVEKEY.n),hv2=hashNum(hx,EVEKEY.n);
      flow.appendChild(h('div',null,h('span',null,'Server'),h('div',null,'Key listed as "Bob": n = '+EVEKEY.n+', e = '+EVEKEY.e)));
      flow.appendChild(h('div',null,h('span',null,'Check'),h('div',null,'Signature '+sig+' decrypts to '+server+'; hash of invoice gives '+hv2+'. ',h('b',{style:{color:'var(--green)'}},server===hv2?'Signature valid.':'Invalid.'))));
      if(I.paid==null){c.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'What should Alice do?'));
        c.appendChild(h('div',{class:'cl-opts'},h('button',{onclick:function(){I.paid=true;save();render()}},'Pay - the signature is valid'),h('button',{onclick:function(){I.paid=false;save();render()}},'Hold on - check that the key really belongs to Bob')))}
      else{
        c.appendChild(h('div',{class:'callout '+(I.paid?'':'tip'),style:{margin:'10px 0 0'}},I.paid?'A few weeks later Bob angrily asks why he has not been paid. The bank finds the money went to Eve. ':'Good instinct. ',
          'Eve used Bob\'s personal information to create a new key pair in Bob\'s name, put the public key on a key server, and signed the invoice with her private key. The signature proves only that the holder of that private key signed it.'));
        c.appendChild(h('label',{class:'cl-sw',style:{marginTop:'6px'}},sw,h('span',null,'Check Bob\'s digital certificate from a Certificate Authority')));
        if(I.cert){var real=modpow(sig,BOB.e,BOB.n);
          c.appendChild(h('div',{class:'cl-flow'},
            h('div',null,h('span',null,'CA'),h('div',null,'Bob proved his identity (passport, business registration) to a Certificate Authority, which signed a certificate binding his real public key (n = '+BOB.n+', e = '+BOB.e+') to his name.')),
            h('div',null,h('span',null,'Check'),h('div',null,'With Bob\'s certified key the signature decrypts to '+real+', not '+hv2+'.')),
            h('div',{class:'res'},h('span',null,'Result'),h('div',null,h('b',{style:{color:'#ff6b6b'}},'Signature INVALID for the real Bob. '),'Do not pay. The "Bob" key on the server has no valid certificate.'))));
          c.appendChild(h('div',{class:'callout note',style:{margin:'10px 0 0'}},h('b',null,'A certificate contains: '),'the holder\'s public key, a unique serial number, the owner\'s name, the issuing agency and its digital signature, issue and expiry dates, and a hash to check it has not been altered. Browsers check website certificates the same way. But trust still needs a chain: criminals have obtained or stolen certificates - Stuxnet was signed with certificates belonging to Realtek and JMicron. And a signature never replaces checking unexpected bank details by phone.'));
          c.appendChild(h('button',{class:'btn ghost sm',style:{marginTop:'4px'},onclick:function(){I.paid=null;I.cert=false;save();render()}},'Replay case study'))}
      }
    });
  }

  function fit(){if(!root.isConnected){window.removeEventListener('resize',fit);return}root.classList.toggle('cl-w',el.clientWidth>=820)}
  window.addEventListener('resize',fit);
  function render(){var y=window.scrollY;root.innerHTML='';fit();root.appendChild(header());
    if(S.tab==='keys')keysTab();else if(S.tab==='pk')pkTab();else if(S.tab==='hash')hashTab();else if(S.tab==='sig')sigTab();else cipherTab();
    try{window.scrollTo(0,y)}catch(e){}}
  render();
}});
})();

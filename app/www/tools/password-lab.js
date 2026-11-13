/* password-lab: Week 2 Authentication (Introduction to cyber security).
   1 Analyse - live strength check that mirrors the course's Good password checklist and Paul Ducklin's
     "How to pick a proper password" video (hard to guess, long and complex, 14+ characters, no digits tacked on,
     no substitutions like pa22w0rd, five unrelated words, one account one password), with estimated guesses and
     crack times at speeds taken from the course (lockout; LinkedIn: tens of millions of SHA-1 hashes/s on a desktop;
     a <$20,000 cracking service: 100 billion guesses/s).
   2 Attack - brute-force key-space calculator (26^8 = 200 billion) and a stolen-database simulator:
     plaintext (RockYou), hashed without salt (LinkedIn), hashed with unique salts; dictionary attack; reuse.
   3 Passphrase - random-word generator (local list, crypto.getRandomValues) and "make up a little saying" converter.
   4 Decide - password manager / browser storage / OAuth / security questions / 2FA scenarios with feedback.
   PRIVACY: typed passwords, generated passphrases and sayings are NEVER saved (ctx.save) or sent anywhere. Only UI
   state (tab, scenario answers, simulator settings) is saved. Tool id: password-lab. Plain ES2017. */
(function(){
var h=H.h, KEY='password-lab';
var css=
'.pl-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.pl-tabs .chip{min-height:44px}'+
'.pl-wrap{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}'+
'.pl-w .pl-wrap{grid-template-columns:minmax(330px,1fr) 1fr}.pl-w .pl-sticky{position:sticky;top:8px}'+
'.pl-in{display:flex;gap:8px;align-items:stretch}.pl-in .input{font-family:var(--mono);font-size:1.05rem;min-height:48px;flex:1;min-width:0}'+
'.pl-in .btn{flex:none}'+
'.pl-meter{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:12px 0 6px}.pl-meter i{display:block;height:8px;border-radius:99px;background:var(--line)}'+
'.pl-meter.r i.on{background:var(--red)}.pl-meter.a i.on{background:var(--amber)}.pl-meter.g i.on{background:var(--green)}'+
'.pl-big{font-family:var(--mono);font-size:1.6rem;line-height:1.15;margin:2px 0 4px}'+
'.pl-ck{list-style:none;margin:6px 0 0;padding:0}.pl-ck li{display:grid;grid-template-columns:26px 1fr;gap:8px;padding:8px 0;border-top:1px dotted var(--line);font-size:.93rem}'+
'.pl-ck li:first-child{border-top:0}.pl-ck .m{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.75rem;font-weight:700;border:1.5px solid var(--line);color:var(--ink3);margin-top:1px}'+
'.pl-ck .m.ok{background:var(--green);border-color:var(--green);color:#fff}.pl-ck .m.no{background:var(--red);border-color:var(--red);color:#fff}.pl-ck .m.part{background:var(--amber);border-color:var(--amber);color:#fff}'+
'.pl-ck small{display:block;color:var(--ink2);font-size:.82rem;margin-top:2px}'+
'.pl-tok{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}.pl-tok span{font-family:var(--mono);font-size:.8rem;border-radius:10px;padding:5px 9px;background:var(--surface2);border:1px solid var(--line);line-height:1.3}'+
'.pl-tok span b{display:block;font-family:var(--font);font-weight:500;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}'+
'.pl-tok span.bad{border-color:var(--red)}.pl-tok span.bad b{color:var(--red)}'+
'.pl-sp{display:grid;grid-template-columns:1fr auto;gap:4px 12px;font-size:.92rem;padding:9px 0;border-top:1px dotted var(--line)}.pl-sp:first-of-type{border-top:0}'+
'.pl-sp b{font-family:var(--mono);font-weight:600;text-align:right}.pl-sp small{grid-column:1/3;color:var(--ink2);font-size:.8rem}'+
'.pl-yn{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.pl-yn .chip{min-height:44px}'+
'.pl-q{font-size:.93rem;margin-top:12px}'+
'.pl-pin{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.pl-pin>div{background:var(--surface2);border-radius:var(--r-sm);padding:10px 12px;font-size:.88rem}'+
'.pl-pin .label{display:block;margin-bottom:2px}'+
'.pl-tbl{width:100%;border-collapse:collapse;font-size:.86rem}.pl-tbl th{font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;text-align:left;color:var(--ink2);padding:6px 4px;border-bottom:1.5px solid var(--ink)}'+
'.pl-tbl td{padding:8px 4px;border-bottom:1px solid var(--line);vertical-align:top}.pl-tbl td.mono{font-family:var(--mono);font-size:.76rem;word-break:break-all}'+
'.pl-tbl tr.hit td{background:rgba(215,25,33,.08)}.pl-tbl tr.same td.mono{color:var(--red);font-weight:600}'+
'.pl-tbl .tag{display:inline-block;font-family:var(--mono);font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:1px 8px;margin-top:3px}'+
'.pl-tbl .tag.r{background:var(--red);color:#fff}.pl-tbl .tag.g{background:var(--green);color:#fff}'+
'.pl-run{font-family:var(--mono);font-size:.85rem;background:#0B0B0B;color:#EDEDED;border-radius:var(--r-sm);padding:10px 12px;margin:10px 0;min-height:44px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'+
'.pl-seg{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.pl-seg .chip{min-height:44px}'+
'.pl-range{width:100%;height:44px;accent-color:#0B0B0B;margin:0}'+
'.pl-phrase{font-family:var(--mono);font-size:1.25rem;line-height:1.35;background:var(--surface2);border-radius:var(--r-sm);padding:14px;word-break:break-word;margin:8px 0}'+
'.pl-sc{border:1.5px solid var(--line);border-radius:var(--r-md);padding:16px;background:var(--surface)}.pl-sc.ok{border-color:var(--green)}.pl-sc.bad{border-color:var(--red)}'+
'.pl-opts{display:flex;flex-direction:column;gap:8px;margin-top:12px}.pl-opts button{text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);padding:11px 14px;min-height:44px;cursor:pointer;font:inherit;color:inherit}'+
'.pl-opts button.sel{border-color:var(--ink);border-width:2px}.pl-opts button.right{border-color:var(--green);background:rgba(62,142,82,.1)}.pl-opts button.wrong{border-color:var(--red);background:rgba(215,25,33,.07)}'+
'.pl-opts button[disabled]{cursor:default;opacity:1}'+
'.pl-pill{display:inline-block;border-radius:99px;padding:2px 12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;background:var(--surface2);border:1px solid var(--line)}'+
'.pl-pill.r{background:var(--red);color:#fff;border-color:var(--red)}.pl-pill.g{background:var(--green);color:#fff;border-color:var(--green)}.pl-pill.a{background:var(--amber);color:#fff;border-color:var(--amber)}'+
'.pl-note{font-size:.8rem;color:var(--ink2);margin:8px 0 0}'+
'@media(max-width:480px){.pl-pin{grid-template-columns:1fr}.pl-tbl .hide-s{display:none}.pl-big{font-size:1.35rem}}';
if(!document.getElementById('pl-css')){var st=document.createElement('style');st.id='pl-css';st.textContent=css;document.head.appendChild(st)}

/* ---------- word lists (local only) ---------- */
var COMMON=('123456 password 123456789 12345678 12345 qwerty abc123 111111 1234567 iloveyou password1 123123 1234 letmein monkey dragon '+
 'football baseball sunshine princess welcome admin login master qwertyuiop starwars shadow superman trustno1 passw0rd hello freedom '+
 'whatever michael charlie jordan pokemon ashley batman killer soccer hockey hunter buster computer summer winter flower cheese secret '+
 'default changeme root guest pass test abcdef abcd1234 qwerty123 1q2w3e4r zxcvbnm asdfgh 000000 654321 121212 696969 987654321 tigger '+
 'jessica lovely 666666 888888 apple orange banana chocolate cookie purple loveme angel family mustang access ninja azerty qazwsx matrix '+
 'silver golden rockyou linkedin facebook google iloveu nicole daniel babygirl password123 welcome1 admin123 love money internet').split(' ');
var NAMES=('james john robert mary patricia jennifer linda david richard sarah emma olivia sophie jack harry oliver george charlotte amelia '+
 'lucy max bella buddy molly rex fido lucky daisy rocky coco luna milo oscar teddy poppy tilly alfie ruby rosie toby barney benji paul '+
 'peter anna kate tom sam ben alex chris mark lisa laura helen claire mike steve tony andrew william thomas emily jane susan karen '+
 'nancy betty sandra donna carol ruth sharon michelle sophia isabella mia grace chloe ella jacob noah ethan liam mason lily jasmine '+
 'london paris york leeds manchester bristol glasgow cardiff belfast dublin edinburgh oxford cambridge milton keynes liverpool '+
 'birmingham newcastle brighton bath berlin amsterdam madrid rome sydney boston chicago texas florida england scotland wales ireland '+
 'france america canada africa india china europe arsenal chelsea united liverpoolfc').split(' ');
var WORDS=('acorn actor adult advice agent airport alarm album alley amber anchor angle animal ankle answer apron arch arena arrow artist '+
 'atlas attic autumn avocado badge bagel bakery balcony ballet bamboo bandit banjo banner barrel basket battery beach beacon beaker '+
 'beard beetle bell bench berry bicycle biscuit blanket blender blossom boat bonfire book border bottle boulder bracket branch bread '+
 'brick bridge broom bubble bucket buffalo bugle bundle burrow butter button cabbage cabin cactus cake camel camera candle canoe canyon '+
 'carpet carrot castle cattle cave cellar cement chalk channel chapel cherry chess chimney chisel cinema circus citrus clarinet cliff '+
 'clock cloud clover coconut comet compass copper coral cotton cousin cowboy crab crane crater crayon cricket crown crystal cupboard '+
 'curtain cushion cyclone daisy dancer dart desert diamond dinner doctor dolphin domino donkey door dragonfly drawer dream drum duck '+
 'dune eagle easel echo eclipse elbow elephant elk ember emerald engine envelope eraser falcon fabric feather fence ferry fiddle field '+
 'finger fireman flag flame flannel flask fleece flute fog forest fossil fountain fox frame freezer frost galaxy garage garden garlic '+
 'gate gazelle gem geyser ginger giraffe glacier glasses glove goat goblet gondola goose gorilla granite grape gravel guitar gutter '+
 'hammer hammock hamster harbour harp hazel hedge helmet hermit heron hill hinge hippo honey hook horizon horse hotel hourglass husky '+
 'iceberg igloo index ink insect island ivory jacket jaguar jam jar jelly jewel jigsaw journey jungle kayak kettle kiosk kitchen kite '+
 'kiwi knee knight ladder lagoon lake lamp lantern laptop lava lawn leaf lemon lens leopard letter lever library lighthouse lily '+
 'lime linen lion lizard llama lobster locket lodge lotus lunar magnet mango maple marble market mask meadow melon meteor microbe '+
 'mineral mirror mitten mole monsoon moose mosaic moss motor mountain muffin mural museum mushroom napkin nectar needle nest nickel '+
 'noodle north nutmeg oasis ocean octopus olive onion opal orbit orchard organ otter oven owl oyster paddle pagoda palace panda paper '+
 'parcel parrot pasta peach peanut pearl pebble pelican pencil penguin pepper piano pickle pigeon pillow pilot pine pirate pistachio '+
 'planet plaza plum pocket poem polar pond popcorn porch potato prairie prism pudding puffin pumpkin puppet puzzle pyramid quarry '+
 'quartz quill quilt rabbit raccoon radar radio raft rain raisin ramp raven razor record reef rhino ribbon rice riddle river robin '+
 'rocket rooftop rope rose rudder saddle saffron sail salmon sandal satchel saucer scarf school scooter scroll seal season shadowy shell '+
 'shelter shovel shrimp signal silk siren skate sketch sled slipper sloth snail snow socket sofa spider spinach sponge spoon sprout '+
 'squid stable stadium stamp starfish statue steam stencil stone storm stove straw stream string submarine sugar sunflower swan sweater '+
 'table tablet tadpole tango teapot telescope temple tennis tent thimble thistle thunder ticket tiger timber toast tomato tornado tortoise '+
 'tower tractor trail train trolley trophy trumpet tulip tunnel turtle tuxedo umbrella unicorn valley vanilla velvet violin volcano '+
 'wagon walnut walrus wardrobe wasp water wave weasel whale wheat whistle willow window wizard wolf wombat wool yacht yeti yogurt zebra '+
 'zipper red blue green yellow purple orange black white silver golden brave calm clever eager fancy gentle happy jolly lazy lucky '+
 'mighty noisy proud quiet rapid shiny silly sleepy smooth sunny swift tiny wild wise windy frozen hidden hollow humble rusty dusty').split(' ');
function uniq(a){var s={},o=[];a.forEach(function(x){x=x.toLowerCase();if(x&&!s[x]){s[x]=1;o.push(x)}});return o}
COMMON=uniq(COMMON);NAMES=uniq(NAMES);WORDS=uniq(WORDS);
/* passphrase list: only the plain dictionary words (no names, no common passwords) */
var PHRASE=WORDS.filter(function(w){return COMMON.indexOf(w)<0&&NAMES.indexOf(w)<0&&w.length>=3});
var DICT={};
WORDS.forEach(function(w){DICT[w]={k:'word',b:Math.log2(20000)}});
NAMES.forEach(function(w){DICT[w]={k:'name',b:Math.log2(10000)}});
COMMON.forEach(function(w,i){DICT[w]={k:'common',r:i+1,b:Math.log2(i+2)}});
['password','pass','word','love','secret','admin','dragon','monkey','letmein','qwerty','hello','welcome','summer','winter','spring'].forEach(function(w){if(!DICT[w])DICT[w]={k:'word',b:Math.log2(2000)}});
var SEQS=['qwertyuiop','asdfghjkl','zxcvbnm','1234567890','abcdefghijklmnopqrstuvwxyz','qazwsxedc','1qaz2wsx','01234567890'];
var LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','2':'s','!':'i','8':'b','9':'g','+':'t'};

/* speeds from the course */
var SP_DESK=3e7;   /* LinkedIn case study: a desktop computer can calculate several tens of millions of SHA-1 hashes per second */
var SP_RIG=1e11;   /* Ducklin video: a cracking service costing < $20,000 can try more than 100 billion passwords each second */
var LOCK=5;        /* online login with lockout after a few failed attempts (illustrative number) */

/* ---------- analysis ---------- */
function classes(pw){var c={l:/[a-z]/.test(pw),u:/[A-Z]/.test(pw),d:/[0-9]/.test(pw),s:/[^a-zA-Z0-9]/.test(pw)};
  c.n=(c.l?1:0)+(c.u?1:0)+(c.d?1:0)+(c.s?1:0);c.pool=(c.l?26:0)+(c.u?26:0)+(c.d?10:0)+(c.s?33:0);return c}
function unleet(s){var o='';for(var i=0;i<s.length;i++){var ch=s[i];o+=LEET[ch]||ch}return o}
function caseBits(orig){if(orig===orig.toLowerCase())return 0;if(orig===orig.toUpperCase())return 1;
  if(orig[0]===orig[0].toUpperCase()&&orig.slice(1)===orig.slice(1).toLowerCase())return 1;var n=0;for(var i=0;i<orig.length;i++)if(/[A-Z]/.test(orig[i]))n++;return Math.min(orig.length,2+n)}
function analyse(pw){
  var n=pw.length,c=classes(pw),pool=Math.max(c.pool,10),cb=Math.log2(pool);
  var low=pw.toLowerCase(),ul=unleet(low);
  var best=[0],bp=[null];
  for(var i=1;i<=n;i++){best[i]=Infinity;bp[i]=null}
  function relax(i,j,bits,tok){if(best[i]+bits<best[j]){best[j]=best[i]+bits;bp[j]={i:i,tok:tok}}}
  for(i=0;i<n;i++){if(best[i]===Infinity)continue;
    var ch=pw[i];
    /* single character (brute force) */
    if(/[\s\-_.]/.test(ch))relax(i,i+1,2.3,{t:'sep',s:ch});
    else relax(i,i+1,cb,{t:'rand',s:ch});
    /* dictionary words, plain or with substitutions */
    for(var L=3;L<=Math.min(14,n-i);L++){
      var sub=low.substr(i,L),usub=ul.substr(i,L),orig=pw.substr(i,L),d=DICT[sub],leet=false;
      if(!d&&DICT[usub]&&usub!==sub&&/[a-z]/.test(sub)){d=DICT[usub];leet=true}
      if(d)relax(i,i+L,d.b+caseBits(orig)+(leet?1.5:0),{t:d.k,s:orig,w:leet?usub:sub,leet:leet,r:d.r});
      /* keyboard / alphabet sequences */
      if(L>=4){for(var q=0;q<SEQS.length;q++){var S=SEQS[q];if(S.indexOf(sub)>=0||S.split('').reverse().join('').indexOf(sub)>=0){relax(i,i+L,Math.log2(L*60),{t:'seq',s:orig});break}}}
      /* repeats */
      if(L>=3&&new RegExp('^'+sub[0].replace(/[^a-z0-9]/,'\\$&')+'+$').test(sub))relax(i,i+L,cb+Math.log2(L),{t:'rep',s:orig});
    }
    /* digit runs and years */
    var m=/^[0-9]+/.exec(pw.slice(i));
    if(m){for(var k=1;k<=m[0].length;k++){var ds=m[0].slice(0,k),bits=k*Math.log2(10);
      if(k===4&&/^(19|20)\d\d$/.test(ds))bits=Math.log2(150);
      relax(i,i+k,bits,{t:k===4&&/^(19|20)\d\d$/.test(ds)?'year':'digits',s:ds})}}
  }
  var toks=[],j=n;while(j>0&&bp[j]){toks.unshift(bp[j].tok);j=bp[j].i}
  /* merge consecutive random chars for display */
  var mt=[];toks.forEach(function(t){var last=mt[mt.length-1];if(last&&last.t===t.t&&(t.t==='rand'||t.t==='sep')){last.s+=t.s;last.c++}else{var o={};for(var k2 in t)o[k2]=t[k2];o.c=1;mt.push(o)}});
  var dp=best[n],brute=n*Math.log2(pool),bits=Math.min(dp,brute),whole=null;
  var cw=DICT[low]||DICT[ul];if(cw&&cw.k==='common'){whole=cw;bits=Math.min(bits,cw.b)}
  var words=mt.filter(function(t){return t.t==='word'||t.t==='name'||t.t==='common'});
  var randChars=mt.filter(function(t){return t.t==='rand'}).reduce(function(a,t){return a+t.s.length},0);
  var r={pw:pw,n:n,c:c,pool:pool,bits:Math.max(0,bits),brute:brute,toks:mt,whole:whole,words:words,
    common:mt.some(function(t){return t.t==='common'})||!!whole,
    names:mt.some(function(t){return t.t==='name'}),
    leet:mt.some(function(t){return t.leet}),
    seq:mt.some(function(t){return t.t==='seq'||t.t==='rep'}),
    tail:false,passphrase:false,randChars:randChars};
  var last=mt[mt.length-1],prev=mt[mt.length-2];
  if(last&&prev&&(last.t==='digits'||last.t==='year'||(last.t==='rand'&&/^[0-9!?.]+$/.test(last.s)))&&(prev.t==='word'||prev.t==='name'||prev.t==='common'))r.tail=true;
  var distinct=uniq(words.map(function(t){return t.w}));
  r.passphrase=distinct.length>=5&&words.filter(function(t){return t.t==='word'}).length>=4;
  r.nwords=distinct.length;
  r.guesses=Math.pow(2,r.bits);
  return r;
}
function rate(r,self){
  var secs=r.guesses/SP_RIG,lvl;
  if(secs<1)lvl=0;else if(secs<86400)lvl=1;else if(secs<3.15e9)lvl=2;else if(secs<3.15e13)lvl=3;else lvl=4;
  if(r.common||r.n<6)lvl=0;
  var capped=false;
  if(self.personal==='y'&&lvl>1){lvl=1;capped=true}
  var names=['Very weak','Weak','Fair','Strong','Very strong'],cls=['r','r','a','g','g'];
  var out={lvl:lvl,name:names[lvl],cls:cls[lvl],capped:capped};
  if(self.reuse==='y'){out.name='At risk: reused';out.cls='r';out.reused=true}
  return out;
}
function fmtBig(x){if(!isFinite(x))return 'more than 10^300';if(x<1e6)return Math.round(x).toLocaleString('en-GB');
  var e=Math.floor(Math.log10(x)),m=x/Math.pow(10,e),w='';
  if(e>=6&&e<9)w=' ('+Math.round(x/1e6)+' million)';else if(e>=9&&e<12)w=' ('+Math.round(x/1e9)+' billion)';else if(e>=12&&e<15)w=' ('+Math.round(x/1e12)+' trillion)';
  return m.toFixed(1).replace(/\.0$/,'')+' \u00d7 10^'+e+w}
function fmtTime(s){if(!isFinite(s))return 'longer than the age of the universe';
  if(s<1)return 'less than a second';if(s<60)return Math.round(s)+' second'+(Math.round(s)===1?'':'s');if(s<3600)return Math.round(s/60)+' minutes';
  if(s<86400)return Math.round(s/3600)+' hours';if(s<31557600)return Math.round(s/86400)+' days';var y=s/31557600;
  if(y<1000)return Math.round(y)+' years';if(y<1e6)return Math.round(y/1000)+' thousand years';if(y<1e9)return Math.round(y/1e6)+' million years';
  if(y<1.4e10)return Math.round(y/1e9)+' billion years';return 'longer than the age of the universe'}
var TOKNAME={word:'dictionary word',name:'name or place',common:'common password',seq:'keyboard / sequence',rep:'repeated',digits:'digits',year:'looks like a year',rand:'random characters',sep:'separator'};

/* ---------- SHA-256 (SubtleCrypto, with a small JS fallback) ---------- */
var K256=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function utf8(s){return new TextEncoder().encode(s)}
function rotr(x,n){return (x>>>n)|(x<<(32-n))}
function sha256js(str){var b=utf8(str),l=b.length,tot=Math.ceil((l+9)/64)*64,m=new Uint8Array(tot);m.set(b);m[l]=0x80;
  var bl=l*8;m[tot-4]=(bl>>>24)&255;m[tot-3]=(bl>>>16)&255;m[tot-2]=(bl>>>8)&255;m[tot-1]=bl&255;var hi=Math.floor(bl/4294967296);m[tot-8]=(hi>>>24)&255;m[tot-7]=(hi>>>16)&255;m[tot-6]=(hi>>>8)&255;m[tot-5]=hi&255;
  var HH=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],w=new Array(64);
  for(var o=0;o<tot;o+=64){for(var i=0;i<16;i++)w[i]=(m[o+4*i]<<24)|(m[o+4*i+1]<<16)|(m[o+4*i+2]<<8)|m[o+4*i+3];
    for(i=16;i<64;i++){var s0=rotr(w[i-15],7)^rotr(w[i-15],18)^(w[i-15]>>>3),s1=rotr(w[i-2],17)^rotr(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
    var a=HH[0],bb=HH[1],c=HH[2],d=HH[3],e=HH[4],f=HH[5],g=HH[6],hh=HH[7];
    for(i=0;i<64;i++){var S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K256[i]+w[i])|0,S0=rotr(a,2)^rotr(a,13)^rotr(a,22),mj=(a&bb)^(a&c)^(bb&c),t2=(S0+mj)|0;
      hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=bb;bb=a;a=(t1+t2)|0}
    HH[0]=(HH[0]+a)|0;HH[1]=(HH[1]+bb)|0;HH[2]=(HH[2]+c)|0;HH[3]=(HH[3]+d)|0;HH[4]=(HH[4]+e)|0;HH[5]=(HH[5]+f)|0;HH[6]=(HH[6]+g)|0;HH[7]=(HH[7]+hh)|0}
  return HH.map(function(x){return ('00000000'+(x>>>0).toString(16)).slice(-8)}).join('')}
function sha256(str){
  try{if(window.crypto&&crypto.subtle&&crypto.subtle.digest)return crypto.subtle.digest('SHA-256',utf8(str)).then(function(buf){return Array.prototype.map.call(new Uint8Array(buf),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}).catch(function(){return sha256js(str)})}catch(e){}
  return Promise.resolve(sha256js(str))}
window.__plSha256js=sha256js;
function randInt(n){try{var a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%n}catch(e){return Math.floor(Math.random()*n)}}
function randHex(n){var s='';for(var i=0;i<n;i++)s+='0123456789abcdef'[randInt(16)];return s}

/* ---------- breach simulator data (made-up users) ---------- */
var USERS=[
 {u:'ann',pw:'apple',reuse:'online banking'},
 {u:'ben',pw:'sunshine',reuse:null},
 {u:'cara',pw:'apple',reuse:null},
 {u:'dan',pw:'Pa22w0rd',reuse:'work email'},
 {u:'ella',pw:'bamboo glasses book engine red',reuse:null},
 {u:'finn',pw:'monkey123',reuse:'shopping site'},
 {u:'gita',pw:'giYT%$54vcD3W',reuse:null},
 {u:'hal',pw:'rex2019',reuse:'social media'}];
var CAND=null;
function candidates(){if(CAND)return CAND;var out=[],seen={};function add(x){if(!seen[x]){seen[x]=1;out.push(x)}}
  COMMON.forEach(add);NAMES.forEach(add);WORDS.forEach(add);
  var base=COMMON.concat(NAMES,WORDS);
  base.forEach(function(w){add(w[0].toUpperCase()+w.slice(1))});
  ['1','12','123','1234','!','2024'].forEach(function(sfx){base.forEach(function(w){add(w+sfx)})});
  var rev={a:'4',e:'3',i:'1',o:'0',s:'2',t:'7'};
  base.forEach(function(w){var l=w.replace(/[aeiost]/g,function(c){return rev[c]});if(l!==w){add(l);add(l[0].toUpperCase()+l.slice(1))}
    var l2=w.replace(/[aeiost]/g,function(c){return c==='s'?'5':rev[c]});if(l2!==w)add(l2[0].toUpperCase()+l2.slice(1))});
  NAMES.concat(COMMON.slice(0,40)).forEach(function(w){for(var y=1950;y<=2025;y++)add(w+y)});
  CAND=out;return out}

/* ---------- decision scenarios ---------- */
var SC=[
 {id:'s1',topic:'Browser',q:'You are in a public library and log in to your email on one of their computers. The browser offers: "Save password for this site?"',
  o:['Save it - the browser\'s password storage is strong','Never - do not store passwords in the browser of a public machine','Save it, but delete your history afterwards'],a:1,
  w:'The course is clear: under no circumstances store passwords in the browsers of public machines in places such as cafes, libraries and workplaces. Your data is stored on the machine and could be misused by another user or an administrator.'},
 {id:'s2',topic:'Browser',q:'On your own laptop, which nobody else uses, the browser offers to remember your password for a news site you visit every day.',
  o:['Acceptable - this is a machine you are the sole user of','Never acceptable - browsers cannot store passwords securely','Only if you also write the password on a sticky note as a backup'],a:0,
  w:'Browser storage is strong and not visible to casual inspection, so it is reasonable on a machine you alone use or where you entirely trust the other users. Sticky notes near the computer break the Good password checklist.'},
 {id:'s3',topic:'Manager',multi:true,q:'You are choosing a password manager. Which checks does the course tell you to make? (Select all that apply.)',
  o:['It needs a password (master password) to open','It locks itself after a period of inactivity','Passwords are stored encrypted on your computer','It has been evaluated by a reputable independent organisation (e.g. AV-TEST)','A friend on a forum says it is fine'],a:[0,1,2,3],
  w:'Check that the manager requires a password, locks after inactivity, encrypts the stored passwords, and has been evaluated by a reputable independent organisation. Do not depend on anecdotal evidence. Also check it runs on your devices and can synchronise if you need that.'},
 {id:'s4',topic:'Manager',q:'Which is the best master password for your new password manager?',
  o:['Buster2015 - your dog\'s name and the year you got him','The same strong password you already use for your email','A long phrase of unusual, unrelated random words','A short random string like k9#T, because the manager is encrypted'],a:2,
  w:'The protection a password manager offers is only as good as the master password. Make it long and hard to guess - ideally a phrase or combination of random words. In 2015 attackers stole password stores from LastPass, putting users with weak master passwords at risk. Never reuse it.'},
 {id:'s5',topic:'Manager',q:'Your password manager shows: "A security update is available."',
  o:['Install it promptly','Ignore it - password managers are already secure','Uninstall the manager and go back to a notebook'],a:0,
  w:'Password managers are a prime target for hackers, and flaws are found (for example in LastPass in 2019, fixed almost immediately by an update). Keep the software up to date. A notebook is less secure: thieves look for them and they get left on trains.'},
 {id:'s6',topic:'OAuth',q:'A new website offers "Sign in with Google". What is the main trade-off?',
  o:['There is none - OAuth is a complete solution','You only need one password, but if it is stolen or forgotten, every site you use with it is affected','The website will learn your Google password'],a:1,
  w:'With OAuth the website checks a digitally signed token from the provider, so it never sees your Google password. It simplifies things, but if an attacker gets that one password they can reach every site you sign in to with it - so protect it strongly (and with two-factor authentication).'},
 {id:'s7',topic:'Questions',q:'A shopping site asks for a security question: "What is your mother\'s maiden name?"',
  o:['Give the true answer so you can remember it','Make up an answer that cannot be worked out from your social media, different for each site, and keep it securely','Leave a joke answer like "password"'],a:1,
  w:'For most non-official sites you can invent the memorable information so it cannot be found on your social media, and make it unique per site. Keep track of the answers securely, for example in a spreadsheet inside an encrypted folder (such as VeraCrypt) or in your password manager. Official sites (bank, government) need an accurate date of birth.'},
 {id:'s8',topic:'2FA',q:'Your bank offers online banking customers a card reader that generates a passcode from your card and PIN. Should you use it?',
  o:['Yes - it is two-factor authentication: something you have (card) plus something you know (PIN)','No - a strong password is enough','Only for payments over 1,000'],a:0,
  w:'The card reader confirms you both have the card and know the PIN, without typing the PIN on a web page. The course suggests finding out if your bank offers one - and if not, considering a more secure banking service.'},
 {id:'s9',topic:'2FA',q:'You run a well-known business and your mobile number and birthday are on your social media. You use SMS codes for two-factor authentication. What is the risk, and the better option?',
  o:['No risk - SMS codes cannot be intercepted without stealing the phone','A targeted attacker can get your number moved to a new SIM and receive your codes; use a hardware security key, or an unpublished number used only for 2FA','The risk is that the code expires too fast; ask for longer codes'],a:1,
  w:'SMS 2FA works well against random attacks, but targeted criminals have found it easy to take over a phone number (using details from social media) without stealing the phone. A hardware security key is much more secure; alternatively use a separate pay-as-you-go number used only for authentication and never published.'},
 {id:'s10',topic:'2FA',q:'Your phone suddenly shows "No service" and your number stops working, although the network is fine for others.',
  o:['Wait a few days and see','Contact your phone provider immediately - your number might have been diverted','Restart the phone and forget about it'],a:1,
  w:'If your phone number stops working, contact your phone provider immediately to check why. It might have been diverted to a criminal\'s SIM so they can receive your authentication codes.'},
 {id:'s11',topic:'2FA',q:'After entering your password and SMS code on a shared office computer, the site asks: "Trust this computer? You won\'t need a code here again."',
  o:['Yes - it saves time','No - on a shared machine anyone could then get in with just your password','Yes, as long as you log out'],a:1,
  w:'Trusting a computer means a single password will be enough from then on, which is a weakness if the machine is shared or stolen. Only trust devices you alone control.'},
 {id:'s12',topic:'Devices',q:'You have just installed a new broadband router. Its admin password is printed on a label: "admin".',
  o:['Leave it - it is only the router','Change the default password','Leave it but hide the router'],a:1,
  w:'Default passwords are set at the factory and some companies use a single password for all their devices, so an attacker only needs to know the make of your router. Change it.'}
];

Tools.register('password-lab',{title:'Password lab',desc:'Test made-up passwords against the course checklist, see how attackers crack them, generate passphrases and practise password manager and 2FA decisions.',
mount:function(el,ctx){
  function fresh(){return {tab:'analyse',sc:{},si:0,store:'plain',lock:true,bf:{l:true,u:false,d:false,s:false,len:8},nw:5,sepc:' ',done:false}}
  var S=ctx.load(KEY);if(!S||!S.sc)S=fresh();
  function save(){try{ctx.save(S,KEY)}catch(e){}}
  /* memory only - never saved */
  var M={pw:'',show:false,self:{reuse:null,personal:null},pin:null,phrase:'',saying:'',sim:null};
  var root=h('div',{class:'tool'});el.innerHTML='';el.appendChild(root);

  function header(){
    var rb=h('button',{class:'btn ghost sm',onclick:function(){if(rb._c){S=fresh();M.pw='';M.pin=null;M.self={reuse:null,personal:null};M.sim=null;save();render()}else{rb._c=true;rb.textContent='Tap again to reset';setTimeout(function(){rb._c=false;if(rb.isConnected)rb.textContent='Reset'},3000)}}},'Reset');
    var nd=Object.keys(S.sc).length;
    return h('div',null,h('div',{class:'row between',style:{marginBottom:'8px'}},h('span',{class:'label'},'Password lab \u2022 Week 2'),rb),
      h('div',{class:'pl-tabs',role:'tablist'},[['analyse','1 Analyse'],['attack','2 Attacker view'],['phrase','3 Passphrases'],['decide','4 Decide'+(nd?' '+nd+'/'+SC.length:'')]].map(function(t){
        return h('button',{class:'chip'+(S.tab===t[0]?' on':''),role:'tab','aria-selected':S.tab===t[0]?'true':'false',onclick:function(){S.tab=t[0];save();render()}},t[1])})));
  }

  /* ===== 1 Analyse ===== */
  function analyseTab(){
    var inp=h('input',{class:'input',type:M.show?'text':'password',autocomplete:'off',autocapitalize:'off',autocorrect:'off',spellcheck:'false','aria-label':'Made-up password to test',placeholder:'Type a made-up example',value:M.pw});
    inp.setAttribute('data-lpignore','true');
    var eye=h('button',{class:'btn ghost',type:'button','aria-label':M.show?'Hide password':'Show password',onclick:function(){M.show=!M.show;inp.type=M.show?'text':'password';eye.textContent=M.show?'Hide':'Show'}},M.show?'Hide':'Show');
    var left=h('div',{class:'card flat'},h('span',{class:'label'},'Test a password'),
      h('div',{class:'callout',style:{margin:'6px 0 12px',fontSize:'.9rem'}},h('b',null,'Never type a real password. '),'Make one up, as the course asks. Nothing you type here is saved or sent anywhere - it is checked on this device and forgotten when you leave.'),
      h('div',{class:'pl-in'},inp,eye),
      h('div',{class:'row',style:{gap:'6px',marginTop:'10px'}},h('span',{class:'tiny muted'},'Try:'),
        ['letmein','Pa22w0rd','milton keynes','monkey123','bamboo glasses book engine red','giYT%$54vcD3W'].map(function(x){return h('button',{class:'chip',style:{minHeight:'44px',fontFamily:'var(--mono)',fontSize:'.8rem'},onclick:function(){M.pw=x;M.show=true;render()}},x)})));
    var selfBox=h('div');
    function yn(key,q){return h('div',{class:'pl-q'},h('div',null,q),h('div',{class:'pl-yn'},[['y','Yes'],['n','No']].map(function(o){
      return h('button',{class:'chip'+(M.self[key]===o[0]?' on':''),onclick:function(){M.self[key]=M.self[key]===o[0]?null:o[0];update();selfBox.innerHTML='';selfBox.appendChild(selfQs())}},o[1])})))}
    function selfQs(){return h('div',null,h('div',{class:'label',style:{marginTop:'14px'}},'Two things only you can know'),
      yn('reuse','Would you use this password (or a variant) on more than one site?'),
      yn('personal','Does it contain anything about you - names of friends, family or pets, your street, town or birthday?'))}
    selfBox.appendChild(selfQs());left.appendChild(selfBox);
    var pinBox=h('div');left.appendChild(pinBox);
    var right=h('div',{class:'pl-sticky'});
    function update(){
      var pw=M.pw;right.innerHTML='';pinBox.innerHTML='';
      if(!pw){right.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Result'),h('h3',{style:{margin:'2px 0 8px'}},'Type a made-up password'),
        h('p',{style:{margin:0}},'You will see how an attacker would see it: which parts are in their dictionaries, how many guesses it would take, and how long that is for an attacker with a stolen password database.'),
        h('div',{class:'callout note',style:{margin:'12px 0 0'}},h('b',null,'Course activity: '),'type the name of a city, town or village in lower case (repeat a short name such as "ayr"). Pin the result, then turn a memorable saying into a strong password (tab 3) and compare.')));return}
      var r=analyse(pw),rt=rate(r,M.self),secs=r.guesses/SP_RIG;
      var meter=h('div',{class:'pl-meter '+rt.cls},[0,1,2,3,4].map(function(i){return h('i',{class:i<=rt.lvl?'on':''})}));
      var card=h('div',{class:'card'},h('div',{class:'row between'},h('span',{class:'label'},'Strength'),h('span',{class:'pl-pill '+rt.cls},rt.name)),meter,
        h('div',{class:'label',style:{marginTop:'10px'}},'Estimated guesses to find it'),h('div',{class:'pl-big'},fmtBig(r.guesses)),
        h('div',{class:'tiny muted'},'\u2248 '+Math.round(r.bits)+' bits. Pure brute force over '+r.pool+' possible characters would need '+fmtBig(Math.pow(r.pool,r.n))+' guesses - attackers use the cheaper route.'),
        h('div',{class:'label',style:{marginTop:'14px'}},'How an attacker sees it'),
        h('div',{class:'pl-tok'},r.toks.map(function(t){var bad=t.t==='common'||t.t==='name'||t.t==='seq'||t.t==='rep'||t.leet;
          var lab=t.t==='common'?'common password'+(t.r?' #'+t.r:''):t.t==='rand'?(t.c>1?t.c+' random characters':'random character'):TOKNAME[t.t]+(t.leet?' + swaps':'');
          return h('span',{class:bad?'bad':''},h('b',null,lab),t.t==='sep'?'"'+t.s+'"':t.s)})),
        r.whole?h('p',{class:'tiny',style:{margin:'6px 0 0',color:'var(--red)'}},'The whole password is on lists of the most common passwords. Attackers try these first - it falls in '+(r.whole.r<=LOCK?'the first few guesses, even before an account lockout.':'seconds.')):null);
      var sp=h('div',{class:'card'},h('span',{class:'label'},'Time to crack (worst case for you)'),
        h('div',{class:'pl-sp'},h('span',null,'Guessing online, account locks after '+LOCK+' wrong tries'),h('b',null,r.guesses<=LOCK?'falls':'locked out'),
          h('small',null,r.guesses<=LOCK?'One of the first few guesses - lockout does not save it.':'Lockouts foil online dictionary and brute force attacks. That is why attackers go after the stored password database instead.')),
        h('div',{class:'pl-sp'},h('span',null,'Stolen database, unsalted SHA-1 on a desktop PC'),h('b',null,fmtTime(r.guesses/SP_DESK)),h('small',null,'LinkedIn 2012: a desktop computer can calculate several tens of millions of SHA-1 hashes per second.')),
        h('div',{class:'pl-sp'},h('span',null,'Stolen database, cracking service under $20,000'),h('b',{style:{color:secs<86400?'var(--red)':''}},fmtTime(secs)),h('small',null,'From the course video: more than 100 billion guesses each second under ideal circumstances.')));
      /* checklist */
      var L=[];
      function it(state,t,why){L.push(h('li',null,h('span',{class:'m '+(state===1?'ok':state===0?'no':state===0.5?'part':'')},state===1?'\u2713':state===0?'\u00d7':state===0.5?'~':state===-1?'\u2013':'?'),h('div',null,t,h('small',null,why))))}
      it(r.common||r.names?0:(r.words.length&&!r.passphrase&&r.randChars<6?0.5:1),'Not a common password, name or plain dictionary word',r.common?'Common passwords such as 12345, QWERTY or letmein are tried first - attackers will not even need their tools.':r.names?'Names of people, pets and places are in attackers\' dictionaries (with atlases and stolen lists).':r.words.length&&!r.passphrase?'Contains dictionary words. Attackers always start with dictionary words and variations of them.':'Nothing found in this lab\'s lists. Real attackers\' dictionaries are much bigger.');
      it(r.leet?0:1,'No simple substitutions like pa22w0rd',r.leet?'Swapping letters for look-alike numbers or symbols is one of the first variations cracking programs try.':'No look-alike swaps found.');
      it(r.tail?0:1,'No digits just tacked on the end',r.tail?'Easy passwords don\'t get harder if all you do is add digits on the end. Cracking programs do that too.':'OK.');
      it(r.seq?0:1,'No keyboard patterns or repeats',r.seq?'Sequences like qwerty, 12345 or aaaa are in every cracking list.':'OK.');
      it(r.n>=14?1:r.n>=8?0.5:0,'Long: aim for 14 characters or more ('+r.n+' now)','Go as long as you can. Every extra character multiplies the work for a brute force attack.');
      it(r.c.n===4?1:r.c.n>=2?0.5:0,'A random mix of upper case, lower case, numbers and other characters ('+r.c.n+'/4 types)','Like giYT%$54vcD3W. A bigger set of characters means more possibilities per position.');
      it(r.passphrase?1:r.nwords>=2?0.5:(r.c.n===4&&r.n>=14?-1:0),'Or: at least five unrelated words ('+r.nwords+' found)','For memorable passwords, use a string of at least five unrelated dictionary words, e.g. bamboo glasses book engine red. They need to be unusual, not words that relate to you.');
      it(M.self.reuse==null?null:M.self.reuse==='y'?0:1,'One account, one password',M.self.reuse==='y'?'Most compromises happen when a password cracked on a low-value site is tried on a higher-value one. Once your password is in a breached list, its strength no longer matters.':M.self.reuse==='n'?'Good: a different password for every account.':'Answer the question on the left.');
      it(M.self.personal==null?null:M.self.personal==='y'?0:1,'Nothing personal',M.self.personal==='y'?'The crooks have Facebook, Twitter and more. Personal details can be guessed, so this lab caps the rating at Weak.':M.self.personal==='n'?'Good.':'Answer the question on the left.');
      var ok=L.length;
      var ck=h('div',{class:'card'},h('span',{class:'label'},'Good password checklist'),h('ul',{class:'pl-ck'},L));
      right.appendChild(card);right.appendChild(sp);right.appendChild(ck);
      if(rt.reused)card.appendChild(h('div',{class:'callout',style:{margin:'10px 0 0'}},'Reuse beats strength: criminals try breached user names and passwords on other accounts (the Exploit.In list held 593 million email addresses with passwords).'));
      /* pin */
      var pb=h('button',{class:'btn ghost sm',onclick:function(){M.pin={n:r.n,name:rt.name,g:r.guesses,t:fmtTime(secs),cls:rt.cls};update()}},M.pin?'Pin this one instead':'Pin to compare');
      pinBox.appendChild(h('div',{style:{marginTop:'14px'}},h('div',{class:'row between'},h('span',{class:'label'},'Compare'),pb),
        M.pin?h('div',{class:'pl-pin'},h('div',null,h('span',{class:'label'},'Pinned'),h('b',null,M.pin.name),h('div',{class:'tiny'},M.pin.n+' characters'),h('div',{class:'tiny'},'cracked in '+M.pin.t)),
          h('div',null,h('span',{class:'label'},'Current'),h('b',null,rt.name),h('div',{class:'tiny'},r.n+' characters'),h('div',{class:'tiny'},'cracked in '+fmtTime(secs)))):h('p',{class:'tiny muted',style:{margin:'4px 0 0'}},'Pin a result (only the score is kept, not the password), then edit and compare.'),
        M.pin&&M.pin.g>0?h('p',{class:'tiny',style:{margin:'8px 0 0'}},r.guesses>M.pin.g?'The current one needs about '+fmtBig(r.guesses/M.pin.g)+' times more guesses. Think about why: length, range of characters, personal information, and how easy it is to remember.':r.guesses<M.pin.g?'The current one is weaker than the pinned one.':'Same strength.'):null));
      if(!S.anal){S.anal=true;save()}
    }
    inp.addEventListener('input',function(){M.pw=inp.value;update()});
    update();
    root.appendChild(h('div',{class:'pl-wrap'},left,right));
    setTimeout(function(){try{if(!M.pw)inp.focus({preventScroll:true})}catch(e){}},0);
  }

  /* ===== 2 Attacker view ===== */
  function attackTab(){
    /* brute force calculator */
    var bf=S.bf,sets=[['l','a-z',26],['u','A-Z',26],['d','0-9',10],['s','symbols',33]];
    function pool(){var p=0;sets.forEach(function(x){if(bf[x[0]])p+=x[2]});return p||26}
    var outBox=h('div');
    var lenLab=h('b',{style:{fontFamily:'var(--mono)'}},String(bf.len));
    var rng=h('input',{type:'range',class:'pl-range',min:'1',max:'20',step:'1',value:String(bf.len),'aria-label':'Password length',oninput:function(){bf.len=+rng.value;lenLab.textContent=bf.len;save();calc()}});
    function calc(){var p=pool(),k=Math.pow(p,bf.len),eg=[],al=(bf.l?'abc':'')+(bf.u?'ABC':'')+(bf.d?'012':'')+(bf.s?'!#%':'');if(!al)al='abc';
      eg=[al[0],al[1],'\u2026',al[0]+al[0],al[0]+al[1],'\u2026'];
      outBox.innerHTML='';
      outBox.appendChild(h('div',{class:'pl-sp'},h('span',null,'Possible passwords ('+p+'^'+bf.len+')'),h('b',null,fmtBig(k))));
      outBox.appendChild(h('div',{class:'pl-sp'},h('span',null,'Desktop PC, 30 million/s'),h('b',null,fmtTime(k/SP_DESK))));
      outBox.appendChild(h('div',{class:'pl-sp'},h('span',null,'Cracking service, 100 billion/s'),h('b',{style:{color:k/SP_RIG<86400?'var(--red)':''}},fmtTime(k/SP_RIG))));
      outBox.appendChild(h('p',{class:'pl-note'},'Order tried: '+eg.join(', ')+' - every combination in turn until one matches.'+(p===26&&bf.len===8?' This is the video\'s example: random eight-letter passwords "look pretty tough" at 26^8 - about 200 billion - but a cracking service gets through them in about 2 seconds.':'')));
    }
    var bfCard=h('div',{class:'card'},h('span',{class:'label'},'Brute force attack'),h('h3',{style:{margin:'2px 0 6px'}},'How big is the haystack?'),
      h('p',{style:{margin:'0 0 8px',fontSize:'.93rem'}},'A brute force attack methodically works through all possible passwords ("A", then "AA", "AB" and so on). Choose the characters and length:'),
      h('div',{class:'pl-seg'},sets.map(function(x){return h('button',{class:'chip'+(bf[x[0]]?' on':''),'aria-pressed':bf[x[0]]?'true':'false',onclick:function(e){bf[x[0]]=!bf[x[0]];if(!bf.l&&!bf.u&&!bf.d&&!bf.s)bf[x[0]]=true;save();render()}},x[1]+' ('+x[2]+')')})),
      h('div',{class:'row between'},h('span',{class:'label'},'Length'),lenLab),rng,outBox);
    calc();

    /* breach simulator */
    var sim=M.sim||(M.sim={salts:USERS.map(function(){return randHex(8)}),hash:{},prog:0,cracked:{},running:false,ran:{}});
    var mode=S.store;
    var tbl=h('tbody');
    var runLine=h('div',{class:'pl-run',role:'status'},mode==='plain'?'No attack needed: the passwords can simply be read.':'Ready. The attacker has the stolen table above.');
    var stats=h('div',{class:'tiny muted'});
    function stored(i,cb){var u=USERS[i];if(mode==='plain')return cb(u.pw);var key=mode+':'+i;if(sim.hash[key])return cb(sim.hash[key]);
      sha256(mode==='salt'?sim.salts[i]+u.pw:u.pw).then(function(x){sim.hash[key]=x;cb(x)})}
    function drawTable(){tbl.innerHTML='';var counts={};
      USERS.forEach(function(u,i){var tr=h('tr'),cell=h('td',{class:'mono'},'\u2026');tbl.appendChild(tr);
        var cracked=mode==='plain'||sim.cracked[mode+':'+i];
        tr.className=cracked?'hit':'';
        tr.appendChild(h('td',null,u.u));
        if(mode==='salt')tr.appendChild(h('td',{class:'mono hide-s'},sim.salts[i]));
        tr.appendChild(cell);
        tr.appendChild(h('td',null,cracked?h('span',{style:{fontFamily:'var(--mono)',fontSize:'.8rem'}},u.pw):h('span',{class:'muted tiny'},'?'),
          sim.ran[mode]||mode==='plain'?h('div',null,h('span',{class:'tag '+(cracked?'r':'g')},cracked?'cracked':'survived')):null));
        stored(i,function(v){cell.textContent=mode==='plain'?v:v.slice(0,16)+'\u2026';
          if(mode==='hash'){counts[v]=(counts[v]||[]).concat([tr]);if(counts[v].length>1)counts[v].forEach(function(t){t.classList.add('same')})}});
      });
    }
    var thead=h('thead',null,h('tr',null,h('th',null,'User'),mode==='salt'?h('th',{class:'hide-s'},'Salt'):null,h('th',null,mode==='plain'?'Stored password':'Stored hash'),h('th',null,'Attacker knows')));
    var reuseBox=h('div');
    function drawReuse(){reuseBox.innerHTML='';if(!(sim.ran[mode]||mode==='plain'))return;
      var hits=USERS.filter(function(u,i){return u.reuse&&(mode==='plain'||sim.cracked[mode+':'+i])});
      reuseBox.appendChild(h('div',{class:'callout',style:{margin:'12px 0 0'}},h('b',null,'Next: credential stuffing. '),'Criminals try the same user name and password on other accounts. '+
        (hits.length?hits.map(function(u){return u.u+' reused it on '+u.reuse}).join('; ')+' - '+hits.length+' more account'+(hits.length>1?'s':'')+' taken over, however strong those sites\' own security is.':'None of the cracked users reused their password, so the damage stops here.')));}
    function run(){if(sim.running)return;var C=candidates(),idx=USERS.map(function(u){return C.indexOf(u.pw)});
      sim.running=true;var start=0,step=Math.ceil(C.length/90),per=mode==='salt'?USERS.length:1;
      var timer=setInterval(function(){if(!root.isConnected){clearInterval(timer);sim.running=false;return}
        start=Math.min(C.length,start+step);
        USERS.forEach(function(u,i){if(idx[i]>=0&&idx[i]<start)sim.cracked[mode+':'+i]=true});
        runLine.textContent='Trying "'+C[start-1]+'"  \u2022  '+start.toLocaleString('en-GB')+' / '+C.length.toLocaleString('en-GB')+' candidates';
        stats.textContent='Hashes computed: '+(start*per).toLocaleString('en-GB')+(mode==='salt'?' (each candidate hashed '+USERS.length+' times - once per salt)':' (each candidate hashed once and compared with every stored hash)');
        drawTable();
        if(start>=C.length){clearInterval(timer);sim.running=false;sim.ran[mode]=true;
          var n=USERS.filter(function(u,i){return sim.cracked[mode+':'+i]}).length;
          runLine.textContent='Finished: '+n+' of '+USERS.length+' passwords cracked.';drawTable();drawReuse();lesson()}},45);
    }
    var lessonBox=h('div');
    function lesson(){lessonBox.innerHTML='';var t;
      if(mode==='plain')t=['RockYou (2009)','32 million accounts were compromised and the company stored passwords in plaintext - and only required five alphanumeric characters. A successful attack on the server reveals every user\'s password. No cracking needed.'];
      else if(mode==='hash')t=sim.ran.hash?['LinkedIn (2012)','6.5 million passwords were stolen as unsalted SHA-1 hashes. The attacker hashes each dictionary word once and compares it with every stored hash. Users who chose the same password (ann and cara) share a hash, so one hit cracks both. Within a day, LinkedIn passwords were being published.']:['Look before you attack','Two rows have exactly the same hash. Hashing always gives the same output for the same input - so ann and cara must have the same password. Now run the dictionary attack.'];
      else t=['Salt to protect','A random salt is added to each password before hashing, so identical passwords get completely different hashes, and precomputed tables of hashes are useless. The attacker must hash every candidate once per user - '+USERS.length+' times the work here, millions of times with a real database. Salting only works with truly random salts per password that are long enough. It still cannot save a password that is in the dictionary: only the strong ones (gita, ella) survived.'];
      lessonBox.appendChild(h('div',{class:'callout '+(mode==='salt'?'tip':''),style:{margin:'12px 0 0'}},h('b',null,t[0]+': '),t[1]));}
    var simCard=h('div',{class:'card'},h('span',{class:'label'},'Stolen password database'),h('h3',{style:{margin:'2px 0 6px'}},'How was it stored?'),
      h('p',{style:{margin:'0 0 6px',fontSize:'.93rem'}},'Attackers have copied a site\'s user table. Choose how the site stored the passwords, then run a dictionary attack: common passwords, words, names and places, plus variations (capitals, digits on the end, look-alike swaps, years).'),
      h('div',{class:'pl-seg'},[['plain','Plaintext'],['hash','Hashed, no salt'],['salt','Hashed + unique salt']].map(function(x){
        return h('button',{class:'chip'+(mode===x[0]?' on':''),onclick:function(){if(sim.running)return;S.store=x[0];save();render()}},x[1])})),
      h('div',{style:{overflowX:'auto'}},h('table',{class:'pl-tbl'},thead,tbl)),
      runLine,stats,
      h('div',{class:'row',style:{marginTop:'10px'}},
        h('button',{class:'btn primary',disabled:mode==='plain',onclick:function(){if(sim.ran[mode]){USERS.forEach(function(u,i){delete sim.cracked[mode+':'+i]});sim.ran[mode]=false;reuseBox.innerHTML=''}run()}},sim.ran[mode]?'Run again':'Run dictionary attack')),
      lessonBox,reuseBox,
      h('p',{class:'pl-note'},'This demo\'s dictionary has '+candidates().length.toLocaleString('en-GB')+' candidates. Real attack dictionaries include atlases, literature, lists of stolen passwords and billions of variations. The hashes shown are real SHA-256 values computed on your device.'));
    if(sim.ran[mode]){var n0=USERS.filter(function(u,i){return sim.cracked[mode+':'+i]}).length;runLine.textContent='Finished: '+n0+' of '+USERS.length+' passwords cracked.'}
    drawTable();lesson();drawReuse();

    var lockCard=h('div',{class:'card flat'},h('span',{class:'label'},'Online guessing'),h('h3',{style:{margin:'2px 0 6px'}},'Why do attackers want the database?'),
      h('p',{style:{margin:'0 0 8px',fontSize:'.93rem'}},'Guessing on the live login page is slow and visible. Almost all systems restrict the number of unsuccessful logins, after which the account is locked.'),
      h('div',{class:'pl-yn'},h('button',{class:'chip'+(S.lock?' on':''),onclick:function(){S.lock=true;save();render()}},'Lockout after '+LOCK+' tries'),h('button',{class:'chip'+(!S.lock?' on':''),onclick:function(){S.lock=false;save();render()}},'No lockout')),
      h('p',{style:{margin:'10px 0 0',fontSize:'.93rem'}},S.lock?'The attacker gets '+LOCK+' guesses per account: 123456, password, 123456789, 12345678, 12345. Only people using one of the very top passwords fall. Note also the shoulder-surfing and obvious-guess attacks - and the default passwords on routers.':'With no lockout the attacker can keep going through the whole dictionary against the live site. Every system should watch for unsuccessful attempts to log in.'));
    root.appendChild(h('div',{class:'pl-wrap'},h('div',null,bfCard,lockCard),simCard));
  }

  /* ===== 3 Passphrases ===== */
  function phraseTab(){
    var N=PHRASE.length;
    var out=h('div',{class:'pl-phrase','aria-live':'polite'},M.phrase||'\u2014');
    var info=h('div');
    function gen(){var w=[];for(var i=0;i<S.nw;i++)w.push(PHRASE[randInt(N)]);M.phrase=w.join(S.sepc);out.textContent=M.phrase;inf()}
    function inf(){info.innerHTML='';var bits=S.nw*Math.log2(N),g=Math.pow(N,S.nw);
      info.appendChild(h('div',{class:'pl-sp'},h('span',null,S.nw+' words from a list of '+N),h('b',null,Math.round(bits)+' bits')));
      info.appendChild(h('div',{class:'pl-sp'},h('span',null,'Combinations ('+N+'^'+S.nw+')'),h('b',null,fmtBig(g))));
      info.appendChild(h('div',{class:'pl-sp'},h('span',null,'Even if the attacker knows this exact list, at 100 billion/s'),h('b',{style:{color:g/SP_RIG<86400?'var(--red)':''}},fmtTime(g/SP_RIG))));
      if(S.nw<5)info.appendChild(h('p',{class:'pl-note',style:{color:'var(--red)'}},'The course checklist asks for at least five unrelated words.'));}
    var nlab=h('b',{style:{fontFamily:'var(--mono)'}},String(S.nw));
    var rng=h('input',{type:'range',class:'pl-range',min:'3',max:'8',value:String(S.nw),'aria-label':'Number of words',oninput:function(){S.nw=+rng.value;nlab.textContent=S.nw;save();if(M.phrase)gen();else inf()}});
    var genCard=h('div',{class:'card'},h('span',{class:'label'},'Method 1 \u2022 Random words'),h('h3',{style:{margin:'2px 0 6px'}},'Passphrase generator'),
      h('p',{style:{margin:'0 0 6px',fontSize:'.93rem'}},'"For memorable passwords use a string of at least five unrelated dictionary words" - like the famous "correct horse battery staple". Words are picked by your device\'s secure random generator from a built-in list. Nothing is sent or saved.'),
      out,
      h('div',{class:'row between'},h('span',{class:'label'},'Words'),nlab),rng,
      h('div',{class:'pl-seg'},[[' ','space'],['-','dash'],['.','dot']].map(function(x){return h('button',{class:'chip'+(S.sepc===x[0]?' on':''),onclick:function(){S.sepc=x[0];save();if(M.phrase)M.phrase=M.phrase.split(/[ .\-]/).join(x[0]);render()}},'Separator: '+x[1])})),
      h('div',{class:'row'},h('button',{class:'btn primary',onclick:gen},M.phrase?'Generate another':'Generate'),
        h('button',{class:'btn ghost',onclick:function(){if(!M.phrase)gen();M.pw=M.phrase;M.show=true;S.tab='analyse';save();render()}},'Test it in Analyse')),
      info,
      h('div',{class:'callout note',style:{margin:'12px 0 0'}},'Choose words that are unusual and have nothing to do with you. A random generator is better than picking words yourself: people choose predictable words.'));
    inf();
    /* saying converter */
    var sIn=h('textarea',{class:'textarea',style:{minHeight:'80px'},autocomplete:'off',spellcheck:'false','aria-label':'Your made-up saying',placeholder:'e.g. My 2 cats ate 3 fish at Aunt Joan\'s house on the 4th of July!'});sIn.value=M.saying;
    var sOut=h('div');
    function conv(t){var o='';t.split(/\s+/).forEach(function(w){if(!w)return;var m=/^([^A-Za-z0-9]*)([A-Za-z]+|[0-9]+)?(.*)$/.exec(w);
      if(!m)return;o+=m[1];if(m[2])o+=/^[0-9]/.test(m[2])?m[2]:m[2][0];o+=(m[3]||'').replace(/[A-Za-z0-9']/g,'')});return o}
    function sUpd(){M.saying=sIn.value;sOut.innerHTML='';if(!M.saying.trim())return;var p=conv(M.saying),r=analyse(p),c=classes(p);
      sOut.appendChild(h('div',{class:'pl-phrase'},p||'\u2014'));
      var tips=[];if(p.length<14)tips.push('Make the saying longer - aim for 14 characters or more.');if(!c.u)tips.push('Capitalise some words in the saying.');
      if(!c.d)tips.push('Include a number in the saying.');if(!c.s)tips.push('Add punctuation or a symbol such as & or !');
      sOut.appendChild(h('div',{class:'pl-sp'},h('span',null,p.length+' characters, '+c.n+'/4 character types'),h('b',null,fmtTime(r.guesses/SP_RIG))));
      sOut.appendChild(h('p',{class:'pl-note'},tips.length?tips.join(' '):'Good: long, with upper and lower case, numbers and symbols. Avoid famous quotations and lyrics - the crooks have those too.'));
      sOut.appendChild(h('button',{class:'btn ghost sm',onclick:function(){M.pw=p;M.show=true;S.tab='analyse';save();render()}},'Test it in Analyse'));}
    sIn.addEventListener('input',sUpd);sUpd();
    var sayCard=h('div',{class:'card'},h('span',{class:'label'},'Method 2 \u2022 Make up a little saying'),h('h3',{style:{margin:'2px 0 6px'}},'Phrase to password'),
      h('p',{style:{margin:'0 0 8px',fontSize:'.93rem'}},'Make up a memorable sentence (not a quotation, song lyric or anything about you). The first letter of each word, plus its numbers and punctuation, becomes the password.'),
      sIn,sOut);
    var pmCard=h('div',{class:'card flat'},h('span',{class:'label'},'Method 3 \u2022 Let a password manager do it'),
      h('p',{style:{margin:'4px 0 0',fontSize:'.93rem'}},'Computers can remember arbitrarily long nonsense such as MHpKQCvpYoouTAaPiiWuFKjpNe7qnsbwkrvq3s3cX, so a password manager can create a different random password for every site. You then only memorise one strong master password - use Method 1 for that. Managers also help against phishing: they will not fill in your password on the wrong page.'));
    root.appendChild(h('div',{class:'pl-wrap'},genCard,h('div',null,sayCard,pmCard)));
  }

  /* ===== 4 Decide ===== */
  function decideTab(){
    var right=0,n=0;SC.forEach(function(s){var a=S.sc[s.id];if(a!=null){n++;if(correct(s,a))right++}});
    if(S.si==null||S.si<0||S.si>SC.length)S.si=0;
    var dots=h('div',{class:'row',style:{gap:'4px',marginTop:'10px'}},SC.map(function(s,i){var a=S.sc[s.id];
      return h('button',{'aria-label':'Scenario '+(i+1),onclick:function(){S.si=i;save();render()},style:{width:'24px',height:'24px',borderRadius:'50%',padding:0,cursor:'pointer',border:i===S.si?'2px solid var(--ink)':'1.5px solid var(--line)',
        background:a==null?'var(--surface)':correct(s,a)?'var(--green)':'var(--red)'}})}));
    root.appendChild(h('div',{class:'card flat'},h('div',{class:'row between'},h('div',null,h('span',{class:'label'},'Password managers and two-factor authentication'),h('h3',{style:{margin:'2px 0 0'}},'What would you do?')),
      h('span',{class:'chip',style:{cursor:'default'}},right+' / '+n+' right')),h('p',{style:{margin:'8px 0 0',fontSize:'.93rem'}},SC.length+' everyday situations. Choose, then read why.'),dots));
    if(S.si<SC.length){
      var s=SC[S.si],a=S.sc[s.id],done=a!=null,sel=M['sel'+s.id]||(s.multi?[]:null);
      var opts=h('div',{class:'pl-opts'},s.o.map(function(o,i){var cls='';
        if(done){var isA=s.multi?s.a.indexOf(i)>=0:s.a===i,picked=s.multi?a.indexOf(i)>=0:a===i;if(isA)cls='right';else if(picked)cls='wrong'}
        else if(s.multi?sel.indexOf(i)>=0:false)cls='sel';
        return h('button',{class:cls,disabled:done,'aria-pressed':s.multi?(sel.indexOf(i)>=0?'true':'false'):null,onclick:function(){
          if(s.multi){var k=sel.indexOf(i);if(k>=0)sel.splice(k,1);else sel.push(i);M['sel'+s.id]=sel;render()}
          else{S.sc[s.id]=i;fin();save();render()}}},(s.multi?(done?'':(sel.indexOf(i)>=0?'\u2611 ':'\u2610 ')):'')+o)}));
      var ok=done&&correct(s,a);
      var card=h('div',{class:'pl-sc'+(done?(ok?' ok':' bad'):'')},h('div',{class:'row between'},h('span',{class:'label'},'Scenario '+(S.si+1)+' of '+SC.length+' \u2022 '+s.topic),done?h('span',{class:'pl-pill '+(ok?'g':'r')},ok?'Good call':'Not quite'):null),
        h('p',{style:{margin:'8px 0 0',fontSize:'1.03rem'}},s.q),opts,
        s.multi&&!done?h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn primary',disabled:!sel.length,onclick:function(){S.sc[s.id]=sel.slice().sort();fin();save();render()}},'Check')):null,
        done?h('div',{class:'callout '+(ok?'tip':''),style:{margin:'12px 0 0'}},s.w):null);
      root.appendChild(card);
      var nextI=-1;for(var j=1;j<=SC.length;j++){var q=(S.si+j)%SC.length;if(S.sc[SC[q].id]==null){nextI=q;break}}
      root.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},S.si>0?h('button',{class:'btn ghost',onclick:function(){S.si--;save();render()}},'Back'):null,
        done?h('button',{class:'btn primary',onclick:function(){S.si=nextI>=0?nextI:SC.length;save();render()}},nextI>=0?'Next scenario':'See result'):null));
    } else {
      root.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#8f8f8f'}},'Result'),h('div',{style:{fontFamily:'var(--mono)',fontSize:'2.2rem'}},right+' / '+SC.length),
        h('p',{style:{margin:'8px 0 0'}},n<SC.length?'Some scenarios are still open - tap a white dot above.':right>=10?'Excellent. You know when to trust a password manager, the browser and two-factor authentication - and where each one can fail.':right>=7?'Good. Review the ones you missed below.':'Revisit sections 2.3 to 3.1 of this week, then try again.'),
        h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn',onclick:function(){S.sc={};S.si=0;save();render()}},'Try again'))));
      var wrong=SC.filter(function(s){return S.sc[s.id]!=null&&!correct(s,S.sc[s.id])});
      if(wrong.length){var rc=h('div',{class:'card'},h('span',{class:'label'},'Review'));wrong.forEach(function(s){rc.appendChild(h('div',{style:{borderTop:'1px dotted var(--line)',padding:'10px 0'}},h('div',{class:'tiny muted'},s.q),h('div',{style:{marginTop:'4px',fontSize:'.93rem'}},h('b',null,(s.multi?s.a.map(function(i){return s.o[i]}).join('; '):s.o[s.a])+'. '),s.w)))});root.appendChild(rc)}
    }
  }
  function correct(s,a){if(s.multi){if(!Array.isArray(a))return false;return a.length===s.a.length&&s.a.every(function(x){return a.indexOf(x)>=0})}return a===s.a}
  function fin(){if(S.done)return;if(Object.keys(S.sc).length===SC.length){S.done=true;var r=SC.filter(function(s){return correct(s,S.sc[s.id])}).length;try{ctx.complete(r/SC.length)}catch(e){}}}

  function fit(){if(!root.isConnected){window.removeEventListener('resize',fit);return}root.classList.toggle('pl-w',el.clientWidth>=820)}
  window.addEventListener('resize',fit);
  function render(){root.innerHTML='';fit();root.appendChild(header());
    if(S.tab==='attack')attackTab();else if(S.tab==='phrase')phraseTab();else if(S.tab==='decide')decideTab();else analyseTab()}
  render();
}});
})();

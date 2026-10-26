/* Business Model Canvas filler (Entrepreneurship Sessions 3, 5, 6).
   Tool id: bmc. Plain ES2017, no libraries. State is saved through ctx.save with keys:
   'index' -> {list:[{id,name}],cur:id}   and   'canvas-<id>' -> {id,name,ex,blocks:{key:[{id,t,s:[segmentNoteIds]}]}} */
(function(){
var h=H.h;

/* ---------- course content: nine building blocks (wording from Session 3 Activity 1 + Sessions 2,4,5,6) ---------- */
var BLOCKS=[
 {k:'cs',  title:'Customer segments', short:'Customers',
  def:'The groups of people with a distinct need or use for your products or services.',
  qs:['Who are you creating value for - who are your customers, and are they really customers (who pays) or users or influencers?',
      'A customer segment is only valid if you know who those customers are, what their needs are, that there are enough of them to make it worthwhile and that you have the means to reach them. Does each of yours pass all four?',
      'What makes one group distinct from another - different needs, different behaviour, different ways of being reached?',
      'Which segment is the most likely first customer? (You will have more success focusing on the most likely segment than on "everyone".)']},
 {k:'vp',  title:'Value propositions', short:'Value propositions',
  def:'The bundles of products and services that are designed to appeal to and provide value to different customer segments.',
  qs:['What problem(s) or need(s) are you solving or meeting for each segment?',
      'How will your idea alleviate the problem or provide a gain for customers?',
      'For each feature, what is the customer benefit? Complete the sentence "which means that...".',
      'Why choose you rather than another supplier: a genuinely unique feature, a brand, or less "friction" in dealing with you?',
      'Which dimensions of value do you offer - strategic, economic, operational (easy to deal with), behavioural (how people treat customers)?']},
 {k:'ch',  title:'Channels', short:'Channels',
  def:'The touchpoints - places or means of distributing your product or service.',
  qs:['How will customers find out about you, buy from you and receive what they bought?',
      'Which sales channels will you use: website, social media, face to face (pop-up shops, festivals...)?',
      'Where does each segment already spend time? Can you reach them there?',
      'Is every touchpoint convenient and easy? (Time-poor customers value operational ease.)']},
 {k:'cr',  title:'Customer relationships', short:'Relationships',
  def:'Defines how you will relate to your customers (e.g. loyalty schemes or discounts, rewards, recognition of greatest need etc.).',
  qs:['What kind of relationship does each segment expect: transactional, loyalty and engagement, or advocacy?',
      'How will you win, keep and grow customers? Delighted customers come back and tell other people.',
      'What follow-up value can you build in from the start: refills, upgrades, support, rewards?',
      'What will the relationship cost you, and is it worth it?']},
 {k:'rs',  title:'Revenue streams', short:'Revenue',
  def:'How and through which activities you will capture value in your business.',
  qs:['What will each customer segment really pay for, how much and how (one-off, repeat purchase, subscription, commission)?',
      'Does your price exceed the cost of providing the product or service (economic value)?',
      'Are there revenue streams over and above the main sale, e.g. refills, merchandise, related products?',
      'Which segments bring the most revenue - and which make the most demands?']},
 {k:'kr',  title:'Key resources', short:'Resources',
  def:'What assets (e.g. people, equipment, premises) are absolutely necessary to deliver value.',
  qs:['Which people, equipment, premises, know-how, brand or intellectual property are absolutely necessary to deliver your value proposition?',
      'Is finance one of your key resources? How much do you need and when?',
      'Which do you own, which can you borrow, rent or share?',
      'What gaps do you have, and who could fill them?']},
 {k:'ka',  title:'Key activities', short:'Activities',
  def:'What things you absolutely need to do very well.',
  qs:['Think back to the three essential activities: running the business (invoices, tax, regulations), getting the business (finding, attracting and keeping customers) and delivering the business (creating the product or service). What must you do very well in each?',
      'Which activities are essential to deliver your value proposition, and which are just nice to have?',
      'Which can you do yourself, and which will you need help with?']},
 {k:'kp',  title:'Key partners', short:'Partners',
  def:'People or organisations with expertise or the ability to do essential things you rely upon but cannot do for yourself, cost effectively.',
  qs:['Who are your key suppliers, advisers and supporters?',
      'Which key activities or resources would be too costly or slow to do yourself?',
      'What do your partners get in return, and what happens if one lets you down?',
      'Where could a partnership give you a competitive advantage or access to new customers?']},
 {k:'cost',title:'Cost structure', short:'Costs',
  def:'Where costs arise in the business.',
  qs:['What are the most important costs inherent in your model?',
      'Which key resources and key activities are the most expensive?',
      'Which costs are one-off start-up costs and which keep recurring? Which are fixed and which vary with sales?',
      'Do you know roughly where your break-even point is?']}
];
var BK={}; BLOCKS.forEach(function(b){BK[b.k]=b});
var TAGGED={vp:1,rs:1,ch:1,cr:1};          // blocks whose notes can be linked to customer segments
var ORDER_NARROW=['cs','vp','ch','cr','rs','kr','ka','kp','cost'];

/* ---------- worked examples (simplified public-knowledge illustrations) ---------- */
var EXAMPLES=[
 {name:'Airbnb', blocks:{
  cs:['Travellers wanting affordable, local places to stay','Hosts with a spare room or home to rent out'],
  vp:[['Unique, often cheaper stays in real neighbourhoods, which means a more local experience than a hotel',[0]],
      ['A wide choice of places, from a single room to a whole home, bookable in minutes on a phone',[0]],
      ['Turn a spare room or home into income without having to find guests yourself',[1]],
      ['Payment handling and host protection, which means less risk when letting strangers stay',[1]]],
  ch:[['Website and mobile app - search, book and pay',[0,1]],['Online search ads and word of mouth from reviews',[0]],['Email and in-app messaging with hosts',[0,1]]],
  cr:[['Reviews and ratings for guests and hosts build trust',[0,1]],['24/7 customer support when a stay goes wrong',[0]],['Host community, tips and tools to run a listing well',[1]]],
  rs:[['Percentage service fee added to each guest booking',[0]],['Percentage commission taken from each host payout',[1]]],
  kr:['Online booking platform and app','Brand and trust built on reviews','Host property listings (the supply)','Engineers and data for search and pricing'],
  ka:['Platform development and maintenance','Marketing to attract guests and hosts','Trust and safety, fraud checks and payments','Customer support'],
  kp:['Hosts who supply the places','Payment processors and banks','Insurance providers'],
  cost:['Platform engineering and cloud hosting','Marketing and acquiring guests and hosts','Customer support and trust and safety teams','Payment processing fees','Host listing quality checks and insurance cover']}},
 {name:'Spotify', blocks:{
  cs:['Free listeners who accept ads','Premium subscribers who want ad-free music','Advertisers who want to reach listeners','Artists and labels who want an audience'],
  vp:[['Instant access to a huge music library for free, which means no need to buy each song',[0]],
      ['Ad-free listening, offline downloads and better sound quality, which means music anywhere without interruptions',[1]],
      ['Targeted audio and display advertising to engaged listeners',[2]],
      ['A way to be discovered by listeners and get paid per stream',[3]]],
  ch:[['Mobile, desktop and smart-speaker apps',[0,1]],['Self-service ad platform and sales team',[2]],['Artist dashboard and label contacts',[3]],['Social media, playlists and word of mouth',[0,1]]],
  cr:[['Personalised playlists and recommendations keep listeners engaged',[0,1]],['Upgrade offers that move free listeners to Premium',[0]],['Support for advertiser campaigns',[2]],['Analytics for artists on their listeners',[3]]],
  rs:[['Monthly Premium subscription fee',[1]],['Advertising fees paid by advertisers',[2]],['Free tier feeds the audience that advertisers pay to reach',[0]],['Artists earn from streams but do not pay Spotify (no revenue stream from this segment)',[3]]],
  kr:['Music licences from labels and publishers','Streaming technology and apps','Recommendation algorithms and listener data','Brand and user base'],
  ka:['Platform and app development','Negotiating and managing music licences','Building personalised recommendations','Selling advertising and growing subscribers'],
  kp:['Record labels, publishers and artists','Cloud infrastructure providers','Telecom and device partners'],
  cost:['Royalty payments for music licences','Technology and cloud infrastructure','Platform development and data teams','Marketing and sales for advertising and subscribers']}}
];

/* ---------- helpers ---------- */
var STOP={with:1,that:1,this:1,from:1,have:1,your:1,will:1,which:1,their:1,them:1,into:1,more:1,than:1,each:1,what:1,when:1,where:1,they:1,also:1,been:1,does:1,some:1};
function stem(w){return w.replace(/(ing|ed|es|s|ly)$/,'')}
function toks(s){return (String(s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/)).filter(function(w){return w.length>3&&!STOP[w]}).map(stem)}
function overlap(a,b){var set={};toks(b).forEach(function(w){set[w]=1});var n=0;toks(a).forEach(function(w){if(set[w])n++});return n}
function uid(){return Math.random().toString(36).slice(2,9)}
function words(s){return String(s||'').trim().split(/\s+/).filter(Boolean).length}
function clip(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s}
function emptyBlocks(){var b={};BLOCKS.forEach(function(x){b[x.k]=[]});return b}
function listJoin(a){return a.map(function(x){return '"'+clip(x,40)+'"'}).join(', ')}

/* ---------- analysis (rules) ---------- */
function validSegs(cv,note){var ids=(cv.blocks.cs||[]).map(function(n){return n.id});return (note.s||[]).filter(function(i){return ids.indexOf(i)>=0})}
function cover(cv,key,seg){
  var notes=cv.blocks[key]||[],segs=cv.blocks.cs,tagged=0,untagged=0;
  notes.forEach(function(n){var v=validSegs(cv,n);if(v.indexOf(seg.id)>=0)tagged++;else if(!v.length)untagged++});
  if(tagged)return 'yes';
  if(untagged)return segs.length===1?'yes':'maybe';
  return 'no';
}
function analyse(cv){
  var B=cv.blocks,out=[],segs=B.cs||[];
  var filled=BLOCKS.filter(function(b){return B[b.k].length>0}).length;
  function add(lvl,blocks,msg){out.push({lvl:lvl,blocks:blocks,msg:msg})}
  BLOCKS.forEach(function(b){ if(!B[b.k].length)add('warn',[b.k],b.title+' is still empty.') });
  /* segment coverage rules */
  var cfg=[['vp','a value proposition','Which of your value propositions is aimed at it? Every customer segment needs a reason to choose you.'],
           ['rs','a revenue stream','Who pays you, and how? Revenue streams should map to the segments that generate them.'],
           ['ch','a channel','How will you reach and serve them? A segment is only valid if you can reach it.']];
  if(segs.length){
    cfg.forEach(function(c){
      var no=[],maybe=[];
      segs.forEach(function(s){var r=cover(cv,c[0],s);if(r==='no')no.push(s.t);else if(r==='maybe')maybe.push(s.t)});
      if(B[c[0]].length){
        if(no.length)add('bad',[c[0],'cs'],'No '+c[1].replace('a ','')+' for '+listJoin(no)+'. '+c[2]);
        else if(maybe.length)add('info',[c[0],'cs'],'You have several segments but your '+BK[c[0]].title.toLowerCase()+' are not tagged to them, so I cannot tell if '+listJoin(maybe)+' is covered. Open the block and tick the segments each note serves.');
        else add('ok',[c[0],'cs'],'Every customer segment has '+c[1]+'.');
      }
    });
  }
  /* VP quality */
  var shortVp=B.vp.filter(function(n){return words(n.t)<4});
  if(shortVp.length)add('warn',['vp'],listJoin(shortVp.map(function(n){return n.t}))+' reads like a label, not a proposition. Say what problem it solves or what benefit it gives ("...which means that...").');
  /* revenue price hint */
  if(B.rs.length&&!B.rs.some(function(n){return /[\d£$€%]|fee|price|commission|subscription|per |charge|pay|sale|sell/i.test(n.t)}))
    add('info',['rs'],'None of your revenue streams says what customers pay or how. Add a price, fee or payment model - value is measured by how much people are willing to pay.');
  /* key activities support value proposition */
  if(B.vp.length&&(B.ka.length||B.kr.length)){
    var vpText=B.vp.map(function(n){return n.t}).join(' ');
    var kaText=B.ka.concat(B.kr).map(function(n){return n.t}).join(' ');
    if(overlap(vpText,kaText)===0)add('warn',['ka','kr','vp'],'Nothing in your key activities or resources seems to connect with your value propositions. What must you do very well (and own) to deliver what you promise?');
    else add('ok',['ka','vp'],'Your key activities/resources echo your value propositions.');
  }
  if(B.vp.length&&!B.ka.length&&B.kr.length)add('warn',['ka','vp'],'You have resources but no key activities. What will you actually do to deliver the value proposition (run, get and deliver the business)?');
  /* cost structure covers resources/activities */
  if(B.kr.length||B.ka.length){
    if(!B.cost.length)add('bad',['cost','kr','ka'],'You list key resources/activities but no costs. Each one costs something - where do the costs arise?');
    else{
      var costText=B.cost.map(function(n){return n.t}).join(' ');
      var miss=B.kr.concat(B.ka).filter(function(n){return overlap(n.t,costText)===0});
      if(miss.length)add('warn',['cost','kr','ka'],'No cost seems to cover '+listJoin(miss.slice(0,3).map(function(n){return n.t}))+(miss.length>3?' (and '+(miss.length-3)+' more)':'')+'. Does it cost nothing, or is a cost missing?');
      else add('ok',['cost','kr','ka'],'Your cost structure mentions every key resource and activity.');
    }
  }
  /* partners */
  if(B.ka.length+B.kr.length>=5&&!B.kp.length)add('info',['kp'],'You depend on many resources/activities. Which could a partner do better or cheaper than you?');
  /* numbers */
  if(B.rs.length&&B.cost.length&&!(B.rs.concat(B.cost)).some(function(n){return /[\d£$€%]/.test(n.t)}))
    add('info',['rs','cost'],'Add rough numbers to revenue and costs when you can. Does the price exceed the cost of providing it? (You will look at break-even in Session 7.)');
  var bad=out.filter(function(x){return x.lvl==='bad'}).length,warn=out.filter(function(x){return x.lvl==='warn'}).length;
  return {items:out,filled:filled,bad:bad,warn:warn};
}

/* ---------- text export / AI prompt ---------- */
var SUMMARY_ORDER=['cs','vp','ch','cr','rs','kr','ka','kp','cost'];
function segNames(cv,n){return validSegs(cv,n).map(function(i){var s=cv.blocks.cs.filter(function(x){return x.id===i})[0];return s?clip(s.t,40):''}).filter(Boolean)}
function summaryText(cv,res){
  var L=['BUSINESS MODEL CANVAS - '+cv.name,'Blocks filled: '+res.filled+'/9',''];
  SUMMARY_ORDER.forEach(function(k){
    L.push(BK[k].title.toUpperCase());
    if(!cv.blocks[k].length)L.push('  (empty)');
    cv.blocks[k].forEach(function(n){var t=TAGGED[k]?segNames(cv,n):[];L.push('  - '+n.t+(t.length?'  [for: '+t.join('; ')+']':''))});
    L.push('');
  });
  L.push('CHECKS');
  var any=res.items.filter(function(x){return x.lvl!=='ok'});
  if(!any.length)L.push('  No issues found by the rule checks.');
  any.forEach(function(x){L.push('  '+(x.lvl==='bad'?'[!] ':x.lvl==='warn'?'[?] ':'[i] ')+x.msg)});
  return L.join('\n');
}
function compact(cv){
  return SUMMARY_ORDER.map(function(k){
    var n=cv.blocks[k].slice(0,6).map(function(x){return clip(x.t,70)}).join('; ');
    return BK[k].title+': '+(n||'(empty)');
  }).join('\n');
}
function copyText(text){
  function fallback(){
    var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');
    ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return ok;
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text).then(function(){return true},function(){return fallback()});
  }
  return Promise.resolve(fallback());
}

/* ---------- styles ---------- */
function injectCss(){
  if(document.getElementById('bmc-style'))return;
  var s=document.createElement('style');s.id='bmc-style';
  s.textContent=[
  '.bmc-top{display:flex;gap:16px;align-items:center;flex-wrap:wrap}',
  '.bmc-ring{flex:none;width:72px;height:72px;position:relative}',
  '.bmc-ring svg{width:72px;height:72px;transform:rotate(-90deg)}',
  '.bmc-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.95rem;font-weight:500}',
  '.bmc-canv{display:grid;gap:8px}',
  '.bmc-canv.wide{grid-template-columns:repeat(10,minmax(0,1fr));grid-auto-rows:minmax(92px,auto)}',
  '.bmc-canv.wide .bmc-kp{grid-column:1/3;grid-row:1/3}.bmc-canv.wide .bmc-ka{grid-column:3/5;grid-row:1/2}',
  '.bmc-canv.wide .bmc-kr{grid-column:3/5;grid-row:2/3}.bmc-canv.wide .bmc-vp{grid-column:5/7;grid-row:1/3}',
  '.bmc-canv.wide .bmc-cr{grid-column:7/9;grid-row:1/2}.bmc-canv.wide .bmc-ch{grid-column:7/9;grid-row:2/3}',
  '.bmc-canv.wide .bmc-cs{grid-column:9/11;grid-row:1/3}.bmc-canv.wide .bmc-cost{grid-column:1/6;grid-row:3/4}',
  '.bmc-canv.wide .bmc-rs{grid-column:6/11;grid-row:3/4}',
  '.bmc-cell{position:relative;text-align:left;background:var(--surface2);border:1.5px dashed var(--dot);border-radius:var(--r-md);padding:10px 12px;cursor:pointer;display:flex;flex-direction:column;gap:6px;min-height:64px;min-width:0;overflow:hidden}',
  '.bmc-cell.has{border-style:solid;border-color:var(--line)}',
  '.bmc-cell:hover,.bmc-cell:focus-visible{border-color:var(--ink);outline:none}',
  '.bmc-cell .hd{display:flex;justify-content:space-between;align-items:center;gap:6px}',
  '.bmc-cell .nt{font-size:.8rem;line-height:1.3;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding-left:8px;border-left:2px solid var(--ink3)}',
  '.bmc-cell .more{font-size:.72rem;color:var(--ink2);font-family:var(--mono)}',
  '.bmc-cell .add{font-size:.82rem;color:var(--ink3)}',
  '.bmc-cnt{font-family:var(--mono);font-size:.72rem;background:var(--ink);color:var(--bg);border-radius:99px;padding:1px 8px;min-width:22px;text-align:center}',
  '.bmc-flag{position:absolute;top:8px;right:8px;width:9px;height:9px;border-radius:50%;background:var(--red)}',
  '.bmc-flag.warn{background:var(--amber)}',
  '.bmc-cell .hd .label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:12px}',
  '.bmc-chk{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line);font-size:.92rem}',
  '.bmc-chk:last-child{border-bottom:0}',
  '.bmc-dot{flex:none;width:10px;height:10px;border-radius:50%;margin-top:7px;background:var(--ink3)}',
  '.bmc-dot.bad{background:var(--red)}.bmc-dot.warn{background:var(--amber)}.bmc-dot.ok{background:var(--green)}',
  '.bmc-chk .go{margin-left:auto;flex:none}',
  '.bmc-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center}',
  '.bmc-sheet{background:var(--bg);color:var(--ink);width:100%;max-width:720px;max-height:92vh;overflow:auto;border-radius:var(--r-lg) var(--r-lg) 0 0;padding:18px 16px 28px}',
  '.bmc-sheet .card{margin-bottom:12px}',
  '.bmc-note{background:var(--surface);border-radius:var(--r-md);padding:10px 12px;margin-bottom:8px;border-left:4px solid var(--ink)}',
  '.bmc-note .tx{white-space:pre-wrap;word-break:break-word;margin-bottom:8px}',
  '.bmc-note .tools{display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
  '.bmc-note .tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}',
  '.bmc-note .chip{font-size:.8rem;padding:3px 10px;min-height:30px}',
  '.bmc-sheet details>summary{cursor:pointer;min-height:44px;display:flex;align-items:center}',
  '.bmc-sheet ul.qs{margin:4px 0 0;padding-left:20px}.bmc-sheet ul.qs li{margin-bottom:8px;font-size:.93rem}',
  '.bmc-seg{display:flex;gap:8px;flex-wrap:wrap}',
  '@media(max-width:560px){.bmc-sheet{max-height:94vh}}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ---------- mount ---------- */
Tools.register('bmc',{title:'Business Model Canvas',desc:'Fill the nine blocks, get consistency checks, compare with a worked example.',
mount:function(el,ctx){
  injectCss();
  var idx=ctx.load('index')||{list:[],cur:null};
  var cv=null, sheet=null, sheetKey=null, completed=false;
  var ui={mode:null,confirmDel:false,confirmClear:false,aiCanvas:'',aiBusy:false,showSummary:false,copied:'',wide:true,exSel:0};

  function saveIdx(){ctx.save(idx,'index')}
  function saveCv(){ctx.save(cv,'canvas-'+cv.id)}
  function newCanvas(name,ex){
    var c={id:uid(),name:name||'My canvas',ex:!!ex,blocks:emptyBlocks()};
    return c;
  }
  function loadCanvas(id){var c=ctx.load('canvas-'+id);if(c){BLOCKS.forEach(function(b){if(!c.blocks)c.blocks={};if(!c.blocks[b.k])c.blocks[b.k]=[]});}return c}
  function switchTo(id){
    var c=loadCanvas(id);
    if(!c){idx.list=idx.list.filter(function(x){return x.id!==id});c=null}
    cv=c;idx.cur=c?id:null;
    if(!cv){ensureOne();return}
    saveIdx();ui.aiCanvas='';ui.confirmDel=ui.confirmClear=false;ui.copied='';closeSheet();render();
  }
  function ensureOne(){
    if(!idx.list.length){var c=newCanvas('My canvas');cv=c;idx.list.push({id:c.id,name:c.name});idx.cur=c.id;saveCv();saveIdx();render()}
    else switchTo(idx.list[0].id);
  }
  function createCanvas(name,fromExample){
    var c=newCanvas(name,!!fromExample);
    if(fromExample){
      var ids=[];
      fromExample.blocks.cs.forEach(function(t){var n={id:uid(),t:t,s:[]};ids.push(n.id);c.blocks.cs.push(n)});
      BLOCKS.forEach(function(b){
        if(b.k==='cs')return;
        fromExample.blocks[b.k].forEach(function(x){
          if(typeof x==='string')c.blocks[b.k].push({id:uid(),t:x,s:[]});
          else c.blocks[b.k].push({id:uid(),t:x[0],s:(x[1]||[]).map(function(i){return ids[i]})});
        });
      });
    }
    cv=c;idx.list.push({id:c.id,name:c.name});idx.cur=c.id;saveCv();saveIdx();
    ui.aiCanvas='';ui.confirmDel=ui.confirmClear=false;ui.copied='';closeSheet();render();
  }
  function changed(){
    saveCv(); render(); if(sheet)refreshSheet();
    var r=analyse(cv);
    if(!completed&&r.filled===9){completed=true;ctx.complete(r.bad?0.8:1)}
  }

  /* ----- main render ----- */
  function ring(frac,txt){
    var R=30,C=2*Math.PI*R;
    var ns='http://www.w3.org/2000/svg';
    var svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 72 72');svg.setAttribute('aria-hidden','true');
    var a=document.createElementNS(ns,'circle');a.setAttribute('cx',36);a.setAttribute('cy',36);a.setAttribute('r',R);a.setAttribute('fill','none');a.setAttribute('stroke','var(--line)');a.setAttribute('stroke-width',6);
    var b=document.createElementNS(ns,'circle');b.setAttribute('cx',36);b.setAttribute('cy',36);b.setAttribute('r',R);b.setAttribute('fill','none');b.setAttribute('stroke',frac>=1?'var(--green)':'var(--ink)');b.setAttribute('stroke-width',6);b.setAttribute('stroke-linecap','round');
    b.setAttribute('stroke-dasharray',(C*frac)+' '+C);
    svg.appendChild(a);svg.appendChild(b);
    return h('div',{class:'bmc-ring',role:'img','aria-label':txt+' blocks filled'},svg,h('b',null,txt));
  }
  function flagFor(res,k){
    var f=null;res.items.forEach(function(x){if(x.blocks.indexOf(k)>=0){if(x.lvl==='bad')f='bad';else if(x.lvl==='warn'&&f!=='bad')f='warn'}});return f;
  }
  function cell(b,res){
    var notes=cv.blocks[b.k],flag=flagFor(res,b.k);
    var kids=[h('div',{class:'hd'},h('span',{class:'label'},b.short),h('span',{class:'bmc-cnt'},String(notes.length)))];
    var max=ui.wide?(b.k==='cost'||b.k==='rs'?3:3):3;
    notes.slice(0,max).forEach(function(n){kids.push(h('div',{class:'nt'},n.t))});
    if(notes.length>max)kids.push(h('div',{class:'more'},'+'+(notes.length-max)+' more'));
    if(!notes.length)kids.push(h('div',{class:'add'},'Tap to add'));
    if(flag)kids.push(h('span',{class:'bmc-flag '+(flag==='warn'?'warn':''),title:'Needs attention'}));
    return h('button',{type:'button',class:'bmc-cell bmc-'+b.k+(notes.length?' has':''),'data-block':b.k,
      'aria-label':b.title+', '+notes.length+' notes'+(flag?', needs attention':''),onclick:function(){openSheet(b.k)}},kids);
  }
  function render(){
    if(!cv)return;
    var res=analyse(cv), ai=ctx.ai&&ctx.ai.available&&ctx.ai.available();
    ui.wide=el.clientWidth>=640||el.clientWidth===0;
    el.innerHTML='';
    var root=h('div',{class:'tool','data-bmc':'1'});
    /* header */
    var sel=h('select',{class:'input','aria-label':'Choose canvas',style:{maxWidth:'320px',minHeight:'44px'},onchange:function(e){switchTo(e.target.value)}},
      idx.list.map(function(c){return h('option',{value:c.id,selected:c.id===idx.cur},c.name)}));
    sel.value=idx.cur;
    var top=h('div',{class:'bmc-top'},ring(res.filled/9,res.filled+'/9'),
      h('div',{style:{flex:'1',minWidth:'180px'}},h('div',{class:'label'},'Business model canvas'),
        h('h3',{style:{margin:'2px 0'}},cv.name),
        h('div',{class:'muted tiny'},res.filled+' of 9 blocks filled. '+(res.bad?res.bad+' gap'+(res.bad>1?'s':'')+' to fix. ':'')+(res.warn?res.warn+' to check.':''))));
    root.appendChild(top);
    /* canvas manager */
    var mgr=h('div',{class:'row',style:{marginTop:'14px'}});
    if(ui.mode){
      var inp=h('input',{class:'input',id:'bmc-name',maxlength:'40',placeholder:'Canvas name',value:ui.mode==='rename'?cv.name:'',style:{flex:'1',minWidth:'160px'},
        onkeydown:function(e){if(e.key==='Enter')commitName(inp.value)}});
      mgr.appendChild(inp);
      mgr.appendChild(h('button',{class:'btn primary',type:'button',onclick:function(){commitName(inp.value)}},'Save'));
      mgr.appendChild(h('button',{class:'btn ghost',type:'button',onclick:function(){ui.mode=null;render()}},'Cancel'));
      setTimeout(function(){inp.focus()},0);
    }else{
      mgr.appendChild(sel);
      mgr.appendChild(h('button',{class:'btn',type:'button',onclick:function(){ui.mode='new';render()}},'+ New'));
      mgr.appendChild(h('button',{class:'btn',type:'button',onclick:function(){ui.mode='rename';render()}},'Rename'));
      mgr.appendChild(h('button',{class:'btn'+(ui.confirmDel?' red':' ghost'),type:'button',onclick:function(){
        if(!ui.confirmDel){ui.confirmDel=true;render();return}
        deleteCanvas()}},ui.confirmDel?'Tap again to delete':'Delete'));
    }
    root.appendChild(mgr);
    /* canvas */
    var order=ui.wide?['kp','ka','kr','vp','cr','ch','cs','cost','rs']:ORDER_NARROW;
    var g=h('div',{class:'bmc-canv'+(ui.wide?' wide':''),style:{marginTop:'14px'}});
    order.forEach(function(k){g.appendChild(cell(BK[k],res))});
    root.appendChild(g);
    root.appendChild(h('div',{class:'muted tiny',style:{marginTop:'8px'}},'Tap a block to see the course questions and add sticky notes. A red/amber dot means a check found something.'));
    el.appendChild(root);

    /* checks */
    var chk=h('div',{class:'card',style:{marginTop:'14px'}});
    chk.appendChild(h('div',{class:'row between'},h('div',null,h('div',{class:'label'},'Completeness and consistency'),h('h3',{style:{margin:'2px 0 0'}},'Health check')),
      h('span',{class:'chip',style:{cursor:'default'}},res.bad+' gaps / '+res.warn+' to check')));
    var items=res.items.slice().sort(function(a,b){var r={bad:0,warn:1,info:2,ok:3};return r[a.lvl]-r[b.lvl]});
    var body=h('div',{style:{marginTop:'8px'}});
    if(!items.length)body.appendChild(h('div',{class:'muted'},'Start adding notes to your blocks and the checks will appear here.'));
    items.forEach(function(x){
      body.appendChild(h('div',{class:'bmc-chk','data-lvl':x.lvl},h('span',{class:'bmc-dot '+x.lvl}),h('div',null,x.msg),
        h('button',{class:'btn sm ghost go',type:'button','aria-label':'Open '+BK[x.blocks[0]].title,onclick:function(){openSheet(x.blocks[0])}},'Open')));
    });
    chk.appendChild(body);
    el.appendChild(chk);

    /* actions */
    var act=h('div',{class:'card'});
    act.appendChild(h('div',{class:'label'},'Actions'));
    var row=h('div',{class:'row',style:{marginTop:'8px'}});
    if(ai)row.appendChild(h('button',{class:'btn primary',type:'button',id:'bmc-ai-all',disabled:ui.aiBusy,onclick:critiqueAll},ui.aiBusy?'Thinking...':'Ask AI to critique this canvas'));
    row.appendChild(h('button',{class:'btn'+(ai?'':' primary'),type:'button',id:'bmc-copy',onclick:doCopy},ui.copied||'Copy text summary'));
    row.appendChild(h('button',{class:'btn ghost',type:'button',onclick:function(){ui.showSummary=!ui.showSummary;render()}},ui.showSummary?'Hide summary':'Show summary'));
    row.appendChild(h('button',{class:'btn'+(ui.confirmClear?' red':' ghost'),type:'button',onclick:function(){
      if(!ui.confirmClear){ui.confirmClear=true;render();return}
      BLOCKS.forEach(function(b){cv.blocks[b.k]=[]});ui.confirmClear=false;ui.aiCanvas='';changed();ctx.toast('Canvas cleared')}},ui.confirmClear?'Tap again to clear all':'Clear canvas'));
    act.appendChild(row);
    if(ui.aiCanvas||ui.aiBusy)act.appendChild(h('div',{class:'ai-box',id:'bmc-ai-out',style:{marginTop:'12px'}},h('span',{class:'label'},'AI critique'),h('span',{class:'txt'},ui.aiCanvas||'Thinking...')));
    if(ui.showSummary)act.appendChild(h('textarea',{class:'textarea',id:'bmc-summary',readonly:true,'aria-label':'Text summary',style:{marginTop:'12px',minHeight:'220px',fontFamily:'var(--mono)',fontSize:'.8rem'}},summaryText(cv,res)));
    el.appendChild(act);

    /* examples */
    var ex=h('div',{class:'card flat'});
    ex.appendChild(h('div',{class:'label'},'Learn from an example'));
    ex.appendChild(h('p',{class:'muted',style:{margin:'6px 0 10px'}},'Load a well-known company as a new canvas, then compare how it fills each block. Your own canvases are kept.'));
    var exSel=h('select',{class:'input',id:'bmc-ex','aria-label':'Example company',style:{maxWidth:'240px'},onchange:function(e){ui.exSel=+e.target.value}},EXAMPLES.map(function(x,i){return h('option',{value:i,selected:i===ui.exSel},x.name)}));
    exSel.value=ui.exSel;
    ex.appendChild(h('div',{class:'row'},exSel,h('button',{class:'btn',type:'button',id:'bmc-load-ex',onclick:function(){var e=EXAMPLES[ui.exSel];createCanvas('Example: '+e.name,e)}},'Load example')));
    el.appendChild(ex);
  }
  function commitName(v){
    v=(v||'').trim();if(!v){ctx.toast('Give the canvas a name');return}
    if(ui.mode==='new'){ui.mode=null;createCanvas(v)}
    else{cv.name=v;idx.list.forEach(function(c){if(c.id===cv.id)c.name=v});ui.mode=null;saveIdx();saveCv();render()}
  }
  function deleteCanvas(){
    var id=cv.id;ui.confirmDel=false;
    try{ctx.save(null,'canvas-'+id)}catch(e){}
    idx.list=idx.list.filter(function(c){return c.id!==id});cv=null;idx.cur=null;
    if(!idx.list.length){ensureOne()}else{switchTo(idx.list[0].id)}
    saveIdx();ctx.toast('Canvas deleted');
  }
  function doCopy(){
    var text=summaryText(cv,analyse(cv));
    copyText(text).then(function(ok){
      ui.copied=ok?'Copied!':'Copy failed - use Show summary';
      if(!ok){ui.showSummary=true}
      render();setTimeout(function(){ui.copied='';render()},2200);
    });
  }

  /* ----- AI ----- */
  function stream(system,prompt,outEl,done){
    var acc='';
    outEl.textContent='Thinking...';
    var p;
    try{
      p=ctx.ai.ask({system:system,prompt:prompt,maxTokens:200,temperature:0.4,onToken:function(t){
        if(typeof t!=='string')return;
        acc=(acc&&t.indexOf(acc)===0)?t:acc+t;
        outEl.textContent=acc;}});
    }catch(e){p=Promise.reject(e)}
    p.then(function(final){done(String(final||acc).trim()||acc.trim(),true)},function(){done('',false)});
  }
  var SYS='You are a friendly business coach for a beginner entrepreneurship course. Reply in plain text only, under 100 words. Use exactly this format:\nGood: one strength.\nImprove: one or two weaknesses.\nAsk: one question the learner should research.';
  function critiqueAll(){
    if(ui.aiBusy)return;
    ui.aiBusy=true;ui.aiCanvas='';render();
    var out=el.querySelector('#bmc-ai-out .txt');
    var res=analyse(cv);
    var pr='Critique this whole business model canvas. Look at fit between customers, value, revenue and costs.\n'+compact(cv)+'\n\nCritique:';
    stream(SYS,pr,out,function(txt,ok){
      ui.aiBusy=false;
      ui.aiCanvas=ok&&txt?txt:'The AI could not answer, so here are the rule-based checks:\n'+res.items.filter(function(x){return x.lvl!=='ok'}).slice(0,5).map(function(x){return '- '+x.msg}).join('\n');
      render();
    });
  }

  /* ----- sheet (block editor) ----- */
  var editId=null, newSegs=[], sheetAi='', sheetAiBusy=false, sheetPoll=null;
  function openSheet(k){
    closeSheet();
    sheetKey=k;editId=null;newSegs=[];sheetAi='';sheetAiBusy=false;
    var b=BK[k];
    var ov=h('div',{class:'bmc-ov','data-sheet':k,onclick:function(e){if(e.target===ov)closeSheet()}});
    var p=h('div',{class:'bmc-sheet',role:'dialog','aria-modal':'true','aria-label':b.title});
    ov.appendChild(p);
    sheet={ov:ov,p:p};
    document.body.appendChild(ov);
    document.addEventListener('keydown',onKey);
    sheetPoll=setInterval(function(){if(!el.isConnected)closeSheet()},800);
    buildSheet();
    var ta=p.querySelector('textarea.bmc-add');if(ta&&window.innerWidth>=640)ta.focus();
  }
  function onKey(e){if(e.key==='Escape')closeSheet()}
  function closeSheet(){
    if(sheet){sheet.ov.remove();sheet=null}
    sheetKey=null;document.removeEventListener('keydown',onKey);
    if(sheetPoll){clearInterval(sheetPoll);sheetPoll=null}
  }
  function buildSheet(){
    var b=BK[sheetKey],p=sheet.p,wide=window.innerWidth>=640;
    p.innerHTML='';
    p.appendChild(h('div',{class:'row between',style:{marginBottom:'10px'}},
      h('div',null,h('div',{class:'label'},'Canvas block'),h('h2',{style:{margin:'0'}},b.title)),
      h('button',{class:'btn primary',type:'button',id:'bmc-close',onclick:closeSheet},'Done')));
    p.appendChild(h('div',{class:'callout note'},h('b',null,'In the course: '),b.def));
    var det=h('details',{class:'card flat',open:wide},h('summary',null,h('span',{class:'label'},'Guiding questions from the course')),
      h('ul',{class:'qs'},b.qs.map(function(q){return h('li',null,q)})));
    p.appendChild(det);
    p.appendChild(h('div',{class:'label',style:{margin:'4px 0 8px'}},'Your notes'));
    p.appendChild(h('div',{id:'bmc-notes'}));
    p.appendChild(h('div',{id:'bmc-addbox'}));
    p.appendChild(h('div',{id:'bmc-sheetchecks',class:'card',style:{marginTop:'12px'}}));
    p.appendChild(h('div',{id:'bmc-sheetai'}));
    refreshSheet(true);
  }
  function refreshSheet(full){
    if(!sheet)return;
    var k=sheetKey,b=BK[k],p=sheet.p;
    renderNotes();
    if(full||true)renderAddBox();
    var res=analyse(cv);
    var mine=res.items.filter(function(x){return x.blocks.indexOf(k)>=0});
    var box=p.querySelector('#bmc-sheetchecks');box.innerHTML='';
    box.appendChild(h('div',{class:'label'},'Checks for this block'));
    if(!mine.length)box.appendChild(h('div',{class:'muted',style:{marginTop:'6px'}},'Add a note and I will check how it fits with the rest of the canvas.'));
    mine.forEach(function(x){box.appendChild(h('div',{class:'bmc-chk'},h('span',{class:'bmc-dot '+x.lvl}),h('div',null,x.msg)))});
    var aiBox=p.querySelector('#bmc-sheetai');aiBox.innerHTML='';
    var ai=ctx.ai&&ctx.ai.available&&ctx.ai.available();
    if(ai){
      aiBox.appendChild(h('button',{class:'btn',type:'button',id:'bmc-ai-block',disabled:sheetAiBusy||!cv.blocks[k].length,onclick:critiqueBlock},sheetAiBusy?'Thinking...':'Ask AI to critique this block'));
      if(!cv.blocks[k].length)aiBox.appendChild(h('span',{class:'muted tiny',style:{marginLeft:'10px'}},'Add a note first'));
      if(sheetAi||sheetAiBusy)aiBox.appendChild(h('div',{class:'ai-box',id:'bmc-sheetai-out',style:{marginTop:'10px'}},h('span',{class:'label'},'AI critique'),h('span',{class:'txt'},sheetAi||'Thinking...')));
    }
  }
  function critiqueBlock(){
    if(sheetAiBusy)return;
    var k=sheetKey,b=BK[k];
    sheetAiBusy=true;sheetAi='';refreshSheet();
    var out=sheet.p.querySelector('#bmc-sheetai-out .txt');
    var pr='Critique ONLY the "'+b.title+'" block ('+b.def+') of this business model canvas, using the other blocks as context.\n'+compact(cv)+'\n\nCritique of '+b.title+':';
    stream(SYS,pr,out,function(txt,ok){
      sheetAiBusy=false;
      if(!sheet||sheetKey!==k)return;
      if(ok&&txt)sheetAi=txt;
      else{var mine=analyse(cv).items.filter(function(x){return x.blocks.indexOf(k)>=0&&x.lvl!=='ok'});
        sheetAi='The AI could not answer, so here are the rule-based checks:\n'+(mine.length?mine.map(function(x){return '- '+x.msg}).join('\n'):'- No rule-based issues for this block.')}
      refreshSheet();
    });
  }
  function moveNote(i,d){
    var a=cv.blocks[sheetKey],j=i+d;if(j<0||j>=a.length)return;
    var t=a[i];a[i]=a[j];a[j]=t;changed();
  }
  function renderNotes(){
    var box=sheet.p.querySelector('#bmc-notes');box.innerHTML='';
    var k=sheetKey,arr=cv.blocks[k],segs=cv.blocks.cs;
    if(!arr.length)box.appendChild(h('div',{class:'muted',style:{marginBottom:'8px'}},'Nothing here yet. Write one idea per sticky note.'));
    arr.forEach(function(n,i){
      var card=h('div',{class:'bmc-note','data-note':n.id});
      if(editId===n.id){
        var ta=h('textarea',{class:'textarea',maxlength:'240',style:{minHeight:'80px'},'aria-label':'Edit note'},n.t);
        ta.value=n.t;
        card.appendChild(ta);
        card.appendChild(h('div',{class:'tools',style:{marginTop:'8px'}},
          h('button',{class:'btn primary sm',type:'button','data-act':'save',onclick:function(){var v=ta.value.trim();if(!v){ctx.toast('A note cannot be empty');return}n.t=v;editId=null;changed()}},'Save'),
          h('button',{class:'btn ghost sm',type:'button',onclick:function(){editId=null;renderNotes()}},'Cancel')));
        setTimeout(function(){ta.focus()},0);
      }else{
        card.appendChild(h('div',{class:'tx'},n.t));
        if(TAGGED[k]&&segs.length&&k!=='cs'){
          card.appendChild(h('div',{class:'label',style:{fontSize:'.62rem',marginBottom:'4px'}},'Serves which segments?'));
          var valid=validSegs(cv,n);
          card.appendChild(h('div',{class:'tags'},segs.map(function(s){
            var on=valid.indexOf(s.id)>=0;
            return h('button',{type:'button',class:'chip'+(on?' on':''),'aria-pressed':on?'true':'false','data-seg':s.id,onclick:function(){
              var cur=validSegs(cv,n);var j=cur.indexOf(s.id);if(j>=0)cur.splice(j,1);else cur.push(s.id);n.s=cur;changed();}},clip(s.t,28));
          })));
        }
        card.appendChild(h('div',{class:'tools'},
          h('button',{class:'btn ghost sm',type:'button','aria-label':'Move up','data-act':'up',disabled:i===0,onclick:function(){moveNote(i,-1)}},'↑'),
          h('button',{class:'btn ghost sm',type:'button','aria-label':'Move down','data-act':'down',disabled:i===arr.length-1,onclick:function(){moveNote(i,1)}},'↓'),
          h('button',{class:'btn ghost sm',type:'button','data-act':'edit',onclick:function(){editId=n.id;renderNotes()}},'Edit'),
          h('button',{class:'btn ghost sm',type:'button','data-act':'del',style:{color:'var(--red)'},onclick:function(){
            arr.splice(i,1);if(k==='cs')BLOCKS.forEach(function(bb){cv.blocks[bb.k].forEach(function(x){x.s=validSegs(cv,x)})});
            changed();}},'Delete')));
      }
      box.appendChild(card);
    });
  }
  function renderAddBox(){
    var box=sheet.p.querySelector('#bmc-addbox');
    var prev=box.querySelector('textarea');var keep=prev?prev.value:'';
    box.innerHTML='';
    var k=sheetKey,segs=cv.blocks.cs;
    var ta=h('textarea',{class:'textarea bmc-add',maxlength:'240',placeholder:'New sticky note... (Enter to add, Shift+Enter for a new line)','aria-label':'New note',style:{minHeight:'70px'},
      onkeydown:function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addNote()}}});
    ta.value=keep;
    function addNote(){
      var v=ta.value.trim();if(!v)return;
      var n={id:uid(),t:v,s:[]};
      if(TAGGED[k]&&k!=='cs')n.s=newSegs.filter(function(i){return segs.some(function(s){return s.id===i})});
      cv.blocks[k].push(n);ta.value='';changed();
      var t2=sheet&&sheet.p.querySelector('textarea.bmc-add');if(t2)t2.focus();
    }
    box.appendChild(ta);
    if(TAGGED[k]&&k!=='cs'&&segs.length){
      box.appendChild(h('div',{class:'label',style:{fontSize:'.62rem',margin:'8px 0 4px'}},'New note serves (optional)'));
      box.appendChild(h('div',{class:'bmc-seg'},segs.map(function(s){
        var on=newSegs.indexOf(s.id)>=0;
        return h('button',{type:'button',class:'chip'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){
          var j=newSegs.indexOf(s.id);if(j>=0)newSegs.splice(j,1);else newSegs.push(s.id);
          keep=ta.value;renderAddBox();}},clip(s.t,28));
      })));
    }
    box.appendChild(h('div',{style:{marginTop:'10px'}},h('button',{class:'btn primary',type:'button',id:'bmc-add-btn',onclick:addNote},'Add note')));
  }

  /* ----- responsive ----- */
  if(typeof ResizeObserver!=='undefined'){
    var ro=new ResizeObserver(function(){
      if(!el.isConnected){ro.disconnect();return}
      var w=el.clientWidth>=640;if(w!==ui.wide&&el.clientWidth>0)render();
    });
    ro.observe(el);
  }

  /* ----- boot ----- */
  if(idx.cur&&idx.list.some(function(c){return c.id===idx.cur})){
    cv=loadCanvas(idx.cur);
    if(!cv){idx.list=idx.list.filter(function(c){return c.id!==idx.cur});idx.cur=null}
  }
  if(!cv)ensureOne(); else render();
}});
})();

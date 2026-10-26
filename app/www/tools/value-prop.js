/* Value Proposition Canvas (Entrepreneurship Session 5: value proposition, features -> benefits, dimensions of value,
   boilerplate description). Tool id: value-prop. Plain ES2017, no libraries.
   Saved state (ctx.save, default key): {seg,prod,jobs,pains,gains,products,relievers,creators} */
(function(){
var h=H.h;
var DIMS=['Economic','Operational','Behavioural','Strategic'];   // the four dimensions of value (Session 5, 2.1)
var IMP={jobs:['Minor','Occasional','Regular','Important','Critical'],
         pains:['Mild','Annoying','Painful','Severe','Extreme'],
         gains:['Nice to have','Welcome','Expected','Wanted','Essential']};
var KINDS={F:'Functional',S:'Social',E:'Emotional'};
var COL={
 jobs:{title:'Customer jobs',hint:'What is the customer trying to get done? The problem or need you solve. Functional (a task), social (how others see them) or emotional (how they want to feel).',ph:'e.g. Get to work on time without stress'},
 pains:{title:'Pains',hint:'What annoys, frustrates, costs them or stops them today? Think friction: time, money, effort, risk, a poor experience.',ph:'e.g. Ordering takes too many steps'},
 gains:{title:'Gains',hint:'What outcomes or benefits do they want, expect or would be delighted by? How would your idea provide a gain?',ph:'e.g. Feel confident the food will arrive hot'},
 products:{title:'Products and services',hint:'The features of your offer: what you actually provide. Next, turn each feature into a benefit below.',ph:'e.g. Mobile app with live tracking'},
 relievers:{title:'Pain relievers',hint:'For each feature: the customer benefit that removes a pain. Complete the sentence "which means that...".',ph:'e.g. Live tracking, which means no waiting by the door'},
 creators:{title:'Gain creators',hint:'How does your offer create the outcomes customers want or would be delighted by? Think of the four dimensions of value too.',ph:'e.g. One-tap reordering of favourites'}
};

/* ---------- example (simplified, public-knowledge illustration) ---------- */
var EXAMPLE={seg:'Daily commuters who love music',prod:'Spotify Premium',
 jobs:[['Listen to music or podcasts during the daily commute','F',5],['Feel relaxed and in my own world on the way to work','E',4],['Discover new music that matches my taste','F',3],['Share and talk about music with friends','S',2]],
 pains:[['No mobile signal on trains and the underground',5],['Mobile data runs out when streaming',4],['Adverts interrupt the mood',4],['Hard to find new music I like among millions of songs',3],['Paying separately for each album or song adds up',3],['Phone battery drains quickly on the journey',3]],
 gains:[['Instant access to any song I think of',5],['Playlists that fit my mood',4],['My music follows me across phone, laptop and speaker',3],['Feel I discover something new every week',3],['Meet other fans and find live events',2]],
 products:['Premium subscription app','Offline downloads','Personalised playlists','Multi-device apps'],
 relievers:[['Downloaded playlists play with no signal or data, which means the journey is never silent',[0,1],'Operational'],
            ['No adverts between songs, which means the mood is never broken',[2],'Operational'],
            ['Recommendations tailored to my listening, which means I do not have to search for new music',[3],'Behavioural'],
            ['One flat monthly fee for unlimited listening, which means no buying songs one by one',[4],'Economic']],
 creators:[['A huge catalogue in one app, so any song is a tap away',[0],'Strategic'],
           ['Mood and activity playlists ready made',[1],'Operational'],
           ['Account syncs across devices, so my music is always there',[2],'Operational'],
           ['A new-music playlist refreshed every week',[3],'Behavioural']]};
/* deliberately left unaddressed: battery drain (pain) and meeting other fans (gain) - the learner can try to close them */

/* ---------- helpers ---------- */
function uid(){return Math.random().toString(36).slice(2,9)}
function words(s){return String(s||'').trim().split(/\s+/).filter(Boolean).length}
function clip(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s}
function lc(s){return s?s.charAt(0).toLowerCase()+s.slice(1):s}
function blank(){return {seg:'',prod:'',jobs:[],pains:[],gains:[],products:[],relievers:[],creators:[]}}
function norm(S){var b=blank();for(var k in b)if(S[k]==null)S[k]=b[k];return S}
function ids(a){return a.map(function(x){return x.id})}
function validLinks(S,r,key,pool){var okIds=ids(S[pool]);return (r[key]||[]).filter(function(i){return okIds.indexOf(i)>=0})}

/* fit: share of customer importance (pains + gains) that has at least one reliever/creator linked */
function compute(S){
  var addrP={},addrG={};
  S.relievers.forEach(function(r){validLinks(S,r,'pains','pains').forEach(function(i){addrP[i]=(addrP[i]||0)+1})});
  S.creators.forEach(function(c){validLinks(S,c,'gains','gains').forEach(function(i){addrG[i]=(addrG[i]||0)+1})});
  function sum(a,m,only){return a.reduce(function(t,x){return t+((!only||m[x.id])?x.imp:0)},0)}
  var tp=sum(S.pains),ap=sum(S.pains,addrP,true),tg=sum(S.gains),ag=sum(S.gains,addrG,true);
  var tot=tp+tg;
  return {addrP:addrP,addrG:addrG,
    pains:tp?Math.round(100*ap/tp):0,gains:tg?Math.round(100*ag/tg):0,
    overall:tot?Math.round(100*(ap+ag)/tot):0,
    hasP:S.pains.length>0,hasG:S.gains.length>0,
    unP:S.pains.filter(function(p){return !addrP[p.id]}).sort(function(a,b){return b.imp-a.imp}),
    unG:S.gains.filter(function(g){return !addrG[g.id]}).sort(function(a,b){return b.imp-a.imp}),
    unusedR:S.relievers.filter(function(r){return !validLinks(S,r,'pains','pains').length}),
    unusedC:S.creators.filter(function(c){return !validLinks(S,c,'gains','gains').length})};
}
function fitLabel(f,S){
  if(!S.pains.length&&!S.gains.length)return 'Start by adding what the customer needs';
  if(!S.relievers.length&&!S.creators.length)return 'Nothing offered yet';
  if(f<35)return 'Weak fit';if(f<65)return 'Partial fit';if(f<85)return 'Good fit';return 'Strong fit (now test it!)';
}
function critiques(S,F){
  var o=[];function add(l,m){o.push({lvl:l,msg:m})}
  if(!S.seg.trim())add('info','Name the customer segment this canvas is for. A value proposition has to be clear about who the customers are.');
  if(S.jobs.length<2)add('warn','Add more customer jobs ('+S.jobs.length+' so far). What else is this customer trying to get done?');
  if(S.pains.length<3)add('warn','Only '+S.pains.length+' pain(s). Most customers have several. Talk to them (recall the focus group activity) before trusting the fit score.');
  if(S.gains.length<3)add('warn','Only '+S.gains.length+' gain(s). Think about what would delight them, not just what annoys them.');
  if(S.jobs.length>=2&&S.jobs.every(function(j){return j.kind==='F'}))add('info','All your jobs are functional. Customers also buy for social reasons (how others see them) and emotional ones (how they want to feel).');
  var vague=S.pains.concat(S.gains).filter(function(x){return words(x.t)<2});
  if(vague.length)add('warn','Too vague to act on: '+vague.slice(0,3).map(function(x){return '"'+clip(x.t,30)+'"'}).join(', ')+'. Be specific: who, when, how bad?');
  F.unP.filter(function(p){return p.imp>=4}).forEach(function(p){add('bad','High-priority pain not addressed: "'+clip(p.t,60)+'" (importance '+p.imp+'/5). What in your offer removes it?')});
  F.unG.filter(function(g){return g.imp>=4}).forEach(function(g){add('bad','High-priority gain not created: "'+clip(g.t,60)+'" (importance '+g.imp+'/5). How will you deliver it?')});
  var lowOnly=S.relievers.filter(function(r){var l=validLinks(S,r,'pains','pains');return l.length&&l.every(function(i){var p=S.pains.filter(function(x){return x.id===i})[0];return p&&p.imp<=2})});
  if(lowOnly.length&&F.unP.some(function(p){return p.imp>=4}))add('warn','Some of your pain relievers only fix minor pains while major ones are untouched. Customers pay for the big problems.');
  F.unusedR.forEach(function(r){add('warn','Pain reliever not linked to any pain: "'+clip(r.t,60)+'". Either the customer does not need it, or you have missed a pain.')});
  F.unusedC.forEach(function(c){add('warn','Gain creator not linked to any gain: "'+clip(c.t,60)+'". Features nobody asked for add cost, not value.')});
  var all=S.relievers.concat(S.creators);
  if(S.products.length&&!all.length)add('warn','You list features but no benefits. For each feature, write what it means for the customer ("which means that...").');
  if(all.length>=3){
    var set={};all.forEach(function(x){set[x.dim||'-']=1});var keys=Object.keys(set);
    if(keys.length===1)add('info',keys[0]==='-'?'Tag each reliever/creator with the dimension of value it provides (economic, operational, behavioural, strategic) to see where your value comes from.':'All of your value is '+keys[0].toLowerCase()+'. Could you add value in another dimension?');
  }
  S.relievers.forEach(function(r){if(validLinks(S,r,'pains','pains').length>=4)add('info','"'+clip(r.t,50)+'" claims to fix '+validLinks(S,r,'pains','pains').length+' pains. Is that realistic?')});
  if(F.hasP&&F.hasG&&F.overall>=90&&(S.pains.length<3||S.gains.length<3))add('info','A high score from a short list is easy to get. Check you have not missed pains and gains.');
  add('info','Fit is a hypothesis until customers confirm it. Test your value proposition with friends, family or potential customers and update the importance scores.');
  return o;
}
function statement(S,F){
  var tp=S.pains.slice().sort(function(a,b){return b.imp-a.imp})[0];
  var linked=S.relievers.filter(function(r){return validLinks(S,r,'pains','pains').length})
     .sort(function(a,b){function m(r){return Math.max.apply(null,validLinks(S,r,'pains','pains').map(function(i){return S.pains.filter(function(p){return p.id===i})[0].imp}))}return m(b)-m(a)});
  var feat=linked[0]||S.relievers[0]||S.creators[0];
  return 'To '+(S.seg.trim()||'[target group]')+(tp?' who struggle with "'+lc(tp.t)+'"':' [and the need you serve]')+', our '+(S.prod.trim()||'[product, service or brand]')
    +' is '+(S.products[0]?'a '+lc(S.products[0].t):'[the concept or category]')+'. Distinctive feature: '+(feat?lc(feat.t).replace(/,? which means.*$/i,'').replace(/,? so .*$/i,''):'[your unique or distinctive feature]')+'.';
}
function rulesText(S,F){
  var c=critiques(S,F).filter(function(x){return x.lvl!=='info'}).slice(0,4);
  return c.length?c.map(function(x){return '- '+x.msg}).join('\n'):'- No major rule-based gaps. Now test it with real customers.';
}
function compactText(S,F){
  function top(a){return a.slice().sort(function(x,y){return y.imp-x.imp}).slice(0,6).map(function(x){return clip(x.t,60)+' ('+x.imp+')'}).join('; ')||'none'}
  return 'Customer: '+(S.seg||'unknown')+'\nOffer: '+(S.prod||'unknown')+
    '\nTop pains (importance 1-5): '+top(S.pains)+'\nTop gains: '+top(S.gains)+
    '\nUnaddressed pains: '+(F.unP.slice(0,4).map(function(p){return clip(p.t,50)}).join('; ')||'none')+
    '\nUnaddressed gains: '+(F.unG.slice(0,4).map(function(p){return clip(p.t,50)}).join('; ')||'none')+
    '\nPain relievers: '+(S.relievers.slice(0,5).map(function(r){return clip(r.t,60)}).join('; ')||'none')+
    '\nGain creators: '+(S.creators.slice(0,5).map(function(r){return clip(r.t,60)}).join('; ')||'none')+
    '\nFit score: '+F.overall+'%';
}
function copyText(text){
  function fb(){var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return ok}
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).then(function(){return true},function(){return fb()});
  return Promise.resolve(fb());
}

/* ---------- styles ---------- */
function injectCss(){
  if(document.getElementById('vp-style'))return;
  var s=document.createElement('style');s.id='vp-style';
  s.textContent=[
  '.vp-head{display:flex;gap:16px;align-items:center;flex-wrap:wrap}',
  '.vp-ring{flex:none;width:84px;height:84px;position:relative}',
  '.vp-ring svg{width:84px;height:84px;transform:rotate(-90deg)}',
  '.vp-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:1.05rem;font-weight:500}',
  '.vp-fields{flex:1;min-width:220px;display:grid;gap:8px}',
  '.vp-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}',
  '.vp-tabs .chip{min-height:44px;padding:8px 16px}',
  '.vp-cols{display:grid;gap:12px;grid-template-columns:1fr}',
  '.vp-cols.wide3{grid-template-columns:repeat(3,minmax(0,1fr))}',
  '.vp-cols.wide2{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '.vp-col{background:var(--surface2);border-radius:var(--r-md);padding:14px;min-width:0}',
  '.vp-col .hint{font-size:.82rem;color:var(--ink2);margin:4px 0 10px}',
  '.vp-add{display:flex;gap:8px;margin-bottom:10px}',
  '.vp-add .input{min-width:0}',
  '.vp-item{background:var(--surface);border-radius:var(--r-sm);padding:10px;margin-bottom:8px;border-left:4px solid var(--ink)}',
  '.vp-item.pain{border-left-color:var(--red)}',
  '.vp-item .r1{display:flex;gap:8px;align-items:center}',
  '.vp-item .r1 .input{flex:1;min-width:0}',
  '.vp-item .r2{display:flex;gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap}',
  '.vp-item .r2 .imp{font-family:var(--mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink2);min-width:84px}',
  '.vp-range{flex:1;min-width:110px;height:44px;accent-color:var(--ink);margin:0}',
  '.vp-x{flex:none;width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center}',
  '.vp-item select.input{padding:6px 10px;min-height:40px;width:auto;font-size:.85rem}',
  '.vp-link{display:block;width:100%;text-align:left;background:var(--surface);border:1.5px solid var(--line);border-radius:var(--r-sm);padding:10px 12px;margin-bottom:8px;cursor:pointer;min-height:48px}',
  '.vp-link .meta{display:block;font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin-top:4px}',
  '.vp-link.sel{background:var(--ink);color:var(--bg);border-color:var(--ink)}',
  '.vp-link.sel .meta{color:var(--bg);opacity:.75}',
  '.vp-link.can{border-style:dashed;border-color:var(--ink)}',
  '.vp-link.on{border-style:solid;border-color:var(--green);background:var(--surface2);box-shadow:inset 4px 0 0 var(--green)}',
  '.vp-link.dim{opacity:.45}',
  '.vp-link.gap{border-color:var(--red);box-shadow:inset 4px 0 0 var(--red)}',
  '.vp-link.gap .meta{color:var(--red)}',
  '.vp-link.sel.gap .meta{color:var(--bg)}',
  '.vp-link.unused{border-color:var(--amber)}',
  '.vp-partner{background:var(--surface2);border-radius:var(--r-sm);padding:8px;margin:-2px 0 10px 12px;border-left:3px solid var(--ink)}',
  '.vp-partner .vp-link{margin-bottom:6px}',
  '.vp-meter{display:grid;grid-template-columns:90px 1fr 44px;gap:10px;align-items:center;margin:6px 0;font-size:.9rem}',
  '.vp-chk{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);font-size:.92rem}',
  '.vp-chk:last-child{border-bottom:0}',
  '.vp-dot{flex:none;width:10px;height:10px;border-radius:50%;margin-top:7px;background:var(--ink3)}',
  '.vp-dot.bad{background:var(--red)}.vp-dot.warn{background:var(--amber)}',
  '.vp-stmt{font-family:var(--serif);font-size:1.05rem;line-height:1.5;border-left:3px solid var(--red);padding:4px 0 4px 14px;margin:8px 0 12px}',
  '.vp-nav{display:flex;justify-content:space-between;gap:10px;margin-top:14px}',
  '.vp-sticky{position:sticky;top:0;z-index:5;background:var(--surface);padding-bottom:4px}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ---------- mount ---------- */
Tools.register('value-prop',{title:'Value Proposition Canvas',desc:'Map customer jobs, pains and gains, then link them to what you offer and see your fit.',
mount:function(el,ctx){
  injectCss();
  var S=norm(ctx.load()||blank());
  var ui={tab:'customer',sel:null,wide:true,aiBusy:false,aiText:'',copied:'',confirmEx:false,confirmReset:false,done:false};
  var TABS=[['customer','1 Customer'],['value','2 Value map'],['link','3 Link and fit'],['review','4 Review']];
  var headBox=null;

  function save(){ctx.save(S)}
  function sortBy(a){return a.slice().sort(function(x,y){return y.imp-x.imp})}
  function resort(key){S[key]=S[key].map(function(x,i){return {x:x,i:i}}).sort(function(a,b){return (b.x.imp-a.x.imp)||(a.i-b.i)}).map(function(o){return o.x})}
  function checkDone(){
    var F=compute(S);
    if(!ui.done&&S.pains.length>=2&&S.gains.length>=2&&S.jobs.length>=1&&F.overall>=70){ui.done=true;ctx.complete(Math.min(1,F.overall/100))}
  }
  function changedLight(){save();updateHead();checkDone()}
  function changedFull(){save();render();checkDone()}

  /* ----- header with live fit ----- */
  function ring(F){
    var R=36,C=2*Math.PI*R,ns='http://www.w3.org/2000/svg';
    var svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 84 84');svg.setAttribute('aria-hidden','true');
    function c(stroke,dash){var e=document.createElementNS(ns,'circle');e.setAttribute('cx',42);e.setAttribute('cy',42);e.setAttribute('r',R);e.setAttribute('fill','none');e.setAttribute('stroke',stroke);e.setAttribute('stroke-width',7);if(dash){e.setAttribute('stroke-dasharray',dash);e.setAttribute('stroke-linecap','round')}return e}
    svg.appendChild(c('var(--line)'));svg.appendChild(c(F.overall>=65?'var(--green)':F.overall>=35?'var(--amber)':'var(--red)',(C*F.overall/100)+' '+C));
    return h('div',{class:'vp-ring',role:'img','aria-label':'Fit score '+F.overall+' percent'},svg,h('b',{id:'vp-fit-num'},F.overall+'%'));
  }
  function fitBox(F){
    return [h('div',{class:'label'},'Fit'),h('div',{id:'vp-fit-label',style:{fontWeight:'500'}},fitLabel(F.overall,S)),
      h('div',{class:'muted tiny',id:'vp-fit-gaps'},F.unP.length+' pain'+(F.unP.length===1?'':'s')+' and '+F.unG.length+' gain'+(F.unG.length===1?'':'s')+' unaddressed')];
  }
  function buildHead(){
    var F=compute(S);
    var seg=h('input',{class:'input',id:'vp-seg',maxlength:'60',placeholder:'Customer segment, e.g. daily commuters','aria-label':'Customer segment',value:S.seg,
      oninput:function(e){S.seg=e.target.value;save();checkDone()}});
    var prod=h('input',{class:'input',id:'vp-prod',maxlength:'60',placeholder:'Your product or service','aria-label':'Your product or service',value:S.prod,
      oninput:function(e){S.prod=e.target.value;save()}});
    return h('div',{class:'vp-head'},h('div',{id:'vp-ringbox'},ring(F)),
      h('div',{id:'vp-fitbox',style:{flex:'none',minWidth:'130px'}},fitBox(F)),
      h('div',{class:'vp-fields'},seg,prod));
  }
  function updateHead(){
    if(!headBox)return;
    var F=compute(S),rb=headBox.querySelector('#vp-ringbox'),fb=headBox.querySelector('#vp-fitbox');
    if(!rb||!fb)return;
    rb.innerHTML='';rb.appendChild(ring(F));fb.innerHTML='';fitBox(F).forEach(function(n){fb.appendChild(n)});
  }

  /* ----- generic editable list column ----- */
  function addRow(key,ph,withKind){
    var kind='F';
    var inp=h('input',{class:'input','data-add':key,maxlength:'120',placeholder:ph,'aria-label':'New '+COL[key].title,
      onkeydown:function(e){if(e.key==='Enter')go()}});
    function go(){
      var v=inp.value.trim();if(!v)return;
      var o={id:uid(),t:v};
      if(key==='jobs'){o.kind=kind;o.imp=3}
      else if(key==='pains'||key==='gains')o.imp=3;
      else if(key==='relievers'){o.pains=[];o.dim=''}
      else if(key==='creators'){o.gains=[];o.dim=''}
      S[key].push(o);
      if(o.imp)resort(key);
      changedFull();
      var n=el.querySelector('[data-add="'+key+'"]');if(n)n.focus();
    }
    var btn=h('button',{class:'btn primary',type:'button','data-addbtn':key,onclick:go,style:{flex:'none'}},'Add');
    var box=h('div',null,h('div',{class:'vp-add'},inp,btn));
    if(withKind){
      var row=h('div',{class:'row',style:{marginBottom:'10px',gap:'6px'}},h('span',{class:'label'},'Type'));
      ['F','S','E'].forEach(function(k){
        var c=h('button',{type:'button',class:'chip'+(k===kind?' on':''),'aria-pressed':k===kind?'true':'false',onclick:function(){
          kind=k;Array.prototype.forEach.call(row.querySelectorAll('.chip'),function(x){var on=x.getAttribute('data-k')===k;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')})},'data-k':k},KINDS[k]);
        row.appendChild(c);
      });
      box.appendChild(row);
    }
    return box;
  }
  function itemRow(key,x){
    var cls='vp-item'+(key==='pains'?' pain':'');
    var inp=h('input',{class:'input',maxlength:'140','aria-label':COL[key].title+' text',value:x.t,oninput:function(e){x.t=e.target.value;save();checkDone()}});
    var del=h('button',{class:'btn ghost vp-x',type:'button','aria-label':'Delete '+clip(x.t,30),'data-del':x.id,onclick:function(){remove(key,x.id)}},'×');
    var card=h('div',{class:cls,'data-item':x.id},h('div',{class:'r1'},inp,del));
    var r2=h('div',{class:'r2'});
    if(x.imp!=null){
      var lab=h('span',{class:'imp'},IMP[key][x.imp-1]+' ('+x.imp+'/5)');
      var rng=h('input',{type:'range',class:'vp-range',min:'1',max:'5',step:'1',value:x.imp,'aria-label':'Importance of '+clip(x.t,30),
        oninput:function(e){x.imp=+e.target.value;lab.textContent=IMP[key][x.imp-1]+' ('+x.imp+'/5)';changedLight()}});
      rng.value=x.imp;
      r2.appendChild(lab);r2.appendChild(rng);
    }
    if(key==='jobs')r2.appendChild(h('span',{class:'chip',style:{cursor:'default'}},KINDS[x.kind||'F']));
    if(key==='relievers'||key==='creators'){
      var n=(key==='relievers'?validLinks(S,x,'pains','pains'):validLinks(S,x,'gains','gains')).length;
      r2.appendChild(h('span',{class:'chip'+(n?'':' red'),style:{cursor:'default'}},n?(key==='relievers'?'Relieves ':'Creates ')+n:'Not linked yet'));
      var sel=h('select',{class:'input','aria-label':'Dimension of value',onchange:function(e){x.dim=e.target.value;save()}},
        [h('option',{value:''},'Dimension...')].concat(DIMS.map(function(d){return h('option',{value:d},d)})));
      sel.value=x.dim||'';
      r2.appendChild(sel);
    }
    if(r2.childNodes.length)card.appendChild(r2);
    return card;
  }
  function remove(key,id){
    S[key]=S[key].filter(function(x){return x.id!==id});
    if(key==='pains')S.relievers.forEach(function(r){r.pains=validLinks(S,r,'pains','pains')});
    if(key==='gains')S.creators.forEach(function(r){r.gains=validLinks(S,r,'gains','gains')});
    if(ui.sel&&ui.sel.id===id)ui.sel=null;
    changedFull();
  }
  function column(key){
    var c=COL[key];
    var col=h('div',{class:'vp-col','data-col':key},
      h('div',{class:'row between'},h('h3',{style:{margin:0}},c.title),
        S[key].length>1&&S[key][0].imp!=null?h('button',{class:'btn sm ghost',type:'button','aria-label':'Sort '+c.title+' by importance',onclick:function(){resort(key);changedFull()}},'Sort'):null),
      h('div',{class:'hint'},c.hint),addRow(key,c.ph,key==='jobs'));
    if(!S[key].length)col.appendChild(h('div',{class:'muted tiny'},'Nothing here yet.'));
    S[key].forEach(function(x){col.appendChild(itemRow(key,x))});
    return col;
  }

  /* ----- link tab ----- */
  var COMPAT={pain:'reliever',gain:'creator',reliever:'pain',creator:'gain'};
  var POOL={pain:'pains',gain:'gains',reliever:'relievers',creator:'creators'};
  function isLinked(a,b){ // a,b: {type,id}; one customer-side, one value-side
    var c=a.type==='pain'||a.type==='gain'?a:b,v=c===a?b:a;
    var r=S[POOL[v.type]].filter(function(x){return x.id===v.id})[0];if(!r)return false;
    return (r[v.type==='reliever'?'pains':'gains']||[]).indexOf(c.id)>=0;
  }
  function toggleLink(a,b){
    var c=a.type==='pain'||a.type==='gain'?a:b,v=c===a?b:a;
    var r=S[POOL[v.type]].filter(function(x){return x.id===v.id})[0];if(!r)return;
    var k=v.type==='reliever'?'pains':'gains';r[k]=r[k]||[];
    var j=r[k].indexOf(c.id);if(j>=0)r[k].splice(j,1);else r[k].push(c.id);
  }
  function tap(type,id){
    var me={type:type,id:id},s=ui.sel;
    if(s&&s.type===type&&s.id===id){ui.sel=null}
    else if(s&&COMPAT[s.type]===type){toggleLink(s,me)}
    else ui.sel=me;
    save();render();checkDone();
    var b=el.querySelector('[data-link="'+(ui.sel?ui.sel.id:id)+'"]');if(b&&b.scrollIntoView&&!ui.wide){}
  }
  function linkBtn(type,x,F){
    var s=ui.sel,isSel=s&&s.type===type&&s.id===x.id;
    var cls='vp-link';
    var meta='';
    var cust=type==='pain'||type==='gain';
    if(cust){
      var n=(type==='pain'?F.addrP:F.addrG)[x.id]||0;
      meta=(type==='pain'?IMP.pains:IMP.gains)[x.imp-1]+' '+x.imp+'/5 · '+(n?(type==='pain'?'relieved by ':'created by ')+n:'UNADDRESSED');
      if(!n)cls+=' gap';
    }else{
      var ln=(type==='reliever'?validLinks(S,x,'pains','pains'):validLinks(S,x,'gains','gains')).length;
      meta=ln?((type==='reliever'?'relieves ':'creates ')+ln):'NOT LINKED TO ANY NEED';
      if(!ln)cls+=' unused';
    }
    if(isSel)cls+=' sel';
    else if(s&&COMPAT[s.type]===type){cls+=isLinked(s,{type:type,id:x.id})?' on':' can'}
    else if(s&&!(COMPAT[s.type]===type)&&s.type!==type&&false)cls+=' dim';
    var b=h('button',{type:'button',class:cls,'data-link':x.id,'data-type':type,'aria-pressed':isSel?'true':'false',
      'aria-label':x.t+'. '+meta+(s&&COMPAT[s.type]===type?(isLinked(s,{type:type,id:x.id})?'. Linked. Tap to unlink.':'. Tap to link.'):''),
      onclick:function(){tap(type,x.id)}},h('span',null,x.t),h('span',{class:'meta'},meta));
    return b;
  }
  function partnerPanel(type,x,F){ // narrow layout: partners inline below the selected item
    var wantType=COMPAT[type],pool=S[POOL[wantType]];
    var box=h('div',{class:'vp-partner','data-partner':x.id},h('div',{class:'label',style:{marginBottom:'6px'}},'Tap to link or unlink'));
    if(!pool.length)box.appendChild(h('div',{class:'muted tiny'},'Nothing to link yet. Add some on the previous tabs.'));
    sortBy(pool.filter(function(p){return p.imp!=null}).length?pool:pool).forEach(function(p){box.appendChild(linkBtn(wantType,p,F))});
    return box;
  }
  function linkList(type,arr,F){
    var frag=[];
    var list=(type==='pain'||type==='gain')?sortBy(arr):arr;
    list.forEach(function(x){
      frag.push(linkBtn(type,x,F));
      if(!ui.wide&&ui.sel&&ui.sel.type===type&&ui.sel.id===x.id)frag.push(partnerPanel(type,x,F));
    });
    if(!arr.length)frag.push(h('div',{class:'muted tiny'},'None yet.'));
    return frag;
  }
  function meter(label,v,has){
    return h('div',{class:'vp-meter'},h('span',{class:'label'},label),h('div',{class:'bar'+(v<35?' red':'')},h('i',{style:{width:(has?v:0)+'%'}})),h('b',null,has?v+'%':'-'));
  }
  function linkTab(){
    var F=compute(S),box=h('div');
    box.appendChild(h('div',{class:'card flat'},
      h('div',{class:'label'},'Live fit'),
      meter('Pains',F.pains,F.hasP),meter('Gains',F.gains,F.hasG),meter('Overall',F.overall,F.hasP||F.hasG),
      F.unP.length?h('div',{style:{marginTop:'8px',fontSize:'.92rem'}},h('b',{class:'bad'},'Biggest gap: '),'"'+clip(F.unP[0].t,70)+'" (importance '+F.unP[0].imp+'/5) has nothing relieving it.'):
        (F.hasP&&F.hasG&&!F.unG.length?h('div',{class:'ok',style:{marginTop:'8px'}},'Every pain and gain has something addressing it.'):null),
      h('div',{class:'muted tiny',style:{marginTop:'8px'}},'Fit = the share of customer importance (pains and gains) that has at least one reliever or creator linked, so big problems count more than small ones.')));
    box.appendChild(h('div',{class:'callout note'},ui.sel?
      h('span',null,h('b',null,'Selected: '),clip(S[POOL[ui.sel.type]].filter(function(x){return x.id===ui.sel.id}).map(function(x){return x.t})[0]||'',80),
        '. Now tap ',ui.sel.type==='pain'?'the pain relievers':ui.sel.type==='gain'?'the gain creators':ui.sel.type==='reliever'?'the pains':'the gains',' it connects to. Tap again to unlink.'):
      'Tap a pain or gain, then tap each pain reliever or gain creator that addresses it. (You can also start from the offer side.) Red items are unaddressed.'));
    if(!S.pains.length&&!S.gains.length){box.appendChild(h('div',{class:'muted'},'Add pains and gains on tab 1 first.'));return box}
    var cols=h('div',{class:'vp-cols'+(ui.wide?' wide2':'')});
    var left=h('div',{class:'vp-col','data-col':'cust'},h('h3',null,'Customer'),h('div',{class:'label',style:{margin:'6px 0'}},'Pains'));
    linkList('pain',S.pains,F).forEach(function(n){left.appendChild(n)});
    left.appendChild(h('div',{class:'label',style:{margin:'10px 0 6px'}},'Gains'));
    linkList('gain',S.gains,F).forEach(function(n){left.appendChild(n)});
    var right=h('div',{class:'vp-col','data-col':'offer'},h('h3',null,'Your offer'),h('div',{class:'label',style:{margin:'6px 0'}},'Pain relievers'));
    linkList('reliever',S.relievers,F).forEach(function(n){right.appendChild(n)});
    right.appendChild(h('div',{class:'label',style:{margin:'10px 0 6px'}},'Gain creators'));
    linkList('creator',S.creators,F).forEach(function(n){right.appendChild(n)});
    cols.appendChild(left);cols.appendChild(right);box.appendChild(cols);
    return box;
  }

  /* ----- review tab ----- */
  function reviewTab(){
    var F=compute(S),box=h('div');
    var c=critiques(S,F);
    var card=h('div',{class:'card flat'},h('div',{class:'label'},'Rule-based review'));
    var ordered=c.filter(function(x){return x.lvl==='bad'}).concat(c.filter(function(x){return x.lvl==='warn'}),c.filter(function(x){return x.lvl==='info'}));
    ordered.forEach(function(x){card.appendChild(h('div',{class:'vp-chk','data-lvl':x.lvl},h('span',{class:'vp-dot '+x.lvl}),h('div',null,x.msg)))});
    box.appendChild(card);
    /* unaddressed */
    var un=F.unP.map(function(p){return ['Pain',p]}).concat(F.unG.map(function(g){return ['Gain',g]})).sort(function(a,b){return b[1].imp-a[1].imp});
    var uc=h('div',{class:'card flat'},h('div',{class:'label'},'Unaddressed, highest importance first'));
    if(!un.length)uc.appendChild(h('div',{class:'ok',style:{marginTop:'6px'}},S.pains.length||S.gains.length?'Nothing unaddressed.':'Add pains and gains first.'));
    un.forEach(function(u){uc.appendChild(h('div',{class:'vp-chk'},h('span',{class:'vp-dot bad'}),h('div',null,h('b',null,u[0]+' '+u[1].imp+'/5: '),u[1].t)))});
    box.appendChild(uc);
    /* statement */
    var st=statement(S,F);
    box.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Draft value proposition (course boilerplate)'),
      h('div',{class:'vp-stmt',id:'vp-stmt'},st),
      h('div',{class:'muted tiny',style:{marginBottom:'10px'}},'Template from Session 5: "To [target group and need] our [product] is [concept] that [distinctive feature]". Polish it and test a few versions on friends, family or trusted advisers.'),
      h('button',{class:'btn',type:'button',id:'vp-copy',onclick:function(){copyText(st).then(function(ok){ui.copied=ok?'Copied!':'Copy failed';render();setTimeout(function(){ui.copied='';render()},1800)})}},ui.copied||'Copy statement')));
    /* AI */
    var ai=ctx.ai&&ctx.ai.available&&ctx.ai.available();
    var aiCard=h('div',{class:'card'},h('div',{class:'label'},'AI critique'));
    if(ai){
      aiCard.appendChild(h('div',{style:{marginTop:'8px'}},h('button',{class:'btn primary',type:'button',id:'vp-ai',disabled:ui.aiBusy||(!S.pains.length&&!S.gains.length),onclick:askAi},ui.aiBusy?'Thinking...':'Ask AI to critique my fit')));
      if(ui.aiBusy||ui.aiText)aiCard.appendChild(h('div',{class:'ai-box',id:'vp-ai-out',style:{marginTop:'10px'}},h('span',{class:'label'},'AI critique'),h('span',{class:'txt'},ui.aiText||'Thinking...')));
    }else aiCard.appendChild(h('div',{class:'muted',style:{marginTop:'6px'}},'No on-device AI loaded. The rule-based review above checks your fit, priorities and gaps.'));
    box.appendChild(aiCard);
    return box;
  }
  function askAi(){
    if(ui.aiBusy)return;
    var F=compute(S);ui.aiBusy=true;ui.aiText='';render();
    var out=el.querySelector('#vp-ai-out .txt'),acc='';
    var sys='You are a friendly business coach. Reply in plain text under 100 words in this format:\nStrength: one sentence.\nGaps: the two most important gaps between customer needs and the offer.\nTest: one question to ask real customers.';
    var pr='Review this value proposition canvas. Focus on whether the highest-importance pains and gains are addressed.\n'+compactText(S,F)+'\n\nReview:';
    var p;
    try{p=ctx.ai.ask({system:sys,prompt:pr,maxTokens:200,temperature:0.4,onToken:function(t){if(typeof t!=='string')return;acc=(acc&&t.indexOf(acc)===0)?t:acc+t;if(out)out.textContent=acc}})}catch(e){p=Promise.reject(e)}
    p.then(function(t){ui.aiBusy=false;ui.aiText=String(t||acc).trim()||('Rule-based review instead:\n'+rulesText(S,compute(S)));if(ui.tab==='review')render()},
           function(){ui.aiBusy=false;ui.aiText='The AI could not answer, so here is the rule-based review:\n'+rulesText(S,compute(S));if(ui.tab==='review')render()});
  }

  /* ----- main render ----- */
  function loadExample(){
    var E=EXAMPLE,n=blank();n.seg=E.seg;n.prod=E.prod;
    E.jobs.forEach(function(j){n.jobs.push({id:uid(),t:j[0],kind:j[1],imp:j[2]})});
    E.pains.forEach(function(p){n.pains.push({id:uid(),t:p[0],imp:p[1]})});
    E.gains.forEach(function(p){n.gains.push({id:uid(),t:p[0],imp:p[1]})});
    E.products.forEach(function(t){n.products.push({id:uid(),t:t})});
    E.relievers.forEach(function(r){n.relievers.push({id:uid(),t:r[0],dim:r[2],pains:r[1].map(function(i){return n.pains[i].id})})});
    E.creators.forEach(function(r){n.creators.push({id:uid(),t:r[0],dim:r[2],gains:r[1].map(function(i){return n.gains[i].id})})});
    S=n;ui.sel=null;ui.aiText='';ui.confirmEx=false;ui.tab='link';save();render();checkDone();
  }
  function hasContent(){return S.seg||S.prod||S.jobs.length||S.pains.length||S.gains.length||S.products.length||S.relievers.length||S.creators.length}
  function render(){
    ui.wide=el.clientWidth>=700||el.clientWidth===0;
    el.innerHTML='';
    var root=h('div',{class:'tool','data-vp':'1'});
    headBox=h('div',{class:'vp-top'});headBox.appendChild(buildHead());
    root.appendChild(headBox);
    var tabs=h('div',{class:'vp-tabs',role:'tablist'},TABS.map(function(t){
      return h('button',{type:'button',role:'tab',class:'chip'+(ui.tab===t[0]?' on':''),'aria-selected':ui.tab===t[0]?'true':'false','data-tab':t[0],onclick:function(){ui.tab=t[0];ui.sel=null;ui.confirmEx=ui.confirmReset=false;render()}},t[1])}));
    root.appendChild(tabs);
    var body=h('div',{'data-body':ui.tab});
    if(ui.tab==='customer'){
      body.appendChild(h('p',{class:'muted',style:{marginTop:0}},'Customer side. Be the customer: what are they trying to do, what gets in the way, and what would delight them? Slide each to show how much it matters.'));
      var g=h('div',{class:'vp-cols'+(ui.wide?' wide3':'')});['jobs','pains','gains'].forEach(function(k){g.appendChild(column(k))});body.appendChild(g);
    }else if(ui.tab==='value'){
      body.appendChild(h('p',{class:'muted',style:{marginTop:0}},'Value map. List your features, then say what each one means for the customer. A benefit is what a feature does for them: "which means that...".'));
      var g2=h('div',{class:'vp-cols'+(ui.wide?' wide3':'')});['products','relievers','creators'].forEach(function(k){g2.appendChild(column(k))});body.appendChild(g2);
    }else if(ui.tab==='link')body.appendChild(linkTab());
    else body.appendChild(reviewTab());
    root.appendChild(body);
    var i=TABS.map(function(t){return t[0]}).indexOf(ui.tab);
    root.appendChild(h('div',{class:'vp-nav'},
      h('button',{class:'btn ghost',type:'button',disabled:i===0,onclick:function(){ui.tab=TABS[i-1][0];ui.sel=null;render();window.scrollTo&&0}},'Back'),
      h('button',{class:'btn primary',type:'button',disabled:i===TABS.length-1,onclick:function(){ui.tab=TABS[i+1][0];ui.sel=null;render()}},'Next')));
    el.appendChild(root);
    var foot=h('div',{class:'card flat',style:{marginTop:'14px'}},h('div',{class:'label'},'Example and reset'),
      h('p',{class:'muted',style:{margin:'6px 0 10px'}},'Load a worked example (Spotify Premium for commuters) to see a filled canvas, with a couple of gaps left for you to close. It replaces your current canvas.'),
      h('div',{class:'row'},
        h('button',{class:'btn'+(ui.confirmEx?' red':''),type:'button',id:'vp-load-ex',onclick:function(){if(hasContent()&&!ui.confirmEx){ui.confirmEx=true;render();return}loadExample()}},ui.confirmEx?'Tap again to replace my canvas':'Load example'),
        h('button',{class:'btn'+(ui.confirmReset?' red':' ghost'),type:'button',id:'vp-reset',onclick:function(){if(!ui.confirmReset){ui.confirmReset=true;render();return}S=blank();ui.sel=null;ui.aiText='';ui.confirmReset=false;ui.tab='customer';save();render();ctx.toast('Canvas reset')}},ui.confirmReset?'Tap again to reset':'Reset')));
    el.appendChild(foot);
  }
  if(typeof ResizeObserver!=='undefined'){
    var ro=new ResizeObserver(function(){if(!el.isConnected){ro.disconnect();return}var w=el.clientWidth>=700;if(el.clientWidth>0&&w!==ui.wide)render()});
    ro.observe(el);
  }
  render();
}});
})();

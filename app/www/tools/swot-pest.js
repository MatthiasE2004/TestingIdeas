/* Investigative / analysis tools: SWOT, PESTLE (PM course 1.3), Pareto analysis and cause & effect (fishbone) diagrams (PM course 1.4) */
(function(){
  var h=H.h;
  var css=
  '.sp-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}'+
  '.sp-steps{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;padding-bottom:12px;border-bottom:1px dotted var(--ink3)}'+
  '.sp-bins{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}'+
  '.sp-bins.six{grid-template-columns:1fr 1fr}@media(min-width:760px){.sp-bins.six{grid-template-columns:1fr 1fr 1fr}}'+
  '.sp-bin{border:2px dashed var(--line);border-radius:var(--r-md);padding:10px;min-height:96px;background:var(--surface);cursor:pointer;transition:border-color .15s,background .15s}'+
  '.sp-bin.armed{border-color:var(--ink);background:var(--surface2)}.sp-bin.hot{border-color:var(--red);background:var(--surface2)}'+
  '.sp-bin h4{margin:0 0 2px;font-size:1rem;font-weight:500}.sp-bin .hint{font-size:.75rem;color:var(--ink2);margin-bottom:6px}'+
  '.sp-it{border:1.5px solid var(--line);border-radius:var(--r-sm);padding:9px 12px;margin:0 0 8px;background:var(--surface);font-size:.92rem;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;display:block;width:100%;text-align:left}'+
  '.sp-it.sel{border-color:var(--red);border-style:dotted;border-width:2px}'+
  '.sp-it.ok{border-color:var(--green);cursor:default;touch-action:auto}.sp-it.ok small{display:block;color:var(--ink2);margin-top:3px;font-size:.8rem}'+
  '.sp-it.shake{animation:sp-sh .35s}@keyframes sp-sh{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'+
  '.sp-ghost{position:fixed;z-index:10000;max-width:240px;background:var(--ink);color:var(--bg);padding:8px 12px;border-radius:var(--r-sm);font-size:.85rem;pointer-events:none;transform:translate(-50%,-120%);opacity:.92}'+
  '.sp-fb{border-radius:var(--r-md);padding:10px 14px;margin:0 0 12px;font-size:.92rem;background:var(--surface2);border-left:3px solid var(--ink3)}'+
  '.sp-fb.bad{border-color:var(--red)}.sp-fb.good{border-color:var(--green)}'+
  '.sp-li{display:flex;gap:6px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--line);font-size:.92rem}.sp-li span{flex:1;min-width:0;overflow-wrap:anywhere}'+
  '.sp-x{background:none;border:0;cursor:pointer;color:var(--ink2);min-width:44px;min-height:44px;font-size:1.2rem;margin:-8px -6px -8px 0}'+
  '.sp-warn{color:var(--red);font-size:.8rem;display:block;margin-top:2px}'+
  '.sp-q{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:760px){.sp-q{grid-template-columns:1fr 1fr}}'+
  '.sp-q .card{margin:0}.sp-q .tag{font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}'+
  '.sp-bars{display:flex;align-items:flex-end;gap:8px;height:210px;padding:22px 0 0;border-bottom:1.5px solid var(--ink);margin-bottom:0}'+
  '.sp-col{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;font-size:.7rem;font-family:var(--mono);text-align:center}'+
  '.sp-col i{display:block;width:100%;background:var(--ink);border-radius:6px 6px 0 0;min-height:2px;transition:height .4s}.sp-col.few i{background:var(--red)}'+
  '.sp-lbls{display:flex;gap:8px;margin-bottom:10px}.sp-lbls div{flex:1;min-width:0;font-size:.74rem;text-align:center;padding-top:6px;overflow-wrap:anywhere;line-height:1.25}'+
  '.sp-rowp{display:grid;grid-template-columns:1fr 78px 78px 44px;gap:6px;align-items:center;margin-bottom:8px}'+
  '@media(max-width:480px){.sp-rowp{grid-template-columns:1fr 64px 64px 40px}}'+
  '.sp-cause{border:1px solid var(--line);border-radius:var(--r-sm);padding:8px 10px;margin:0 0 8px;background:var(--surface2)}'+
  '.sp-sub{margin:6px 0 0 14px;padding-left:10px;border-left:2px dotted var(--ink3);font-size:.88rem}'+
  '.sp-tb{display:flex;gap:6px;align-items:center;margin-top:6px}';
  if(!document.getElementById('sp-css')){var st=document.createElement('style');st.id='sp-css';st.textContent=css;document.head.appendChild(st)}

  function sh(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function txt(n){return String(n==null?'':n)}

  /* ------------------------------------------------------------- sorter */
  /* cfg: {bins:[{k,l,hint}], items:[{t,bin,why}], six:bool}; st: {done:{idx:1}, first:{idx:1}, tries:n}; cb(st) on change */
  function Sorter(cfg,st,cb){
    st.done=st.done||{};st.first=st.first||{};st.tried=st.tried||{};
    if(!st.order||st.order.length!==cfg.items.length)st.order=sh(cfg.items.map(function(_,i){return i}));
    var sel=null,wrap=h('div'),fb=h('div'),pool=h('div'),binsEl=h('div',{class:'sp-bins'+(cfg.six?' six':'')});
    var binEls={};
    function pending(){return st.order.filter(function(i){return !st.done[i]})}
    function binName(k){for(var i=0;i<cfg.bins.length;i++)if(cfg.bins[i].k===k)return cfg.bins[i].l}
    function drop(i,k){
      var it=cfg.items[i];
      if(it.bin===k){ if(!st.tried[i])st.first[i]=1; st.done[i]=1; sel=null;
        setFb('good','Correct - '+binName(k)+'. '+it.why);
      } else { st.tried[i]=1; sel=null; setFb('bad','Not '+binName(k)+'. '+(cfg.wrong?cfg.wrong(it,k):'Think again about where this belongs.')+(cfg.hintOnWrong===false?'':' Try another box.'));
        var el=pool.querySelector('[data-i="'+i+'"]'); if(el){el.classList.add('shake')} }
      cb(st); draw();
    }
    function setFb(kind,msg){fb.innerHTML='';fb.appendChild(h('div',{class:'sp-fb '+kind,role:'status'},msg))}
    function startDrag(ev,i){
      if(ev.button>0)return; var sx=ev.clientX,sy=ev.clientY,moved=false,g=null,hot=null;
      function over(e){var t=document.elementFromPoint(e.clientX,e.clientY);var b=t&&t.closest?t.closest('[data-bin]'):null;
        if(hot&&hot!==b)hot.classList.remove('hot');hot=b;if(b)b.classList.add('hot');return b}
      function mv(e){if(!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)>6){moved=true;g=h('div',{class:'sp-ghost'},cfg.items[i].t);document.body.appendChild(g)}
        if(moved){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';over(e);if(e.cancelable)e.preventDefault()}}
      function up(e){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);
        if(g)g.remove(); var b=moved?over(e):null; if(hot)hot.classList.remove('hot');
        if(!moved){sel=(sel===i?null:i);draw();return}
        if(b&&e.type!=='pointercancel')drop(i,b.getAttribute('data-bin'));}
      document.addEventListener('pointermove',mv,{passive:false});document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
    }
    cfg.bins.forEach(function(b){
      var body=h('div'); var el=h('div',{class:'sp-bin','data-bin':b.k,role:'button',tabindex:'0','aria-label':'Box: '+b.l,
        onclick:function(e){if(e.target.closest('.sp-it'))return; if(sel!=null)drop(sel,b.k)},
        onkeydown:function(e){if((e.key==='Enter'||e.key===' ')&&sel!=null){e.preventDefault();drop(sel,b.k)}}},
        h('h4',null,b.l),h('div',{class:'hint'},b.hint||''),body);
      binEls[b.k]={el:el,body:body};binsEl.appendChild(el)});
    function draw(){
      var p=pending();
      cfg.bins.forEach(function(b){var bd=binEls[b.k].body;bd.innerHTML='';binEls[b.k].el.classList.toggle('armed',sel!=null);
        st.order.forEach(function(i){var it=cfg.items[i];if(st.done[i]&&it.bin===b.k)bd.appendChild(h('div',{class:'sp-it ok'},it.t,h('small',null,it.why)))})});
      pool.innerHTML='';
      p.forEach(function(i){var el=h('div',{class:'sp-it'+(sel===i?' sel':''),'data-i':i,role:'button',tabindex:'0','aria-label':'Item: '+cfg.items[i].t,
        onkeydown:function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel=(sel===i?null:i);draw()}}},cfg.items[i].t);
        el.addEventListener('pointerdown',function(e){startDrag(e,i)});pool.appendChild(el)});
      var total=cfg.items.length,dn=total-p.length;
      if(!p.length){var f=Object.keys(st.first).length;
        pool.appendChild(h('div',{class:'sp-fb good'},h('b',null,'All sorted. '),'First-try correct: '+f+' of '+total+'.'));}
      else if(sel==null&&!fb.firstChild)pool.insertBefore(h('div',{class:'muted tiny',style:{marginBottom:'8px'}},'Tap an item, then tap the box it belongs in - or drag it there. '+dn+' of '+total+' placed.'),pool.firstChild);
      else pool.insertBefore(h('div',{class:'muted tiny',style:{marginBottom:'8px'}},sel!=null?'Now tap a box (or drag the item).':'Tap an item, then a box. '+dn+' of '+total+' placed.'),pool.firstChild);
    }
    wrap.appendChild(binsEl);wrap.appendChild(fb);wrap.appendChild(pool);draw();
    return {el:wrap,done:function(){return !pending().length},score:function(){return Object.keys(st.first).length/cfg.items.length}};
  }

  /* ------------------------------------------------------------- list editor */
  /* cats:[{k,l,prompt,tag}], data:{k:[str]}; opts.flag(k,text)->string|null ; opts.after(host) ; onChange */
  function ListEditor(cats,data,onChange,opts){
    opts=opts||{}; var host=h('div'),tips=h('div'),grid=h('div',{class:'sp-q'});
    cats.forEach(function(c){data[c.k]=data[c.k]||[]});
    var focusK=null;
    function draw(){
      grid.innerHTML='';
      cats.forEach(function(c){
        var list=h('div'),inp=h('input',{class:'input','data-k':c.k,placeholder:c.ph||'Add a factor ...',maxlength:'140','aria-label':'Add to '+c.l});
        function add(){var v=inp.value.trim();if(!v)return;data[c.k].push(v);focusK=c.k;onChange();draw()}
        inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();add()}});
        data[c.k].forEach(function(v,i){var f=opts.flag?opts.flag(c.k,v):null;
          list.appendChild(h('div',{class:'sp-li'},h('span',null,v,f?h('em',{class:'sp-warn'},f):null),h('button',{class:'sp-x','aria-label':'Remove',onclick:function(){data[c.k].splice(i,1);onChange();draw()}},'×')))});
        grid.appendChild(h('div',{class:'card flat'},h('div',{class:'tag'},c.tag||''),h('h3',{style:{marginBottom:'2px'}},c.l+' ('+data[c.k].length+')'),
          h('div',{class:'muted',style:{fontSize:'.85rem',marginBottom:'8px'}},c.prompt),list,
          h('div',{class:'row',style:{flexWrap:'nowrap',marginTop:'8px'}},inp,h('button',{class:'btn primary',onclick:add,style:{flex:'none'}},'Add'))));
      });
      tips.innerHTML='';
      var t=opts.tips?opts.tips(data):[];
      if(t.length)tips.appendChild(h('div',{class:'sp-fb',style:{marginTop:'12px'}},h('b',null,'Check your analysis'),h('ul',{style:{margin:'6px 0 0',paddingLeft:'20px'}},t.map(function(x){return h('li',null,x)}))));
      if(focusK){var q=grid.querySelector('input[data-k="'+focusK+'"]');if(q)try{q.focus({preventScroll:true})}catch(e){q.focus()};focusK=null}
    }
    host.appendChild(grid);host.appendChild(tips);draw();
    return {el:host,redraw:draw};
  }

  function AIBtn(ctx,label,getPrompt,store,onSave){
    var box=h('div',{class:store.text?'ai-box':'hide',style:{marginTop:'10px'}},h('span',{class:'label'},'AI critique'),store.text||'');
    var wrap=h('div');
    if(!ctx.ai.available())return wrap;
    var btn=h('button',{class:'btn ghost',onclick:run},label);
    function run(){var p=getPrompt();if(!p){ctx.toast('Add a few items first');return}
      var text='';box.className='ai-box';box.innerHTML='';box.appendChild(h('span',{class:'label'},'AI critique'));var tn=document.createTextNode('Thinking ...');box.appendChild(tn);btn.disabled=true;
      ctx.ai.ask({system:'You are a concise project management tutor. Critique the learner\'s analysis: one thing done well, then up to two specific improvements (items in the wrong category, vague items, missing areas). Plain text, max 120 words.',prompt:p,maxTokens:220,temperature:0.4,onToken:function(t){text+=t;tn.nodeValue=text}})
        .then(function(r){store.text=(r||text).trim();tn.nodeValue=store.text;onSave()}).catch(function(){tn.nodeValue='The AI is not available right now - use the checks above.'}).then(function(){btn.disabled=false})}
    wrap.appendChild(btn);wrap.appendChild(box);return wrap;
  }

  /* ------------------------------------------------------------- content */
  var SWOT_BINS=[
    {k:'S',l:'Strengths',hint:'Internal, helpful'},{k:'W',l:'Weaknesses',hint:'Internal, harmful'},
    {k:'O',l:'Opportunities',hint:'External, helpful'},{k:'T',l:'Threats',hint:'External, harmful'}];
  var SWOT_ITEMS=[
    {t:'We have an established customer base and a growing reputation.',bin:'S',why:'Internal to the company (its customers and reputation) and helpful.'},
    {t:'The business is currently economically viable and profitable.',bin:'S',why:'An internal feature of the organisation, and a positive one.'},
    {t:'Our new wireless data collector, soon to be released, is in an exciting area.',bin:'S',why:'A present or imminent product of the company itself: internal and positive.'},
    {t:'Income is still too low to fund research and development into new areas.',bin:'W',why:'Internal (the company\'s own finances) and harmful to its prospects.'},
    {t:'Developing or improving products takes so long that we do not respond to customer requests quickly enough.',bin:'W',why:'Concerns internal processes (information flows, development speed): a weakness.'},
    {t:'Some of our products are now dated and some have low sales.',bin:'W',why:'Present products are part of the internal environment - here a harmful one.'},
    {t:'It is difficult to recruit industrial design staff with the right skills.',bin:'W',why:'Staffing is internal. The labour market is outside, but the effect on us is the weakness of lacking skills.'},
    {t:'Many of our products also have a commercial (not just industrial) market.',bin:'O',why:'A potential market is part of the external environment, and it could help.'},
    {t:'There is customer interest in products related to our lines that we do not yet make.',bin:'O',why:'Customer demand comes from outside the firm and could be exploited.'},
    {t:'There are new areas related to our product lines, ripe for development.',bin:'O',why:'An outside possibility to take advantage of.'},
    {t:'Competitors might copy our designs and make a better or cheaper product.',bin:'T',why:'Competition is an external factor, and harmful.'},
    {t:'We may face legal action over the operational safety of some products.',bin:'T',why:'Legislation and liability are external; the possible outcome is harmful.'},
    {t:'We sell worldwide, so we are exposed to politics in different countries.',bin:'T',why:'Politics in other countries is outside our control: an external threat.'}];

  var PEST_BINS=[
    {k:'P',l:'Political',hint:'Government, policy, politics'},{k:'E',l:'Economic',hint:'Money, rates, markets'},
    {k:'S',l:'Social',hint:'People, attitudes, demographics'},{k:'T',l:'Technological',hint:'New tech, innovation'},
    {k:'L',l:'Legal',hint:'Laws, standards, liability'},{k:'N',l:'Environmental',hint:'Nature, waste, climate'}];
  var PEST_ITEMS=[
    {t:'The government scheme that subsidises e-bike purchases ends next year.',bin:'P',why:'A government policy decision.'},
    {t:'A trade dispute puts a tariff on imported batteries.',bin:'P',why:'Trade policy is political (it also has an economic effect, but the cause is a political decision).'},
    {t:'Interest rates rise, making customers\' loans more expensive.',bin:'E',why:'A feature of the economic climate.'},
    {t:'The exchange rate moves, so imported components cost 15% more.',bin:'E',why:'Exchange rates are economic.'},
    {t:'More commuters want to cycle to work for health and cost reasons.',bin:'S',why:'A change in social attitudes and lifestyle.'},
    {t:'An ageing population wants an easy-ride, low-step frame.',bin:'S',why:'Demographics are social factors.'},
    {t:'A new battery chemistry doubles range at the same cost.',bin:'T',why:'A technological development that could change the product.'},
    {t:'Rivals start using a phone app to lock and track bikes.',bin:'T',why:'Technology adopted by competitors.'},
    {t:'A new safety standard for battery chargers comes into force.',bin:'L',why:'Standards and regulations are legal factors (PESTLE adds Legal explicitly).'},
    {t:'The company could be sued if a battery overheats.',bin:'L',why:'Liability is a legal factor.'},
    {t:'Customers expect old batteries to be recycled and ask for carbon labelling.',bin:'N',why:'Environmental concerns (PESTLE separates the Environmental factor).'},
    {t:'Extreme heat waves are making summer road testing unsafe.',bin:'N',why:'A change in the physical environment/climate.'}];

  var FISH_BINS=[{k:'Me',l:'Methods',hint:'How things are done'},{k:'Ma',l:'Machinery',hint:'Equipment, the car itself'},{k:'Mt',l:'Materials',hint:'What goes in'},{k:'Pe',l:'People',hint:'Who is involved'}];
  var FISH_ITEMS=[
    {t:'Driving too fast',bin:'Me',why:'In the figure this is a method (the way the car is used).'},
    {t:'Using the wrong gears',bin:'Me',why:'A method: the way the car is driven.'},
    {t:'Too many short journeys',bin:'Me',why:'A method of use.'},
    {t:'Carburettor adjustment',bin:'Ma',why:'A fault or setting in the machinery itself.'},
    {t:'Under-inflated tyres',bin:'Ma',why:'Equipment condition. (The sub-cause "no record of tyre pressure" hangs off this line.)'},
    {t:'Wrong engine oil',bin:'Mt',why:'A material put into the machine.'},
    {t:'Wrong petrol octane',bin:'Mt',why:'The fuel is a material.'},
    {t:'Irregular maintenance',bin:'Pe',why:'A people factor: what the people involved do or fail to do. (A good one to ask "why?" about.)'},
    {t:'Bad driving habits',bin:'Pe',why:'A human factor.'}];

  var PARETO_ROWS=[
    {n:'Scratched and gouged (returned shipment)',u:500},{n:'Incorrect size despatched (returned shipment)',u:350},{n:'Out of round (unbalanced)',u:200},{n:'Polishing not good enough',u:50},{n:'Burring left on the metal',u:5}];
  var SETS={
    '4M':[{k:'a',l:'Methods'},{k:'b',l:'Machinery'},{k:'c',l:'Materials'},{k:'d',l:'People'}],
    '4P':[{k:'a',l:'Policies'},{k:'b',l:'Procedures'},{k:'c',l:'People'},{k:'d',l:'Plant'}]};

  /* ------------------------------------------------------------- the tool */
  Tools.register('swot-pest',{title:'Investigative tools: SWOT, PESTLE, Pareto, cause & effect',desc:'Learn each analysis tool, categorise a worked example, then analyse a project of your own.',
  mount:function(el,ctx){
    var S=ctx.load()||{};
    S.tab=S.tab||'swot'; S.step=S.step||{swot:'guide',pestle:'guide',pareto:'guide',fish:'guide'}; S.proj=S.proj||'';
    S.ex=S.ex||{}; S.own=S.own||{}; S.ai=S.ai||{};
    S.own.swot=S.own.swot||{S:[],W:[],O:[],T:[],act:{S:'',W:'',O:'',T:''}};
    S.own.pestle=S.own.pestle||{P:[],E:[],S:[],T:[],L:[],N:[]};
    S.own.pareto=S.own.pareto||{rows:[{n:'',c:'',v:''},{n:'',c:'',v:''},{n:'',c:'',v:''}]};
    S.own.fish=S.own.fish||{effect:'',set:'4M',env:false,cats:{a:[],b:[],c:[],d:[],e:[]}};
    S.ex.pareto=S.ex.pareto||{rank:[],q:null};
    function save(){ctx.save(S)}
    var root=h('div',{class:'tool'}),nav=h('div',{class:'sp-tabs'}),steps=h('div',{class:'sp-steps'}),body=h('div');
    el.appendChild(root);root.appendChild(nav);root.appendChild(steps);root.appendChild(body);
    var TABS=[['swot','SWOT'],['pestle','PESTLE'],['pareto','Pareto'],['fish','Cause & effect']];
    // a page can show only some of the tools (e.g. SWOT/PESTLE in 1.3, Pareto/fishbone after the 1.4 theory)
    if(ctx.opts&&ctx.opts.tabs){TABS=TABS.filter(function(t){return ctx.opts.tabs.indexOf(t[0])>=0})}
    if(!TABS.some(function(t){return t[0]===S.tab}))S.tab=TABS[0][0];
    var STEPS=[['guide','1  Learn it'],['ex','2  Worked example'],['own','3  My own']];
    var sorters={};
    function exDone(k){var s=S.ex[k];if(!s)return false;if(k==='pareto')return s.rank.length===PARETO_ROWS.length&&s.q===true;var n={swot:SWOT_ITEMS,pestle:PEST_ITEMS,fish:FISH_ITEMS}[k].length;return Object.keys(s.done||{}).length===n}
    var completed=false;
    function checkComplete(){ if(completed)return; var ks=TABS.map(function(t){return t[0]});
      if(ks.every(exDone)){completed=true;var sc=0;['swot','pestle','fish'].filter(function(k){return ks.indexOf(k)>=0}).forEach(function(k){var T={swot:SWOT_ITEMS,pestle:PEST_ITEMS,fish:FISH_ITEMS}[k];sc+=Object.keys(S.ex[k].first||{}).length/T.length});if(ks.indexOf('pareto')>=0)sc+=S.ex.pareto.firstOk?1:0.6;ctx.complete(Math.min(1,sc/ks.length))}}
    function drawNav(){nav.innerHTML='';TABS.forEach(function(t){nav.appendChild(h('button',{class:'chip'+(S.tab===t[0]?' on':''),onclick:function(){S.tab=t[0];save();draw()}},t[1]+(exDone(t[0])?' ✓':'')))});
      steps.innerHTML='';STEPS.forEach(function(s){steps.appendChild(h('button',{class:'btn sm'+(S.step[S.tab]===s[0]?' primary':' ghost'),onclick:function(){S.step[S.tab]=s[0];save();draw()}},s[1]))})}
    function draw(){drawNav();body.innerHTML='';var f={swot:swot,pestle:pestle,pareto:pareto,fish:fish}[S.tab];f(S.step[S.tab])}
    function next(to){return h('div',{style:{marginTop:'12px'}},h('button',{class:'btn primary',onclick:function(){S.step[S.tab]=to;save();draw();try{root.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}},to==='ex'?'Try the worked example':'Now do my own'))}
    function projField(){var i=h('input',{class:'input',value:S.proj,placeholder:'e.g. my club, my team at work, a house move',maxlength:'80','aria-label':'Project or group to analyse',oninput:function(){S.proj=i.value;save()}});
      return h('div',{style:{marginBottom:'12px'}},h('label',{class:'label'},'Project or group I am analysing (used in all four tools)'),i)}
    function exCard(k,cfgFn,intro,onFin){
      S.ex[k]=S.ex[k]||{};var cfg=cfgFn();var wrap=h('div'),res=h('div');
      body.appendChild(h('div',{class:'card flat'},intro));
      var so=Sorter(cfg,S.ex[k],function(){save();if(so.done())fin();});
      sorters[k]=so;body.appendChild(so.el);body.appendChild(res);
      function fin(){res.innerHTML='';
        res.appendChild(h('div',{class:'card dark'},h('div',{class:'label',style:{color:'#8f8f8f'}},'Worked example complete'),
          h('p',{style:{margin:'4px 0'}},cfg.done),
          h('div',{class:'row'},h('button',{class:'btn',onclick:function(){S.ex[k]={};save();draw()}},'Redo it'),h('button',{class:'btn',onclick:function(){S.step[k]='own';save();draw()}},'Now do my own'))));
        drawNav();checkComplete();if(onFin)onFin()}
      if(so.done())fin();
    }

    /* ---------------- SWOT ---------------- */
    function swot(step){
      if(step==='guide'){
        body.appendChild(h('div',{class:'card flat'},h('h3',null,'SWOT analysis'),
          h('p',null,'One of the commonest analytical tools. SWOT stands for strengths, weaknesses, opportunities and threats, and gives a structure for studying both the internal and the external environment of an organisation.'),
          h('div',{class:'sp-q'},
            h('div',{class:'card'},h('div',{class:'label'},'Internal environment'),h('p',{style:{margin:'4px 0 0'}},h('b',null,'Strengths and weaknesses '),'arise inside: present products or projects, customers, staff, morale, information flows.')),
            h('div',{class:'card'},h('div',{class:'label'},'External environment'),h('p',{style:{margin:'4px 0 0'}},h('b',null,'Opportunities and threats '),'arise outside: competition, economic climate, potential market, legislation.'))),
          h('p',{style:{marginTop:'12px'}},'It works for a whole organisation or any part of one - even a single product. It is best done by a team, because it is subjective: two people will rarely list the same factors. The boards then decide how to build on strengths, address weaknesses, take advantage of opportunities and avoid or reduce threats - and a project may arise as a result.')));
        body.appendChild(h('div',{class:'callout tip'},h('b',null,'Guided prompts. '),'Strengths: what do we do well that others recognise? Weaknesses: where do we fall short or lack resources? Opportunities: what changes outside could we exploit? Threats: what outside forces could harm us?'));
        body.appendChild(next('ex'));
      } else if(step==='ex'){
        exCard('swot',function(){return {bins:SWOT_BINS,items:SWOT_ITEMS,done:'Notice the test: is it about us (internal: strength/weakness) or about our environment (external: opportunity/threat)? Then is it helpful or harmful? Real SWOTs are subjective, so be ready to argue for a borderline item.',
          wrong:function(it,k){var internal=(it.bin==='S'||it.bin==='W'),kInt=(k==='S'||k==='W');return kInt!==internal?(internal?'Look again: this one comes from inside the organisation, not its environment.':'Look again: this one comes from outside the organisation.'):(it.bin==='S'||it.bin==='O'?'You have the right side (internal/external) but this item is helpful, not harmful.':'You have the right side (internal/external) but this item is harmful, not helpful.')}}},
          h('div',null,h('b',null,'Worked example. '),'A company makes computing equipment for industrial use (the course\'s Example 3). Sort its SWOT items into the four boxes. You get feedback straight away.'));
      } else {
        var O=S.own.swot;
        body.appendChild(h('div',{class:'card flat'},h('b',null,'Your own SWOT. '),'Carry out a brief SWOT for a group you belong to - where you work, a club, or a project. List at least three factors in each box (course Activity 2).'));
        body.appendChild(projField());
        var le=ListEditor([
          {k:'S',l:'Strengths',tag:'Internal · helpful',prompt:'What do we do well? What resources, skills or reputation do we have?',ph:'e.g. Experienced, loyal volunteers'},
          {k:'W',l:'Weaknesses',tag:'Internal · harmful',prompt:'Where do we fall short? What do we lack?',ph:'e.g. No budget for new equipment'},
          {k:'O',l:'Opportunities',tag:'External · helpful',prompt:'What outside changes could we use? Which PESTLE factors favour us?',ph:'e.g. Council grant available'},
          {k:'T',l:'Threats',tag:'External · harmful',prompt:'What outside forces could harm us? Competitors, laws, economy ...',ph:'e.g. New rival club opening nearby'}],O,save,{
          flag:function(k,t){var w=t.split(/\s+/).length;if(w<3)return 'Too short to act on - say more.';
            if((k==='O'||k==='T')&&/\b(we|our|us|my|i)\b/i.test(t)&&!/(customers?|competitors?|market|law|rule|government)/i.test(t))return 'Sounds internal ("we/our"). Opportunities and threats come from outside - or move it to S/W?';
            if((k==='S'||k==='W')&&/(competitor|economy|economic|legislation|regulation|government|market demand|weather|exchange rate)/i.test(t))return 'Sounds external. Strengths and weaknesses are internal - should this be an O or T?';return null},
          tips:function(d){var t=[];['S','W','O','T'].forEach(function(k){var n=d[k].length;if(n<3)t.push({S:'Strengths',W:'Weaknesses',O:'Opportunities',T:'Threats'}[k]+': '+n+' so far - aim for at least three.')});
            var all=d.S.length+d.W.length+d.O.length+d.T.length;
            if(all>=8&&(d.S.length+d.O.length===0||d.W.length+d.T.length===0))t.push('Your list is one-sided. Be realistic: look for both helpful and harmful factors.');
            if(all>=8&&!t.length)t.push('Good coverage. Now ask: which of these is the most important, and what would you do about it? Fill in the "So what?" boxes below. Remember the analysis is subjective - try it with a colleague.');
            return t}});
        body.appendChild(le.el);
        var act=h('div',{class:'card'},h('h3',null,'So what? Turn it into action'),h('p',{class:'muted',style:{fontSize:'.9rem'}},'Boards use a SWOT to decide how to build on strengths, address weaknesses, take advantage of opportunities and avoid or reduce threats. Write one idea for each.'));
        [['S','Build on a strength by ...'],['W','Address a weakness by ...'],['O','Take advantage of an opportunity by ...'],['T','Avoid or reduce a threat by ...']].forEach(function(a){
          var ta=h('textarea',{class:'textarea',style:{minHeight:'64px',marginBottom:'8px'},placeholder:a[1],'aria-label':a[1],oninput:function(){O.act[a[0]]=ta.value;save()}});ta.value=O.act[a[0]]||'';act.appendChild(ta)});
        body.appendChild(act);
        S.ai.swot=S.ai.swot||{};
        body.appendChild(AIBtn(ctx,'Ask AI to critique my SWOT',function(){var n=O.S.length+O.W.length+O.O.length+O.T.length;if(n<4)return null;
          return 'Project: '+(S.proj||'a group')+'\nStrengths: '+O.S.join('; ')+'\nWeaknesses: '+O.W.join('; ')+'\nOpportunities: '+O.O.join('; ')+'\nThreats: '+O.T.join('; ')+'\nStrengths/weaknesses must be internal; opportunities/threats external. Critique.'},S.ai.swot,save));
        body.appendChild(h('div',{style:{marginTop:'12px'}},h('button',{class:'btn ghost sm',onclick:function(){if(confirm('Clear my SWOT?')){S.own.swot={S:[],W:[],O:[],T:[],act:{S:'',W:'',O:'',T:''}};S.ai.swot={};save();draw()}}},'Reset my SWOT')));
      }
    }

    /* ---------------- PESTLE ---------------- */
    function pestle(step){
      if(step==='guide'){
        body.appendChild(h('div',{class:'card flat'},h('h3',null,'PESTLE: sorting the external factors'),
          h('p',null,'There are commonly used acronyms to help categorise the external factors (opportunities and threats) in a SWOT.'),
          h('table',{class:'tbl'},h('thead',null,h('tr',null,h('th',null,'Acronym'),h('th',null,'Stands for'))),h('tbody',null,
            [['PESTLE','Political, Economic, Social, Technological, Legal, Environmental'],['STEEP','A rearranged form which includes legal factors under political'],['PEST (or STEP)','Political, Environmental (the course\'s wording), Social, Technological']].map(function(r){return h('tr',null,h('td',null,h('b',null,r[0])),h('td',null,r[1]))}))),
          h('p',{style:{marginTop:'10px'}},'PESTLE is probably the most useful. Use it as a checklist of questions to ask about the environment: the market, the economy, technology and the legislative and regulatory climate.')));
        body.appendChild(h('div',{class:'callout tip'},h('b',null,'Prompts. '),'Political: who in government could change the rules or funding? Economic: what could change costs, prices or demand? Social: how are people\'s habits shifting? Technological: what could make us obsolete or faster? Legal: which laws or standards apply? Environmental: what are the ecological or climate effects?'));
        body.appendChild(next('ex'));
      } else if(step==='ex'){
        exCard('pestle',function(){return {bins:PEST_BINS,items:PEST_ITEMS,six:true,done:'Some items could sit in two boxes (a tariff is political and economic). That is fine: PESTLE is a checklist to make sure you have looked everywhere, not a rigid classification.',
          wrong:function(it,k){return 'Re-read the item: which of the six areas is it mainly about?'}}},
          h('div',null,h('b',null,'Worked example. '),'A small firm builds electric bicycles. Sort these external factors into the six PESTLE boxes.'));
      } else {
        var O=S.own.pestle;
        body.appendChild(h('div',{class:'card flat'},h('b',null,'PESTLE for my project. '),'List the external factors that might affect the project you chose. These feed your Opportunities and Threats in the SWOT.'));
        body.appendChild(projField());
        var le=ListEditor(PEST_BINS.map(function(b){return {k:b.k,l:b.l,tag:b.hint,prompt:{P:'Government policy, funding, politics, trade rules?',E:'Economy, prices, rates, market demand, competitors?',S:'Habits, attitudes, demographics, culture?',T:'New technologies you could use - or be overtaken by?',L:'Laws, regulation, standards, contracts, health and safety?',N:'Environmental impact, climate, waste, sustainability?'}[b.k],ph:'Add a factor ...'}}),O,save,{
          flag:function(k,t){return t.split(/\s+/).length<3?'Be specific - what exactly could happen?':null},
          tips:function(d){var t=[],e=[];PEST_BINS.forEach(function(b){if(!d[b.k].length)e.push(b.l)});
            var n=PEST_BINS.length-e.length; if(n&&e.length)t.push('Nothing yet for: '+e.join(', ')+'. Not every area matters for every project, but ask the question before you leave it blank.');
            if(!e.length)t.push('All six areas covered. Now mark which are most likely and most damaging, and move the key ones into your SWOT as opportunities or threats.');return t}});
        body.appendChild(le.el);
        S.ai.pestle=S.ai.pestle||{};
        body.appendChild(AIBtn(ctx,'Ask AI to critique my PESTLE',function(){var parts=PEST_BINS.map(function(b){return b.l+': '+O[b.k].join('; ')});if(PEST_BINS.every(function(b){return !O[b.k].length}))return null;
          return 'Project: '+(S.proj||'a group')+'\n'+parts.join('\n')+'\nCheck items are in the right PESTLE category and suggest what is missing.'},S.ai.pestle,save));
        body.appendChild(h('div',{style:{marginTop:'12px'}},h('button',{class:'btn ghost sm',onclick:function(){if(confirm('Clear my PESTLE?')){S.own.pestle={P:[],E:[],S:[],T:[],L:[],N:[]};save();draw()}}},'Reset my PESTLE')));
      }
    }

    /* ---------------- Pareto ---------------- */
    function bars(rows){ /* rows [{n,v}] */
      rows=rows.filter(function(r){return r.v>0}).sort(function(a,b){return b.v-a.v});
      var tot=rows.reduce(function(s,r){return s+r.v},0),max=rows.length?rows[0].v:1,cum=0,reached=false,few={};
      rows.forEach(function(r,i){cum+=r.v;r.cum=cum/tot*100;if(!reached)few[i]=1;if(cum/tot>=0.8)reached=true});
      var b=h('div',{class:'sp-bars',role:'img','aria-label':'Pareto chart: '+rows.map(function(r){return r.n+' '+r.v}).join(', ')}),l=h('div',{class:'sp-lbls'});
      rows.forEach(function(r,i){b.appendChild(h('div',{class:'sp-col'+(few[i]?' few':'')},h('span',null,'£'+Math.round(r.v).toLocaleString('en-GB')),h('span',{style:{color:'var(--ink2)'}},Math.round(r.cum)+'%'),h('i',{style:{height:Math.max(2,r.v/max*150)+'px'}})));
        l.appendChild(h('div',null,r.n||'(unnamed)'))});
      return {el:h('div',null,b,l,h('div',{class:'tiny muted'},'Columns: value of the problem (largest first). Small figure: cumulative % of the total. Red columns are the "vital few" that make up the first 80%.')),rows:rows,tot:tot,fewN:Object.keys(few).length};
    }
    function pareto(step){
      if(step==='guide'){
        body.appendChild(h('div',{class:'card flat'},h('h3',null,'Pareto analysis'),
          h('p',null,'Before you decide to tackle a problem you need to know how serious it is and whether it is worth tackling. Vilfredo Pareto is credited with a technique built on an almost universal truism about value and quantity: the ratio of 20:80 occurs so often that it is thought of as Pareto\'s law.'),
          h('ul',null,h('li',null,'In a warehouse, 20% of items usually represent 80% of the total stock value.'),h('li',null,'80% of quality problems are accounted for by 20% of the possible causes of failure.')),
          h('p',null,'Draw columns that represent the magnitude of the problem, or of each aspect of it, then arrange them from largest to smallest. The column height is the ',h('b',null,'value of correcting'),' the problem - so equal columns may be small but frequent difficulties, or major but rarer ones.')));
        body.appendChild(h('div',{class:'callout'},h('b',null,'Frequent but minor, or rare but major? '),'Disk-read errors that a retry fixes happen often but with little impact; a disk head crash is rare but destroys the disk. Count alone is not value: multiply how often by how much each one costs.'));
        body.appendChild(next('ex'));
      } else if(step==='ex'){
        var E=S.ex.pareto,rd=PARETO_ROWS;
        body.appendChild(h('div',{class:'card flat'},h('b',null,'Worked example (SAQ 3). '),'A factory makes 100 000 widgets a week, each worth £10. Quality control removes 5 with burring, 200 that are out of round and 50 needing repolishing. Customers also returned a shipment of 500 scratched and gouged, and 350 of the wrong size. Focus only on the value of the widgets.'));
        var stepA=h('div'),stepB=h('div'),cont=h('div');
        body.appendChild(stepA);body.appendChild(stepB);
        var msg=h('div');
        var order=E.order||(E.order=sh(rd.map(function(_,i){return i})));
        function drawA(){
          stepA.innerHTML='';
          var card=h('div',{class:'card'},h('div',{class:'label'},'Step (a) · rank by value'),h('p',null,'Tap the faulty categories in order, from the ',h('b',null,'most'),' to the ',h('b',null,'least'),' valuable. (Each widget is worth £10.)'));
          order.forEach(function(i){var done=E.rank.indexOf(i)>=0;
            card.appendChild(h('button',{class:'sp-it'+(done?' ok':''),style:{touchAction:'auto'},disabled:done?true:null,onclick:function(){tap(i)}},rd[i].u+' - '+rd[i].n,done?h('small',null,'#'+(E.rank.indexOf(i)+1)+' = £'+(rd[i].u*10).toLocaleString('en-GB')):null))});
          card.appendChild(msg);stepA.appendChild(card);
          if(E.rank.length===rd.length){
            var b=bars(rd.map(function(r){return {n:r.n.replace(/ \(.*\)/,''),v:r.u*10}}));
            stepA.appendChild(h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'6px'}},'Your Pareto chart'),b.el,h('p',{style:{marginTop:'8px'}},'The top two categories account for '+Math.round(b.rows[1].cum)+'% of the total value of faulty widgets.')));
            drawB();}
        }
        function tap(i){
          var expect=rd.map(function(_,k){return k}).sort(function(a,b){return rd[b].u-rd[a].u})[E.rank.length];
          if(i===expect){E.rank.push(i);msg.innerHTML='';if(E.wrong===undefined)E.wrong=false;save();drawA()}
          else{E.wrong=true;msg.innerHTML='';msg.appendChild(h('div',{class:'sp-fb bad'},'Not the next one. Remember value = number of widgets × £10. Which remaining category has the greatest number?'))}
        }
        function drawB(){
          stepB.innerHTML='';
          var c=h('div',{class:'card'},h('div',{class:'label'},'Step (b) · decide'),h('p',null,'Where does the analysis suggest you could achieve the greatest improvement in quality?'));
          var opts=['Scratching and gouging','Burring (it is the easiest to fix)','Polishing','Out of round'];
          opts.forEach(function(o,i){var chosen=E.q!==null&&E.pick===i;
            c.appendChild(h('button',{class:'btn ghost',style:{display:'block',width:'100%',textAlign:'left',marginBottom:'8px',borderColor:chosen?(i===0?'var(--green)':'var(--red)'):''},disabled:E.q===true?true:null,onclick:function(){E.pick=i;if(i===0){E.q=true;if(E.firstOk===undefined)E.firstOk=!E.wrong&&!E.missed;}else{E.q=false;E.missed=true}save();drawB();if(E.q){checkComplete();drawNav()}}},o))});
          if(E.q===false)c.appendChild(h('div',{class:'sp-fb bad'},'Not quite. Pareto analysis points to the biggest column - the problem that costs the most. A tiny problem can be easy to fix but will not change quality much.'));
          if(E.q===true){c.appendChild(h('div',{class:'sp-fb good'},h('b',null,'Yes: scratching and gouging '),'(£5 000), then incorrect size despatched (£3 500). Together over three-quarters of the value.'));
            c.appendChild(h('div',{class:'callout'},h('b',null,'A real analysis would differ. '),'Putting right the wrong-size shipment may only cost taking 350 back into stock and despatching the right ones. The 200 out-of-round widgets must be scrapped and replaced at twice their cost. So the value of correcting a problem is not always its face value: check what each fix really costs.'));
            c.appendChild(h('button',{class:'btn primary',onclick:function(){S.step.pareto='own';save();draw()}},'Now do my own'));}
          stepB.appendChild(c);
        }
        drawA();
      } else {
        var O=S.own.pareto,chartHost=h('div'),note=h('div'),rowsEl=h('div');
        body.appendChild(h('div',{class:'card flat'},h('b',null,'Your own Pareto. '),'Pick a problem you want to reduce (late deliveries, complaints, defects, wasted time). List the causes or categories, how often each happens and what each one costs you (money, minutes, anything consistent). Value = how often × cost each.'));
        body.appendChild(projField());
        function val(r){var c=parseFloat(r.c),v=parseFloat(r.v);return (c>=0&&v>=0)?c*v:0}
        function upd(){
          var rs=O.rows.map(function(r){return {n:r.n.trim(),v:val(r)}}).filter(function(r){return r.v>0});
          chartHost.innerHTML='';note.innerHTML='';
          if(rs.length<2){chartHost.appendChild(h('div',{class:'muted'},'Enter at least two categories with numbers to see the chart.'));return}
          var b=bars(rs);chartHost.appendChild(b.el);
          var few=b.rows.slice(0,b.fewN).map(function(r){return r.n||'(unnamed)'});
          var t=['The first '+b.fewN+' of '+b.rows.length+' categories ('+few.join(', ')+') account for '+Math.round(b.rows[b.fewN-1].cum)+'% of the total.'];
          if(b.rows.length>=4&&b.fewN>=b.rows.length-1)t.push('The value is spread fairly evenly, so there is no clear "vital few". Check you have split the problem in a useful way, or look for a different measure.');
          else t.push('Start with '+b.rows[0].n+'. Then ask: what does it really cost to fix, and what is the next-level cause? (Move on to a cause and effect diagram.)');
          if(O.rows.filter(function(r){return r.n.trim()&&!(val(r)>0)}).length)t.push('Some rows have a name but no numbers yet.');
          note.appendChild(h('div',{class:'sp-fb'},h('ul',{style:{margin:0,paddingLeft:'20px'}},t.map(function(x){return h('li',null,x)}))));
        }
        function drawRows(){
          rowsEl.innerHTML='';
          rowsEl.appendChild(h('div',{class:'sp-rowp'},h('span',{class:'label'},'Category'),h('span',{class:'label'},'How often'),h('span',{class:'label'},'Cost each'),h('span')));
          O.rows.forEach(function(r,i){
            var n=h('input',{class:'input','aria-label':'Category '+(i+1),placeholder:'Cause',value:r.n,maxlength:'60',oninput:function(){r.n=n.value;save();upd()}});
            var c=h('input',{class:'input','aria-label':'How often',inputmode:'decimal',placeholder:'0',value:r.c,oninput:function(){r.c=c.value;save();upd()}});
            var v=h('input',{class:'input','aria-label':'Cost each',inputmode:'decimal',placeholder:'0',value:r.v,oninput:function(){r.v=v.value;save();upd()}});
            rowsEl.appendChild(h('div',{class:'sp-rowp'},n,c,v,h('button',{class:'sp-x','aria-label':'Remove row',onclick:function(){if(O.rows.length>2){O.rows.splice(i,1);save();drawRows();upd()}}},'×')))});
          rowsEl.appendChild(h('button',{class:'btn ghost sm',onclick:function(){if(O.rows.length<12){O.rows.push({n:'',c:'',v:''});save();drawRows();var ins=rowsEl.querySelectorAll('input[aria-label^="Category"]');ins[ins.length-1].focus()}}},'+ Add category'));
        }
        body.appendChild(h('div',{class:'card'},rowsEl));
        body.appendChild(h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'6px'}},'My Pareto chart'),chartHost,note));
        S.ai.pareto=S.ai.pareto||{};
        body.appendChild(AIBtn(ctx,'Ask AI to critique my Pareto',function(){var rs=O.rows.filter(function(r){return r.n.trim()&&val(r)>0});if(rs.length<3)return null;
          return 'Problem area: '+(S.proj||'unspecified')+'\nCategories (value = how often x cost each):\n'+rs.map(function(r){return r.n+': '+r.c+' x '+r.v+' = '+val(r)}).join('\n')+'\nIs this a sensible Pareto analysis? Where should effort go first and what is missing?'},S.ai.pareto,save));
        body.appendChild(h('div',{style:{marginTop:'12px'}},h('button',{class:'btn ghost sm',onclick:function(){if(confirm('Clear my Pareto?')){S.own.pareto={rows:[{n:'',c:'',v:''},{n:'',c:'',v:''},{n:'',c:'',v:''}]};S.ai.pareto={};save();draw()}}},'Reset my Pareto')));
        drawRows();upd();
      }
    }

    /* ---------------- Cause & effect ---------------- */
    function fish(step){
      if(step==='guide'){
        body.appendChild(h('div',{class:'card flat'},h('h3',null,'Cause and effect (Ishikawa / fishbone) diagrams'),
          h('p',null,'Once Pareto analysis has shown which problems merit further study, study the symptoms, develop theories of the causes, and test them. The fishbone diagram identifies, sorts and displays the possible causes of a specific problem. It shows the relationship between an outcome and all the factors that influence it.'),
          h('ol',null,h('li',null,h('b',null,'Define the effect '),'(the occurrence, at the fish\'s head).'),h('li',null,h('b',null,'Choose categories '),'for the causes: methods, machinery, materials, people - or policies, procedures, people, plant. Sometimes a fifth, environment.'),
            h('li',null,h('b',null,'Branch out: '),'major causes join the main arrow; sub-causes join those; sub-sub-causes join those. Ask "why?" repeatedly to reach root causes.')),
          h('img',{src:'img/pm_p23_6.jpg',alt:'Fishbone diagram for poor fuel consumption: methods, machinery, materials and people branches',style:{width:'100%',maxWidth:'520px',borderRadius:'12px',display:'block',margin:'8px auto'}}),
          h('div',{class:'tiny muted',style:{textAlign:'center'}},'Figure 3: a cause and effect diagram for poor fuel consumption in a petrol-driven car')));
        body.appendChild(h('div',{class:'callout tip'},h('b',null,'Reading the diagram. '),'Busy branches with lots of detail may need further investigation. Causes that are repeated in more than one branch may be the root causes to act on. For each cause ask what could be measured, so you can quantify the effect of changes.'));
        body.appendChild(next('ex'));
      } else if(step==='ex'){
        exCard('fish',function(){return {bins:FISH_BINS,items:FISH_ITEMS,done:'You have rebuilt the first level of Figure 3. Now the important step - go deeper by asking "why?" (below).',
          wrong:function(it,k){return 'Think about whether this is about how things are done, the equipment, what goes in, or the people.'}}},
          h('div',null,h('b',null,'Worked example. '),'Effect: ',h('b',null,'poor fuel consumption'),' in a petrol car. Put each possible cause on the right branch.'),showWhy);
        var whyHost;
        function showWhy(){ if(whyHost)return; whyHost=true;
          var E=S.ex.fishWhy=S.ex.fishWhy||{a:''};
          var ta=h('textarea',{class:'textarea',placeholder:'e.g. The driver did not know how often the car needs servicing ...',value:E.a,oninput:function(){E.a=ta.value;save()}});ta.value=E.a;
          var out=h('div');
          body.appendChild(h('div',{class:'card'},h('div',{class:'label'},'Ask "why?" (course Activity 3)'),h('p',null,'Irregular maintenance is a major cause, but you cannot act on it as it stands. Give one or two reasons why maintenance might be irregular - questions that reveal more detail.'),ta,
            h('div',{style:{marginTop:'10px'}},h('button',{class:'btn primary',onclick:function(){
              var t=ta.value.trim();out.innerHTML='';
              if(t.split(/\s+/).length<4){out.appendChild(h('div',{class:'sp-fb bad'},'Write a fuller answer - at least a short sentence.'));return}
              var hit=/(aware|know|frequen|interval|remind|money|afford|cost|time|busy|forg|garage|book|schedul|record|service|cheap)/i.test(t);
              out.appendChild(h('div',{class:'sp-fb '+(hit?'good':'')},hit?'Good - you dug into the reasons. ':'Try to point at something you could investigate. ',h('b',null,'Model answer: '),'ask "why was maintenance so irregular?". The driver may not know how often the car has to be serviced; another driver might know but not always have the money to pay. Each answer is a lower-level cause you can measure and act on (e.g. a service reminder, a savings plan).'))}},'Compare with the model'),out)));
        }
      } else {
        var O=S.own.fish,host=h('div');
        body.appendChild(h('div',{class:'card flat'},h('b',null,'Your own cause and effect diagram. '),'Take the biggest problem from your Pareto (or any problem you want to understand). State it as a specific effect, then list causes under each category and ask "why?" to add sub-causes.'));
        body.appendChild(projField());
        function cats(){var c=SETS[O.set].slice();if(O.env)c.push({k:'e',l:'Environment'});return c}
        function draw2(focus){
          host.innerHTML='';
          var eff=h('input',{class:'input',value:O.effect,placeholder:'e.g. Customers wait too long for deliveries',maxlength:'120','aria-label':'Effect (the problem)',oninput:function(){O.effect=eff.value;save()}});
          host.appendChild(h('div',{class:'card'},h('label',{class:'label'},'The effect (the head of the fish)'),eff,
            h('div',{class:'row',style:{marginTop:'10px'}},
              h('span',{class:'label'},'Categories'),
              h('button',{class:'chip'+(O.set==='4M'?' on':''),onclick:function(){O.set='4M';save();draw2()}},'Methods, Machinery, Materials, People'),
              h('button',{class:'chip'+(O.set==='4P'?' on':''),onclick:function(){O.set='4P';save();draw2()}},'Policies, Procedures, People, Plant'),
              h('button',{class:'chip'+(O.env?' on':''),onclick:function(){O.env=!O.env;save();draw2()}},'+ Environment'))));
          var grid=h('div',{class:'sp-q'});
          cats().forEach(function(c){
            O.cats[c.k]=O.cats[c.k]||[];
            var card=h('div',{class:'card flat'},h('h3',null,c.l+' ('+O.cats[c.k].length+')'));
            O.cats[c.k].forEach(function(cz,ci){
              var cause=h('div',{class:'sp-cause'},h('div',{class:'row',style:{flexWrap:'nowrap'}},h('b',{style:{flex:1,minWidth:0,overflowWrap:'anywhere'}},cz.t),h('button',{class:'sp-x','aria-label':'Remove cause',onclick:function(){O.cats[c.k].splice(ci,1);save();draw2()}},'×')));
              (cz.sub||[]).forEach(function(s,si){cause.appendChild(h('div',{class:'sp-sub'},h('div',{class:'row',style:{flexWrap:'nowrap',gap:'4px'}},h('span',{style:{flex:1,minWidth:0,overflowWrap:'anywhere'}},'because: '+s),h('button',{class:'sp-x','aria-label':'Remove sub-cause',onclick:function(){cz.sub.splice(si,1);save();draw2()}},'×'))))});
              var sub=h('input',{class:'input','data-f':c.k+ci,placeholder:'Why? (a deeper cause)',maxlength:'120','aria-label':'Why does '+cz.t+' happen?'});
              function addSub(){var v=sub.value.trim();if(!v)return;cz.sub=cz.sub||[];cz.sub.push(v);save();draw2(c.k+ci)}
              sub.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();addSub()}});
              cause.appendChild(h('div',{class:'sp-tb'},sub,h('button',{class:'btn sm',onclick:addSub},'Why?')));
              var m=h('input',{class:'input',placeholder:'How could you measure it?',maxlength:'100',value:cz.m||'','aria-label':'How could you measure '+cz.t,style:{marginTop:'6px'},oninput:function(){cz.m=m.value;save()}});cause.appendChild(m);
              if(!(cz.sub&&cz.sub.length))cause.appendChild(h('em',{class:'sp-warn'},'No deeper cause yet - ask "why?" at least once.'));
              card.appendChild(cause)});
            var inp=h('input',{class:'input','data-f':c.k+'new',placeholder:'Add a cause ...',maxlength:'100','aria-label':'Add cause to '+c.l});
            function addC(){var v=inp.value.trim();if(!v)return;O.cats[c.k].push({t:v,sub:[],m:''});save();draw2(c.k+'new')}
            inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();addC()}});
            card.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap'}},inp,h('button',{class:'btn primary',style:{flex:'none'},onclick:addC},'Add')));
            grid.appendChild(card)});
          host.appendChild(grid);
          /* analysis */
          var all=[],words={};
          cats().forEach(function(c){(O.cats[c.k]||[]).forEach(function(cz){all.push({c:c,cz:cz});[cz.t].concat(cz.sub||[]).forEach(function(s){s.toLowerCase().replace(/[^a-z\s]/g,'').split(/\s+/).filter(function(w){return w.length>4}).forEach(function(w){(words[w]=words[w]||{})[c.k]=1})})})});
          var tips=[];
          if(!O.effect.trim())tips.push('Write the effect first - state the problem specifically.');
          else if(O.effect.trim().split(/\s+/).length<3)tips.push('The effect is very short. A specific, measurable problem gives a better diagram.');
          var shallow=all.filter(function(a){return !(a.cz.sub&&a.cz.sub.length)}).length;
          if(all.length&&shallow)tips.push(shallow+' cause(s) have no deeper cause. Ask "why?" until you reach something you could act on.');
          var empty=cats().filter(function(c){return !(O.cats[c.k]||[]).length}).map(function(c){return c.l});
          if(all.length>=3&&empty.length)tips.push('No causes under: '+empty.join(', ')+'. Did you really look there?');
          var busy=cats().map(function(c){var n=0;(O.cats[c.k]||[]).forEach(function(z){n+=1+(z.sub||[]).length});return {l:c.l,n:n}}).sort(function(a,b){return b.n-a.n});
          if(all.length>=4&&busy[0].n>=Math.max(4,busy[1].n+2))tips.push('The "'+busy[0].l+'" branch is the busiest - that may be where further investigation is needed.');
          var rep=Object.keys(words).filter(function(w){return Object.keys(words[w]).length>1});
          if(rep.length)tips.push('The word(s) "'+rep.slice(0,4).join('", "')+'" appear in more than one branch. Causes repeated across branches may be the root causes you should act on.');
          var unm=all.filter(function(a){return !(a.cz.m||'').trim()}).length;
          if(all.length&&unm===0)tips.push('Every cause has something to measure - good: you can now quantify the effect of the changes your project makes.');
          else if(all.length>=3)tips.push(unm+' cause(s) have no measure yet. Assess each for what might be measured.');
          if(tips.length)host.appendChild(h('div',{class:'sp-fb',style:{marginTop:'12px'}},h('b',null,'Reading your diagram'),h('ul',{style:{margin:'6px 0 0',paddingLeft:'20px'}},tips.map(function(x){return h('li',null,x)}))));
          if(focus){var q=host.querySelector('input[data-f="'+focus+'"]');if(q)try{q.focus({preventScroll:true})}catch(e){q.focus()}}
        }
        body.appendChild(host);draw2();
        S.ai.fish=S.ai.fish||{};
        body.appendChild(AIBtn(ctx,'Ask AI to critique my diagram',function(){var lines=[];cats().forEach(function(c){(O.cats[c.k]||[]).forEach(function(z){lines.push(c.l+': '+z.t+((z.sub&&z.sub.length)?' <- because '+z.sub.join(', ')+'.':''))})});if(!O.effect.trim()||lines.length<3)return null;
          return 'Cause and effect (fishbone) diagram.\nEffect: '+O.effect+'\n'+lines.join('\n')+'\nAre causes in sensible categories? Which look like root causes? What is missing?'},S.ai.fish,save));
        body.appendChild(h('div',{style:{marginTop:'12px'}},h('button',{class:'btn ghost sm',onclick:function(){if(confirm('Clear my diagram?')){S.own.fish={effect:'',set:'4M',env:false,cats:{a:[],b:[],c:[],d:[],e:[]}};S.ai.fish={};save();draw()}}},'Reset my diagram')));
      }
    }
    draw();
  }});
})();

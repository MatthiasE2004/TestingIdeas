/* method-picker: choose a development process (PM course 5.2) by weighing project factors */
(function(){
  var h=H.h;
  var F=[
    {k:'clarity',n:'Requirements clarity',lo:'Vague',hi:'Crystal clear'},
    {k:'risk',n:'Risk (technical / requirements)',lo:'Low',hi:'High'},
    {k:'involve',n:'User involvement',lo:'Hard to reach',hi:'Close and available'},
    {k:'deadline',n:'Deadline pressure',lo:'Relaxed',hi:'Race to market'},
    {k:'change',n:'Likelihood of change',lo:'Stable',hi:'Changing often'},
    {k:'formal',n:'Formality required',lo:'Informal',hi:'Strict / regulated'}
  ];
  /* ideal profile per method (1-5) and what each method assumes about each factor (from 5.2) */
  var M=[
    {id:'waterfall',name:'Waterfall',tag:'The classic waterfall model: analysis, design, implementation, testing and maintenance in a single sequence.',
     p:{clarity:5,risk:1,involve:2,deadline:2,change:1,formal:5},
     a:{clarity:'Assumes each activity can be completed completely and correctly, so requirements must be understood up front.',
        risk:'Errors found in the working version could be disastrous, so it suits low-risk, well-understood work.',
        involve:'Users see a working system only late in testing, so little ongoing involvement is needed (or possible).',
        deadline:'A working version is not available until late, so it only suits customers who are patient.',
        change:'Change late in the sequence is costly; works best when requirements will not shift.',
        formal:'A formal, deliberate process with a trail of evidence (as in Example 9, PRINCE-style regulation).'},
     cons:'A working version is not available until late in testing; errors detected then could be disastrous. Real projects rarely follow a purely sequential life cycle.'},
    {id:'phased',name:'Phased development',tag:'A series of closely linked mini-projects; each phase is implemented and reviewed by users, and the feedback shapes the next.',
     p:{clarity:3,risk:5,involve:4,deadline:2,change:3,formal:3},
     a:{clarity:'Requirements for the next phase are shaped by user review, so they need not be fully known at the start.',
        risk:'Suitable for projects with a high degree of technological risk.',
        involve:'Users review the result of each mini-project, so they must be available at each phase end.',
        deadline:'Several stages of build and review take time; it is not a race-to-market approach.',
        change:'Feedback after each phase can result in beneficial changes to the end product.',
        formal:'Moderate formality; each phase is a managed mini-project with a review.'},
     cons:'Several stages of review take time; resources and coordination are needed across the phases.'},
    {id:'prototyping',name:'Prototyping',tag:'A form of phased development: a model of the system is built quickly and shown to users for rapid feedback; it may be thrown away.',
     p:{clarity:1,risk:4,involve:5,deadline:3,change:4,formal:2},
     a:{clarity:'Ideal when users cannot express requirements: they can try a crude model and reveal deficiencies.',
        risk:'Reduces requirements risk by testing a model before committing to the real build.',
        involve:'Depends on rapid, frequent feedback from users.',
        deadline:'Costs and schedules are far more difficult to estimate, so tight fixed deadlines are risky.',
        change:'Reserves the right to throw away, build on or fine-tune a model, so change is expected.',
        formal:'Early models are experimental and relatively informal; harder to control.'},
     cons:'It is far more difficult to estimate costs and schedules (experimental early prototypes) and more difficult to control.'},
    {id:'incremental',name:'Incremental development with timeboxing',tag:'Partition the system into increments, delivered sequentially or in parallel; timeboxing gives each increment a fixed time, deadline and budget.',
     p:{clarity:3,risk:3,involve:3,deadline:4,change:3,formal:3},
     a:{clarity:'Requirements must be partitionable into independent or semi-independent chunks.',
        risk:'Smaller, more manageable pieces limit complexity, but integration and interfaces need managing.',
        involve:'Increments are developed in an order of priority agreed with the users.',
        deadline:'Each timebox has its own deadline and budget; a deliverable may be modified to meet the deadline.',
        change:'Moderate change can be absorbed by re-prioritising the next increment.',
        formal:'Some extra management is needed for dependencies and integration.'},
     cons:'It is not always possible to partition requirements into independent chunks; extra activities are needed to manage dependencies, interfaces and integration.'},
    {id:'agile',name:'Agile processes',tag:'Light on bureaucracy: early and continuous delivery of working software, frequent delivery (weeks to months), regular reflection and adjustment.',
     p:{clarity:2,risk:3,involve:5,deadline:5,change:5,formal:1},
     a:{clarity:'Works when requirements are not fully known and emerge as working software is delivered.',
        risk:'Frequent working software is the primary measure of progress, exposing problems early.',
        involve:'Highest priority is to satisfy the customer through early and continuous delivery, so the customer must be engaged.',
        deadline:'Do the simplest things that could possibly work (as in Example 10) and deliver frequently.',
        change:'Agile teams do not plan in the conventional sense; they adjust as they reflect regularly.',
        formal:'Deliberately avoids heavy documents and record keeping; best with small teams (up to about eight) communicating informally.'},
     cons:'Does not plan in the conventional sense and gives little prescription of what to do when; small teams communicate informally, which does not scale to large projects on its own.'}
  ];
  function byId(id){return M.filter(function(m){return m.id===id})[0]}

  var SC=[
    {id:'s1',title:'New legislation system',brief:'The government has passed legislation and needs a software system to support the new administrative functions. Developers compete for the contract and must show their process conforms to government-approved standards (such as PRINCE) and use an approved analysis and design method. The legislation’s rules are fixed in the statute.',
     x:{clarity:5,risk:2,involve:2,deadline:2,change:1,formal:5},best:'waterfall',alt:'phased',
     why:'Requirements are fixed by the legislation and formality is mandatory. Each aspect of the legislation must be shown to be incorporated into the final system, which is a slow and deliberate course of action (Example 9). The waterfall model’s single, documented sequence gives that trail. Watch out: you still need configuration management to protect the integrity of deliverables.',
     trap:'Agile would be tempting for its speed, but the process must be demonstrably formal.'},
    {id:'s2',title:'Beat the competitor to market',brief:'A financial firm sees a chance to offer a new service. Being first earns the most profit; miss the window and a competitor takes the spoils. The software has a narrow scope and a short expected lifetime. The team is two developers.',
     x:{clarity:2,risk:3,involve:4,deadline:5,change:3,formal:1},best:'agile',alt:'incremental',
     why:'Time-to-market is critical (Example 10), so every aspect of the process is tuned for speed: do the simplest things that could work, minimise communication, keep procedures minimal, still test and keep some documentation. A tiny team and narrow scope make informal agile working realistic. Incremental timeboxing is a close second because the deadline is fixed.',
     trap:'A slow, deliberate process would miss the market window, and then it does not matter how much software has been developed.'},
    {id:'s3',title:'Automating insurance claims',brief:'A large insurance company wants to automate claims handling. Earlier attempts to automate major functions caused costly problems, few resources are available, the claims department must keep working normally, and staff should learn the system bit by bit.',
     x:{clarity:3,risk:5,involve:4,deadline:2,change:3,formal:3},best:'phased',alt:'incremental',
     why:'High technological risk, scarce resources and the need to minimise disruption are the textbook reasons for phased development. Each phase (claim form, adjuster review, approval and cheques, letters) is a mini-project reviewed by users and their feedback shapes the next. Training also happens phase by phase.',
     trap:'Waterfall would deliver everything at once, which is exactly what failed before and would disrupt the department.'},
    {id:'s4',title:'Holiday booking app, unclear screens',brief:'A start-up wants an app to book holidays. The founders have strong opinions but cannot say what the screens should do. Potential users are easy to reach and happy to try things out. Early crude versions would reveal a lot.',
     x:{clarity:1,risk:4,involve:5,deadline:3,change:4,formal:2},best:'prototyping',alt:'agile',
     why:'The problem is requirements: users find it hard to express them and the software is intangible, so there is nothing to try out. A quick prototype lets users reveal deficiencies, and you can throw away, build on or fine-tune it. Prototyping reduces requirements risk, which is where most project risk lies. Expect harder cost and schedule estimates.',
     trap:'Writing a full requirements document first (waterfall) hides the very problems prototyping would expose: requirements definition causes 38% of faults.'},
    {id:'s5',title:'University administration system',brief:'A university wants one system for admissions, timetabling, fees and records. These areas can be separated and ordered by priority agreed with users, with fixed release dates and a fixed budget per release. A single developer will manage interfaces between the parts.',
     x:{clarity:4,risk:3,involve:3,deadline:4,change:3,formal:3},best:'incremental',alt:'phased',
     why:'The requirements can be partitioned into semi-independent chunks (increments), developed sequentially in the priority users agree. Giving each increment its own deadline and budget is timeboxing. Someone must manage dependencies and interfaces and integrate the pieces, as the text says.',
     trap:'Not all requirements partition cleanly; if dependencies dominate, extra management activities are needed.'},
    {id:'s6',title:'Personal finance app, small team',brief:'Five people are building a personal-finance app with a regular user group. Priorities change as users react, nobody wants heavy documents, and there is no external regulator. The team wants to ship working versions every few weeks.',
     x:{clarity:2,risk:3,involve:5,deadline:3,change:5,formal:1},best:'agile',alt:'prototyping',
     why:'Frequent change, close users, a small team and little formality match agile principles: deliver working software frequently (weeks to months), make working software the main measure of progress, and reflect regularly to adjust. Teams of up to about eight can communicate informally.',
     trap:'Prototyping is close, but agile keeps delivering real working versions rather than throw-away models.'}
  ];

  function fit(prof,m,w){
    var tot=0,sum=0; F.forEach(function(f){var wt=(w&&w[f.k])||1; tot+=wt; sum+=wt*Math.abs(prof[f.k]-m.p[f.k])});
    return Math.round(100*(1-sum/(4*tot)));
  }
  function rank(prof){return M.map(function(m){return {m:m,s:fit(prof,m)}}).sort(function(a,b){return b.s-a.s})}
  function reasons(prof,m){
    var good=[],bad=[];
    F.forEach(function(f){var d=Math.abs(prof[f.k]-m.p[f.k]); (d<=1?good:bad).push({f:f,d:d,t:m.a[f.k]})});
    bad.sort(function(a,b){return b.d-a.d}); return {good:good,bad:bad};
  }
  function lvl(v){return ['','very low','low','medium','high','very high'][v]}

  var CSS='.mpk-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}'+
  '.mpk-sl{margin:0 0 14px}.mpk-sl .top{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.mpk-sl .val{font-family:var(--mono);font-size:.8rem}'+
  '.mpk-sl input[type=range]{width:100%;height:44px;accent-color:var(--ink);margin:0}'+
  '.mpk-sl .ends{display:flex;justify-content:space-between;font-size:.74rem;color:var(--ink2);margin-top:-8px}'+
  '.mpk-meths{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0 14px}'+
  '.mpk-m{border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-md);padding:10px 12px;text-align:left;cursor:pointer;min-height:56px;font-size:.92rem}'+
  '.mpk-m.on{border-color:var(--ink);background:var(--ink);color:var(--bg)}'+
  '.mpk-m.ok{border-color:var(--green);background:var(--surface);color:var(--ink)}.mpk-m.no{border-color:var(--red);background:var(--surface);color:var(--ink)}'+
  '.mpk-dots{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}'+
  '.mpk-fit{margin:0 0 10px}.mpk-fit .r{display:flex;justify-content:space-between;font-size:.92rem;margin-bottom:4px}'+
  '.mpk-cmp{display:grid;grid-template-columns:1fr auto auto;gap:4px 12px;align-items:center;font-size:.88rem}'+
  '.mpk-pip{font-family:var(--mono);letter-spacing:.1em}'+
  '.mpk-rs{margin:6px 0 0;padding:0;list-style:none}.mpk-rs li{margin:0 0 8px;font-size:.92rem;padding-left:20px;position:relative}.mpk-rs li:before{content:"";position:absolute;left:2px;top:.5em;width:9px;height:9px;border-radius:50%;background:var(--green)}.mpk-rs li.x:before{background:var(--red)}';

  Tools.register('method-picker',{title:'Method picker',desc:'Weigh project factors and choose a development process; build your own project profile.',
  mount:function(el,ctx){
    if(!document.getElementById('mpk-style')){var st=document.createElement('style');st.id='mpk-style';st.textContent=CSS;document.head.appendChild(st)}
    var sv=ctx.load()||{};
    var S={mode:sv.mode||'sc',i:sv.i||0,r:sv.r||{},prof:sv.prof||{clarity:3,risk:3,involve:3,deadline:3,change:3,formal:3},name:sv.name||'',pr:!!sv.pr};
    function save(){ctx.save(S)}
    function res(i){ if(!S.r[SC[i].id])S.r[SC[i].id]={v:{clarity:3,risk:3,involve:3,deadline:3,change:3,formal:3},pick:null,done:false,touched:false}; return S.r[SC[i].id]; }
    function slider(f,val,onchg,disabled){
      var out=h('span',{class:'val'},val+' / 5 · '+lvl(val));
      var inp=h('input',{type:'range',min:1,max:5,step:1,value:val,'aria-label':f.n,disabled:disabled?true:null,oninput:function(){out.textContent=this.value+' / 5 · '+lvl(+this.value);onchg(+this.value)}});
      return h('div',{class:'mpk-sl'},h('div',{class:'top'},h('span',null,f.n),out),inp,h('div',{class:'ends'},h('span',null,f.lo),h('span',null,f.hi)));
    }
    function fitBars(prof){
      var box=h('div');
      rank(prof).forEach(function(x,k){box.appendChild(h('div',{class:'mpk-fit'},h('div',{class:'r'},h('span',{style:{fontWeight:k===0?'500':'400'}},x.m.name),h('span',{class:'tiny muted'},x.s+'% fit')),h('div',{class:'bar'+(k===0?'':'')},h('i',{style:{width:x.s+'%'}}))))});
      return box;
    }

    function scView(){
      var i=S.i, sc=SC[i], r=res(i), box=h('div');
      box.appendChild(h('div',{class:'mpk-dots'},SC.map(function(s,k){var rr=S.r[s.id]; return h('button',{class:'chip'+(k===i?' on':''),onclick:function(){S.i=k;save();render()}},(rr&&rr.done?(rr.pick===s.best?'✓ ':'• '):'')+(k+1))})));
      box.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Scenario '+(i+1)+' of '+SC.length),h('h3',null,sc.title),h('p',{style:{margin:0}},sc.brief)));
      var c1=h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'8px'}},'1. Read the situation: rate each factor'));
      F.forEach(function(f){c1.appendChild(slider(f,r.v[f.k],function(v){r.v[f.k]=v;r.touched=true;save();updLive()},r.done))});
      var live=h('div');
      function updLive(){live.innerHTML='';var top=rank(r.v)[0];live.appendChild(h('p',{class:'tiny muted',style:{margin:0}},'Your ratings currently point towards: ',h('b',null,top.m.name),' ('+top.s+'% fit). Use this as a hint, then make your own call.'))}
      updLive(); c1.appendChild(live); box.appendChild(c1);
      var c2=h('div',{class:'card'},h('div',{class:'label'},'2. Which approach is best?'));
      var grid=h('div',{class:'mpk-meths'});
      M.forEach(function(m){
        var cls='mpk-m'+(r.pick===m.id?' on':''); if(r.done){ if(m.id===sc.best)cls='mpk-m ok'; else if(m.id===r.pick)cls='mpk-m no'; }
        grid.appendChild(h('button',{class:cls,disabled:r.done?true:null,'aria-pressed':String(r.pick===m.id),onclick:function(){r.pick=m.id;save();render()}},m.name));
      });
      c2.appendChild(grid);
      if(r.pick&&!r.done)c2.appendChild(h('p',{class:'tiny muted'},byId(r.pick).tag));
      c2.appendChild(h('div',{class:'row'},
        h('button',{class:'btn primary',disabled:(!r.pick||r.done)?true:null,onclick:function(){r.done=true;save();checkAll();render()}},'Check my choice'),
        h('button',{class:'btn ghost',onclick:function(){delete S.r[sc.id];save();render()}},'Reset')));
      box.appendChild(c2);
      if(r.done) box.appendChild(reveal(sc,r));
      if(r.done&&i<SC.length-1)box.appendChild(h('div',{class:'row'},h('button',{class:'btn primary',onclick:function(){S.i=i+1;save();render()}},'Next scenario')));
      if(SC.every(function(s){return S.r[s.id]&&S.r[s.id].done})) box.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'All scenarios done'),h('p',{style:{margin:0}},'Score: '+score()+' of '+(SC.length*2)+'. Now try the Project profile tab with a project of your own.')));
      return box;
    }
    function score(){var t=0;SC.forEach(function(s){var r=S.r[s.id];if(r&&r.done)t+=(r.pick===s.best?2:(r.pick===s.alt?1:0))});return t}
    function checkAll(){ if(SC.every(function(s){return S.r[s.id]&&S.r[s.id].done})) ctx.complete(score()/(SC.length*2)); }
    function reveal(sc,r){
      var b=h('div',{class:'card'}); var ok=r.pick===sc.best, near=r.pick===sc.alt;
      b.appendChild(h('div',{class:'label'},'Expert reasoning'));
      b.appendChild(h('h3',{class:ok?'ok':(near?'':'bad')},ok?'Best fit: '+byId(sc.best).name+' – you got it.':(near?'Reasonable – but the best fit is '+byId(sc.best).name+'.':'Not the best fit. The expert choice is '+byId(sc.best).name+'.')));
      b.appendChild(h('p',null,sc.why));
      b.appendChild(h('p',{class:'muted'},h('b',null,'Trap: '),sc.trap+(near?'':' Runner-up: '+byId(sc.alt).name+'.')));
      var g=h('div',{class:'mpk-cmp'},h('span',{class:'label'},'Factor'),h('span',{class:'label'},'You'),h('span',{class:'label'},'Expert'));
      F.forEach(function(f){var d=Math.abs(r.v[f.k]-sc.x[f.k]); g.appendChild(h('span',null,f.n)); g.appendChild(h('span',{class:'mpk-pip'},String(r.v[f.k]))); g.appendChild(h('span',{class:'mpk-pip '+(d>1?'bad':'')},String(sc.x[f.k])))});
      b.appendChild(g);
      b.appendChild(h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},'Factors where you differ by more than 1 are marked red. Misreading the situation is often how the wrong method gets chosen.'));
      b.appendChild(h('div',{class:'label',style:{margin:'14px 0 6px'}},'Profile fit with the expert ratings'));
      b.appendChild(fitBars(sc.x));
      b.appendChild(h('p',{class:'tiny muted',style:{margin:'4px 0 0'}},'Downside of '+byId(sc.best).name+': '+byId(sc.best).cons));
      return b;
    }

    function profView(){
      var box=h('div');
      box.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Build a project profile'),h('p',{style:{margin:0}},'Describe your own project with the six sliders. The tool ranks the five processes from section 5.2 and gives reasons. Remember: the life cycle must reflect what actually happens, not an ideal model, and milestones and deliverables matter more than the model.')));
      var c=h('div',{class:'card'});
      c.appendChild(h('input',{class:'input',placeholder:'Project name (optional)',value:S.name,'aria-label':'Project name',style:{marginBottom:'14px'},oninput:function(){S.name=this.value;save()}}));
      F.forEach(function(f){c.appendChild(slider(f,S.prof[f.k],function(v){S.prof[f.k]=v;S.pr=true;save();upd()}))});
      box.appendChild(c);
      var out=h('div'); box.appendChild(out);
      function upd(){
        out.innerHTML='';
        var rk=rank(S.prof), top=rk[0], sec=rk[1], rs=reasons(S.prof,top.m);
        var card=h('div',{class:'card'},h('div',{class:'label'},'Recommendation'),h('h3',null,(S.name?S.name+': ':'')+top.m.name+' ('+top.s+'% fit)'),h('p',null,top.m.tag));
        if(top.s-sec.s<6)card.appendChild(h('p',{class:'callout note'},'Close call: '+sec.m.name+' scores '+sec.s+'%. Consider a hybrid, for example timeboxed increments with prototyping for the unclear parts.'));
        card.appendChild(h('div',{class:'label'},'Why it fits'));
        var ul=h('ul',{class:'mpk-rs'}); rs.good.forEach(function(g){ul.appendChild(h('li',null,h('b',null,g.f.n+' ('+S.prof[g.f.k]+'): '),g.t))}); if(!rs.good.length)ul.appendChild(h('li',null,'No factor matches closely; your project may need a tailored mix.')); card.appendChild(ul);
        if(rs.bad.length){card.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'Tensions to manage')); var u2=h('ul',{class:'mpk-rs'}); rs.bad.forEach(function(g){u2.appendChild(h('li',{class:'x'},h('b',null,g.f.n+' ('+S.prof[g.f.k]+', method assumes '+top.m.p[g.f.k]+'): '),g.t))}); card.appendChild(u2);}
        card.appendChild(h('p',{class:'muted',style:{margin:'8px 0 0'}},h('b',null,'Known downside: '),top.m.cons));
        if(S.prof.clarity<=2)card.appendChild(h('p',{class:'callout',style:{marginTop:'12px'}},'Unclear requirements are the major risk in a typical project: in the faults study, requirements definition caused 38% of faults. Consider early prototypes or phased reviews.'));
        out.appendChild(card);
        out.appendChild(h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'8px'}},'All methods ranked'),fitBars(S.prof)));
      }
      upd();
      box.appendChild(h('div',{class:'row'},h('button',{class:'btn ghost',onclick:function(){S.prof={clarity:3,risk:3,involve:3,deadline:3,change:3,formal:3};S.name='';S.pr=false;save();render()}},'Reset profile')));
      return box;
    }

    function ref(){
      var box=h('div');
      M.forEach(function(m){box.appendChild(h('div',{class:'card'},h('div',{class:'label'},'Method'),h('h3',null,m.name),h('p',null,m.tag),h('p',{class:'muted',style:{margin:0}},h('b',null,'Downside: '),m.cons)))});
      return box;
    }

    function render(){
      el.innerHTML=''; var root=h('div',{class:'tool'});
      root.appendChild(h('div',{class:'mpk-tabs'},
        [['sc','Scenarios'],['prof','Project profile'],['ref','The methods']].map(function(t){return h('button',{class:'chip'+(S.mode===t[0]?' on':''),onclick:function(){S.mode=t[0];save();render()}},t[1])})));
      root.appendChild(S.mode==='sc'?scView():(S.mode==='prof'?profView():ref()));
      el.appendChild(root);
    }
    render();
  }});
})();

/* Stakeholder power / interest grid  (PM course 1.2 "Organisations and 'players in the game'") */
(function(){
  var h=H.h, P='sg-';
  var css=
  '.sg-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}'+
  '.sg-wrap{display:grid;grid-template-columns:1fr;gap:16px;align-items:start}'+
  '@media(min-width:860px){.sg-wrap{grid-template-columns:minmax(360px,480px) 1fr}.sg-board-col{position:sticky;top:8px}}'+
  '.sg-boardbox{display:grid;grid-template-columns:22px 1fr;grid-template-rows:1fr 22px;gap:6px;max-width:480px;margin:0 auto}'+
  '.sg-ylab{writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;display:flex;justify-content:space-between;align-items:center}'+
  '.sg-xlab{grid-column:2;display:flex;justify-content:space-between;align-items:center}'+
  '.sg-board{position:relative;aspect-ratio:1/1;width:100%;border-radius:var(--r-md);background-color:var(--surface2);border:1.5px solid var(--ink);overflow:hidden;touch-action:manipulation;cursor:crosshair}'+
  '.sg-board.armed{outline:3px dotted var(--red);outline-offset:2px}'+
  '.sg-midv,.sg-midh{position:absolute;background:transparent;pointer-events:none}'+
  '.sg-midv{left:50%;top:0;bottom:0;border-left:1.5px dashed var(--ink3)}'+
  '.sg-midh{top:50%;left:0;right:0;border-top:1.5px dashed var(--ink3)}'+
  '.sg-q{position:absolute;width:50%;height:50%;display:flex;align-items:flex-start;justify-content:flex-start;padding:8px 10px;pointer-events:none;opacity:0;transition:opacity .3s}'+
  '.sg-board.show .sg-q{opacity:1}'+
  '.sg-q span{font-family:var(--mono);font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2);line-height:1.3}'+
  '.sg-q.sat{left:0;top:0}.sg-q.close{left:50%;top:0}.sg-q.mon{left:0;top:50%}.sg-q.inf{left:50%;top:50%}'+
  '.sg-dot{position:absolute;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.95rem;touch-action:none;cursor:grab;z-index:3;border:2px solid var(--surface);user-select:none;-webkit-user-select:none}'+
  '.sg-dot.sel{background:var(--red);color:#fff;box-shadow:0 0 0 4px rgba(215,25,33,.25)}'+
  '.sg-dot.ok{background:var(--green);color:#fff}.sg-dot.bad{background:var(--red);color:#fff}'+
  '.sg-exp{position:absolute;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:2px dashed var(--green);color:var(--green);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.9rem;z-index:2;pointer-events:none;background:transparent}'+
  '.sg-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}'+
  '.sg-card{border:1.5px solid var(--line);border-radius:var(--r-md);padding:12px 14px;margin:0 0 10px;background:var(--surface)}'+
  '.sg-card.sel{border-color:var(--red);border-style:dotted;border-width:2px}'+
  '.sg-card.ok{border-color:var(--green)}.sg-card.bad{border-color:var(--red)}'+
  '.sg-badge{flex:none;width:44px;height:44px;border-radius:50%;background:var(--surface2);border:1.5px dashed var(--ink3);display:flex;align-items:center;justify-content:center;font-weight:600;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}'+
  '.sg-badge.placed{background:var(--ink);color:var(--bg);border:1.5px solid var(--ink)}'+
  '.sg-ghost{position:fixed;z-index:10000;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;pointer-events:none;opacity:.9}'+
  '.sg-fb{margin-top:10px;font-size:.92rem;border-top:1px dotted var(--ink3);padding-top:10px}'+
  '.sg-pill{display:inline-block;border-radius:99px;padding:2px 12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;background:var(--surface2);border:1px solid var(--line)}'+
  '.sg-pill.g{background:var(--green);color:#fff;border-color:var(--green)}.sg-pill.r{background:var(--red);color:#fff;border-color:var(--red)}'+
  '.sg-strat{display:grid;grid-template-columns:1fr;gap:8px}@media(min-width:560px){.sg-strat{grid-template-columns:1fr 1fr}}'+
  '.sg-strat>div{background:var(--surface2);border-radius:var(--r-sm);padding:10px 12px;font-size:.88rem}'+
  '.sg-x{background:none;border:0;color:var(--ink2);cursor:pointer;min-width:44px;min-height:44px;font-size:1.2rem}';
  if(!document.getElementById('sg-css')){var st=document.createElement('style');st.id='sg-css';st.textContent=css;document.head.appendChild(st)}

  /* ---- the course's "players in the game" (PM 1.2, Tables 1 and 2) ---- */
  var ROLES=[
    {k:'sponsor',l:'Sponsor',d:'The person or body for whom the project is undertaken; the primary risk taker, answerable for success in the eyes of the stakeholders. The sponsoring organisation provides the resources (money, people).'},
    {k:'champion',l:'Champion',d:'An advocate for the proposal who has the ear of the people in power and promotes the cause. Needs genuine influence; a different role from the sponsor.'},
    {k:'client',l:'Client',d:'The person or organisation requesting or commissioning the work, usually with some form of payment or (formal or informal) contract.'},
    {k:'customer',l:'Customer',d:'The one who buys. Similar to client; e.g. the public are customers of a product that the marketing department (the client) asked for.'},
    {k:'owner',l:'Owner',d:'Someone with an attitude of strong attachment to the aims of the project (Boddy and Buchanan).'},
    {k:'blocker',l:'Blocker / objector',d:'People or bodies that will resist the project - anyone who can obstruct, block or stall the work.'},
    {k:'enduser',l:'End user',d:'The people who will ultimately operate or make use of the product. If it does not help them do their work, it will not be successful.'},
    {k:'developer',l:'Developer',d:'A person who is part of the team that builds the product.'},
    {k:'regulator',l:'Statutory / regulatory body',d:'Found on most stakeholder lists: they can affect both the product and the way it is developed (licences, health and safety rules ...).'},
    {k:'other',l:'Other stakeholder',d:'Anyone else who has an interest in the project, is affected by it, grants resources to it, or can influence its outcome.'}
  ];
  function roleL(k){for(var i=0;i<ROLES.length;i++)if(ROLES[i].k===k)return ROLES[i].l;return '-'}
  function roleD(k){for(var i=0;i<ROLES.length;i++)if(ROLES[i].k===k)return ROLES[i].d;return ''}

  var STRAT={
    close:{l:'Manage closely',hp:'High power, high interest',t:'Involve them in decisions, meet regularly, and treat them as partners. They can make or break the project and they care about it.'},
    satisfy:{l:'Keep satisfied',hp:'High power, low interest',t:'Do not bury them in detail, but make sure they are never surprised. Brief them on what matters to them, because their power means they can stall the work if unhappy.'},
    inform:{l:'Keep informed',hp:'Low power, high interest',t:'Update them regularly and listen to them - they know the detail, give early warnings and can become allies (or, if ignored, objectors).'},
    monitor:{l:'Monitor',hp:'Low power, low interest',t:'Minimum effort: keep an eye on them. Influence can vary at different points in the life of a project, so re-check from time to time.'}
  };
  function quadOf(x,y){return y>=50?(x>=50?'close':'satisfy'):(x>=50?'inform':'monitor')}

  var SCEN={
    title:'Scenario: online booking for a leisure centre',
    brief:'A local council is introducing a new online booking and membership system for its leisure centre. Customers will book pool lanes, classes and courts from their phones; the work is built by an outside software supplier. Place each of the nine stakeholders on the grid by how much POWER they have over the project (up) and how much INTEREST they have in it (right), then tag the role each plays in the game.',
    items:[
      {id:'s1',name:'Head of Leisure Services',desc:'Owns the budget, is accountable to the council if the project fails, and asked for it to happen.',role:'sponsor',x:92,y:92,
        why:'The sponsor provides the resources and is the primary risk taker, so they hold very high power and have a personal stake in the result. Engage them continuously: decisions, risks and budget changes go through them.'},
      {id:'s2',name:'Cabinet member for Leisure',desc:'An elected councillor who has publicly promoted the idea and has the ear of the council leadership.',role:'champion',x:72,y:80,
        why:'A champion advocates for the project and has genuine influence in the organisation, which is why they sit high on power. Their active promotion means high interest too. They provide support in times of difficulty, so keep them close and supplied with progress stories.'},
      {id:'s3',name:'Leisure centre manager',desc:'Requested the system for the centre, signs off what is delivered and runs the centre day to day.',role:'client',x:88,y:68,
        why:'The client commissions the work and accepts the result, so they hold real power (sign-off) and care deeply about the outcome. Agree requirements and acceptance tests with them early; they are a partner, not a recipient.'},
      {id:'s4',name:'Council finance committee',desc:'Releases the capital budget each year and meets quarterly; has many other priorities.',role:'other',x:28,y:88,
        why:'Those who grant resources are stakeholders. The committee can stop funding, so power is very high, but this single project is a small part of its agenda, so interest is low. Keep them satisfied with short, regular, no-surprises summaries.'},
      {id:'s5',name:'Data protection authority',desc:'Independent regulator: members\' personal and payment data must comply with data law.',role:'regulator',x:12,y:80,
        why:'Statutory and regulatory bodies are on most stakeholder lists because they affect both the product and how it is developed. They have a lot of power (fines, enforcement) but no particular interest in this project until something goes wrong. Keep them satisfied by complying and documenting.'},
      {id:'s6',name:'Front-desk staff',desc:'Currently take bookings by phone and in person; worried the system will reduce their hours.',role:'blocker',x:90,y:34,
        why:'A group whose work is changed by the project and who fear for their future can resist or stall it - potential blockers or objectors. They have little formal power but very high interest. Keep them informed and listen early: involvement turns objectors into supporters.'},
      {id:'s7',name:'Software supplier\'s development team',desc:'Builds and tests the booking system under contract.',role:'developer',x:80,y:40,
        why:'Developers are part of the team that builds the product. Their interest in the project is high (it is their work) but they have limited power over the project\'s direction, which is set by the client and sponsor. Keep them informed with clear requirements and quick answers.'},
      {id:'s8',name:'Centre members (the public)',desc:'Thousands of residents who pay to use the pool, gym and classes and will use the app.',role:'customer',x:62,y:22,
        why:'Customers are the ones who buy, and their reaction decides whether the system is a success, but individually they have little power over the project and moderate interest in how it is built. Keep them informed through announcements, tutorials and a feedback route.'},
      {id:'s9',name:'Local sports clubs',desc:'Hire courts a few times a month; mostly unaware of the project.',role:'enduser',x:20,y:20,
        why:'Occasional users who will be affected only slightly: low power and low interest. Monitor them (for example through a notice in the centre). Remember influence can change - a large club complaining could move up the grid.'}
    ]};

  function ldq(s){try{return JSON.parse(JSON.stringify(s))}catch(e){return null}}

  Tools.register('stakeholder-grid',{title:'Stakeholder power / interest grid',desc:'Place the players in the game on a power x interest grid, tag their roles and choose how to engage each.',
  mount:function(el,ctx){
    var S=ctx.load()||{};
    S.mode=S.mode||'scen'; S.placed=S.placed||{}; S.roles=S.roles||{}; S.checked=!!S.checked; S.done=!!S.done;
    S.my=S.my||{proj:'',items:[],n:1}; S.ai=S.ai||'';
    var sel=null, root=h('div',{class:'tool'}); el.appendChild(root);
    function save(){ctx.save(S)}

    /* ---------- generic board ---------- */
    function Board(onPlace,onSelect){
      var board=h('div',{class:'sg-board dots',role:'application','aria-label':'Power and interest grid'});
      var svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('class','sg-svg'); svg.setAttribute('viewBox','0 0 100 100'); svg.setAttribute('preserveAspectRatio','none');
      board.appendChild(svg);
      board.appendChild(h('div',{class:'sg-midv'}));board.appendChild(h('div',{class:'sg-midh'}));
      ['sat','close','mon','inf'].forEach(function(q){var k={sat:'satisfy',close:'close',mon:'monitor',inf:'inform'}[q];board.appendChild(h('div',{class:'sg-q '+q},h('span',null,STRAT[k].l)))});
      var layer=h('div',{style:{position:'absolute',inset:0}});board.appendChild(layer);
      var box=h('div',{class:'sg-boardbox'},
        h('div',{class:'sg-ylab label'},h('span',null,'Low'),h('span',null,'Power'),h('span',null,'High')),
        board,
        h('div',null),
        h('div',{class:'sg-xlab label'},h('span',null,'Low'),h('span',null,'Interest'),h('span',null,'High')));
      function pos(ev){var r=board.getBoundingClientRect();var x=(ev.clientX-r.left)/r.width*100,y=100-(ev.clientY-r.top)/r.height*100;return {x:x,y:y,inside:x>=0&&x<=100&&y>=0&&y<=100}}
      function cl(v){return Math.max(3,Math.min(97,v))}
      board.addEventListener('click',function(ev){ if(ev.target.closest&&ev.target.closest('.sg-dot'))return; if(!sel)return; var p=pos(ev); onPlace(sel,cl(p.x),cl(p.y)) });
      function drag(ev,id,label){
        if(ev.button>0)return; var sx=ev.clientX,sy=ev.clientY,moved=false,ghost=null;
        function mv(e){ if(!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)>6){moved=true;ghost=h('div',{class:'sg-ghost'},label);document.body.appendChild(ghost)}
          if(moved){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';if(e.cancelable)e.preventDefault()}}
        function up(e){ document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);
          if(ghost)ghost.remove();
          if(!moved){onSelect(id);return}
          if(e.type==='pointercancel')return;
          var p=pos(e); if(p.inside)onPlace(id,cl(p.x),cl(p.y)); }
        document.addEventListener('pointermove',mv,{passive:false});document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
      }
      function draw(items,o){ /* items: {id,n,x,y,state,exp:{x,y}} */
        o=o||{}; layer.innerHTML=''; svg.innerHTML=''; board.classList.toggle('show',!!o.reveal); board.classList.toggle('armed',!!sel&&!o.locked);
        items.forEach(function(it){
          if(it.x==null)return;
          if(it.exp){
            var ln=document.createElementNS('http://www.w3.org/2000/svg','line');
            ln.setAttribute('x1',it.x);ln.setAttribute('y1',100-it.y);ln.setAttribute('x2',it.exp.x);ln.setAttribute('y2',100-it.exp.y);
            ln.setAttribute('stroke','#3E8E52');ln.setAttribute('stroke-width','0.6');ln.setAttribute('stroke-dasharray','2 2');ln.setAttribute('vector-effect','non-scaling-stroke');
            svg.appendChild(ln);
            layer.appendChild(h('div',{class:'sg-exp',style:{left:it.exp.x+'%',top:(100-it.exp.y)+'%'}},it.n));
          }
          var d=h('div',{class:'sg-dot'+(sel===it.id?' sel':'')+(it.state?' '+it.state:''),style:{left:it.x+'%',top:(100-it.y)+'%'},role:'button','aria-label':'Stakeholder '+it.n+': '+it.name+' (drag to move)','data-id':it.id,tabindex:'0',title:it.name},it.n);
          if(!o.locked)d.addEventListener('pointerdown',function(e){e.stopPropagation();drag(e,it.id,it.n)});
          layer.appendChild(d);
        });
      }
      return {box:box,el:board,draw:draw,drag:drag};
    }

    /* ---------- header ---------- */
    var tabs=h('div',{class:'sg-tabs'});
    var body=h('div');
    root.appendChild(tabs);root.appendChild(body);
    function drawTabs(){tabs.innerHTML='';
      [['scen','Practice scenario'],['my','My own project']].forEach(function(t){tabs.appendChild(h('button',{class:'chip'+(S.mode===t[0]?' on':''),onclick:function(){S.mode=t[0];sel=null;save();drawTabs();build()}},t[1]))})}

    function refRoles(){
      return h('details',{class:'card flat',style:{padding:'12px 16px'}},h('summary',{style:{cursor:'pointer',minHeight:'32px',fontWeight:500}},'The players in the game - role definitions (course section 1.2)'),
        h('div',{style:{marginTop:'8px'}},ROLES.map(function(r){return h('p',{style:{margin:'0 0 8px',fontSize:'.9rem'}},h('b',null,r.l+': '),r.d)}),
          h('p',{class:'tiny muted'},'A stakeholder is any person or group who has an interest in a project, is affected by it, or can influence its outcome - including those whose work it changes, those it affects, those who grant resources and those who can obstruct or stall it. Influence may vary at different points in a project\'s life.')));
    }
    function roleSelect(cur,onch,disabled){
      var s=h('select',{class:'input',style:{minHeight:'44px',marginTop:'8px'},'aria-label':'Role in the game',onchange:function(){onch(s.value)},disabled:disabled||null},
        h('option',{value:''},'Tag the role in the game ...'),ROLES.map(function(r){return h('option',{value:r.k,selected:cur===r.k?true:null},r.l)}));
      s.value=cur||'';return s;}

    /* ======================= SCENARIO ======================= */
    function buildScen(){
      body.innerHTML='';
      var items=SCEN.items; var nOf={};items.forEach(function(it,i){nOf[it.id]=i+1});
      var bd=Board(place,select);
      var list=h('div'), foot=h('div'), msg=h('div',{class:'muted tiny',style:{textAlign:'center',margin:'8px 0'}});
      function place(id,x,y){ if(S.checked)return; S.placed[id]={x:x,y:y}; save(); draw(); }
      function select(id){ if(S.checked)return; sel=(sel===id?null:id); draw(); }
      function allPlaced(){return items.every(function(it){return S.placed[it.id]})}
      function check(){
        var q=0,r=0;items.forEach(function(it){var p=S.placed[it.id];if(quadOf(p.x,p.y)===quadOf(it.x,it.y))q++;if(S.roles[it.id]===it.role)r++});
        S.checked=true;sel=null;S.score=(q+r)/(2*items.length);save();draw();
        if(!S.done){S.done=true;save();ctx.complete(S.score)}
        try{root.scrollIntoView({block:'start',behavior:'smooth'})}catch(e){}
      }
      function reset(){S.placed={};S.roles={};S.checked=false;S.score=null;sel=null;save();draw()}
      function retry(){S.placed={};S.checked=false;sel=null;save();draw()}
      function draw(){
        var bi=items.map(function(it){var p=S.placed[it.id];var o={id:it.id,n:nOf[it.id],name:it.name};
          if(p){o.x=p.x;o.y=p.y; if(S.checked){var ok=quadOf(p.x,p.y)===quadOf(it.x,it.y);o.state=ok?'ok':'bad';o.exp={x:it.x,y:it.y}}} return o});
        bd.draw(bi,{reveal:S.checked,locked:S.checked});
        list.innerHTML='';
        items.forEach(function(it){
          var p=S.placed[it.id],n=nOf[it.id];
          var qOk=p&&quadOf(p.x,p.y)===quadOf(it.x,it.y), rOk=S.roles[it.id]===it.role;
          var badge=h('div',{class:'sg-badge'+(p?' placed':''),role:'button',tabindex:'0','aria-label':'Pick up '+it.name,title:'Tap to select, then tap the grid - or drag onto the grid'},n);
          if(!S.checked){badge.addEventListener('pointerdown',function(e){bd.drag(e,it.id,n)});
            badge.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select(it.id)}})}
          var c=h('div',{class:'sg-card'+(sel===it.id?' sel':'')+(S.checked?(qOk?' ok':' bad'):'')},
            h('div',{class:'row',style:{alignItems:'flex-start',flexWrap:'nowrap'}},badge,
              h('div',{style:{flex:1,minWidth:0}},h('div',{style:{fontWeight:500}},it.name),h('div',{class:'muted',style:{fontSize:'.9rem'}},it.desc),
                h('div',{class:'tiny muted',style:{marginTop:'4px'}},!p?(sel===it.id?'Now tap the grid to place it.':'Not placed yet - tap me, then tap the grid (or drag me).'):(S.checked?'':'Placed. Tap me to select and move it.')))));
          c.addEventListener('click',function(e){if(e.target.closest('select')||e.target.closest('.sg-badge'))return;select(it.id)});
          c.appendChild(roleSelect(S.roles[it.id],function(v){S.roles[it.id]=v;save();draw()},S.checked));
          if(S.checked){
            var st=STRAT[quadOf(it.x,it.y)];
            c.appendChild(h('div',{class:'sg-fb'},
              h('div',{class:'row',style:{marginBottom:'6px'}},
                h('span',{class:'sg-pill '+(qOk?'g':'r')},qOk?'Placement matches':'Expected: '+st.l),
                h('span',{class:'sg-pill '+(rOk?'g':'r')},rOk?'Role matches':'Role: '+roleL(it.role))),
              h('div',null,h('b',null,st.l+' - '),it.why),
              !qOk?h('div',{class:'muted',style:{marginTop:'6px'}},'You placed this one in "'+STRAT[quadOf(p.x,p.y)].l+'" ('+STRAT[quadOf(p.x,p.y)].hp.toLowerCase()+').'):null,
              !rOk?h('div',{class:'muted',style:{marginTop:'6px'}},(S.roles[it.id]?'You tagged "'+roleL(S.roles[it.id])+'". ':'No role tagged. ')+roleL(it.role)+': '+roleD(it.role)):null));
          }
          list.appendChild(c);
        });
        foot.innerHTML='';
        var placed=items.filter(function(it){return S.placed[it.id]}).length, tagged=items.filter(function(it){return S.roles[it.id]}).length;
        msg.textContent=S.checked?'':placed+' of '+items.length+' placed - '+tagged+' of '+items.length+' roles tagged';
        if(!S.checked){
          foot.appendChild(h('div',{class:'row',style:{justifyContent:'center'}},
            h('button',{class:'btn primary',disabled:allPlaced()?null:true,onclick:check},'Check my grid'),
            h('button',{class:'btn ghost',onclick:reset},'Reset')));
        } else {
          var sc=Math.round(S.score*100);
          foot.appendChild(h('div',{class:'card dark'},h('div',{class:'label',style:{color:'#8f8f8f'}},'Your result'),
            h('div',{style:{fontSize:'2rem',fontWeight:500}},sc+'%'),
            h('p',{style:{margin:'4px 0 10px'}},'Green numbers sit in the expected quadrant. Dashed rings show where the course logic puts each stakeholder. Placement is a judgement - what matters is that you can justify the strategy.'),
            h('div',{class:'row'},h('button',{class:'btn',onclick:retry},'Try again (keep roles)'),h('button',{class:'btn ghost',style:{color:'#fff',borderColor:'#555'},onclick:reset},'Start over'),
              h('button',{class:'btn',onclick:function(){S.mode='my';save();drawTabs();build()}},'Now do my project'))));
          var sg=h('div',{class:'sg-strat'});
          Object.keys(STRAT).forEach(function(k){sg.appendChild(h('div',null,h('b',null,STRAT[k].l),h('div',{class:'tiny muted'},STRAT[k].hp),h('div',null,STRAT[k].t)))});
          foot.appendChild(h('div',{class:'card flat'},h('div',{class:'label',style:{marginBottom:'8px'}},'Four engagement strategies'),sg));
        }
      }
      body.appendChild(h('div',{class:'card flat'},h('h3',null,SCEN.title),h('p',{style:{margin:0}},SCEN.brief)));
      body.appendChild(h('div',{class:'sg-wrap'},
        h('div',{class:'sg-board-col'},bd.box,msg),
        h('div',null,list)));
      body.appendChild(foot);
      body.appendChild(refRoles());
      draw();
    }

    /* ======================= MY PROJECT ======================= */
    function buildMy(){
      body.innerHTML='';
      var M=S.my, bd=Board(place,select);
      var list=h('div'), gaps=h('div'), aiBox=h('div');
      function place(id,x,y){var it=find(id);if(it){it.x=x;it.y=y;save();draw()}}
      function select(id){sel=(sel===id?null:id);draw()}
      function find(id){for(var i=0;i<M.items.length;i++)if(M.items[i].id===id)return M.items[i]}
      var proj=h('input',{class:'input',placeholder:'e.g. New website for the village hall',value:M.proj,'aria-label':'My project',oninput:function(){M.proj=proj.value;save()}});
      var nm=h('input',{class:'input',placeholder:'Who or which group? e.g. Line manager',maxlength:'60','aria-label':'Stakeholder name'});
      var ds=h('input',{class:'input',placeholder:'One line: what is their link to the project?',maxlength:'140','aria-label':'Short description'});
      var rl=roleSelect('',function(){}); var rsel=rl;
      function add(){
        var name=nm.value.trim(); if(!name){ctx.toast('Give the stakeholder a name first');nm.focus();return}
        if(M.items.length>=20){ctx.toast('20 stakeholders is plenty for one grid');return}
        var it={id:'m'+(M.n++),name:name,desc:ds.value.trim(),role:rsel.value}; M.items.push(it); sel=it.id; nm.value='';ds.value='';rsel.value='';save();draw();
        ctx.toast('Added - now tap the grid to place '+name);
      }
      nm.addEventListener('keydown',function(e){if(e.key==='Enter')add()});
      function remove(id){M.items=M.items.filter(function(i){return i.id!==id});if(sel===id)sel=null;save();draw()}
      function draw(){
        var bi=M.items.map(function(it,i){return {id:it.id,n:i+1,name:it.name,x:it.x,y:it.y}});
        bd.draw(bi,{reveal:true});
        list.innerHTML='';
        if(!M.items.length)list.appendChild(h('div',{class:'muted',style:{padding:'12px 4px'}},'No stakeholders yet. Add the people and groups who are affected by your project, grant it resources, can influence it - or could block it.'));
        M.items.forEach(function(it,i){
          var placed=it.x!=null;
          var badge=h('div',{class:'sg-badge'+(placed?' placed':''),role:'button',tabindex:'0','aria-label':'Pick up '+it.name},i+1);
          badge.addEventListener('pointerdown',function(e){bd.drag(e,it.id,i+1)});
          badge.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select(it.id)}});
          var c=h('div',{class:'sg-card'+(sel===it.id?' sel':'')},
            h('div',{class:'row',style:{alignItems:'flex-start',flexWrap:'nowrap'}},badge,
              h('div',{style:{flex:1,minWidth:0}},h('div',{style:{fontWeight:500}},it.name),it.desc?h('div',{class:'muted',style:{fontSize:'.9rem'}},it.desc):null),
              h('button',{class:'sg-x','aria-label':'Remove '+it.name,onclick:function(e){e.stopPropagation();remove(it.id)}},'×')));
          c.addEventListener('click',function(e){if(e.target.closest('select')||e.target.closest('button')||e.target.closest('.sg-badge'))return;select(it.id)});
          c.appendChild(roleSelect(it.role,function(v){it.role=v;save();draw()}));
          if(placed){var q=STRAT[quadOf(it.x,it.y)];c.appendChild(h('div',{class:'sg-fb'},h('span',{class:'sg-pill'},q.l),' ',h('span',{class:'tiny muted'},q.hp),h('div',{style:{marginTop:'6px'}},q.t)))}
          else c.appendChild(h('div',{class:'tiny muted',style:{marginTop:'8px'}},sel===it.id?'Now tap the grid to place it.':'Not placed - tap me, then tap the grid (or drag me).'));
          list.appendChild(c);
        });
        /* gaps & prompts */
        gaps.innerHTML='';
        if(M.items.length){
          var have={};M.items.forEach(function(i){if(i.role)have[i.role]=1});
          var miss=ROLES.filter(function(r){return !have[r.k]&&r.k!=='other'});
          var untagged=M.items.filter(function(i){return !i.role}).length, unplaced=M.items.filter(function(i){return i.x==null}).length;
          var tips=[];
          if(unplaced)tips.push(unplaced+' stakeholder(s) not placed on the grid yet.');
          if(untagged)tips.push(untagged+' stakeholder(s) have no role tagged.');
          var cnt={close:0,satisfy:0,inform:0,monitor:0};M.items.forEach(function(i){if(i.x!=null)cnt[quadOf(i.x,i.y)]++});
          if(M.items.length>=4&&cnt.close===0&&M.items.every(function(i){return i.x!=null}))tips.push('Nobody is in "Manage closely". Every project has some - is your sponsor or client high enough on power and interest?');
          if(!have.blocker)tips.push('You have not named a possible blocker or objector. Who could obstruct, block or stall the work? Whose work is changed by the project?');
          if(!have.regulator)tips.push('No statutory or regulatory body. Does any law, licence, standard or health-and-safety rule affect your product or how you build it?');
          if(!have.sponsor)tips.push('Who is the sponsor - the person or body the project is undertaken for, who provides the resources and carries the risk?');
          var other=miss.filter(function(r){return ['sponsor','blocker','regulator'].indexOf(r.k)<0});
          gaps.appendChild(h('div',{class:'card flat'},h('div',{class:'label',style:{marginBottom:'6px'}},'Who might be missing?'),
            tips.length?h('ul',{style:{margin:'0 0 8px',paddingLeft:'20px'}},tips.map(function(t){return h('li',null,t)})):h('p',{style:{margin:'0 0 8px'}},'Good coverage of the key roles.'),
            other.length?h('div',{class:'tiny muted'},'Roles not yet used: '+other.map(function(r){return r.l}).join(', ')+'. Not every project has all of them - but ask the question.'):null,
            h('div',{class:'tiny muted',style:{marginTop:'6px'}},'Reminder: roles can change as the project unfolds; people may swap roles or try to affect the outcome favourably or adversely.')));
          if(cnt.close+cnt.satisfy+cnt.inform+cnt.monitor>0){
            var sm=h('div',{class:'sg-strat'});
            ['close','satisfy','inform','monitor'].forEach(function(k){var who=M.items.filter(function(i){return i.x!=null&&quadOf(i.x,i.y)===k}).map(function(i){return i.name});
              sm.appendChild(h('div',null,h('b',null,STRAT[k].l+' ('+who.length+')'),h('div',{class:'tiny'},who.length?who.join(', '):'-')))});
            gaps.appendChild(h('div',{class:'card flat'},h('div',{class:'label',style:{marginBottom:'8px'}},'My engagement plan'),sm));
          }
        }
        /* AI */
        aiBox.innerHTML='';
        if(ctx.ai.available()&&M.items.length>=2){
          var out=h('div',{class:S.ai?'ai-box':'hide'},h('span',{class:'label'},'AI suggestion'),S.ai||'');
          aiBox.appendChild(h('button',{class:'btn ghost',onclick:function(){ask(out,this)}},'Ask AI: what am I missing?'));
          aiBox.appendChild(out);
        }
      }
      function ask(out,btn){
        var lines=M.items.map(function(i){return '- '+i.name+(i.desc?' ('+i.desc+')':'')+' | role: '+(i.role?roleL(i.role):'none')+' | '+(i.x!=null?STRAT[quadOf(i.x,i.y)].l:'not placed')}).join('\n');
        var text='';out.className='ai-box';out.innerHTML='';out.appendChild(h('span',{class:'label'},'AI suggestion'));var tn=document.createTextNode('Thinking ...');out.appendChild(tn);btn.disabled=true;
        ctx.ai.ask({system:'You are a project management tutor. Use a power/interest stakeholder grid. Be concise and concrete. Plain text, max 120 words.',
          prompt:'Project: '+(M.proj||'(not named)')+'\nStakeholders:\n'+lines+'\n\nName 2 stakeholders that may be missing, and for one placed stakeholder say if the placement seems wrong and why.',maxTokens:220,temperature:0.5,
          onToken:function(t){text+=t;tn.nodeValue=text}}).then(function(r){S.ai=(r||text).trim();tn.nodeValue=S.ai;save()}).catch(function(){tn.nodeValue='The AI is not available right now. Use the checklist above instead.'}).then(function(){btn.disabled=false});
      }
      body.appendChild(h('div',{class:'card flat'},h('h3',null,'Map the players in your own project'),
        h('p',{class:'muted',style:{marginBottom:'10px'}},'Pick a real or imagined project. Add the people and groups who have an interest in it, are affected by it, grant resources or could obstruct it. Place each on the grid, tag its role, and read the engagement strategy.'),
        h('label',{class:'label'},'My project'),proj));
      var addCard=h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'8px'}},'Add a stakeholder'),nm,h('div',{style:{height:'8px'}}),ds,rsel,
        h('div',{style:{marginTop:'10px'}},h('button',{class:'btn primary',onclick:add},'Add to grid')));
      body.appendChild(h('div',{class:'sg-wrap'},
        h('div',{class:'sg-board-col'},bd.box,h('div',{class:'tiny muted',style:{textAlign:'center',margin:'8px 0'}},'Select a stakeholder, then tap the grid - or drag the number onto it.')),
        h('div',null,addCard,list)));
      body.appendChild(gaps);
      body.appendChild(h('div',{class:'row'},aiBox,h('button',{class:'btn ghost',onclick:function(){if(confirm('Remove all stakeholders from my project?')){S.my={proj:'',items:[],n:1};S.ai='';sel=null;save();build()}}},'Reset my project')));
      body.appendChild(refRoles());
      draw();
    }

    function build(){ if(S.mode==='my')buildMy(); else buildScen() }
    drawTabs(); build();
  }});
})();

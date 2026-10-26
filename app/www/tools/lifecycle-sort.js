/* lifecycle-sort: sort activities into project life-cycle phases (PM course 4.1) + compare life-cycle models */
(function(){
  var h=H.h;
  var P=function(name,desc){return {name:name,desc:desc}};

  /* ---------- Scenarios (phase names and descriptions mirror section 4.1, Tables 10-13) ---------- */
  var SCEN=[
    {id:'basic',title:'Library checkout system',model:'Basic life cycle (APM, 2006)',
     brief:'A regional library network is replacing its book-checkout system. Place each activity in the phase of the basic project life cycle where it belongs.',
     phases:[
      P('Concept','The need, problem or opportunity is established. Proposals are prepared and tested for feasibility. Ends with a go/no-go decision.'),
      P('Definition','Plans are refined into one the project manager can use. Scope, time, cost and quality objectives are elaborated.'),
      P('Implementation','The plan is put into action. The busiest phase: communication, cost monitoring, quality control, managing change.'),
      P('Handover and closeout','Deliverables are handed to the sponsor and formally accepted. The project is reviewed and lessons are learnt.')],
     acts:[
      {id:'a1',t:'Establish the need: staff queues and an ageing system are the problem to solve',p:0,o:1,why:'Concept is where the need, problem or opportunity is first established.',hint:'Has anyone yet agreed there is a project at all?'},
      {id:'a2',t:'Test the proposal for feasibility',p:0,o:2,why:'Proposals are prepared and tested for feasibility during Concept, before any go/no-go decision.',hint:'You test feasibility before committing to a detailed plan.'},
      {id:'a3',t:'Present a business case so the sponsor can say go or no-go',p:0,o:3,why:'The go/no-go decision, often via a business case owned by the sponsor, forms the end of the Concept stage.',hint:'This decision is the gate that lets the project proceed.'},
      {id:'a4',t:'Elaborate the requirements in more detail and refine the scope, time, cost and quality objectives',p:1,o:1,why:'In Definition, requirements are elaborated and scope, time, cost and quality objectives can be affected.',hint:'The idea is approved; now turn it into a plan someone can manage.'},
      {id:'a5',t:'Evaluate and optimise the preferred solution, then create the project management plan',p:1,o:2,why:'Definition involves iterative evaluation and optimisation of the preferred solution, ending in a usable plan.',hint:'This still happens before the plan is put into action.'},
      {id:'a6',t:'Monitor costs and control quality while the system is built',p:2,o:1,why:'Monitoring costs and controlling quality are important Implementation activities.',hint:'Think of the phase when the plan is actually being carried out.'},
      {id:'a7',t:'Communicate with stakeholders and identify and manage changes',p:2,o:2,why:'Communication with stakeholders and managing changes are named as important activities of Implementation.',hint:'This is the busiest phase of just about every project.'},
      {id:'a8',t:'Install the new facility and get formal acceptance from the sponsor',p:3,o:1,why:'Final deliverables are handed over; once formally accepted, responsibility shifts from the project team to the sponsor.',hint:'Ownership moves from the project team to the sponsor here.'},
      {id:'a9',t:'Hold a review with stakeholders so lessons can be learnt',p:3,o:2,why:'At handover and closeout the project can be reviewed so that lessons may be learnt from stakeholders’ experiences.',hint:'Reviewing the whole project only makes sense once its work is finished.'}]},
    {id:'event',title:'Annual conference',model:'Extended life cycle (also called a product life cycle)',
     brief:'An organisation runs an annual conference. The text says projects related to special events use the extended life cycle, which adds two phases. Place each activity.',
     phases:[
      P('Concept','The need, problem or opportunity is established; proposals are tested for feasibility; go/no-go decision.'),
      P('Definition','Plans are refined; scope, time, cost and quality objectives are elaborated.'),
      P('Implementation','The project management plan is put into action; the deliverables are built.'),
      P('Handover and closeout','Deliverables are handed to the sponsor, accepted, and the project reviewed.'),
      P('Operations','The completed deliverable is used and maintained in service for its intended purpose.'),
      P('Termination','The disposal of the project deliverables at the end of their life.')],
     acts:[
      {id:'b1',t:'Ask: is there a need for a conference, and could we afford it? Write a proposal',p:0,o:1,why:'Establishing the need and testing feasibility with a proposal is Concept.',hint:'Nothing is approved yet.'},
      {id:'b2',t:'Obtain the sponsor’s go/no-go decision on the business case',p:0,o:2,why:'The go/no-go decision ends the Concept stage; the business case is the first formal deliverable to get a gate review.',hint:'A gate review decides whether to continue to the next phase.'},
      {id:'b3',t:'Set the budget, timeline and quality objectives for venue, speakers and programme',p:1,o:1,why:'Defining scope, time, cost and quality objectives in a plan the project manager can use is Definition.',hint:'You are turning an approved idea into a plan.'},
      {id:'b4',t:'Book the venue and confirm speakers while tracking costs against budget',p:2,o:1,why:'Carrying out the plan, with cost monitoring and stakeholder communication, is Implementation.',hint:'The plan is being put into action.'},
      {id:'b5',t:'Hand the finished programme and venue arrangements to the sponsor for formal acceptance',p:3,o:1,why:'Formal acceptance of the deliverables by the sponsor marks handover; ownership shifts from the team to the sponsor.',hint:'Acceptance moves ownership to the sponsor.'},
      {id:'b6',t:'Review the project with stakeholders and capture lessons for next year',p:3,o:2,why:'Reviews at closeout test whether objectives were met and record lessons learnt.',hint:'A review of how the project went, not of the event itself.'},
      {id:'b7',t:'Run the conference days and keep the venue and audio-visual equipment working',p:4,o:1,why:'Operations is the period when the completed deliverable is used and maintained for its intended purpose.',hint:'The deliverable is now actually being used.'},
      {id:'b8',t:'Take down the stands and dispose of the temporary signage at the end of the event',p:5,o:1,why:'Termination is the disposal of project deliverables at the end of their life.',hint:'The deliverable has served its purpose and is being got rid of.'}]},
    {id:'product',title:'New production line (a deliverable)',model:'Product life cycle of a deliverable (Dawson, 2000)',
     brief:'A manufacturer starts a project to develop and install a new production line. Deliverables have life cycles too. Place each activity in the stage of the production line’s own life cycle.',
     phases:[
      P('Analysis','The initial investigative work: its idea, feasibility, definition and planning.'),
      P('Synthesis','The work done to develop (and test) the product.'),
      P('Operation','The implementation, use and maintenance of the product.'),
      P('Retirement','The final withdrawal and replacement of the product.')],
     acts:[
      {id:'c1',t:'Judge whether the idea of a new line is feasible',p:0,o:1,why:'Idea and feasibility belong to Analysis.',hint:'This is initial investigative work.'},
      {id:'c2',t:'Define what the line must do and plan the work',p:0,o:2,why:'Definition and planning are part of Analysis.',hint:'Nothing has been built yet.'},
      {id:'c3',t:'Build the equipment and run acceptance tests on it',p:1,o:1,why:'Synthesis is the work done to develop (and test) the product.',hint:'Developing and testing, before it goes into service.'},
      {id:'c4',t:'Install the new line and start running it in production',p:2,o:1,why:'Operation covers the implementation, use and maintenance of the product.',hint:'Implementation here means putting it into use.'},
      {id:'c5',t:'Service machines and repair breakdowns during daily production',p:2,o:2,why:'Maintenance is part of Operation.',hint:'It is in everyday use now.'},
      {id:'c6',t:'Withdraw the old production line once the new one has proved itself',p:3,o:1,why:'Retirement is the final withdrawal and replacement of the product. Note the overlap: a phased roll-out means the old line’s reduced operation overlaps with the pilot operation of the new one.',hint:'This stage ends the life of the thing being replaced.'}]}
  ];

  /* ---------- Compare view data: all names as given in 4.1 / 5.2 ---------- */
  var MODELS=[
    {id:'basic',name:'Basic project life cycle',src:'APM, 2006',segs:[
      ['Concept',22,'The need, problem or opportunity is established; proposals prepared and tested for feasibility. Ends with the go/no-go decision (business case owned by the sponsor).'],
      ['Definition',22,'Plans refined into one the project manager can use. Scope, time, cost and quality objectives are elaborated.'],
      ['Implementation',34,'The management plan is put into action. Busiest phase: stakeholder communication, cost monitoring, quality control, change management. (Also known as execution.)'],
      ['Handover and closeout',22,'Deliverables handed to the sponsor and formally accepted; ownership shifts; project reviewed and lessons learnt.']]},
    {id:'ext',name:'Extended life cycle (product life cycle)',src:'APM, 2006',segs:[
      ['Concept',14,'As in the basic life cycle.'],['Definition',14,'As in the basic life cycle.'],['Implementation',22,'As in the basic life cycle.'],['Handover and closeout',14,'As in the basic life cycle.'],
      ['Operations',22,'The period during which the completed deliverable is used and maintained in service for its intended purpose.'],
      ['Termination',14,'The disposal of the project deliverables at the end of their life.']]},
    {id:'turner',name:'Plant analogy',src:'Turner, 1999',segs:[
      ['Proposal and initiation',22,'Stage: Germination.'],['Design and appraisal',22,'Stage: Growth.'],['Execution and control',34,'Stage: Maturity.'],['Finalisation and closeout',22,'Stage: Death.']]},
    {id:'ww',name:'Five core-activity phases',src:'Weiss and Wysocki, 1994',segs:[
      ['Define',16,'Looks at the core activities of a project.'],['Plan',16,'Phases may overlap (concurrency) – e.g. planning continues while organising.'],['Organise',16,'Overlap of phases is also called fast tracking.'],['Execute',36,'Execution may start before organisation is complete.'],['Close',16,'Final phase.']]},
    {id:'dawson',name:'Product life cycle of a deliverable',src:'Dawson, 2000',segs:[
      ['Analysis',22,'The initial investigative work: idea, feasibility, definition and planning.'],['Synthesis',30,'The work done to develop (and test) the product.'],['Operation',30,'The implementation, use and maintenance of the product.'],['Retirement',18,'The final withdrawal and replacement of the product.']]},
    {id:'water',name:'Software: classic waterfall',src:'Section 5.2',segs:[
      ['Analysis',20,'Identify the problem and decide what needs to be done.'],['Design',20,'Determine how you will solve the problem.'],['Implementation',20,'Act on the design decisions.'],['Testing',20,'Apply what you have done to find out whether you have solved the problem.'],['Maintenance',20,'Correct errors, adapt, enhance and improve in anticipation of change.']]}
  ];
  var QUIZ=[
    {q:'A project to run an annual sporting event. Which life cycle does the text say suits it?',o:['Basic life cycle','Extended life cycle','Waterfall model'],a:1,e:'Projects related to special events, such as an annual conference or a sporting event, make use of the extended life cycle, which adds Operations and Termination.'},
    {q:'Planning activities carry on while the organisation is already under way and execution has begun. What is this called?',o:['Concurrency (fast tracking)','Gate review','Termination'],a:0,e:'Significant overlap in time between activities in different phases is concurrency; overlapping phases is also called fast tracking, as it lets the project finish in less time.'},
    {q:'Which phase of the basic life cycle ends with a go/no-go decision?',o:['Definition','Implementation','Concept'],a:2,e:'Concept: sufficient plans are made to enable a go/no-go decision, often through a business case owned by the sponsor. The decision forms the end of the stage.'}
  ];

  var CSS='.lcs-tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}'+
  '.lcs-scn{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}'+
  '.lcs-tl{display:flex;gap:3px;margin:12px 0 4px}'+
  '.lcs-tl>div{flex:1;min-width:0;padding:8px 10px 8px 14px;background:var(--surface2);font-size:.78rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.04em;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%,10px 50%);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;transition:background .3s}'+
  '.lcs-tl>div.full{background:var(--ink);color:var(--bg)}.lcs-tl>div.part{background:var(--dot)}'+
  '.lcs-lanes{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-top:10px}'+
  '.lcs-lane{border:1.5px dashed var(--dot);border-radius:var(--r-md);padding:10px;min-height:120px;background:var(--surface);transition:border-color .15s,background .15s}'+
  '.lcs-lane.target{border-color:var(--ink)}.lcs-lane.over{background:var(--surface2);border-style:solid;border-color:var(--ink)}'+
  '.lcs-lane h4{margin:0 0 2px;font-size:1rem;font-weight:500}.lcs-lane .d{font-size:.78rem;color:var(--ink2);margin:0 0 8px;line-height:1.35}'+
  '.lcs-card{display:flex;gap:8px;align-items:flex-start;background:var(--surface2);border:1.5px solid transparent;border-radius:var(--r-sm);padding:9px 10px;margin:0 0 8px;font-size:.9rem;line-height:1.35;cursor:pointer;user-select:none;-webkit-user-select:none;min-height:44px}'+
  '.lcs-card.sel{border-color:var(--ink);background:var(--surface)}.lcs-card.ok{border-color:var(--green)}.lcs-card.no{border-color:var(--red)}'+
  '.lcs-card .g{touch-action:none;color:var(--ink3);font-family:var(--mono);cursor:grab;padding:0 4px;align-self:stretch;display:flex;align-items:center;min-width:24px;justify-content:center}'+
  '.lcs-card .tx{flex:1}.lcs-card .mv{display:flex;gap:6px;width:100%;justify-content:flex-end;margin-top:-2px}.lcs-card{flex-wrap:wrap}'+
  '.lcs-card .mv button{border:0;background:var(--surface);border-radius:8px;width:44px;height:24px;line-height:1;font-size:.7rem;cursor:pointer;padding:0}'+
  '.lcs-ghost{position:fixed;z-index:9998;pointer-events:none;max-width:260px;opacity:.92;background:var(--ink);color:var(--bg);border-radius:var(--r-sm);padding:9px 12px;font-size:.85rem}'+
  '.lcs-pool{min-height:70px}.lcs-pool.over{outline:2px solid var(--ink)}'+
  '.lcs-fb{border-left:3px solid var(--ink3);background:var(--surface2);border-radius:0 var(--r-md) var(--r-md) 0;padding:12px 14px;margin:12px 0 0;font-size:.93rem}'+
  '.lcs-fb.ok{border-color:var(--green)}.lcs-fb.no{border-color:var(--red)}'+
  '.lcs-row{margin:0 0 16px}.lcs-row .nm{font-weight:500}.lcs-row .src{font-size:.78rem;color:var(--ink2)}'+
  '.lcs-seg{display:flex;gap:3px;margin-top:6px;overflow-x:auto}.lcs-seg>button{min-width:84px;border:0;cursor:pointer;min-height:44px;padding:4px 10px 4px 14px;background:var(--surface2);color:var(--ink);font-size:.74rem;text-align:left;line-height:1.15;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,0 100%,8px 50%);overflow:hidden}'+
  '.lcs-seg>button.on{background:var(--ink);color:var(--bg)}'+
  '.lcs-opt{display:block;width:100%;text-align:left;margin:0 0 8px;border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);padding:10px 14px;cursor:pointer;min-height:44px}'+
  '.lcs-opt.ok{border-color:var(--green)}.lcs-opt.no{border-color:var(--red)}'+
  '@media(max-width:560px){.lcs-lanes{grid-template-columns:1fr}.lcs-tl>div{font-size:.62rem;padding-left:12px}.lcs-seg>button{font-size:.62rem;padding-left:12px}}';

  function injectCss(){ if(document.getElementById('lcs-style'))return; var s=document.createElement('style'); s.id='lcs-style'; s.textContent=CSS; document.head.appendChild(s); }

  Tools.register('lifecycle-sort',{title:'Life-cycle sort',desc:'Place activities into the right project life-cycle phase, then compare the models.',
  mount:function(el,ctx){
    injectCss();
    var saved=ctx.load()||{};
    var S={mode:saved.mode||'sort',cur:saved.cur||0,sc:saved.sc||{},cmp:saved.cmp||{sel:'basic:0'},quiz:saved.quiz||{}};
    var sel=null, fb=null, ghost=null;

    function save(){ctx.save(S)}
    function ss(i){ var id=SCEN[i].id; if(!S.sc[id])S.sc[id]={lanes:SCEN[i].phases.map(function(){return []}),miss:{},wrong:{},revealed:false}; return S.sc[id]; }
    function placedIds(i){var a=[]; ss(i).lanes.forEach(function(l){a=a.concat(l)}); return a}
    function actById(i,id){return SCEN[i].acts.filter(function(a){return a.id===id})[0]}
    function isDone(i){var st=ss(i); return placedIds(i).length===SCEN[i].acts.length && SCEN[i].acts.every(function(a){return st.lanes[a.p].indexOf(a.id)>=0})}

    function place(i,id,lane){
      var st=ss(i), a=actById(i,id);
      st.lanes.forEach(function(l){var k=l.indexOf(id); if(k>=0)l.splice(k,1)});
      delete st.wrong[id];
      if(lane==='pool'){ sel=null; fb=null; save(); render(); return; }
      st.lanes[lane].push(id); sel=null;
      var ph=SCEN[i].phases;
      if(a.p===lane){
        fb={ok:true,text:'Correct – '+ph[lane].name+'. '+a.why};
      } else {
        st.miss[id]=true; st.wrong[id]=true;
        fb={ok:false,text:'Not quite. '+a.hint+' (It does not belong in '+ph[lane].name+': “'+ph[lane].desc.split('.')[0]+'”.) Drag or tap it to try another phase.'};
      }
      if(isDone(i)){
        var n=SCEN[i].acts.length, first=SCEN[i].acts.filter(function(x){return !st.miss[x.id]}).length;
        fb.text+=' All placed! '+first+' of '+n+' right first time.';
        var sc=first/n; st.score=sc; if(!st.completed){st.completed=true;}
        var all=SCEN.every(function(s,k){return isDone(k)});
        if(all){ var tot=0; SCEN.forEach(function(s){tot+=(ss(SCEN.indexOf(s)).score||0)}); ctx.complete(tot/SCEN.length); }
      }
      save(); render();
    }
    function move(i,lane,id,dir){var l=ss(i).lanes[lane],k=l.indexOf(id),n=k+dir; if(n<0||n>=l.length)return; l.splice(k,1); l.splice(n,0,id); save(); render();}
    function reveal(i){var st=ss(i); SCEN[i].acts.forEach(function(a){st.miss[a.id]=true}); st.lanes=SCEN[i].phases.map(function(p,k){return SCEN[i].acts.filter(function(a){return a.p===k}).sort(function(a,b){return a.o-b.o}).map(function(a){return a.id})}); st.wrong={}; st.revealed=true; st.score=0; fb={ok:true,text:'Answers revealed. Read each card: the explanation shows why it belongs where it does. Reset to try again.'}; save(); render();}
    function reset(i){delete S.sc[SCEN[i].id]; sel=null; fb=null; save(); render();}

    /* ----- drag / tap ----- */
    function attach(card,i,id){
      card.addEventListener('pointerdown',function(e){
        if(e.pointerType==='touch'&&!e.target.closest('.g'))return;
        if(e.target.closest('.mv'))return;
        var sx=e.clientX,sy=e.clientY,dragging=false,text=card.querySelector('.tx').textContent;
        function mv(ev){
          if(!dragging&&Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>7){dragging=true; ghost=h('div',{class:'lcs-ghost'},text); document.body.appendChild(ghost);}
          if(dragging){ ghost.style.left=(ev.clientX+10)+'px'; ghost.style.top=(ev.clientY+10)+'px'; mark(ev.clientX,ev.clientY); ev.preventDefault();}
        }
        function up(ev){
          document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); document.removeEventListener('pointercancel',up);
          if(ghost){ghost.remove();ghost=null}
          el.querySelectorAll('.over').forEach(function(x){x.classList.remove('over')});
          if(dragging){ var t=document.elementFromPoint(ev.clientX,ev.clientY); var z=t&&t.closest('[data-lane]'); if(z&&el.contains(z)){ var v=z.getAttribute('data-lane'); place(i,id,v==='pool'?'pool':+v); } }
          else { sel=(sel===id?null:id); render(); }
        }
        document.addEventListener('pointermove',mv,{passive:false}); document.addEventListener('pointerup',up); document.addEventListener('pointercancel',up);
      });
    }
    function mark(x,y){ el.querySelectorAll('.over').forEach(function(q){q.classList.remove('over')}); var t=document.elementFromPoint(x,y); var z=t&&t.closest('[data-lane]'); if(z)z.classList.add('over'); }

    /* ----- sort view ----- */
    function cardEl(i,a,inLane){
      var st=ss(i);
      var c=h('div',{class:'lcs-card'+(sel===a.id?' sel':'')+(inLane&&st.wrong[a.id]?' no':'')+(inLane&&!st.wrong[a.id]&&!st.miss[a.id]?' ok':''),'data-act':a.id,role:'button',tabindex:'0','aria-label':a.t},
        h('span',{class:'g','aria-hidden':'true'},'⋮⋮'), h('span',{class:'tx'},a.t));
      attach(c,i,a.id);
      c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel=(sel===a.id?null:a.id);render()}});
      return c;
    }
    function sortView(){
      var i=S.cur, sc=SCEN[i], st=ss(i), box=h('div');
      box.appendChild(h('div',{class:'lcs-scn'},SCEN.map(function(s,k){return h('button',{class:'chip'+(k===i?' on':''),onclick:function(){S.cur=k;sel=null;fb=null;save();render()}},(isDone(k)?'✓ ':'')+(k+1)+'. '+s.title)})));
      box.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},sc.model),h('h3',null,sc.title),h('p',{style:{margin:0}},sc.brief)));
      var placed=placedIds(i), n=sc.acts.length;
      // timeline
      var tl=h('div',{class:'lcs-tl','aria-label':'Timeline of phases'},sc.phases.map(function(p,k){var correct=sc.acts.filter(function(a){return a.p===k}); var okc=correct.filter(function(a){return st.lanes[k].indexOf(a.id)>=0}).length; return h('div',{class:okc===correct.length?'full':(okc>0?'part':''),title:p.name},p.name)}));
      box.appendChild(tl);
      box.appendChild(h('div',{class:'row between tiny muted'},h('span',null,'Time →'),h('span',null,placed.length+' of '+n+' placed')));
      // pool
      var left=sc.acts.filter(function(a){return placed.indexOf(a.id)<0});
      var pool=h('div',{class:'lcs-lane lcs-pool'+(sel?' target':''),'data-lane':'pool',style:{marginTop:'12px'}},
        h('div',{class:'label',style:{marginBottom:'8px'}},left.length?('Activities to place ('+left.length+')'):'All activities placed'));
      left.forEach(function(a){pool.appendChild(cardEl(i,a,false))});
      pool.addEventListener('click',function(e){ if(sel&&!e.target.closest('.lcs-card')){ place(i,sel,'pool'); } });
      box.appendChild(pool);
      box.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'Drag a card (or tap it, then tap a phase) to place it. On a touch screen, drag by the ⋮⋮ handle.'));
      // lanes
      var lanes=h('div',{class:'lcs-lanes'});
      sc.phases.forEach(function(p,k){
        var ln=h('div',{class:'lcs-lane'+(sel?' target':''),'data-lane':String(k)},h('h4',null,(k+1)+'. '+p.name),h('p',{class:'d'},p.desc));
        st.lanes[k].forEach(function(id,idx){
          var a=actById(i,id), c=cardEl(i,a,true);
          var mvb=h('div',{class:'mv'},h('button',{'aria-label':'Move up',onclick:function(e){e.stopPropagation();move(i,k,id,-1)}},'▲'),h('button',{'aria-label':'Move down',onclick:function(e){e.stopPropagation();move(i,k,id,1)}},'▼'));
          if(st.lanes[k].length>1)c.appendChild(mvb);
          ln.appendChild(c);
        });
        ln.addEventListener('click',function(e){ if(sel&&!e.target.closest('.lcs-card')) place(i,sel,k); });
        lanes.appendChild(ln);
      });
      box.appendChild(lanes);
      if(fb) box.appendChild(h('div',{class:'lcs-fb '+(fb.ok?'ok':'no'),role:'status','aria-live':'polite'},fb.text));
      if(isDone(i)){
        var seqOk=0,seqTot=0;
        sc.phases.forEach(function(p,k){ var ids=st.lanes[k]; ids.forEach(function(id,idx){seqTot++; var a=actById(i,id); var prev=ids.slice(0,idx).every(function(q){return actById(i,q).o<a.o}); if(prev)seqOk++}) });
        box.appendChild(h('div',{class:'card flat',style:{marginTop:'12px'}},h('div',{class:'label'},'Result'),
          h('p',null,'Every activity is in the right phase. Order within phases: '+seqOk+' of '+seqTot+' in a sensible sequence'+(seqOk<seqTot?' – use the ▲▼ buttons to reorder inside a phase.':'.')),
          h('p',{class:'muted tiny',style:{margin:0}},'Remember: the change from one phase to the next is not necessarily abrupt. Real projects show concurrency (overlap), and models are only models – real life is more chaotic.')));
      }
      box.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},
        h('button',{class:'btn ghost',onclick:function(){reset(i)}},'Reset scenario'),
        h('button',{class:'btn ghost',disabled:isDone(i)||undefined,onclick:function(){reveal(i)}},'Reveal answers'),
        i<SCEN.length-1?h('button',{class:'btn primary',onclick:function(){S.cur=i+1;sel=null;fb=null;save();render()}},'Next scenario'):h('button',{class:'btn primary',onclick:function(){S.mode='cmp';save();render()}},'Compare models')));
      return box;
    }

    /* ----- compare view ----- */
    function cmpView(){
      var box=h('div');
      box.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Compare life-cycle models'),
        h('p',{style:{margin:'4px 0 0'}},'There is no single life cycle for every project. Tap any phase to read what it covers. Rows are lined up on a rough time axis (an approximation, not exact durations from the text).')));
      var cur=(S.cmp.sel||'basic:0').split(':'), curM=cur[0], curS=+cur[1];
      MODELS.forEach(function(m){
        var row=h('div',{class:'lcs-row'},h('div',{class:'nm'},m.name),h('div',{class:'src'},m.src));
        row.appendChild(h('div',{class:'lcs-seg'},m.segs.map(function(s,k){
          var on=(curM===m.id&&curS===k);
          return h('button',{class:on?'on':'',style:{flex:String(s[1])+' 1 0'},onclick:function(){S.cmp.sel=m.id+':'+k;save();render()}},s[0]);
        })));
        box.appendChild(row);
      });
      var m=MODELS.filter(function(x){return x.id===curM})[0]||MODELS[0], seg=m.segs[curS]||m.segs[0];
      box.appendChild(h('div',{class:'card flat',role:'status','aria-live':'polite'},h('div',{class:'label'},m.name+' – '+m.src),h('h3',null,seg[0]),h('p',{style:{margin:0}},seg[2])));
      box.appendChild(h('div',{class:'card'},h('div',{class:'label'},'What to notice'),h('ul',{style:{margin:'6px 0 0',paddingLeft:'20px'}},
        h('li',null,'The basic and extended cycles share their first four phases; the extended one adds Operations and Termination.'),
        h('li',null,'Turner’s plant analogy (germination, growth, maturity, death) covers the same ground as the basic cycle with different names.'),
        h('li',null,'Weiss and Wysocki split the core activities into five phases; their phases overlap (concurrency / fast tracking).'),
        h('li',null,'Dawson’s product life cycle is about the deliverable itself, so it is broader than the project’s basic life cycle.'),
        h('li',null,'The software waterfall lists the five activities of analysis, design, implementation, testing and maintenance in a single sequence. Chapter 5 compares it with iterative and incremental alternatives.'),
        h('li',null,'More important than the model are the milestones and deliverables agreed in the project plan.'))));
      // quiz
      var qb=h('div',{class:'card'},h('div',{class:'label'},'Check yourself'));
      QUIZ.forEach(function(q,qi){
        var ans=S.quiz[qi];
        var blk=h('div',{style:{margin:'10px 0 0'}},h('p',{style:{fontWeight:500,marginBottom:'8px'}},q.q));
        q.o.forEach(function(o,oi){
          var cls='lcs-opt'+(ans!=null?(oi===q.a?' ok':(oi===ans?' no':'')):'');
          blk.appendChild(h('button',{class:cls,onclick:function(){if(S.quiz[qi]!=null)return;S.quiz[qi]=oi;save();render()}},o));
        });
        if(ans!=null)blk.appendChild(h('div',{class:'lcs-fb '+(ans===q.a?'ok':'no'),role:'status'},(ans===q.a?'Correct. ':'Not quite. ')+q.e));
        qb.appendChild(blk);
      });
      qb.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},h('button',{class:'btn ghost sm',onclick:function(){S.quiz={};save();render()}},'Reset questions')));
      box.appendChild(qb);
      return box;
    }

    function render(){
      el.innerHTML='';
      var root=h('div',{class:'tool'});
      root.appendChild(h('div',{class:'lcs-tabs'},
        h('button',{class:'chip'+(S.mode==='sort'?' on':''),onclick:function(){S.mode='sort';save();render()}},'Sort game'),
        h('button',{class:'chip'+(S.mode==='cmp'?' on':''),onclick:function(){S.mode='cmp';save();render()}},'Compare models')));
      root.appendChild(S.mode==='sort'?sortView():cmpView());
      el.appendChild(root);
    }
    render();
  }});
})();

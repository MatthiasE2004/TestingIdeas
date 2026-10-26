/* risk-matrix: Risk and uncertainty (PM course section 2.4). Rate likelihood x impact, heat map, response strategies */
(function(){
  var h=H.h;
  var CSS='\
.rm-wrap{display:flex;flex-direction:column;gap:14px}\
.rm-wrap .card{margin:0}\
.rm-steps{display:flex;gap:8px;flex-wrap:wrap}\
.rm-step{font-family:var(--mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;padding:6px 12px;border-radius:99px;border:1.5px solid var(--line);color:var(--ink2);background:transparent;cursor:pointer;min-height:34px}\
.rm-step.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}\
.rm-step[disabled]{opacity:.4;pointer-events:none}\
.rm-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:16px}\
@media(max-width:720px){.rm-layout{grid-template-columns:1fr}}\
.rm-list{display:flex;flex-direction:column;gap:6px}\
.rm-item{display:flex;align-items:center;gap:10px;text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:16px;padding:8px 12px;min-height:48px;cursor:pointer;width:100%}\
.rm-item.sel{border-color:var(--ink);background:var(--surface2)}\
.rm-num{flex:none;width:28px;height:28px;border-radius:50%;background:var(--ink);color:var(--bg);font-family:var(--mono);font-size:.75rem;display:flex;align-items:center;justify-content:center}\
.rm-num.own{background:var(--red);color:#fff}\
.rm-tag{font-family:var(--mono);font-size:.68rem;color:var(--ink2);margin-left:auto;white-space:nowrap}\
.rm-gridwrap{display:grid;grid-template-columns:22px 1fr;gap:6px}\
.rm-ylab,.rm-xrow .rm-xlab{font-size:.55rem;letter-spacing:0}.rm-xlab{font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}\
.rm-ylab{writing-mode:vertical-rl;transform:rotate(180deg);text-align:center}\
.rm-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}\
.rm-cell{position:relative;height:56px;min-width:0;border:1.5px solid transparent;border-radius:10px;cursor:pointer;padding:2px;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:1px;overflow:hidden;font-family:var(--mono);font-size:.62rem;color:var(--ink2)}\
.rm-cell.b1{background:rgba(62,142,82,.22)}.rm-cell.b2{background:rgba(201,138,0,.28)}.rm-cell.b3{background:rgba(215,25,33,.28)}.rm-cell.b4{background:rgba(215,25,33,.6);color:#fff}\
.rm-cell.cur{border-color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}\
.rm-dot{width:16px;height:16px;flex:none;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:.52rem;font-family:var(--mono)}\
.rm-dot.own{background:var(--red);color:#fff;outline:1.5px solid #fff}\
.rm-dot.ex{background:transparent;color:var(--ink);border:1.5px dashed var(--ink)}\
.rm-xrow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin-top:4px;text-align:center}\
.rm-yrow{display:grid;grid-template-rows:repeat(5,1fr);gap:4px}\
.rm-yrow span{display:flex;align-items:center;justify-content:flex-end;font-family:var(--mono);font-size:.55rem;color:var(--ink2);text-transform:uppercase;text-align:right;line-height:1.1}\
.rm-band{display:inline-block;border-radius:99px;padding:1px 9px;font-family:var(--mono);font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;border:1.5px solid var(--line)}\
.rm-band.b3,.rm-band.b4{background:var(--red);color:#fff;border-color:var(--red)}\
.rm-band.b2{background:var(--amber);color:#fff;border-color:var(--amber)}\
.rm-band.b1{background:var(--green);color:#fff;border-color:var(--green)}\
.rm-strat{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}\
@media(max-width:560px){.rm-strat{grid-template-columns:1fr 1fr}}\
.rm-sbtn{border:1.5px solid var(--line);background:var(--surface);border-radius:14px;min-height:44px;padding:6px 8px;cursor:pointer;font-weight:500}\
.rm-sbtn.sel{background:var(--ink);color:var(--bg);border-color:var(--ink)}\
.rm-sbtn.right{border-color:var(--green);box-shadow:inset 0 0 0 1.5px var(--green)}\
.rm-fb{margin-top:8px;font-size:.92rem}\
.rm-rcard{border:1.5px dashed var(--line);border-radius:var(--r-md);padding:12px;margin-bottom:10px}\
';
  var LK=['Rare','Unlikely','Possible','Likely','Almost certain'],IM=['Negligible','Minor','Moderate','Major','Severe'];
  var STR={avoid:'Avoid',reduce:'Reduce',transfer:'Transfer',accept:'Accept'};
  var STRDEF={avoid:'Change the plan so the risk cannot happen (drop the activity, choose another route).',reduce:'Take action to cut the likelihood and/or the impact (training, testing, contingency, phasing).',transfer:'Shift the financial consequence to someone else (insurance, fixed-price or penalty contract, warranty).',accept:'Do nothing now; monitor it, and set aside a contingency if the cost is tolerable.'};

  /* scenario: the FatPac Haulage project from section 2.3, risks use the categories the text lists (Crockford; Edwards & Bowen; three dimensions of risk) */
  var RISKS=[
    {id:'r1',name:'Fire at the rebuilt depot',cat:'Fire and natural disaster',desc:'The old depot has only a primitive sprinkler system and stores fuel, tyres and vehicles. A serious fire after the move would stop the whole business.',l:2,i:5,s:'transfer',alt:['reduce'],why:'Fire is unlikely but catastrophic. The classic response to a low-likelihood, severe-impact risk is to transfer the loss by insurance (the text notes insurance savings are a project benefit) while the new sprinkler system also reduces it.'},
    {id:'r2',name:'Construction costs far above estimate',cat:'Size and novelty (cost variation)',desc:'The depot rebuild includes new insulation, sprinklers and an in-house maintenance workshop. Large, novel projects often overrun their estimates.',l:4,i:4,s:'reduce',alt:['transfer'],why:'The text warns that cost variation grows with size and novelty. Likely and serious, so reduce it: detailed estimates, contingency, phased build and tight change control. A fixed-price contract can also transfer part of it.'},
    {id:'r3',name:'New lorries delivered late',cat:'Technical risk',desc:'The supplier of the five replacement lorries is a small firm; the old lorries are breaking down more each month.',l:3,i:3,s:'transfer',alt:['reduce'],why:'A supply risk is best moved to the supplier through the contract (delivery dates with penalty clauses). You can also reduce it by checking the supplier and ordering early.'},
    {id:'r4',name:'Staff cannot run the new maintenance workshop',cat:'Technological maturity',desc:'Lorry maintenance was outsourced until now. The workshop uses equipment and methods that are new to FatPac.',l:3,i:3,s:'reduce',alt:[],why:'Unfamiliar technology is one of the three dimensions of risk. Reduce it with training, vendor support and a trial period. It cannot be insured or avoided without losing the project benefit.'},
    {id:'r5',name:'Drivers’ strike during the changeover',cat:'Labour risk',desc:'Payroll changes and new working patterns come with the new depot. Unions have complained about the plans.',l:2,i:4,s:'reduce',alt:['accept'],why:'Labour risk is reduced by early consultation and communication with staff. At low likelihood some would accept it with a contingency plan, but consultation is cheap.'},
    {id:'r6',name:'Extra business does not materialise',cat:'Marketing risk',desc:'The case assumes faster, more reliable service wins extra contracts. Competitors may cut prices.',l:3,i:5,s:'reduce',alt:['avoid'],why:'The benefits of the whole project depend on this. Reduce it with market research, letters of intent from customers, and phasing spend. Avoid applies only if evidence is weak enough to drop the proposal.'},
    {id:'r7',name:'Serious road accident / product liability claim',cat:'Accident and liability',desc:'More lorries, more miles and more goods carried raise the chance of an accident or a damaged-goods claim.',l:2,i:5,s:'transfer',alt:['reduce'],why:'Liability losses can be enormous but are insurable. Transfer through insurance, and reduce through driver training and vehicle checks.'},
    {id:'r8',name:'Residents protest at depot expansion',cat:'Political and social risk',desc:'Neighbours worry about noise and lorry movements at night. A demonstration could delay planning consent.',l:3,i:2,s:'reduce',alt:['accept'],why:'Low impact but fairly likely: reduce it through early consultation, noise controls and sensible lorry routes. Accepting is reasonable if the delay would be small.'},
    {id:'r9',name:'Heavy storms delay building work',cat:'Natural risk: climate',desc:'The rebuild runs over winter. Bad weather may halt work for a few days at a time.',l:3,i:2,s:'accept',alt:['transfer'],why:'Delays are minor and cannot be prevented. Accept it and allow some slack in the schedule (insurance for weather delays would cost more than it saves).'},
    {id:'r10',name:'Fuel prices rise and erode the savings',cat:'Economic risk',desc:'Fuel savings are a large part of the revenue inflows in Table 6. Fuel costs may rise faster than the general rate of inflation.',l:4,i:3,s:'reduce',alt:['transfer','accept'],why:'Likely and moderate. Reduce exposure with fuel-efficient lorries and fuel surcharges in customer contracts; a fixed-price fuel contract can transfer it. Note the text says rising fuel prices actually increase the value of a fuel saving, so some would accept it.'}
  ];
  function band(s){return s>=17?4:s>=10?3:s>=5?2:1}
  var BN={1:'low',2:'medium',3:'high',4:'extreme'};
  function ownHint(l,i){var s=l*i;
    if(s>=17)return 'Very high score: look hard at avoiding it, otherwise reduce it urgently and transfer what you can.';
    if(l<=2&&i>=4)return 'Unlikely but severe: the usual answer is to transfer it (insurance, contract) and prepare a contingency.';
    if(s>=10)return 'High score: reduce it. Cut the likelihood and/or impact with specific actions and assign an owner.';
    if(s>=5)return 'Medium score: reduce it if the action is cheap, otherwise monitor it with a contingency.';
    return 'Low score: accept it, but keep it on the register and review it.';}

  Tools.register('risk-matrix',{title:'Risk matrix',desc:'Rate, map and respond to project risks',
  mount:function(el,ctx){
    var st=ctx.load()||{};
    st.stage=st.stage||1;st.ratings=st.ratings||{};st.strat=st.strat||{};st.custom=st.custom||[];st.sel=st.sel||'r1';st.showExpert=!!st.showExpert;
    function save(){ctx.save(st)}
    el.innerHTML='';el.appendChild(h('style',null,CSS));
    var root=h('div',{class:'rm-wrap tool'});el.appendChild(root);
    function all(){return RISKS.concat(st.custom.map(function(c){return {id:c.id,name:c.name,cat:'Your own risk',desc:c.desc||'',own:true}}))}
    function rated(r){return st.ratings[r.id]&&st.ratings[r.id].l&&st.ratings[r.id].i}
    function idx(r){var a=all();for(var k=0;k<a.length;k++)if(a[k].id===r.id)return k+1;return 0}
    function allRated(){return all().every(rated)}
    function allStrat(){return all().every(function(r){return st.strat[r.id]})}
    function score(r){var x=st.ratings[r.id];return x?x.l*x.i:0}

    function render(){
      root.innerHTML='';
      root.appendChild(header());
      if(st.stage===1)root.appendChild(stage1());
      else if(st.stage===2)root.appendChild(stage2());
      else root.appendChild(stage3());
    }
    function header(){
      var c=h('div',{class:'card'});
      c.appendChild(h('div',{class:'label'},'Risk and uncertainty'));
      c.appendChild(h('p',{style:{margin:'6px 0 10px'}},'Scenario: FatPac Haulage is about to replace its lorries and rebuild its depot (the section 2.3 case). Ten risks have been identified. Rate each one, see the heat map, then decide how to respond.'));
      var s=h('div',{class:'rm-steps'});
      [['1','Rate'],['2','Heat map'],['3','Respond']].forEach(function(x,k){
        var n=k+1,dis=(n===2&&!allRated())||(n===3&&!allRated());
        s.appendChild(h('button',{class:'rm-step'+(st.stage===n?' on':''),'data-stage':n,disabled:dis,onclick:function(){st.stage=n;save();render()}},x[0]+' · '+x[1]));
      });
      c.appendChild(s);
      c.appendChild(h('details',{style:{marginTop:'10px'}},h('summary',{class:'muted tiny',style:{cursor:'pointer',minHeight:'30px'}},'Risk vs uncertainty (from the text)'),
        h('p',{class:'muted',style:{fontSize:'.9rem',margin:'6px 0 0'}},'Risk is the chance of adverse consequences or loss, where the probability can be assessed. Uncertainty means doubt about the data, or too little knowledge, which can only be addressed by gathering more information. Four aspects of risk: probability of the event, its nature, its consequences and the period of exposure. Score = likelihood × impact.')));
      return c;
    }

    function gridEl(opts){
      // opts: {onTap, cur:{l,i}, dots:[{n,l,i,cls}]}
      var wrap=h('div',{class:'rm-gridwrap'});
      wrap.appendChild(h('div',{class:'rm-ylab'},'Likelihood →'));
      var right=h('div',{style:{minWidth:0}});
      var g=h('div',{style:{display:'grid',gridTemplateColumns:'54px minmax(0,1fr)',gap:'6px'}});
      var yrow=h('div',{class:'rm-yrow'});
      for(var l=5;l>=1;l--)yrow.appendChild(h('span',null,LK[l-1]));
      var grid=h('div',{class:'rm-grid'});
      for(var l2=5;l2>=1;l2--)for(var i=1;i<=5;i++)(function(l,i){
        var cell=h('div',{class:'rm-cell b'+band(l*i)+(opts.cur&&opts.cur.l===l&&opts.cur.i===i?' cur':''),'data-l':l,'data-i':i,role:opts.onTap?'button':null,tabindex:opts.onTap?'0':null,'aria-label':'Likelihood '+l+' impact '+i,
          onclick:opts.onTap?function(){opts.onTap(l,i)}:null,onkeydown:opts.onTap?function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();opts.onTap(l,i)}}:null});
        var here=(opts.dots||[]).filter(function(d){return d.l===l&&d.i===i});
        if(here.length)here.forEach(function(d){cell.appendChild(h('div',{class:'rm-dot '+(d.cls||''),title:d.title||''},String(d.n)))});
        else cell.appendChild(document.createTextNode(String(l*i)));
        grid.appendChild(cell);
      })(l2,i);
      g.appendChild(yrow);g.appendChild(grid);right.appendChild(g);
      var xr=h('div',{class:'rm-xrow',style:{marginLeft:'60px'}});IM.forEach(function(n){xr.appendChild(h('span',{class:'rm-xlab'},n==='Negligible'?'Negl.':n==='Moderate'?'Mod.':n))});
      right.appendChild(xr);
      right.appendChild(h('div',{class:'rm-xlab',style:{textAlign:'center',marginTop:'4px',marginLeft:'60px'}},'Impact →'));
      wrap.appendChild(right);return wrap;
    }

    /* ---- Stage 1: rate ---- */
    function stage1(){
      var c=h('div',{class:'card'});
      var list=all();var cur=list.filter(function(r){return r.id===st.sel})[0]||list[0];st.sel=cur.id;
      var n=list.filter(rated).length;
      c.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'Step 1 · How likely, how bad?'),h('span',{class:'rm-tag','data-progress':'1'},n+' / '+list.length+' rated')));
      c.appendChild(h('div',{class:'bar',style:{margin:'8px 0 14px'}},h('i',{style:{width:(100*n/list.length)+'%'}})));
      var lay=h('div',{class:'rm-layout'});
      var L=h('div',{class:'rm-list'});
      list.forEach(function(r){
        var x=st.ratings[r.id];
        L.appendChild(h('button',{class:'rm-item'+(r.id===cur.id?' sel':''),'data-risk':r.id,onclick:function(){st.sel=r.id;save();render()}},
          h('span',{class:'rm-num'+(r.own?' own':'')},String(idx(r))),h('span',{style:{fontSize:'.92rem',lineHeight:1.25}},r.name),
          h('span',{class:'rm-tag'},x&&x.l&&x.i?'L'+x.l+' × I'+x.i+' = '+x.l*x.i:'tap to rate')));
      });
      L.appendChild(addOwn());
      lay.appendChild(L);
      var R=h('div');
      R.appendChild(h('div',{class:'label'},cur.cat));
      R.appendChild(h('h3',{style:{margin:'4px 0'}},idx(cur)+'. '+cur.name));
      if(cur.desc)R.appendChild(h('p',{class:'muted',style:{fontSize:'.92rem'}},cur.desc));
      var x=st.ratings[cur.id]||{};
      R.appendChild(gridEl({cur:x.l?x:null,onTap:function(l,i){st.ratings[cur.id]={l:l,i:i};
        // advance to next unrated
        var nxt=all().filter(function(q){return !rated(q)})[0];if(nxt)st.sel=nxt.id;save();render();}}));
      R.appendChild(h('p',{class:'muted tiny','data-readout':'1',style:{margin:'10px 0 0'}},x.l?'Likelihood: '+LK[x.l-1]+' ('+x.l+') · Impact: '+IM[x.i-1]+' ('+x.i+') · Score '+x.l*x.i+' ('+BN[band(x.l*x.i)]+')':'Tap the cell where this risk belongs: row = how likely, column = how severe the consequence.'));
      lay.appendChild(R);c.appendChild(lay);
      var go=h('button',{class:'btn primary','data-act':'toheat',disabled:!allRated(),style:{marginTop:'14px'},onclick:function(){st.stage=2;save();render()}},'See the heat map');
      c.appendChild(h('div',{class:'row between'},go,h('button',{class:'btn ghost sm','data-act':'reset',onclick:function(){if(!confirm('Clear all ratings and responses?'))return;st.ratings={};st.strat={};st.custom=[];st.stage=1;st.sel='r1';st.done=false;save();render()}},'Reset')));
      return c;
    }
    function addOwn(){
      var box=h('div',{style:{marginTop:'8px'}});
      var inp=h('input',{class:'input','data-own':'name',placeholder:'Add your own risk (e.g. key supplier goes bust)',maxlength:'80','aria-label':'Add your own risk'});
      var add=function(){var v=inp.value.trim();if(!v)return;if(st.custom.length>=6){ctx.toast('Up to 6 own risks');return}
        var id='c'+Date.now();st.custom.push({id:id,name:v});st.sel=id;save();render()};
      inp.addEventListener('keydown',function(e){if(e.key==='Enter')add()});
      box.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap'}},inp,h('button',{class:'btn sm','data-act':'addown',onclick:add},'Add')));
      return box;
    }

    /* ---- Stage 2: heat map ---- */
    function stage2(){
      var c=h('div',{class:'card'});var list=all();
      c.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'Step 2 · Heat map and ranking'),
        h('button',{class:'chip'+(st.showExpert?' on':''),'data-act':'expert',onclick:function(){st.showExpert=!st.showExpert;save();render()}},st.showExpert?'Hide expert positions':'Show expert positions')));
      var dots=list.map(function(r){var x=st.ratings[r.id];return {n:idx(r),l:x.l,i:x.i,cls:r.own?'own':'',title:r.name}});
      var ex=[];if(st.showExpert)RISKS.forEach(function(r,k){ex.push({n:k+1,l:r.l,i:r.i,cls:'ex',title:'Expert: '+r.name})});
      var lay=h('div',{class:'rm-layout'});
      lay.appendChild(h('div',null,gridEl({dots:dots.concat(ex)}),h('p',{class:'muted tiny',style:{margin:'8px 0 0'}},'Solid = your rating'+(st.showExpert?'; dashed = expert rating':'')+'. Colour = score band: green low (1–4), amber medium (5–9), red high (10–16), dark red extreme (17–25).')));
      var rank=list.slice().sort(function(a,b){return score(b)-score(a)||idx(a)-idx(b)});
      var T=h('table',{class:'tbl','data-rank':'1'});
      T.appendChild(h('thead',null,h('tr',null,h('th',null,'#'),h('th',null,'Risk'),h('th',null,'Score'),h('th',null,st.showExpert?'Expert':'Band'))));
      var tb=h('tbody');
      rank.forEach(function(r,k){var s=score(r);var e=r.own?null:r;
        tb.appendChild(h('tr',null,h('td',null,String(idx(r))),h('td',null,r.name),h('td',null,h('b',null,String(s))),
          h('td',null,st.showExpert&&e?h('span',{class:'muted tiny'},'L'+e.l+' I'+e.i+' = '+e.l*e.i):h('span',{class:'rm-band b'+band(s)},BN[band(s)]))));});
      T.appendChild(tb);lay.appendChild(h('div',{style:{minWidth:0}},h('div',{class:'label',style:{marginBottom:'6px'}},'Ranked by score (likelihood × impact)'),h('div',{style:{overflowX:'auto'}},T)));
      c.appendChild(lay);
      // accuracy
      var near=0,tot=0,off=[];RISKS.forEach(function(r){var x=st.ratings[r.id];if(!x)return;tot++;if(Math.abs(x.l-r.l)<=1&&Math.abs(x.i-r.i)<=1)near++;else off.push(r)});
      var fb=h('div',{class:'callout note',style:{marginTop:'12px'}},h('b',null,'Compared with the expert: '),near+' of '+tot+' risks within one square. '+(off.length?'Biggest differences: '+off.slice(0,3).map(function(r){var x=st.ratings[r.id];return r.name+' (you L'+x.l+' I'+x.i+', expert L'+r.l+' I'+r.i+')'}).join('; ')+'. Press "Show expert positions" to see them.':'Your risk picture is very close to the expert view.'));
      fb.setAttribute('data-accuracy',near+'/'+tot);
      c.appendChild(fb);
      c.appendChild(h('p',{class:'muted',style:{fontSize:'.9rem'}},'Ratings are judgements, not facts: reasonable people differ by a square. The point of the map is to focus attention on the top-right corner first, and to escalate those risks to the people who decide.'));
      c.appendChild(h('div',{class:'row'},h('button',{class:'btn ghost','data-act':'back1',onclick:function(){st.stage=1;save();render()}},'Adjust ratings'),h('button',{class:'btn primary','data-act':'to3',onclick:function(){st.stage=3;save();render()}},'Choose responses')));
      return c;
    }

    /* ---- Stage 3: responses ---- */
    function stage3(){
      var c=h('div',{class:'card'});var list=all();
      var rank=list.slice().sort(function(a,b){return score(b)-score(a)||idx(a)-idx(b)});
      c.appendChild(h('div',{class:'label'},'Step 3 · How will you respond?'));
      var defs=h('div',{class:'grid g2',style:{margin:'8px 0 14px'}});
      Object.keys(STR).forEach(function(k){defs.appendChild(h('div',{class:'card flat',style:{padding:'10px 14px',margin:0}},h('b',null,STR[k]),h('div',{class:'muted tiny'},STRDEF[k])))});
      c.appendChild(defs);
      rank.forEach(function(r){
        var s=score(r),pick=st.strat[r.id];
        var box=h('div',{class:'rm-rcard','data-resp':r.id});
        box.appendChild(h('div',{class:'row'},h('span',{class:'rm-num'+(r.own?' own':'')},String(idx(r))),h('b',null,r.name),h('span',{class:'rm-band b'+band(s),style:{marginLeft:'auto'}},'score '+s)));
        var sb=h('div',{class:'rm-strat'});
        Object.keys(STR).forEach(function(k){
          var cls='rm-sbtn'+(pick===k?' sel':'');
          sb.appendChild(h('button',{class:cls,'data-strat':k,onclick:function(){st.strat[r.id]=k;save();if(allStrat()&&!st.done){st.done=true;save();ctx.complete(finalScore())}render()}},STR[k]));
        });
        box.appendChild(sb);
        if(pick){
          var fb=h('div',{class:'rm-fb'});
          if(r.own){
            fb.appendChild(h('div',null,h('b',null,'Rule of thumb: '),ownHint(st.ratings[r.id].l,st.ratings[r.id].i)));
            if(ctx.ai&&ctx.ai.available&&ctx.ai.available()){
              var out=h('div',{class:'ai-box',style:{marginTop:'8px',display:'none'}});
              fb.appendChild(h('button',{class:'btn sm ghost',style:{marginTop:'8px'},onclick:function(){
                out.style.display='block';out.textContent='Thinking...';
                ctx.ai.ask({system:'You are a project risk coach. Reply in under 80 words, plain text.',prompt:'Risk: '+r.name+'. Likelihood '+st.ratings[r.id].l+'/5, impact '+st.ratings[r.id].i+'/5. The learner chose to '+STR[pick].toLowerCase()+' it. Say if that is sensible and give one concrete action.',maxTokens:140,temperature:.4,onToken:function(t){out.textContent=t}}).then(function(t){out.textContent=t}).catch(function(){out.textContent='AI unavailable, use the rule of thumb above.'})}},'Ask AI to critique'));
              fb.appendChild(out);
            }
          }else{
            var ok=pick===r.s,alt=r.alt.indexOf(pick)>=0;
            fb.appendChild(h('div',{class:ok?'ok':alt?'':'bad','data-result':ok?'best':alt?'ok':'miss'},h('b',null,ok?'Matches the expert answer: '+STR[r.s]+'.':alt?'Reasonable. The expert prefers '+STR[r.s]+', but '+STR[pick].toLowerCase()+' is defensible.':'The expert would '+STR[r.s].toLowerCase()+' this one.')));
            fb.appendChild(h('div',{class:'muted',style:{marginTop:'4px'}},r.why));
          }
          box.appendChild(fb);
        }
        c.appendChild(box);
      });
      var done=allStrat();
      if(done){var sc=finalScore();
        c.appendChild(h('div',{class:'callout tip','data-final':'1'},h('b',null,'Result: '),Math.round(sc*100)+'% — rating accuracy plus response choices against the expert answers. Strategies are often combined in practice (for example reduce and transfer); the key is that every high-score risk has a named response and owner.'));}
      else c.appendChild(h('p',{class:'muted tiny'},list.filter(function(r){return !st.strat[r.id]}).length+' risks still need a response.'));
      c.appendChild(h('div',{class:'row'},h('button',{class:'btn ghost','data-act':'back2',onclick:function(){st.stage=2;save();render()}},'Back to heat map'),
        h('button',{class:'btn ghost sm','data-act':'resetstrat',onclick:function(){st.strat={};st.done=false;save();render()}},'Clear responses')));
      return c;
    }
    function finalScore(){var pts=0,n=0;
      RISKS.forEach(function(r){var x=st.ratings[r.id];n+=2;if(x&&Math.abs(x.l-r.l)<=1&&Math.abs(x.i-r.i)<=1)pts++;var p=st.strat[r.id];if(p===r.s)pts++;else if(r.alt.indexOf(p)>=0)pts+=.5});
      return n?pts/n:0}
    render();
  }});
})();

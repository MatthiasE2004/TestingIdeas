/* decision-matrix: Aids to decision making (PM course section 3.1 / 3.2): weighted criteria scoring + decision tree / expected monetary value */
(function(){
  var h=H.h;
  var CSS='\
.dm-wrap{display:flex;flex-direction:column;gap:14px}\
.dm-wrap .card{margin:0}\
.dm-tabs{display:flex;gap:8px;flex-wrap:wrap}\
.dm-tab{border:1.5px solid var(--line);background:transparent;border-radius:99px;padding:8px 18px;min-height:44px;cursor:pointer;font-weight:500}\
.dm-tab.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}\
.dm-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\
.dm-tbl{width:100%;min-width:560px;border-collapse:collapse;font-size:.92rem}\
.dm-tbl th{font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);text-align:center;padding:6px 4px;border-bottom:1.5px solid var(--ink);font-weight:400;vertical-align:bottom}\
.dm-tbl td{padding:6px 4px;border-bottom:1px dotted var(--line);text-align:center;vertical-align:middle}\
.dm-tbl td:first-child,.dm-tbl th:first-child{text-align:left}\
.dm-in{width:100%;min-width:80px;min-height:44px;border:1.5px solid var(--line);background:var(--surface);border-radius:12px;padding:6px 10px;outline:none}\
.dm-in:focus{border-color:var(--ink)}\
.dm-in.num{text-align:right;min-width:64px}\
.dm-sel{min-height:44px;min-width:56px;border:1.5px solid var(--line);background:var(--surface);border-radius:12px;padding:4px 8px}\
.dm-range{width:100%;min-width:110px;height:44px;accent-color:var(--ink)}\
.dm-rank{display:flex;flex-direction:column;gap:8px}\
.dm-rrow{display:grid;grid-template-columns:28px minmax(70px,1.2fr) 3fr 54px;gap:8px;align-items:center}\
.dm-rrow .bar{height:14px}\
.dm-win .bar>i{background:var(--red)}\
.dm-flip{border-left:3px solid var(--red);background:var(--surface2);border-radius:0 var(--r-md) var(--r-md) 0;padding:10px 14px;margin-bottom:8px;font-size:.92rem}\
.dm-flip.safe{border-color:var(--green)}\
.dm-node{border:1.5px dashed var(--line);border-radius:var(--r-md);padding:10px;margin-top:8px;background:var(--surface)}\
.dm-kind{display:flex;gap:6px;flex-wrap:wrap;align-items:center}\
.dm-kbtn{border:1.5px solid var(--line);background:var(--surface);border-radius:99px;padding:4px 12px;min-height:36px;cursor:pointer;font-size:.85rem}\
.dm-kbtn.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}\
.dm-br{display:grid;grid-template-columns:minmax(0,1fr);gap:6px;border-left:2px dotted var(--ink3);margin:8px 0 0 6px;padding-left:10px}\
.dm-brhead{display:flex;gap:6px;flex-wrap:wrap;align-items:center}\
.dm-brhead .dm-in{min-width:0}\
.dm-best{outline:2px solid var(--red);outline-offset:2px}\
.dm-pruned{opacity:.55}\
.dm-emv{font-family:var(--mono);font-size:.78rem;background:var(--ink);color:var(--bg);border-radius:99px;padding:2px 10px;white-space:nowrap}\
.dm-leaf{font-family:var(--mono);font-size:.78rem;border:1.5px solid var(--ink);border-radius:8px;padding:2px 8px}\
.dm-warn{color:var(--red);font-size:.85rem}\
.dm-svg{display:block;background:var(--surface2);border-radius:var(--r-md)}\
.dm-svg text{font-family:var(--mono);font-size:11px;fill:var(--ink)}\
.dm-svg text.s{fill:var(--ink2);font-size:10px}\
';
  var SCALE={1:'Unacceptable',2:'Unfavourable',3:'Adequate',4:'Favourable',5:'Most favourable'};
  function f1(n,d){return (Math.round(n*Math.pow(10,d==null?1:d))/Math.pow(10,d==null?1:d)).toString()}
  function fk(n){var s=(Math.round(n*100)/100).toString();return (n<0?'–':'')+'£'+s.replace('-','')+'k'}

  /* ---------- weighted-criteria presets ---------- */
  var WPRE=[
    {id:'pkg',label:'Buy or build the package',note:'The software-package decision from the text, scored with weighted criteria instead of EMV. The text teaches the method, so these weights and ratings are illustrative: change them.',
     crit:[['Low cost',6],['Chance of good sales',8],['Speed to market',5],['Quality and fit',7],['Control over the product',3]],
     opts:['Buy package','Develop own'],
     r:[[5,2],[3,4],[4,2],[3,5],[2,5]]},
    {id:'prop',label:'Choose a project proposal',note:'Three proposals rated on the 1–5 checklist scale from the text (1 = Unacceptable ... 5 = Most favourable). Illustrative ratings.',
     crit:[['Net present value',8],['Technical success',6],['Commercial success',7],['Risk (5 = low risk)',5],['Fit with organisational objectives',6]],
     opts:['Proposal A','Proposal B','Proposal C'],
     r:[[4,3,5],[5,3,3],[3,4,4],[4,2,3],[3,4,5]]}
  ];
  function wFromPreset(p){return {preset:p.id,crit:p.crit.map(function(c){return {name:c[0],w:c[1]}}),opts:p.opts.slice(),r:p.r.map(function(row){return row.slice()})}}
  function wCalc(W){
    var tw=W.crit.reduce(function(a,c){return a+c.w},0)||1;
    return W.opts.map(function(o,j){var s=0;W.crit.forEach(function(c,i){s+=c.w*W.r[i][j]});return {name:o,raw:s,score:s/tw}});
  }
  function winner(W,weights){ // returns index or -1 for tie
    var tot=W.opts.map(function(o,j){var s=0;W.crit.forEach(function(c,i){s+=weights[i]*W.r[i][j]});return s});
    var best=-1,bv=-1e9,tie=false;tot.forEach(function(v,j){if(v>bv+1e-9){bv=v;best=j;tie=false}else if(Math.abs(v-bv)<=1e-9)tie=true});
    return tie?-1:best;
  }
  function flipFor(W,i){
    var base=W.crit.map(function(c){return c.w}),w0=winner(W,base);
    for(var d=0.1;d<=10.001;d+=0.1){
      var dirs=[1,-1];
      for(var k=0;k<2;k++){var nw=base.slice();nw[i]=Math.round((base[i]+dirs[k]*d)*10)/10;if(nw[i]<0||nw[i]>10)continue;
        var w1=winner(W,nw);if(w1!==w0&&w1>=0)return {to:nw[i],delta:nw[i]-base[i],winner:w1};}
    }
    return null;
  }

  /* ---------- tree presets (Figure 9, Figure 10, SAQ 11) ---------- */
  var uid=1;function nid(){return 'n'+(uid++)}
  function leaf(){return {id:nid(),kind:'leaf',br:[]}}
  function ch(label,value,p,node){return {label:label,value:value,p:p,node:node||leaf()}}
  function chance(){return {id:nid(),kind:'chance',br:Array.prototype.slice.call(arguments)}}
  function decision(){return {id:nid(),kind:'decision',br:Array.prototype.slice.call(arguments)}}
  var TPRE=[
    {id:'fig9',label:'Figure 9: buy or develop?',note:'Buy: EMV = 0.4 × (100 – 10) + 0.6 × (50 – 10) = 60. Develop: 0.5 × (100 – 20) + 0.5 × (50 – 20) = 55. Values in £k.',
     build:function(){return decision(
       ch('Buy package',-10,null,chance(ch('Good sales',100,0.4),ch('Poor sales',50,0.6))),
       ch('Develop package',-20,null,chance(ch('Good sales',100,0.5),ch('Poor sales',50,0.5))))}},
    {id:'fig10',label:'Figure 10: two decisions',note:'Solve the subsidiary decision first: for product A, buying (60) beats developing (55), so prune "develop". Then compare A (60) with B (0.7 × 70 + 0.3 × 40 = 61): B wins by £1k, well inside forecast error.',
     build:function(){return decision(
       ch('Product A',0,null,decision(
          ch('Buy package',-10,null,chance(ch('Good sales',100,0.4),ch('Poor sales',50,0.6))),
          ch('Develop package',-20,null,chance(ch('Good sales',100,0.5),ch('Poor sales',50,0.5))))),
       ch('Product B',0,null,chance(ch('High returns',70,0.7),ch('Low returns',40,0.3))))}},
    {id:'saq11',label:'SAQ 11: three products',note:'Table 9 (£k). The text answer: EMVs are £9 400, £4 000 and £7 000, so product A is best. Value of a path = outcome value – development cost.',
     build:function(){return decision(
       ch('Product A',-18,null,chance(ch('High growth',33,0.6),ch('Low growth',19,0.4))),
       ch('Product B',-20,null,chance(ch('High growth',30,0.5),ch('Low growth',18,0.5))),
       ch('Product C',-15,null,chance(ch('High growth',25,0.7),ch('Low growth',15,0.3))))}},
    {id:'blank',label:'Build your own',note:'Start from a two-option tree. Use the kind buttons to turn an outcome into a chance or decision node and extend the tree.',
     build:function(){return decision(
       ch('Option 1',-10,null,chance(ch('Good outcome',60,0.5),ch('Poor outcome',20,0.5))),
       ch('Option 2',-5,null,chance(ch('Good outcome',40,0.5),ch('Poor outcome',15,0.5))))}}
  ];
  function strip(o){return JSON.parse(JSON.stringify(o))}
  function reid(n){n.id=nid();n.br.forEach(function(b){reid(b.node)})}
  // returns {emv, best}
  function solve(n,map){
    if(n.kind==='leaf'||!n.br.length){map[n.id]={emv:0,best:-1};return 0}
    var vals=n.br.map(function(b){return (+b.value||0)+solve(b.node,map)});
    if(n.kind==='chance'){var e=0;n.br.forEach(function(b,i){e+=(+b.p||0)*vals[i]});map[n.id]={emv:e,best:-1,vals:vals};return e}
    var bi=0;vals.forEach(function(v,i){if(v>vals[bi]+1e-9)bi=i});map[n.id]={emv:vals[bi],best:bi,vals:vals};return vals[bi];
  }
  function findNode(n,id){if(n.id===id)return n;for(var i=0;i<n.br.length;i++){var r=findNode(n.br[i].node,id);if(r)return r}return null}
  function twoWayChances(n,out,lab){if(n.kind==='chance'&&n.br.length===2)out.push({n:n,lab:lab||''});n.br.forEach(function(b){twoWayChances(b.node,out,!lab?b.label:lab+' › '+b.label)});return out}

  Tools.register('decision-matrix',{title:'Decision aids',desc:'Weighted scoring and decision trees with expected monetary value',
  mount:function(el,ctx){
    var st=ctx.load()||{};
    st.tab=st.tab||'wm';
    if(!st.wm||!st.wm.crit)st.wm=wFromPreset(WPRE[0]);
    if(!st.tree||!st.tree.root){var p0=TPRE[0];st.tree={preset:p0.id,root:p0.build()}}
    // make sure uid is above all saved ids
    (function scan(n){var m=/^n(\d+)$/.exec(n.id);if(m)uid=Math.max(uid,+m[1]+1);n.br.forEach(function(b){scan(b.node)})})(st.tree.root);
    function save(){ctx.save(strip(st))}
    el.innerHTML='';el.appendChild(h('style',null,CSS));
    var root=h('div',{class:'dm-wrap tool'});el.appendChild(root);
    var body=h('div',{class:'dm-wrap'});
    function render(){
      root.innerHTML='';
      var c=h('div',{class:'card'});
      c.appendChild(h('div',{class:'label'},'Aids to decision making'));
      c.appendChild(h('p',{style:{margin:'6px 0 10px'}},'Structured aids make a decision objective and quantitative rather than a hunch. Two of the aids from the text are interactive here.'));
      c.appendChild(h('div',{class:'dm-tabs'},[['wm','Weighted criteria'],['tree','Decision tree (EMV)']].map(function(t){return h('button',{class:'dm-tab'+(st.tab===t[0]?' on':''),'data-tab':t[0],onclick:function(){st.tab=t[0];save();render()}},t[1])})));
      c.appendChild(h('details',{style:{marginTop:'10px'}},h('summary',{class:'muted tiny',style:{cursor:'pointer',minHeight:'30px'}},'All the aids named in the text'),
        h('ul',{class:'muted',style:{fontSize:'.88rem',margin:'6px 0 0 18px',padding:0}},
          h('li',null,h('b',null,'Weighted criteria: '),'identify criteria, weight them, rate each option, multiply and add up; choose the highest sum (interactive here).'),
          h('li',null,h('b',null,'Decision trees and EMV: '),'EMV = Σ Pᵢ × Vᵢ; squares are decisions, circles are chances (interactive here).'),
          h('li',null,h('b',null,'Proposal ranking formulas: '),'rank by payback or rate of return; only for low expenditure.'),
          h('li',null,h('b',null,'Proposal selection index: '),'I = PT × PC × NPV (technical success × commercial success × net present value).'),
          h('li',null,h('b',null,'Checklists and measured checklists: '),'rate aspects 1 (unacceptable) to 5 (most favourable), or score numerically.'),
          h('li',null,h('b',null,'Sensitivity analysis: '),'try other values for the main parameters and see whether the decision changes (built into both tabs).'))));
      root.appendChild(c);
      root.appendChild(body);
      body.innerHTML='';
      if(st.tab==='wm')body.appendChild(buildWM());else body.appendChild(buildTree());
    }

    /* ======================= WEIGHTED CRITERIA ======================= */
    function buildWM(){
      var W=st.wm,ups=[];
      var wrap=h('div',{class:'dm-wrap'});
      function upd(){ups.forEach(function(f){f()})}
      var c1=h('div',{class:'card'});
      c1.appendChild(h('div',{class:'label'},'1 · Choose a case'));
      var pr=h('div',{class:'row',style:{margin:'8px 0'}});
      WPRE.forEach(function(p){pr.appendChild(h('button',{class:'chip'+(W.preset===p.id?' on':''),'data-wpre':p.id,onclick:function(){st.wm=wFromPreset(p);save();render()}},p.label))});
      pr.appendChild(h('button',{class:'chip'+(W.preset==='own'?' on':''),'data-wpre':'own',onclick:function(){st.wm={preset:'own',crit:[{name:'Criterion 1',w:5},{name:'Criterion 2',w:5}],opts:['Option 1','Option 2'],r:[[3,3],[3,3]]};save();render()}},'Your own decision'));
      c1.appendChild(pr);
      var pn=WPRE.filter(function(p){return p.id===W.preset})[0];
      c1.appendChild(h('p',{class:'muted tiny',style:{margin:0}},pn?pn.note:'Name your options and criteria. Weight = how much the criterion matters (0 to 10). Rating = how well each option meets it (1 to 5).'));
      wrap.appendChild(c1);

      var c2=h('div',{class:'card'});
      c2.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'2 · Weight the criteria, rate the options'),
        h('div',{class:'row'},
          h('button',{class:'btn sm ghost','data-act':'addcrit',onclick:function(){if(W.crit.length>=8){ctx.toast('Up to 8 criteria');return}W.crit.push({name:'New criterion',w:5});W.r.push(W.opts.map(function(){return 3}));save();render()}},'+ criterion'),
          h('button',{class:'btn sm ghost','data-act':'delcrit',onclick:function(){if(W.crit.length<=2)return;W.crit.pop();W.r.pop();save();render()}},'– criterion'),
          h('button',{class:'btn sm ghost','data-act':'addopt',onclick:function(){if(W.opts.length>=5){ctx.toast('Up to 5 options');return}W.opts.push('Option '+(W.opts.length+1));W.r.forEach(function(row){row.push(3)});save();render()}},'+ option'),
          h('button',{class:'btn sm ghost','data-act':'delopt',onclick:function(){if(W.opts.length<=2)return;W.opts.pop();W.r.forEach(function(row){row.pop()});save();render()}},'– option'))));
      c2.appendChild(h('p',{class:'muted tiny',style:{margin:'6px 0 8px'}},'Ratings: 1 Unacceptable · 2 Unfavourable · 3 Adequate · 4 Favourable · 5 Most favourable.'));
      var tbl=h('table',{class:'dm-tbl'});
      var hr=h('tr',null,h('th',null,'Criterion'),h('th',null,'Weight'));
      W.opts.forEach(function(o,j){hr.appendChild(h('th',null,h('input',{class:'dm-in','data-optname':j,value:o,style:{textAlign:'center',fontWeight:500},'aria-label':'Option '+(j+1)+' name',onchange:function(e){W.opts[j]=e.target.value;save();upd()}})))});
      tbl.appendChild(h('thead',null,hr));
      var tb=h('tbody');
      W.crit.forEach(function(c,i){
        var tr=h('tr');
        tr.appendChild(h('td',null,h('input',{class:'dm-in','data-critname':i,value:c.name,'aria-label':'Criterion '+(i+1)+' name',onchange:function(e){c.name=e.target.value;save();upd()}})));
        var wl=h('span',{class:'tiny muted','data-wl':i},c.w+' ('+'0%'+')');
        ups.push(function(){var tw=W.crit.reduce(function(a,x){return a+x.w},0)||1;wl.textContent=f1(c.w)+' · '+Math.round(100*c.w/tw)+'%'});
        tr.appendChild(h('td',{style:{minWidth:'130px'}},h('input',{type:'range',class:'dm-range',min:'0',max:'10',step:'0.5',value:String(c.w),'data-w':i,'aria-label':'Weight of '+c.name,oninput:function(e){c.w=parseFloat(e.target.value);save();upd()}}),h('div',{style:{textAlign:'center'}},wl)));
        W.opts.forEach(function(o,j){
          var sel=h('select',{class:'dm-sel','data-r':i+'-'+j,'aria-label':c.name+' rating for '+o,onchange:function(e){W.r[i][j]=parseInt(e.target.value,10);save();upd()}});
          for(var v=1;v<=5;v++){var op=h('option',{value:v},v+' · '+SCALE[v].split(' ')[0]);if(W.r[i][j]===v)op.selected=true;sel.appendChild(op)}
          tr.appendChild(h('td',null,sel));
        });
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);c2.appendChild(h('div',{class:'dm-scroll'},tbl));
      wrap.appendChild(c2);

      /* results */
      var c3=h('div',{class:'card',id:'dm-res'});
      c3.appendChild(h('div',{class:'label'},'3 · Live ranking'));
      var rk=h('div',{class:'dm-rank','data-rank':'1',style:{marginTop:'10px'}});c3.appendChild(rk);
      var verdict=h('div',{class:'callout',style:{marginTop:'12px','marginBottom':0},'data-verdict':'1'});c3.appendChild(verdict);
      var work=h('details',{style:{marginTop:'10px'}},h('summary',{class:'muted tiny',style:{cursor:'pointer',minHeight:'30px'}},'Show the arithmetic'));
      var wt=h('div',{class:'dm-scroll'});work.appendChild(wt);c3.appendChild(work);
      ups.push(function(){
        var res=wCalc(W),order=res.map(function(r,j){return j}).sort(function(a,b){return res[b].raw-res[a].raw});
        rk.innerHTML='';
        order.forEach(function(j,k){var r=res[j];
          rk.appendChild(h('div',{class:'dm-rrow'+(k===0?' dm-win':''),'data-rankrow':j},h('b',null,String(k+1)),h('span',null,r.name),h('div',{class:'bar'},h('i',{style:{width:(100*r.score/5)+'%'}})),h('b',{style:{textAlign:'right'}},f1(r.score,2))))});
        var top=res[order[0]],sec=res[order[1]];
        var tie=Math.abs(top.raw-sec.raw)<1e-9;
        verdict.innerHTML='';
        var gap=top.score-sec.score;
        verdict.appendChild(h('b',null,tie?'Tie at the top: ':'Highest weighted score: '+top.name+'. '));
        verdict.appendChild(document.createTextNode(tie?'the scores cannot separate them. Re-think the weights or add a criterion.':'It leads '+sec.name+' by '+f1(gap,2)+' points on the 1–5 scale.'+(gap<0.25?' That is a very small margin, so check the sensitivity below.':'')));
        // arithmetic
        var tw=W.crit.reduce(function(a,x){return a+x.w},0)||1;
        var t=h('table',{class:'dm-tbl'});
        t.appendChild(h('thead',null,h('tr',null,h('th',null,'Criterion'),h('th',null,'Weight'),W.opts.map(function(o){return h('th',null,o+' (rating × weight)')}))));
        var b=h('tbody');
        W.crit.forEach(function(c,i){b.appendChild(h('tr',null,h('td',null,c.name),h('td',null,f1(c.w)),W.opts.map(function(o,j){return h('td',null,W.r[i][j]+' × '+f1(c.w)+' = '+f1(W.r[i][j]*c.w))})))});
        b.appendChild(h('tr',null,h('td',{colspan:'2'},h('b',null,'Sum ÷ total weight '+f1(tw))),res.map(function(r){return h('td',null,h('b',null,f1(r.raw)+' ÷ '+f1(tw)+' = '+f1(r.score,2)))})));
        t.appendChild(b);wt.innerHTML='';wt.appendChild(t);
      });
      wrap.appendChild(c3);

      /* sensitivity */
      var c4=h('div',{class:'card'});
      c4.appendChild(h('div',{class:'label'},'4 · Sensitivity: what weight change flips the winner?'));
      c4.appendChild(h('p',{class:'muted tiny',style:{margin:'4px 0 10px'}},'For each criterion in turn, the smallest change to its weight (others held fixed) that makes a different option win.'));
      var sens=h('div',{'data-sens':'1'});c4.appendChild(sens);
      ups.push(function(){
        sens.innerHTML='';
        var res=wCalc(W),w0=winner(W,W.crit.map(function(c){return c.w}));
        if(w0<0){sens.appendChild(h('div',{class:'dm-flip'},'The top two options are tied right now, so any weight change decides it.'));return}
        var list=W.crit.map(function(c,i){return {i:i,fl:flipFor(W,i)}});
        var flips=list.filter(function(x){return x.fl}).sort(function(a,b){return Math.abs(a.fl.delta)-Math.abs(b.fl.delta)});
        flips.forEach(function(x,k){var c=W.crit[x.i],fl=x.fl;
          sens.appendChild(h('div',{class:'dm-flip','data-flip':x.i},h('b',null,c.name+': '),(fl.delta>0?'raise':'lower')+' the weight from '+f1(c.w)+' to '+f1(fl.to)+' ('+(fl.delta>0?'+':'–')+f1(Math.abs(fl.delta))+') and '+W.opts[fl.winner]+' overtakes '+W.opts[w0]+'.'+(k===0?' This is the most sensitive criterion.':'')))});
        list.filter(function(x){return !x.fl}).forEach(function(x){sens.appendChild(h('div',{class:'dm-flip safe'},h('b',null,W.crit[x.i].name+': '),'no weight from 0 to 10 changes the winner. '+W.opts[w0]+' is robust to this one.'))});
        if(!flips.length)sens.appendChild(h('p',{class:'ok'},'The winner is robust to every single-weight change.'));
        else sens.appendChild(h('p',{class:'muted tiny',style:{margin:'6px 0 0'}},'If a small shift in opinion about "'+W.crit[flips[0].i].name+'" would change the decision, agree that weight carefully with the stakeholders before relying on the result.'));
      });
      wrap.appendChild(c4);
      var foot=h('div',{class:'row between'},h('span',{class:'muted tiny'},'Saved automatically.'),h('button',{class:'btn ghost sm','data-act':'wreset',onclick:function(){var p=WPRE.filter(function(p){return p.id===W.preset})[0]||WPRE[0];st.wm=wFromPreset(p);save();render()}},'Reset'));
      wrap.appendChild(foot);
      upd();
      if(!st.wmDone){st.wmDone=true;}
      return wrap;
    }

    /* ======================= DECISION TREE ======================= */
    function buildTree(){
      var T=st.tree,ups=[];
      var wrap=h('div',{class:'dm-wrap'});
      function upd(){ups.forEach(function(f){f()})}
      var c1=h('div',{class:'card'});
      c1.appendChild(h('div',{class:'label'},'1 · Choose a tree'));
      var pr=h('div',{class:'row',style:{margin:'8px 0'}});
      TPRE.forEach(function(p){pr.appendChild(h('button',{class:'chip'+(T.preset===p.id?' on':''),'data-tpre':p.id,onclick:function(){st.tree={preset:p.id,root:p.build()};save();render()}},p.label))});
      c1.appendChild(pr);
      var pn=TPRE.filter(function(p){return p.id===T.preset})[0];
      c1.appendChild(h('p',{class:'muted tiny',style:{margin:0}},(pn?pn.note:'')+' All values are in £k. A branch value is the cash on that branch (costs negative); a path\'s value is the sum along it.'));
      wrap.appendChild(c1);

      var c2=h('div',{class:'card'});
      c2.appendChild(h('div',{class:'label'},'2 · Edit the tree'));
      c2.appendChild(h('p',{class:'muted tiny',style:{margin:'4px 0 6px'}},'Square = decision (you choose the best branch). Circle = chance (probabilities must add up to 1). Rectangle = outcome. EMV = Σ Pᵢ × Vᵢ.'));
      var map={};
      function recompute(){map={};solve(T.root,map)}
      recompute();
      function nodeEl(n,parentKind,acc,depth){
        var box=h('div',{class:'dm-node','data-node':n.id});
        var kinds=[['leaf','▭ Outcome'],['decision','■ Decision'],['chance','● Chance']];
        var head=h('div',{class:'row between'});
        var kb=h('div',{class:'dm-kind'},kinds.map(function(k){return h('button',{class:'dm-kbtn'+(n.kind===k[0]?' on':''),'data-kind':k[0],onclick:function(){
          if(n.kind===k[0])return;
          if(k[0]==='leaf'){if(n.br.length&&!confirm('Remove everything beyond this node?'))return;n.br=[];}
          else if(!n.br.length){n.br=[ch(k[0]==='chance'?'Outcome 1':'Choice 1',0,k[0]==='chance'?0.5:null),ch(k[0]==='chance'?'Outcome 2':'Choice 2',0,k[0]==='chance'?0.5:null)]}
          n.kind=k[0];save();render()}},k[1])}));
        var badge=h('span',{class:n.kind==='leaf'?'dm-leaf':'dm-emv'});
        ups.push(function(){if(n.kind==='leaf')badge.textContent='path value '+fk(acc.val());else badge.textContent='EMV '+fk(((map[n.id]||{}).emv||0)+acc.val())});
        head.appendChild(kb);head.appendChild(badge);box.appendChild(head);
        if(n.kind!=='leaf'){
          var warn=h('div',{class:'dm-warn'});
          if(n.kind==='chance'){
            ups.push(function(){var s=n.br.reduce(function(a,b){return a+(+b.p||0)},0);warn.textContent=Math.abs(s-1)>0.0005?'Probabilities add up to '+f1(s,3)+', not 1.':''; warn.style.display=warn.textContent?'block':'none'});
            box.appendChild(warn);
            if(n.br.length>=2)box.appendChild(h('button',{class:'btn sm ghost','data-act':'norm',style:{marginTop:'6px'},onclick:function(){var s=n.br.reduce(function(a,b){return a+(+b.p||0)},0);n.br.forEach(function(b){b.p=s>0?(+b.p||0)/s:1/n.br.length});save();render()}},'Make probabilities add to 1'));
          }
          n.br.forEach(function(b,i){
            var bw=h('div',{class:'dm-br','data-branch':n.id+'-'+i});
            var hd=h('div',{class:'dm-brhead'});
            hd.appendChild(h('input',{class:'dm-in',style:{flex:'1 1 120px'},value:b.label,'aria-label':'Branch label',onchange:function(e){b.label=e.target.value;save();upd();drawSvg()}}));
            hd.appendChild(h('label',{class:'muted tiny'},'£k',h('input',{class:'dm-in num',type:'number',step:'any',value:String(b.value),'data-val':n.id+'-'+i,style:{width:'80px',marginLeft:'4px'},onchange:function(e){b.value=parseFloat(e.target.value)||0;save();upd();drawSvg()}})));
            var pin=null;
            if(n.kind==='chance'){
              pin=h('input',{class:'dm-in num',type:'number',step:'0.05',min:'0',max:'1',value:String(b.p==null?0:b.p),'data-p':n.id+'-'+i,style:{width:'72px',marginLeft:'4px'},onchange:function(e){b.p=Math.min(1,Math.max(0,parseFloat(e.target.value)||0));e.target.value=b.p;save();upd();drawSvg()}});
              hd.appendChild(h('label',{class:'muted tiny'},'p',pin));
            }
            var tag=h('span',{class:'muted tiny'});hd.appendChild(tag);
            hd.appendChild(h('button',{class:'btn sm ghost','aria-label':'Delete branch',onclick:function(){if(n.br.length<=1){ctx.toast('A node needs a branch: change it to an outcome instead');return}n.br.splice(i,1);if(n.kind==='chance'&&n.br.length===1)n.br[0].p=1;save();render()}},'×'));
            bw.appendChild(hd);
            if(n.kind==='chance'&&n.br.length===2){
              var sl=h('input',{type:'range',min:'0',max:'1',step:'0.01',value:String(n.br[0].p),'data-slide':n.id,style:{width:'100%',height:'44px',accentColor:'var(--ink)'},'aria-label':'Probability of first branch',oninput:function(e){var v=parseFloat(e.target.value);n.br[0].p=v;n.br[1].p=Math.round((1-v)*100)/100;save();upd();drawSvg();
                var ins=box.querySelectorAll('[data-p]');if(ins.length>1){ins[0].value=n.br[0].p;ins[1].value=n.br[1].p}}});
              if(i===0){bw.appendChild(h('div',{class:'muted tiny'},'Slide to test "' +'P('+b.label+')"'));bw.appendChild(sl)}
            }
            var childAcc={val:function(){return acc.val()+(+b.value||0)}};
            bw.appendChild(nodeEl(b.node,n.kind,childAcc,depth+1));
            ups.push(function(){
              var m=map[n.id]||{};
              if(n.kind==='decision'){tag.textContent=(m.vals?'→ '+fk(m.vals[i]):'')+(m.best===i?'  ✓ best':'  pruned');bw.classList.toggle('dm-pruned',m.best!==i);hd.classList.toggle('dm-best',false);bw.style.borderLeftColor=m.best===i?'var(--red)':'';}
              else if(n.kind==='chance'){tag.textContent=m.vals?'→ '+fk(m.vals[i]):''}
            });
            box.appendChild(bw);
          });
          box.appendChild(h('button',{class:'btn sm ghost','data-act':'addbr',style:{marginTop:'8px'},onclick:function(){n.br.push(ch(n.kind==='chance'?'Outcome '+(n.br.length+1):'Choice '+(n.br.length+1),0,n.kind==='chance'?0:null));save();render()}},'+ branch'));
        }
        return box;
      }
      ups.push(recompute);
      var editor=nodeEl(T.root,null,{val:function(){return 0}},0);
      c2.appendChild(editor);
      wrap.appendChild(c2);

      /* results */
      var c3=h('div',{class:'card dark'});
      c3.appendChild(h('div',{class:'label',style:{color:'#8f8f8f'}},'3 · Result'));
      var res=h('div',{'data-treeres':'1',style:{marginTop:'6px'}});c3.appendChild(res);
      ups.push(function(){
        res.innerHTML='';var m=map[T.root.id]||{emv:0};
        if(T.root.kind==='decision'&&T.root.br.length){
          var vs=m.vals.map(function(v,i){return {i:i,v:v}}).sort(function(a,b){return b.v-a.v});
          res.appendChild(h('div',{style:{fontSize:'1.6rem',fontWeight:500}},'Choose: '+T.root.br[m.best].label+' (EMV '+fk(m.emv)+')'));
          vs.forEach(function(x){res.appendChild(h('div',{style:{color:'#ccc'},'data-opt-emv':x.i},T.root.br[x.i].label+': '+fk(x.v)))});
          if(vs.length>1){var gap=vs[0].v-vs[1].v;res.appendChild(h('p',{style:{color:'#ccc',marginTop:'8px',marginBottom:0}},gap<=0.05*Math.max(1,Math.abs(vs[0].v))?'The difference ('+fk(gap)+') is tiny compared with the likely error in the estimates, so there may be non-monetary reasons to choose differently.':'Leads by '+fk(gap)+'. Remember EMV is an average over many repeats; for a one-off decision also look at the worst case.'))}
        }else res.appendChild(h('div',{style:{fontSize:'1.6rem',fontWeight:500}},'EMV '+fk(m.emv)));
      });
      wrap.appendChild(c3);

      /* diagram */
      var c4=h('div',{class:'card'});
      c4.appendChild(h('div',{class:'label'},'4 · The tree as a diagram'));
      var dwrap=h('div',{class:'dm-scroll',style:{marginTop:'8px'}});c4.appendChild(dwrap);
      function S(tag,a,k){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(var x in (a||{}))e.setAttribute(x,a[x]);(k||[]).forEach(function(c){e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
      function drawSvg(){
        recompute();
        var leaves=0;(function cnt(n){if(!n.br.length)leaves++;else n.br.forEach(function(b){cnt(b.node)})})(T.root);
        var maxd=0;(function dp(n,d){maxd=Math.max(maxd,d);n.br.forEach(function(b){dp(b.node,d+1)})})(T.root,0);
        var X=190,Y=56,W0=40+(maxd)*X+150,H0=Math.max(leaves,1)*Y+20;
        var svg=S('svg',{width:W0,height:H0,viewBox:'0 0 '+W0+' '+H0,class:'dm-svg',role:'img','aria-label':'Decision tree diagram'});
        var yi=0;
        function lay(n,d,accv){
          var x=20+d*X,y,pos=[];
          if(!n.br.length){y=10+yi*Y+Y/2;yi++;
            svg.appendChild(S('rect',{x:x,y:y-14,width:62,height:28,rx:5,fill:'none',style:'stroke:var(--ink);stroke-width:1.5'}));
            svg.appendChild(S('text',{x:x+31,y:y+4,'text-anchor':'middle'},[f1(accv)+'k']));return {x:x,y:y};}
          var kids=n.br.map(function(b){return lay(b.node,d+1,accv+(+b.value||0))});
          y=(kids[0].y+kids[kids.length-1].y)/2;
          var m=map[n.id]||{},best=m.best;
          n.br.forEach(function(b,i){var k=kids[i];
            var pruned=n.kind==='decision'&&best!==i;
            svg.appendChild(S('polyline',{points:(x+14)+','+y+' '+(x+60)+','+k.y+' '+k.x+','+k.y,fill:'none',style:'stroke:'+(pruned?'var(--ink3)':'var(--ink)')+';stroke-width:1.5'+(pruned?';stroke-dasharray:4 3':'')}));
            svg.appendChild(S('text',{x:x+64,y:k.y-18},[b.label.slice(0,18)]));
            var sub=(b.value?(b.value>0?'+':'–')+Math.abs(b.value)+'k':'')+(n.kind==='chance'?'  p='+f1(+b.p||0,2):'');
            svg.appendChild(S('text',{x:x+64,y:k.y-6,class:'s'},[sub]));
            if(pruned){svg.appendChild(S('line',{x1:x+40,x2:x+54,y1:(y+k.y)/2-6+ (k.y>y?0:0),y2:(y+k.y)/2+6,style:'stroke:var(--red);stroke-width:2'}))}
          });
          if(n.kind==='decision')svg.appendChild(S('rect',{x:x,y:y-14,width:28,height:28,fill:'var(--surface)',style:'stroke:var(--ink);stroke-width:1.5'}));
          else svg.appendChild(S('circle',{cx:x+14,cy:y,r:14,fill:'var(--surface)',style:'stroke:var(--ink);stroke-width:1.5'}));
          svg.appendChild(S('text',{x:x+14,y:y+30,'text-anchor':'middle',style:'font-weight:600'},[fk((m.emv||0)+accv)]));
          return {x:x,y:y};
        }
        lay(T.root,0,0);
        dwrap.innerHTML='';dwrap.appendChild(svg);
      }
      ups.push(drawSvg);
      wrap.appendChild(c4);

      /* sensitivity */
      var c5=h('div',{class:'card'});
      c5.appendChild(h('div',{class:'label'},'5 · Sensitivity: how wrong can a probability be?'));
      c5.appendChild(h('p',{class:'muted tiny',style:{margin:'4px 0 10px'}},'The probabilities are subjective estimates. For each two-outcome chance node, this finds the probability at which the best first decision changes.'));
      var sens=h('div',{'data-tsens':'1'});c5.appendChild(sens);
      ups.push(function(){
        sens.innerHTML='';
        if(T.root.kind!=='decision'||T.root.br.length<2){sens.appendChild(h('p',{class:'muted'},'Make the first node a decision with two or more branches to see sensitivity.'));return}
        var base=map[T.root.id].best,nodes=twoWayChances(T.root,[]);
        if(!nodes.length){sens.appendChild(h('p',{class:'muted'},'No two-outcome chance nodes to vary.'));return}
        var saveMap=map;
        nodes.forEach(function(nn){var n=nn.n,pl=nn.lab?nn.lab+': ':'';
          var p0=n.br[0].p,p1=n.br[1].p,found=null;
          function bestAt(p){n.br[0].p=p;n.br[1].p=1-p;var mm={};solve(T.root,mm);return mm[T.root.id].best}
          var ps=[];for(var k=0;k<=200;k++)ps.push(k/200);
          var prev=null;var cands=[];
          ps.forEach(function(p){var b=bestAt(p);if(b!==base)cands.push(p)});
          if(cands.length){ // nearest to p0
            cands.sort(function(a,b){return Math.abs(a-p0)-Math.abs(b-p0)});found=cands[0];
            // refine to the boundary between found and p0
            var lo=p0,hi=found;for(var it=0;it<40;it++){var mid=(lo+hi)/2;if(bestAt(mid)===base)lo=mid;else hi=mid}
            found=(lo+hi)/2;
            var nb=bestAt(hi);
            n.br[0].p=p0;n.br[1].p=p1;
            sens.appendChild(h('div',{class:'dm-flip','data-tflip':n.id},h('b',null,pl+'P("'+n.br[0].label+'") = '+f1(p0,2)+': '),'the best choice switches from '+T.root.br[base].label+' to '+T.root.br[nb].label+' if this probability '+(found<p0?'falls':'rises')+' to about '+f1(found,2)+' (a change of '+f1(Math.abs(found-p0),2)+').'));
          }else{
            n.br[0].p=p0;n.br[1].p=p1;
            sens.appendChild(h('div',{class:'dm-flip safe'},h('b',null,pl+'P("'+n.br[0].label+'"): '),'whatever value (0 to 1) this takes, '+T.root.br[base].label+' stays best.'));
          }
        });
        map=saveMap;recompute();
      });
      wrap.appendChild(c5);
      wrap.appendChild(h('div',{class:'row between'},h('span',{class:'muted tiny'},'Saved automatically.'),h('button',{class:'btn ghost sm','data-act':'treset',onclick:function(){var p=TPRE.filter(function(p){return p.id===T.preset})[0]||TPRE[0];st.tree={preset:p.id,root:p.build()};save();render()}},'Reset tree')));
      // ups order: recompute must run first; drawSvg also recomputes. Make sure map is fresh then run all
      ups.splice(ups.indexOf(recompute),1);ups.unshift(recompute);
      upd();
      if(!st.treeDone){st.treeDone=true;}
      return wrap;
    }
    // complete when both tabs have been used meaningfully (interacted)
    el.addEventListener('change',function(){if(st.tab==='wm'&&st.tree)maybeDone()});
    el.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-tpre],[data-wpre],[data-kind],[data-act]'))maybeDone()});
    var used={};
    function maybeDone(){used[st.tab]=true;if(used.wm&&used.tree&&!st.completed){st.completed=true;save();ctx.complete(1)}}
    render();
  }});
})();

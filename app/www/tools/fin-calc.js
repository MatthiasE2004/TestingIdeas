/* fin-calc: Financial feasibility lab (PM course section 2.3): payback, discounting / present value, NPV, IRR */
(function(){
  var h=H.h;
  var CSS='\
.fc-wrap{display:flex;flex-direction:column;gap:14px}\
.fc-wrap .card{margin:0}\
.fc-tbl{width:100%;border-collapse:collapse;font-size:.92rem}\
.fc-tbl th{font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;text-align:right;color:var(--ink2);padding:6px 4px;border-bottom:1.5px solid var(--ink);font-weight:400}\
.fc-tbl th:first-child,.fc-tbl td:first-child{text-align:left}\
.fc-tbl td{padding:4px;border-bottom:1px dotted var(--line);text-align:right;font-variant-numeric:tabular-nums}\
.fc-tbl td.fc-sum,.fc-tbl tr.fc-sum td{font-weight:600;border-bottom:1.5px solid var(--ink)}\
.fc-in{width:100%;min-width:76px;min-height:44px;text-align:right;border:1.5px solid var(--line);background:var(--surface);border-radius:12px;padding:6px 10px;outline:none;font-variant-numeric:tabular-nums}\
.fc-in:focus{border-color:var(--ink)}\
.fc-name{min-height:38px;text-align:center;font-weight:500;font-size:.85rem;width:100%;min-width:90px;border:1.5px solid var(--line);background:var(--surface);border-radius:12px;padding:4px 8px}\
.fc-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\
.fc-slider{width:100%;height:44px;accent-color:var(--ink)}\
.fc-big{font-size:2rem;font-weight:500;letter-spacing:-.02em;font-variant-numeric:tabular-nums}\
.fc-res{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}\
.fc-res>div{background:var(--surface2);border-radius:var(--r-md);padding:12px 14px}\
.fc-pill{display:inline-block;border-radius:99px;padding:2px 10px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;background:var(--ink);color:var(--bg)}\
.fc-pill.no{background:var(--red);color:#fff}\
.fc-work{font-family:var(--mono);font-size:.82rem;background:var(--surface2);border-radius:var(--r-md);padding:12px 14px;line-height:1.7;overflow-x:auto}\
.fc-svg{width:100%;height:auto;display:block;background:var(--surface2);border-radius:var(--r-md)}\
.fc-svg text{font-family:var(--mono);font-size:10px;fill:var(--ink2)}\
.fc-q{border:1.5px dashed var(--line);border-radius:var(--r-md);padding:14px;margin-bottom:10px}\
.fc-opt{display:block;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:14px;padding:10px 14px;margin:6px 0;min-height:44px;cursor:pointer}\
.fc-opt.sel{border-color:var(--ink)}\
.fc-opt.right{border-color:var(--green);background:var(--surface2)}\
.fc-opt.wrong{border-color:var(--red)}\
.fc-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:.8rem;color:var(--ink2);margin-top:6px}\
.fc-leg i{display:inline-block;width:18px;height:0;border-top:3px solid;vertical-align:middle;margin-right:5px}\
';

  /* ---------- maths ---------- */
  function npv(f,r){var s=0;for(var t=0;t<f.length;t++)s+=f[t]/Math.pow(1+r,t);return s}
  function cum(f){var c=[],s=0;f.forEach(function(x){s+=x;c.push(s)});return c}
  function cumPV(f,r){var c=[],s=0;f.forEach(function(x,t){s+=x/Math.pow(1+r,t);c.push(s)});return c}
  // payback in years (linear within the year), null if never
  function payback(f,r){
    var c=(r==null)?cum(f):cumPV(f,r);
    if(c[0]>=0&&f.length)return 0;
    for(var t=1;t<c.length;t++){
      if(c[t]>=0&&c[t-1]<0){var flow=c[t]-c[t-1];return (t-1)+(-c[t-1])/flow}
    }
    return null;
  }
  function irr(f){
    var any=f.some(function(x){return x<0})&&f.some(function(x){return x>0});
    if(!any)return null;
    var prev=-0.9,pv=npv(f,prev),step=0.005;
    for(var r=prev+step;r<=10;r+=step){
      var v=npv(f,r);
      if((pv>0&&v<=0)||(pv<0&&v>=0)){
        var lo=r-step,hi=r,flo=pv;
        for(var i=0;i<80;i++){var m=(lo+hi)/2,fm=npv(f,m);if((fm>0)===(flo>0)){lo=m;flo=fm}else hi=m}
        return (lo+hi)/2;
      }
      pv=v;
    }
    return null;
  }
  function fmt(n,dp){
    if(n==null||isNaN(n))return '–';
    dp=dp||0;var neg=n<0&&Math.round(Math.abs(n)*Math.pow(10,dp))>0;
    var s=Math.abs(n).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
    return (neg?'–':'')+s;
  }
  function money(n,u,dp){var s=fmt(n,dp);return (s.charAt(0)==='–'?'–':'')+'£'+s.replace('–','')+(u==='k'?'k':'')}
  function yrs(p){if(p==null)return 'never';var y=Math.floor(p+1e-9),m=Math.round((p-y)*12);if(m===12){y++;m=0}
    return fmt(p,2)+' yrs'+(m?' (≈ '+y+' yr '+m+' mo)':'')}
  function pct(x,dp){return x==null?'–':(x*100).toFixed(dp==null?1:dp)+'%'}

  /* ---------- presets (all figures from section 2.3) ---------- */
  var PRESETS=[
    {id:'pb',label:'£100 000 proposal (payback, NPV, IRR)',unit:'',rate:10,
     note:'Text example: £100 000 invested. Flat £25 000 a year pays back in 4 years; the uneven pattern 45/35/20/20/15 pays back in 3 years. At 10% the text finds NPV = £7 835 (Table 7); IRR ≈ 14% (Table 8).',
     opts:[{name:'Uneven pattern',flows:[-100000,45000,35000,20000,20000,15000]},{name:'Flat £25k a year',flows:[-100000,25000,25000,25000,25000,25000]}]},
    {id:'saq6',label:'SAQ 6/8/9: proposal A vs B (£20 000)',unit:'',rate:12,
     note:'A: £3 200 a year for 7 years (payback 20 000 / 3 200 = 6.25 yrs). B: uneven flows, payback about 5.75 yrs. At 12% the text finds B has NPV ≈ –£3 605 (it uses 4-decimal discount factors; exact is –£3 602). IRR of B is just under 8%.',
     opts:[{name:'Proposal A',flows:[-20000,3200,3200,3200,3200,3200,3200,3200]},{name:'Proposal B',flows:[-20000,-2000,2675,3200,4550,6550,7000,8000]}]},
    {id:'fatpac',label:'FatPac Haulage (Table 6)',unit:'k',rate:10,
     note:'Net cash flow row of Table 6 (£k): year 0 = 55 inflows – 425 outflows = –370, then 85 to 168. The text gives the cash flow statement but does not discount it, so try the rates yourself.',
     opts:[{name:'Replace lorries + rebuild depot',flows:[-370,85,105,126,148,169,168,167]},{name:'Do nothing (no change)',flows:[0,0,0,0,0,0,0,0]}]},
    {id:'blank',label:'Your own numbers',unit:'',rate:10,note:'Edit the table freely. Remember: year 0 is today, cash out is negative.',
     opts:[{name:'Option 1',flows:[-50000,15000,15000,15000,15000,15000]},{name:'Option 2',flows:[-50000,5000,10000,20000,25000,30000]}]}
  ];
  function clonePreset(p){return {preset:p.id,unit:p.unit,rate:p.rate,opts:p.opts.map(function(o){return {name:o.name,flows:o.flows.slice()}}),active:0,view:'bars'}}
  function presetById(id){for(var i=0;i<PRESETS.length;i++)if(PRESETS[i].id===id)return PRESETS[i];return PRESETS[0]}

  /* ---------- predict-then-check scenario (fixed, independent of edits) ---------- */
  var P1=[-100000,45000,35000,20000,20000,15000], PB=[-20000,-2000,2675,3200,4550,6550,7000,8000];
  function pq(){
    var n10=npv(P1,.10),n15=npv(P1,.15),nb=npv(PB,.12),ib=irr(PB);
    return [
      {preset:'pb',q:'A £100 000 investment returns £45 000, £35 000, £20 000, £20 000, £15 000 in years 1 to 5. What is its simple payback period?',
       opts:['2 years','3 years','4 years','5 years'],ans:1,
       why:'Cumulative cash: 45 000, then 80 000, then 100 000 at the end of year 3, so the £100 000 is recovered in exactly 3 years. Payback ignores the £35 000 of later cash and the time value of money.'},
      {preset:'pb',q:'Same proposal. The discount rate is raised from 10% to 15%. What happens to NPV?',
       opts:['It rises','It stays positive but falls a little','It falls and becomes negative','No change: NPV does not depend on the rate'],ans:2,
       why:'NPV at 10% is £'+fmt(n10)+'. At 15% it is £'+fmt(n15)+'. Higher discount rates shrink every future cash flow, and this project\'s IRR is only about 14%, so beyond that rate NPV is negative.'},
      {preset:'saq6',q:'Proposal B (£20 000) pays back in about 5.75 years, quicker than A (6.25). Discounted at 12%, is B worth doing?',
       opts:['Yes, NPV is positive because it pays back first','No, NPV is negative (about –£3 600)','NPV is exactly zero'],ans:1,
       why:'Payback ignores cash after the payback point and the timing of money. At 12% B\'s NPV is £'+fmt(nb)+' (the text, using rounded factors, gives –£3 605). Its IRR is only '+pct(ib)+', below the 12% needed.'},
      {preset:'saq6',q:'All of B\'s cash flows (including the investment) are doubled. What happens to IRR and NPV?',
       opts:['IRR doubles, NPV doubles','IRR unchanged, NPV doubles','IRR unchanged, NPV unchanged','IRR halves, NPV doubles'],ans:1,
       why:'IRR is a rate (a percentage), so it is independent of project size. NPV is a sum of money so it doubles (SAQ 10). That is why NPV ranks projects of different size, while IRR compares rates of return.'}
    ];
  }

  Tools.register('fin-calc',{title:'Financial feasibility lab',desc:'Payback, discounting, NPV and IRR with the text\'s worked examples',
  mount:function(el,ctx){
    var st=ctx.load()||clonePreset(PRESETS[0]);
    if(!st.opts||!st.opts.length)st=clonePreset(PRESETS[0]);
    st.pred=st.pred||{}; st.tv=st.tv||{amt:1000,rate:3,yrs:5,mode:'fv'};
    function persist(){ctx.save(st)}
    el.innerHTML='';
    el.appendChild(h('style',null,CSS));
    var root=h('div',{class:'fc-wrap tool'});el.appendChild(root);

    function nYears(){return st.opts[0].flows.length}
    function unitLabel(){return st.unit==='k'?'£k':'£'}
    function M(n,dp){return money(n,st.unit,dp)}

    var inputsRefreshable=true;
    function render(){
      var sx=el.scrollTop;
      root.innerHTML='';
      root.appendChild(secIntro());
      root.appendChild(secTable());
      root.appendChild(secRate());
      root.appendChild(secResults());
      root.appendChild(secWorking());
      root.appendChild(secChart());
      root.appendChild(secVerdict());
      root.appendChild(secTime());
      root.appendChild(secPredict());
    }
    // light refresh used while typing (keeps focus): only rebuilds sections after the table
    function refreshLive(){
      var kids=[].slice.call(root.children);
      var iTbl=kids.findIndex(function(k){return k.id==='fc-sec-table'});
      var iRate=kids.findIndex(function(k){return k.id==='fc-sec-rate'});
      for(var i=iRate+1;i<kids.length;i++)root.removeChild(kids[i]);
      // rate display refresh
      var rv=root.querySelector('#fc-rate-val');if(rv)rv.textContent=st.rate.toFixed(1)+'%';
      root.appendChild(secResults());root.appendChild(secWorking());root.appendChild(secChart());root.appendChild(secVerdict());root.appendChild(secTime());root.appendChild(secPredict());
    }
    function calc(o){
      var r=st.rate/100,f=o.flows;
      return {npv:npv(f,r),pb:payback(f,null),dpb:payback(f,r),irr:irr(f),total:f.reduce(function(a,b){return a+b},0)};
    }

    /* intro + presets */
    function secIntro(){
      var p=presetById(st.preset);
      var c=h('div',{class:'card'});
      c.appendChild(h('div',{class:'label'},'Financial feasibility lab'));
      c.appendChild(h('p',{style:{margin:'6px 0 12px'}},'Compare investment options three ways: how fast the money comes back (payback), what it is worth in today\'s money (NPV) and the rate of return it implies (IRR). Pick a worked example from the text or type your own cash flows.'));
      var row=h('div',{class:'row'});
      PRESETS.forEach(function(pr){
        row.appendChild(h('button',{class:'chip'+(pr.id===st.preset?' on':''),'data-preset':pr.id,onclick:function(){var keep=st.pred,tv=st.tv;st=clonePreset(pr);st.pred=keep;st.tv=tv;persist();render()}},pr.label));
      });
      c.appendChild(row);
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'12px 0 0'}},p.note));
      return c;
    }

    /* editable table */
    function secTable(){
      var c=h('div',{class:'card',id:'fc-sec-table'});
      c.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'1 · Cash flows by year ('+unitLabel()+')'),
        h('div',{class:'row'},
          h('button',{class:'btn sm ghost','data-act':'addyear',onclick:function(){if(nYears()>=12){ctx.toast('Maximum 12 years');return}st.opts.forEach(function(o){o.flows.push(0)});persist();render()}},'+ year'),
          h('button',{class:'btn sm ghost','data-act':'delyear',onclick:function(){if(nYears()<=2){ctx.toast('Keep at least years 0 and 1');return}st.opts.forEach(function(o){o.flows.pop()});persist();render()}},'– year'),
          st.opts.length<3?h('button',{class:'btn sm ghost','data-act':'addopt',onclick:function(){st.opts.push({name:'Option '+(st.opts.length+1),flows:st.opts[0].flows.map(function(){return 0})});st.active=st.opts.length-1;persist();render()}},'+ option'):null,
          st.opts.length>1?h('button',{class:'btn sm ghost','data-act':'delopt',onclick:function(){st.opts.pop();if(st.active>=st.opts.length)st.active=st.opts.length-1;persist();render()}},'– option'):null)));
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'6px 0 8px'}},'Year 0 = today. Costs are negative, benefits positive. Net cash flow = cash in – cash out for that year.'));
      var tbl=h('table',{class:'fc-tbl'});
      var hr=h('tr',null,h('th',null,'Year'));
      st.opts.forEach(function(o,i){
        hr.appendChild(h('th',null,h('input',{class:'fc-name','data-opt':i,value:o.name,'aria-label':'Option '+(i+1)+' name',oninput:function(e){o.name=e.target.value;persist()},onchange:function(){render()}})));
      });
      tbl.appendChild(h('thead',null,hr));
      var tb=h('tbody');
      for(var t=0;t<nYears();t++){(function(t){
        var tr=h('tr',null,h('td',null,String(t)));
        st.opts.forEach(function(o,i){
          tr.appendChild(h('td',null,h('input',{class:'fc-in',type:'text',inputmode:'text','data-y':t,'data-opt':i,value:String(o.flows[t]),'aria-label':o.name+' year '+t,
            oninput:function(e){var v=parseFloat(String(e.target.value).replace(/[\s ,–]/g,function(m){return m==='–'?'-':''}));o.flows[t]=isNaN(v)?0:v;persist();refreshLive()}})));
        });
        tb.appendChild(tr);
      })(t)}
      tbl.appendChild(tb);
      c.appendChild(h('div',{class:'fc-scroll'},tbl));
      return c;
    }

    function secRate(){
      var c=h('div',{class:'card',id:'fc-sec-rate'});
      c.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'2 · Discount rate (required rate of return)'),h('div',{class:'fc-big',id:'fc-rate-val'},st.rate.toFixed(1)+'%')));
      c.appendChild(h('input',{type:'range',class:'fc-slider',min:'0',max:'40',step:'0.5',value:String(st.rate),'aria-label':'Discount rate percent',
        oninput:function(e){st.rate=parseFloat(e.target.value);persist();refreshLive()}}));
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'4px 0 0'}},'The text says to be prudent: use the highest of the borrowing rate, the best return available elsewhere, and the business\'s current ROI. High-technology firms may use up to 40%.'));
      return c;
    }

    function secResults(){
      var c=h('div',{class:'card',id:'fc-sec-res'});
      c.appendChild(h('div',{class:'label',style:{marginBottom:'8px'}},'3 · Live results at '+st.rate.toFixed(1)+'%'));
      var tbl=h('table',{class:'fc-tbl'});
      tbl.appendChild(h('thead',null,h('tr',null,h('th',null,'Measure'),st.opts.map(function(o){return h('th',null,o.name)}))));
      var R=st.opts.map(calc);
      var rows=[
        ['Simple payback',function(r){return r.pb==null?'never':fmt(r.pb,2)+' yrs'}],
        ['Discounted payback',function(r){return r.dpb==null?'never':fmt(r.dpb,2)+' yrs'}],
        ['NPV',function(r){return M(r.npv)}],
        ['IRR',function(r){return pct(r.irr)}],
        ['Decision at this rate',function(r){return r.npv>=0?'accept (NPV ≥ 0)':'reject (NPV < 0)'}]
      ];
      var tb=h('tbody');
      rows.forEach(function(rw,ri){
        var tr=h('tr',{class:ri===2?'fc-sum':''},h('td',null,rw[0]));
        R.forEach(function(r,i){
          var td=h('td',{'data-cell':rw[0]+'|'+i},rw[1](r));
          if(ri===4)td=h('td',{'data-cell':rw[0]+'|'+i},h('span',{class:'fc-pill'+(r.npv<0?' no':'')},rw[1](r)));
          tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      c.appendChild(h('div',{class:'fc-scroll'},tbl));
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'8px 0 0'}},'Payback is found by accumulating cash flow until it turns positive. NPV discounts every flow back to today. IRR is the discount rate at which NPV = 0.'));
      return c;
    }

    function secWorking(){
      var c=h('div',{class:'card',id:'fc-sec-work'});
      var o=st.opts[st.active]||st.opts[0];var r=st.rate/100;
      var hd=h('div',{class:'row between'},h('div',{class:'label'},'4 · Step-by-step working'),
        h('div',{class:'row'},st.opts.map(function(op,i){return h('button',{class:'chip'+(i===st.active?' on':''),'data-active':i,onclick:function(){st.active=i;persist();render()}},op.name)})));
      c.appendChild(hd);
      var f=o.flows,cs=cum(f);
      c.appendChild(h('div',{class:'label',style:{margin:'14px 0 6px'}},'A · Payback: accumulate the net cash flow'));
      var t1=h('table',{class:'fc-tbl'});
      t1.appendChild(h('thead',null,h('tr',null,h('th',null,'Year'),h('th',null,'Flow'),h('th',null,'Cumulative'))));
      var b1=h('tbody');
      f.forEach(function(x,t){b1.appendChild(h('tr',null,h('td',null,String(t)),h('td',null,M(x)),h('td',{class:cs[t]>=0?'':'bad'},M(cs[t]))))});
      t1.appendChild(b1);c.appendChild(h('div',{class:'fc-scroll'},t1));
      var pb=payback(f,null),line;
      if(pb==null)line='The cumulative cash flow never turns positive, so the investment is never recovered.';
      else if(pb===0)line='There is no outlay to recover.';
      else{var k=Math.ceil(pb-1e-9);var frac=pb-(k-1);
        line='Cumulative flow is '+M(cs[k-1])+' at the end of year '+(k-1)+'; year '+k+' brings '+M(f[k])+'. Fraction of year needed = '+fmt(-cs[k-1])+' ÷ '+fmt(f[k])+' = '+fmt(frac,2)+'. Payback = '+(k-1)+' + '+fmt(frac,2)+' = '+yrs(pb)+'.';
        if(f.length>1&&f.every(function(x,t){return t===0||x===f[1]}))line+=' (Flat flows: '+fmt(-f[0])+' ÷ '+fmt(f[1])+' = '+fmt(-f[0]/f[1],2)+' years.)';}
      c.appendChild(h('div',{class:'fc-work',style:{marginTop:'8px',whiteSpace:'normal'},'data-work':'payback'},line));

      c.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'B · Discounting: PV = flow ÷ (1 + r)ⁿ at r = '+st.rate.toFixed(1)+'%'));
      var t2=h('table',{class:'fc-tbl'});
      t2.appendChild(h('thead',null,h('tr',null,h('th',null,'Yr'),h('th',null,'Flow'),h('th',null,'Factor'),h('th',null,'PV'))));
      var b2=h('tbody');var tot=0;
      f.forEach(function(x,t){var fac=1/Math.pow(1+r,t),pv=x*fac;tot+=pv;
        b2.appendChild(h('tr',null,h('td',null,String(t)),h('td',null,M(x)),h('td',null,t===0?'none (1.0000)':'÷ '+fmt(Math.pow(1+r,t),4)+' ('+fac.toFixed(4)+')'),h('td',null,M(pv))))});
      b2.appendChild(h('tr',{class:'fc-sum'},h('td',null,'NPV'),h('td',{colspan:'2',style:{textAlign:'left'}},'sum of the present values'),h('td',{'data-work':'npv'},M(tot))));
      t2.appendChild(b2);c.appendChild(h('div',{class:'fc-scroll'},t2));
      c.appendChild(h('div',{class:'fc-work',style:{marginTop:'8px',whiteSpace:'normal'}},
        'NPV = A₀ + Σ NCFₜ ÷ (1 + r)ᵗ = '+M(tot)+(tot>=0?'. Positive: after allowing for financing costs at '+st.rate.toFixed(1)+'% the project more than pays for itself, so it meets the minimum criterion (NPV ≥ 0).':'. Negative: the project returns less than '+st.rate.toFixed(1)+'%, so unless there are overriding non-financial reasons it would not be implemented.')));
      var ir=irr(f);
      c.appendChild(h('div',{class:'label',style:{margin:'16px 0 6px'}},'C · IRR: the rate that makes NPV = 0'));
      var tries=[];
      if(ir!=null){var base=Math.floor(ir*100);[base-1,base,base+1,base+2].forEach(function(rr){if(rr>=0)tries.push(rr)});}
      var wl='';
      if(ir==null)wl='No sign change in the cash flows (need both outflows and inflows), so no IRR exists.';
      else{wl='Trial and error (as the text does): ';wl+=tries.map(function(rr){return rr+'% → NPV '+M(npv(f,rr/100))}).join(';  ');
        wl+='.  NPV crosses zero at ≈ '+pct(ir,2)+' = IRR. '+(ir*100>=st.rate?'IRR is above the '+st.rate.toFixed(1)+'% required, so the project is acceptable.':'IRR is below the '+st.rate.toFixed(1)+'% required, so the project is not acceptable.');}
      c.appendChild(h('div',{class:'fc-work',style:{whiteSpace:'normal'},'data-work':'irr'},wl));
      if(st.preset==='saq6'&&o.name==='Proposal B')c.appendChild(h('p',{class:'muted tiny',style:{margin:'8px 0 0'}},'The text rounds each factor to 4 decimals, so its totals can differ by a few pounds (–£3 605 vs the exact –£3 602 at 12%).'));
      return c;
    }

    /* ---------- SVG chart ---------- */
    function S(tag,attrs,kids){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(var k in (attrs||{}))e.setAttribute(k,attrs[k]);(kids||[]).forEach(function(x){if(x)e.appendChild(typeof x==='string'?document.createTextNode(x):x)});return e}
    function secChart(){
      var c=h('div',{class:'card',id:'fc-sec-chart'});
      var views=[['bars','Yearly flows'],['cum','Cumulative'],['npv','NPV vs rate']];
      c.appendChild(h('div',{class:'row between'},h('div',{class:'label'},'5 · Chart'),h('div',{class:'row'},views.map(function(v){return h('button',{class:'chip'+(st.view===v[0]?' on':''),'data-view':v[0],onclick:function(){st.view=v[0];persist();render()}},v[1])}))));
      var W=600,Hh=290,L=52,Rm=14,T=14,B=30,pw=W-L-Rm,ph=Hh-T-B;
      var svg=S('svg',{viewBox:'0 0 '+W+' '+Hh,class:'fc-svg',role:'img','aria-label':'Chart of '+st.view,'data-chart':st.view});
      var o=st.opts[st.active]||st.opts[0],r=st.rate/100,f=o.flows;
      var series=[],xmin,xmax,xlabels,desc;
      function axes(ymin,ymax,xfn,xt,xLabelFn){
        // nice y ticks
        var span=ymax-ymin||1,rough=span/4,mag=Math.pow(10,Math.floor(Math.log10(rough))),stp=[1,2,2.5,5,10].map(function(m){return m*mag}).filter(function(s){return s>=rough})[0];
        var y0=Math.floor(ymin/stp)*stp,y1=Math.ceil(ymax/stp)*stp;
        function yy(v){return T+ph-(v-y0)/(y1-y0)*ph}
        for(var v=y0;v<=y1+1e-9;v+=stp){svg.appendChild(S('line',{x1:L,x2:W-Rm,y1:yy(v),y2:yy(v),style:'stroke:var(--line);stroke-dasharray:2 4'}));
          svg.appendChild(S('text',{x:L-6,y:yy(v)+3,'text-anchor':'end'},[Math.abs(v)>=1000?(v/1000).toFixed(v%1000?1:0)+'k':String(+v.toFixed(2))]))}
        if(y0<0&&y1>0)svg.appendChild(S('line',{x1:L,x2:W-Rm,y1:yy(0),y2:yy(0),style:'stroke:var(--ink);stroke-width:1.5'}));
        xt.forEach(function(t){svg.appendChild(S('text',{x:xfn(t),y:Hh-10,'text-anchor':'middle'},[xLabelFn(t)]))});
        return yy;
      }
      var legend=[];
      var cols=['var(--ink)','var(--red)','var(--ink3)'],dash=['','6 4','2 3'];
      if(st.view==='bars'){
        var pvs=f.map(function(x,t){return x/Math.pow(1+r,t)});
        var all=f.concat(pvs).concat([0]),ymin=Math.min.apply(null,all),ymax=Math.max.apply(null,all);
        var n=f.length,gw=pw/n,xf=function(t){return L+gw*(t+.5)};
        var yy=axes(ymin,ymax,xf,f.map(function(_,t){return t}),function(t){return 'yr '+t});
        f.forEach(function(x,t){
          var bw=Math.min(gw*.36,26);
          var a=yy(Math.max(x,0)),b=yy(Math.min(x,0));
          svg.appendChild(S('rect',{x:xf(t)-bw-1,y:a,width:bw,height:Math.max(b-a,1),rx:3,style:'fill:var(--ink)'},[S('title',{},['Year '+t+' flow '+M(x)])]));
          var p=pvs[t];a=yy(Math.max(p,0));b=yy(Math.min(p,0));
          svg.appendChild(S('rect',{x:xf(t)+1,y:a,width:bw,height:Math.max(b-a,1),rx:3,style:'fill:var(--ink3)'},[S('title',{},['Year '+t+' present value '+M(p)])]));
        });
        legend=[['var(--ink)','Cash flow'],['var(--ink3)','Present value at '+st.rate.toFixed(1)+'%']];
        desc='Bars shrink with time: later money is worth less today. '+o.name+'.';
      }else if(st.view==='cum'){
        var cA=cum(f),cB=cumPV(f,r),all2=cA.concat(cB).concat([0]);
        var n2=f.length,xf2=function(t){return L+(n2>1?pw*t/(n2-1):0)};
        var yy2=axes(Math.min.apply(null,all2),Math.max.apply(null,all2),xf2,f.map(function(_,t){return t}),function(t){return 'yr '+t});
        function line(arr,col,da){svg.appendChild(S('polyline',{points:arr.map(function(v,t){return xf2(t)+','+yy2(v)}).join(' '),fill:'none',style:'stroke:'+col+';stroke-width:2.5;stroke-linejoin:round'+(da?';stroke-dasharray:'+da:'')}));
          arr.forEach(function(v,t){svg.appendChild(S('circle',{cx:xf2(t),cy:yy2(v),r:3,style:'fill:'+col}))})}
        line(cA,'var(--ink)');line(cB,'var(--red)','6 4');
        var pbk=payback(f,null);if(pbk!=null&&pbk>0){svg.appendChild(S('line',{x1:xf2(pbk),x2:xf2(pbk),y1:T,y2:T+ph,style:'stroke:var(--ink);stroke-dasharray:3 3'}));svg.appendChild(S('text',{x:xf2(pbk)+4,y:T+12},['payback '+fmt(pbk,2)]))}
        legend=[['var(--ink)','Cumulative cash flow'],['var(--red)','Cumulative present value']];
        desc='Where a line crosses zero is a payback point; the discounted line crosses later (or never).';
      }else{
        var maxr=40;st.opts.forEach(function(op){var q=irr(op.flows);if(q!=null&&q*100+8>maxr)maxr=Math.min(100,Math.ceil(q*100+8))});
        var pts=[],step=maxr/40,allv=[0];
        st.opts.forEach(function(op,i){var a=[];for(var k=0;k<=40;k++){var rr=k*step;var v=npv(op.flows,rr/100);a.push(v);allv.push(v)}pts.push(a)});
        var xf3=function(rr){return L+pw*rr/maxr};
        var ticks=[];for(var tt=0;tt<=maxr;tt+=maxr/4)ticks.push(tt);
        var yy3=axes(Math.min.apply(null,allv),Math.max.apply(null,allv),xf3,ticks,function(t){return Math.round(t)+'%'});
        pts.forEach(function(a,i){svg.appendChild(S('polyline',{points:a.map(function(v,k){return xf3(k*step)+','+yy3(v)}).join(' '),fill:'none',style:'stroke:'+cols[i]+';stroke-width:2.5;stroke-linejoin:round'+(dash[i]?';stroke-dasharray:'+dash[i]:'')}));
          var q=irr(st.opts[i].flows);if(q!=null&&q*100<=maxr){svg.appendChild(S('circle',{cx:xf3(q*100),cy:yy3(0),r:5,style:'fill:var(--surface);stroke:'+cols[i]+';stroke-width:2.5'},[S('title',{},[st.opts[i].name+' IRR '+pct(q)])]));}});
        svg.appendChild(S('line',{x1:xf3(Math.min(st.rate,maxr)),x2:xf3(Math.min(st.rate,maxr)),y1:T,y2:T+ph,style:'stroke:var(--red);stroke-width:1.5'}));
        svg.appendChild(S('text',{x:xf3(Math.min(st.rate,maxr))+4,y:T+12,style:'fill:var(--red)'},['rate '+st.rate.toFixed(1)+'%']));
        legend=st.opts.map(function(op,i){return [cols[i],op.name]});
        desc='Like Figure 8: NPV against discount rate is a curve, not a straight line. Circles mark each IRR where the curve meets zero.';
      }
      c.appendChild(svg);
      c.appendChild(h('div',{class:'fc-leg'},legend.map(function(l){return h('span',null,h('i',{style:{borderColor:l[0]}}),l[1])})));
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'6px 0 0'}},desc));
      return c;
    }

    function secVerdict(){
      var c=h('div',{class:'card dark',id:'fc-sec-verdict'});
      c.appendChild(h('div',{class:'label',style:{color:'#8f8f8f'}},'6 · Verdict'));
      var R=st.opts.map(function(o){return {o:o,r:calc(o)}});
      var txt=[];
      var byNpv=R.slice().sort(function(a,b){return b.r.npv-a.r.npv});
      var viable=R.filter(function(x){return x.r.npv>=0});
      var best=byNpv[0];
      var head;
      if(R.length===1){head=best.r.npv>=0?'Worth doing at '+st.rate.toFixed(1)+'%':'Not worth doing at '+st.rate.toFixed(1)+'%'}
      else if(best.r.npv<0)head='Reject all options at '+st.rate.toFixed(1)+'%';
      else head='Choose '+best.o.name+' (highest NPV)';
      c.appendChild(h('div',{class:'fc-big','data-verdict':'head',style:{margin:'4px 0 8px'}},head));
      var ul=h('ul',{style:{margin:'0 0 0 18px',padding:0}});
      R.forEach(function(x){ul.appendChild(h('li',null,x.o.name+': NPV '+M(x.r.npv)+(x.r.npv>=0?' (meets minimum criterion)':' (return below '+st.rate.toFixed(1)+'%)')+'; payback '+(x.r.pb==null?'never':fmt(x.r.pb,2)+' yrs')+'; IRR '+pct(x.r.irr)+'.'))});
      c.appendChild(ul);
      if(R.length>1){
        var byPb=R.filter(function(x){return x.r.pb!=null}).sort(function(a,b){return a.r.pb-b.r.pb});
        var p=h('p',{style:{margin:'10px 0 0',color:'#ddd'}});
        var msg='';
        if(byPb.length&&byPb[0]!==best&&best.r.npv>=0)msg+='Payback favours '+byPb[0].o.name+' but NPV favours '+best.o.name+'. Payback ignores cash after the payback point and the timing of money, so use it only alongside a rate-of-return method. ';
        else if(byPb.length&&byPb[0]===best)msg+='Payback and NPV agree here. ';
        var sizes=R.map(function(x){return -x.o.flows[0]});
        if(Math.max.apply(null,sizes)>1.5*Math.max(1,Math.min.apply(null,sizes)))msg+='The options differ a lot in size, so compare IRRs as well: IRR is independent of project size. ';
        if(byNpv.length>1&&Math.abs(byNpv[0].r.npv-byNpv[1].r.npv)<0.05*Math.max(1,Math.abs(byNpv[0].r.npv)))msg+='The NPVs are very close; given forecast accuracy, treat this as a tie and consider non-financial factors. ';
        msg+='Remember: these are forecasts. Try moving the rate to see how sensitive the choice is.';
        p.textContent=msg;c.appendChild(p);
      }
      return c;
    }

    /* time value mini-calculator (compounding / discounting) */
    function secTime(){
      var c=h('div',{class:'card',id:'fc-sec-time'});
      var tv=st.tv;
      c.appendChild(h('div',{class:'label'},'Time value of money: compounding and discounting'));
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'4px 0 10px'}},'FV = PV × (1 + r)ⁿ and PV = FV ÷ (1 + r)ⁿ. Presets are the text\'s examples.'));
      var pre=h('div',{class:'row',style:{marginBottom:'10px'}});
      [['£5, 3 yrs, 10% → FV',{amt:5,rate:10,yrs:3,mode:'fv'}],['£5 in 1 yr, 10% → PV',{amt:5,rate:10,yrs:1,mode:'pv'}],['£5 in 3 yrs, 10% → PV',{amt:5,rate:10,yrs:3,mode:'pv'}],['SAQ 7a: £1000, 3%, 5 yrs',{amt:1000,rate:3,yrs:5,mode:'fv'}],['SAQ 7b: inflation 3%',{amt:1000,rate:3,yrs:5,mode:'pv'}]].forEach(function(p){
        pre.appendChild(h('button',{class:'chip',onclick:function(){st.tv=Object.assign({},p[1]);persist();render()}},p[0]))});
      c.appendChild(pre);
      var row=h('div',{class:'row'});
      function num(lbl,key,step){return h('label',{style:{flex:'1 1 100px'}},h('span',{class:'label'},lbl),h('input',{class:'fc-in',style:{textAlign:'left',marginTop:'4px'},type:'number',step:step,value:String(tv[key]),'data-tv':key,oninput:function(e){var v=parseFloat(e.target.value);tv[key]=isNaN(v)?0:v;persist();upd()}}))}
      row.appendChild(num('Amount (£)','amt','any'));row.appendChild(num('Rate (%)','rate','any'));row.appendChild(num('Years','yrs','1'));
      row.appendChild(h('div',{class:'row',style:{alignSelf:'flex-end'}},['fv','pv'].map(function(m){return h('button',{class:'chip'+(tv.mode===m?' on':''),'data-tvmode':m,onclick:function(){tv.mode=m;persist();render()}},m==='fv'?'Compound (FV)':'Discount (PV)')})));
      c.appendChild(row);
      var out=h('div',{class:'fc-work',style:{marginTop:'10px',whiteSpace:'normal'},'data-tvout':'1'});c.appendChild(out);
      function upd(){var g=Math.pow(1+tv.rate/100,tv.yrs),v=tv.mode==='fv'?tv.amt*g:tv.amt/g;
        out.textContent=tv.mode==='fv'?'FV = '+fmt(tv.amt,2)+' × (1 + '+tv.rate/100+')^'+tv.yrs+' = '+fmt(tv.amt,2)+' × '+g.toFixed(4)+' = £'+fmt(v,2):'PV = '+fmt(tv.amt,2)+' ÷ (1 + '+tv.rate/100+')^'+tv.yrs+' = '+fmt(tv.amt,2)+' ÷ '+g.toFixed(4)+' = £'+fmt(v,2)}
      upd();return c;
    }

    /* predict then check */
    function secPredict(){
      var c=h('div',{class:'card',id:'fc-sec-pred'});
      var Q=pq(),done=0;
      c.appendChild(h('div',{class:'label'},'Predict, then check'));
      c.appendChild(h('p',{class:'muted tiny',style:{margin:'4px 0 10px'}},'Commit to an answer first, then the lab shows the working. Tap "Load it" to see the numbers in the tool above.'));
      Q.forEach(function(q,i){
        var a=st.pred[i];var box=h('div',{class:'fc-q','data-q':i});
        box.appendChild(h('div',{style:{fontWeight:500,marginBottom:'6px'}},(i+1)+'. '+q.q));
        q.opts.forEach(function(op,k){
          var cls='fc-opt';if(a!=null){if(k===q.ans)cls+=' right';else if(k===a)cls+=' wrong'}
          box.appendChild(h('button',{class:cls,'data-opt':k,onclick:function(){if(st.pred[i]!=null)return;st.pred[i]=k;persist();render()}},op));
        });
        if(a!=null){done++;
          box.appendChild(h('div',{class:'callout '+(a===q.ans?'tip':''),style:{marginTop:'8px',marginBottom:0}},h('b',null,a===q.ans?'Correct. ':'Not quite. '),q.why));
          box.appendChild(h('button',{class:'btn sm ghost',style:{marginTop:'8px'},onclick:function(){var keep=st.pred,tv=st.tv;st=clonePreset(presetById(q.preset));st.pred=keep;st.tv=tv;persist();render();el.scrollIntoView&&root.firstChild.scrollIntoView({behavior:'smooth'})}},'Load it'));
        }
        c.appendChild(box);
      });
      if(done===Q.length){
        var good=Q.filter(function(q,i){return st.pred[i]===q.ans}).length;
        c.appendChild(h('div',{class:'row between'},h('b',{'data-score':'1'},'Score: '+good+' / '+Q.length),h('button',{class:'btn sm ghost',onclick:function(){st.pred={};persist();render()}},'Try again')));
        if(!st.completed){st.completed=true;persist();ctx.complete(good/Q.length)}
      }
      return c;
    }

    var foot=h('div',{class:'row between'},h('span',{class:'muted tiny'},'Your numbers are saved automatically.'),
      h('button',{class:'btn ghost sm','data-act':'reset',onclick:function(){var keep=st.pred,tv=st.tv;st=clonePreset(presetById(st.preset));st.pred=keep;st.tv=tv;persist();render()}},'Reset this example'));
    render();
    el.appendChild(h('div',{style:{marginTop:'14px'}},foot));
  }});
})();

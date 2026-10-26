/* Break-even & Cash - Entrepreneurship Session 7 (Financing your business): cash management, sources of finance;
   Session 8: "know where your breakeven point is". Tabs: Costs, Break-even chart, Cash runway, Finance match, Predict. */
(function(){
  var h=H.h;
  var NS='http://www.w3.org/2000/svg';
  var CSS='.be-tabs{display:flex;gap:6px;margin:0 0 14px;overflow-x:auto}'+
  '.be-tab{flex:1 0 auto;border:0;border-radius:999px;padding:8px 14px;min-height:44px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}'+
  '.be-tab.on{background:var(--ink);color:var(--bg)}'+
  '.be-sl{display:grid;grid-template-columns:minmax(100px,150px) 1fr 82px;gap:10px;align-items:center;min-height:44px}.be-sl input{width:100%;accent-color:var(--ink);min-height:44px}.be-sl b{font-family:var(--mono);text-align:right}'+
  '.be-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:12px 0}'+
  '.be-kpi{background:var(--surface2);border-radius:var(--r-md);padding:12px 14px}.be-kpi .v{font-size:1.4rem;font-weight:500;font-family:var(--mono)}'+
  '.be-chart{width:100%;height:auto;display:block;background:var(--surface);border-radius:var(--r-md)}'+
  '.be-chart text{font-family:var(--mono);font-size:11px;fill:var(--ink2)}'+
  '.be-scroll{overflow-x:auto}'+
  '@media(max-width:560px){.be-sl{grid-template-columns:1fr 80px;gap:0 10px}.be-sl>span{grid-column:1}.be-sl>b{grid-column:2;grid-row:1}.be-sl>input{grid-column:1/3}.be-u{display:none}table.tbl{font-size:.8rem}table.tbl th{letter-spacing:.02em;padding:8px 3px}table.tbl td{padding:8px 3px}}'+
  'tr.be-neg td{background:rgba(215,25,33,.12);color:var(--red);font-weight:600}'+
  'table.tbl td.n,table.tbl th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}'+
  '.be-opt{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}'+
  '.be-opt .chip{min-height:44px}.be-opt .chip.right{background:var(--green);color:#fff}.be-opt .chip.wrong{background:var(--red);color:#fff}'+
  '.be-row{display:flex;gap:8px;align-items:center;margin-bottom:8px}.be-row .input{min-width:0}.be-row .amt{max-width:120px}'+
  '.be-q{background:var(--surface2);border-radius:var(--r-md);padding:14px;margin:0 0 12px}';

  function gbp(n){var neg=n<0;n=Math.round(Math.abs(n));return (neg?'-':'')+'£'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
  function num(n,d){return (Math.round(n*Math.pow(10,d||0))/Math.pow(10,d||0)).toLocaleString('en-GB')}
  function svg(tag,a,txt){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e}

  var SRC={
    equity:{n:'Own money / owners\' equity',f:'Equity is contributed by the owners at start-up and is never repaid; no regular interest, but investors hope for a dividend.'},
    reinvest:{n:'Reinvested profits',f:'Profits kept in the business - but profits must materialise as cash to be reinvested.'},
    loan:{n:'Bank loan',f:'Fixed period, fixed or variable interest, often secured on assets; repaid in full with interest, and you keep ownership.'},
    overdraft:{n:'Bank overdraft',f:'Flexible and suited to short-term cash shortfalls, but it can be cancelled at any time and is repayable on demand.'},
    lease:{n:'Leasing',f:'Acquires a specific asset without a large upfront outflow; secured on the asset, with regular payments committed.'},
    supplier:{n:'Supplier credit',f:'Suppliers who offer a month to pay give an interest-free loan - if they trust your credit standing.'},
    grant:{n:'Grant',f:'Not repayable and no loss of control, but competitive and often tied to a specific future project.'},
    crowd:{n:'Reward crowdfunding',f:'Many small backers fund you in return for goods or services; suits early-stage ventures with no assets or track record.'},
    p2p:{n:'Peer-to-peer lending',f:'Loans pooled by an online platform; interest paid, no shares given away, usually to creditworthy borrowers.'},
    angel:{n:'Angel / venture capital',f:'Equity plus expertise and contacts for high-growth, high-risk businesses - but you give up some control and report regularly.'}
  };
  var SC=[
    {t:'A bakery must cover wages for three weeks because a big customer pays late. The cash gap is about £2,000 and will close when the invoice is paid.',a:'overdraft',why:'It is a short-term cash shortfall. An overdraft is flexible and cheap to use for a few weeks - but remember the bank can cancel it at any time.'},
    {t:'A tech start-up with no profits yet wants to scale fast. The founders will accept giving up part of the company if investors also bring expertise and contacts.',a:'angel',why:'High-growth, high-risk businesses are what angels and VCs back. You trade ownership and control (dilution, a board seat, regular reports) for money and know-how.'},
    {t:'A delivery business wants a £35,000 van but does not want a large cash outflow upfront.',a:'lease',why:'Leasing spreads the cost into regular payments and is secured on the van itself, not on the owner\'s home or other assets.'},
    {t:'A researcher plans a specific project with potential impact on the national economy. She does not want to repay money or give away control.',a:'grant',why:'A grant is a permanent injection with no repayment and no loss of control - but it is competitive and usually for a specific project.'},
    {t:'Someone wants £15,000 for the first print run of a board game. They have no assets and no sales record but a loyal online following.',a:'crowd',alt:['p2p'],why:'Reward-based crowdfunding lets fans pre-order. It needs no security or track record, and doubles as market feedback. (Peer-to-peer lending would mostly need a creditworthy borrower.)'},
    {t:'A café with three years of profits and good credit wants £80,000 to refit. The owner can make regular repayments and wants to keep 100% ownership.',a:'loan',alt:['p2p'],why:'A term loan is repaid with interest and costs no ownership. Peer-to-peer lending is a fair alternative for trading businesses.'},
    {t:'A profitable small shop has spare cash after paying all its bills and wants a £3,000 display fridge.',a:'reinvest',why:'Profits that have turned into cash can simply be reinvested - no interest, no outside investors. The catch is that profit only helps if it is cash in the bank.'},
    {t:'A florist buys flowers from a wholesaler who allows 30 days to pay. She sells them within a week.',a:'supplier',why:'Trade credit is an interest-free loan for the credit period. It helps working capital, but suppliers check your credit standing first.'},
    {t:'A first-time founder needs just £4,000 to get started, wants full control, and has savings.',a:'equity',why:'Money from the owner is equity financing: never repaid, no interest, no one else in charge. The risk is your own savings.'}
  ];
  var PRED=[
    {q:'Price £10 per unit, variable cost £4 per unit, fixed costs £1,200 per month. How many units must you sell each month to break even?',o:['120 units','200 units','300 units','86 units'],a:1,set:{price:10,vc:4,fixed:1200},
      e:'Each unit contributes £10 − £4 = £6 towards fixed costs. £1,200 ÷ £6 = 200 units. (120 is what you get if you forget variable costs: 1,200 ÷ 10.)'},
    {q:'Same business, but you raise the price from £10 to £12. What happens to the break-even point?',o:['It rises above 200 units','It stays at 200 units','It falls to 150 units','It falls to 100 units'],a:2,set:{price:12,vc:4,fixed:1200},
      e:'Contribution rises to £8 per unit, so 1,200 ÷ 8 = 150 units. A higher price lowers the break-even - but only if customers still buy.'},
    {q:'Back at £10 price and £4 variable cost, the rent goes up and fixed costs rise 50% to £1,800. New break-even?',o:['250 units','300 units','400 units','200 units'],a:1,set:{price:10,vc:4,fixed:1800},
      e:'1,800 ÷ 6 = 300 units. Break-even moves in proportion to fixed costs: +50% fixed costs means +50% units (200 → 300).'},
    {q:'You sell 100 units a month at £10 (variable cost £4, fixed £500). Customers pay one month after they buy. You start with £400 in the bank. Does cash go below zero in month 1?',o:['No - it is profitable, so cash stays positive','Yes - by about £500','Yes - by about £100','Exactly zero'],a:1,cash:{price:10,vc:4,fixed:500,sales:100,start:100,growth:0,delay:1,cash:400,useStartup:false},
      e:'The month makes a £100 profit on paper (£1,000 sales − £400 − £500), but the £1,000 arrives next month. In month 1 you pay out £900 and receive nothing: 400 − 900 = −£500. Profit is not cash - the delay between sales and cash receipts can halt an enterprise.'}
  ];
  var CLS=[{n:'Shop rent',a:'f'},{n:'Packaging for each item sold',a:'v'},{n:'Business insurance',a:'f'},{n:'Card fee on every sale',a:'v'},{n:'Your own salary',a:'f'},{n:'Raw materials used per product',a:'v'}];
  var TABS=['1 Costs','2 Break-even','3 Cash runway','4 Finance match','5 Predict'];

  Tools.register('breakeven',{title:'Break-even and Cash Runway',desc:'See where you break even, whether cash runs out, and which finance fits.',
  mount:function(el,ctx){
    if(!document.getElementById('be-css')){var st=document.createElement('style');st.id='be-css';st.textContent=CSS;document.head.appendChild(st)}
    function defaults(){return {tab:0,price:12,vc:5,fixed:1400,sales:300,
      costs:[{n:'Equipment',a:1500},{n:'Website and branding',a:600},{n:'First stock',a:800},{n:'Registration and legal',a:300}],
      cash:5000,start:40,growth:25,delay:1,injAmt:0,injMonth:3,useStartup:true,cls:{},m:{},pred:{},done:false}}
    var S=Object.assign(defaults(),ctx.load()||{});
    ['cls','m','pred'].forEach(function(k){if(!S[k])S[k]={}});
    function save(){ctx.save(S)}
    function startup(){return S.costs.reduce(function(a,c){return a+(+c.a||0)},0)}
    function contrib(){return S.price-S.vc}
    function bep(){return contrib()>0?S.fixed/contrib():null}
    function slider(lab,min,max,step,key,fmt,onch){
      var out=h('b',null,fmt(S[key])),inp=h('input',{type:'range',min:min,max:max,step:step,value:S[key],'aria-label':lab});
      inp.addEventListener('input',function(){S[key]=+inp.value;out.textContent=fmt(S[key]);save();onch&&onch()});
      var row=h('div',{class:'be-sl'},h('span',{class:'tiny'},lab),inp,out);
      row.sync=function(){inp.value=S[key];out.textContent=fmt(S[key])};return row}
    function tabs(){return h('div',{class:'be-tabs',role:'tablist'},TABS.map(function(n,i){
      return h('button',{class:'be-tab'+(S.tab===i?' on':''),role:'tab','aria-selected':S.tab===i?'true':'false',onclick:function(){S.tab=i;save();render()}},n)}))}
    function kpi(l,v,sub,cls){return h('div',{class:'be-kpi'},h('div',{class:'label'},l),h('div',{class:'v '+(cls||'')},v),sub?h('div',{class:'tiny muted'},sub):null)}

    /* ---------- tab 0: costs ---------- */
    function t0(){
      var w=h('div',null);
      w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Why finance matters'),
        h('p',{style:{marginTop:'6px'}},'One of the main reasons businesses fail is that they run out of cash. Before you choose how to finance a business you need to know how much cash it needs: first the one-off ',h('b',null,'start-up costs'),', then the running costs that must be funded before cash arrives from customers.')));
      var tot=h('b',null,gbp(startup()));
      var list=h('div',null);
      function drawList(){
        list.innerHTML='';
        S.costs.forEach(function(c,i){
          var n=h('input',{class:'input',value:c.n,'aria-label':'Cost name'}),a=h('input',{class:'input amt',type:'number',min:0,step:50,value:c.a,'aria-label':'Amount in pounds',inputmode:'decimal'});
          n.addEventListener('input',function(){c.n=n.value;save()});
          a.addEventListener('input',function(){c.a=Math.max(0,+a.value||0);tot.textContent=gbp(startup());save()});
          list.appendChild(h('div',{class:'be-row'},n,a,h('button',{class:'btn ghost sm','aria-label':'Remove cost',onclick:function(){S.costs.splice(i,1);save();drawList();tot.textContent=gbp(startup())}},'×')))})}
      drawList();
      w.appendChild(h('div',{class:'card'},h('div',{class:'row between'},h('span',{class:'label'},'Start-up costs (one-off, paid before you sell)'),h('span',null,'Total ',tot)),
        h('div',{style:{marginTop:'10px'}},list),
        h('button',{class:'btn sm',onclick:function(){S.costs.push({n:'',a:0});save();drawList()}},'+ Add cost')));
      // classification
      var ex=h('div',{class:'card'},h('span',{class:'label'},'Running costs: fixed or variable?'),
        h('p',{class:'tiny muted',style:{marginTop:'6px'}},h('b',null,'Fixed'),' costs stay the same however much you sell (this month). ',h('b',null,'Variable'),' costs rise with every unit sold. Tap to classify.'));
      CLS.forEach(function(c,i){
        var got=S.cls[i],fb=h('span',{class:'tiny '+(got?(got===c.a?'ok':'bad'):'')},got?(got===c.a?'Correct':'Not quite - this one is '+(c.a==='f'?'fixed':'variable')):'');
        function pick(v){S.cls[i]=v;save();render()}
        ex.appendChild(h('div',{class:'row between',style:{padding:'4px 0',borderTop:'1px solid var(--line)'}},
          h('div',{style:{flex:'1 1 160px'}},c.n,h('div',null,fb)),
          h('div',{class:'row',style:{gap:'6px'}},['f','v'].map(function(v){return h('button',{class:'chip'+(got===v?(got===c.a?' on':' red'):''),onclick:function(){pick(v)}},v==='f'?'Fixed':'Variable')}))))});
      w.appendChild(ex);
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',onclick:function(){if(confirm('Reset this tool and clear your answers?')){S=defaults();save();render()}}},'Reset all'),
        h('button',{class:'btn primary',onclick:function(){S.tab=1;save();render()}},'Next: break-even')));
      return w}

    /* ---------- tab 1: break-even ---------- */
    function t1(){
      var w=h('div',null), chartBox=h('div',null), kp=h('div',{class:'be-kpis'}), msg=h('div',{class:'callout'});
      var sl=[];
      var fm=function(v){return '£'+num(v,v%1?2:0)};
      function upd(){
        var b=bep(),c=contrib(),xmax=b?Math.max(Math.ceil(b*2/50)*50,100):200;
        xmax=Math.max(xmax,Math.ceil(S.sales*1.2/50)*50);
        chartBox.innerHTML='';chartBox.appendChild(chart(xmax,b));
        var profit=S.sales*c-S.fixed;
        kp.innerHTML='';
        kp.appendChild(kpi('Contribution per unit',gbp(c).replace('-','-')+(c<0?'':''),'price minus variable cost',c<=0?'bad':''));
        kp.appendChild(kpi('Break-even',b?num(Math.ceil(b))+' units':'never',b?'= fixed ÷ contribution = '+gbp(S.fixed)+' ÷ '+gbp(c)+' = '+num(b,1):'every sale loses money',b?'':'bad'));
        kp.appendChild(kpi('Break-even sales',b?gbp(b*S.price):'-','revenue needed each month'));
        kp.appendChild(kpi('Profit at '+num(S.sales)+' units',gbp(profit),'per month',profit<0?'bad':'ok'));
        if(S.price>0)kp.appendChild(kpi('Margin',num((c/S.price)*100,0)+'%','of each sale left after variable cost',c<0?'bad':''));
        if(b&&S.sales>b)kp.appendChild(kpi('Margin of safety',num((S.sales-b)/S.sales*100,0)+'%','sales could fall this much before losses'));
        var rec=profit>0?startup()/profit:null;
        if(rec!=null&&startup()>0)kp.appendChild(kpi('Start-up costs back in',num(Math.ceil(rec))+' months',gbp(startup())+' at this monthly profit'));
        msg.className='callout '+(c<=0?'':'tip');
        msg.textContent=c<=0?'Your price is at or below your variable cost, so each sale makes the loss bigger. No volume can save this - raise the price or cut the unit cost.':
          (S.sales<b?'At '+num(S.sales)+' units a month you are below break-even and lose '+gbp(-profit)+' a month. Investors and lenders will want to see how you reach '+num(Math.ceil(b))+' units.':
          'At '+num(S.sales)+' units a month you are above break-even and make '+gbp(profit)+'. Be realistic: investors discount over-optimistic sales assumptions.');
      }
      function chart(xmax,b){
        var W=600,H_=320,L=54,R=14,T=16,B=40,pw=W-L-R,ph=H_-T-B;
        var rev=function(x){return x*S.price},tc=function(x){return S.fixed+x*S.vc};
        var ymax=Math.max(rev(xmax),tc(xmax),1);
        var step=Math.pow(10,Math.floor(Math.log(ymax/4)/Math.LN10));var m=ymax/4/step;step*=m>5?10:m>2?5:m>1?2:1;ymax=Math.ceil(ymax/step)*step;
        var X=function(x){return L+x/xmax*pw},Y=function(y){return T+ph-y/ymax*ph};
        var s=svg('svg',{viewBox:'0 0 '+W+' '+H_,class:'be-chart',role:'img','aria-label':'Break-even chart: revenue and total cost against units sold per month'+(b?'. Break-even at '+Math.ceil(b)+' units.':'. No break-even.')});
        for(var y=0;y<=ymax+1;y+=step){s.appendChild(svg('line',{x1:L,x2:W-R,y1:Y(y),y2:Y(y),stroke:'var(--line)','stroke-width':1,'stroke-dasharray':'2 4'}));s.appendChild(svg('text',{x:L-6,y:Y(y)+4,'text-anchor':'end'},y>=1000?(y/1000)+'k':y))}
        var xs=xmax/5;for(var i=0;i<=5;i++){s.appendChild(svg('text',{x:X(i*xs),y:H_-20,'text-anchor':'middle'},Math.round(i*xs)))}
        s.appendChild(svg('text',{x:L+pw/2,y:H_-4,'text-anchor':'middle'},'units sold per month'));
        if(b&&b<xmax){
          var lp=svg('polygon',{fill:'rgba(215,25,33,.12)',points:X(0)+','+Y(0)+' '+X(0)+','+Y(S.fixed)+' '+X(b)+','+Y(rev(b))});s.appendChild(lp);
          var p=svg('polygon',{});p.setAttribute('points',X(b)+','+Y(rev(b))+' '+X(xmax)+','+Y(rev(xmax))+' '+X(xmax)+','+Y(tc(xmax)));p.setAttribute('fill','rgba(62,142,82,.15)');s.appendChild(p);
          s.appendChild(svg('text',{x:X(b/2.2),y:Y(S.fixed/2)+4,'text-anchor':'middle',fill:'var(--red)',style:'fill:var(--red)'},'loss'));
          s.appendChild(svg('text',{x:X(b+(xmax-b)*.6),y:Y(rev(b+(xmax-b)*.6)*0.92)+14,'text-anchor':'middle',style:'fill:var(--green)'},'profit'));
        }
        s.appendChild(svg('line',{x1:L,x2:W-R,y1:Y(S.fixed),y2:Y(S.fixed),stroke:'var(--ink3)','stroke-width':1.5,'stroke-dasharray':'5 4'}));
        s.appendChild(svg('text',{x:W-R-2,y:Y(S.fixed)-5,'text-anchor':'end'},'fixed costs'));
        s.appendChild(svg('line',{x1:X(0),y1:Y(tc(0)),x2:X(xmax),y2:Y(tc(xmax)),stroke:'var(--red)','stroke-width':2.5}));
        s.appendChild(svg('line',{x1:X(0),y1:Y(0),x2:X(xmax),y2:Y(rev(xmax)),stroke:'var(--ink)','stroke-width':2.5}));
        var lx=X(xmax*.97);
        s.appendChild(svg('text',{x:lx,y:Math.max(T+10,Y(rev(xmax))+(rev(xmax)>=tc(xmax)?-6:14)),'text-anchor':'end',style:'fill:var(--ink);font-weight:700'},'revenue'));
        s.appendChild(svg('text',{x:lx,y:Math.max(T+10,Y(tc(xmax))+(tc(xmax)>rev(xmax)?-6:14)),'text-anchor':'end',style:'fill:var(--red);font-weight:700'},'total cost'));
        if(S.sales<=xmax){s.appendChild(svg('line',{x1:X(S.sales),x2:X(S.sales),y1:T,y2:T+ph,stroke:'var(--ink2)','stroke-width':1.5,'stroke-dasharray':'2 3'}));
          s.appendChild(svg('text',{x:X(S.sales),y:T+10,'text-anchor':S.sales>xmax*.7?'end':'start',dx:S.sales>xmax*.7?-4:4},'your sales'))}
        if(b&&b<=xmax){s.appendChild(svg('line',{x1:X(b),x2:X(b),y1:Y(rev(b)),y2:T+ph,stroke:'var(--ink)','stroke-width':1,'stroke-dasharray':'3 3'}));
          s.appendChild(svg('circle',{cx:X(b),cy:Y(rev(b)),r:7,fill:'var(--red)',stroke:'var(--surface)','stroke-width':2}));
          s.appendChild(svg('text',{x:X(b),y:T+ph-6,'text-anchor':b>xmax*.75?'end':'start',dx:b>xmax*.75?-8:8,style:'fill:var(--ink);font-weight:700'},'break-even '+num(Math.ceil(b))))}
        return s}
      w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Where do you break even?'),
        h('p',{style:{marginTop:'6px'}},'The break-even point is where revenue equals total cost. Pull the sliders and watch the lines. Investors will want to see that you know where your breakeven point is, can control costs and understand your cash flow.')));
      var ctl=h('div',{class:'card'});
      [slider('Price per unit',1,100,0.5,'price',fm,upd),slider('Variable cost per unit',0,100,0.5,'vc',fm,upd),slider('Fixed costs per month',0,10000,50,'fixed',fm,upd),slider('Units you expect to sell / month',0,2000,10,'sales',function(v){return num(v)},upd)].forEach(function(r){ctl.appendChild(r)});
      w.appendChild(ctl);w.appendChild(h('div',{class:'card'},chartBox,kp,msg));
      upd();
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',onclick:function(){S.tab=0;save();render()}},'Back'),h('button',{class:'btn primary',onclick:function(){S.tab=2;save();render()}},'Next: cash runway')));
      return w}

    /* ---------- tab 2: cash ---------- */
    function cashRows(){
      var rows=[],open=S.cash-(S.useStartup?startup():0),prev=open,revs=[];
      if(S.injMonth===0&&S.injAmt)open+=S.injAmt,prev=open;
      rows.push({m:0,u:0,inn:S.cash+(S.injMonth===0?S.injAmt:0),out:S.useStartup?startup():0,bal:open});
      for(var m=1;m<=12;m++){
        var u=Math.min(S.sales,Math.round(S.sales*S.start/100*Math.pow(1+S.growth/100,m-1)));
        revs[m]=u*S.price;
        var inn=(m-S.delay>=1?revs[m-S.delay]:0)+(S.injMonth===m?S.injAmt:0);
        var out=u*S.vc+S.fixed;prev=prev+inn-out;rows.push({m:m,u:u,inn:inn,out:out,bal:prev})}
      return rows}
    function t2(){
      var w=h('div',null),out=h('div',null);
      w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Cash management'),
        h('p',{style:{marginTop:'6px'}},'Sales are usually made on credit, so there is a delay between making a sale and receiving cash. All running costs must be funded before cash comes in from customers. A cash flow forecast shows when cash is scarce - and whether a short-term shock would leave you unable to recover.')));
      var ctl=h('div',{class:'card'});
      var fm=function(v){return gbp(v)},pc=function(v){return v+'%'};
      var rs=[slider('Cash you start with',0,30000,250,'cash',fm,upd),slider('Month-1 sales as % of expected',10,100,5,'start',pc,upd),slider('Sales growth per month',0,60,5,'growth',pc,upd),slider('Customers pay after (months)',0,3,1,'delay',function(v){return v===0?'at once':v+' mth'},upd)];
      rs.forEach(function(r){ctl.appendChild(r)});
      var chk=h('input',{type:'checkbox',checked:S.useStartup,style:{width:'22px',height:'22px',accentColor:'var(--ink)'}});chk.checked=!!S.useStartup;
      chk.addEventListener('change',function(){S.useStartup=chk.checked;save();upd()});
      ctl.appendChild(h('label',{class:'row',style:{minHeight:'44px'}},chk,h('span',null,'Pay my start-up costs ('+gbp(startup())+') in month 0')));
      w.appendChild(ctl);
      var nb=h('p',{class:'tiny muted'},'Price, unit cost, fixed costs and expected sales come from the break-even tab ('+gbp(S.price)+' price, '+gbp(S.vc)+' unit cost, '+gbp(S.fixed)+' fixed, '+num(S.sales)+' units).');
      w.appendChild(nb);w.appendChild(out);
      function upd(){
        out.innerHTML='';
        var rows=cashRows(),min=rows.reduce(function(a,r){return r.bal<a.bal?r:a},rows[0]);
        var first=rows.filter(function(r){return r.bal<0})[0];
        var card=h('div',{class:'card'});
        card.appendChild(first?h('div',{class:'callout'},h('b',null,'Cash goes below zero in '+(first.m===0?'month 0 (start-up)':'month '+first.m)+'. '),'The lowest point is '+gbp(min.bal)+' in month '+min.m+'. You need at least '+gbp(-min.bal)+' more finance - or lower costs, faster payment or higher sales - to survive.'):
          h('div',{class:'callout tip'},h('b',null,'Cash stays above zero for the whole year. '),'Lowest balance '+gbp(min.bal)+' in month '+min.m+'. A contingency plan is still wise: could you survive a sharp, short-term shock such as equipment breakdown or losing a major order?'));
        // bars
        var Wd=420,Ht=150,maxA=Math.max.apply(null,rows.map(function(r){return Math.abs(r.bal)}).concat([1]));
        var s=svg('svg',{viewBox:'0 0 '+Wd+' '+Ht,class:'be-chart',role:'img','aria-label':'Closing cash balance by month, negative months in red'});
        var zero=Ht/2,bw=Wd/rows.length;
        s.appendChild(svg('line',{x1:0,x2:Wd,y1:zero,y2:zero,stroke:'var(--ink3)'}));
        rows.forEach(function(r,i){var hh=Math.abs(r.bal)/maxA*(Ht/2-18);
          s.appendChild(svg('rect',{x:i*bw+bw*.15,width:bw*.7,y:r.bal>=0?zero-hh:zero,height:Math.max(hh,1),fill:r.bal<0?'var(--red)':'var(--ink)',rx:3}));
          s.appendChild(svg('text',{x:i*bw+bw/2,y:r.bal>=0?Ht-3:12,'text-anchor':'middle'},r.m))});
        card.appendChild(s);card.appendChild(h('p',{class:'tiny muted',style:{margin:'4px 0 12px'}},'Closing cash by month (0 = start-up). Red bars are below zero.'));
        // table
        var tb=h('table',{class:'tbl'},h('thead',null,h('tr',null,h('th',null,'Mth'),h('th',{class:'n be-u'},'Units'),h('th',{class:'n'},'Cash in'),h('th',{class:'n'},'Cash out'),h('th',{class:'n'},'Closing cash'))),
          h('tbody',null,rows.map(function(r){return h('tr',{class:r.bal<0?'be-neg':''},h('td',null,r.m),h('td',{class:'n be-u'},r.m?r.u:'-'),h('td',{class:'n'},gbp(r.inn)),h('td',{class:'n'},gbp(r.out)),h('td',{class:'n'},gbp(r.bal)))})));
        card.appendChild(h('div',{class:'be-scroll',role:'region','aria-label':'Monthly cash flow table',tabindex:'0'},tb));
        out.appendChild(card);
        // fix
        var fix=h('div',{class:'card flat'},h('span',{class:'label'},'Closing the gap'));
        var amt=h('input',{class:'input',type:'number',min:0,step:100,value:S.injAmt,'aria-label':'Funding amount',style:{maxWidth:'140px'},inputmode:'decimal'});
        var mo=h('select',{class:'input','aria-label':'Funding month',style:{maxWidth:'150px'}},[0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(m){return h('option',{value:m,selected:m===S.injMonth},'Month '+m)}));
        amt.addEventListener('change',function(){S.injAmt=Math.max(0,+amt.value||0);save();upd()});
        mo.addEventListener('change',function(){S.injMonth=+mo.value;save();upd()});
        fix.appendChild(h('p',{class:'tiny muted',style:{marginTop:'6px'}},'Add an injection of finance (loan, equity, grant...) and see whether it covers the gap. Which source fits? Try the finance match tab.'));
        fix.appendChild(h('div',{class:'row'},h('span',null,'Inject'),amt,mo));
        fix.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},first?h('button',{class:'btn sm primary',onclick:function(){S.injMonth=first.m;S.injAmt=Math.ceil(-min.bal/100)*100;save();render()}},'Cover the gap ('+gbp(Math.ceil(-min.bal/100)*100)+' in month '+first.m+')'):null,
          S.injAmt?h('button',{class:'btn sm ghost',onclick:function(){S.injAmt=0;save();render()}},'Remove injection'):null));
        out.appendChild(fix);
      }
      upd();
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',onclick:function(){S.tab=1;save();render()}},'Back'),h('button',{class:'btn primary',onclick:function(){S.tab=3;save();render()}},'Next: finance match')));
      return w}

    /* ---------- tab 3: matcher ---------- */
    function t3(){
      var w=h('div',null),i=S.m.i||0;
      var answered=Object.keys(S.m.a||{}).length;
      w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Sources of finance'),
        h('p',{style:{marginTop:'6px'}},'There are three main sources: equity, debt and reinvested profits - plus grants and alternative finance such as crowdfunding. Choose the best match for each situation.')));
      if(i>=SC.length){
        var good=SC.filter(function(s,k){return S.m.a[k]&&S.m.a[k].first&&(S.m.a[k].first===s.a||(s.alt||[]).indexOf(S.m.a[k].first)>=0)}).length;
        w.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#9a9a9a'}},'Finished'),h('h2',{style:{color:'#fff'}},good+' of '+SC.length+' right first time'),
          h('p',{style:{color:'#ccc'}},'In practice a business mixes sources - and each carries benefits, risks and obligations. Which would you choose for yours?')));
        w.appendChild(h('div',{class:'row'},h('button',{class:'btn',onclick:function(){S.m={};save();render()}},'Try again'),h('button',{class:'btn primary',onclick:function(){S.tab=4;save();render()}},'Next: predict')));
        finish();return w}
      var sc=SC[i],rec=(S.m.a||{})[i]||null,solved=rec&&rec.solved;
      w.appendChild(h('div',{class:'row between'},h('span',{class:'label'},'Scenario '+(i+1)+' of '+SC.length),h('div',{class:'bar',style:{width:'40%'}},h('i',{style:{width:(i/SC.length*100)+'%'}}))));
      var card=h('div',{class:'card'},h('p',{style:{fontSize:'1.05rem'}},sc.t));
      var opts=h('div',{class:'be-opt',role:'group','aria-label':'Sources of finance'});
      Object.keys(SRC).forEach(function(k){
        var tried=rec&&rec.tried&&rec.tried.indexOf(k)>=0,right=k===sc.a||(sc.alt||[]).indexOf(k)>=0;
        opts.appendChild(h('button',{class:'chip'+(tried?(right?' right':' wrong'):''),disabled:solved&&!tried,'aria-pressed':tried?'true':'false',onclick:function(){
          var r=S.m.a=S.m.a||{};var e=r[i]=r[i]||{tried:[],first:null,solved:false};
          if(e.tried.indexOf(k)<0)e.tried.push(k);
          if(!e.first)e.first=k;
          if(right)e.solved=true;
          save();render()}},SRC[k].n))});
      card.appendChild(opts);
      if(rec&&rec.tried&&rec.tried.length){
        rec.tried.forEach(function(k){var right=k===sc.a||(sc.alt||[]).indexOf(k)>=0;
          card.appendChild(h('div',{class:'callout '+(right?'tip':'')},h('b',null,SRC[k].n+(right?' - good match. ':' - not the best fit. ')),SRC[k].f+(right?'':' Think about what this scenario needs instead.')))});
        if(solved)card.appendChild(h('div',{class:'callout note'},h('b',null,'Why: '),sc.why))}
      w.appendChild(card);
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',disabled:i===0,onclick:function(){S.m.i=i-1;save();render()}},'Previous'),
        h('button',{class:'btn primary',disabled:!solved,onclick:function(){S.m.i=i+1;save();render()}},i===SC.length-1?'Finish':'Next scenario')));
      return w}

    /* ---------- tab 4: predict ---------- */
    function t4(){
      var w=h('div',null);
      w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Predict, then check'),h('p',{style:{marginTop:'6px'}},'Commit to an answer before you see the result - then test it on the real chart. Working out the answer yourself is what makes the idea stick.')));
      PRED.forEach(function(q,i){
        var r=S.pred[i]||{sel:null,checked:false};
        var box=h('div',{class:'be-q'},h('span',{class:'label'},'Question '+(i+1)),h('p',{style:{margin:'6px 0'}},q.q));
        var opts=h('div',{class:'be-opt',role:'radiogroup','aria-label':'Answers to question '+(i+1)});
        q.o.forEach(function(o,k){opts.appendChild(h('button',{class:'chip'+(r.sel===k&&!r.checked?' on':'')+(r.checked&&k===q.a?' right':'')+(r.checked&&r.sel===k&&k!==q.a?' wrong':''),role:'radio','aria-checked':r.sel===k?'true':'false',disabled:r.checked,onclick:function(){S.pred[i]={sel:k,checked:false};save();render()}},o))});
        box.appendChild(opts);
        if(!r.checked)box.appendChild(h('button',{class:'btn primary sm',disabled:r.sel==null,onclick:function(){r.checked=true;S.pred[i]=r;save();render()}},'Check my prediction'));
        else{
          box.appendChild(h('div',{class:'callout '+(r.sel===q.a?'tip':'')},h('b',null,r.sel===q.a?'Correct. ':'Not quite. '),q.e));
          box.appendChild(h('button',{class:'btn sm',onclick:function(){
            if(q.set){S.price=q.set.price;S.vc=q.set.vc;S.fixed=q.set.fixed;S.tab=1}
            if(q.cash){var c=q.cash;Object.keys(c).forEach(function(k){S[k]=c[k]});S.tab=2}
            save();render()}},'Try it in the '+(q.set?'chart':'cash table')));
        }
        w.appendChild(box)});
      var n=Object.keys(S.pred).filter(function(k){return S.pred[k].checked}).length;
      var right=Object.keys(S.pred).filter(function(k){return S.pred[k].checked&&S.pred[k].sel===PRED[k].a}).length;
      if(n===PRED.length)w.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#9a9a9a'}},'Result'),h('h3',{style:{color:'#fff'}},right+' of '+PRED.length+' predicted correctly'),
        h('p',{style:{color:'#ccc'}},right===PRED.length?'You can reason about break-even and cash.':'The surprise is where learning happens. Use the buttons above to see each answer on the chart.')));
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',onclick:function(){S.tab=3;save();render()}},'Back'),h('button',{class:'btn ghost',onclick:function(){S.pred={};save();render()}},'Reset predictions')));
      finish();return w}

    function finish(){
      if(S.done)return;
      var n=Object.keys(S.pred).filter(function(k){return S.pred[k].checked}).length;
      var answered=SC.filter(function(s,k){return S.m.a&&S.m.a[k]&&S.m.a[k].solved}).length;
      if(n===PRED.length&&answered===SC.length){
        var right=Object.keys(S.pred).filter(function(k){return S.pred[k].sel===PRED[k].a}).length;
        var good=SC.filter(function(s,k){var f=S.m.a[k].first;return f===s.a||(s.alt||[]).indexOf(f)>=0}).length;
        S.done=true;save();ctx.complete((right+good)/(PRED.length+SC.length))}}

    function render(){
      el.style.minHeight=el.offsetHeight+'px';
      el.innerHTML='';
      el.appendChild(h('div',{class:'tool'},tabs(),[t0,t1,t2,t3,t4][S.tab]()));
      el.style.minHeight='';
    }
    render();
  }});
})();

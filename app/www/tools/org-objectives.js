/* Organisational objectives: goals vs objectives and the SMART criteria (PM course 1.5) */
(function(){
  var h=H.h;
  var css=
  '.oo-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:12px;border-bottom:1px dotted var(--ink3)}'+
  '.oo-bins{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}'+
  '.oo-bin{border:2px dashed var(--line);border-radius:var(--r-md);padding:10px;min-height:96px;background:var(--surface);cursor:pointer;transition:border-color .15s,background .15s}'+
  '.oo-bin.armed{border-color:var(--ink);background:var(--surface2)}.oo-bin.hot{border-color:var(--red);background:var(--surface2)}'+
  '.oo-bin h4{margin:0 0 2px;font-size:1rem;font-weight:500}.oo-bin .hint{font-size:.75rem;color:var(--ink2);margin-bottom:6px}'+
  '.oo-it{border:1.5px solid var(--line);border-radius:var(--r-sm);padding:9px 12px;margin:0 0 8px;background:var(--surface);font-size:.92rem;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;display:block;width:100%;text-align:left}'+
  '.oo-it.sel{border-color:var(--red);border-style:dotted;border-width:2px}'+
  '.oo-it.ok{border-color:var(--green);cursor:default;touch-action:auto}.oo-it.ok small{display:block;color:var(--ink2);margin-top:3px;font-size:.8rem}'+
  '.oo-it.shake{animation:oo-sh .35s}@keyframes oo-sh{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'+
  '.oo-ghost{position:fixed;z-index:10000;max-width:240px;background:var(--ink);color:var(--bg);padding:8px 12px;border-radius:var(--r-sm);font-size:.85rem;pointer-events:none;transform:translate(-50%,-120%);opacity:.92}'+
  '.oo-fb{border-radius:var(--r-md);padding:10px 14px;margin:0 0 12px;font-size:.92rem;background:var(--surface2);border-left:3px solid var(--ink3)}'+
  '.oo-fb.bad{border-color:var(--red)}.oo-fb.good{border-color:var(--green)}'+
  '.oo-crit{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}'+
  '.oo-crit .k{flex:none;width:92px}.oo-crit .m{flex:1;min-width:0;font-size:.92rem}'+
  '.oo-p{display:inline-block;border-radius:99px;padding:2px 12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;border:1.5px solid var(--line);background:var(--surface2);color:var(--ink2)}'+
  '.oo-p.pass{background:var(--green);border-color:var(--green);color:#fff}.oo-p.warn{background:var(--amber);border-color:var(--amber);color:#fff}.oo-p.fail{background:var(--red);border-color:var(--red);color:#fff}'+
  '.oo-seg{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}'+
  '.oo-b{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}@media(max-width:520px){.oo-b{grid-template-columns:1fr}}'+
  '.oo-sm{width:100%;border-collapse:collapse;font-size:.9rem}.oo-sm td{padding:7px 6px;border-bottom:1px solid var(--line);vertical-align:top}.oo-sm td:first-child{width:36px;font-weight:600}';
  if(!document.getElementById('oo-css')){var st=document.createElement('style');st.id='oo-css';st.textContent=css;document.head.appendChild(st)}

  function sh(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function txt(n){return String(n==null?'':n)}

  /* ------------------------------------------------------------- sorter */
  /* cfg: {bins:[{k,l,hint}], items:[{t,bin,why}], six:bool}; st: {done:{idx:1}, first:{idx:1}, tries:n}; cb(st) on change */
  function Sorter(cfg,st,cb){
    st.done=st.done||{};st.first=st.first||{};st.tried=st.tried||{};
    if(!st.order||st.order.length!==cfg.items.length)st.order=sh(cfg.items.map(function(_,i){return i}));
    var sel=null,wrap=h('div'),fb=h('div'),pool=h('div'),binsEl=h('div',{class:'oo-bins'+(cfg.six?' six':'')});
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
    function setFb(kind,msg){fb.innerHTML='';fb.appendChild(h('div',{class:'oo-fb '+kind,role:'status'},msg))}
    function startDrag(ev,i){
      if(ev.button>0)return; var sx=ev.clientX,sy=ev.clientY,moved=false,g=null,hot=null;
      function over(e){var t=document.elementFromPoint(e.clientX,e.clientY);var b=t&&t.closest?t.closest('[data-bin]'):null;
        if(hot&&hot!==b)hot.classList.remove('hot');hot=b;if(b)b.classList.add('hot');return b}
      function mv(e){if(!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)>6){moved=true;g=h('div',{class:'oo-ghost'},cfg.items[i].t);document.body.appendChild(g)}
        if(moved){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';over(e);if(e.cancelable)e.preventDefault()}}
      function up(e){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);
        if(g)g.remove(); var b=moved?over(e):null; if(hot)hot.classList.remove('hot');
        if(!moved){sel=(sel===i?null:i);draw();return}
        if(b&&e.type!=='pointercancel')drop(i,b.getAttribute('data-bin'));}
      document.addEventListener('pointermove',mv,{passive:false});document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
    }
    cfg.bins.forEach(function(b){
      var body=h('div'); var el=h('div',{class:'oo-bin','data-bin':b.k,role:'button',tabindex:'0','aria-label':'Box: '+b.l,
        onclick:function(e){if(e.target.closest('.oo-it'))return; if(sel!=null)drop(sel,b.k)},
        onkeydown:function(e){if((e.key==='Enter'||e.key===' ')&&sel!=null){e.preventDefault();drop(sel,b.k)}}},
        h('h4',null,b.l),h('div',{class:'hint'},b.hint||''),body);
      binEls[b.k]={el:el,body:body};binsEl.appendChild(el)});
    function draw(){
      var p=pending();
      cfg.bins.forEach(function(b){var bd=binEls[b.k].body;bd.innerHTML='';binEls[b.k].el.classList.toggle('armed',sel!=null);
        st.order.forEach(function(i){var it=cfg.items[i];if(st.done[i]&&it.bin===b.k)bd.appendChild(h('div',{class:'oo-it ok'},it.t,h('small',null,it.why)))})});
      pool.innerHTML='';
      p.forEach(function(i){var el=h('div',{class:'oo-it'+(sel===i?' sel':''),'data-i':i,role:'button',tabindex:'0','aria-label':'Item: '+cfg.items[i].t,
        onkeydown:function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel=(sel===i?null:i);draw()}}},cfg.items[i].t);
        el.addEventListener('pointerdown',function(e){startDrag(e,i)});pool.appendChild(el)});
      var total=cfg.items.length,dn=total-p.length;
      if(!p.length){var f=Object.keys(st.first).length;
        pool.appendChild(h('div',{class:'oo-fb good'},h('b',null,'All sorted. '),'First-try correct: '+f+' of '+total+'.'));}
      else if(sel==null&&!fb.firstChild)pool.insertBefore(h('div',{class:'muted tiny',style:{marginBottom:'8px'}},'Tap an item, then tap the box it belongs in - or drag it there. '+dn+' of '+total+' placed.'),pool.firstChild);
      else pool.insertBefore(h('div',{class:'muted tiny',style:{marginBottom:'8px'}},sel!=null?'Now tap a box (or drag the item).':'Tap an item, then a box. '+dn+' of '+total+' placed.'),pool.firstChild);
    }
    wrap.appendChild(binsEl);wrap.appendChild(fb);wrap.appendChild(pool);draw();
    return {el:wrap,done:function(){return !pending().length},score:function(){return Object.keys(st.first).length/cfg.items.length}};
  }



  /* ------------------------------------------------------------- rule-based checker */
  var MONTH='jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
  var VERBS='reduce increase improve raise cut enrol enroll train provide encourage achieve complete launch deliver build install reach grow lower decrease boost save win recruit publish finish implement open double halve maintain ensure develop create generate gain obtain eliminate limit shorten expand cover answer sell earn collect hold run register upgrade migrate replace write hire buy introduce set make be become promote support secure attract retain resolve test deploy';
  var VERBL=VERBS.split(' ');
  var HOWV='install buy purchase implement introduce hire launch deploy upgrade migrate replace';
  var NUMW='(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|hundred|thousand|million|half|double|triple|halve)';
  var VAGUE=/\b(better|good|great|best|nice|various|several|some|many|more|less|etc|things?|stuff|efficient(?:ly)?|effective(?:ly)?|quality|happy|world[- ]class|as much as possible|as possible|asap|improve(?:d|ment)?|enhance|optimi[sz]e|top|leading|successful(?:ly)?|appropriate|reasonable)\b/gi;
  function stripDates(t){
    return t.replace(/\b(19|20)\d\d\b/g,' ').replace(new RegExp('\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?:'+MONTH+')\\b','gi'),' ')
      .replace(new RegExp('\\b(?:'+MONTH+')\\s+\\d{1,2}(?:st|nd|rd|th)?\\b','gi'),' ')
      .replace(new RegExp('\\b(?:within|in|over|during|for|after|by)\\s+(?:the\\s+)?(?:next\\s+|first\\s+|last\\s+)?(?:\\d+|'+NUMW+')\\s+(?:working\\s+)?(?:days?|weeks?|months?|years?|quarters?)\\b','gi'),' ');
  }
  function evalObj(text,o){
    o=o||{}; var raw=(text||'').trim(), t=raw.toLowerCase().replace(/\s+/g,' '), words=t?t.split(/\s+/):[], res=[];
    function add(k,l,st,msg,fix){res.push({k:k,l:l,st:st,msg:msg,fix:fix||''})}
    if(!raw)return {res:[],score:0,ok:false,empty:true};
    /* verb */
    var first=t.replace(/^(we will|we want to|we aim to|we need to|our objective is to|the objective is to)\s+/,'').replace(/^to\s+/,'').split(/\s+/)[0]||'';
    var hasTo=/^(to |we will |we want to |we aim to |our objective is to )/.test(t);
    var vOk=VERBL.indexOf(first.replace(/[^a-z]/g,''))>=0;
    if(vOk)add('verb','Action verb','pass','Starts with an action verb ("'+first+'"): it says what must be done.');
    else if(hasTo)add('verb','Action verb','warn','You start with "to", but "'+first+'" is not a clear action verb.','Try verbs such as reduce, increase, provide, achieve, complete.');
    else add('verb','Action verb','fail','No action verb at the start. Objectives imply that action is needed; goals only describe a desired state.','Begin with "To ..." and a verb such as reduce, increase, provide, encourage.');
    /* specific */
    var vg=(t.match(VAGUE)||[]).map(function(x){return x.toLowerCase()});
    var meas=(function(){var s=stripDates(t);return /\d|%|per ?cent|£|\$|€/.test(s)||new RegExp('\\b'+NUMW+'\\b').test(s)})();
    if(vg.length&&meas){vg=vg.filter(function(w){return !/^(improve|improved|improvement|more|less|reduce)$/.test(w)})}
    if(words.length<6)add('S','Specific','fail','Too short to be precise. Say exactly what, for whom or where.','Add the object (what is changing), and the place or group it applies to.');
    else if(vg.length>=2||(vg.length===1&&!meas))add('S','Specific','fail','Vague wording: "'+vg.slice(0,3).join('", "')+'". Be precise about what you want to achieve.','Replace vague words with the thing itself: which process, which customers, which cost?');
    else if(vg.length===1)add('S','Specific','warn','"'+vg[0]+'" is a little vague. Could someone else tell exactly what you mean?','Name the thing precisely.');
    else add('S','Specific','pass','No vague wording: it names what is to be achieved.');
    /* measurable */
    if(meas)add('M','Measurable','pass','There is a quantity you could check (a number, percentage or amount).');
    else add('M','Measurable','fail','Nothing is quantified, so nobody could tell whether it has been achieved.','Add a number: how many, how much, what percentage, from what to what.');
    /* achievable */
    var pct=(t.match(/(\d+(?:\.\d+)?)\s*(?:%|per ?cent)/)||[])[1], extreme=/\b(100 ?%|100 per ?cent|every|never|always|zero|all customers|everyone|world|number one|no extra|no more|without (?:any )?(?:extra|additional|more)|double|triple|tenfold|ten-fold|best)\b/.exec(t);
    var aNote=[]; if(extreme)aNote.push('"'+extreme[0]+'" is a big claim'); if(pct&&parseFloat(pct)>=50&&parseFloat(pct)<100)aNote.push(pct+'% is a large change');
    if(o.noSelf)add('A','Achievable','info','Judge: are you attempting too much?'+(aNote.length?' Watch out: '+aNote.join('; ')+'.':''));
    else if(o.sa==='yes')add('A','Achievable','fail','You said you are attempting too much. Scale it down or extend the time.','Reduce the size of the change, or split it into stages.');
    else if(o.sa==='no'&&!aNote.length)add('A','Achievable','pass','You judge it is not too much - and nothing in the wording looks extreme.');
    else if(o.sa==='no')add('A','Achievable','warn','You say it is achievable, but '+aNote.join('; ')+'. Double-check.','Evidence helps: has anyone achieved this before?');
    else add('A','Achievable','warn',(aNote.length?aNote.join('; ')+'. ':'')+'Only you can judge: are you attempting too much?','Answer the self-check question.');
    /* realistic */
    var noRes=/\b(no extra|without (?:any )?(?:extra|additional|more)|no budget|with no (?:money|staff|budget)|for free|at no cost|zero cost)\b/.exec(t);
    if(o.noSelf)add('R','Realistic','info','Judge: do you have the resources (people, money, skills, time)?'+(noRes?' "'+noRes[0]+'" looks like it contradicts that.':''));
    else if(noRes||o.sr==='no')add('R','Realistic','fail',noRes?'"'+noRes[0]+'" suggests you will not have the resources.':'You said you lack the resources.','Say what resources are needed, or lower the target.');
    else if(o.sr==='yes')add('R','Realistic','pass','You have the resources to reach it (people, money, time, skills).');
    else add('R','Realistic','warn','Only you can judge: do you have the resources to reach the objective?','Answer the self-check question.');
    /* timed */
    var timed=/\b(by|before|within|until|no later than|end of|by the end of|deadline|every (?:week|month|quarter|year)|per (?:week|month|year)|each (?:week|month|year))\b/.test(t)&&/(\d|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|monday|friday|week|month|year|quarter|term|semester|summer|winter|spring|autumn|christmas|financial year)/i.test(t);
    timed=timed||/\b(?:next|this)\s+(?:week|month|year|quarter|term|semester|summer|autumn|winter|spring)\b|\btomorrow\b/.test(t);
    var soon=/\b(asap|soon|as soon as|eventually|in the future|ongoing|when possible|at some point|in due course)\b/.exec(t);
    if(timed&&!soon)add('T','Timed','pass','It states when it will be achieved.');
    else add('T','Timed','fail',soon?'"'+soon[0]+'" is not a date.':'No deadline. State when you will achieve the objective.','Add "by [date]" or "within [period]".');
    /* what not how */
    var how=HOWV.split(' ').indexOf(first)>=0||/\b(by|through|via)\s+(?:using|buying|installing|implementing|hiring|introducing|building|launching|a new|new software|the new)\b/.test(t);
    if(how)add('how','What, not how','warn','This sounds like a "how" (a solution or plan). Objectives are the "whats": the result you want.','Ask: what will this achieve? Write that as the objective; the strategy comes later.');
    else add('how','What, not how','pass','Reads as a result wanted (a "what"), leaving the "how" for the plan.');
    var pts=0,n=0;res.forEach(function(r){if(r.k==='how'||r.st==='info')return;n++;pts+=r.st==='pass'?1:(r.st==='warn'?0.5:0)});
    var by={};res.forEach(function(r){by[r.k]=r.st});
    var ok=by.verb==='pass'&&by.S==='pass'&&by.M==='pass'&&by.T==='pass'&&(o.noSelf||(by.A!=='fail'&&by.R!=='fail'));
    return {res:res,score:n?pts/n:0,ok:ok,by:by};
  }
  var LONG={S:'Specific',M:'Measurable',A:'Achievable',R:'Realistic',T:'Timed'};
  function resultView(ev,compact){
    var box=h('div');
    ev.res.forEach(function(r){
      var lab={pass:'Pass',warn:'Check',fail:'Fix',info:'Judge'}[r.st];
      box.appendChild(h('div',{class:'oo-crit'},h('div',{class:'k'},h('div',{class:'label',style:{marginBottom:'4px'}},(LONG[r.k]?r.k+' · ':'')+r.l),h('span',{class:'oo-p '+r.st},lab)),
        h('div',{class:'m'},r.msg,r.fix&&r.st!=='pass'&&!compact?h('div',{class:'muted',style:{fontSize:'.85rem',marginTop:'3px'}},'Tip: '+r.fix):null)));
    });
    return box;
  }

  /* ------------------------------------------------------------- exercise data */
  var SMART_ITEMS=[
    {t:'To reduce delivery costs by 12 per cent by the end of the current financial year.',bin:'good',why:'Specific (delivery costs), Measurable (12%), Timed (end of financial year). The course\'s own example.'},
    {t:'To cut the average time to answer customer emails from 48 to 24 hours by 30 June.',bin:'good',why:'Specific, measurable (48 to 24 hours), timed (30 June), and a realistic size of change.'},
    {t:'To enrol 60 new members in the club by the end of September.',bin:'good',why:'Says what (new members), how many (60) and when (end of September).'},
    {t:'To raise £5,000 for the roof repair fund by 1 December.',bin:'good',why:'Precise target, amount and date.'},
    {t:'To train all 12 warehouse staff in manual-handling safety within the next three months.',bin:'good',why:'Who (12 staff), what (training) and when (three months): easy to check.'},
    {t:'Improve customer service.',bin:'weak',why:'Fails S, M and T: "improve" and "service" are vague, nothing is quantified, there is no deadline.'},
    {t:'To become the best bakery in the world.',bin:'weak',why:'Not measurable (best by what?), no deadline, and neither achievable nor realistic for a small business.'},
    {t:'A happy family life.',bin:'weak',why:'This is a goal: a desired state with no action verb, no measure and no date.'},
    {t:'To reduce costs as much as possible as soon as we can.',bin:'weak',why:'"As much as possible" and "as soon as we can" are neither a number nor a date.'},
    {t:'To double sales next month with no extra staff or budget.',bin:'weak',why:'Measurable and timed, but not achievable and not realistic: the resources do not match the ambition.'},
    {t:'To install new booking software by March.',bin:'weak',why:'It is a "how" (a plan or solution), not a "what". It has a date but says nothing about the result the software should achieve.'}];
  var GOAL_ITEMS=[
    {t:'A happy family life',bin:'goal',why:'A desired state: no verb and nothing anyone has to do yet.'},
    {t:'A thriving local high street',bin:'goal',why:'Describes an end state in general terms.'},
    {t:'A safer neighbourhood',bin:'goal',why:'The general outcome of some effort: a goal.'},
    {t:'Being a respected employer',bin:'goal',why:'A state to be in, not an action.'},
    {t:'To provide financial security for each family member',bin:'obj',why:'"To provide" implies action is required to reach the goal.'},
    {t:'To encourage the public to reduce their dependence on the private motor car',bin:'obj',why:'High-level objective of a campaigning group: "to encourage ..." implies action.'},
    {t:'To improve the standard of living among our members and their families',bin:'obj',why:'High-level objective of a producer cooperative: starts with the action "to improve".'},
    {t:'To increase profit',bin:'obj',why:'Typical top-level objective of a profit-oriented organisation: an action ("increase") on something.'}];
  var FIX=[
    {s:'Improve customer service.',m:'To reduce the average time to answer customer complaints from five days to two days by 30 September.',tip:'Which part of "service"? Pick one thing you can count, from what to what, by when.'},
    {s:'Make our website better.',m:'To increase online orders through the website by 20 per cent by the end of the year.',tip:'"Better" for whom, measured how? Choose an outcome (orders, sign-ups, visits).'},
    {s:'Be the best bakery in town.',m:'To reach an average rating of 4.5 stars on local review sites within 12 months.',tip:'"Best" needs a yardstick, and a time.'},
    {s:'Install new accounting software.',m:'To cut the time taken to close the monthly accounts from ten days to five by 31 March.',tip:'This is a "how". What result should the software deliver? The software may become the strategy for achieving that objective.'}];

  /* ------------------------------------------------------------- the tool */
  Tools.register('org-objectives',{title:'Objectives checker',desc:'Learn SMART, sort good from weak objectives, rewrite weak ones and test your own.',
  mount:function(el,ctx){
    var S=ctx.load()||{};
    S.tab=S.tab||'learn'; S.sort=S.sort||{}; S.goal=S.goal||{}; S.fix=S.fix||{}; S.mine=S.mine||{text:'',sa:'',sr:'',proj:'',hist:[],b:{v:'',w:'',a:'',d:''}};
    S.ai=S.ai||{};
    function save(){ctx.save(S)}
    var root=h('div',{class:'tool'}),tabs=h('div',{class:'oo-tabs'}),body=h('div');
    el.appendChild(root);root.appendChild(tabs);root.appendChild(body);
    var TABS=[['learn','1  Learn'],['goal','2  Goal or objective?'],['sort','3  Good or weak?'],['fix','4  Fix weak ones'],['mine','5  My objective']];
    var done=false;
    function sortDone(){return Object.keys(S.sort.done||{}).length===SMART_ITEMS.length}
    function mineOk(){return S.mine.best&&S.mine.best.ok}
    function fixN(){return FIX.filter(function(f,i){return S.fix[i]&&S.fix[i].ok}).length}
    function maybeComplete(){if(done)return;if(sortDone()&&(mineOk()||fixN()>=3)){done=true;ctx.complete(Math.max(S.mine.best?S.mine.best.score:0,fixN()/FIX.length))}}
    function drawTabs(){tabs.innerHTML='';TABS.forEach(function(t){var mark=(t[0]==='sort'&&sortDone())||(t[0]==='goal'&&Object.keys(S.goal.done||{}).length===GOAL_ITEMS.length)||(t[0]==='fix'&&fixN()>=3)||(t[0]==='mine'&&mineOk());
      tabs.appendChild(h('button',{class:'chip'+(S.tab===t[0]?' on':''),onclick:function(){S.tab=t[0];save();draw()}},t[1]+(mark?' ✓':'')))})}
    function draw(){drawTabs();body.innerHTML='';({learn:learn,goal:goal,sort:sort,fix:fix,mine:mine})[S.tab]()}
    function nextBtn(to,label){return h('div',{style:{marginTop:'12px'}},h('button',{class:'btn primary',onclick:function(){S.tab=to;save();draw();try{root.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}}},label))}

    function learn(){
      body.appendChild(h('div',{class:'card flat'},h('h3',null,'Objectives are the “whats”'),
        h('p',null,'Objectives are the things the organisation wants to achieve. A top-level objective might be “to increase profit”, “to improve the standard of living among our members” or “to encourage the public to reduce their dependence on the private motor car”. Notice the verbs: objectives imply that ',h('b',null,'action'),' is required to achieve a goal.'),
        h('p',null,h('b',null,'Goals'),' mark the general outcome of some effort or express the desired state you would like to achieve (“a happy family life”). In contrast, objectives are often required to be ',h('b',null,'SMART'),':')));
      body.appendChild(h('div',{class:'card'},h('table',{class:'oo-sm'},h('tbody',null,[
        ['S','Specific','Be precise about what you want to achieve.'],['M','Measurable','Quantify your objectives.'],['A','Achievable','Are you attempting too much?'],['R','Realistic','Do you have the resources to reach the objective?'],['T','Timed','State when you will achieve the objective.']].map(function(r){return h('tr',null,h('td',null,r[0]),h('td',null,h('b',null,r[1]+': '),r[2]))}))),
        h('div',{class:'callout',style:{marginTop:'12px',marginBottom:0}},h('b',null,'Course example. '),'An internet-based mail order company might start a project with the objective “to reduce delivery costs by 12 per cent by the end of the current financial year”.')));
      body.appendChild(h('div',{class:'callout tip'},h('b',null,'Also remember. '),'Objectives are what the organisation wants to achieve; plans are the highest-level “hows”. There is almost always more than one way to achieve an objective - so do not hide a solution inside the objective. And avoid abstract or unquantified terms such as “safe” or “reliable”: say how anyone would know they had been achieved.'));
      body.appendChild(nextBtn('goal','Start: goal or objective?'));
    }

    function goal(){
      body.appendChild(h('div',{class:'card flat'},h('b',null,'Warm-up. '),'A goal is a desired state; an objective calls for action. Sort the eight statements.'));
      var st=S.goal;
      var so=Sorter({bins:[{k:'goal',l:'Goal',hint:'A desired state'},{k:'obj',l:'Objective',hint:'Implies action'}],items:GOAL_ITEMS,
        wrong:function(it,k){return k==='goal'?'This one has an action verb: something has to be done to achieve it.':'This one just describes a state to be in - there is no action in it.'}},st,function(){save();drawTabs();if(so.done())fin()});
      var res=h('div');body.appendChild(so.el);body.appendChild(res);
      function fin(){res.innerHTML='';res.appendChild(nextBtn('sort','Next: good or weak objectives?'))}
      if(so.done())fin();
    }

    function sort(){
      body.appendChild(h('div',{class:'card flat'},h('b',null,'Sorting exercise. '),'Test each statement against SMART (and the action verb). Does it meet the criteria, or is it weak? You get the reason straight away.'));
      var st=S.sort;
      var so=Sorter({bins:[{k:'good',l:'Good objective',hint:'Meets the SMART criteria'},{k:'weak',l:'Weak objective',hint:'Fails one or more'}],items:SMART_ITEMS,
        wrong:function(it,k){var ev=evalObj(it.t,{noSelf:true});var fails=ev.res.filter(function(r){return r.st==='fail'||r.k==='how'&&r.st==='warn'}).map(function(r){return r.l});
          return k==='good'?'Look again - this one is weak. '+(fails.length?'Rule check flags: '+fails.join(', ')+'. ':'')+'Is anything unmeasured, undated or vague? Is it a goal or a "how"?':'This one actually meets the criteria: what, how much and when are all stated.'}},st,function(){save();drawTabs();if(so.done()){fin();maybeComplete()}});
      var res=h('div');body.appendChild(so.el);body.appendChild(res);
      function fin(){res.innerHTML='';res.appendChild(nextBtn('fix','Next: fix the weak ones'))}
      if(so.done())fin();
    }

    function fix(){
      body.appendChild(h('div',{class:'card flat'},h('b',null,'Rewrite them. '),'Here are four weak objectives. Rewrite each as a SMART objective (invent plausible numbers and dates - this is practice). The tester checks your wording against the rules. Achievable and Realistic need your own judgement, so they are not scored here.'));
      FIX.forEach(function(f,i){
        var s=S.fix[i]=S.fix[i]||{text:'',ok:false,tries:0};
        var out=h('div'),ta=h('textarea',{class:'textarea',style:{minHeight:'72px'},placeholder:'To ... by ...','aria-label':'Rewrite: '+f.s,oninput:function(){s.text=ta.value;save()}});ta.value=s.text||'';
        function paint(){out.innerHTML='';
          if(s.ev){out.appendChild(resultView(s.ev,true));
            out.appendChild(h('div',{class:'oo-fb '+(s.ok?'good':'bad'),style:{marginTop:'8px'}},s.ok?'Well done - it has an action verb and is specific, measurable and timed.':'Not yet. Fix the items marked "Fix", then test again.'))}
          if(s.tries>=1||s.ok){var m=h('div',{class:'callout tip',style:{marginTop:'8px',marginBottom:0}},h('b',null,'Example rewrite: '),f.m,h('div',{class:'muted',style:{fontSize:'.85rem',marginTop:'4px'}},f.tip));out.appendChild(m)}}
        body.appendChild(h('div',{class:'card'},h('div',{class:'label'},'Weak objective '+(i+1)),h('p',{style:{fontSize:'1.05rem',fontWeight:500,margin:'4px 0 10px'}},'“'+f.s+'”'),ta,
          h('div',{style:{margin:'10px 0'}},h('button',{class:'btn primary',onclick:function(){if(ta.value.trim().length<5){ctx.toast('Write your rewrite first');return}
            s.text=ta.value;s.ev=evalObj(s.text,{noSelf:true});s.ev.res=s.ev.res.filter(function(r){return r.k!=='how'||r.st!=='pass'});s.ok=s.ev.ok;s.tries++;save();paint();drawTabs();maybeComplete()}},'Test my rewrite')),out));
        paint();
      });
      body.appendChild(h('div',{class:'row'},h('button',{class:'btn ghost sm',onclick:function(){if(confirm('Clear my rewrites?')){S.fix={};save();draw()}}},'Reset this tab')));
      body.appendChild(nextBtn('mine','Now test my own objective'));
    }

    function mine(){
      var M=S.mine;
      body.appendChild(h('div',{class:'card flat'},h('b',null,'Your own objective. '),'Think of a project, group or team you belong to and write one objective for it. The tester applies the five SMART criteria and the action-verb test; you judge Achievable and Realistic, because only you know the situation. Improve it and test again - your versions are kept below.'));
      var proj=h('input',{class:'input',placeholder:'e.g. my running club, the office move',value:M.proj,maxlength:'80','aria-label':'Project or group',oninput:function(){M.proj=proj.value;save()}});
      var ta=h('textarea',{class:'textarea',placeholder:'To ... by ...','aria-label':'My objective',oninput:function(){M.text=ta.value;save()}});ta.value=M.text||'';
      var out=h('div'),hist=h('div'),aiOut=h('div');
      function seg(label,key,opts){var w=h('div',null,h('div',{class:'label'},label),h('div',{class:'oo-seg'}));
        opts.forEach(function(o){var b=h('button',{class:'chip'+(M[key]===o[0]?' on':''),onclick:function(){M[key]=(M[key]===o[0]?'':o[0]);save();Array.prototype.forEach.call(w.querySelectorAll('.chip'),function(c){c.classList.remove('on')});if(M[key])b.classList.add('on')}},o[1]);w.lastChild.appendChild(b)});return w}
      function test(){
        if(M.text.trim().length<5){ctx.toast('Write your objective first');return}
        var ev=evalObj(M.text,{sa:M.sa,sr:M.sr});M.last={ev:ev};
        M.hist=M.hist||[];M.hist.unshift({t:M.text.trim(),score:ev.score,ok:ev.ok});M.hist=M.hist.slice(0,6);
        if(!M.best||ev.score>=M.best.score)M.best={score:ev.score,ok:ev.ok,t:M.text.trim()};
        if(ev.ok&&!M.best.ok)M.best.ok=true;
        save();paint();drawTabs();maybeComplete();
      }
      function paint(){
        out.innerHTML='';
        if(M.last){var ev=M.last.ev;
          out.appendChild(h('div',{class:'card'},h('div',{class:'row between'},h('div',{class:'label'},'Test result'),h('div',{style:{fontWeight:500}},Math.round(ev.score*100)+'%')),h('div',{class:'bar',style:{margin:'8px 0 6px'}},h('i',{style:{width:Math.round(ev.score*100)+'%'}})),
            resultView(ev),
            h('div',{class:'oo-fb '+(ev.ok?'good':'bad'),style:{marginTop:'10px',marginBottom:0}},ev.ok?'This reads as a SMART objective. Now sanity-check Achievable and Realistic with someone who knows the situation - and test whether a stranger could say when it has been met.':'Not yet SMART. Work through the items marked "Fix" or "Check", edit your text above and test again.'),
            h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},'These are rule-of-thumb tests on your wording; they cannot understand your situation. Use them as prompts, not as the final judge.')));}
        hist.innerHTML='';
        if(M.hist&&M.hist.length>1){hist.appendChild(h('div',{class:'card flat'},h('div',{class:'label',style:{marginBottom:'6px'}},'My versions (latest first)'),M.hist.map(function(v){return h('div',{class:'sp-li',style:{display:'flex',gap:'8px',padding:'6px 0',borderBottom:'1px solid var(--line)',fontSize:'.9rem'}},h('span',{style:{flex:1}},v.t),h('span',{class:'oo-p '+(v.ok?'pass':'warn')},Math.round(v.score*100)+'%'))})))}
      }
      var bn=['v','w','a','d'],bph=['reduce / increase / provide ...','what exactly (e.g. delivery costs)','by how much (e.g. by 12 per cent)','by when (e.g. by 31 March)'];
      var binp=bn.map(function(k,i){var x=h('input',{class:'input',placeholder:bph[i],value:M.b[k]||'','aria-label':['Verb','What','How much','By when'][i],maxlength:'80',oninput:function(){M.b[k]=x.value;save()}});return x});
      var builder=h('details',{class:'card flat',style:{padding:'12px 16px'}},h('summary',{style:{cursor:'pointer',minHeight:'32px',fontWeight:500}},'Stuck? Build it from four parts'),
        h('p',{class:'muted',style:{fontSize:'.9rem',margin:'8px 0'}},'To  [verb]  [what]  [how much]  [by when]'),h('div',{class:'oo-b'},binp),
        h('button',{class:'btn sm primary',onclick:function(){var b=M.b;var parts=['To',b.v,b.w,b.a,b.d&&(/^(by|before|within|until)\b/i.test(b.d.trim())?b.d:'by '+b.d)].filter(function(x){return x&&String(x).trim()}).map(function(x){return String(x).trim()});
          if(parts.length<3){ctx.toast('Fill in at least the verb and what');return}ta.value=parts.join(' ').replace(/\s+/g,' ')+'.';M.text=ta.value;save();ctx.toast('Copied into the box - now test it')}},'Use this wording'));
      body.appendChild(h('div',{class:'card'},h('label',{class:'label'},'Project or group'),proj,h('div',{style:{height:'10px'}}),h('label',{class:'label'},'My objective'),ta,
        h('div',{style:{height:'10px'}}),
        seg('Self-check - Achievable: am I attempting too much?','sa',[['no','No, it is not too much'],['yes','Yes, probably too much']]),
        seg('Self-check - Realistic: do I have the resources?','sr',[['yes','Yes, I have them'],['no','No, not yet']]),
        h('div',{class:'row'},h('button',{class:'btn primary',onclick:test},'Test my objective'),
          h('button',{class:'btn ghost',onclick:function(){if(confirm('Clear my objective and versions?')){S.mine={text:'',sa:'',sr:'',proj:'',hist:[],b:{v:'',w:'',a:'',d:''}};S.ai={};save();draw();drawTabs()}}},'Reset'))));
      body.appendChild(builder);body.appendChild(out);body.appendChild(hist);
      if(ctx.ai.available()){
        var box=h('div',{class:S.ai.text?'ai-box':'hide',style:{marginTop:'10px'}},h('span',{class:'label'},'AI critique'),S.ai.text||'');
        var btn=h('button',{class:'btn ghost',onclick:function(){
          if(M.text.trim().length<5){ctx.toast('Write your objective first');return}
          var text='';box.className='ai-box';box.innerHTML='';box.appendChild(h('span',{class:'label'},'AI critique'));var tn=document.createTextNode('Thinking ...');box.appendChild(tn);btn.disabled=true;
          ctx.ai.ask({system:'You are a concise project management tutor. SMART means Specific, Measurable, Achievable, Realistic, Timed. Objectives are "whats" that start with an action verb, not "hows". Reply in plain text, max 110 words.',
            prompt:'Group/project: '+(M.proj||'unspecified')+'\nObjective: '+M.text.trim()+'\nFor each of S, M, A, R, T write one short line saying whether it is met and why. Then give one improved version of the objective.',maxTokens:240,temperature:0.4,onToken:function(t){text+=t;tn.nodeValue=text}})
          .then(function(r){S.ai.text=(r||text).trim();tn.nodeValue=S.ai.text;save()}).catch(function(){tn.nodeValue='The AI is not available right now - use the rule-based check above.'}).then(function(){btn.disabled=false})}},'Ask AI to critique it');
        body.appendChild(h('div',{style:{marginTop:'10px'}},btn,box));
      }
      paint();
    }
    draw();
  }});
})();

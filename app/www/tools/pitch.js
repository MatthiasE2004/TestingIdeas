/* Elevator Pitch Coach - Entrepreneurship Session 8 (3 Pitching your business; 3.1 What to cover in your pitch). */
(function(){
  var h=H.h;
  var WPM=140; // comfortable spoken pace: ~140 words/minute
  var CSS='.pt-tabs{display:flex;gap:6px;margin:0 0 14px;overflow-x:auto}'+
  '.pt-tab{flex:1 0 auto;border:0;border-radius:999px;padding:8px 14px;min-height:44px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}'+
  '.pt-tab.on{background:var(--ink);color:var(--bg)}'+
  '.pt-stats{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.pt-stats b{font-family:var(--mono);font-size:1.3rem}'+
  '.pt-sec{border-top:1px solid var(--line);padding:14px 0}.pt-sec:first-of-type{border-top:0}'+
  '.pt-n{display:inline-flex;width:26px;height:26px;border-radius:50%;background:var(--ink);color:var(--bg);align-items:center;justify-content:center;font-family:var(--mono);font-size:.78rem;margin-right:8px}'+
  '.pt-n.ok{background:var(--green)}'+
  '.pt-time{font-family:var(--mono);font-size:3.2rem;letter-spacing:.04em;text-align:center;margin:6px 0}'+
  '.pt-script{font-size:1.2rem;line-height:1.7;background:var(--surface2);border-radius:var(--r-md);padding:18px;max-height:340px;overflow:auto}'+
  '.pt-script span.l{font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);display:block;margin-top:10px}'+
  '.pt-chk{display:grid;grid-template-columns:30px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}'+
  '.pt-mark{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;border:1.5px solid var(--dot)}'+
  '.pt-mark.ok{background:var(--green);border-color:var(--green);color:#fff}.pt-mark.no{border-color:var(--red);color:var(--red)}'+
  '.pt-card{background:#0B0B0B;color:#fff;border-radius:var(--r-lg);padding:26px;background-image:radial-gradient(#2a2a2a 1.2px,transparent 1.4px);background-size:16px 16px}'+
  '.pt-card .label{color:#9a9a9a}.pt-card h2{color:#fff;font-size:1.55rem;line-height:1.25;margin:10px 0 18px}'+
  '.pt-card .row2{display:grid;grid-template-columns:130px 1fr;gap:6px 14px;padding:10px 0;border-top:1px dotted #444;color:#e6e6e6}'+
  '@media(max-width:560px){.pt-card .row2{grid-template-columns:1fr}.pt-time{font-size:2.4rem}}'+
  '.pt-card .row2 .label{padding-top:3px}.pt-card .meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px dotted #444;font-family:var(--mono);font-size:.8rem;color:#bbb}';

  var SECS=[
    {id:'problem',n:'The problem',lab:'Problem',budget:25,
      course:'Storytelling helps bring the problem, challenge or gap in customers\' lives alive. Stories are easier to relate to than technical details and, if they tap into emotion and empathy, are more memorable.',
      ask:'Can you think of one moment that shows the need, gap or want with passion?',
      ph:'Imagine you are ... and ... every day ...',
      ex:'Imagine you are 80, the bus route to your clinic was cut, and a taxi costs £28 each way. Thousands of rural residents now miss appointments.'},
    {id:'customer',n:'The opportunity: your customer',lab:'Customer',budget:20,
      course:'Zoom in on who your solution is aimed at. You will have more success focusing on the most likely customer segment. A segment is only valid if you know who they are, what they need, that there are enough of them and that you can reach them.',
      ask:'Who exactly, how many, and how can you reach them?',
      ph:'Our customers are ... who ... (about ... of them in ...)',
      ex:'Our customers are over-65s in rural Wales without a car - about 40,000 people - reachable through GP surgeries and parish councils.'},
    {id:'solution',n:'The solution',lab:'Solution',budget:25,
      course:'Make sure your audience can first relate to the impact of your solution and the difference it will make to their lives (or businesses). Borrowing from a brand people know can help: "a social enterprise version of Uber".',
      ask:'What do you do, and what changes for the customer?',
      ph:'We ... so that ...',
      ex:'We are a community-run version of Uber: volunteer drivers and shared minibuses, booked by phone, getting people to appointments for £3 a trip.'},
    {id:'value',n:'Vision and value proposition',lab:'Value',budget:20,
      course:'One or two sentences that describe in a nutshell the problem you solve and why it is worth solving for customers. They may be the hardest you write - imagine you are writing it for a Tweet.',
      ask:'Which one or two sentences would you want a stranger to remember?',
      ph:'We help ... to ... by ...',
      ex:'We give isolated people reliable, affordable rides, so nobody misses care because of how far they live.'},
    {id:'model',n:'Business model',lab:'Business model',budget:20,
      course:'Say how you propose to make money: how you will compete and the revenue streams you anticipate. Many businesses have streams beyond the obvious one (a salon sells shampoo as well as haircuts).',
      ask:'Who pays, how much, and for what?',
      ph:'We earn money by charging ... and also ...',
      ex:'We charge £3 a trip to riders, earn £12 per trip from the health trust contract, and sell local advertising on our vehicles.'},
    {id:'ask',n:'Planned investment: the ask',lab:'The ask',budget:20,
      course:'Say what funding you need - seed funding to get started or growth funding - and what it will be used for. Investors want to know how likely and how soon they get their money back, and in what form.',
      ask:'How much, for what, and what does the listener get or do next?',
      ph:'We are looking for £... to ... in return for ...',
      ex:'We are seeking £60,000 to buy two minibuses and launch in three counties; investors are repaid from contract income within four years.'}
  ];
  var GENERIC=/\b(everyone|everybody|anyone|all people|the whole world|the general public)\b/i;
  var HEDGE=/\b(hopefully|maybe|perhaps|i think|i guess|kind of|sort of|basically|um+|uh+|i'?m not sure|sorry|just a)\b/gi;
  var STORY=/\b(imagine|picture|when|last|every|each|yesterday|once|story|i |we |my |our |she |he |they |meet|day)\b/i;
  var DIFF=/\b(so that|so|instead|without|faster|cheaper|easier|saves?|no more|helps?|lets?|allows?|reduces?|means|unlike|rather than|version of|like)\b/i;
  var MONEY=/(£|\$|€|\d|charge|price|subscription|fee|commission|sell|revenue|pay|advert|licen[cs]e|margin|per )/i;
  var AMOUNT=/(£|\$|€)\s?\d|\b\d[\d,.]*\s?(k|m|thousand|million|pounds|dollars|euros)\b/i;
  var USE=/\b(to|fund|spend|build|hire|launch|stock|develop|buy|expand|scale|cover)\b/i;
  var RETURN=/\b(return|repaid?|equity|share|stake|interest|dividend|profit|exit|introduc\w*|intro|advice|mentor\w*|partner\w*|meeting|feedback|pre-?orders?|customers?|connect\w*)\b/i;

  function words(s){s=(s||'').trim();return s?s.split(/\s+/).length:0}
  function secs(w){return Math.round(w/WPM*60)}
  function mmss(t){t=Math.max(0,Math.round(t));return Math.floor(t/60)+':'+('0'+(t%60)).slice(-2)}
  function sentences(s){return (s||'').split(/[.!?]+/).map(function(x){return x.trim()}).filter(Boolean)}

  Tools.register('pitch',{title:'Elevator Pitch Coach',desc:'Build, time and check a 60-second pitch, then turn it into a pitch card.',
  mount:function(el,ctx){
    if(!document.getElementById('pt-css')){var st=document.createElement('style');st.id='pt-css';st.textContent=CSS;document.head.appendChild(st)}
    var S=Object.assign({tab:0,target:60,sec:{},runs:[],aiText:'',done:false,showEx:{}},ctx.load()||{});
    S.sec=S.sec||{};S.runs=S.runs||[];S.showEx=S.showEx||{};
    var timer=null,t0=0,elapsed=0,running=false,aiBusy=false,aiTokens='';
    function save(){ctx.save(S)}
    function txt(id){return (S.sec[id]||'').trim()}
    function totalWords(){return SECS.reduce(function(a,s){return a+words(S.sec[s.id])},0)}
    function script(){return SECS.map(function(s){return txt(s.id)}).filter(Boolean).join(' ')}
    function limitW(){return Math.round(WPM*S.target/60)}

    var CHECKS=[
      {k:'six',l:'All six parts are covered',w:'The course lists the problem, customer, solution, value proposition, business model and the investment ask.',
       t:function(){var m=SECS.filter(function(s){return words(S.sec[s.id])<6});return m.length?{ok:false,msg:'Still thin or missing: '+m.map(function(s){return s.lab}).join(', ')+'.'}:{ok:true}}},
      {k:'time',get l(){return 'Fits the time ('+S.target+' seconds)'},w:'An elevator pitch lasts no longer than 60 seconds.',
       t:function(){var w=totalWords(),s=secs(w);if(w<limitW()*0.4)return {ok:false,msg:'About '+s+'s - too thin. You have room for roughly '+(limitW()-w)+' more words.'};
         return s>S.target?{ok:false,msg:'About '+s+'s - cut around '+(w-limitW())+' words.'}:{ok:true}}},
      {k:'story',l:'The problem is told as a story',w:'Stories bring the problem alive and are more memorable than technical detail.',
       t:function(){var p=txt('problem');return words(p)>=10&&STORY.test(p+' ')?{ok:true}:{ok:false,msg:'Name a person and a moment: "Imagine you are ... when ...".'}}},
      {k:'cust',l:'A specific customer, not "everyone"',w:'You will have more success focusing on the most likely customer segment.',
       t:function(){var c=txt('customer');if(GENERIC.test(c))return {ok:false,msg:'Words like "everyone" suggest you have not chosen a segment. Who is the first customer?'};
         return words(c)>=8&&(/\d/.test(c)||words(c)>=12)?{ok:true}:{ok:false,msg:'Say who they are and how many - a number makes it believable.'}}},
      {k:'diff',l:'The solution shows the difference it makes',w:'The audience should relate to the impact on their lives first.',
       t:function(){var s=txt('solution');return words(s)>=8&&DIFF.test(s)?{ok:true}:{ok:false,msg:'Describe what changes for the customer ("so that...", "without...", "instead of...").'}}},
      {k:'tweet',l:'The value proposition is Tweet-sized',w:'One or two sentences you could write for a Tweet.',
       t:function(){var v=txt('value');if(!v)return {ok:false,msg:'Write your one-or-two-sentence value proposition.'};
         return words(v)<=40&&v.length<=280&&sentences(v).length<=2?{ok:true}:{ok:false,msg:'Too long ('+words(v)+' words). Cut it to one or two short sentences.'}}},
      {k:'money',l:'You say how you make money',w:'Investors and partners want to know how you propose to make money.',
       t:function(){var m=txt('model');return words(m)>=6&&MONEY.test(m)?{ok:true}:{ok:false,msg:'Name who pays and roughly how much.'}}},
      {k:'ask',l:'The ask is specific (amount and purpose)',w:'Say what funding you need and the planned use of funds.',
       t:function(){var a=txt('ask');if(!AMOUNT.test(a))return {ok:false,msg:'Give an amount, for example "£50,000".'};
         return USE.test(a)?{ok:true}:{ok:false,msg:'Say what the money will be used for.'}}},
      {k:'ret',l:'The listener knows what they get or what to do',w:'Investors want to know how soon they get their investment back and in what form; for other listeners, say what help you want.',
       t:function(){var a=txt('ask')+' '+txt('model');return RETURN.test(a)?{ok:true}:{ok:false,msg:'Add the return (repayment, a share) or the next step you want (an introduction, a meeting).'}}},
      {k:'hedge',l:'Confident, plain language',w:'Show passion and enthusiasm; prepare thoroughly so you can come across as you want.',
       t:function(){var m=script().match(HEDGE)||[];return m.length<=1?{ok:true}:{ok:false,msg:'Cut hedges: '+m.slice(0,4).join(', ')+'.'}}},
      {k:'short',l:'Short sentences you can say in one breath',w:'You are pitching out loud, not writing an essay.',
       t:function(){var ss=sentences(script());if(!ss.length)return {ok:false,msg:'Nothing written yet.'};var long=ss.filter(function(x){return words(x)>25});
         return long.length?{ok:false,msg:long.length+' sentence(s) run over 25 words. Split them.'}:{ok:true}}}
    ];
    function results(){return CHECKS.map(function(c){var r=c.t();return {c:c,ok:!!r.ok,msg:r.msg}})}
    function score(){var r=results();return r.filter(function(x){return x.ok}).length/r.length}

    function tabs(){return h('div',{class:'pt-tabs',role:'tablist'},['1 Write','2 Practise','3 Check','4 Pitch card'].map(function(n,i){
      return h('button',{class:'pt-tab'+(S.tab===i?' on':''),role:'tab','aria-selected':S.tab===i?'true':'false',onclick:function(){stop(true);S.tab=i;save();render()}},n)}))}

    function stats(live){
      var w=totalWords(),s=secs(w),over=s>S.target;
      var wEl=h('b',null,w),sEl=h('b',{class:over?'bad':''},'~'+s+'s'),bar=h('div',{class:'bar'+(over?' red':'')},h('i',{style:{width:Math.min(100,s/S.target*100)+'%'}})),note=h('div',{class:'tiny '+(over?'bad':'muted')},over?'About '+(w-limitW())+' words over':'Room for about '+Math.max(0,limitW()-w)+' more words');
      var box=h('div',{class:'card flat'},
        h('div',{class:'pt-stats'},h('div',null,h('div',{class:'label'},'Words'),wEl),h('div',null,h('div',{class:'label'},'Spoken time'),sEl),
          h('div',{style:{marginLeft:'auto'}},h('div',{class:'label'},'Target'),
            h('div',{class:'row',style:{gap:'6px'}},[30,60].map(function(t){return h('button',{class:'chip'+(S.target===t?' on':''),'aria-pressed':S.target===t?'true':'false',onclick:function(){S.target=t;save();render()}},t+'s')})))),
        bar,note);
      box.update=function(){var w=totalWords(),s=secs(w),over=s>S.target;wEl.textContent=w;sEl.textContent='~'+s+'s';sEl.className=over?'bad':'';
        bar.className='bar'+(over?' red':'');bar.firstChild.style.width=Math.min(100,s/S.target*100)+'%';note.className='tiny '+(over?'bad':'muted');
        note.textContent=over?'About '+(w-limitW())+' words over':'Room for about '+Math.max(0,limitW()-w)+' more words'};
      return box}

    /* ---- write ---- */
    function t0f(){
      var w=h('div',null),st=stats();w.appendChild(st);
      w.appendChild(h('div',{class:'callout note'},'The pitch is a narrative - so the solution comes after the problem and customer. Aim for about '+limitW()+' words in total, spoken at ~'+WPM+' words a minute. The purpose is to create a positive first impression, to inform, engage and be memorable.'));
      var card=h('div',{class:'card'});
      SECS.forEach(function(s,i){
        var cnt=h('span',{class:'tiny muted'}),ta=h('textarea',{class:'textarea',style:{minHeight:'84px'},placeholder:s.ph,value:S.sec[s.id]||'','aria-label':s.n});
        var num=h('span',{class:'pt-n'},i+1);
        function upd(){var n=words(ta.value);cnt.textContent=n+' words (aim ~'+s.budget+')';cnt.className='tiny '+(n>s.budget*1.8?'bad':'muted');num.className='pt-n'+(n>=6?' ok':'')}
        ta.addEventListener('input',function(){S.sec[s.id]=ta.value;save();upd();st.update()});upd();
        var ex=h('div',{class:'callout note',style:{marginTop:'8px'}},h('b',null,'Example: '),s.ex);
        card.appendChild(h('div',{class:'pt-sec'},
          h('div',{class:'row between'},h('div',{style:{display:'flex',alignItems:'center'}},num,h('b',null,s.n)),h('button',{class:'chip','aria-expanded':S.showEx[s.id]?'true':'false',onclick:function(){S.showEx[s.id]=!S.showEx[s.id];save();render()}},S.showEx[s.id]?'Hide example':'See an example')),
          h('p',{class:'tiny muted',style:{margin:'6px 0'}},s.course),
          h('p',{style:{margin:'0 0 6px'}},h('i',null,s.ask)),ta,cnt,S.showEx[s.id]?ex:null))});
      w.appendChild(card);
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',onclick:function(){if(confirm('Clear the whole pitch?')){S.sec={};S.runs=[];S.aiText='';S.done=false;save();render()}}},'Clear'),
        h('button',{class:'btn primary',disabled:totalWords()<10,onclick:function(){S.tab=1;save();render()}},'Next: practise')));
      return w}

    /* ---- practise ---- */
    function stop(silent){
      if(!running)return;running=false;clearInterval(timer);timer=null;
      elapsed=(Date.now()-t0)/1000;
      if(!silent&&elapsed>=3){S.runs.unshift({s:Math.round(elapsed),w:totalWords(),t:S.target});S.runs=S.runs.slice(0,6);save()}
    }
    function t1f(){
      var w=h('div',null),sc=script();
      w.appendChild(h('div',{class:'callout note'},'One good way to overcome nerves is to prepare thoroughly, know what you want to say and how you want to come across - and then practise. Say your pitch out loud against the clock.'));
      if(!sc){w.appendChild(h('div',{class:'card flat'},'Write something in step 1 first.'));w.appendChild(h('button',{class:'btn',onclick:function(){S.tab=0;save();render()}},'Back to writing'));return w}
      var sBox=h('div',{class:'pt-script',tabindex:'0',role:'region','aria-label':'Your pitch script'});
      SECS.forEach(function(s){if(txt(s.id)){sBox.appendChild(h('span',{class:'l'},s.lab));sBox.appendChild(document.createTextNode(txt(s.id)))}});
      var disp=h('div',{class:'pt-time',role:'timer','aria-live':'off'},'0:00'),bar=h('div',{class:'bar'},h('i',{style:{width:'0%'}})),res=h('div',null);
      var btn=h('button',{class:'btn primary',onclick:toggle},'Start');
      function paint(t){disp.textContent=mmss(t);var p=Math.min(100,t/S.target*100);bar.firstChild.style.width=p+'%';bar.className='bar'+(t>S.target?' red':'');disp.style.color=t>S.target?'var(--red)':''}
      function toggle(){
        if(!running){elapsed=0;res.innerHTML='';t0=Date.now();running=true;btn.textContent='Stop';btn.className='btn red';
          timer=setInterval(function(){if(!el.isConnected){clearInterval(timer);running=false;return}paint((Date.now()-t0)/1000)},200)}
        else{stop();btn.textContent='Start again';btn.className='btn primary';paint(elapsed);showRes()}}
      function showRes(){
        res.innerHTML='';var e=Math.round(elapsed),est=secs(totalWords());
        var msg=e>S.target?'You ran '+(e-S.target)+'s over. Cut words, or speak with fewer pauses - a pitch that overruns loses the listener.':
          e<S.target*0.6?'You finished well inside the time. You may have room to add the detail investors ask about, such as early successes or the team.':
          'Within the time. Now practise until it sounds natural, not memorised.';
        res.appendChild(h('div',{class:'callout '+(e>S.target?'':'tip'),style:{marginTop:'12px'}},h('b',null,e+'s spoken '),'(estimate was ~'+est+'s). '+msg))}
      w.appendChild(h('div',{class:'card'},disp,bar,h('div',{class:'row',style:{justifyContent:'center',marginTop:'12px'}},btn),res));
      w.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Your script'),sBox));
      if(S.runs.length)w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Your practice runs'),
        h('div',{style:{marginTop:'6px'}},S.runs.map(function(r,i){return h('div',{class:'row between',style:{padding:'4px 0'}},h('span',null,'Run '+(S.runs.length-i)),h('span',{class:r.s>r.t?'bad':'ok'},r.s+'s of '+r.t+'s'),h('span',{class:'tiny muted'},r.w+' words'))}))));
      w.appendChild(h('div',{class:'row between'},h('button',{class:'btn ghost',onclick:function(){S.tab=0;save();render()}},'Edit pitch'),h('button',{class:'btn primary',onclick:function(){S.tab=2;save();render()}},'Next: check')));
      return w}

    /* ---- check ---- */
    function t2f(){
      var w=h('div',null),rs=results(),pass=rs.filter(function(r){return r.ok}).length,pct=Math.round(pass/rs.length*100);
      w.appendChild(h('div',{class:'card flat'},h('div',{class:'row between'},h('span',{class:'label'},'Checklist score'),h('b',{style:{fontSize:'1.5rem'}},pass+' / '+rs.length)),
        h('div',{class:'bar'+(pct<50?' red':'')},h('i',{style:{width:pct+'%'}})),
        h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},pct>=90?'Strong pitch. Practise delivery - and the Q&A that follows.':pct>=60?'Good foundations. Fix the open items below.':'Early draft. Work through the open items one at a time.')));
      var list=h('div',{class:'card'});
      rs.forEach(function(r){list.appendChild(h('div',{class:'pt-chk'},h('div',{class:'pt-mark '+(r.ok?'ok':'no'),'aria-label':r.ok?'Pass':'Not yet'},r.ok?'✓':'!'),
        h('div',null,h('b',null,r.c.l),h('div',{class:'tiny muted'},r.c.w),r.ok?null:h('div',{class:'tiny bad',style:{marginTop:'4px'}},r.msg))))});
      w.appendChild(list);
      // AI feedback
      var out=h('div',null);
      function drawAi(){out.innerHTML='';
        if(aiBusy)out.appendChild(h('div',{class:'ai-box'},h('span',{class:'label'},'AI coach'),aiTokens||'Thinking...'));
        else if(S.aiText)out.appendChild(h('div',{class:'ai-box'},h('span',{class:'label'},'AI coach'),S.aiText))}
      if(ctx.ai.available()){
        var ab=h('button',{class:'btn primary',disabled:totalWords()<15,onclick:function(){
          aiBusy=true;aiTokens='';drawAi();ab.disabled=true;
          ctx.ai.feedback({question:'Give feedback on this elevator pitch for a new business. It should last under 60 seconds.',answer:script(),
            points:['Tells a vivid story of the problem','Names a specific target customer','Explains the difference the solution makes','States a clear, short value proposition','Says how the business makes money','Makes a specific ask with amount and purpose'],
            context:'Words: '+totalWords()+', about '+secs(totalWords())+' seconds spoken.',onToken:function(t){aiTokens=t;drawAi()}})
          .then(function(r){aiBusy=false;S.aiText=r.text+(r.source==='rules'?'':'');save();ab.disabled=false;drawAi()})
          .catch(function(){aiBusy=false;ab.disabled=false;S.aiText='The AI coach could not respond. Use the checklist above.';drawAi()})}},'Ask AI coach for feedback');
        w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Optional'),h('p',{class:'tiny muted',style:{margin:'6px 0 10px'}},'The on-device AI reads your whole pitch against the six course points. It is a second opinion; the checklist above is the main guide.'),ab));
        drawAi();w.appendChild(out)}
      w.appendChild(h('div',{class:'row between',style:{marginTop:'12px'}},h('button',{class:'btn ghost',onclick:function(){S.tab=0;save();render()}},'Edit pitch'),h('button',{class:'btn primary',onclick:function(){S.tab=3;save();render()}},'Next: pitch card')));
      return w}

    /* ---- card ---- */
    function plain(){
      var lines=['ELEVATOR PITCH',''];
      SECS.forEach(function(s){if(txt(s.id))lines.push(s.lab.toUpperCase()+': '+txt(s.id))});
      lines.push('','~'+totalWords()+' words, about '+secs(totalWords())+' seconds spoken');return lines.join('\n')}
    function copy(){
      var t=plain();
      function fallback(){var ta=h('textarea',{style:{position:'fixed',opacity:0}},t);document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ctx.toast('Pitch copied')}catch(e){ctx.toast('Select and copy manually')}ta.remove()}
      try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){ctx.toast('Pitch copied')},fallback);else fallback()}catch(e){fallback()}}
    function t3f(){
      var w=h('div',null),filled=SECS.filter(function(s){return words(S.sec[s.id])>=3});
      if(filled.length<3){w.appendChild(h('div',{class:'card flat'},'Fill in at least three parts of your pitch to see the card.'));w.appendChild(h('button',{class:'btn',onclick:function(){S.tab=0;save();render()}},'Back to writing'));return w}
      var sc=Math.round(score()*100);
      var c=h('div',{class:'pt-card'},h('span',{class:'label'},'Elevator pitch'),
        h('h2',null,txt('value')||txt('solution')||filled[0].lab));
      SECS.forEach(function(s){if(txt(s.id)&&s.id!=='value')c.appendChild(h('div',{class:'row2'},h('span',{class:'label'},s.lab),h('span',null,txt(s.id))))});
      c.appendChild(h('div',{class:'meta'},h('span',null,totalWords()+' words'),h('span',null,'~'+secs(totalWords())+'s spoken'),h('span',null,'checklist '+sc+'%'),S.runs.length?h('span',null,'best run '+Math.min.apply(null,S.runs.map(function(r){return r.s}))+'s'):null));
      w.appendChild(c);
      w.appendChild(h('div',{class:'row',style:{margin:'14px 0'}},h('button',{class:'btn primary',onclick:copy},'Copy as text'),h('button',{class:'btn',onclick:function(){S.tab=0;save();render()}},'Edit'),h('button',{class:'btn ghost',onclick:function(){S.tab=1;save();render()}},'Practise again')));
      w.appendChild(h('div',{class:'callout tip'},'Next steps: say it to a real person, then ask what they remember. If they cannot remember what you do or what you want, they cannot refer you to anyone else.'));
      if(!S.done&&filled.length===SECS.length){S.done=true;save();ctx.complete(score())}
      return w}

    function render(){
      el.style.minHeight=el.offsetHeight+'px';
      el.innerHTML='';
      el.appendChild(h('div',{class:'tool'},tabs(),[t0f,t1f,t2f,t3f][S.tab]()));
      el.style.minHeight='';
    }
    render();
  }});
})();

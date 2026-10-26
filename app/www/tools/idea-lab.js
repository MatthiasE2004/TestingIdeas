/* Idea Lab - Entrepreneurship Sessions 1-2: where good ideas come from, design thinking, framing, discovery skills.
   Flow: 1 Define the problem -> 2 Reframe ("How might we...?") -> 3 Prompt cards & idea notes -> 4 Dot-vote and score. */
(function(){
  var h=H.h;
  var CSS='.il-steps{display:flex;gap:6px;margin:0 0 14px;overflow-x:auto}'+
  '.il-step{flex:1 0 auto;border:0;border-radius:999px;padding:8px 14px;min-height:44px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}'+
  '.il-step.on{background:var(--ink);color:var(--bg)}.il-step.done:not(.on){color:var(--ink)}'+
  '.il-prompt{background:#0B0B0B;color:#fff;border-radius:var(--r-lg);padding:20px;min-height:150px;background-image:radial-gradient(#333 1.2px,transparent 1.4px);background-size:16px 16px}'+
  '.il-prompt .label{color:#9a9a9a}.il-prompt h3{color:#fff;font-size:1.3rem;margin:.3em 0}.il-prompt p{color:#ddd;margin:0}'+
  '.il-note{display:flex;gap:10px;align-items:flex-start;background:var(--surface2);border-radius:var(--r-md);padding:10px 14px;margin:0 0 8px}'+
  '.il-note>div{flex:1;min-width:0;overflow-wrap:anywhere}.il-note .x{border:0;background:transparent;color:var(--ink3);cursor:pointer;min-width:44px;min-height:44px;font-size:1.2rem}'+
  '.il-dotrow{display:flex;align-items:center;gap:4px;flex-wrap:wrap}.il-dot{width:14px;height:14px;border-radius:50%;background:var(--red);display:inline-block}.il-dot.off{background:transparent;border:1.5px solid var(--dot)}'+
  '.il-round{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--line);background:var(--surface);cursor:pointer;font-size:1.3rem;line-height:1}.il-round[disabled]{opacity:.3}'+
  '.il-slider{display:grid;grid-template-columns:minmax(90px,130px) 1fr 28px;gap:10px;align-items:center;min-height:44px}.il-slider input{width:100%;accent-color:var(--ink);min-height:44px}'+
  '.il-slider b{font-family:var(--mono);text-align:right}'+
  '.il-rank{display:grid;grid-template-columns:28px 1fr 56px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}.il-rank .bar{margin-top:6px}'+
  '.il-hmw{border-left:3px solid var(--line);padding-left:12px}.il-hmw.pick{border-color:var(--red)}'+
  '.il-chips{display:flex;gap:8px;flex-wrap:wrap}';

  var SCAMPER=[
    {g:'SCAMPER-style',t:'Substitute',q:'What could you swap - a material, a person, a place, a step - in the way this problem is handled today?'},
    {g:'SCAMPER-style',t:'Combine',q:'What could you join together - two products, services or groups - to solve this in one go?'},
    {g:'SCAMPER-style',t:'Adapt',q:'What solution from a different setting could you borrow? Dyson took an industrial extraction fan into the home.'},
    {g:'SCAMPER-style',t:'Modify / magnify / minify',q:'What if the solution were much bigger, smaller, faster, slower or more frequent?'},
    {g:'SCAMPER-style',t:'Put to another use',q:'What already exists that could be used for this problem - or who else has this problem and could use it?'},
    {g:'SCAMPER-style',t:'Eliminate',q:'What could you take away? What is the simplest version that still solves the problem?'},
    {g:'SCAMPER-style',t:'Reverse / rearrange',q:'What if you reversed the order of steps, or swapped who does what (customer does it, supplier pays)?'},
    {g:'Ideas all around us (4.1)',t:'Simplify',q:'Could you simplify what is there?'},
    {g:'Ideas all around us (4.1)',t:'Add',q:'What could you add to what is there?'},
    {g:'Ideas all around us (4.1)',t:'Emphasise different attributes',q:'Which attribute matters most to people with this problem - and what if you made that the headline?'},
    {g:'Ideas all around us (4.1)',t:'Bring it together',q:'Could you make available in one place something customers currently have to seek in many different places?'},
    {g:'Discovery skills (3.2)',t:'Observing',q:'Actively notice: where do people struggle, wait or work around this problem? What would you see if you watched for an hour?'},
    {g:'Discovery skills (3.2)',t:'Questioning',q:'Ask relevant questions: who has this problem, when, how often, what do they do now?'},
    {g:'Discovery skills (3.2)',t:'Curiosity',q:'Ask why, how, where, when it happens as it does. Keep asking "why?" three times.'},
    {g:'Discovery skills (3.2)',t:'Connectivity',q:'What objects, people, data or ideas could you link together to see what results?'},
    {g:'Discovery skills (3.2)',t:'Associating',q:'Make a connection between one thing and another: what other need or problem is like this one, and how was it solved?'}
  ];
  var FRAMES=[
    {t:'Zoom in',q:'Narrow it to one person, one moment.',ex:'How might we help a night-shift nurse find a healthy meal at 3am?'},
    {t:'Zoom out',q:'What bigger need sits behind it?',ex:'How might we make every working day feel less rushed?'},
    {t:'Flip it',q:'State it from the other side.',ex:'How might we make queues something people want to be in?'},
    {t:'Change who',q:'Swap the user for someone different.',ex:'How might we help students rather than commuters?'}
  ];
  var PROVOKE=['What if it had to be free for the customer?','What if your customer were eight years old?','What if it had to work with no internet or electricity?','What if you had to deliver it within 10 minutes?','What if a competitor gave it away - how would you still make money?','What if the customers did the work themselves?','What if you had to solve it for a tenth of the cost?','What if it were a subscription instead of a one-off purchase?','What if you had to do it with no staff?','What if your best customer designed it for you?','What if it only existed for one day a year?','What if the problem was seen as a feature, not a bug?','What if a charity or a school ran it?','What if you sold the opposite?'];
  var STEPS=['1 Problem','2 Reframe','3 Ideas','4 Filter'];

  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
  function uid(){return 'i'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36)}
  function total(i){return i.s[0]+i.s[1]+i.s[2]+i.s[3]}
  function words(s){return (s||'').trim()?(s.trim().split(/\s+/).length):0}

  Tools.register('idea-lab',{title:'Idea Lab',desc:'Frame a problem, generate ideas with prompt cards, then filter them systematically.',
  mount:function(el,ctx){
    if(!document.getElementById('il-css')){var st=document.createElement('style');st.id='il-css';st.textContent=CSS;document.head.appendChild(st)}
    var S=ctx.load()||{};
    S=Object.assign({step:0,problem:'',who:'',real:'',frames:['','',''],pick:-1,ideas:[],order:null,ci:0,angles:[],active:null,crit:'Significant to me',chosen:null,reflect:'',done:false},S);
    if(!S.order||S.order.length!==SCAMPER.length)S.order=shuffle(SCAMPER.map(function(_,i){return i}));
    var thinking=false, aiNote='';
    function save(){ctx.save(S)}
    function go(n){S.step=n;save();render()}
    function setDone(){ if(!S.done&&S.chosen&&S.ideas.length>=5){S.done=true;save();ctx.complete(Math.min(1,S.ideas.length/8))} }
    function dots(n,max){var w=h('span',{class:'il-dotrow','aria-label':n+' of '+max+' dots'});for(var i=0;i<max;i++)w.appendChild(h('i',{class:'il-dot'+(i<n?'':' off')}));return w}
    function slider(label,val,on){
      var out=h('b',null,val),inp=h('input',{type:'range',min:1,max:5,step:1,value:val,'aria-label':label});
      inp.addEventListener('input',function(){out.textContent=inp.value;on(+inp.value)});
      return h('div',{class:'il-slider'},h('span',{class:'tiny'},label),inp,out)}
    function usedDots(){return S.ideas.reduce(function(a,i){return a+(i.dots||0)},0)}

    function stepper(){
      return h('div',{class:'il-steps',role:'tablist'},STEPS.map(function(n,i){
        return h('button',{class:'il-step'+(S.step===i?' on':'')+(i<S.step?' done':''),role:'tab','aria-selected':S.step===i?'true':'false',onclick:function(){go(i)}},n)}))}
    function nav(back,nextLabel,nextOk,nextFn){
      return h('div',{class:'row between',style:{marginTop:'14px'}},
        back!=null?h('button',{class:'btn ghost',onclick:function(){go(back)}},'Back'):h('span'),
        nextLabel?h('button',{class:'btn primary',disabled:!nextOk,onclick:nextFn},nextLabel):null)}

    /* ---- step 1 ---- */
    function s1(){
      var ta=h('textarea',{class:'textarea',placeholder:'e.g. People waste time queueing for coffee before lectures...',value:S.problem,'aria-label':'The problem'});
      ta.addEventListener('input',function(){S.problem=ta.value;save();nb.disabled=words(S.problem)<4});
      var who=h('input',{class:'input',placeholder:'e.g. students with a 10am lecture',value:S.who,'aria-label':'Who has it'});
      who.addEventListener('input',function(){S.who=who.value;save()});
      var real=h('textarea',{class:'textarea',style:{minHeight:'80px'},placeholder:'Why does it happen? What is the problem underneath the problem?',value:S.real,'aria-label':'Underlying problem'});
      real.addEventListener('input',function(){S.real=real.value;save()});
      var nb=h('button',{class:'btn primary',disabled:words(S.problem)<4,onclick:function(){go(1)}},'Next: reframe');
      return h('div',null,
        h('div',{class:'card flat'},h('span',{class:'label'},'Discover and define'),
          h('p',{style:{marginTop:'6px'}},'Ideas come from thinking about something other people really want or need. Thinking like a designer starts by defining clearly what the ',h('b',null,'real nature of the underlying problem'),' is - only then does it make sense to move on to possible solutions (Session 1, 5.2).')),
        h('div',{class:'col'},
          h('label',{class:'label'},'A problem or irritation you know about (or something to create for fun)'),ta,
          h('label',{class:'label'},'Who has this problem?'),who,
          h('label',{class:'label'},'What is the real, underlying problem?'),real),
        h('div',{class:'row between',style:{marginTop:'14px'}},h('button',{class:'btn ghost',onclick:function(){if(confirm('Clear everything and start again?')){S={step:0,problem:'',who:'',real:'',frames:['','',''],pick:-1,ideas:[],order:shuffle(SCAMPER.map(function(_,i){return i})),ci:0,angles:[],active:null,crit:'Significant to me',chosen:null,reflect:'',done:false};save();render()}}},'Reset'),nb))}

    /* ---- step 2 ---- */
    function checkHmw(t){
      t=(t||'').trim(); if(!t)return null; var low=t.toLowerCase();
      if(!/^how might we\b/.test(low))return {ok:false,msg:'Start with "How might we..." - it keeps the question open and optimistic.'};
      if(words(t)<7)return {ok:false,msg:'Too short - say for whom and what change you want.'};
      if(/ (by|using|with an?|via) (an? )?(app|website|platform|website|robot|ai)\b/.test(low))return {ok:false,msg:'This already contains a solution (an app, a website...). Reframe around the need instead.'};
      if(!/\?\s*$/.test(t))return {ok:true,msg:'Good. Add a question mark to finish it.'};
      return {ok:true,msg:'A clear open question.'}}
    function s2(){
      var wrap=h('div',null);
      wrap.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'What if...?'),
        h('p',{style:{marginTop:'6px'}},'Framing is describing the problem in different ways and trying potential solutions in different ways - it often starts with the question "what if...?". Turn your problem into several ',h('b',null,'How might we...?'),' questions, then choose the frame that best captures the value you want to create, and for whom.'),
        S.problem?h('div',{class:'callout note',style:{margin:0}},h('b',null,'Your problem: '),S.problem):null));
      wrap.appendChild(h('div',{class:'il-chips',style:{marginBottom:'12px'}},FRAMES.map(function(f){
        return h('button',{class:'chip',title:f.q,onclick:function(){var k=S.frames.findIndex(function(x){return !x.trim()});if(k<0){S.frames.push('');k=S.frames.length-1}
            S.frames[k]=f.ex.replace(/\.$/,'?').replace(/\?\?$/,'?');save();render()}},f.t+': '+f.q)})));
      wrap.appendChild(h('p',{class:'tiny muted'},'Tap a chip to insert an example in the next empty slot, then rewrite it for your problem.'));
      S.frames.forEach(function(f,i){
        var fb=h('div',{class:'tiny'}),ta=h('textarea',{class:'textarea',style:{minHeight:'64px'},placeholder:'How might we ...?',value:f,'aria-label':'Reframe '+(i+1)});
        function upd(){var c=checkHmw(ta.value);fb.className='tiny '+(c?(c.ok?'ok':'bad'):'');fb.textContent=c?c.msg:''}
        ta.addEventListener('input',function(){S.frames[i]=ta.value;save();upd()});upd();
        wrap.appendChild(h('div',{class:'il-hmw card'+(S.pick===i?' pick':''),style:{borderLeft:'3px solid '+(S.pick===i?'var(--red)':'var(--line)'),borderRadius:'var(--r-md)'}},
          h('div',{class:'row between'},h('span',{class:'label'},'Frame '+(i+1)),
            h('button',{class:'chip'+(S.pick===i?' red':''),'aria-pressed':S.pick===i?'true':'false',onclick:function(){S.pick=S.pick===i?-1:i;save();render()}},S.pick===i?'Chosen frame':'Choose this frame')),
          ta,fb))});
      wrap.appendChild(h('button',{class:'btn ghost sm',onclick:function(){S.frames.push('');save();render()}},'+ Add another frame'));
      var chosenOk=S.pick>=0&&S.frames[S.pick]&&S.frames[S.pick].trim();
      wrap.appendChild(nav(0,'Next: generate ideas',chosenOk,function(){go(2)}));
      if(!chosenOk)wrap.appendChild(h('p',{class:'tiny muted',style:{textAlign:'right'}},'Write at least one frame and choose it to continue.'));
      return wrap}

    /* ---- step 3 ---- */
    function card(){
      var base=SCAMPER.map(function(_,i){return i});
      var c=SCAMPER[S.order[S.ci%S.order.length]]; return c}
    function s3(){
      var wrap=h('div',null), frame=S.frames[S.pick]||S.problem;
      var cur=S.active||card();
      wrap.appendChild(h('div',{class:'callout note'},h('b',null,'Your frame: '),frame));
      wrap.appendChild(h('div',{class:'il-prompt',role:'region','aria-label':'Prompt card'},
        h('span',{class:'label'},cur.g),h('h3',null,cur.t),h('p',null,cur.q)));
      wrap.appendChild(h('div',{class:'row',style:{margin:'10px 0'}},
        h('button',{class:'btn',onclick:function(){S.active=null;S.ci=(S.ci+1)%S.order.length;save();render()}},'Next card'),
        h('span',{class:'tiny muted'},'Card '+((S.ci%S.order.length)+1)+' of '+S.order.length)));
      var inp=h('textarea',{class:'textarea',style:{minHeight:'70px'},placeholder:'Write an idea in response. Do not filter or judge yet - it can be anything.','aria-label':'New idea'});
      function addIdea(){var t=inp.value.trim();if(!t)return;S.ideas.push({id:uid(),text:t,src:cur.t,s:[3,3,3,3],dots:0});inp.value='';save();render();var f=el.querySelector('textarea[aria-label="New idea"]');if(f)f.focus()}
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();addIdea()}});
      wrap.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Capture an idea'),inp,h('div',{class:'row',style:{marginTop:'8px'}},h('button',{class:'btn primary',onclick:addIdea},'Add idea note'))));
      // more angles
      var aiOk=ctx.ai.available();
      var box=h('div',{class:'card flat'},h('div',{class:'row between'},h('span',{class:'label'},'Stuck? More angles'),
        h('button',{class:'btn sm',disabled:thinking,onclick:moreAngles},thinking?'Thinking...':(aiOk?'Ask AI for 3 more angles':'3 random provocations'))));
      if(aiOk)box.appendChild(h('div',{class:'row',style:{marginTop:6}},h('button',{class:'btn ghost sm',onclick:function(){angles(randomProv())}},'Random provocations instead')));
      if(aiNote)box.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},aiNote));
      S.angles.forEach(function(a){box.appendChild(h('div',{class:'il-note',style:{marginTop:'8px'}},h('div',null,h('span',{class:'label'},a.g),h('div',null,a.q)),
        h('button',{class:'btn sm',onclick:function(){S.active={g:a.g,t:'Angle',q:a.q};save();render()}},'Use')))});
      wrap.appendChild(box);
      // notes
      var n=S.ideas.length;
      wrap.appendChild(h('div',{class:'row between',style:{margin:'14px 0 6px'}},h('span',{class:'label'},'Your idea notes ('+n+')'),
        h('span',{class:'tiny '+(n>=5?'ok':'muted')},n>=5?'Five or more - well done':'Aim for at least five')));
      wrap.appendChild(h('div',{class:'bar'},h('i',{style:{width:Math.min(100,n/5*100)+'%'}})));
      wrap.appendChild(h('div',{style:{marginTop:'10px'}},S.ideas.length?S.ideas.map(function(it){
        return h('div',{class:'il-note'},h('div',null,it.text,h('div',{class:'tiny muted'},'from: '+it.src)),
          h('button',{class:'x','aria-label':'Delete idea',onclick:function(){S.ideas=S.ideas.filter(function(x){return x!==it});save();render()}},'×'))}):h('p',{class:'muted'},'No ideas yet. Quantity first - quality comes when you filter.')));
      wrap.appendChild(nav(1,'Next: filter ideas',n>=2,function(){go(3)}));
      return wrap}
    function randomProv(){return shuffle(PROVOKE).slice(0,3).map(function(q){return {g:'Provocation',q:q}})}
    function angles(a){S.angles=a;aiNote='';save();render()}
    function moreAngles(){
      if(!ctx.ai.available()){angles(randomProv());return}
      thinking=true;aiNote='';render();
      var frame=S.frames[S.pick]||S.problem;
      var existing=S.ideas.slice(-4).map(function(i){return i.text}).join('; ');
      ctx.ai.ask({system:'You help people brainstorm business ideas. Reply with exactly 3 lines. Each line is one short, unusual "What if..." question that gives a new angle on the problem. No numbering, no explanations.',
        prompt:'Problem: '+S.problem+'\nFrame: '+frame+(existing?'\nIdeas so far: '+existing:'')+'\nThree new angles:',maxTokens:140,temperature:0.9})
      .then(function(t){
        var lines=String(t).split(/\n+/).map(function(l){return l.replace(/^[\s\-*\d.)]+/,'').trim()}).filter(function(l){return l.length>10}).slice(0,3);
        thinking=false;
        if(!lines.length){aiNote='The AI gave nothing usable - here are random provocations.';S.angles=randomProv()}
        else S.angles=lines.map(function(q){return {g:'AI angle',q:q}});
        save();render()
      }).catch(function(){thinking=false;aiNote='AI unavailable right now - random provocations instead.';S.angles=randomProv();save();render()})}

    /* ---- step 4 ---- */
    function s4(){
      var wrap=h('div',null);
      if(S.ideas.length<2){wrap.appendChild(h('div',{class:'card flat'},'Add at least two ideas first.'));wrap.appendChild(nav(2));return wrap}
      wrap.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Put the filters back - systematically'),
        h('p',{style:{marginTop:'6px'}},'Designers juggle three questions when they assess ideas (Brown and Martin, 2015): is it ',h('b',null,'suitable'),' (does it address the issue?), ',h('b',null,'feasible'),' (is it technically possible?) and ',h('b',null,'acceptable'),' (to all stakeholders?). Add one criterion of your own, such as fit with family, passion or lifestyle.')));
      var crit=h('input',{class:'input',value:S.crit,'aria-label':'Your own criterion'});
      crit.addEventListener('input',function(){S.crit=crit.value;save()});
      wrap.appendChild(h('div',{class:'col',style:{marginBottom:'12px'}},h('label',{class:'label'},'Your own criterion (4th)'),crit));
      // dot vote
      var left=5-usedDots();
      var dv=h('div',{class:'card'},h('div',{class:'row between'},h('span',{class:'label'},'Step A - dot-vote with your gut'),h('b',null,left+' of 5 dots left')),
        h('p',{class:'tiny muted'},'Before scoring, spend 5 dots on the ideas you like most (more than one on a favourite is fine).'));
      S.ideas.forEach(function(it){
        dv.appendChild(h('div',{class:'il-note'},h('div',null,it.text),
          h('div',{class:'row',style:{gap:'4px',flexWrap:'nowrap'}},
            h('button',{class:'il-round','aria-label':'Remove dot',disabled:!(it.dots>0),onclick:function(){it.dots--;save();render()}},'−'),
            h('b',{style:{minWidth:'18px',textAlign:'center'}},it.dots||0),
            h('button',{class:'il-round','aria-label':'Add dot',disabled:left<=0,onclick:function(){it.dots=(it.dots||0)+1;save();render()}},'+'))))});
      wrap.appendChild(dv);
      // scoring
      var sc=h('div',{class:'card'},h('span',{class:'label'},'Step B - score each idea 1 to 5 (5 = most)'));
      var names=['Suitable','Feasible','Acceptable',null];
      S.ideas.forEach(function(it){
        var tot=h('b',null,total(it)+'/20');
        var box=h('div',{class:'card flat',style:{marginTop:'10px'}},h('div',{class:'row between'},h('b',{style:{overflowWrap:'anywhere'}},it.text),tot));
        [0,1,2,3].forEach(function(k){
          box.appendChild(slider(names[k]||(S.crit||'Own criterion'),it.s[k],function(v){it.s[k]=v;tot.textContent=total(it)+'/20';save();updRank()}))});
        sc.appendChild(box)});
      wrap.appendChild(sc);
      var rank=h('div',{class:'card'});wrap.appendChild(rank);
      function updRank(){
        rank.innerHTML='';
        var r=S.ideas.slice().sort(function(a,b){return total(b)-total(a)||(b.dots||0)-(a.dots||0)});
        rank.appendChild(h('span',{class:'label'},'Step C - ranking'));
        r.forEach(function(it,i){
          rank.appendChild(h('div',{class:'il-rank'},h('b',null,i+1),
            h('div',null,h('div',{style:{overflowWrap:'anywhere'}},it.text,(it.dots?h('span',{class:'tiny muted'},'  · '+it.dots+(it.dots>1?' dots':' dot')):null)),h('div',{class:'bar'+(S.chosen===it.id?' red':'')},h('i',{style:{width:(total(it)/20*100)+'%'}}))),
            h('button',{class:'chip'+(S.chosen===it.id?' red':''),'aria-pressed':S.chosen===it.id?'true':'false',onclick:function(){S.chosen=it.id;save();setDone();render()}},S.chosen===it.id?'Taking forward':'Pick')))});
        var gut=S.ideas.slice().sort(function(a,b){return (b.dots||0)-(a.dots||0)})[0];
        var anyDots=gut&&gut.dots>0;
        if(anyDots&&r[0]){
          var same=gut===r[0]||total(gut)===total(r[0]);
          rank.appendChild(h('div',{class:'callout '+(same?'tip':''),style:{marginTop:'12px'}},same?'Your gut pick and your scores agree. That is a good sign - but is your gut hiding a favourite you are nudging the scores for?':
            'Your gut favourite ("'+gut.text.slice(0,50)+(gut.text.length>50?'...':'')+'") is not top on the scores. Which do you trust, and why? Look at the criterion where they differ.'))}
      }
      updRank();
      if(S.chosen){
        var it=S.ideas.filter(function(x){return x.id===S.chosen})[0];
        if(it){
          var rf=h('textarea',{class:'textarea',placeholder:'Did you want one idea to win and find yourself nudging the scores? What does that tell you about the filters you apply to ideas?',value:S.reflect,'aria-label':'Reflection'});
          rf.addEventListener('input',function(){S.reflect=rf.value;save()});
          wrap.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#9a9a9a'}},'Taking forward'),h('h3',{style:{color:'#fff',margin:'6px 0'}},it.text),
            h('p',{style:{color:'#ccc'}},'Frame: '+(S.frames[S.pick]||'-'))));
          wrap.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Reflect'),
            h('p',{class:'tiny muted'},'People often "fix" scores so their favourite wins, or feel disappointed afterwards. That shows how we filter out ideas that "will never work" - the point is to remove those filters first and put them back in systematically.'),rf));
        }
      }
      wrap.appendChild(nav(2));
      return wrap}

    function render(){
      el.style.minHeight=el.offsetHeight+'px';
      el.innerHTML='';
      var root=h('div',{class:'tool'},stepper(),[s1,s2,s3,s4][S.step]());
      el.appendChild(root);
      el.style.minHeight='';
    }
    render();
  }});
})();

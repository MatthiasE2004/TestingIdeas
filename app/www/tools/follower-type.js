/* follower-type: followership self-assessment + typology explorer + sorting exercise
   (Leadership course, Week 5). Models: Kelley (1988) five follower types, Chaleff (2009) support x challenge,
   Carsten et al. (2010) passive / active / proactive; plus Matshoba-Ramuedzisi et al. (2022) on direction,
   Benson et al. (2016) on how leaders interpret proactive behaviour, Kelley's follower-training topics,
   Kipnis and Schmidt (1983) upward influencing and the needs / engagement material of the week. */
(function(){
var h=H.h, KEY='follower-type';
var css=
'.ft-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}'+
'.ft-wrap{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}'+
'.ft-w .ft-wrap{grid-template-columns:minmax(320px,1fr) 1fr}.ft-w .ft-sticky{position:sticky;top:8px}'+
'.ft-item{padding:12px 0;border-top:1px dotted var(--line)}.ft-item:first-child{border-top:0}'+
'.ft-item p{margin:0 0 4px}.ft-item.un p{color:var(--ink2)}'+
'.ft-sl{display:grid;grid-template-columns:1fr 34px;gap:10px;align-items:center}'+
'.ft-sl input{width:100%;height:44px;accent-color:#0B0B0B;margin:0;cursor:pointer}'+
'.ft-item.un .ft-sl input{opacity:.45}'+
'.ft-sl b{font-family:var(--mono);text-align:center}'+
'.ft-ends{display:flex;justify-content:space-between;font-size:.7rem;color:var(--ink3);font-family:var(--mono);letter-spacing:.06em;text-transform:uppercase;margin-top:-6px}'+
'.ft-box{display:grid;grid-template-columns:22px 1fr;grid-template-rows:1fr 22px;gap:6px;max-width:440px;margin:0 auto}'+
'.ft-yl{writing-mode:vertical-rl;transform:rotate(180deg);display:flex;justify-content:space-between;align-items:center;text-align:center}'+
'.ft-xl{grid-column:2;display:flex;justify-content:space-between;align-items:center}'+
'.ft-grid{position:relative;aspect-ratio:1/1;width:100%;border:1.5px solid var(--ink);border-radius:var(--r-md);overflow:hidden;background:var(--surface2)}'+
'.ft-z{position:absolute;width:50%;height:50%;border:0;background:transparent;padding:8px 10px;text-align:left;display:flex;align-items:flex-start;font:inherit;color:inherit;cursor:pointer}'+
'.ft-z span{font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);line-height:1.25;pointer-events:none}'+
'.ft-z.tl{left:0;top:0}.ft-z.tr{left:50%;top:0;justify-content:flex-end;text-align:right}.ft-z.bl{left:0;top:50%;align-items:flex-end}.ft-z.br{left:50%;top:50%;justify-content:flex-end;align-items:flex-end;text-align:right}'+
'.ft-z.on{background:rgba(215,25,33,.07)}.ft-z.on span{color:var(--red);font-weight:600}'+
'.ft-mid{position:absolute;left:35%;top:35%;width:30%;height:30%;border-radius:50%;border:1.5px dashed var(--ink3);background:var(--surface);display:flex;align-items:center;justify-content:center;font:inherit;color:inherit;cursor:pointer;z-index:1}'+
'.ft-mid span{font-family:var(--mono);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);pointer-events:none;text-align:center}'+
'.ft-mid.on{border-color:var(--red)}.ft-mid.on span{color:var(--red);font-weight:600}'+
'.ft-vl{position:absolute;left:50%;top:0;bottom:0;border-left:1.5px dashed var(--ink3);pointer-events:none}.ft-hl{position:absolute;top:50%;left:0;right:0;border-top:1.5px dashed var(--ink3);pointer-events:none}'+
'.ft-dot{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.85rem;z-index:3;border:2px solid var(--surface);pointer-events:none;transition:left .5s,top .5s}'+
'.ft-dot.cur{background:var(--red);color:#fff}'+
'.ft-scale{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;position:relative;margin-top:6px}'+
'.ft-seg{border:1.5px solid var(--line);border-radius:var(--r-sm);padding:10px 8px;text-align:center;background:var(--surface);font:inherit;color:inherit;cursor:pointer;min-height:44px}'+
'.ft-seg.on{border-color:var(--red);border-width:2px;font-weight:600}'+
'.ft-pill{display:inline-block;border-radius:99px;padding:2px 12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;background:var(--surface2);border:1px solid var(--line)}'+
'.ft-pill.r{background:var(--red);color:#fff;border-color:var(--red)}.ft-pill.g{background:var(--green);color:#fff;border-color:var(--green)}'+
'.ft-dim{display:grid;grid-template-columns:150px 1fr 34px;gap:8px;align-items:center;font-size:.85rem;margin:6px 0}'+
'.ft-vig{border:1.5px solid var(--line);border-radius:var(--r-md);padding:14px;background:var(--surface)}'+
'.ft-vig.ok{border-color:var(--green)}.ft-vig.bad{border-color:var(--red)}'+
'.ft-ch{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.ft-ch .chip{min-height:44px}'+
'.ft-ch .chip.right{background:var(--green);color:#fff}.ft-ch .chip.wrong{background:var(--red);color:#fff}'+
'.ft-two{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:620px){.ft-two{grid-template-columns:1fr 1fr}}'+
'.ft-two>div{background:var(--surface2);border-radius:var(--r-sm);padding:12px;font-size:.9rem}'+
'.ft-two ul{margin:4px 0 0;padding-left:18px}'+
'@media(max-width:420px){.ft-dim{grid-template-columns:110px 1fr 30px}}';
if(!document.getElementById('ft-css')){var st=document.createElement('style');st.id='ft-css';st.textContent=css;document.head.appendChild(st)}

/* ---------- the models (course wording) ---------- */
var KEL={
 sheep:{n:'Sheep',z:'bl',d:'Passive and uncritical, lacking in initiative and a sense of responsibility. They perform the tasks given to them and stop.',
   dev:['Practise independent, critical thinking: before starting a task, ask what it is for and whether there is a better way.','Take one small piece of responsibility beyond your task list each week (self-management).','Align personal and organisational goals: find out how your work fits the bigger purpose.'],
   lead:['Meet the need for clarity and meaning: explain what the work is for, not just what to do.','Give them responsibility for a small element of the work and praise it.','Invite their view directly - and make it safe to give.']},
 yes:{n:'Yes people (conformist)',z:'br',d:'A livelier but equally unenterprising group. Dependent on a leader for inspiration, they can be aggressively deferential, even servile. Kelley later called them conformist followers.',
   dev:['Keep your energy, but form your own view first: think through the consequences before agreeing.','Practise "disagreeing agreeably" - raise one concern constructively, with a suggestion.','Build credibility by being right for your own reasons, not by agreeing.'],
   lead:['Ask them to argue the opposite case or spot the risks in your plan (intellectual stimulation).','Reward constructive challenge so agreement is not the safe option.','Remember Chaleff: a team that never challenges will not stop your mistakes.']},
 alien:{n:'Alienated followers',z:'tl',d:'Critical and independent in their thinking but passive in carrying out their role. Often cynical, they tend to sink gradually into disgruntled acquiescence, seldom openly opposing a leader\'s efforts.',
   dev:['Turn critique into contribution: present problems constructively rather than obstructively, with a proposed fix (Hartley).','Use upward influencing deliberately - reason (data) or coalition often works better than silence (Kipnis and Schmidt).','Rebuild commitment: choose one goal you genuinely support and put visible energy into it.'],
   lead:['Trust has often been broken - rebuild it through relationships and consistency (Gallup: trust, stability).','Give them voice: seek their views and show they make a difference (MacLeod and Clarke: employee voice).','Their critical thinking is an asset: put it to work on a real problem.']},
 surv:{n:'Survivors',z:'mid',d:'Perpetually sample the wind and live by the slogan "better safe than sorry". They are adept at surviving change.',
   dev:['Commit: pick an issue you care about and take a clear position on it.','Act responsibly towards the organisation, the leader, co-workers and yourself - not only towards your own safety.','Build credibility through consistency rather than waiting to see which way the wind blows.'],
   lead:['Provide stability and safety ("will it be ok if we do this?") so committing feels less risky.','Give hope: show how things will get better.','Be consistent with stated values (integrity) so people can predict you.']},
 eff:{n:'Effective followers',z:'tr',d:'Think for themselves and carry out their duties and assignments with energy and assertiveness.',
   dev:['Keep checking direction: is your proactivity helping the organisation achieve its objectives?','Work on timing: leaders read proactive behaviour differently depending on observers, task demands and the stage of the decision (Benson et al.).','Practise moving between follower and leader roles with ease - you are close to both.'],
   lead:['Partner with them: share decisions and the context behind them.','Develop them: let them lead elements of the work and coach them for future leadership.','Protect their energy - do not just give them more work.']}
};
var KORDER=['alien','eff','sheep','yes','surv'];
var CHA={
 resource:{n:'The resource',sc:'Low support / low challenge',z:'bl',d:'Does what\'s required but doesn\'t go beyond the minimum.',tip:'Find one thing in the team\'s goals you can support beyond the minimum, and one place where your view could help.'},
 individualist:{n:'The individualist',sc:'Low support / high challenge',z:'br',d:'Has low deference and isn\'t afraid to criticise.',tip:'Your challenge is valuable; pair it with visible support for the goals so the leader hears it as help, not opposition.'},
 implementer:{n:'The implementer',sc:'High support / low challenge',z:'tl',d:'Does what is needed with minimal oversight or explanation.',tip:'Chaleff warns that implementers are unlikely to challenge a leader who starts making mistakes. Practise raising concerns.'},
 partner:{n:'The partner',sc:'High support / high challenge',z:'tr',d:'Gives vigorous support but is also willing to question the leader.',tip:'Keep both: support and challenge. Watch timing and setting so your questions land well.'}
};
var CAR={
 passive:{n:'Passive',d:'Taking and following orders, and deferring to the leader\'s knowledge and expertise.'},
 active:{n:'Active',d:'Offering opinions when given the opportunity but remaining loyal and obedient regardless of whether they agree with the leader.'},
 proactive:{n:'Proactive',d:'Behaviours more aligned with partnership than with dominance and submission.'}
};

/* ---------- questionnaire ---------- */
/* dims: T independent critical thinking, E active engagement, S support, C challenge, D direction */
var Q=[
 {id:'q1',t:'Before I go along with my leader\'s ideas, I think through whether they will really work.',d:{T:1}},
 {id:'q2',t:'I give my honest view, even when it differs from the leader\'s or the group\'s.',d:{T:1,C:1}},
 {id:'q3',t:'I rely on my leader to tell me what to think about an issue.',d:{T:-1}},
 {id:'q4',t:'If I think something is wrong, I say so - whoever proposed it.',d:{T:1,C:1}},
 {id:'q5',t:'I take the initiative beyond what my role strictly requires.',d:{E:1}},
 {id:'q6',t:'Once I have done the task I was given, I stop.',d:{E:-1}},
 {id:'q7',t:'I put real energy and enthusiasm into the team\'s goals.',d:{E:1,S:1}},
 {id:'q8',t:'I hold back from committing until I see which way the wind is blowing.',d:{E:-1}},
 {id:'q9',t:'I actively help my leader succeed, even when nobody asks me to.',d:{S:1}},
 {id:'q10',t:'My leader can rely on me to get things done with minimal oversight.',d:{S:1}},
 {id:'q11',t:'I question my leader\'s decisions when I think they are wrong, even if it feels uncomfortable.',d:{C:1}},
 {id:'q12',t:'My efforts help the organisation achieve its objectives, not just my own aims.',d:{D:1}}
];
function scores(ans){var acc={T:[],E:[],S:[],C:[],D:[]};
  Q.forEach(function(q){var v=ans[q.id];if(v==null)return;var n=(v-1)/6*100;for(var k in q.d){acc[k].push(q.d[k]>0?n:100-n)}});
  var r={};for(var k in acc){var a=acc[k];r[k]=a.length?Math.round(a.reduce(function(x,y){return x+y},0)/a.length):50}return r}
function kelleyOf(r){if(Math.abs(r.T-50)<15&&Math.abs(r.E-50)<15)return 'surv';return r.T>=50?(r.E>=50?'eff':'alien'):(r.E>=50?'yes':'sheep')}
function chaleffOf(r){return r.S>=50?(r.C>=50?'partner':'implementer'):(r.C>=50?'individualist':'resource')}
function carstenOf(r){if(r.E>=60&&r.C>=55)return 'proactive';if(r.E<45&&r.C<50)return 'passive';return 'active'}

/* ---------- sorting vignettes ---------- */
var VIG=[
 {m:'kelley',t:'Sam completes every task on his list exactly as given, then waits for the next one. He rarely asks why and never suggests anything.',a:'sheep',w:'Passive and uncritical: Kelley\'s sheep "perform the tasks given to them and stop".'},
 {m:'kelley',t:'Lena is the most enthusiastic person in every meeting and agrees - loudly - with whatever the manager proposes. When the manager is away, she waits for instructions.',a:'yes',w:'Lively but unenterprising and dependent on the leader for inspiration: a yes person (conformist follower).'},
 {m:'kelley',t:'Marcus can explain exactly what is wrong with the new strategy and does so over coffee. In meetings he says nothing and does the minimum.',a:'alien',w:'Critical and independent in thinking but passive in the role, cynical, and seldom openly opposing the leader: alienated.'},
 {m:'kelley',t:'Ade never commits to a view until he knows which way senior management is leaning. He has come through four restructures unscathed.',a:'surv',w:'Survivors "perpetually sample the wind", live by "better safe than sorry" and are adept at surviving change.'},
 {m:'kelley',t:'Joy reads the project plan, spots a risk, raises it with her manager along with a possible fix, and then delivers her part with energy.',a:'eff',w:'She thinks for herself and carries out her assignments with energy and assertiveness: an effective follower.'},
 {m:'kelley',t:'Ravi used to propose ideas, but since one was rejected last year he goes along with decisions he privately thinks are poor, and quietly grumbles.',a:'alien',w:'Independent critical thinking with passive behaviour, sinking "gradually into disgruntled acquiescence" - alienated.'},
 {m:'chaleff',t:'Mia does exactly what is required, on time, but never more - and never comments on decisions either way.',a:'resource',w:'Low support and low challenge: the resource does what\'s required but doesn\'t go beyond the minimum.'},
 {m:'chaleff',t:'Tom regularly criticises his manager\'s decisions in team meetings, but does little to help put any of them into practice.',a:'individualist',w:'Low support, high challenge: the individualist has low deference and isn\'t afraid to criticise.'},
 {m:'chaleff',t:'Grace gets on with whatever is needed with minimal explanation and never questions a decision - even when the leader has clearly made a mistake.',a:'implementer',w:'High support, low challenge: the implementer. Chaleff\'s warning: if the leader makes mistakes, the implementer is unlikely to challenge them.'},
 {m:'chaleff',t:'Kofi throws himself behind the team\'s goals, and also tells his manager - privately and respectfully - when he thinks a plan will not work.',a:'partner',w:'High support and high challenge: the partner gives vigorous support but is also willing to question the leader.'},
 {m:'carsten',t:'In her role as a follower, Ana takes orders and defers to her manager\'s knowledge and expertise.',a:'passive',w:'Carsten et al. (2010): passive followers take and follow orders and defer to the leader\'s knowledge and expertise.'},
 {m:'carsten',t:'Ben offers his opinions when he is asked, but stays loyal and obedient whether or not he agrees with the final decision.',a:'active',w:'Active followers offer opinions when given the opportunity but remain loyal and obedient regardless of whether they agree.'},
 {m:'carsten',t:'Chloe sees her relationship with her manager as a partnership: she proposes ideas, shares responsibility for results and does not wait to be asked.',a:'proactive',w:'Proactive followers show behaviours aligned with partnership rather than dominance and submission.'},
 {m:'direction',t:'Dev is the most proactive person on the team: he launches initiatives, volunteers and challenges constantly - but his projects pull against the objectives the team agreed.',a:'notgood',w:'Matshoba-Ramuedzisi et al. (2022): whether a follower is good "depends on whether they assist the organisation in achieving its objectives". Dev is proactive "in the opposite direction to what the organisation requires".'},
 {m:'benson',t:'During a tense time-out in a cup final, Eva loudly challenges the coach\'s tactics in front of the whole bench.',a:'misread',w:'Benson et al. (2016): leaders interpret proactive behaviour differently depending on third-party observers, the momentary demands of the task and the stage of the decision. Same challenge, wrong moment.'}
];
var CHOICES={
 kelley:{q:'Which of Kelley\'s (1988) follower types?',o:[['sheep','Sheep'],['yes','Yes person'],['alien','Alienated'],['surv','Survivor'],['eff','Effective']]},
 chaleff:{q:'Which of Chaleff\'s (2009) four styles?',o:[['resource','Resource'],['individualist','Individualist'],['implementer','Implementer'],['partner','Partner']]},
 carsten:{q:'Which of Carsten et al.\'s (2010) categories?',o:[['passive','Passive'],['active','Active'],['proactive','Proactive']]},
 direction:{q:'Is Dev a good follower?',o:[['good','Yes - he is highly proactive'],['notgood','Not necessarily - it depends on direction']]},
 benson:{q:'How is the coach likely to read this?',o:[['valued','As valuable proactive followership'],['misread','Negatively - right idea, wrong time and place']]}
};

Tools.register('follower-type',{title:'What kind of follower are you?',desc:'Self-assess your followership, see where you sit on Kelley\'s, Chaleff\'s and Carsten\'s models, and sort real follower behaviours.',
mount:function(el,ctx){
  function freshProfile(n){return {label:'',ans:{},shown:false,ai:''}}
  function fresh(){return {tab:'self',profiles:[freshProfile()],cur:0,model:'kelley',zone:'eff',sort:{},sortDone:false,done:false}}
  var S=ctx.load(KEY); if(!S||!S.profiles)S=fresh();
  function save(){try{ctx.save(S,KEY)}catch(e){}}
  var root=h('div',{class:'tool'}); el.innerHTML=''; el.appendChild(root);
  function P(){return S.profiles[S.cur]}

  function tabs(){
    var rb=h('button',{class:'btn ghost sm',onclick:function(){ if(rb._c){S=fresh();save();render()}else{rb._c=true;rb.textContent='Tap again to reset';setTimeout(function(){rb._c=false;if(rb.isConnected)rb.textContent='Reset'},3000)} }},'Reset');
    var nSort=Object.keys(S.sort).length;
    return h('div',null,h('div',{class:'row between',style:{marginBottom:'8px'}},h('span',{class:'label'},'Followership explorer • Week 5'),rb),
      h('div',{class:'ft-tabs',role:'tablist'},[['self','1 Assess'],['explore','2 Models'],['sort','3 Sort'+(nSort?' '+nSort+'/'+VIG.length:'')]].map(function(t){
        return h('button',{class:'chip'+(S.tab===t[0]?' on':''),role:'tab','aria-selected':S.tab===t[0]?'true':'false',style:{minHeight:'44px'},onclick:function(){S.tab=t[0];save();render()}},t[1])})));
  }

  /* ----- grids ----- */
  function kelleyGrid(dots,sel,onZone){
    var g=h('div',{class:'ft-grid dots'});
    g.appendChild(h('div',{class:'ft-vl'}));g.appendChild(h('div',{class:'ft-hl'}));
    ['alien','eff','sheep','yes'].forEach(function(k){g.appendChild(h('button',{class:'ft-z '+KEL[k].z+(sel===k?' on':''),'aria-label':KEL[k].n,onclick:onZone?function(){onZone(k)}:null},h('span',null,KEL[k].n.replace(' (conformist)',''))))});
    g.appendChild(h('button',{class:'ft-mid'+(sel==='surv'?' on':''),'aria-label':'Survivors',onclick:onZone?function(){onZone('surv')}:null},h('span',null,'Survivors')));
    (dots||[]).forEach(function(d){g.appendChild(h('div',{class:'ft-dot'+(d.cur?' cur':''),style:{left:Math.max(5,Math.min(95,d.x))+'%',top:(100-Math.max(5,Math.min(95,d.y)))+'%'},title:d.t},d.n))});
    return h('div',{class:'ft-box'},h('div',{class:'ft-yl label'},h('span',null,'Dependent'),h('span',null,'Thinking'),h('span',null,'Independent')),g,h('div'),
      h('div',{class:'ft-xl label'},h('span',null,'Passive'),h('span',null,'Engagement'),h('span',null,'Active')));
  }
  function chaleffGrid(dots,sel,onZone){
    var g=h('div',{class:'ft-grid dots'});
    g.appendChild(h('div',{class:'ft-vl'}));g.appendChild(h('div',{class:'ft-hl'}));
    Object.keys(CHA).forEach(function(k){g.appendChild(h('button',{class:'ft-z '+CHA[k].z+(sel===k?' on':''),'aria-label':CHA[k].n,onclick:onZone?function(){onZone(k)}:null},h('span',null,CHA[k].n.replace('The ',''))))});
    (dots||[]).forEach(function(d){g.appendChild(h('div',{class:'ft-dot'+(d.cur?' cur':''),style:{left:Math.max(5,Math.min(95,d.x))+'%',top:(100-Math.max(5,Math.min(95,d.y)))+'%'}},d.n))});
    return h('div',{class:'ft-box'},h('div',{class:'ft-yl label'},h('span',null,'Low'),h('span',null,'Support'),h('span',null,'High')),g,h('div'),
      h('div',{class:'ft-xl label'},h('span',null,'Low'),h('span',null,'Challenge'),h('span',null,'High')));
  }
  function carstenScale(sel,onPick){return h('div',{class:'ft-scale'},['passive','active','proactive'].map(function(k){return h('button',{class:'ft-seg'+(sel===k?' on':''),onclick:onPick?function(){onPick(k)}:null},CAR[k].n)}))}

  /* ----- 1 self-assessment ----- */
  function self(){
    var p=P();
    var curChip=null;
    var profChips=h('div',{class:'row',style:{gap:'6px',marginBottom:'10px'}},S.profiles.map(function(pr,i){var c=h('button',{class:'chip'+(i===S.cur?' on':''),style:{minHeight:'44px'},onclick:function(){S.cur=i;save();render()}},(i+1)+'. '+(pr.label||'Relationship '+(i+1)));if(i===S.cur)curChip=c;return c}),
      S.profiles.length<3?h('button',{class:'chip',style:{minHeight:'44px'},onclick:function(){S.profiles.push(freshProfile());S.cur=S.profiles.length-1;save();render()}},'+ Another relationship'):null);
    var lab=h('input',{class:'input',placeholder:'e.g. my line manager at work; my club captain','aria-label':'Which leader-follower relationship are you thinking of?',oninput:function(){p.label=lab.value.slice(0,40);save();if(curChip)curChip.textContent=(S.cur+1)+'. '+(p.label||'Relationship '+(S.cur+1))}});lab.value=p.label||'';
    var n=Object.keys(p.ans).length;
    var bar=h('div',{class:'bar',style:{margin:'6px 0 4px'}},h('i',{style:{width:Math.round(n/Q.length*100)+'%'}}));
    var cnt=h('span',{class:'tiny muted'},n+' of '+Q.length+' answered');
    var qc=h('div',{class:'card flat'},h('span',{class:'label'},'Step 1 • Think of one leader you follow'),
      h('p',{style:{margin:'4px 0 8px'}},'Followership "is not a person but a role", and Carsten et al. found it depends on context. So answer for one specific relationship (as in Week 1, Activity 2). You can add up to three and compare.'),
      profChips,lab,h('div',{class:'label',style:{marginTop:'14px'}},'Step 2 • How true is each statement for you in this relationship?'),bar,cnt);
    var list=h('div',{style:{marginTop:'6px'}});
    var seeBtn=h('button',{class:'btn primary',disabled:n<Q.length,onclick:function(){p.shown=true;if(!S.done){S.done=true;try{ctx.complete()}catch(e){}}save();render();setTimeout(function(){var r=root.querySelector('.ft-result');if(r&&r.scrollIntoView)r.scrollIntoView({behavior:'smooth',block:'start'})},50)}},p.shown?'Update my result':'See where I sit');
    Q.forEach(function(q,i){var v=p.ans[q.id],valEl=h('b',null,v==null?'–':v);
      var row=h('div',{class:'ft-item'+(v==null?' un':'')});
      function setv(){var nv=+inp.value;p.ans[q.id]=nv;valEl.textContent=nv;row.classList.remove('un');save();
        var m=Object.keys(p.ans).length;cnt.textContent=m+' of '+Q.length+' answered';bar.firstChild.style.width=Math.round(m/Q.length*100)+'%';seeBtn.disabled=m<Q.length;if(p.shown)live()}
      var inp=h('input',{type:'range',min:'1',max:'7',step:'1',value:String(v==null?4:v),'aria-label':q.t,oninput:setv,onclick:function(){if(p.ans[q.id]==null)setv()}});
      row.appendChild(h('p',null,(i+1)+'. '+q.t));row.appendChild(h('div',{class:'ft-sl'},inp,valEl));row.appendChild(h('div',{class:'ft-ends'},h('span',null,'Not like me'),h('span',null,'Very like me')));
      list.appendChild(row)});
    qc.appendChild(list);qc.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},seeBtn,h('span',{class:'tiny muted'},'Untouched sliders count once you tap them.')));
    var res=h('div',{class:'ft-result'});
    function live(){res.innerHTML='';if(p.shown&&Object.keys(p.ans).length===Q.length)res.appendChild(result());else res.appendChild(preview())}
    live();
    root.appendChild(h('div',{class:'ft-wrap'},qc,res));
  }

  function preview(){
    var dots=[];S.profiles.forEach(function(pr,i){if(pr.shown&&Object.keys(pr.ans).length===Q.length){var s=scores(pr.ans);dots.push({n:i+1,x:s.E,y:s.T,cur:false})}});
    return h('div',{class:'card ft-sticky'},h('span',{class:'label'},'Where you will appear'),h('h3',{style:{margin:'2px 0 10px'}},'Three ways of looking at followers'),
      kelleyGrid(dots,null),
      h('ul',{style:{margin:'12px 0 0',paddingLeft:'18px',fontSize:'.92rem'}},
        h('li',null,h('b',null,'Kelley (1988): '),'five types - sheep, yes people, alienated, survivors and effective followers - placed here by independent critical thinking and active engagement.'),
        h('li',null,h('b',null,'Chaleff (2009): '),'how much you support and how much you challenge your leader - resource, individualist, implementer or partner.'),
        h('li',null,h('b',null,'Carsten et al. (2010): '),'passive, active or proactive followership.')),
      h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'Answer all 12 statements, then tap "See where I sit".'));
  }
  function result(){
    var p=P(),r=scores(p.ans),k=kelleyOf(r),c=chaleffOf(r),ca=carstenOf(r),K=KEL[k];
    var dots=[];S.profiles.forEach(function(pr,i){if(pr.shown&&Object.keys(pr.ans).length===Q.length){var s=scores(pr.ans);dots.push({n:i+1,x:s.E,y:s.T,cur:i===S.cur,t:pr.label})}});
    var cdots=[];S.profiles.forEach(function(pr,i){if(pr.shown&&Object.keys(pr.ans).length===Q.length){var s=scores(pr.ans);cdots.push({n:i+1,x:s.C,y:s.S,cur:i===S.cur})}});
    var box=h('div',{class:'ft-sticky'});
    box.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Kelley (1988) • closest type'+(p.label?' • '+p.label:'')),h('h3',{style:{margin:'2px 0 10px'}},K.n),
      kelleyGrid(dots,k),
      h('p',{style:{margin:'12px 0 6px'}},K.d),
      h('p',{class:'tiny muted',style:{margin:0}},'Your position: independent critical thinking '+r.T+'/100, active engagement '+r.E+'/100. '+(k==='surv'?'You sit near the middle on both - the survivor zone.':'')+(dots.length>1?' Numbered dots show your other relationships - does your followership change with the leader?':''))));
    var dims=h('div',null,[['T','Critical thinking'],['E','Engagement'],['S','Support'],['C','Challenge'],['D','Direction']].map(function(d){return h('div',{class:'ft-dim'},h('span',null,d[1]),h('div',{class:'bar'+(r[d[0]]<40?' red':'')},h('i',{style:{width:r[d[0]]+'%'}})),h('b',{class:'tiny'},r[d[0]]))}));
    box.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Chaleff (2009) • support x challenge'),h('h3',{style:{margin:'2px 0 10px'}},CHA[c].n+' ',h('span',{class:'ft-pill'},CHA[c].sc)),
      chaleffGrid(cdots,c),h('p',{style:{margin:'12px 0 0'}},CHA[c].d+' '+CHA[c].tip),
      h('div',{class:'label',style:{marginTop:'14px'}},'Carsten et al. (2010)'),carstenScale(ca),h('p',{class:'tiny',style:{margin:'8px 0 0'}},h('b',null,CAR[ca].n+': '),CAR[ca].d),
      h('div',{class:'label',style:{marginTop:'14px'}},'Your five dimensions'),dims,
      r.D<50?h('div',{class:'callout',style:{margin:'10px 0 0'}},h('b',null,'Direction check: '),'you scored low on contributing to the organisation\'s objectives. Matshoba-Ramuedzisi et al. (2022): a follower may be very proactive "but in the opposite direction to what the organisation requires".'):null));
    /* development */
    var dev=h('div',{class:'card'},h('span',{class:'label'},'Develop as a follower'),
      h('ol',{style:{margin:'6px 0 8px',paddingLeft:'20px'}},K.dev.map(function(t){return h('li',{style:{marginBottom:'4px'}},t)})),
      h('div',{class:'callout note',style:{margin:'0 0 10px'}},h('b',null,'Across all three models: '),'positive followership means energy and assertiveness, supporting but being willing to question, and seeing yourself as a partner rather than a subordinate. Many follower skills - courage, judgement, communication, initiative, diplomacy, influencing - are leadership skills too.'),
      h('p',{class:'tiny muted',style:{margin:0}},'This is a reflection aid, not a validated psychometric test. It turns your answers into positions on the course\'s models so you can discuss them (Activity 1).'));
    var aiOut=h('div');
    if(p.ai)aiOut.appendChild(h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},'AI development coach'),p.ai));
    if(ctx.ai.available()){
      var ab=h('button',{class:'btn primary',onclick:function(){ask(ab,aiOut,r,k,c,ca)}},p.ai?'Ask AI again':'Ask AI for a development plan');
      dev.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},ab));
    }
    dev.appendChild(aiOut);
    box.appendChild(dev);
    return box;
  }
  function ask(btn,out,r,k,c,ca){
    var p=P();btn.disabled=true;out.innerHTML='';
    var stream=document.createTextNode('Thinking...');
    out.appendChild(h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},'AI development coach'),stream));
    var sys='You are a concise leadership-course coach. Plain text only. No more than 110 words.';
    var pr='A learner assessed how they follow '+(p.label||'a leader')+'. Scores out of 100: independent critical thinking '+r.T+', active engagement '+r.E+', support '+r.S+', challenge '+r.C+', alignment with organisation goals '+r.D+'.\nClosest types: Kelley "'+KEL[k].n+'", Chaleff "'+CHA[c].n+'", Carsten "'+CAR[ca].n+'".\nWrite exactly 3 numbered, practical actions to become a more effective, partner-like follower in this relationship. Each action one sentence. Then one sentence on what their leader could do to help.';
    var fin=false,acc='';
    var tm=setTimeout(function(){if(fin)return;fin=true;stream.nodeValue='The AI took too long. Use the development tips above.';btn.disabled=false},60000);
    ctx.ai.ask({system:sys,prompt:pr,maxTokens:200,temperature:0.5,onToken:function(t){if(fin)return;acc+=t;stream.nodeValue=acc}}).then(function(t){if(fin)return;fin=true;clearTimeout(tm);
      t=String(t||acc||'').trim();btn.disabled=false;if(t.length<10){stream.nodeValue='No useful reply. Use the development tips above.';return}
      p.ai=t;save();stream.nodeValue=t;btn.textContent='Ask AI again'}).catch(function(){if(fin)return;fin=true;clearTimeout(tm);btn.disabled=false;stream.nodeValue='The AI is not available right now. The development tips above are based on the course.'});
  }

  /* ----- 2 explore ----- */
  function explore(){
    var m=S.model;
    var chips=h('div',{class:'row',style:{gap:'6px',marginBottom:'12px'}},[['kelley','Kelley (1988)'],['chaleff','Chaleff (2009)'],['carsten','Carsten et al. (2010)']].map(function(x){
      return h('button',{class:'chip'+(m===x[0]?' on':''),style:{minHeight:'44px'},onclick:function(){S.model=x[0];S.zone=x[0]==='kelley'?'eff':x[0]==='chaleff'?'partner':'proactive';save();render()}},x[1])}));
    var left=h('div',{class:'card ft-sticky'},h('span',{class:'label'},'Tap a type'),h('div',{style:{height:'8px'}}));
    var info=h('div',{class:'card'});
    function pick(z){S.zone=z;save();render()}
    if(m==='kelley'){
      if(!KEL[S.zone])S.zone='eff';
      left.appendChild(kelleyGrid(null,S.zone,pick));
      left.appendChild(h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},'Kelley\'s five types differ in how independently and critically they think, and how actively they engage. Survivors sit in the middle, sampling the wind.'));
      var K=KEL[S.zone];
      info.appendChild(h('span',{class:'label'},'Kelley (1988)'));info.appendChild(h('h3',{style:{margin:'2px 0 8px'}},K.n));info.appendChild(h('p',null,K.d));
      info.appendChild(h('div',{class:'ft-two'},h('div',null,h('b',null,'If this is you (follower)'),h('ul',null,K.dev.map(function(t){return h('li',null,t)}))),
        h('div',null,h('b',null,'If you lead someone like this'),h('ul',null,K.lead.map(function(t){return h('li',null,t)})))));
      info.appendChild(h('div',{class:'callout note',style:{margin:'12px 0 0'}},'"Followership is not a person but a role" - effective followers and effective leaders are often the same people playing different parts at different hours of the day.'));
    } else if(m==='chaleff'){
      if(!CHA[S.zone])S.zone='partner';
      left.appendChild(chaleffGrid(null,S.zone,pick));
      left.appendChild(h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},'Chaleff bases his typology on how much a follower supports the leader and how much they challenge them.'));
      var C=CHA[S.zone];
      info.appendChild(h('span',{class:'label'},'Chaleff (2009) • '+C.sc));info.appendChild(h('h3',{style:{margin:'2px 0 8px'}},C.n));info.appendChild(h('p',null,C.d));
      info.appendChild(h('div',{class:'callout tip',style:{margin:'0 0 12px'}},h('b',null,'Develop: '),C.tip));
      info.appendChild(h('div',{class:'callout'},h('b',null,'Which followers does the organisation need? '),'An implementer might seem the perfect follower, but if a leader starts making mistakes the implementer is unlikely to challenge them. Some contexts, such as a production line, benefit from passive followers who are happy to abide by the rules. A leader must think strategically about the mix.'));
    } else {
      if(!CAR[S.zone])S.zone='proactive';
      left.appendChild(carstenScale(S.zone,pick));
      left.appendChild(h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},'Carsten et al. took a follower-centred approach: they asked people about their own role as follower and grouped the answers into three categories.'));
      var R=CAR[S.zone];
      info.appendChild(h('span',{class:'label'},'Carsten et al. (2010)'));info.appendChild(h('h3',{style:{margin:'2px 0 8px'}},R.n));info.appendChild(h('p',null,R.d));
      info.appendChild(h('div',{class:'callout note',style:{margin:'0 0 12px'}},'"Followership holds a multiplicity of meaning for individuals occupying the role" (p. 21). Context matters: it depends on the leadership style and the working environment.'));
      info.appendChild(h('div',{class:'callout'},h('b',null,'Proactive - but with skill: '),'Benson et al. (2016) found leaders interpret proactive behaviour differently depending on third-party observers, the momentary demands of the task, the stage of the decision-making process, the suitability of the issue and relational dynamics.'));
    }
    var needs=h('div',{class:'card flat'},h('span',{class:'label'},'Whatever the type: what followers need'),
      h('div',{class:'ft-two',style:{marginTop:'8px'}},
        h('div',null,h('b',null,'Jackson and Parry (2011)'),h('ul',null,h('li',null,'Clarity - where are we going?'),h('li',null,'Meaning - what are we doing this for?'),h('li',null,'Safety - will it be ok if we do this?'))),
        h('div',null,h('b',null,'Gallup (Rath and Conchie, 2008)'),h('ul',null,h('li',null,'Trust'),h('li',null,'Compassion'),h('li',null,'Stability'),h('li',null,'Hope')))));
    root.appendChild(chips);root.appendChild(h('div',{class:'ft-wrap'},left,h('div',null,info,needs)));
  }

  /* ----- 3 sort ----- */
  function sortTab(){
    var right=0,n=0;VIG.forEach(function(v,i){var a=S.sort[i];if(a!=null){n++;if(a===v.a)right++}});
    if(S.si==null||S.si<0||S.si>VIG.length)S.si=0;
    var dotsRow=h('div',{class:'row',style:{gap:'4px',marginTop:'10px'}},VIG.map(function(v,i){var a=S.sort[i];
      return h('button',{'aria-label':'Card '+(i+1),onclick:function(){S.si=i;save();render()},style:{width:'22px',height:'22px',borderRadius:'50%',border:i===S.si?'2px solid var(--ink)':'1.5px solid var(--line)',padding:0,cursor:'pointer',
        background:a==null?'var(--surface)':(a===v.a?'var(--green)':'var(--red)')}})}));
    root.appendChild(h('div',{class:'card flat'},h('div',{class:'row between'},h('div',null,h('span',{class:'label'},'Sort the followers'),h('h3',{style:{margin:'2px 0 0'}},'Which type is each person?')),
      h('span',{class:'chip',style:{cursor:'default'}},right+' / '+n+' correct')),
      h('p',{style:{margin:'8px 0 0'}},'Fifteen short descriptions of people at work. Use the model named on each card; you get the course reasoning straight away.'),dotsRow));
    if(S.si<VIG.length){
      var i=S.si,v=VIG[i],a=S.sort[i],C=CHOICES[v.m];
      var card=h('div',{class:'ft-vig'+(a!=null?(a===v.a?' ok':' bad'):'')},
        h('div',{class:'row between'},h('span',{class:'label'},'Card '+(i+1)+' of '+VIG.length+' • '+C.q),a!=null?h('span',{class:'ft-pill '+(a===v.a?'g':'r')},a===v.a?'Correct':'Not quite'):null),
        h('p',{style:{margin:'8px 0 0',fontSize:'1.05rem'}},v.t),
        h('div',{class:'ft-ch'},C.o.map(function(o){var cls='chip';if(a!=null){if(o[0]===v.a)cls+=' right';else if(o[0]===a)cls+=' wrong'}
          return h('button',{class:cls,disabled:a!=null,onclick:function(){S.sort[i]=o[0];if(Object.keys(S.sort).length===VIG.length&&!S.sortDone){S.sortDone=true;var rr=0;VIG.forEach(function(x,j){if(S.sort[j]===x.a)rr++});try{ctx.complete(rr/VIG.length)}catch(e){}}save();render()}},o[1])})),
        a!=null?h('div',{class:'callout '+(a===v.a?'tip':''),style:{margin:'10px 0 0'}},a===v.a?null:h('b',null,'Answer: '+C.o.filter(function(o){return o[0]===v.a})[0][1]+'. '),v.w):null);
      var nextI=-1;for(var j=1;j<=VIG.length;j++){var q=(i+j)%VIG.length;if(S.sort[q]==null){nextI=q;break}}
      root.appendChild(card);
      root.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},
        i>0?h('button',{class:'btn ghost',onclick:function(){S.si=i-1;save();render()}},'Back'):null,
        a!=null?h('button',{class:'btn primary',onclick:function(){S.si=nextI>=0?nextI:VIG.length;save();render()}},nextI>=0?'Next card':'See result'):null));
    } else {
      var pct=Math.round(right/VIG.length*100),wrong=VIG.map(function(v,i){return i}).filter(function(i){return S.sort[i]!=null&&S.sort[i]!==VIG[i].a});
      root.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#8f8f8f'}},'Result'),h('div',{style:{fontFamily:'var(--mono)',fontSize:'2.2rem'}},right+' / '+VIG.length),
        h('p',{style:{margin:'8px 0 0'}},n<VIG.length?'Some cards are still open - tap a white dot above.':pct>=80?'You can tell the types apart reliably. Now use them on yourself and your team - and remember they are roles, not fixed labels.':pct>=55?'Good start. Review the cards below: the difference often lies in whether a person thinks critically AND acts on it.':'Revisit this week\'s typologies, then try the exercise again.'),
        h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn',onclick:function(){S.sort={};S.sortDone=false;S.si=0;save();render()}},'Try again'),
          h('button',{class:'btn ghost',style:{color:'#fff',borderColor:'#555'},onclick:function(){S.tab='self';save();render()}},'Assess yourself'))));
      if(wrong.length){var rc=h('div',{class:'card'},h('span',{class:'label'},'Review'));
        wrong.forEach(function(i){var v=VIG[i],C=CHOICES[v.m];rc.appendChild(h('div',{style:{borderTop:'1px dotted var(--line)',padding:'10px 0'}},h('div',{class:'tiny muted'},(i+1)+'. '+v.t),
          h('div',{style:{marginTop:'4px'}},h('b',null,C.o.filter(function(o){return o[0]===v.a})[0][1]+': '),v.w)))});root.appendChild(rc)}
    }
  }

  function fit(){if(!root.isConnected){window.removeEventListener('resize',fit);return}root.classList.toggle('ft-w',el.clientWidth>=820)}
  window.addEventListener('resize',fit);
  function render(){root.innerHTML='';fit();root.appendChild(tabs());if(S.cur>=S.profiles.length)S.cur=0;
    if(S.tab==='explore')explore();else if(S.tab==='sort')sortTab();else self()}
  render();
}});
})();

/* pm-sim: Project Management Simulator (capstone). Scenario: launch "Neighbourly", a community app, over 6 weekly rounds. */
(function(){
var h=H.h;
var KEY='pm-sim';
var METRICS=[{k:'s',n:'Schedule'},{k:'b',n:'Budget'},{k:'q',n:'Quality'},{k:'r',n:'Risk exposure',inv:true},{k:'m',n:'Team morale'},{k:'c',n:'Scope delivered'}];
var MN={}; METRICS.forEach(function(m){MN[m.k]=m});
var START={s:70,b:75,q:65,r:35,m:75,c:50};

var CONCEPTS={
 definition:['Project definition','A project is a temporary, unique endeavour with defined objectives, scope and deliverables. Clear definition is the baseline for everything else.'],
 stakeholders:['Stakeholders: the players','Stakeholders are people with an interest in or influence over the project. Their needs differ, so you must identify, understand and manage each of them.'],
 feasibility:['Feasibility','Before committing, test whether the project is technically, financially and organisationally feasible, and say so honestly when it is not.'],
 risk:['Risk management','Risks are uncertain events that can hurt the project. Identify them early, assess likelihood and impact, and act before they materialise.'],
 lifecycle:['Project life cycle','Projects move through phases (conception, planning, execution, handover/closure). Skipping or rushing a phase moves problems to later, when they cost more.'],
 planning:['PM task: estimating and planning','The PM collects what must be done, cost, time and interdependencies to produce a realistic plan and budget.'],
 team:['PM task: assembling a team','A team can make or break a project. The PM motivates people, manages conflict and keeps communication good.'],
 monitoring:['PM task: managing and coordinating work','Track progress against the plan and react early, while problems are still small.'],
 change:['PM task: managing change','Few projects end as planned. Use change control: note, estimate and approve changes formally instead of absorbing them silently.'],
 communicating:['PM task: reporting and liaising','The PM is the spokesperson of the project and must negotiate with and influence stakeholders. Bad news early beats bad news late.']
};

var ST=[
 {id:'sp',name:'Priya Nair',role:'Sponsor, Programme Director',ask:'"Neighbourly must be live before the council funding vote in week 7, and show a clear return."',pers:'Brisk, results-driven, hates surprises.',
  hidden:'Her own bonus depends on launching before the funding vote.',w:{s:.9,b:.3,q:.2,r:-.4,m:0,c:.3},pri:'deadline and return on investment',
  up:'That protects the launch date. Good.',dn:'This puts the launch date and my funding case at risk.',
  kw:[['deadline','launch','date','schedule','on time','week','vote','timeline'],['value','benefit','roi','return','impact','residents','funding'],['cost','budget','risk','plan','option']]},
 {id:'cl',name:'Marco Silva',role:'Client, Community Council',ask:'"The council was promised a full-featured app. I need to see our requirements delivered."',pers:'Warm but persistent; keeps adding wishes.',
  hidden:'Council members keep pressing him for extras; he fears looking like he got less than promised.',w:{s:.3,b:0,q:.4,r:-.1,m:0,c:.9},pri:'scope and features',
  up:'Good, that keeps what the council asked for.',dn:'The council will not be happy if we get less than we were promised.',
  kw:[['scope','feature','requirement','request','calendar','language','wish','functionality'],['priority','roadmap','phase','backlog','deliver','release'],['council','residents','promise','agreed','need']]},
 {id:'tl',name:'Sam Okafor',role:'Development team lead',ask:'"Keep the workload realistic. The team is already stretched."',pers:'Honest, protective of the team, tired of crunch time.',
  hidden:'Two team members have already threatened to quit after the last crunch.',w:{s:.2,b:0,q:.3,r:-.2,m:.9,c:-.2},pri:'a realistic workload',
  up:'The team will appreciate that. Thank you.',dn:'The team is stretched. This is not sustainable.',
  kw:[['workload','capacity','overtime','team','hours','realistic','estimate'],['support','help','rest','people','morale','sustainable'],['plan','priorit','week','schedule']]},
 {id:'fi',name:'Fiona Berg',role:'Finance partner',ask:'"Stay within budget. Anything above 10% overspend needs board approval."',pers:'Precise, sceptical, wants numbers not promises.',
  hidden:'She wants to avoid a board escalation at all costs; her team is being audited too.',w:{s:.1,b:.9,q:0,r:-.4,m:0,c:-.1},pri:'budget control',
  up:'The numbers look healthier. Thank you.',dn:'That will hurt the budget. I need to understand it.',
  kw:[['budget','cost','spend','£','pounds','saving','overrun','forecast','euro','%'],['contingency','variance','approve','approval','sign-off','figures','estimate','reserve'],['option','trade','reduce','cut','plan','alternative']]},
 {id:'rg',name:'Dr. Amara Hughes',role:'Data protection officer (regulator liaison)',ask:'"Nothing goes live without privacy and compliance checks."',pers:'Formal, careful, never bends rules.',
  hidden:'Her office is under audit; she cannot sign off anything without a privacy impact assessment.',w:{s:-.1,b:0,q:.5,r:-.8,m:0,c:0},pri:'compliance and low risk',
  up:'That reduces our compliance exposure. Better.',dn:'This increases risk. I cannot sign off on that.',
  kw:[['privacy','data','consent','assessment','dpia','gdpr','compliance','legal','personal'],['week','date','before','timeline','plan','deadline','schedule'],['review','sign-off','evidence','document','audit','check','risk','mitigat']]},
 {id:'ur',name:'Joy Mensah',role:"Residents' representative (user voice)",ask:'"It must be simple and usable by older and non-technical residents."',pers:'Direct and passionate; speaks for people who are not in the room.',
  hidden:'Many residents are older and non-technical; accessibility is her red line.',w:{s:.1,b:0,q:.8,r:-.2,m:0,c:.4},pri:'quality and usability',
  up:'Residents will actually benefit from this.',dn:'Real users are going to struggle with this.',
  kw:[['usable','accessib','older','resident','user','simple','readable','font','screen reader'],['test','testing','feedback','training','quality','pilot','listen'],['week','plan','fix','improve','session','help']]}
];
var SID={}; ST.forEach(function(s){SID[s.id]=s});

function D(t,tr,e,q,c,w,o){return {t:t,tr:tr,e:e,q:q,c:c,w:w,o:o||{}}}

var ROUNDS=[
 {phase:'Conception and planning',A:{title:'Kick-off: a wish list and a deadline',
  text:'Week 1. Priya wants Neighbourly live in 6 weeks, before the council funding vote. Marco arrives with a 20-feature wish list. Sam\'s team has not seen any of it yet, and there is no plan.',
  d:[D('Run a half-day planning workshop: agree objectives, split features into must / should / could, and estimate with the team.','Costs a few days now; gives you a plan everyone owns.',{s:-4,b:-2,q:6,r:-10,m:4,c:-2},'good','planning','Defining objectives and scope and estimating with the people who do the work is the foundation of a realistic plan and budget.',{}),
     D('Quickly check feasibility of the three riskiest features (maps, payments, ID check) before promising any dates.','Might deliver bad news to Priya and Marco.',{s:-3,b:-1,q:2,r:-9,m:1,c:-4},'good','feasibility','A feasibility check shows what is realistic in the time, budget and skills available before you commit, so risks surface early.',{sp:-2}),
     D('Start building the most visible features straight away to show progress.','Looks fast now, plans nothing.',{s:5,b:-1,q:-5,r:10,m:-2,c:8},'poor','lifecycle','Skipping conception and planning does not save time: it moves problems into execution where they are costlier to fix.',{}),
     D('Promise the whole wish list and make up the time with overtime.','Makes Marco happy today.',{s:-6,b:-3,q:-4,r:10,m:-14,c:14},'poor','planning','Committing to an unestimated scope and relying on overtime is a plan that depends on burning out the team.',{})]},
  B:{title:'Who is actually on the team?',
  text:'Week 1. Priya assumes five developers and a designer, full time. In reality only two are free; the others are shared with other projects and their line managers have agreed nothing. Nobody has mapped who needs to be kept informed.',
  d:[D('Negotiate named people and percentage of time with the line managers and Priya, and write it into the plan.','Takes political effort, avoids nasty surprises.',{s:-3,b:0,q:4,r:-10,m:4,c:0},'good','team','Team members are often borrowed from other work. The PM must negotiate availability up front and make it explicit in the plan.',{tl:4}),
     D('Map stakeholders by power and interest and agree a communication plan.','Doesn\'t fix capacity but builds relationships.',{s:-2,b:-1,q:2,r:-7,m:2,c:0},'good','stakeholders','Identifying the players and what each needs lets you plan how to inform, consult or involve them.',{rg:4,ur:4}),
     D('Hire two contractors to be on the safe side.','Fast cover, expensive.',{s:4,b:-14,q:0,r:-3,m:2,c:2},'ok','team','Extra capacity helps but contractors cost money and need onboarding. Budget impact should be a deliberate decision.',{fi:-4}),
     D('Assume it will work out and start.','No friction now.',{s:3,b:0,q:-3,r:14,m:-6,c:2},'poor','risk','Unmanaged assumptions about resources are classic risks. Hope is not a risk response.',{})]}},
 {phase:'Execution: managing change',w:{to:'cl',goal:'Tell Marco your decision, what it means for time and cost, and propose a way forward.',must:[['scope','change','request','feature','calendar','language','phase','backlog','priority'],['week','day','date','deadline','launch'],['cost','budget','trade','swap','instead','option','£']]},
  A:{title:'Scope creep: the events calendar',
  text:'Week 2. After a council meeting, Marco asks you to add a full neighbourhood events calendar with RSVPs. "Just a small thing," he says. Sam estimates two weeks of work.',
  d:[D('Say yes and absorb it in the current plan.','Marco is thrilled; everyone else pays.',{s:-12,b:-3,q:-6,r:10,m:-10,c:14},'poor','change','Absorbing change silently ("scope creep") eats schedule, quality and morale with no one having decided it.',{}),
     D('Raise a formal change request: estimate the impact and offer options (more time/budget, or swap out a lower-priority feature).','Slower answer, transparent trade-off.',{s:-2,b:-1,q:1,r:-3,m:0,c:5},'good','change','Change control means noting, estimating and approving changes formally, with the right stakeholders deciding the trade-off.',{}),
     D('Refuse: it was not in the original brief.','Protects the plan, damages the relationship.',{s:3,b:0,q:1,r:0,m:2,c:-4},'poor','stakeholders','Flat refusal ignores the client\'s real need and relationship; good PMs negotiate rather than just block.',{cl:-8}),
     D('Put it on a dated backlog for a phase 2 after launch.','Keeps launch safe, defers the wish.',{s:2,b:0,q:2,r:-3,m:2,c:-1},'ok','change','Deferring to a later release is a legitimate response to change, as long as it is agreed and visible.',{cl:-1})]},
  B:{title:'Scope creep: three languages',
  text:'Week 2. The council wants the app in three languages by launch. Marco says it is "mostly translation". Sam estimates 8 extra days plus a translation fee.',
  d:[D('Raise a change request with estimate and options (languages after launch, fewer languages, or extra time/budget).','Transparent trade-off.',{s:-2,b:-1,q:1,r:-3,m:0,c:5},'good','change','A formal change request makes the cost of "mostly translation" visible and lets the sponsor and client choose.',{}),
     D('Say yes; volunteers will translate and we skip extra testing.','Looks free; is not.',{s:-8,b:-1,q:-10,r:12,m:-6,c:12},'poor','risk','Untested content in multiple languages introduces new quality and compliance risks that you have not planned for.',{}),
     D('Offer English at launch and a second language in phase 2.','Compromise protecting the date.',{s:2,b:0,q:2,r:-3,m:2,c:0},'ok','change','Phasing the scope is a valid compromise; make sure the dates are agreed.',{cl:-2}),
     D('Say no because it was not in the original brief.','Clean, cold.',{s:3,b:0,q:1,r:0,m:2,c:-4},'poor','stakeholders','The client\'s need (reach the community) is real. Refusing without options damages trust.',{cl:-8})]}},
 {phase:'Execution: people and resources',
  A:{title:'Lena is ill',
  text:'Week 3. Lena, the only developer who understands sign-in and payments, is off sick for at least three weeks. Your schedule depends on her work.',
  d:[D('Re-plan: re-prioritise, cross-train a colleague on the critical module and push a non-critical feature back.','Some delay, but controlled.',{s:-6,b:-2,q:2,r:-8,m:2,c:-4},'good','monitoring','Monitoring and coordinating work means adjusting the plan quickly when a dependency breaks, keeping effects small.',{tl:4}),
     D('Ask everyone to work weekends to cover.','Looks heroic; costs the team.',{s:4,b:-2,q:-6,r:8,m:-16,c:0},'poor','team','A PM manages team motivation. Chronic overtime reduces quality and increases attrition risk.',{tl:-6}),
     D('Hire an expensive freelancer immediately.','Fast, but costs money and onboarding time.',{s:-2,b:-14,q:-1,r:-3,m:3,c:0},'ok','risk','Buying capacity is a valid risk response; weigh the cost and onboarding time.',{fi:-3}),
     D('Tell nobody and hope she returns early.','Avoids awkward conversations.',{s:0,b:0,q:-3,r:14,m:-3,c:0},'poor','communicating','Hiding bad news is a communication failure. Stakeholders hear later and trust drops.',{sp:-4})]},
  B:{title:'The designer is pulled away',
  text:'Week 3. The designer\'s line manager moves her to another project. Screens are half designed, and Joy has been waiting to test them.',
  d:[D('Run quick design sessions with residents; use ready-made UI components for the rest.','Residents help; some delay.',{s:-3,b:-1,q:6,r:-4,m:2,c:-3},'good','stakeholders','Involving users is both a quality measure and stakeholder management; they become part of the solution.',{ur:5}),
     D('Escalate to Priya to get the designer back.','May work, burns political capital.',{s:-1,b:0,q:2,r:-2,m:0,c:0},'ok','stakeholders','Using the sponsor\'s influence is a legitimate tool; use it sparingly and with facts.',{sp:-2}),
     D('Cut custom visuals and use plain templates only.','Fast and ugly.',{s:4,b:0,q:-8,r:3,m:-1,c:-3},'ok','planning','A trade-off between schedule and quality: ensure it is a conscious choice agreed with stakeholders.',{ur:-4}),
     D('Accept the change and ship rough screens.','Nobody objects, yet.',{s:5,b:0,q:-12,r:9,m:-4,c:0},'poor','risk','Unmanaged loss of a critical skill is a risk that has now materialised; ignoring it moves the cost to launch.',{ur:-6})]}},
 {phase:'Execution: budget control',w:{to:'fi',toB:'sp',goal:'Explain how you will handle it, which options you considered, and what you need from them.',must:[['budget','cost','spend','£','overrun','forecast','saving','%'],['option','trade','reduce','cut','plan','alternative','decision'],['week','date','by','approve','approval']]},
  A:{title:'Budget cut: 10% less',
  text:'Week 4. Fiona announces that every project budget is cut by 10% from next week. Spend to date is on plan.',
  d:[D('Cut testing and training to fit the new budget.','Fits the number, hits the product.',{s:2,b:10,q:-12,r:12,m:-2,c:0},'poor','risk','Cutting testing and training saves money now and creates large quality and compliance risks later.',{ur:-4,rg:-4}),
     D('Re-baseline: agree with Priya and Marco which low-value features to drop, and update the plan.','Less scope, but a coherent plan.',{s:0,b:10,q:2,r:-2,m:0,c:-8},'good','planning','When constraints change, re-plan: adjust scope against the triangle of time, cost and quality instead of cutting blindly.',{cl:-3}),
     D('Argue the cut should be deferred, backing it with risk data.','Might fail; builds your case.',{s:-1,b:3,q:0,r:-2,m:1,c:0},'ok','communicating','Negotiating with evidence is a core PM skill, but you still need a fallback plan.',{fi:-4}),
     D('Quietly trim the contingency reserve and hope.','The number balances on paper.',{s:0,b:8,q:-2,r:14,m:0,c:0},'poor','risk','Contingency exists to absorb risks; removing it makes every future problem a budget crisis.',{fi:-2})]},
  B:{title:'Hosting costs rise',
  text:'Week 4. A supplier raises hosting and SMS costs by 25%. You are about 8% over budget, and Priya does not know yet. Fiona will notice when the next report goes out.',
  d:[D('Tell Priya now with options: drop a feature, extend, or ask for funds.','Uncomfortable, honest, early.',{s:-1,b:3,q:0,r:-6,m:1,c:-3},'good','communicating','Early, honest reporting with options keeps sponsors able to decide and builds trust.',{sp:3,fi:3}),
     D('Absorb it by quietly dropping the contingency.','Nobody sees it, yet.',{s:0,b:6,q:-2,r:14,m:0,c:0},'poor','risk','Hidden budget problems are a risk to trust and to the project\'s ability to absorb future problems.',{fi:-4}),
     D('Switch to a cheaper supplier mid-project.','Saves money, adds migration risk.',{s:-8,b:10,q:-2,r:10,m:-3,c:0},'ok','feasibility','Changing technology mid-project has a cost: check feasibility and time before committing.',{}),
     D('Cut testing to pay for it.','Fixes the number only.',{s:2,b:10,q:-12,r:12,m:-2,c:0},'poor','risk','Cutting testing hides cost in quality and risk.',{ur:-4,rg:-4})]}},
 {phase:'Execution: risk and quality',w:{to:'rg',toB:'ur',goal:'Explain what you are going to do and ask for what you need (for example review, feedback, or a date).',must:[['privacy','data','consent','assessment','dpia','compliance','accessib','usab','user','resident','test'],['week','date','before','timeline','plan','deadline'],['review','sign-off','evidence','feedback','check','fix','improve','session']]},
  A:{title:'A privacy gap appears',
  text:'Week 5. Amara finds that the app stores location data without a privacy impact assessment. She says she cannot sign off, and launch could be blocked.',
  d:[D('Pause feature work for a week, do the assessment and limit the data collected.','Hurts the schedule, removes the problem.',{s:-8,b:-4,q:8,r:-18,m:-3,c:0},'good','risk','A risk that has materialised needs a response now: mitigate it (assessment, less data) rather than gamble on it.',{rg:4}),
     D('Ship anyway and fix after launch.','Keeps the date, bets the project.',{s:4,b:0,q:-6,r:20,m:0,c:0},'poor','risk','Accepting a compliance risk without sign-off can stop the project entirely. Risk acceptance must be a decision of the right stakeholders.',{rg:-12}),
     D('Remove the location feature.','Simple fix, but loses value.',{s:2,b:0,q:2,r:-12,m:-1,c:-8},'ok','feasibility','Reducing scope removes the risk but also the benefit; check what the client and users actually need.',{cl:-3,ur:-3}),
     D('Ask Amara for an informal early review of a draft assessment.','Collaborative, fast feedback.',{s:-3,b:-1,q:3,r:-12,m:0,c:0},'good','stakeholders','Involving a regulator early turns a gatekeeper into a partner and reduces surprises.',{rg:4})]},
  B:{title:'The pilot goes badly',
  text:'Week 5. In a pilot with 12 residents, half could not complete sign-up and the text was too small to read. Joy is furious that "nobody listened".',
  d:[D('Run a quick usability fix sprint using the residents\' feedback.','Costs a week; fixes the real issue.',{s:-6,b:-4,q:12,r:-6,m:-2,c:0},'good','monitoring','Testing is a monitoring tool. When it shows a quality gap, react to the evidence while change is still cheap.',{ur:5}),
     D('Treat it as a few edge cases and carry on.','Keeps the schedule.',{s:3,b:0,q:-8,r:10,m:0,c:0},'poor','stakeholders','Dismissing user feedback ignores a key stakeholder and a major risk to adoption.',{ur:-8}),
     D('Add training sessions and leaflets instead of fixing the app.','Helps a bit, not a fix.',{s:-2,b:-3,q:2,r:-3,m:0,c:0},'ok','risk','Workarounds treat symptoms. Compare them with fixing the cause.',{}),
     D('Postpone the launch by two weeks.','Safe, but misses the vote.',{s:-18,b:-3,q:12,r:-10,m:2,c:0},'ok','planning','A delay can be right, but weigh it against the sponsor\'s hard deadline; here a targeted fix is cheaper.',{sp:-6})]}},
 {phase:'Handover and closure',
  A:{title:'Go-live decision',
  text:'Week 6. Three bugs are still open: one critical, two minor. Priya wants to launch on the agreed date. Support for residents is not yet organised.',
  d:[D('Fix the critical bug, document the minor ones, and publish a go/no-go checklist and a support plan.','Controlled launch.',{s:-3,b:-2,q:6,r:-10,m:2,c:0},'good','lifecycle','A planned handover with a go/no-go checklist moves the project cleanly from execution to operation.',{}),
     D('Launch as planned regardless.','Date met, risk accepted.',{s:5,b:0,q:-8,r:14,m:-3,c:0},'poor','risk','Launching with a known critical bug transfers the risk to residents and your reputation.',{rg:-6,ur:-6}),
     D('Delay the launch two weeks to polish everything.','Safe but late.',{s:-16,b:-4,q:10,r:-8,m:0,c:0},'poor','planning','Perfectionism ignores the hard deadline; scope what must be fixed and what can wait.',{sp:-8}),
     D('Soft launch to one neighbourhood first, then roll out.','Learn safely, partial launch.',{s:-2,b:-1,q:5,r:-12,m:2,c:-2},'good','lifecycle','A phased rollout is a lifecycle approach that limits risk and gives feedback early.',{})]},
  B:{title:'Closing the project',
  text:'Week 6. The app is live and the sponsor is pleased. The team is already being pulled onto other work, and nobody wants to hold a review.',
  d:[D('Hold a short lessons-learned review, hand over documents and thank the team.','Costs a day, keeps knowledge.',{s:-2,b:-1,q:5,r:-8,m:8,c:0},'good','lifecycle','Closure is a life-cycle phase: formal handover and lessons learned reduce risk for the next project.',{}),
     D('Let the team go and move on.','Fast, forgetful.',{s:2,b:0,q:-4,r:8,m:-6,c:0},'poor','lifecycle','Without closure, knowledge is lost and the same mistakes recur.',{}),
     D('Write a short report only.','Better than nothing.',{s:0,b:0,q:1,r:-2,m:0,c:0},'ok','communicating','Reporting is part of liaising, but it misses the team\'s learning and morale.',{}),
     D('Add more features since you still have time.','Scope creep after delivery.',{s:-6,b:-4,q:-3,r:6,m:-6,c:6},'poor','change','Extra features after delivery without change control is scope creep again.',{})]}}
];
var INCIDENTS=[
 {t:'A key supplier had an outage',e:{s:-6,q:-3,b:-1,r:3}},
 {t:'A test environment was misconfigured and a week of test data was lost',e:{s:-4,q:-6,m:-2,r:3}},
 {t:'A team member had to leave early for family reasons',e:{s:-5,m:-6,r:2}},
 {t:'An unplanned security patch took two days',e:{s:-4,b:-3,q:2,r:-2}}
];

function clamp(v){return Math.max(0,Math.min(100,v))}
function R(seed,r,salt){var a=((seed|0)*7919+r*104729+salt*1299709)>>>0;for(var i=0;i<3;i++){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);a=(t^(t>>>14))>>>0}return a/4294967296}
function mood(v){return v>=75?'Delighted':v>=60?'Supportive':v>=45?'Uneasy':v>=30?'Frustrated':'Hostile'}

/* ---------- message scoring (rules) ---------- */
function ruleScore(text,st,task){
  var t=' '+text.toLowerCase()+' ', words=text.trim().split(/\s+/).filter(Boolean).length, tips=[];
  var cl=1; if(words>=30&&words<=130)cl+=1; else if(words>=15)cl+=.5; else tips.push('Write 3 to 6 sentences: too short to be clear.');
  if(words>130)tips.push('Aim for under about 120 words.');
  if(/propos|suggest|option|recommend|how about|i would|i will|let us|let\'s|we can|could we|i can/.test(t))cl+=1.5; else tips.push('Make a concrete proposal ("I propose...", "option A...").');
  if(/\d|week|friday|monday|tomorrow|today|deadline|by the end|date|£|%/.test(t))cl+=1; else tips.push('Add something concrete: a deadline, number or cost.');
  var em=1, g=0;
  if(/thank|appreciate|grateful/.test(t))g++;
  if(/understand|hear|concern|sorry|realis|recogni|see why|i know/.test(t))g++;
  if(/please|would you|could you|together|work with|happy to|ask you/.test(t))g++;
  em+=g+(/(hi|hello|dear)\s/.test(t)||t.indexOf(st.name.split(' ')[0].toLowerCase())>=0?0.5:0);
  var bad=(t.match(/no way|impossible|your fault|ridiculous|refuse|not my problem|whatever|you must|you have to|stupid/g)||[]).length; em-=Math.min(2,bad);
  if(g===0)tips.push('Acknowledge their view ("I understand your concern about...", "thank you for...").');
  if(bad)tips.push('Avoid blunt or blaming wording.');
  var nd=1, groups=(st.kw||[]).concat(task&&task.must||[]), hit=0;
  groups.forEach(function(gr){ if(gr.some(function(k){return t.indexOf(k)>=0}))hit++ });
  nd+=Math.min(4,hit*1.1);
  if(hit<2)tips.push('Speak to what '+st.name.split(' ')[0]+' cares about: '+st.pri+'.');
  function f(x){return Math.max(1,Math.min(5,Math.round(x)))}
  return {clarity:f(cl),empathy:f(em),needs:f(nd),tips:tips};
}
function fallbackReply(st,avg){
  var n=st.name.split(' ')[0];
  if(avg>=4)return n+': Thank you, that is clear and it speaks to my main concern ('+st.pri+'). Let us go with that.';
  if(avg>=3)return n+': I see where you are heading, but I need more on '+st.pri+' and exact dates before I can agree.';
  return n+': This does not address '+st.pri+' and I am not comfortable. Please come back with a concrete proposal and clear dates.';
}
function parseAI(t){
  var o={}; ['clarity','empathy','needs'].forEach(function(k){var m=new RegExp(k+'\\D{0,4}([1-5])','i').exec(t); if(m)o[k]=+m[1]});
  var reply=t.split(/SCORES/i)[0].trim().replace(/\s+/g,' ').slice(0,400);
  return {reply:reply,s:(o.clarity&&o.empathy&&o.needs)?o:null};
}

Tools.register('pm-sim',{title:'Project Management Simulator',desc:'Run a 6-week community app project with six stakeholders who each want different things.',
 mount:function(el,ctx){
  if(!document.getElementById('pmsim-css')){var st=document.createElement('style');st.id='pmsim-css';st.textContent=
  '.pmsim-grid6{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pmsim-grid-st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}'+
  '@media(max-width:560px){.pmsim-grid6,.pmsim-grid-st{grid-template-columns:repeat(2,1fr)}}'+
  '.pmsim-m{background:var(--surface2);border-radius:var(--r-sm);padding:8px 10px}.pmsim-m b{font-family:var(--mono);font-size:.95rem}'+
  '.pmsim-st{background:var(--surface2);border-radius:var(--r-md);padding:10px 12px;border:1.5px solid transparent;text-align:left;cursor:pointer;min-height:44px}.pmsim-st.sel{border-color:var(--ink)}'+
  '.pmsim-dec{display:block;width:100%;text-align:left;background:var(--surface2);border:1.5px solid transparent;border-radius:var(--r-md);padding:14px 16px;cursor:pointer;margin:0 0 10px;min-height:44px}.pmsim-dec:hover{border-color:var(--ink)}'+
  '.pmsim-d{display:inline-block;font-family:var(--mono);font-size:.74rem;border-radius:99px;padding:2px 9px;margin:2px 4px 2px 0;background:var(--surface2)}.pmsim-d.up{color:var(--green)}.pmsim-d.dn{color:var(--red)}'+
  '.pmsim-sc{font-family:var(--mono);font-size:3rem;line-height:1}.pmsim-line{border-top:1px dotted var(--dot);padding:8px 0}';
  document.head.appendChild(st)}

  var S=ctx.load(KEY);
  function fresh(seed){
    var sat={}; ST.forEach(function(s){sat[s.id]=60});
    return {v:1,phase:'intro',seed:seed||Math.floor(Math.random()*9000)+1000,round:0,m:Object.assign({},START),sat:sat,start:Object.assign({},sat),known:{},hist:[],checkin:false,checkins:0,sel:null,draft:'',cur:null,done:false};
  }
  if(!S||S.v!==1)S=fresh();
  function save(){try{ctx.save(S,KEY)}catch(e){}}
  function ev(){var rd=ROUNDS[S.round];return R(S.seed,S.round,1)<.5?{v:rd.A,k:'A'}:{v:rd.B,k:'B'}}
  function wTarget(rd,k){return rd.w?(k==='B'&&rd.w.toB?rd.w.toB:rd.w.to):null}
  function fmt(k,v){var up=v>0, good=MN[k].inv?!up:up; return h('span',{class:'pmsim-d '+(good?'up':'dn')},MN[k].n+' '+(up?'+':'−')+Math.abs(v))}

  var root=h('div',{class:'tool'}); el.innerHTML=''; el.appendChild(root);

  function dash(delta){
    return h('div',{class:'card flat'},
      h('div',{class:'row between',style:{marginBottom:'8px'}},h('span',{class:'label'},'Project dashboard')),
      h('div',{class:'pmsim-grid6'},METRICS.map(function(m){var v=S.m[m.k], bad=m.inv?v>60:v<40, d=delta&&delta[m.k];
        return h('div',{class:'pmsim-m'},h('div',{class:'row between',style:{gap:'4px'}},h('span',{class:'label'},m.n),h('b',{class:bad?'bad':''},Math.round(v)+(d?(d>0?' ↑':' ↓'):''))),
          h('div',{class:'bar'+(bad?' red':''),style:{marginTop:'6px'}},h('i',{style:{width:v+'%'}})))})))}

  function stakes(delta,interactive){
    var sel=S.sel&&SID[S.sel];
    var strip=h('div',{class:'pmsim-grid-st'},ST.map(function(s){var v=S.sat[s.id], d=delta&&delta[s.id];
      return h('button',{class:'pmsim-st'+(S.sel===s.id?' sel':''),'aria-label':s.name+' satisfaction '+v,onclick:function(){S.sel=S.sel===s.id?null:s.id;save();render()}},
        h('div',{style:{fontWeight:500,fontSize:'.92rem',lineHeight:1.2}},s.name),h('div',{class:'tiny muted',style:{minHeight:'2.4em'}},s.role),
        h('div',{class:'bar'+(v<35?' red':''),style:{margin:'6px 0 4px'}},h('i',{style:{width:v+'%'}})),
        h('div',{class:'row between tiny',style:{gap:'4px'}},h('span',{class:'muted'},mood(v)),h('b',{class:d>0?'ok':d<0?'bad':''},v+(d?(' ('+(d>0?'+':'')+d+')'):''))))}));
    var out=h('div',{class:'card flat'},h('div',{class:'label',style:{marginBottom:'8px'}},'Stakeholders (tap for details)'),strip);
    if(sel){
      var known=S.known[sel.id];
      out.appendChild(h('div',{class:'card',style:{margin:'10px 0 0'}},
        h('b',null,sel.name),h('span',{class:'muted tiny'},' '+sel.role),
        h('p',{style:{margin:'6px 0'}},sel.ask),h('p',{class:'tiny muted',style:{margin:'0 0 6px'}},'Personality: '+sel.pers),
        known?h('div',{class:'callout note'},h('b',null,'Hidden priority revealed: '),sel.hidden):h('p',{class:'tiny muted'},'There is something they have not told you yet.'),
        (interactive&&S.phase==='brief')?h('button',{class:'btn sm primary',disabled:S.checkin||known,onclick:function(){checkin(sel.id)}},S.checkin?'Check-in used this week':known?'Already known':'1:1 check-in (once per week)'):null));
    }
    return out;
  }
  function checkin(id){
    if(S.checkin)return; S.checkin=true; S.checkins++; S.known[id]=true; S.sat[id]=clamp(S.sat[id]+3); save(); render();
    H.toast(SID[id].name.split(' ')[0]+' shared what really matters. +3 satisfaction');
  }

  function header(){
    return h('div',{class:'row between',style:{marginBottom:'12px'}},
      h('div',null,h('span',{class:'label'},'Neighbourly launch • seed '+S.seed),h('h3',{style:{margin:'2px 0 0'}},S.phase==='debrief'?'Debrief':'Week '+(S.round+1)+' of 6 • '+ROUNDS[S.round].phase)),
      h('button',{class:'btn ghost sm',onclick:function(){ if(S._rc){S=fresh();save();render()}else{S._rc=true;this.textContent='Tap again to restart';var b=this;setTimeout(function(){S._rc=false;if(b.isConnected)b.textContent='Restart'},3000)} }},'Restart'));
  }

  function render(){
    root.innerHTML='';
    if(S.phase==='intro')return intro();
    root.appendChild(header());
    if(S.phase==='debrief')return debrief();
    var delta=S.phase==='result'&&S.cur?S.cur.eff:null, sd=S.phase==='result'&&S.cur?S.cur.sdelta:null;
    root.appendChild(dash(delta)); root.appendChild(stakes(sd,true));
    if(S.phase==='brief')brief(); else if(S.phase==='write')write(); else if(S.phase==='result')result();
  }

  function intro(){
    var seedIn=h('input',{class:'input',type:'number',value:S.seed,style:{maxWidth:'140px'},'aria-label':'Scenario seed'});
    root.appendChild(h('div',null,h('span',{class:'label'},'Capstone simulation'),h('h2',null,'Launch Neighbourly: you are the project manager'),
     h('p',null,'Neighbourly is a community app for residents to share services, events and local news. You have 6 weeks, a fixed budget and 6 stakeholders who each want something different. Every week brings an event and decisions with trade-offs; three times you must write to a stakeholder yourself.'),
     h('div',{class:'callout'},h('b',null,'How to play: '),'watch the dashboard (schedule, budget, quality, risk, morale, scope) and each stakeholder\'s satisfaction. Their hidden priorities are revealed through 1:1 check-ins (one per week) or at the end.'),
     h('div',{class:'grid g2',style:{marginBottom:'14px'}},ST.map(function(s){return h('div',{class:'card flat',style:{margin:0}},h('b',null,s.name),h('div',{class:'tiny muted'},s.role),h('div',{class:'tiny',style:{marginTop:'6px'}},s.ask))})),
     h('div',{class:'row'},h('span',{class:'label'},'Scenario seed'),seedIn,h('span',{class:'tiny muted'},'Same seed = same events. Change it to get a different story.')),
     h('div',{class:'row',style:{marginTop:'14px'}},h('button',{class:'btn primary',onclick:function(){var sd=parseInt(seedIn.value,10);S=fresh(isNaN(sd)?undefined:sd);S.phase='brief';save();render()}},'Start week 1'))));
  }

  function brief(){
    var rd=ROUNDS[S.round], e=ev();
    root.appendChild(h('div',{class:'card'},h('span',{class:'label'},'This week'),h('h3',null,e.v.title),h('p',null,e.v.text),
      rd.w?h('p',{class:'tiny muted'},'This week you will also write a short message to '+SID[wTarget(rd,e.k)].name+'.'):null,
      S.checkin?null:h('p',{class:'tiny muted'},'Tip: a 1:1 check-in (tap a stakeholder) reveals what they really need.')));
    var list=h('div',{class:'card'},h('span',{class:'label'},'Your decision'),h('div',{style:{height:'8px'}}));
    e.v.d.forEach(function(d,i){list.appendChild(h('button',{class:'pmsim-dec','data-i':i,onclick:function(){choose(i)}},h('div',{style:{fontWeight:500}},d.t),h('div',{class:'tiny muted',style:{marginTop:'4px'}},'Trade-off: '+d.tr)))});
    root.appendChild(list);
  }

  function choose(i){
    var rd=ROUNDS[S.round], e=ev(), d=e.v.d[i], eff={}, base=Object.assign({},d.e);
    var nz=Math.round((R(S.seed,S.round,10+i)-.5)*5);
    base.s=(base.s||0)+nz;
    METRICS.forEach(function(m){var dv=base[m.k]||0, nv=clamp(S.m[m.k]+dv); eff[m.k]=nv-S.m[m.k]; S.m[m.k]=nv});
    var sdelta={}, why={};
    ST.forEach(function(s){var x=0,best=0,bk=null;METRICS.forEach(function(m){var c=(s.w[m.k]||0)*eff[m.k];x+=c;if(Math.abs(c)>Math.abs(best)){best=c;bk=m.k}});
      x+=(d.o[s.id]||0); x=Math.round(x); sdelta[s.id]=x; why[s.id]=bk});
    ST.forEach(function(s){S.sat[s.id]=clamp(S.sat[s.id]+sdelta[s.id])});
    S.cur={r:S.round,k:e.k,title:e.v.title,i:i,t:d.t,q:d.q,c:d.c,w:d.w,eff:eff,sdelta:sdelta,why:why,msg:null,drift:[],incident:null};
    if(rd.w){S.phase='write';S.draft=''}else finishRound();
    save();render();
  }

  function finishRound(){
    var c=S.cur, drift=[];
    var rules=[['sp','s',function(v){return v<45},-5,'the schedule is slipping'],['cl','c',function(v){return v<40},-5,'too little scope is being delivered'],['tl','m',function(v){return v<40},-6,'team morale is low'],
      ['fi','b',function(v){return v<35},-6,'the budget is nearly exhausted'],['rg','r',function(v){return v>65},-5,'risk exposure is high'],['ur','q',function(v){return v<45},-5,'quality is too low']];
    rules.forEach(function(r){ if(r[2](S.m[r[1]])){S.sat[r[0]]=clamp(S.sat[r[0]]+r[3]);c.sdelta[r[0]]+=r[3];drift.push(SID[r[0]].name.split(' ')[0]+' is worried because '+r[4]+' ('+r[3]+')')}});
    if(S.round>=1&&S.round<=4){
      var p=Math.max(0,S.m.r-30)/100*1.4;
      if(R(S.seed,S.round,50)<p){var inc=INCIDENTS[Math.floor(R(S.seed,S.round,51)*INCIDENTS.length)]; c.incident={t:inc.t,e:{}};
        METRICS.forEach(function(m){var dv=inc.e[m.k]||0;if(dv){var nv=clamp(S.m[m.k]+dv);c.incident.e[m.k]=nv-S.m[m.k];S.m[m.k]=nv;c.eff[m.k]=(c.eff[m.k]||0)+c.incident.e[m.k]}})}}
    c.drift=drift; S.hist.push(c); S.phase='result';
  }

  function write(){
    var rd=ROUNDS[S.round], e=ev(), to=SID[wTarget(rd,e.k)], c=S.cur;
    var ta=h('textarea',{class:'textarea',placeholder:'Write your message to '+to.name.split(' ')[0]+'...',style:{minHeight:'150px'},'aria-label':'Your message',oninput:function(){S.draft=ta.value;save();btn.disabled=ta.value.trim().length<15}},'');
    ta.value=S.draft||'';
    var out=h('div',null);
    var btn=h('button',{class:'btn primary',onclick:function(){submit(ta.value,out,btn,skip)}},'Send message');
    var skip=h('button',{class:'btn ghost',onclick:function(){S.cur.msg={skipped:true,avg:1,text:'',reply:to.name.split(' ')[0]+': I heard nothing from you about this. That worries me.'};S.sat[to.id]=clamp(S.sat[to.id]-8);S.cur.sdelta[to.id]-=8;finishRound();save();render()}},'Skip (not recommended)');
    btn.disabled=ta.value.trim().length<15;
    root.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Communicating'),h('h3',null,'Write to '+to.name),
      h('p',null,rd.w.goal),h('div',{class:'callout note'},h('b',null,to.name.split(' ')[0]+' cares about: '),to.ask+' ('+to.pers+')'),
      h('p',{class:'tiny muted'},'Your decision: '+c.t),ta,h('div',{class:'row',style:{marginTop:'10px'}},btn,skip),out,
      h('p',{class:'tiny muted'},ctx.ai.available()?'The stakeholder will reply and rate your message (AI), combined with a checklist score.':'Your message is scored by a checklist: clarity, empathy, and whether it addresses their needs.')));
  }

  function submit(text,out,btn,skip){
    var rd=ROUNDS[S.round], e=ev(), to=SID[wTarget(rd,e.k)], c=S.cur; text=text.trim().slice(0,1500);
    var rs=ruleScore(text,to,rd.w); btn.disabled=true; skip.disabled=true;
    function done(ai,reply,src){
      var f=function(k){return ai&&ai[k]?Math.max(1,Math.min(5,Math.round((ai[k]+rs[k])/2))):rs[k]};
      var rt={clarity:f('clarity'),empathy:f('empathy'),needs:f('needs')}, avg=(rt.clarity+rt.empathy+rt.needs)/3;
      var dl=Math.round((avg-3)*4); S.sat[to.id]=clamp(S.sat[to.id]+dl); c.sdelta[to.id]+=dl;
      c.msg={text:text,ratings:rt,avg:avg,tips:rs.tips,reply:reply||fallbackReply(to,avg),src:src,dl:dl,to:to.id};
      finishRound();save();render();
    }
    if(ctx.ai.available()){
      out.innerHTML='';out.appendChild(h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},to.name+' is replying...'),'Thinking...'));
      var sys='You are '+to.name+', '+to.role+', in a community app project. You care most about: '+to.pri+'. Personality: '+to.pers+' Stay in character.';
      var pr='The project manager writes to you:\n"'+text.replace(/"/g,"'")+'"\n\nSituation: '+e.v.text+'\n\nWrite your reply in 2 or 3 sentences, in character.\nThen on a new line write exactly: SCORES clarity=N empathy=N needs=N\nN is a number from 1 to 5. clarity = was the message clear and specific. empathy = did it show understanding of you. needs = did it address what you care about.';
      var fin=false, to_=setTimeout(function(){if(!fin){fin=true;done(null,null,'rules')}},60000);
      ctx.ai.ask({system:sys,prompt:pr,maxTokens:170,temperature:0.5}).then(function(t){if(fin)return;fin=true;clearTimeout(to_);var p=parseAI(t||'');done(p.s,p.reply.length>10?p.reply:null,p.s?'ai':'rules')}).catch(function(){if(fin)return;fin=true;clearTimeout(to_);done(null,null,'rules')});
    } else done(null,null,'rules');
  }

  function result(){
    var c=S.cur, last=S.round>=5;
    var card=h('div',{class:'card'},h('span',{class:'label'},'Outcome of week '+(c.r+1)),h('h3',null,c.title),h('p',null,h('b',null,'You chose: '),c.t),
      h('div',null,METRICS.filter(function(m){return c.eff[m.k]}).map(function(m){return fmt(m.k,c.eff[m.k])})));
    var lines=h('div',{style:{marginTop:'10px'}});
    ST.forEach(function(s){var d=c.sdelta[s.id]; if(Math.abs(d)>=2){var up=d>0, wk=c.why[s.id];
      lines.appendChild(h('div',{class:'pmsim-line'},h('b',null,s.name.split(' ')[0]+' '),h('b',{class:up?'ok':'bad'},(up?'+':'')+d),h('span',{class:'muted'},' • '+(up?s.up:s.dn)),wk&&Math.abs(c.eff[wk])>0?h('div',{class:'tiny muted'},'Mostly because of '+MN[wk].n.toLowerCase()+' ('+(c.eff[wk]>0?'+':'')+c.eff[wk]+')'):null))}});
    card.appendChild(lines);
    if(c.msg){var m=c.msg,to=SID[ROUNDS[c.r].w&&(m.to||wTarget(ROUNDS[c.r],c.k))];
      card.appendChild(h('div',{class:'pmsim-line'},h('span',{class:'label'},'Your message'),
        m.skipped?h('p',null,'You did not write. '+m.reply):h('div',null,h('p',{class:'ai-box',style:{margin:'6px 0'}},h('span',{class:'label'},to.name+' replies'),m.reply),
          h('div',null,['clarity','empathy','needs'].map(function(k){return h('span',{class:'pmsim-d'},k+' '+m.ratings[k]+'/5')}),h('span',{class:'pmsim-d '+(m.dl>=0?'up':'dn')},to.name.split(' ')[0]+' '+(m.dl>=0?'+':'')+m.dl)),
          m.tips&&m.tips.length?h('ul',{class:'tiny muted'},m.tips.slice(0,3).map(function(t){return h('li',null,t)})):null,
          h('div',{class:'tiny muted'},m.src==='ai'?'Rated by AI role-play combined with a checklist.':'Rated by checklist.'))))}
    if(c.incident)card.appendChild(h('div',{class:'callout'},h('b',null,'Risk materialised: '),c.incident.t+'. Higher risk exposure makes these events more likely.',h('div',null,METRICS.filter(function(m){return c.incident.e[m.k]}).map(function(m){return fmt(m.k,c.incident.e[m.k])}))));
    c.drift.forEach(function(t){card.appendChild(h('div',{class:'callout note'},h('b',null,'Monitoring: '),t))});
    var qlab={good:'Strong move',ok:'Defensible, with costs',poor:'Weak move'}[c.q];
    card.appendChild(h('div',{class:'callout '+(c.q==='good'?'tip':c.q==='ok'?'note':'')},h('b',null,qlab+' • concept: '+CONCEPTS[c.c][0]+'. '),c.w));
    card.appendChild(h('button',{class:'btn primary',onclick:function(){ if(last){S.phase='debrief';save();render()}else{S.round++;S.phase='brief';S.checkin=false;S.sel=null;S.cur=null;save();render()} }},last?'See debrief':'Next week'));
    root.appendChild(card);
  }

  function debrief(){
    var hist=S.hist;
    var sat=ST.reduce(function(a,s){return a+S.sat[s.id]},0)/ST.length;
    var hv=(S.m.s+S.m.b+S.m.q+S.m.m+S.m.c+(100-S.m.r))/6;
    var qv={good:1,ok:.5,poor:0}, dq=hist.reduce(function(a,x){return a+qv[x.q]},0)/Math.max(1,hist.length)*100;
    var msgs=hist.filter(function(x){return x.msg}), ms=msgs.length?msgs.reduce(function(a,x){return a+(x.msg.avg||1)},0)/msgs.length/5*100:40;
    var comm=.8*ms+.2*Math.min(S.checkins,5)/5*100;
    var score=Math.round(.3*sat+.3*hv+.2*dq+.2*comm), s01=score/100;
    if(!S.done){S.done=true;S.score=score;save();try{ctx.complete(s01)}catch(e){}}
    var verdict=score>=80?'Outstanding: a project delivered with people on board.':score>=65?'Solid: a success with some scars.':score>=50?'Mixed: delivered, but at a cost to people or quality.':'Troubled: the project survived, but many stakeholders are unhappy.';
    root.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#8f8f8f'}},'Final score'),h('div',{class:'pmsim-sc'},score+'/100'),h('p',{style:{margin:'8px 0 0'}},verdict),
      h('div',{class:'tiny',style:{marginTop:'8px',color:'#bbb'}},'Stakeholder satisfaction '+Math.round(sat)+' • Project health '+Math.round(hv)+' • Decision quality '+Math.round(dq)+' • Communication '+Math.round(comm))));
    root.appendChild(dash(null));
    var sc=h('div',{class:'card'},h('span',{class:'label'},'Stakeholder outcomes'),h('div',{style:{height:'6px'}}));
    ST.forEach(function(s){var top=Object.keys(s.w).sort(function(a,b){return Math.abs(s.w[b])-Math.abs(s.w[a])})[0], mv=S.m[top], ok=s.w[top]<0?mv<45:mv>=60;
      var d=S.sat[s.id]-S.start[s.id];
      sc.appendChild(h('div',{class:'pmsim-line'},h('div',{class:'row between'},h('b',null,s.name),h('span',null,h('b',null,S.sat[s.id]),h('span',{class:d>=0?' ok':' bad'},' ('+(d>=0?'+':'')+d+') • '+mood(S.sat[s.id])))),
        h('div',{class:'bar'+(S.sat[s.id]<35?' red':''),style:{margin:'6px 0'}},h('i',{style:{width:S.sat[s.id]+'%'}})),
        h('div',{class:'tiny muted'},'Wanted: '+s.pri+'. Final '+MN[top].n.toLowerCase()+' '+Math.round(mv)+(ok?' (their priority was met).':' (their priority was not met).')),
        h('div',{class:'tiny'},h('b',null,'Hidden priority: '),s.hidden)))});
    root.appendChild(sc);
    var good=hist.filter(function(x){return x.q==='good'}), poor=hist.filter(function(x){return x.q==='poor'});
    function lst(title,arr,cls,none){var cd=h('div',{class:'card'},h('span',{class:'label'},title),h('div',{style:{height:'6px'}}));
      if(!arr.length)cd.appendChild(h('p',{class:'muted'},none));
      arr.forEach(function(x){cd.appendChild(h('div',{class:'callout '+cls},h('b',null,'Week '+(x.r+1)+': '+x.title+' • '+CONCEPTS[x.c][0]),h('div',{class:'tiny muted',style:{margin:'3px 0'}},'You: '+x.t),h('div',null,x.w)))});return cd}
    root.appendChild(lst('What you did well',good,'tip','No clear strong moves this time. Try a replay!'));
    root.appendChild(lst('What to improve',poor,'','No weak moves. Well done.'));
    var cs=h('div',{class:'card'},h('span',{class:'label'},'Course concepts in play'),h('div',{style:{height:'6px'}}));
    var by={}; hist.forEach(function(x){(by[x.c]=by[x.c]||[]).push(x)});
    Object.keys(by).forEach(function(k){var a=by[k], v=a.reduce(function(p,x){return p+qv[x.q]},0)/a.length*100;
      cs.appendChild(h('div',{class:'pmsim-line'},h('div',{class:'row between'},h('b',null,CONCEPTS[k][0]),h('span',{class:'tiny muted'},a.length+' decision'+(a.length>1?'s':''))),h('div',{class:'bar'+(v<40?' red':''),style:{margin:'6px 0'}},h('i',{style:{width:Math.max(4,v)+'%'}})),h('div',{class:'tiny muted'},CONCEPTS[k][1])))});
    root.appendChild(cs);
    if(msgs.length){var mc=h('div',{class:'card'},h('span',{class:'label'},'Your messages'),h('div',{style:{height:'6px'}}));
      msgs.forEach(function(x){var m=x.msg;mc.appendChild(h('div',{class:'pmsim-line'},h('b',null,'Week '+(x.r+1)+' • '+SID[m.to||wTarget(ROUNDS[x.r],x.k)].name),m.skipped?h('p',{class:'bad'},'Skipped.'):h('div',null,h('p',{class:'muted',style:{margin:'4px 0'}},'"'+m.text+'"'),
        h('div',null,['clarity','empathy','needs'].map(function(k){return h('span',{class:'pmsim-d'},k+' '+m.ratings[k]+'/5')})),m.tips&&m.tips.length?h('div',{class:'tiny muted'},'Next time: '+m.tips[0]):null)))});root.appendChild(mc)}
    root.appendChild(h('div',{class:'card'},h('span',{class:'label'},'Replay'),h('p',null,'Same seed gives the same events so you can try different decisions; a new seed changes which events occur and how the risks play out.'),
      h('div',{class:'row'},h('button',{class:'btn primary',onclick:function(){S=fresh(S.seed);S.phase='brief';save();render()}},'Replay same seed'),h('button',{class:'btn',onclick:function(){S=fresh();S.phase='brief';save();render()}},'Play with a new seed'))));
  }

  render();
 }});
})();

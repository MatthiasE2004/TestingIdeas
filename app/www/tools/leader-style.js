/* leader-style: situational leadership simulator (Leadership course, Week 2: theories and styles).
   Frameworks used are exactly those taught in Week 2: Lewin's three styles, House's Path-Goal behaviours,
   transactional vs transformational (Burns; Bass's four 'I's), Heifetz's technical vs adaptive challenges and
   adaptive leader behaviours, cross-cultural / generational context and inclusive leadership (ENEI). */
(function(){
var h=H.h, KEY='leader-style';
var css=
'.ls-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:12px}'+
'.ls-prog{display:flex;gap:4px;margin:6px 0 0}.ls-prog i{width:18px;height:6px;border-radius:9px;background:var(--line)}.ls-prog i.on{background:var(--ink)}.ls-prog i.cur{background:var(--red)}'+
'.ls-wrap{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}'+
'.ls-w .ls-wrap{grid-template-columns:minmax(300px,5fr) 7fr}.ls-w .ls-sticky{position:sticky;top:8px}'+
'.ls-cues{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}'+
'.ls-cue{background:var(--surface);border-radius:var(--r-sm);padding:8px 10px;border:1px solid var(--line)}'+
'.ls-cue b{display:block;font-size:.88rem;font-weight:500;line-height:1.25}'+
'.ls-who{display:flex;gap:10px;align-items:flex-start;margin-top:10px}'+
'.ls-av{flex:none;width:40px;height:40px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:.9rem}'+
'.ls-opt{display:block;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-md);padding:12px 14px;margin:0 0 8px;cursor:pointer;min-height:44px;font:inherit;color:inherit}'+
'.ls-opt:active{transform:scale(.99)}'+
'.ls-opt .ls-on{font-weight:600}.ls-opt .ls-def{font-size:.8rem;color:var(--ink2);margin-top:2px}.ls-opt .ls-how{font-size:.9rem;margin-top:6px;padding-top:6px;border-top:1px dotted var(--ink3)}'+
'.ls-opt.best{border-color:var(--green);border-width:2px}.ls-opt.ok{border-color:var(--amber);border-width:2px}.ls-opt.bad{border-color:var(--red);border-width:2px}'+
'.ls-opt.pick{background:var(--surface2)}.ls-opt[disabled]{cursor:default}'+
'.ls-tag{display:inline-block;border-radius:99px;padding:1px 10px;font-family:var(--mono);font-size:.64rem;letter-spacing:.08em;text-transform:uppercase;margin-left:6px;vertical-align:middle;border:1px solid var(--line)}'+
'.ls-tag.g{background:var(--green);color:#fff;border-color:var(--green)}.ls-tag.a{background:var(--amber);color:#fff;border-color:var(--amber)}.ls-tag.r{background:var(--red);color:#fff;border-color:var(--red)}'+
'.ls-step{border-top:1px dotted var(--ink3);padding-top:12px;margin-top:12px}.ls-step:first-of-type{border-top:0;margin-top:0;padding-top:0}'+
'.ls-ref{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:700px){.ls-ref{grid-template-columns:1fr 1fr}}'+
'.ls-ref>div{background:var(--surface2);border-radius:var(--r-sm);padding:10px 12px;font-size:.86rem}'+
'.ls-sc{font-family:var(--mono);font-size:2.4rem;line-height:1}'+
'.ls-line{border-top:1px dotted var(--line);padding:10px 0}'+
'.ls-tone{display:grid;grid-template-columns:120px 1fr 28px;gap:8px;align-items:center;font-size:.82rem;margin:4px 0}'+
'@media(max-width:420px){.ls-cues{grid-template-columns:1fr}.ls-tone{grid-template-columns:96px 1fr 24px}}';
if(!document.getElementById('ls-css')){var st=document.createElement('style');st.id='ls-css';st.textContent=css;document.head.appendChild(st)}

/* ---------- the frameworks taught in Week 2 ---------- */
var FW={
 lewin:{n:"Lewin's three styles",src:'Lewin and colleagues (1930s)',q:"Which of Lewin's three styles fits this situation best?",o:{
   autocratic:['Autocratic','The leader makes decisions themselves, without consulting others.'],
   democratic:['Democratic','The leader involves followers in the decision-making process.'],
   laissez:['Laissez faire','The leader has little involvement, allowing followers to make their own decisions.']}},
 pathgoal:{n:'Path-Goal Theory',src:'House (1971, updated)',q:'Which path-goal behaviour should lead your approach?',o:{
   directive:['Directive','Being clear and specific about expectations, tasks and deadlines.'],
   supportive:['Supportive','Focusing on followers\' needs and welfare, creating a positive working environment.'],
   participative:['Participative','Involving followers in decision making and encouraging their ideas.'],
   achievement:['Achievement-orientated','High expectations and challenging goals you are confident followers can achieve.']}},
 tt:{n:'Transactional or transformational',src:'Burns (1978); Bass (1985)',q:'Which overall approach does this situation call for?',o:{
   transactional:['Transactional','Focuses on the link between performance and reward; process and action oriented.'],
   transformational:['Transformational','Builds a connection with followers that motivates and inspires them to achieve more.']}},
 fouri:{n:"Bass's four 'I's",src:'Bass (1985)',q:"Which of the four 'I's is most needed right now?",o:{
   ic:['Individualised consideration','Supporting individual followers; coaching and developing them.'],
   is:['Intellectual stimulation','Encouraging followers to solve problems creatively for themselves.'],
   im:['Inspirational motivation','Inspiring and enthusing followers through clear communication of the vision.'],
   ii:['Idealised influence','Being a role model with high moral and ethical standards.']}},
 challenge:{n:'Technical or adaptive challenge',src:'Heifetz',q:'In Heifetz\'s terms, what kind of challenge is this?',o:{
   technical:['Technical challenge','More easily defined; solved through the leader\'s authority and/or expertise.'],
   adaptive:['Adaptive challenge','Not clearly defined; needs a range of expertise and a supportive, collaborative environment.']}},
 adaptive:{n:'Adaptive leader behaviours',src:'Heifetz and Laurie (1997)',q:'Which adaptive leader behaviour is most needed first?',o:{
   balcony:['Get on the balcony','Step back from the field of action and look from a different perspective.'],
   identify:['Identify the adaptive challenge','Find out what the key challenge is.'],
   distress:['Regulate distress','Manage conflict and provide direction for your followers.'],
   attention:['Maintain disciplined attention','Keep followers open to, and learning from, conflicting points of view.'],
   giveback:['Give the work back to the people','Empower followers to solve their own problems.'],
   voices:['Protect voices of leadership from below','Encourage junior staff to share concerns, and don\'t dismiss them.']}},
 context:{n:'Leadership context',src:'House et al. (1997); Indeed (2022); ENEI (2016)',q:'How should you adapt to the context?',o:{}}
};
var FWORDER=['lewin','pathgoal','tt','fouri','challenge','adaptive','context'];

/* ---------- scenarios ---------- */
/* steps: {fw, q?, opts:[{k, n?, d?, how, s(0-2), why}]} */
var SC=[
{id:'temps',title:'The Friday stock-take',setting:'Retail warehouse',
 brief:'You supervise a warehouse. Four seasonal temps started on Monday; none of them has done a stock-take before. The annual stock audit must be completed by 6 am on Friday or the store cannot open its sale. The count follows a fixed procedure, and mistakes mean recounting whole aisles.',
 who:[['T','Four new temps','Keen, but nervous and unsure what "good" looks like.']],
 cues:[['Experience','None with this task'],['Time pressure','Very high: 6 am Friday'],['Task','Procedural, error-prone'],['Followers want','Structure and reassurance']],
 steps:[
  {fw:'lewin',opts:[
   {k:'autocratic',s:2,how:'You decide the aisle allocation and the counting method yourself and brief them clearly.',why:'The course notes autocratic leadership can be appropriate "when working with a new, inexperienced team who need support in delivering a project quickly". Clear decisions from you protect them from errors they cannot yet foresee.'},
   {k:'democratic',s:0,how:'You ask the temps how they think the count should be organised and agree it together.',why:'Involving people in decisions is valuable when they have the knowledge to contribute. Here they have no experience of the task and no time to learn by debating it, so consultation costs time and adds uncertainty.'},
   {k:'laissez',s:0,how:'You hand them the scanners and let them organise themselves.',why:'Laissez faire works with motivated and capable staff who have a drive to succeed. New staff on a time-critical task are left guessing, and the audit deadline is at risk.'}]},
  {fw:'pathgoal',opts:[
   {k:'directive',s:2,how:'One-page procedure, named aisles per person, a 10 am and 3 pm check-in, and a clear "done" standard.',why:'Path-Goal Theory matches behaviour to follower characteristics such as preference for structure. Inexperienced people facing an unfamiliar task benefit most from being clear and specific about expectations, tasks and deadlines.'},
   {k:'supportive',s:1,how:'You focus on making them feel welcome and reassured, and tell them not to worry about mistakes.',why:'Helpful - they are nervous - but on its own it does not give them the path to the goal. Combine a supportive tone with directive clarity.'},
   {k:'participative',s:0,how:'You ask each temp for ideas on improving the counting process.',why:'Participative behaviour suits followers who want control and have ideas to offer. These temps want structure first; asking for process improvements now is premature.'},
   {k:'achievement',s:0,how:'You set a stretch target: finish by Thursday lunchtime, with zero recounts.',why:'Achievement-orientated goals must be ones you are confident followers can achieve. Without knowing the basics, a stretch goal adds pressure but no path.'}]}],
 lesson:'Context decides: with inexperienced people and a time-critical task, the "controlling" styles are the supportive ones. Leadership skill is the judgement about which approach to adopt.',
 say:{to:'the four temps',target:'directive',ask:'Write the first thing you would say at Monday\'s briefing.'}},

{id:'devs',title:'The internal tool',setting:'Software company',
 brief:'You manage five senior developers who are building a new internal analytics tool. They are highly motivated, take great pride in their craft and have shipped similar tools before. There are three months to deliver and the risk to the business is low. Two of them have mentioned they would like more ownership.',
 who:[['D','Five senior developers','Expert, self-driven, want ownership.']],
 cues:[['Experience','High'],['Motivation','High, proud of their work'],['Time pressure','Low: three months'],['Followers want','Control over how they work']],
 steps:[
  {fw:'lewin',opts:[
   {k:'autocratic',s:0,how:'You design the architecture and assign each developer their modules.',why:'Making every decision yourself with expert, motivated people wastes their knowledge and signals that you do not trust them. Autocratic leadership is for inexperienced teams or clear and present dangers.'},
   {k:'democratic',s:1,how:'You run a design session and decide the approach together.',why:'A reasonable choice: their expertise improves decisions. But they have asked for ownership and you add little by being in every decision.'},
   {k:'laissez',s:2,how:'You agree the outcome and the deadline, then let them decide how to build it.',why:'The course: laissez faire, although criticised as "hands off", "can be used effectively to develop and encourage motivated and capable staff who have a drive to succeed". That describes this team exactly.'}]},
  {fw:'pathgoal',opts:[
   {k:'directive',s:0,how:'You set out detailed tasks, coding standards and weekly deadlines.',why:'Followers with a strong desire for control and little need for structure tend to find detailed direction demotivating. Path-goal asks you to factor in those characteristics.'},
   {k:'supportive',s:1,how:'You check in on workload and wellbeing and keep the atmosphere positive.',why:'Always useful, but not what is missing here: they are not struggling, they want to be stretched and trusted.'},
   {k:'participative',s:1,how:'You involve them in setting priorities and encourage their ideas.',why:'A good fit for people who want control. It works well alongside the best answer, but it does not by itself raise the bar.'},
   {k:'achievement',s:2,how:'You set an ambitious goal - for example, adoption by three departments in the first month - and say you are confident they can do it.',why:'High expectations and challenging goals that you are confident followers can achieve suit capable, motivated experts with a desire for ownership.'}]}],
 lesson:'The same leader who was autocratic and directive with the temps should step back here. Style is not fixed: you adapt it to the followers and the task (contingency theory).',
 say:{to:'the development team',target:'achievement',ask:'Write how you would open the project kick-off.'}},

{id:'rota',title:'Rewriting the ward rota',setting:'Hospital ward',
 brief:'As ward manager you must design a new shift rota for 14 nurses within six weeks. The current rota causes gaps at weekends. The team spans generations: a senior nurse near retirement who values a friendly, democratic workplace, several Generation X nurses who prioritise work-life balance, and recently qualified Generation Z nurses who want flexible working. Everyone\'s life is affected.',
 who:[['N','14 nurses','Different needs, all affected, several strong views.']],
 cues:[['Task','Complex, needs careful planning'],['Time','Six weeks'],['Success needs','Collaboration and commitment'],['Context','Generational differences']],
 steps:[
  {fw:'lewin',opts:[
   {k:'autocratic',s:0,how:'You draw up the rota yourself and publish it.',why:'Fast, but you would miss constraints only the nurses know, and imposing a change to everyone\'s working life risks resentment and poor take-up.'},
   {k:'democratic',s:2,how:'You set the constraints (safe staffing, budget) and involve the nurses in designing options and choosing one.',why:'A complex task that needs careful planning and effective collaboration between staff is where involving followers in decisions pays off: better information and stronger commitment.'},
   {k:'laissez',s:0,how:'You ask the team to sort out a new rota among themselves.',why:'Collaboration between people with competing needs has to be facilitated. Left alone, the loudest voices tend to win and the gaps may remain.'}]},
  {fw:'context',q:'The generations want different things and you feel frustrated by some requests. How should you lead across the generations?',opts:[
   {k:'g1',n:'Design for the majority',d:'Keep it simple by fitting the rota to the largest group.',how:'You optimise for whichever generation is largest on the ward.',s:0,why:'This ignores legitimate needs of the others and turns a generational difference into a grievance.'},
   {k:'g2',n:'Set frustration aside and learn from the differences',d:'View diverse perspectives positively and be open to learning from them.',how:'You acknowledge your own preferences, then treat the different priorities as useful input to a better rota.',s:2,why:'The course: "the key to navigating generational differences is for the leader to set aside any personal frustration, view diverse perspectives positively and be open to learning from them".'},
   {k:'g3',n:'Allocate by generational profile',d:'Use the generation table to predict what each person wants.',how:'You give flexible shifts to the Gen Z nurses and fixed patterns to the older nurses without asking them.',s:0,why:'Generational characteristics are broad perceptions and "there will always be outliers". Use them to understand, not to stereotype individuals - ask people.'}]}],
 lesson:'Democratic leadership suits complex tasks that need collaboration. Context (here, generational) shapes how you run that involvement.',
 say:{to:'the nursing team',target:'participative',ask:'Write how you would introduce the rota project at the team meeting.'}},

{id:'priya',title:'A top performer struggling',setting:'Finance team',
 brief:'Priya is normally your most reliable analyst. Her father died six weeks ago. Since then she has missed two report deadlines, stays quiet in meetings and has started working late to catch up. Nobody else has said anything, but the quarter-end close is in three weeks.',
 who:[['P','Priya, senior analyst','Highly capable; grieving; under pressure.']],
 cues:[['Capability','High'],['Wellbeing','Low'],['Problem type','Welfare, not skill'],['Deadline','Quarter-end in 3 weeks']],
 steps:[
  {fw:'pathgoal',opts:[
   {k:'directive',s:0,how:'You remind her of the deadlines and set daily progress updates.',why:'Treats a welfare problem as a task problem. She knows what to do; more pressure is likely to make things worse.'},
   {k:'supportive',s:2,how:'You meet privately, show concern, and offer practical help: reprioritised work, flexible hours, support services.',why:'Supportive behaviour focuses on followers\' needs and welfare and creates a positive working environment. Path-goal asks which behaviour removes the obstacle on the follower\'s path - here, the obstacle is wellbeing.'},
   {k:'participative',s:1,how:'You ask her to help replan the quarter-end workload with you.',why:'A good second step once she feels supported: involving her gives her control. Leading with it can feel like business as usual.'},
   {k:'achievement',s:0,how:'You tell her you know she can still hit every deadline and set her a stretch target.',why:'Achievement-orientated goals must be ones you are confident she can achieve now. At this moment the stretch adds pressure without support.'}]},
  {fw:'fouri',opts:[
   {k:'ic',s:2,how:'You treat Priya as an individual: listen, adapt her workload, and coach her back to her normal level over time.',why:'Individualised consideration means supporting individual followers. In the Mandela case study, transformational leadership included "showing personal concern for the struggles of individual followers".'},
   {k:'is',s:0,how:'You ask her to come up with a creative solution to the backlog.',why:'Intellectual stimulation is powerful with an engaged follower; for someone grieving it hands her another problem to solve.'},
   {k:'im',s:0,how:'You remind the team of the vision and how much the quarter-end matters.',why:'A vision speech to the team does not address an individual\'s struggle and can feel like pressure.'},
   {k:'ii',s:1,how:'You role-model a healthy approach to wellbeing, e.g. leaving on time yourself.',why:'Being a role model helps the culture, but Priya needs individual attention now.'}]}],
 lesson:'Supportive behaviour and individualised consideration are not "soft": they remove the real obstacle to performance. The course also warns that transformational enthusiasm can lead leaders to expect too much, such as long hours.',
 say:{to:'Priya',target:'supportive',ask:'Write the first thing you would say to Priya in a private conversation.'}},

{id:'line',title:'Defects on the bottling line',setting:'Food and drink factory',
 brief:'You are the shift supervisor on a bottling line with 20 operatives, many of them temporary staff on low pay. The line runs on standard operating procedures and an hourly output target. A hygiene audit is due next month, and defects have risen because some checks are being skipped to keep up with the target.',
 who:[['O','20 line operatives','Mixed experience; paid by shift; follow set procedures.']],
 cues:[['Work','Standardised, tightly controlled'],['Followers','Low paid, many temporary'],['Risk','Hygiene audit next month'],['Problem','Checks skipped']],
 steps:[
  {fw:'tt',opts:[
   {k:'transactional',s:2,how:'You restate the standard, make the checks part of the target, and link recognition and bonuses to quality as well as output.',why:'The course: transactional leaders are "particularly effective when projects must be tightly controlled, e.g. on a production line with low paid employees". Its advantage is clarity - people know what is expected and have incentives to perform well.'},
   {k:'transformational',s:1,how:'You run a session on the company\'s mission and inspire the team to take pride in quality.',why:'Could raise commitment over time, but transformational leaders "often struggle with detail" - and here the problem is detail: specific skipped checks. Watch transactional\'s downside too: lack of autonomy can demotivate.'}]},
  {fw:'pathgoal',opts:[
   {k:'directive',s:2,how:'You walk the line, show exactly which checks are required and when, and adjust the hourly target so they are achievable.',why:'Being clear and specific about expectations and tasks fits a standardised task with a clear rule. Adjusting the target removes the obstacle that caused the shortcut.'},
   {k:'supportive',s:1,how:'You acknowledge the pressure people are under and improve break arrangements.',why:'Worth doing - pressure is a cause - but on its own it does not fix the skipped checks before the audit.'},
   {k:'participative',s:1,how:'You ask operatives why checks are skipped and invite ideas.',why:'Useful for finding causes and people often know the fix. Combine with clear standards; the rule itself is not up for debate.'},
   {k:'achievement',s:0,how:'You raise the output target to motivate the team.',why:'A higher target when checks are already skipped to meet the current one increases corner-cutting. Challenging goals must be achievable.'}]}],
 lesson:'Transactional leadership still plays an important role where standards and procedures matter. Its strength is clarity; its risk is demotivation through lack of autonomy.',
 say:{to:'the line operatives',target:'directive',ask:'Write what you would say at the start-of-shift briefing.'}},

{id:'outage',title:'Payments down on a Saturday',setting:'Online shop',
 brief:'It is 9:15 on a Saturday morning, your busiest trading day. Customers cannot pay at checkout. Monitoring shows the payment provider\'s certificate has expired - a known failure with a tested fix in the team\'s runbook. Your on-call engineer is competent but has never handled this one, and the customer service team is asking what to tell customers.',
 who:[['E','On-call engineer + customer service','Waiting for a lead; minutes matter.']],
 cues:[['Problem','Clearly defined, known fix'],['Time pressure','Extreme'],['Stakes','Lost sales every minute'],['Need','Fast, coordinated decisions']],
 steps:[
  {fw:'challenge',opts:[
   {k:'technical',s:2,how:'You treat it as a known problem with a known solution.',why:'Technical challenges are more easily defined and solved through the leader\'s authority and/or expertise. The runbook already holds the fix.'},
   {k:'adaptive',s:0,how:'You treat it as a deep problem that needs the team to rethink how it works.',why:'Adaptive challenges are not clearly defined and challenge deeply held beliefs. A post-incident review might raise adaptive questions later, but right now this is technical.'}]},
  {fw:'lewin',opts:[
   {k:'autocratic',s:2,how:'You decide: engineer follows runbook step 4 now; customer service posts the holding message you dictate; update in 15 minutes.',why:'The course notes a responsive, directive style "can be useful in emergencies", and autocratic leadership fits situations "where there are clear and present dangers".'},
   {k:'democratic',s:0,how:'You call a quick meeting to agree the best way forward.',why:'Consultation is valuable when the answer is unclear. Here it delays a known fix while sales are lost.'},
   {k:'laissez',s:1,how:'You trust the engineer to sort it and stay out of the way.',why:'The engineer is competent, so this might work technically, but nobody is coordinating customer communication and the engineer has never run this fix.'}]}],
 lesson:'Technical problems call for authority and expertise; emergencies justify a directive, autocratic style. Save the participative approaches for problems that are not clearly defined.',
 say:{to:'the on-call engineer and customer service',target:'directive',ask:'Write the message you would post in the incident chat.'}},

{id:'merger',title:'Two charities become one',setting:'Merged charity',
 brief:'Two charities have merged and you lead the new fundraising team. Each side has long-held ways of working that made it successful, and both have a point. Meetings turn into arguments about process. Tomasz, a junior fundraiser, has twice said that donors are confused by the new name - and both times senior colleagues waved the comment away.',
 who:[['T','Tomasz, junior fundraiser','Close to donors; repeatedly dismissed.'],['F','Fundraisers from both charities','Competing, legitimate perspectives.']],
 cues:[['Problem','Not clearly defined'],['Beliefs','Deeply held, challenged'],['Perspectives','Legitimate but competing'],['Warning sign','Junior voice dismissed']],
 steps:[
  {fw:'challenge',opts:[
   {k:'technical',s:0,how:'You treat it as a process problem: you choose the better of the two systems and roll it out.',why:'Imposing one side\'s process uses authority to solve a problem that is about values and identity. It is likely to entrench the conflict.'},
   {k:'adaptive',s:2,how:'You treat it as a challenge the team has to work through together.',why:'Heifetz: "adaptive work is required when our deeply held beliefs are challenged, when the values that made us successful become less relevant, and when legitimate yet competing perspectives emerge" - a description of this merger.'}]},
  {fw:'adaptive',q:'Tomasz\'s concern has been dismissed twice. Which adaptive leader behaviour is most needed first?',opts:[
   {k:'balcony',s:1,how:'You step back from the meetings to see the bigger pattern.',why:'Helpful for you, but it does not stop an important signal being lost.'},
   {k:'identify',s:1,how:'You work to identify the real challenge behind the arguments.',why:'Necessary - and Tomasz\'s donor feedback may be part of the answer, which is why his voice matters first.'},
   {k:'distress',s:1,how:'You set ground rules for meetings and give clearer direction.',why:'Regulating distress keeps conflict productive; worth doing alongside, but it does not address the dismissed concern.'},
   {k:'attention',s:1,how:'You keep the team focused on learning from both charities\' views.',why:'Important in a merger, but the immediate risk is a junior voice being silenced.'},
   {k:'giveback',s:0,how:'You tell the team to sort out the naming issue between themselves.',why:'Giving the work back empowers people, but in the current dynamic it means the senior voices will keep winning.'},
   {k:'voices',s:2,how:'You publicly invite Tomasz to present the donor feedback and make sure it is taken seriously.',why:'"Protect voices of leadership from below - encourage junior staff to share their concerns and don\'t dismiss them." Junior staff close to donors often see the adaptive challenge first.'}]}],
 lesson:'Adaptive challenges need a supportive, collaborative environment and a range of expertise - including the expertise of junior people closest to the problem.',
 say:{to:'the fundraising team (with Tomasz present)',target:'participative',ask:'Write what you would say to open the next team meeting.'}},

{id:'global',title:'A global launch team',setting:'Consumer electronics firm',
 brief:'You lead a new virtual team launching a product: designers in Amsterdam, engineers in Kuala Lumpur and sales staff in Chicago. In the first call the Dutch designers asked why the project needs a "leader" at all, the Malaysian engineers said little, and the American sales team asked for authority to make their own calls on pricing.',
 who:[['G','Three regional teams','Different expectations of a leader.']],
 cues:[['Team','Multicultural, virtual'],['Expectations','Differ by culture'],['Risk','Quiet voices unheard'],['Goal','One coordinated launch']],
 steps:[
  {fw:'context',q:'Different cultures take different approaches to leadership. How do you adapt?',opts:[
   {k:'c1',n:'One bold, forceful style for all',d:'Make it clear from day one who is in charge.',how:'You set the direction firmly and expect everyone to follow.',s:0,why:'Some followers respect a bold, forceful leader, but House et al. (1997) report that the Dutch are sceptical about leadership and Malaysians expect a leader to be humble, modest and dignified. One style for all ignores the context.'},
   {k:'c2',n:'Inclusive and culturally aware',d:'Seek out diverse views without bias; delegate clear decision rights.',how:'You lead modestly, invite each region\'s view (asking the quieter engineers directly), and agree which decisions sales can make alone.',s:2,why:'This answers the cultural expectations the course describes (egalitarianism, humility, autonomy) and matches the ENEI (2016) inclusive leader who "listens to and seeks out the views of diverse people and takes account of them, without bias, in decisions".'},
   {k:'c3',n:'Let each region run itself',d:'Avoid friction by minimising contact until launch.',how:'Each region works independently and you meet only at launch.',s:0,why:'This avoids the cultural tension rather than leading it. The ENEI inclusive leader "appreciates that a diverse group will generate more creative solutions" - only if it actually works together.'}]},
  {fw:'pathgoal',opts:[
   {k:'directive',s:0,how:'You issue a detailed launch plan with tasks per region.',why:'Clear plans matter, but leading with direction confirms the Dutch team\'s scepticism and gives the quieter voices no route in.'},
   {k:'supportive',s:1,how:'You build relationships with each region and check how they are finding the project.',why:'Builds trust across distance; a good complement but does not, by itself, bring the ideas together.'},
   {k:'participative',s:2,how:'You run a structured session in which every region contributes to the launch plan, with time to respond in writing.',why:'Involving followers in decision making and encouraging their ideas fits followers who want equality (Dutch) and autonomy (American) and, with structure, gives quieter colleagues a way to contribute.'},
   {k:'achievement',s:1,how:'You set an ambitious global launch goal and express confidence in the team.',why:'Can energise the team once trust exists; on day one it misses the real issue - how the team will work together.'}]}],
 lesson:'Cross-cultural context changes what followers expect from a leader. Awareness of cultural sensitivities and an inclusive approach help a multicultural team perform.',
 say:{to:'the three regional teams',target:'participative',ask:'Write how you would open the second team call.'}},

{id:'startup',title:'After losing the big client',setting:'Twelve-person start-up',
 brief:'Your start-up has just lost its biggest client, worth 40% of revenue. The team is capable, but morale is low: two people have asked whether the company has a future and one is quietly interviewing elsewhere. You still have 14 months of funding and a product that other customers like.',
 who:[['S','Twelve staff','Capable; anxious; questioning the future.']],
 cues:[['Capability','Good'],['Morale','Low'],['Question in the air','"Why should I stay?"'],['Need','A credible vision']],
 steps:[
  {fw:'tt',opts:[
   {k:'transactional',s:0,how:'You announce retention bonuses for anyone who hits their targets this quarter.',why:'Transactional leadership links performance to reward. It does not answer the question people are actually asking - whether there is a future worth staying for.'},
   {k:'transformational',s:2,how:'You build a connection with the team around a renewed vision of where the company is going and why it matters.',why:'Transformational leadership "builds a connection with followers that motivates and inspires them to achieve more" - exactly what a capable but demoralised team needs.'}]},
  {fw:'fouri',opts:[
   {k:'ic',s:1,how:'You hold one-to-ones with each person about their worries and development.',why:'Valuable, especially for the person interviewing elsewhere, but individual chats alone do not give the team a shared direction.'},
   {k:'is',s:1,how:'You ask the team to come up with ideas for replacing the lost revenue.',why:'A strong next step - people commit to solutions they create - once they believe there is a future to work for.'},
   {k:'im',s:2,how:'You set out, clearly and repeatedly, the vision and the plan for the next 14 months.',why:'Inspirational motivation is "inspiring and enthusing followers through clear communication of the vision". Mandela "repeatedly articulat[ed] a clear vision with charisma and conviction".'},
   {k:'ii',s:1,how:'You model resilience and integrity, for example by taking a pay cut yourself.',why:'Being a role model builds trust and credibility; it supports the vision but does not replace it.'}]}],
 lesson:'Transformational leadership fits change and uncertainty - but remember its downsides: passion can override the facts, it can favour a small inner circle, and leaders may expect too much, such as long hours.',
 say:{to:'the whole team',target:'vision',ask:'Write the opening of your all-hands talk the morning after the news.'}}
];

/* ---------- rule-based wording check ---------- */
var TONES=[
 ['directive','Directive',['need you to','please ','by ',' deadline','first','then ','step','must','will ','exactly','procedure','check','follow','allocate','your job','today','tomorrow',' am','o\'clock','minutes','now','update','report']],
 ['supportive','Supportive',['how are you','are you ok','okay','understand','sorry','support','help','take time','take the time','worr','feel','care','here for','listen','flexib','no pressure','whatever you need','wellbeing','well-being']],
 ['participative','Participative',['what do you think','your ideas','idea','suggest','together','your view','opinion','input','let\'s','agree','how would you','what would you','discuss','hear from','everyone','?']],
 ['achievement','Achievement',['challenge','stretch','confident','i know you can','ambitious','goal','best','excellent','proud','trust you','you can','capable','raise the bar','aim']],
 ['vision','Vision / inspiring',['vision','why','purpose','future','imagine','mission','believe','we will','story','matters','next 14','plan','together we','opportunit','proud']]
];
var TNAME={directive:'directive',supportive:'supportive',participative:'participative',achievement:'achievement-orientated',vision:'transformational (vision)'};
function tone(txt){var t=' '+txt.toLowerCase()+' ',res={};TONES.forEach(function(T){var n=0;T[2].forEach(function(w){var i=-1;while((i=t.indexOf(w,i+1))>=0){n++;if(n>6)break}});res[T[0]]=n});return res}
function wordingFeedback(sc,txt){
  var r=tone(txt),tg=sc.say.target,words=txt.trim().split(/\s+/).length,max=0,top=null;
  TONES.forEach(function(T){if(r[T[0]]>max){max=r[T[0]];top=T[0]}});
  var tips=[],good=r[tg]>=2||(r[tg]>=1&&top===tg);
  if(good)tips.push('Your wording carries a clear '+TNAME[tg]+' signal, which fits this situation.');
  else tips.push('This situation calls for a '+TNAME[tg]+' approach, but that comes through only weakly. '+({directive:'Say exactly who does what, by when, and when you will check in.',supportive:'Start with the person: show concern, listen and offer practical help.',participative:'Ask real questions and invite ideas before deciding.',achievement:'Set a challenging goal and say you are confident they can reach it.',vision:'Explain where you are going and why it matters, and how each person contributes.'})[tg]);
  if(top&&top!==tg&&max>=2)tips.push('The strongest tone in your message is '+TNAME[top]+'. '+(tg==='supportive'&&top==='directive'?'Deadlines and instructions first can make a struggling person feel judged.':tg==='directive'&&top==='participative'?'Lots of questions can leave people who need structure unsure what to do.':'Check that this is what the situation needs.'));
  if(words<12)tips.push('Very short - add one more sentence so the people involved know what happens next.');
  else if(words>120)tips.push('Quite long - in a live conversation, lead with the one thing that matters most.');
  var q=(txt.match(/\?/g)||[]).length; if(tg==='participative'&&q===0)tips.push('No questions at all - participative leadership invites input.');
  return {r:r,tips:tips,good:good,src:'rules'};
}

function clone(o){return JSON.parse(JSON.stringify(o))}
function optInfo(step,o){var f=FW[step.fw].o[o.k];return {n:o.n||(f&&f[0])||o.k,d:o.d||(f&&f[1])||''}}
function maxOf(step){var m=0;step.opts.forEach(function(o){if(o.s>m)m=o.s});return m}
var MAX=0;SC.forEach(function(s){s.steps.forEach(function(st){MAX+=maxOf(st)})});

Tools.register('leader-style',{title:'Situational leadership simulator',desc:'Read nine realistic team situations and choose the leadership style or behaviour that fits, using the Week 2 frameworks.',
mount:function(el,ctx){
  function fresh(){return {phase:'intro',i:0,ans:{},say:{},words:'',done:false,ref:false}}
  var S=ctx.load(KEY); if(!S||!S.ans)S=fresh();
  function save(){try{ctx.save(S,KEY)}catch(e){}}
  var root=h('div',{class:'tool'}); el.innerHTML=''; el.appendChild(root);

  function scoreOf(){var s=0,n=0;SC.forEach(function(sc){var a=S.ans[sc.id]||{};sc.steps.forEach(function(st,j){if(a[j]!=null){n++;st.opts.forEach(function(o){if(o.k===a[j])s+=o.s})}})});return {s:s,n:n}}
  function scDone(sc){var a=S.ans[sc.id]||{};return sc.steps.every(function(st,j){return a[j]!=null})}

  function header(){
    var sc=scoreOf(),prog=h('div',{class:'ls-prog','aria-hidden':'true'},SC.map(function(x,k){return h('i',{class:(S.phase==='play'&&k===S.i)?'cur':scDone(x)?'on':''})}));
    var rb=h('button',{class:'btn ghost sm',onclick:function(){ if(rb._c){S=fresh();save();render()}else{rb._c=true;rb.textContent='Tap again to reset';setTimeout(function(){rb._c=false;if(rb.isConnected)rb.textContent='Reset'},3000)} }},'Reset');
    return h('div',{class:'ls-head'},
      h('div',null,h('span',{class:'label'},'Situational leadership simulator'),
        h('h3',{style:{margin:'2px 0 0'}},S.phase==='play'?('Situation '+(S.i+1)+' of '+SC.length):S.phase==='debrief'?'Debrief':'Choose how to lead'),prog),
      h('div',{class:'row',style:{gap:'8px'}},S.phase!=='intro'?h('span',{class:'chip',style:{cursor:'default'}},'Score '+sc.s+' / '+MAX):null,
        h('button',{class:'btn ghost sm',onclick:function(){S.ref=!S.ref;save();render()}},S.ref?'Hide styles':'Style reference'),rb));
  }
  function reference(){
    var box=h('div',{class:'card flat'},h('span',{class:'label'},'The Week 2 frameworks'),h('div',{style:{height:'8px'}}));
    var g=h('div',{class:'ls-ref'});
    FWORDER.forEach(function(k){var f=FW[k],ks=Object.keys(f.o);if(!ks.length)return;
      g.appendChild(h('div',null,h('b',null,f.n),h('div',{class:'tiny muted',style:{marginBottom:'4px'}},f.src),h('ul',{style:{margin:'0',paddingLeft:'18px'}},ks.map(function(o){return h('li',null,h('b',null,f.o[o][0]+': '),f.o[o][1])}))))});
    g.appendChild(h('div',null,h('b',null,'Context and inclusion'),h('div',{class:'tiny muted',style:{marginBottom:'4px'}},FW.context.src),
      h('p',{style:{margin:0}},'Cultures expect different things of leaders (e.g. Dutch egalitarianism, Malaysian humility, American autonomy). Across generations, set aside personal frustration and learn from diverse perspectives. Inclusive leaders seek out diverse views without bias.')));
    box.appendChild(g);return box;
  }

  function intro(){
    root.appendChild(h('div',{class:'card flat dots'},
      h('h2',null,'What kind of leader does this situation need?'),
      h('p',null,'Contingency theories say effective leadership depends on the situation: good leaders adapt their style. In this simulator you lead nine different teams - new temps, senior experts, a grieving colleague, a production line, an emergency, a merger, a multicultural team and more.'),
      h('p',null,'For each situation, read the cues about the people and the task, then pick the style or behaviour that fits, using the frameworks from this week. You get the course reasoning straight away. Optionally, put your choice into words and get feedback on how it sounds.'),
      h('div',{class:'row',style:{gap:'6px',margin:'4px 0 12px'}},FWORDER.slice(0,6).map(function(k){return h('span',{class:'chip',style:{cursor:'default'}},FW[k].n)})),
      h('p',{class:'tiny muted'},'Scoring: best fit 2 points, defensible 1, poor fit 0. There is rarely only one acceptable answer - the feedback explains the trade-offs.'),
      h('button',{class:'btn primary',onclick:function(){S.phase='play';S.i=0;save();render()}},Object.keys(S.ans).length?'Continue':'Start situation 1')));
  }

  function play(){
    var sc=SC[S.i],a=S.ans[sc.id]||(S.ans[sc.id]={});
    var left=h('div',{class:'card flat ls-sticky'},
      h('span',{class:'label'},sc.setting),h('h3',{style:{margin:'2px 0 8px'}},sc.title),h('p',{style:{margin:'0 0 6px'}},sc.brief),
      sc.who.map(function(w){return h('div',{class:'ls-who'},h('div',{class:'ls-av','aria-hidden':'true'},w[0]),h('div',null,h('b',null,w[1]),h('div',{class:'tiny muted'},w[2])))}),
      h('div',{class:'label',style:{marginTop:'12px'}},'Situation cues'),
      h('div',{class:'ls-cues'},sc.cues.map(function(c){return h('div',{class:'ls-cue'},h('span',{class:'label',style:{fontSize:'.62rem'}},c[0]),h('b',null,c[1]))})));
    var right=h('div',{class:'card'});
    var open=true;
    sc.steps.forEach(function(st,j){
      if(!open)return;
      var f=FW[st.fw],chosen=a[j],stepBox=h('div',{class:'ls-step'});
      stepBox.appendChild(h('span',{class:'label'},'Decision '+(j+1)+' of '+sc.steps.length+' • '+f.n));
      stepBox.appendChild(h('p',{style:{fontWeight:500,margin:'4px 0 10px'}},st.q||f.q));
      var best=maxOf(st);
      st.opts.forEach(function(o){var inf=optInfo(st,o),cls='ls-opt';
        if(chosen!=null){ if(o.s===best)cls+=' best'; else if(o.k===chosen)cls+=(o.s>0?' ok':' bad'); if(o.k===chosen)cls+=' pick'}
        var tag=chosen!=null&&(o.k===chosen||o.s===best)?h('span',{class:'ls-tag '+(o.s===best?'g':o.s>0?'a':'r')},o.s===best?'Best fit':o.s>0?'Defensible':'Poor fit'):null;
        stepBox.appendChild(h('button',{class:cls,disabled:chosen!=null,'aria-pressed':o.k===chosen?'true':'false',onclick:function(){a[j]=o.k;save();render()}},
          h('div',{class:'ls-on'},inf.n,tag,o.k===chosen?h('span',{class:'ls-tag'},'Your choice'):null),h('div',{class:'ls-def'},inf.d),h('div',{class:'ls-how'},h('span',{class:'muted'},'Here: '),o.how)));
      });
      if(chosen!=null){var co=null,bo=null;st.opts.forEach(function(o){if(o.k===chosen)co=o;if(o.s===best&&!bo)bo=o});
        stepBox.appendChild(h('div',{class:'callout '+(co.s===best?'tip':co.s>0?'note':'')},h('b',null,(co.s===best?'Good call. ':co.s>0?'Defensible, not the best fit. ':'Poor fit. ')),co.why,
          co!==bo?h('div',{style:{marginTop:'8px'}},h('b',null,'Best fit - '+optInfo(st,bo).n+': '),bo.why):null));
      } else open=false;
      right.appendChild(stepBox);
    });
    if(open){ /* all steps answered */
      right.appendChild(h('div',{class:'callout tip'},h('b',null,'Course takeaway: '),sc.lesson));
      right.appendChild(sayBox(sc));
      var last=S.i===SC.length-1;
      right.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},
        S.i>0?h('button',{class:'btn ghost',onclick:function(){S.i--;save();render()}},'Back'):null,
        h('button',{class:'btn primary',onclick:function(){ if(last){S.phase='debrief'}else{S.i++} save();render();try{el.scrollIntoView({block:'start'})}catch(e){} }},last?'See debrief':'Next situation')));
    } else if(S.i>0){right.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},h('button',{class:'btn ghost sm',onclick:function(){S.i--;save();render()}},'Previous situation')))}
    root.appendChild(h('div',{class:'ls-wrap'},left,right));
  }

  function toneBars(r){return h('div',{style:{marginTop:'8px'}},TONES.map(function(T){var v=Math.min(5,r[T[0]]);return h('div',{class:'ls-tone'},h('span',null,T[1]),h('div',{class:'bar'},h('i',{style:{width:(v*20)+'%'}})),h('span',{class:'tiny muted'},r[T[0]]))}))}
  function sayBox(sc){
    var sv=S.say[sc.id]||{text:'',fb:null,ai:''};
    var box=h('div',{class:'card flat',style:{margin:'12px 0 0'}});
    box.appendChild(h('span',{class:'label'},'Optional: put it into words'));
    box.appendChild(h('p',{style:{margin:'4px 0 8px'}},sc.say.ask+' (to '+sc.say.to+')'));
    var out=h('div');
    var ta=h('textarea',{class:'textarea','aria-label':'Your words',placeholder:'Type what you would actually say...',oninput:function(){sv.text=ta.value;S.say[sc.id]=sv;save();b1.disabled=ta.value.trim().length<8;if(b2)b2.disabled=b1.disabled}});
    ta.value=sv.text||'';
    var b1=h('button',{class:'btn',disabled:(sv.text||'').trim().length<8,onclick:function(){sv.fb=wordingFeedback(sc,ta.value);sv.ai='';S.say[sc.id]=sv;save();showFb()}},'Check my wording');
    var b2=ctx.ai.available()?h('button',{class:'btn primary',disabled:(sv.text||'').trim().length<8,onclick:function(){roleplay()}},'Role-play with AI'):null;
    function showFb(){out.innerHTML='';if(!sv.fb)return;
      out.appendChild(h('div',{class:'callout '+(sv.fb.good?'tip':'note'),style:{marginTop:'10px'}},h('b',null,'Wording check (rules): '),h('ul',{style:{margin:'4px 0 0',paddingLeft:'18px'}},sv.fb.tips.map(function(t){return h('li',null,t)})),toneBars(sv.fb.r)));
      if(sv.ai)out.appendChild(h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},'AI role-play'),sv.ai));}
    function roleplay(){
      sv.fb=wordingFeedback(sc,ta.value);S.say[sc.id]=sv;save();showFb();
      var aiBox=h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},'AI role-play: '+sc.who[0][1]+' is replying...'),'');
      var stream=document.createTextNode('Thinking...');aiBox.appendChild(stream);out.appendChild(aiBox);b2.disabled=true;
      var who=sc.who[0][1]+' ('+sc.who[0][2]+')',tg=TNAME[sc.say.target];
      var sys='You role-play a person at work and then give one line of coaching. Stay in character. Plain text, under 90 words.';
      var pr='Situation: '+sc.brief+'\nYou are: '+who+'.\nThe leader says to you: "'+ta.value.trim().slice(0,600)+'"\n\nWrite 1-2 sentences replying in character, showing how these words make you feel.\nThen a new line starting "COACH:" with one sentence on whether the words fit a '+tg+' leadership approach and one improvement.';
      var fin=false,acc='';
      var tm=setTimeout(function(){if(fin)return;fin=true;stream.nodeValue='The AI took too long - see the rules-based check above.';b2.disabled=false},60000);
      ctx.ai.ask({system:sys,prompt:pr,maxTokens:160,temperature:0.6,onToken:function(t){if(fin)return;acc+=t;stream.nodeValue=acc}}).then(function(t){if(fin)return;fin=true;clearTimeout(tm);
        t=String(t||acc||'').trim();if(t.length<5){stream.nodeValue='No reply from the AI - see the rules-based check above.';b2.disabled=false;return}
        var i=t.search(/COACH\s*:/i),reply=i>=0?t.slice(0,i).trim():t,coach=i>=0?t.slice(i).replace(/COACH\s*:/i,'').trim():'';
        sv.ai=reply+(coach?'\n\nCoach: '+coach:'');S.say[sc.id]=sv;save();showFb();b2.disabled=false;
      }).catch(function(){if(fin)return;fin=true;clearTimeout(tm);stream.nodeValue='The AI is not available right now - the rules-based check above still applies.';b2.disabled=false});
    }
    box.appendChild(ta);box.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},b1,b2));box.appendChild(out);
    showFb();
    return box;
  }

  function debrief(){
    var sc=scoreOf(),pct=Math.round(sc.s/MAX*100);
    if(!S.done){S.done=true;save();try{ctx.complete(sc.s/MAX)}catch(e){}}
    var verdict=pct>=85?'Excellent situational judgement: you consistently matched style to followers and task.':pct>=65?'Good judgement, with a few situations where another style would fit better - review them below.':pct>=45?'Mixed: several choices did not fit the cues about the people and the task. Review them below.':'Many choices did not match the situation. Revisit the cues (experience, motivation, time pressure, type of problem) in each scenario and try again.';
    root.appendChild(h('div',{class:'card dark'},h('span',{class:'label',style:{color:'#8f8f8f'}},'Your score'),h('div',{class:'ls-sc'},sc.s+' / '+MAX),h('p',{style:{margin:'8px 0 0'}},verdict)));
    /* per framework */
    var per={};SC.forEach(function(x){var a=S.ans[x.id]||{};x.steps.forEach(function(st,j){var p=per[st.fw]||(per[st.fw]={s:0,m:0});p.m+=maxOf(st);st.opts.forEach(function(o){if(o.k===a[j])p.s+=o.s})})});
    var fc=h('div',{class:'card'},h('span',{class:'label'},'By framework'),h('div',{style:{height:'6px'}}));
    FWORDER.forEach(function(k){var p=per[k];if(!p)return;var v=Math.round(p.s/p.m*100);
      fc.appendChild(h('div',{class:'ls-line'},h('div',{class:'row between'},h('b',null,FW[k].n),h('span',{class:'tiny'},p.s+' / '+p.m)),h('div',{class:'bar'+(v<50?' red':''),style:{marginTop:'6px'}},h('i',{style:{width:v+'%'}}))))});
    root.appendChild(fc);
    /* Lewin tendency */
    var cnt={autocratic:0,democratic:0,laissez:0},ideal={autocratic:0,democratic:0,laissez:0};
    SC.forEach(function(x){var a=S.ans[x.id]||{};x.steps.forEach(function(st,j){if(st.fw!=='lewin')return;if(a[j])cnt[a[j]]++;var b=null;st.opts.forEach(function(o){if(o.s===2)b=o.k});ideal[b]++})});
    var used=Object.keys(cnt).filter(function(k){return cnt[k]>0}).length;
    var lc=h('div',{class:'card'},h('span',{class:'label'},'Your Lewin choices vs. the situations'),
      h('div',{class:'grid g3',style:{marginTop:'8px'}},Object.keys(cnt).map(function(k){return h('div',{class:'card flat',style:{margin:0,padding:'12px'}},h('b',null,FW.lewin.o[k][0]),h('div',{class:'tiny muted'},'You chose '+cnt[k]+'× • best fit '+ideal[k]+'×'))})),
      h('p',{style:{margin:'10px 0 0'}},used>=3?'You used all three of Lewin\'s styles - the kind of flexibility contingency theories describe.':'You relied on '+(used===1?'one style':'two styles')+'. The situations needed all three: inexperienced people under time pressure (autocratic), complex tasks needing collaboration (democratic), and motivated experts (laissez faire).'));
    root.appendChild(lc);
    /* review list */
    var rv=h('div',{class:'card'},h('span',{class:'label'},'Review your decisions'),h('div',{style:{height:'6px'}}));
    SC.forEach(function(x,i){var a=S.ans[x.id]||{};
      rv.appendChild(h('div',{class:'ls-line'},h('div',{class:'row between'},h('b',null,(i+1)+'. '+x.title),h('button',{class:'btn ghost sm',onclick:function(){S.phase='play';S.i=i;save();render()}},'Open')),
        x.steps.map(function(st,j){var co=null,bo=null,b=maxOf(st);st.opts.forEach(function(o){if(o.k===a[j])co=o;if(o.s===b&&!bo)bo=o});
          return h('div',{class:'tiny',style:{marginTop:'4px'}},h('span',{class:'muted'},FW[st.fw].n+': '),co?h('b',{class:co.s===b?'ok':co.s>0?'':'bad'},optInfo(st,co).n):h('span',{class:'muted'},'not answered'),co&&co!==bo?h('span',{class:'muted'},' (best fit: '+optInfo(st,bo).n+')'):null)})))});
    root.appendChild(rv);
    /* reflection */
    var inp=h('input',{class:'input',placeholder:'e.g. calm, clear, inclusive','aria-label':'Three words that describe your leadership style',oninput:function(){S.words=inp.value;save()}});inp.value=S.words||'';
    root.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Reflect (links to Activity 6)'),
      h('p',{style:{margin:'4px 0 8px'}},'Your style is not fixed: you can adapt and develop it. Which situations felt natural to you, and which styles felt uncomfortable? Write three words that describe the leader you want to be.'),inp,
      h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'Remember the course\'s view: a good leader shows the right traits and skills, exhibits appropriate behaviours, and adapts to the situation in which they are leading.')));
    root.appendChild(h('div',{class:'row'},h('button',{class:'btn primary',onclick:function(){var w=S.words;S=fresh();S.words=w;S.phase='play';save();render()}},'Play again'),h('button',{class:'btn ghost',onclick:function(){S.phase='play';S.i=0;save();render()}},'Back to situation 1')));
  }

  function fit(){if(!root.isConnected){window.removeEventListener('resize',fit);return}root.classList.toggle('ls-w',el.clientWidth>=820)}
  window.addEventListener('resize',fit);
  function render(){root.innerHTML='';fit();root.appendChild(header());if(S.ref)root.appendChild(reference());
    if(S.phase==='intro')intro();else if(S.phase==='debrief')debrief();else{if(S.i<0||S.i>=SC.length)S.i=0;play()}}
  render();
}});
})();

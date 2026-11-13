/* Digital capability self-assessment - "Hybrid working: skills for digital transformation", Sections 1, 2 and 4.
   Mirrors the course frameworks exactly:
   - Section 1.1: the UK Essential Digital Skills Framework (Gov.uk, 2018) - foundation skills plus the five categories
     (communicating; handling information and content; transacting; problem solving; being safe and legal online),
     i.e. the six polls of Activity 3, with Table 1/Table 2 examples.
   - Section 2.1: the six elements of the Jisc individual digital capability framework (Table 4), with the OU's
     sub-capabilities from Table 5 as examples (incl. the OU's extra 'digital sustainability').
   - Section 2.1: Orlik's People / Places / Technology / Period for the development plan.
   - Section 4: Activity 10 confidence statements and the course's advice on confidence and curiosity.
   Tool id: digital-skills. Plain ES2017. State saved with ctx.save on every change. */
(function(){
var h=H.h;

var LEVELS=['Not yet','With help','On my own','Confident','Could teach others'];
var LEVEL_HINT=['I have not done this, or avoid it','I can do it if someone shows me or I follow guidance',
  'I can do the basics on my own','I do this confidently and choose the right tool for the job','I could support and develop others in this'];

/* ---------- framework data (from the course) ---------- */
var EDSF=[
 {id:'e-found',n:'Digital foundation skills',s:'Foundation',d:'The centre of Figure 1: the basics the other skills build on - using devices, hardware, software, operating systems and applications.',
  ex:['Set up and use a laptop, tablet or phone and connect it to the internet','Use a keyboard, touchscreen or voice to enter and find things','Open, save and find files and folders','Install, open and update apps and software'],
  act:['Spend 20 minutes a week on a Learn My Way basic computer skills topic','Ask a colleague to show me one feature of the device I use every day','Play with a tool with no instructions (like Activity 12, Draw a person) and note how I worked it out'],
  res:['Learn My Way - basic computer skills (within the HM Government Skills Toolkit), Activity 3','The Skills Toolkit (National Careers Service), Section 1.2','Activities 11-13: play, then reflect on how you felt, Section 4.2']},
 {id:'e-comm',n:'Communicating',s:'Communicating',d:'Communicate, collaborate and share online - effectively, depending on the "tools" and the "context" (Table 1).',
  ex:['Use email, instant messaging and virtual meetings (Table 2)','Choose the right tool for the message and the audience','Work on a shared document with others at the same time','Use social media / networking appropriately for work'],
  act:['Practise the features of our virtual meeting tool (sharing, chat, breakout rooms) with a colleague','Agree with my team which tool we use for which kind of message','Write my next update conversationally and ask a colleague if it is clear'],
  res:['The Skills Toolkit (National Careers Service), Section 1.2','Table 3 behaviours for hybrid working: empathy, communication, collaboration, Section 1.2','Reciprocal mentoring - learn from each other, Section 4']},
 {id:'e-info',n:'Handling information and content',s:'Information',d:'Find, manage and store digital information and content securely - and manage and store digital assets (Table 1).',
  ex:['Do web-based research and judge which sources are reliable','Save files to the correct, shared location - not on my desktop','Use clear file names and metadata so others can find my files','Enter and handle data, e.g. in a spreadsheet or form'],
  act:['Move my working files from my desktop to the correct shared location','Agree a file-naming convention with my team and apply it to this month\'s files','Learn how to find previous versions of a document in our cloud storage'],
  res:['Digital knowledge management basics: correct location, no local copies, back-ups, no duplicates, file names and metadata, Section 5.6','Information classification: unclassified, internal, confidential (Table 9), Section 5.6','Nicola Askham on data management (video), Section 5.6']},
 {id:'e-trans',n:'Transacting',s:'Transacting',d:'Apply for services, buy and sell, and manage transactions online - interacting with digital forms, systems and payments.',
  ex:['Complete online forms and applications','Buy and pay for things online safely','Use online services such as banking or booking systems','Use workplace systems, e.g. expenses, leave or room booking'],
  act:['Submit my next expenses or leave request through the online system without help, using the guidance','Set up secure online access to one service I still do on paper','Check a payment page is genuine before I pay (secure connection, expected address)'],
  res:['Learn My Way (Skills Toolkit), Activity 3','Essential Digital Skills Framework examples for transacting, Activity 3','Your organisation\'s guidance for its digital systems, Section 5']},
 {id:'e-prob',n:'Problem solving',s:'Problem solving',d:'Find solutions to problems using digital tools and online services - and use digital tools to help you find approaches.',
  ex:['Search help pages, forums or video tutorials to solve a problem','Try things out until I work out how a tool works','Use a digital tool to organise a task, e.g. a shared tracker','Know who to contact if I cannot access my systems or get online (Table 7)'],
  act:['Next time I am stuck, search for 10 minutes before asking - then ask and share what I learned','Find out and save who to contact when my systems fail','Explore one feature of a tool I use, with no instructions, and write down how I worked it out'],
  res:['Freerice - learn by exploring a tool with no guidance, Activity 11','Activity 13 How did you feel? - reflect on how you approach a new task, Section 4.2','"There are no stupid questions" - ask for help (Table 6), Section 4.1']},
 {id:'e-safe',n:'Being safe and legal online',s:'Safe and legal',d:'Be safe, legal and confident online: digital wellbeing, security, privacy and data protection, accessibility, policies, behaviour - and offline things like your desk set-up and not writing down your password.',
  ex:['Use strong passwords and multi-factor authentication (MFA)','Recognise spam or suspicious emails and know what to do','Handle personal data in line with GDPR and my organisation\'s policies','Check permission before using other people\'s content (copyright)'],
  act:['Set up MFA on every work account that offers it','Check my passwords against my organisation\'s guidance and change any weak ones','Complete (or book) my annual GDPR / information-security training'],
  res:['National Cyber Security Centre - top tips for staying secure online, Activity 14','Learn My Way - introduction to online safety, Activity 14','"How Secure Is My Password?" checker, Activity 14','OpenLearn: Introduction to cyber security, Activity 18']}
];
var JISC=[
 {id:'j-prof',n:'Digital proficiency and productivity',s:'Proficiency',tag:'functional skills',d:'Using technology (ICT proficiency): using ICT-based tools, devices, applications, software and services confidently.',
  ex:['I use ICT-based tools, devices, applications and services confidently','I choose the right tool for the job','I save, organise and back up my work so nothing is lost if a device fails','I keep my devices and software updated'],
  act:['Use the Jisc Discovery Tool (or the Digital Competence Wheel) for a detailed self-assessment','List the five tools I use most and learn one new feature in each','Check my files are on the server / in the cloud, not only on my laptop'],
  res:['Jisc Discovery Tool (if your organisation is a Jisc member), Activity 6','The Digital Competence Wheel (if not), Activity 6','The DigiCentre (University of Wales Trinity Saint David), Activity 7']},
 {id:'j-info',n:'Information, data and media literacies',s:'Information',tag:'critical use',d:'Finding, evaluating, managing and sharing information; using data to inform decisions; and evaluating and repurposing media.',
  ex:['I find, evaluate, manage, curate, organise and ethically share digital information (information literacy)','I use data to inform decisions - I interpret it and keep it safe (data literacy)','I evaluate and respond to messages in text, graphics, video and audio, crediting creators when I reuse them (media literacy)','I know how my information is classified and who may see it'],
  act:['Run the GitLab SAFE questions before I share my next report','Classify the documents in my main folder as unclassified, internal or confidential','Credit the creator and check the conditions of use for every third-party image I reuse'],
  res:['GitLab SAFE framework (Figure 7), Activity 16','Information classification (Table 9), Section 5.6','ICO information security guidance, Activity 18','Your organisation\'s copyright guidance (e.g. UWTSD Copyright Hub), Activity 17']},
 {id:'j-create',n:'Digital creation, problem solving and innovation',s:'Creation',tag:'creative production',d:'Creating digital materials, using digital evidence to solve problems, and adopting new digital practices.',
  ex:['I create and design new digital materials, e.g. audio, video, web pages (digital creation)','I collect, collate, share and evaluate digital evidence to solve problems (digital research and problem solving)','I adopt and develop new digital practices in different settings (digital innovation)','I plan media and flag third-party content early when I create resources'],
  act:['Make a short audio or video explainer for one process in my team','Try one new digital practice in a meeting (e.g. a live poll) and ask for feedback','Collect data on a recurring problem before proposing a digital fix'],
  res:['Sas Amoah on skills for content creation (video), Activity 4','Guidance for course authors: plan media early, flag third-party content early (Table 6), Section 4.1','Activity 12 Draw a person - try a tool you have not used before, Section 4.2']},
 {id:'j-comm',n:'Digital communication, collaboration and participation',s:'Communication',tag:'participation',d:'Communicating appropriately, collaborating in digital teams and taking part in digital networks.',
  ex:['I communicate effectively, appropriately and respectfully in digital spaces','I collaborate in digital teams and understand the features of different collaboration tools and the norms for working together','I participate in, facilitate and build digital networks','I behave safely and ethically in networked environments'],
  act:['Facilitate one online meeting using the collaboration features of our tool','Join or set up a professional network or community related to my role','Agree team norms for online collaboration (response times, channels, cameras)'],
  res:['Table 3 behaviours: empathy, psychological safety and trust, collaboration, transparency, Section 1.2','Reciprocal mentoring, Section 4','Case study: fostering a healthy digital culture, Section 4.1']},
 {id:'j-learn',n:'Digital learning and development',s:'Learning',tag:'development',d:'Taking part in and benefiting from digital learning - and supporting and developing others in digital settings.',
  ex:['I participate in and benefit from digital learning opportunities (digital learning)','I support and develop others to learn in digital settings (digital teaching)','I learn informally - by asking, playing and learning from failure','I share what I know with my team'],
  act:['Complete one short online course this term (e.g. an OpenLearn course)','Start a reciprocal mentoring pair with someone who has different digital skills','Show a colleague one thing I can do well in a tool we both use'],
  res:['The DigiCentre - a one-stop shop for digital skills, Activity 7','Freerice Digital Skills group - learning, play and a wider purpose, Section 4.2','OpenLearn: Hybrid working collection and Introduction to cyber security, Sections 5.1 and 5.5']},
 {id:'j-id',n:'Digital identity and wellbeing',s:'Identity',tag:'self-actualising',d:'Managing your digital identity and reputation; looking after your health, safety, relationships and work-life balance; and (OU addition) working sustainably.',
  ex:['I develop a positive digital identity and manage my digital reputation','I look after my health, safety, relationships and work-life balance in digital settings','I act safely and responsibly in digital environments','I work in a more digitally sustainable way (OU addition - not part of the Jisc framework)'],
  act:['Review my online profiles so they present me as I want to be seen professionally','Set boundaries for messages outside working hours and tell my team','Clear out old files and emails and turn off devices I am not using'],
  res:['Jisc digital wellbeing model, Section 5.1','OpenLearn: Hybrid working: wellbeing and inclusion, Section 5.1','Jisc report: Exploring digital carbon footprints, Section 6.1']}
];
var ALL=EDSF.concat(JISC);
function area(id){return ALL.filter(function(a){return a.id===id})[0]}
var MIND=[
 {q:'I am happy to try new things.',lo:'New tools can feel bewildering or scary. Building capability is not only formal training - playing with tools and being comfortable learning from failure count too.',hi:'Good - an openness to try things helps you push the limits of what can be done.'},
 {q:'I will work out solutions.',lo:'Try searching or playing for a short while first, then ask. Learning from others is an essential part of developing your capabilities.',hi:'Good - you are willing to work things out. Share what you learn so others benefit too.'},
 {q:'I don\'t mind not knowing how to do something.',lo:'If you are curious and not afraid to admit you don\'t know, most people are happy to show you - and it builds a culture of trust.',hi:'Good - admitting you don\'t know is how teams build trust and confidence.'}];
var AGREE=['Strongly disagree','Disagree','Not sure','Agree','Strongly agree'];
var PERIODS=['2 weeks','1 month','3 months','6 months'];
var PLACES=['At work','At home','Both'];

/* ---------- helpers ---------- */
function words(s){s=String(s||'').trim();return s?s.split(/\s+/).length:0}
function blank(){return {tab:0,cur:[0,0],r:{},mind:[-1,-1,-1],plan:{},ai:'',done:false}}
function norm(S){var b=blank();for(var k in b)if(S[k]==null)S[k]=b[k];return S}
function rec(S,id){if(!S.r[id])S.r[id]={now:null,need:null,ex:{}};return S.r[id]}
function rated(S,id){var r=S.r[id];return !!(r&&r.now!=null)}
function needOf(S,id){var r=S.r[id];return r&&r.need!=null?r.need:(r&&r.now!=null?r.now:null)}
function gap(S,id){var r=S.r[id];if(!r||r.now==null)return 0;return Math.max(0,needOf(S,id)-r.now)}
function nTicks(S,id){var r=S.r[id];if(!r)return 0;return Object.keys(r.ex).filter(function(k){return r.ex[k]}).length}
function calib(S,a){
  var r=S.r[a.id];if(!r||r.now==null)return null;var t=nTicks(S,a.id),n=a.ex.length;
  if(r.now>=3&&t<Math.ceil(n/2))return {k:'over',m:'You rated yourself '+LEVELS[r.now].toLowerCase()+' but ticked only '+t+' of '+n+' examples. Check the examples again - or lower your rating so your plan targets the right things.'};
  if(r.now<=1&&t>=n-1)return {k:'under',m:'You ticked '+t+' of '+n+' examples but rated yourself "'+LEVELS[r.now].toLowerCase()+'". You may be underrating yourself - lower confidence is common, and the course suggests building it by trying things out and learning from others.'};
  return {k:'ok',m:'Your rating and the examples you ticked are consistent.'};
}
function priorities(S){
  return ALL.filter(function(a){return rated(S,a.id)&&gap(S,a.id)>0}).sort(function(x,y){return gap(S,y.id)-gap(S,x.id)||needOf(S,y.id)-needOf(S,x.id)});
}
function strengths(S){return ALL.filter(function(a){return rated(S,a.id)&&S.r[a.id].now>=3&&gap(S,a.id)===0})}
function planIds(S){return Object.keys(S.plan).filter(function(k){return S.plan[k]&&S.plan[k].on&&area(k)})}
function planItem(S,id){if(!S.plan[id])S.plan[id]={on:false,act:'',people:'',place:'',tech:'',period:''};return S.plan[id]}
function planChecks(p){
  return [['Action',words(p.act)>=4,'Write a specific action of at least four words.'],
          ['People',words(p.people)>=1,'Who can help - a colleague, a mentor, a team?'],
          ['Places',!!p.place,'Where will you use the skill?'],
          ['Technology',words(p.tech)>=1,'Which tool or system?'],
          ['Period',!!p.period,'By when?']];
}
function planOk(p){return planChecks(p).every(function(c){return c[1]})}
function copyText(text,ctx,msg){
  function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();ctx.toast(ok?msg:'Select the text and copy it manually')}
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){ctx.toast(msg)},fb);else fb()}catch(e){fb()}}
function summary(S){
  var st=strengths(S).map(function(a){return a.n.toLowerCase()}),pr=priorities(S).slice(0,3).map(function(a){return a.n.toLowerCase()});
  var nr=ALL.filter(function(a){return rated(S,a.id)}).length;
  if(!nr)return '';
  var avg=function(list){var r=list.filter(function(a){return rated(S,a.id)});if(!r.length)return null;return r.reduce(function(s,a){return s+S.r[a.id].now},0)/r.length};
  var e=avg(EDSF),j=avg(JISC),t=[];
  if(e!=null)t.push('Against the Essential Digital Skills Framework my average level is '+e.toFixed(1)+' of 4 ('+LEVELS[Math.round(e)].toLowerCase()+').');
  if(j!=null)t.push('Against the six Jisc elements it is '+j.toFixed(1)+' of 4.');
  t.push(st.length?'My strengths are '+st.slice(0,4).join('; ')+'.':'I have not yet rated any area as confident and matching what my role needs.');
  t.push(pr.length?'The areas I most want to develop are '+pr.join('; ')+'.':'My current levels meet what I said my role needs; next I could support others.');
  var m=S.mind.filter(function(x){return x>=0});
  if(m.length===3){var mm=m.reduce(function(a,b){return a+b},0)/3;t.push(mm>=3?'I feel confident and curious about trying new digital tools.':mm>=2?'I am fairly open to trying new tools but sometimes hold back.':'I find new digital tools daunting, so I will build confidence through play and asking others.')}
  return t.join(' ');
}
function plain(S){
  var L=['MY DIGITAL CAPABILITY PROFILE','',summary(S),'','ESSENTIAL DIGITAL SKILLS (now / needed, 0-4)'];
  EDSF.forEach(function(a){var r=S.r[a.id];L.push('- '+a.n+': '+(r&&r.now!=null?r.now+' / '+needOf(S,a.id):'not rated'))});
  L.push('','JISC SIX ELEMENTS (now / needed, 0-4)');
  JISC.forEach(function(a){var r=S.r[a.id];L.push('- '+a.n+': '+(r&&r.now!=null?r.now+' / '+needOf(S,a.id):'not rated'))});
  L.push('','DEVELOPMENT PLAN');
  var ids=planIds(S);if(!ids.length)L.push('- none yet');
  ids.forEach(function(id){var p=S.plan[id];L.push('* '+area(id).n,'  Action: '+(p.act||'-'),'  People: '+(p.people||'-')+' | Places: '+(p.place||'-')+' | Technology: '+(p.tech||'-')+' | Period: '+(p.period||'-'))});
  return L.join('\n');
}

/* ---------- styles ---------- */
var CSS=[
'.ds-tabs{display:flex;gap:6px;overflow-x:auto;margin:0 0 14px;scrollbar-width:none}',
'.ds-tab{flex:0 0 auto;border:0;border-radius:999px;min-height:44px;padding:8px 16px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;display:flex;align-items:center;gap:8px}',
'.ds-tab.on{background:var(--ink);color:var(--bg)}',
'.ds-tab small{font-size:.66rem;opacity:.8}',
'.ds-areas{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}',
'.ds-ap{border:1.5px solid var(--line);background:var(--surface);border-radius:999px;min-height:44px;min-width:44px;padding:6px 12px;cursor:pointer;font-size:.82rem;display:flex;align-items:center;gap:6px;color:var(--ink)}',
'.ds-ap.on{border-color:var(--ink);background:var(--ink);color:var(--bg)}',
'.ds-ap i{width:8px;height:8px;border-radius:50%;background:var(--dot);display:inline-block;flex:none}',
'.ds-ap i.ok{background:var(--green)}',
'.ds-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}',
'.ds-tagp{font-family:var(--mono);font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;border:1.5px dotted var(--ink3);border-radius:999px;padding:3px 10px;color:var(--ink2);white-space:nowrap}',
'.ds-ex{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);padding:10px 12px;margin:0 0 8px;cursor:pointer;min-height:44px;font:inherit;color:inherit;font-size:.93rem;line-height:1.35}',
'.ds-ex.on{border-color:var(--ink);background:var(--surface2)}',
'.ds-box{flex:none;width:22px;height:22px;border-radius:6px;border:1.5px solid var(--ink3);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;margin-top:1px}',
'.ds-ex.on .ds-box{background:var(--ink);border-color:var(--ink);color:var(--bg)}',
'.ds-sl{margin:6px 0 4px}',
'.ds-sl .row{justify-content:space-between}',
'.ds-range{width:100%;height:44px;accent-color:var(--ink);margin:0}',
'.ds-range.need{accent-color:var(--red)}',
'.ds-lv{font-weight:500}',
'.ds-ticks{display:flex;justify-content:space-between;font-family:var(--mono);font-size:.6rem;color:var(--ink3);padding:0 6px;margin-top:-6px}',
'.ds-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
'@media(max-width:640px){.ds-two{grid-template-columns:1fr}}',
'.ds-nav{display:flex;justify-content:space-between;gap:10px;margin-top:12px;flex-wrap:wrap}',
'.ds-radar{width:100%;max-width:420px;height:auto;display:block;margin:0 auto}',
'.ds-legend{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:.8rem;color:var(--ink2);margin-top:4px}',
'.ds-legend span{display:inline-flex;align-items:center;gap:6px}',
'.ds-sw{width:18px;height:0;border-top:3px solid var(--ink);display:inline-block}',
'.ds-sw.need{border-top:2px dashed var(--red)}',
'.ds-bars .b{display:grid;grid-template-columns:minmax(0,9.5em) 1fr 3.2em;gap:10px;align-items:center;padding:6px 0;font-size:.88rem}',
'@media(max-width:420px){.ds-bars .b{grid-template-columns:minmax(0,7em) 1fr 3em;font-size:.8rem}}',
'.ds-track{position:relative;height:14px;border-radius:99px;background:var(--surface2);background-image:radial-gradient(var(--dot) 1px,transparent 1.2px);background-size:8px 8px}',
'.ds-fill{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:var(--ink)}',
'.ds-need{position:absolute;top:-4px;bottom:-4px;width:3px;margin-left:-1.5px;background:var(--red);border-radius:2px}',
'.ds-num{font-family:var(--mono);font-size:.78rem;text-align:right;color:var(--ink2)}',
'.ds-li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line);font-size:.92rem}',
'.ds-li:last-child{border-bottom:0}',
'.ds-mk{flex:none;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;border:1.5px solid var(--dot)}',
'.ds-mk.g{background:var(--green);border-color:var(--green);color:#fff}.ds-mk.r{border-color:var(--red);color:var(--red)}',
'.ds-seg{display:flex;flex-wrap:wrap;gap:6px}',
'.ds-seg button{border:1.5px solid var(--line);background:var(--surface);border-radius:999px;min-height:44px;padding:6px 12px;cursor:pointer;font-size:.82rem;color:var(--ink)}',
'.ds-seg button.on{background:var(--ink);border-color:var(--ink);color:var(--bg)}',
'.ds-pi{border:1.5px solid var(--line);border-radius:var(--r-md);padding:14px;margin:0 0 12px;background:var(--surface)}',
'.ds-pi.done{border-color:var(--green)}',
'.ds-f{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}',
'@media(max-width:560px){.ds-f{grid-template-columns:1fr}}',
'.ds-sug{display:block;width:100%;text-align:left;border:1px dashed var(--ink3);background:transparent;border-radius:var(--r-sm);padding:8px 12px;margin:0 0 6px;cursor:pointer;min-height:44px;font:inherit;font-size:.88rem;color:var(--ink)}',
'.ds-sug.on{border-style:solid;border-color:var(--ink);background:var(--surface2)}',
'.ds-res{margin:6px 0 0;padding-left:18px;font-size:.86rem;color:var(--ink2)}',
'.ds-res li{margin:3px 0}',
'.ds-ck{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
'.ds-ck span{font-family:var(--mono);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:3px 9px;border:1.5px solid var(--dot);color:var(--ink3)}',
'.ds-ck span.ok{border-color:var(--green);color:var(--green)}'
].join('\n');

/* ---------- radar ---------- */
function radar(S){
  var NS='http://www.w3.org/2000/svg',R=105,n=JISC.length;
  function el(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
  function pt(i,v){var ang=-Math.PI/2+i*2*Math.PI/n,r=R*v/4;return [r*Math.cos(ang),r*Math.sin(ang)]}
  var svg=el('svg',{viewBox:'-205 -150 410 300',class:'ds-radar',role:'img','aria-label':'Radar chart of your ratings for the six Jisc elements'});
  for(var l=1;l<=4;l++){var ps=[];for(var i=0;i<n;i++)ps.push(pt(i,l).join(','));
    svg.appendChild(el('polygon',{points:ps.join(' '),fill:'none',stroke:'var(--dot)','stroke-width':l===4?1.5:1,'stroke-dasharray':l===4?'':'2 4'}))}
  JISC.forEach(function(a,i){var p=pt(i,4);svg.appendChild(el('line',{x1:0,y1:0,x2:p[0],y2:p[1],stroke:'var(--line)','stroke-width':1}));
    var q=pt(i,4.75),t=el('text',{x:q[0],y:q[1]+4,'text-anchor':Math.abs(q[0])<10?'middle':q[0]>0?'start':'end','font-size':'12','font-family':'var(--mono)',fill:'var(--ink2)'});
    t.textContent=a.s.toUpperCase();svg.appendChild(t)});
  function poly(key,attrs){var ps=[],ok=true;JISC.forEach(function(a,i){var v=key==='now'?(rated(S,a.id)?S.r[a.id].now:0):(needOf(S,a.id)||0);ps.push(pt(i,v).join(','))});
    svg.appendChild(el('polygon',Object.assign({points:ps.join(' ')},attrs)))}
  poly('need',{fill:'none',stroke:'var(--red)','stroke-width':2,'stroke-dasharray':'6 4'});
  poly('now',{fill:'var(--ink)','fill-opacity':.12,stroke:'var(--ink)','stroke-width':2.5});
  JISC.forEach(function(a,i){if(!rated(S,a.id))return;var p=pt(i,S.r[a.id].now);svg.appendChild(el('circle',{cx:p[0],cy:p[1],r:4.5,fill:'var(--ink)'}))});
  return svg;
}

/* ---------- mount ---------- */
Tools.register('digital-skills',{title:'Digital capability self-assessment',desc:'Rate yourself against the Essential Digital Skills Framework and the six Jisc elements, see your profile and plan your development.',
mount:function(el,ctx){
  if(!document.getElementById('ds-css')){var st=document.createElement('style');st.id='ds-css';st.textContent=CSS;document.head.appendChild(st)}
  var S=norm(ctx.load()||blank());
  var ui={aiBusy:false,aiTok:'',confirm:''};
  function save(){ctx.save(S)}
  function nRated(list){return list.filter(function(a){return rated(S,a.id)}).length}
  function maybeDone(){if(S.done)return;var ok=planIds(S).filter(function(id){return planOk(S.plan[id])}).length;
    if(nRated(ALL)>=ALL.length-2&&ok>=1){S.done=true;save();ctx.complete(Math.min(1,Math.round(nRated(ALL)/ALL.length*100)/100))}}
  function go(t){S.tab=t;save();render();var x=el.querySelector('.ds-tabs');if(x&&x.getBoundingClientRect().top<0)x.scrollIntoView({block:'start'})}

  /* --- rating screen (shared by both frameworks) --- */
  function rateScreen(fw){
    var list=fw===0?EDSF:JISC,i=Math.min(S.cur[fw],list.length-1),a=list[i],r=rec(S,a.id),w=h('div');
    w.appendChild(h('p',{class:'muted',style:{fontSize:'.93rem',margin:'0 0 10px'}},fw===0?
      'Section 1.1 / Activity 3: the Essential Digital Skills Framework sets out the skills all adults need to interact in a digital world - foundation skills plus five categories. Tick what you can do, then rate yourself.':
      'Section 2.1 / Activity 6: the six elements of the Jisc individual digital capability framework. The examples are the OU\'s own capabilities (Table 5). Tick what you do, then rate yourself.'));
    w.appendChild(h('div',{class:'ds-areas',role:'tablist','aria-label':'Areas'},list.map(function(x,k){
      return h('button',{class:'ds-ap'+(k===i?' on':''),role:'tab','aria-selected':k===i?'true':'false',onclick:function(){S.cur[fw]=k;save();render()}},h('i',{class:rated(S,x.id)?'ok':''}),x.s)})));
    var card=h('div',{class:'card flat',style:{marginBottom:'10px'}});
    card.appendChild(h('div',{class:'ds-head'},h('h3',{style:{margin:0}},(i+1)+'. '+a.n),a.tag?h('span',{class:'ds-tagp'},a.tag):null));
    card.appendChild(h('p',{class:'muted',style:{fontSize:'.92rem',margin:'6px 0 12px'}},a.d));
    card.appendChild(h('span',{class:'label'},'I can... (tap all that apply)'));
    var exBox=h('div',{style:{marginTop:'8px'}});
    a.ex.forEach(function(t,k){var on=!!r.ex[k];
      exBox.appendChild(h('button',{class:'ds-ex'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){r.ex[k]=!r.ex[k];save();render()}},h('span',{class:'ds-box'},on?'✓':''),h('span',null,t)))});
    card.appendChild(exBox);
    w.appendChild(card);
    function slider(key,label,cls){
      var v=r[key],shown=v==null?(key==='need'&&r.now!=null?r.now:2):v;
      var lv=h('span',{class:'ds-lv'},v==null?'Not rated':shown+' - '+LEVELS[shown]);
      var hint=h('div',{class:'tiny muted'},v==null?'Move the slider to rate.':LEVEL_HINT[shown]);
      var inp=h('input',{type:'range',min:0,max:4,step:1,value:shown,class:'ds-range '+(cls||''),'aria-label':label+': '+a.n});
      inp.addEventListener('input',function(){r[key]=+inp.value;if(key==='now'&&r.need==null)r.need=r.now;lv.textContent=r[key]+' - '+LEVELS[r[key]];hint.textContent=LEVEL_HINT[r[key]];save();fb()});
      inp.addEventListener('change',function(){render();maybeDone()});
      return h('div',{class:'ds-sl'},h('div',{class:'row'},h('span',{class:'label'},label),lv),inp,h('div',{class:'ds-ticks'},[0,1,2,3,4].map(function(n){return h('span',null,n)})),hint);
    }
    var fbox=h('div');
    function fb(){fbox.innerHTML='';var c=calib(S,a);if(!c)return;
      var g=gap(S,a.id);
      fbox.appendChild(h('div',{class:'callout '+(c.k==='ok'?'tip':''),style:{marginTop:'10px'}},
        h('div',null,c.m),
        h('div',{style:{marginTop:'6px'}},g>0?h('b',null,'Gap of '+g+' level'+(g>1?'s':'')+' - this goes into your development plan.'):h('span',null,r.now>=3?'No gap - a strength you could share with others.':'No gap for your role right now.'))));
    }
    w.appendChild(h('div',{class:'ds-two'},slider('now','My level now'),slider('need','Level my role needs','need')));
    fb();w.appendChild(fbox);
    var last=i===list.length-1;
    w.appendChild(h('div',{class:'ds-nav'},
      i>0?h('button',{class:'btn ghost',onclick:function(){S.cur[fw]=i-1;save();render()}},'Previous area'):h('span'),
      last?h('button',{class:'btn primary',onclick:function(){go(fw===0?1:2)}},fw===0?'Next: Jisc six elements':'See my profile')
          :h('button',{class:'btn primary',onclick:function(){S.cur[fw]=i+1;save();render()}},'Next area')));
    w.appendChild(h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},nRated(list)+' of '+list.length+' areas rated. "Level my role needs" is your target: think about your role and your personal life, as Activity 6 asks.'));
    return w;
  }

  /* --- profile --- */
  function profile(){
    var w=h('div');
    if(!nRated(ALL)){w.appendChild(h('div',{class:'callout note'},'Rate at least one area first. Start with the Essentials tab.'));
      w.appendChild(h('button',{class:'btn primary',onclick:function(){go(0)}},'Start rating'));return w}
    var top=h('div',{class:'ds-two'});
    var rc=h('div',{class:'card flat',style:{marginBottom:0}},h('span',{class:'label'},'Jisc six elements'),radar(S),
      h('div',{class:'ds-legend'},h('span',null,h('i',{class:'ds-sw'}),'Now'),h('span',null,h('i',{class:'ds-sw need'}),'Role needs')),
      nRated(JISC)<JISC.length?h('p',{class:'tiny muted',style:{margin:'6px 0 0',textAlign:'center'}},(JISC.length-nRated(JISC))+' element(s) not rated yet - shown at 0.'):null);
    var bc=h('div',{class:'card flat',style:{marginBottom:0}},h('span',{class:'label'},'Essential Digital Skills'));
    var bars=h('div',{class:'ds-bars',style:{marginTop:'8px'}});
    EDSF.forEach(function(a){var r=S.r[a.id],ok=rated(S,a.id);
      bars.appendChild(h('div',{class:'b'},h('span',null,a.s),h('div',{class:'ds-track'},ok?h('i',{class:'ds-fill',style:{width:(r.now/4*100)+'%'}}):null,ok?h('i',{class:'ds-need',style:{left:(needOf(S,a.id)/4*100)+'%'}}):null),
        h('span',{class:'ds-num'},ok?r.now+'/'+needOf(S,a.id):'-')))});
    bc.appendChild(bars);
    bc.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'Black bar = now, red mark = what your role needs.'));
    top.appendChild(rc);top.appendChild(bc);w.appendChild(top);
    // strengths and gaps
    var sg=h('div',{class:'ds-two',style:{marginTop:'14px'}});
    var st=strengths(S),pr=priorities(S);
    var sC=h('div',{class:'card',style:{marginBottom:0}},h('span',{class:'label'},'Strengths ('+st.length+')'));
    if(!st.length)sC.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'No area is yet rated confident (3+) and meeting your role\'s needs.'));
    st.forEach(function(a){sC.appendChild(h('div',{class:'ds-li'},h('span',{class:'ds-mk g'},'✓'),h('div',null,h('b',null,a.n),h('div',{class:'tiny muted'},'Now '+S.r[a.id].now+' - share it: show a colleague or try reciprocal mentoring.'))))});
    var gC=h('div',{class:'card',style:{marginBottom:0}},h('span',{class:'label'},'Gaps, biggest first ('+pr.length+')'));
    if(!pr.length)gC.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'No gaps between your level and what your role needs. Raise a target where you want to stretch yourself.'));
    pr.forEach(function(a){var g=gap(S,a.id);gC.appendChild(h('div',{class:'ds-li'},h('span',{class:'ds-mk r'},'+'+g),h('div',null,h('b',null,a.n),h('div',{class:'tiny muted'},'Now '+S.r[a.id].now+', needs '+needOf(S,a.id)+'. '+(EDSF.indexOf(a)>=0?'Essential skill':'Jisc element')))))});
    var mis=ALL.filter(function(a){var c=calib(S,a);return c&&c.k!=='ok'});
    sg.appendChild(sC);sg.appendChild(gC);w.appendChild(sg);
    if(mis.length)w.appendChild(h('div',{class:'callout',style:{marginTop:'14px'}},h('b',null,'Check your ratings: '),mis.map(function(a){return a.s+' ('+(calib(S,a).k==='over'?'possibly over-rated':'possibly under-rated')+')'}).join(', ')+'. Your ticked examples do not match the level you chose.'));
    // mindset - Activity 10
    var md=h('div',{class:'card',style:{marginTop:'14px'}},h('span',{class:'label'},'Confidence and curiosity (Activity 10)'),
      h('p',{class:'tiny muted',style:{margin:'6px 0 10px'}},'Section 4: building capability is also about mindset. How much do you agree?'));
    MIND.forEach(function(m,k){var v=S.mind[k];
      md.appendChild(h('div',{style:{margin:'0 0 12px'}},h('b',{style:{display:'block',marginBottom:'6px'}},m.q),
        h('div',{class:'ds-seg',role:'group','aria-label':m.q},AGREE.map(function(t,n){return h('button',{class:v===n?'on':'','aria-pressed':v===n?'true':'false',onclick:function(){S.mind[k]=n;save();render()}},t)})),
        v>=0?h('div',{class:'tiny '+(v>=3?'ok':'muted'),style:{marginTop:'6px'}},v>=3?m.hi:m.lo):null))});
    w.appendChild(md);
    var sm=summary(S);
    w.appendChild(h('div',{class:'card flat'},h('span',{class:'label'},'Your summary (Activity 6)'),h('p',{style:{margin:'8px 0 0',fontFamily:'var(--serif)'}},sm)));
    w.appendChild(h('div',{class:'ds-nav'},h('button',{class:'btn ghost',onclick:function(){go(1)}},'Back to ratings'),h('button',{class:'btn primary',onclick:function(){go(3)}},'Make my plan')));
    return w;
  }

  /* --- plan --- */
  function plan(){
    var w=h('div'),pr=priorities(S);
    w.appendChild(h('p',{class:'muted',style:{fontSize:'.93rem',margin:'0 0 10px'}},'One size does not fit all. For each priority, define the four things Orlik (2018) recommends: the People, the Places (context), the Technology and the Period in which the skill is needed - and one concrete action.'));
    if(!pr.length&&!planIds(S).length){
      w.appendChild(h('div',{class:'callout note'},nRated(ALL)?'You have no gaps yet. Raise a "level my role needs" target, or add any area below to stretch yourself.':'Rate yourself first - your biggest gaps become suggested priorities here.'));
    }
    var pick=h('div',{class:'card flat'},h('span',{class:'label'},'Choose up to three priorities'),h('p',{class:'tiny muted',style:{margin:'4px 0 8px'}},pr.length?'Suggested first: your biggest gaps.':'Any area can go into your plan.'));
    var cand=pr.concat(ALL.filter(function(a){return pr.indexOf(a)<0&&S.plan[a.id]&&S.plan[a.id].on}));
    if(!cand.length)cand=ALL.slice();
    var chosen=planIds(S);
    pick.appendChild(h('div',{class:'ds-seg'},cand.map(function(a){var on=chosen.indexOf(a.id)>=0,g=gap(S,a.id);
      return h('button',{class:on?'on':'','aria-pressed':on?'true':'false',onclick:function(){var p=planItem(S,a.id);
        if(!on&&chosen.length>=3){ctx.toast('Three priorities at most - focus beats a long list');return}p.on=!on;save();render();maybeDone()}},a.n+(g?' (+'+g+')':''))})));
    if(pr.length&&cand.length<ALL.length){
      var more=h('details',{style:{marginTop:'8px'}},h('summary',{style:{cursor:'pointer',minHeight:'44px',display:'flex',alignItems:'center'}},h('span',{class:'label'},'Add another area')));
      more.appendChild(h('div',{class:'ds-seg'},ALL.filter(function(a){return cand.indexOf(a)<0}).map(function(a){return h('button',{onclick:function(){if(planIds(S).length>=3){ctx.toast('Three priorities at most');return}planItem(S,a.id).on=true;save();render()}},a.n)})));
      pick.appendChild(more);
    }
    w.appendChild(pick);
    chosen.forEach(function(id){
      var a=area(id),p=S.plan[id],box=h('div',{class:'ds-pi'+(planOk(p)?' done':'')});
      var r=S.r[id];
      box.appendChild(h('div',{class:'ds-head'},h('b',null,a.n),h('span',{class:'ds-tagp'},r&&r.now!=null?'now '+r.now+' → '+needOf(S,id):'not rated')));
      box.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'Action - tap a suggestion or write your own'));
      var ta=h('textarea',{class:'textarea',style:{minHeight:'84px',marginTop:'6px'},placeholder:'What exactly will you do?','aria-label':'Action for '+a.n});ta.value=p.act;
      var ck=h('div',{class:'ds-ck'});
      function drawCk(){ck.innerHTML='';planChecks(p).forEach(function(c){ck.appendChild(h('span',{class:c[1]?'ok':'',title:c[2]},(c[1]?'✓ ':'')+c[0]))});box.className='ds-pi'+(planOk(p)?' done':'')}
      var sugs=h('div',{style:{marginTop:'6px'}});
      a.act.forEach(function(s){sugs.appendChild(h('button',{class:'ds-sug'+(p.act===s?' on':''),onclick:function(){p.act=s;save();render();maybeDone()}},s))});
      box.appendChild(sugs);
      ta.addEventListener('input',function(){p.act=ta.value;save();drawCk();maybeDone()});box.appendChild(ta);
      function fld(key,label,ph){var e=h('input',{class:'input',value:p[key]||'',placeholder:ph,'aria-label':label+' for '+a.n});e.addEventListener('input',function(){p[key]=e.value;save();drawCk();maybeDone()});
        return h('div',null,h('span',{class:'label'},label),e)}
      function seg(key,label,opts){return h('div',null,h('span',{class:'label'},label),h('div',{class:'ds-seg',style:{marginTop:'4px'}},opts.map(function(o){return h('button',{class:p[key]===o?'on':'','aria-pressed':p[key]===o?'true':'false',onclick:function(){p[key]=p[key]===o?'':o;save();render();maybeDone()}},o)})))}
      box.appendChild(h('div',{class:'ds-f'},fld('people','People - who will help?','e.g. my line manager, a reciprocal mentor'),fld('tech','Technology - which tool?','e.g. Teams, SharePoint, Moodle'),seg('place','Places',PLACES),seg('period','Period - by when?',PERIODS)));
      box.appendChild(h('div',{class:'label',style:{marginTop:'12px'}},'Resources from the course'));
      box.appendChild(h('ul',{class:'ds-res'},a.res.map(function(x){return h('li',null,x)})));
      drawCk();box.appendChild(ck);
      w.appendChild(box);
    });
    // AI / rules coaching
    var out=h('div');
    function rulesCoach(){
      var ids=planIds(S),tips=[];
      ids.forEach(function(id){var p=S.plan[id],miss=planChecks(p).filter(function(c){return !c[1]});if(miss.length)tips.push('- '+area(id).s+': '+miss.map(function(c){return c[2]}).join(' '))});
      if(!ids.length)tips.push('- Choose at least one priority from your biggest gaps.');
      var lowMind=S.mind.map(function(v,k){return v>=0&&v<3?MIND[k]:null}).filter(Boolean);
      if(lowMind.length)tips.push('- Confidence: '+lowMind[0].lo);
      var st=strengths(S);if(st.length)tips.push('- Share your strength in '+st[0].n.toLowerCase()+' with a colleague: supporting others builds a culture of sharing and trust.');
      if(tips.length<3)tips.push('- Save your work in the correct place: most things are then retrievable, which makes it safe to experiment.');
      return '[rules] '+tips.slice(0,4).join('\n');
    }
    function drawAi(){out.innerHTML='';if(ui.aiBusy)out.appendChild(h('div',{class:'ai-box',role:'status'},h('span',{class:'label'},'AI coach'),ui.aiTok||'Thinking...'));
      else if(S.ai)out.appendChild(h('div',{class:'ai-box'},h('span',{class:'label'},S.ai.indexOf('[rules]')===0?'Plan check':'AI coach'),S.ai.replace(/^\[rules\]\s*/,'')))}
    var coach=h('div',{class:'card flat',style:{marginTop:'6px'}},h('span',{class:'label'},'Second opinion'));
    if(ctx.ai.available()){
      var ab=h('button',{class:'btn primary',onclick:function(){
        ui.aiBusy=true;ui.aiTok='';ab.disabled=true;drawAi();
        var pr2=priorities(S).slice(0,3).map(function(a){return a.n+' (now '+S.r[a.id].now+', needs '+needOf(S,a.id)+')'}).join('; ')||'none';
        var pl=planIds(S).map(function(id){var p=S.plan[id];return area(id).s+': '+(p.act||'no action')+' by '+(p.period||'?')}).join('; ')||'none';
        ctx.ai.ask({system:'You are a supportive digital skills coach at a university. Reply in plain text: exactly 3 short bullet points starting with "- ". Under 90 words. Be specific and practical. Encourage learning from others, playing with tools and learning from failure.',
          prompt:'Levels are 0-4.\nGaps: '+pr2+'\nStrengths: '+(strengths(S).map(function(a){return a.s}).join(', ')||'none')+'\nPlan: '+pl+'\n\nGive 3 bullet points of advice on this development plan.',
          maxTokens:180,temperature:0.3,onToken:function(t){ui.aiTok=t;drawAi()}})
        .then(function(t){ui.aiBusy=false;ab.disabled=false;t=String(t||'').trim();S.ai=t||rulesCoach();save();drawAi()})
        .catch(function(){ui.aiBusy=false;ab.disabled=false;S.ai=rulesCoach();save();drawAi();ctx.toast('AI unavailable - showing the rule-based check')})}},'Ask AI to review my plan');
      coach.appendChild(h('p',{class:'tiny muted',style:{margin:'6px 0 10px'}},'The on-device AI reads your gaps, strengths and plan.'));coach.appendChild(ab);
    } else {
      coach.appendChild(h('p',{class:'tiny muted',style:{margin:'6px 0 10px'}},'No AI model is loaded, so you get a rule-based check of your plan.'));
      coach.appendChild(h('button',{class:'btn primary',onclick:function(){S.ai=rulesCoach();save();drawAi()}},'Check my plan'));
    }
    w.appendChild(coach);drawAi();w.appendChild(out);
    w.appendChild(h('div',{class:'row',style:{marginTop:'12px'}},h('button',{class:'btn',onclick:function(){copyText(plain(S),ctx,'Profile and plan copied')}},'Copy profile and plan')));
    return w;
  }

  function toolbar(){
    if(ui.confirm)return h('div',{class:'callout',style:{marginTop:'16px'}},h('p',null,'Clear all ratings and your plan?'),h('div',{class:'row'},
      h('button',{class:'btn red',onclick:function(){S=blank();ui.confirm='';save();render()}},'Clear all'),h('button',{class:'btn ghost',onclick:function(){ui.confirm='';render()}},'Cancel')));
    return h('div',{class:'row',style:{marginTop:'16px',borderTop:'1px dotted var(--dot)',paddingTop:'12px'}},h('button',{class:'btn ghost sm',onclick:function(){ui.confirm='reset';render()}},'Reset'));
  }
  function render(){
    var hg=el.offsetHeight;el.style.minHeight=hg+'px';el.innerHTML='';
    var T=[['Essentials',nRated(EDSF)+'/6'],['Jisc six',nRated(JISC)+'/6'],['Profile',''],['Plan',planIds(S).length?planIds(S).length+'':'']];
    var tabs=h('div',{class:'ds-tabs',role:'tablist'},T.map(function(t,i){return h('button',{class:'ds-tab'+(S.tab===i?' on':''),role:'tab','aria-selected':S.tab===i?'true':'false',onclick:function(){go(i)}},(i+1)+' '+t[0],t[1]?h('small',null,t[1]):null)}));
    var body=S.tab<2?rateScreen(S.tab):S.tab===2?profile():plan();
    el.appendChild(h('div',{class:'tool'},tabs,body,toolbar()));
    el.style.minHeight='';
  }
  render();
}});
})();

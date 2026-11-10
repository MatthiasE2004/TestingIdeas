/* Personal Brand Builder - Personal branding for career success, Weeks 2-4.
   Mirrors the course frameworks: the Design Council's four cornerstones (big idea, values, vision, personality),
   Maitland's values research (behavioural vs operational, the FTSE top 10), strengths vs skills (Holloway's list),
   brand personality and colour (Figure 4), Blick's two-stage target audience process, the four positioning focuses,
   Sinek's Golden Circle (start with why), consistency, Week 4's three stages and 'My story' (Activity 6).
   Tool id: brand-builder. Plain ES2017. State saved with ctx.save on every change. */
(function(){
var h=H.h;

/* ---------- course data ---------- */
var FTSE=['Integrity','Respect','Innovation','Safety','Transparency','Excellence','Team work','Honesty','Trust','Responsibility'];
// b = behavioural trait, o = operational / strategic characteristic (Week 2: aim for a mix)
var VALUES=[
 ['Integrity','b'],['Respect','b'],['Innovation','o'],['Safety','o'],['Transparency','b'],['Excellence','o'],['Team work','b'],['Honesty','b'],['Trust','b'],['Responsibility','b'],
 ['Freedom','b'],['Compassion','b'],['Individuality','b'],['Equality','b'],['Justice','b'],['Humility','b'],['Independence','b'],['Creativity','o'],['Concern for others','b'],
 ['Accountability','b'],['Family','b'],['Learning','o'],['Problem solving','o'],['Strategic thinking','o'],['Quality','o'],['Collaboration','o'],['Diversity and inclusion','b'],
 ['Efficiency','o'],['Curiosity','b'],['Making a difference','b']];
var STRENGTHS=['Telling engaging stories','Extracting key points','Creating order from chaos','Never ever give up','Never miss a deadline','Create harmony in a team',
 'Researching new concepts','Effortlessly funny','Unfaltering focus','Up to the minute knowledge','Ultra-calm in a crisis','Intuitive empathy','Technologically savvy',
 'Nurturing a network','Stress-testing ideas','Communicating with others','Organising things','Being creative','Writing concise reports'];
var TRAITS=['Efficient','Business-like','Friendly','Chatty','Humorous','Irreverent','Humble','Direct','Charming','Passionate','Kind','Thoughtful','Empathetic','Warm','Curious','Calm','Determined','Optimistic','Practical','Reliable','Shy','Energetic'];
var TONES=[['efficient','Efficient and business-like'],['friendly','Friendly and chatty'],['humorous','Humorous and irreverent']];
// Figure 4 colour infographic (Week 2, Activity 3)
var COLOURS=[
 {id:'red',n:'Red',hex:'#D71921',w:['passionate','active','bold','confidence','power']},
 {id:'pink',n:'Pink',hex:'#E37FA8',w:['love','respect','warmth','nurture']},
 {id:'purple',n:'Purple',hex:'#6C3C97',w:['creativity','original','individual','compassion']},
 {id:'navy',n:'Navy',hex:'#1D2E5C',w:['trust','loyalty','authority','success']},
 {id:'green',n:'Green',hex:'#3E8E52',w:['balance','growth','clarity','prosperity']},
 {id:'blue',n:'Blue',hex:'#2F7FD0',w:['spirit','control','determination','ambition']},
 {id:'orange',n:'Orange',hex:'#EE7A1E',w:['instinct','warmth','optimistic','social','freedom']}];
var GOALTYPES=[['context','A context','e.g. working with animals'],['status','A status','e.g. managing a team'],['location','A location','e.g. based overseas'],['open','Being open','e.g. attend a job fair, follow interesting people']];
var RESEARCH=[['online','Search for forums or blogs your audience belongs to or produces'],['pubs','Subscribe to publications your audience reads'],
 ['call','Call organisations: where do they advertise vacancies, what skills are they short of?'],['events','Find membership organisations, events or conferences you could attend']];
var FOCUS=[
 {id:'benefit',n:'The benefit',you:'Emphasise the benefits an employer gains from hiring you: the skills, knowledge and experience you bring.',ex:"Volvo: 'For life'"},
 {id:'consumer',n:'The consumer',you:'Treat the employer as your consumer and explain how you can make their life easier.',ex:"Sainsbury's: 'Live well for less'"},
 {id:'business',n:'How you do business',you:'Show how you work: your values and how they align with the organisation\'s.',ex:"Burger King: 'Have it your way'"},
 {id:'competition',n:'The competition',you:'Clarify how you are better than other candidates - without appearing mean or overly competitive, as that can backfire.',ex:"Avis: 'We're #2. We try harder'"}];

var EXAMPLE={ // based on the course's own example story (Week 4)
 values:[{n:'Concern for others',k:'b',ev:'Coaching a new colleague until she passed her probation'},{n:'Creativity',k:'o',ev:'Redesigning our student welcome pack - it won an internal award'},{n:'Independence',k:'b',ev:'Running a writing project on my own timetable while the children were small'}],
 strengths:[{n:'Communicating with others',en:true,ev:'Talking to students and staff at every level'},{n:'Telling engaging stories',en:true,ev:'Writing and editing copy that helps people be their best'},{n:'Writing concise reports',en:false,ev:''}],
 traits:['Kind','Thoughtful','Empathetic','Warm','Curious'],tone:'friendly',colour:'purple',colourWhy:'Creativity and compassion sum up how I want to work with people.',
 vision:'Within 5 years I want to be a successful freelance writer with clients across a range of organisations, using my writing to influence change and innovation.',years:5,stretch:4,
 goals:[{t:'Win three regular freelance writing clients in education',k:'context'},{t:'Set my own timetable around my children',k:'location'},{t:'Follow and comment on careers writers on LinkedIn',k:'open'}],
 know:'Over 20 years in higher education, with significant knowledge of the student experience and a particular interest in careers and employability.',
 aud:{who:'Universities and education charities that need student-facing writing',sector:'Higher education and education charities',type:'Careers and student services teams',where:'Within 50 miles of home, or remote',size:'Medium to large organisations',notes:'Careers teams post vacancies on a sector jobs board; two charities say they are short of copywriters.',res:{online:true,events:true}},
 focus:'consumer',posLine:'Student-facing writing that saves busy careers teams time.',benefit:'clear, warm writing that students actually read',
 old:'I work in student services at a university.',why:'I believe everyone deserves to understand the opportunities open to them.',how:'I use creativity and concern for others to turn complicated information into warm, clear writing.',what:'I write student-facing guides and web copy for education organisations.',
 statement:''};

/* ---------- helpers ---------- */
var STOP={'that':1,'this':1,'with':1,'from':1,'have':1,'they':1,'their':1,'them':1,'what':1,'when':1,'your':1,'into':1,'about':1,'which':1,'will':1,'would':1,'there':1,'been':1,'were':1,'more':1,'most':1,'also':1,'than':1,'then':1,'very':1,'just':1,'like':1,'want':1,'work':1,'working':1,'people':1,'make':1,'help':1,'being':1,'other':1,'others':1,'things':1,'every':1,'some':1};
function words(s){s=String(s||'').trim();return s?s.split(/\s+/).length:0}
function stem(w){return w.replace(/(ing|ed|es|s|ly|ity|ion)$/,'')}
function toks(s){return String(s||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/[\s-]+/).filter(function(w){return w.length>3&&!STOP[w]}).map(stem)}
function overlap(a,b){var m={};toks(a).forEach(function(w){m[w]=1});return toks(b).filter(function(w){return m[w]})}
function lc(s){s=String(s||'').trim();return s?s.charAt(0).toLowerCase()+s.slice(1):s}
function uc(s){s=String(s||'').trim();return s?s.charAt(0).toUpperCase()+s.slice(1):s}
function nodot(s){return String(s||'').trim().replace(/[.!\s]+$/,'')}
function clip(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s}
function listJoin(a){a=a.filter(Boolean);return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]}
function blank(){return {step:0,values:[],strengths:[],traits:[],tone:'',colour:'',colourWhy:'',vision:'',years:0,stretch:3,goals:[{t:'',k:''},{t:'',k:''},{t:'',k:''}],know:'',
  aud:{who:'',sector:'',type:'',where:'',size:'',notes:'',res:{}},focus:'',posLine:'',benefit:'',old:'',why:'',how:'',what:'',statement:'',aiText:'',done:false}}
function norm(S){var b=blank();for(var k in b)if(S[k]==null)S[k]=b[k];for(var a in b.aud)if(S.aud[a]==null)S.aud[a]=b.aud[a];
  while(S.goals.length<3)S.goals.push({t:'',k:''});return S}
function copyText(text,ctx,msg){
  function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();ctx.toast(ok?msg:'Select the text and copy it manually')}
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){ctx.toast(msg)},fb);else fb()}catch(e){fb()}}

/* ---------- consistency checks ---------- */
var PURPOSE=/\b(because|believe|belief|so that|matters?|care|cares|caring|purpose|love|passion\w*|want(s)? (to|everyone|people)|deserve\w*|help|helping|inspire\w*|mission|why)\b/i;
var JOBTITLE=/^\s*(i'?m|i am|i work|i'?ve been|my job|my role)\b/i;
var GENERIC=/\b(any(one|body| employer| company| job| organi[sz]ation)?|everyone|everybody|all employers|whoever|anywhere|not sure|don'?t know)\b/i;
var MEAN=/\b(better than (everyone|others|anyone|the rest)|unlike (most|other|the rest)|lazy|useless|incompetent|rubbish|worst)\b/i;
var PAST=/\b(i have been|i've been|i was|i worked|years of experience|my career so far|previously|used to)\b/i;

function allText(S){return [S.why,S.how,S.what,S.posLine,S.benefit,S.statement].join(' ')}
function checks(S){
  var vals=S.values,str=S.strengths,said=allText(S),out=[];
  function add(id,cs,label,why,ok,msg,step){out.push({id:id,cs:cs,l:label,w:why,ok:!!ok,msg:msg,step:step})}
  var nv=vals.length;
  add('vcount','Values','Three to five core values','Week 4: narrow your list down to between three and five core values. Companies typically keep to four or five.',
    nv>=3&&nv<=5,nv<3?'You have '+nv+'. Choose at least three that explain why your best moments felt good.':'You have '+nv+'. Narrow them down to the five that matter most.',0);
  var common=vals.filter(function(v){return FTSE.indexOf(v.n)>=0}).length;
  add('vgeneric','Values','Distinctive, not just the usual list','Maitland found the FTSE 100\'s top values are "universally desirable behaviours rather than distinctive" glimpses. If your brand is the same as everyone else\'s, how will you stand out?',
    nv>0&&common<nv,nv?'All your values are on the FTSE top-10 list. Keep the ones you mean, and add one that is more personal.':'Choose your values first.',0);
  var kinds={};vals.forEach(function(v){kinds[v.k]=1});
  add('vmix','Values','A mix of behavioural and operational','Employers value integrity and respect, but they also want your operationally useful characteristics, such as problem solving or strategic thinking.',
    kinds.b&&kinds.o,nv?(kinds.o?'All your values are operational. Add one about how you behave with people.':'All your values describe behaviour. Add an operational one (e.g. problem solving, creativity, quality).'):'Choose your values first.',0);
  var noEv=vals.filter(function(v){return words(v.ev)<4});
  add('vev','Values','Every value is backed by a real moment','Some companies do not live up to the values they claim. If you present yourself a certain way, make sure you can live up to that image - which also keeps your brand authentic.',
    nv&&!noEv.length,nv?'Add a moment for: '+noEv.map(function(v){return v.n}).join(', ')+'.':'Choose your values first.',0);
  var en=str.filter(function(s){return s.en});
  add('str','Big idea','Strengths that energise you','Strengths are innate and energise you; skills can be learned. Roles that use your strengths bring satisfaction - promote those.',
    en.length>=2,str.length?'Only '+en.length+' item(s) marked as energising. A brand built only on learned skills can feel draining.':'Add at least two strengths.',1);
  var nt=S.traits.length;
  add('pers','Personality','Three to five personality traits to showcase','You will not need to make up characteristics - they are your own - but you will need to choose which ones to highlight.',
    nt>=3&&nt<=5,nt<3?'Choose at least three traits.':'You have '+nt+'. Pick the three to five you most want people to notice.',2);
  add('vision','Vision','A vision with a timeframe, just out of reach','Brand vision is where you want to be at a point in the future (e.g. five years). It should be just out of reach, and re-evaluated as your career develops.',
    words(S.vision)>=8&&S.years>0&&S.stretch>=3&&S.stretch<=4,
    words(S.vision)<8?'Write your vision in a sentence or two.':!S.years?'Choose a timeframe.':S.stretch<3?'This sounds close to where you are now - stretch it a little further.':'This sounds very far away - is there a nearer step that is just out of reach?',3);
  var gl=S.goals.filter(function(g){return words(g.t)>=3});
  add('goals','Vision','Up to three concrete career goals','Week 4, Activity 5: what are your three most important career goals right now - and are they realistic given location, money or family?',
    gl.length>=1,'Write at least one career goal of three words or more.',3);
  var a=S.aud,narrow=['sector','type','where','size'].filter(function(k){return words(a[k])>=1}).length;
  add('aud','Audience','Target audience identified and narrowed','Blick, stage 1: the smaller the target group, the more manageable it is to reach. Failing to identify it risks generic messages that do not work.',
    words(a.who)>=3&&!GENERIC.test(a.who+' '+a.sector)&&narrow>=3,
    GENERIC.test(a.who+' '+a.sector)?'"Anyone" is not an audience. Who exactly?':'Describe who, then narrow it by at least three of: sector, type, location, size ('+narrow+' so far).',4);
  var nres=Object.keys(a.res||{}).filter(function(k){return a.res[k]}).length;
  add('res','Audience','Audience researched','Blick, stage 2: get to know your audience before you communicate. The more targeted and researched your application, the more likely an interview.',
    nres>=1&&words(a.notes)>=5,nres?'Note what you found out (at least a sentence).':'Pick at least one research method and note your findings.',4);
  add('pos','Positioning','A clear positioning','Positioning is designing your offering and image to occupy a distinctive place in the mind of your target market.',
    S.focus&&words(S.posLine)>=3&&words(S.benefit)>=3,!S.focus?'Choose one of the four focuses.':'Write your positioning line and the benefit your audience gets.',5);
  if(S.focus==='competition')add('mean','Positioning','Competitive without being mean','Clarify how you are better than competitors - without appearing mean or overly competitive, as that can backfire.',
    !MEAN.test(S.posLine+' '+S.benefit+' '+S.statement),'Some wording could sound like a put-down of others. Say what you do well instead.',5);
  add('why','Big idea','You start with why','Sinek: people respond to why you do what you do. In a crowded market, your motivation is a useful differentiator.',
    words(S.why)>=5&&PURPOSE.test(S.why)&&!JOBTITLE.test(S.why),
    words(S.why)<5?'Write your why in a sentence.':JOBTITLE.test(S.why)?'This reads like a job title - that is your what. Why do you do it?':'Say what you believe or care about ("I believe...", "because...").',6);
  var vHit=vals.filter(function(v){return overlap(v.n,said).length});
  add('cv','Consistency','Your values show in what you say','A consistent message builds trust: what you say and what you do should be closely aligned (Starbucks, Virgin).',
    vHit.length>=1,nv?'None of your values ('+listJoin(vals.map(function(v){return v.n}))+') appears in your why, how, positioning or statement.':'Choose your values first.',6);
  var sHit=str.filter(function(s){return overlap(s.n,said+' '+S.how).length});
  add('cs','Consistency','Your strengths show in how you work','Strengths aligned with an employer\'s priorities show you will be a good fit (Week 5) - so name them where people will see them.',
    sHit.length>=1,str.length?'Mention at least one of your strengths in your how, positioning or statement.':'Add your strengths first.',6);
  var goalText=S.vision+' '+S.goals.map(function(g){return g.t}).join(' ');
  var ga=overlap(a.who+' '+a.sector+' '+a.type,goalText);
  add('ga','Consistency','Your audience can help you reach your vision','Your target audience should be the people who can help you achieve your career goals.',
    ga.length>=1,'Your goals and your audience share no key words. Is this the audience that can help you get there?',4);
  add('future','Consistency','About the career you want, not just the one you had','Webber: a common mistake is being caught up in the career you\'ve already had, not the one you want.',
    words(S.vision)>=5&&!PAST.test(S.statement+' '+S.why),words(S.vision)<5?'Write your vision first.':'Your statement or why looks back. Rewrite it towards where you are going.',7);
  var st=S.statement.trim(),sent=st.split(/[.!?]+/).filter(function(x){return x.trim()}).length;
  add('stmt','Statement','A one-sentence statement about what you do for others','Week 7: a business-card catchphrase works best with a focus on what you can do for others, not just a job title.',
    st&&sent<=1&&words(st)<=30&&/\b(help|helping|you|your|so that|for|enable|give|make)\b/i.test(st)&&!JOBTITLE.test(st),
    !st?'Choose or write your statement below.':sent>1?'Make it one sentence.':words(st)>30?'Cut it to 30 words or fewer.':'Say what you do for others ("I help...").',7);
  return out;
}

/* ---------- generators ---------- */
function topN(a,n,key){return a.slice(0,n).map(function(x){return lc(x[key||'n'])})}
function drafts(S){
  var who=nodot(S.aud.who)||'[my audience]',ben=nodot(S.benefit)||'[the benefit you bring]',str=topN(S.strengths.filter(function(s){return s.en}).concat(S.strengths.filter(function(s){return !s.en})),2);
  var vals=topN(S.values,2),out=[];
  out.push({k:'I help...',t:'I help '+lc(who)+' with '+lc(ben)+(str.length?', drawing on my strengths in '+listJoin(str)+'':'')+'.'});
  if(S.why.trim())out.push({k:'Start with why',t:uc(nodot(S.why))+(S.what.trim()?', so '+lc(nodot(S.what).replace(/^i /i,'I '))+'.':'.')});
  var tr=S.traits.slice(0,2).map(lc);
  if(S.posLine.trim())out.push({k:'Tagline',t:nodot(S.posLine)+'.'});
  else if(tr.length)out.push({k:'Tagline',t:uc(listJoin(tr))+' and driven by '+(vals.length?listJoin(vals):'my values')+'.'});
  return out.map(function(d){d.t=d.t.replace(/\bi\b/g,'I');return d});
}
function story(S){
  return [['Career goals',[nodot(S.vision)].concat(S.goals.filter(function(g){return g.t.trim()}).map(function(g){return nodot(g.t)})).filter(Boolean).join('; ')],
    ['Values',S.values.map(function(v){return v.n+(v.ev?' ('+nodot(v.ev)+')':'')}).join('; ')],
    ['Strengths',S.strengths.map(function(s){return s.n+(s.en?'':' [skill]')}).join('; ')],
    ['Personality',S.traits.join(', ')+(S.tone?' - '+TONES.filter(function(t){return t[0]===S.tone})[0][1].toLowerCase():'')],
    ['Knowledge and experience',nodot(S.know)]];
}
function whatDoYouDo(S){return [S.why,S.how,S.what].map(nodot).filter(Boolean).map(function(s){return uc(s)+'.'}).join(' ')}
function plain(S,cs){
  var L=['MY PERSONAL BRAND',''];
  if(S.statement.trim())L.push('Statement: '+S.statement.trim(),'');
  L.push('THE FOUR CORNERSTONES','Big idea (why): '+(S.why||'-'),'Values: '+(S.values.map(function(v){return v.n}).join(', ')||'-'),'Vision: '+(S.vision||'-'),'Personality: '+(S.traits.join(', ')||'-')+(S.colour?' | colour: '+S.colour:''),'');
  L.push('WHAT DO YOU DO?',whatDoYouDo(S)||'-','');
  L.push('TARGET AUDIENCE',S.aud.who||'-','Positioning ('+(S.focus||'-')+'): '+(S.posLine||'-'),'');
  L.push('MY STORY');story(S).forEach(function(r){L.push(r[0]+': '+(r[1]||'-'))});
  var p=cs.filter(function(c){return c.ok}).length;L.push('','Consistency checks: '+p+'/'+cs.length);
  return L.join('\n');
}

/* ---------- styles ---------- */
var CSS=[
'.bb-steps{display:flex;gap:6px;overflow-x:auto;margin:0 0 14px;padding-bottom:2px;scrollbar-width:none}',
'.bb-step{flex:0 0 auto;border:0;border-radius:999px;min-height:44px;padding:8px 14px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;display:flex;align-items:center;gap:6px}',
'.bb-step.on{background:var(--ink);color:var(--bg)}',
'.bb-step i{width:7px;height:7px;border-radius:50%;background:var(--dot);display:inline-block}',
'.bb-step i.ok{background:var(--green)}',
'.bb-cs{display:inline-block;font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;border:1.5px dotted var(--ink3);border-radius:999px;padding:3px 10px;color:var(--ink2)}',
'.bb-chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}',
'.bb-chips .chip{min-height:44px;padding:8px 14px}',
'.bb-chips .chip .t{font-family:var(--mono);font-size:.62rem;opacity:.7;letter-spacing:.06em}',
'.bb-item{background:var(--surface2);border-radius:var(--r-sm);padding:12px;margin:0 0 8px}',
'.bb-item .r1{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}',
'.bb-item .input{margin-top:8px}',
'.bb-x{width:44px;height:44px;padding:0;flex:none}',
'.bb-seg{display:inline-flex;border-radius:999px;background:var(--surface);padding:3px;gap:3px}',
'.bb-seg button{border:0;border-radius:999px;min-height:38px;padding:6px 12px;background:transparent;cursor:pointer;font-size:.85rem;color:var(--ink2)}',
'.bb-seg button.on{background:var(--ink);color:var(--bg)}',
'.bb-cols{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:10px 0}',
'@media(max-width:700px){.bb-cols{grid-template-columns:repeat(4,minmax(0,1fr))}}',
'@media(max-width:420px){.bb-cols{grid-template-columns:repeat(3,minmax(0,1fr))}}',
'.bb-col{border:2px solid transparent;border-radius:var(--r-sm);background:var(--surface2);padding:0 0 8px;cursor:pointer;text-align:left;min-height:44px;overflow:hidden;font:inherit;color:inherit}',
'.bb-col.on{border-color:var(--ink)}',
'.bb-col b{display:block;height:30px}',
'.bb-col span{display:block;padding:6px 8px 0;font-size:.8rem;font-weight:500}',
'.bb-col small{display:block;padding:0 8px;font-size:.68rem;color:var(--ink2);line-height:1.3}',
'.bb-focus{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0}',
'@media(max-width:560px){.bb-focus{grid-template-columns:1fr}}',
'.bb-fc{border:1.5px solid var(--line);border-radius:var(--r-md);background:var(--surface);padding:12px 14px;text-align:left;cursor:pointer;min-height:44px;font:inherit;color:inherit}',
'.bb-fc.on{border-color:var(--ink);background:var(--surface2);box-shadow:inset 4px 0 0 var(--red)}',
'.bb-fc .ex{display:block;font-family:var(--mono);font-size:.68rem;color:var(--ink2);margin-top:6px}',
'.bb-circle{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:start}',
'@media(max-width:620px){.bb-circle{grid-template-columns:1fr}.bb-circle svg{max-width:150px;margin:0 auto}}',
'.bb-circle svg{width:100%;height:auto}',
'.bb-gc{border-left:3px solid var(--ink3);padding:2px 0 2px 12px;margin:0 0 12px}',
'.bb-gc.why{border-color:var(--red)}',
'.bb-chk{display:grid;grid-template-columns:30px 1fr auto;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);align-items:start}',
'.bb-chk:last-child{border-bottom:0}',
'.bb-mark{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;border:1.5px solid var(--dot)}',
'.bb-mark.ok{background:var(--green);border-color:var(--green);color:#fff}.bb-mark.no{border-color:var(--red);color:var(--red)}',
'.bb-draft{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;background:var(--surface2);border-radius:var(--r-sm);padding:12px;margin:0 0 8px}',
'.bb-draft p{margin:0;font-family:var(--serif);font-size:1.02rem;line-height:1.45}',
'.bb-card{background:#0B0B0B;color:#fff;border-radius:var(--r-lg);padding:24px;background-image:radial-gradient(#2a2a2a 1.2px,transparent 1.4px);background-size:16px 16px;margin:0 0 14px}',
'.bb-card .label{color:#9a9a9a}',
'.bb-card h2{color:#fff;font-size:1.4rem;line-height:1.3;margin:10px 0 16px;font-family:var(--serif);font-weight:400}',
'.bb-card .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
'@media(max-width:560px){.bb-card .g{grid-template-columns:1fr}}',
'.bb-card .g div{border-top:1px dotted #444;padding-top:8px;color:#e6e6e6;font-size:.92rem}',
'.bb-swatch{display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:-2px;margin-right:6px;border:1px solid #555}',
'.bb-nav{display:flex;justify-content:space-between;gap:10px;margin-top:14px;flex-wrap:wrap}',
'.bb-range{width:100%;height:44px;accent-color:var(--ink);margin:0}'
].join('\n');

/* ---------- mount ---------- */
Tools.register('brand-builder',{title:'Personal Brand Builder',desc:'Build your brand on the four cornerstones, check it for consistency and draft your brand statement.',
mount:function(el,ctx){
  if(!document.getElementById('bb-css')){var st=document.createElement('style');st.id='bb-css';st.textContent=CSS;document.head.appendChild(st)}
  var S=norm(ctx.load()||blank());
  var ui={aiBusy:false,aiTok:'',confirm:''};
  var STEPS=[['values','Values','Values'],['strengths','Strengths','Big idea'],['personality','Personality','Personality'],['vision','Vision','Vision'],
             ['audience','Audience','Target audience'],['position','Position','Positioning'],['why','Why','Big idea'],['brand','My brand','Consistency']];
  var liveFns=[];
  function save(){ctx.save(S)}
  function changed(){save();liveFns.forEach(function(f){f()});maybeDone()}
  function go(i){S.step=i;save();render();var t=el.querySelector('.bb-steps');if(t)t.scrollIntoView({block:'nearest'})}
  function stepOk(i){var cs=checks(S).filter(function(c){return c.step===i});return cs.length&&cs.every(function(c){return c.ok})}
  function maybeDone(){var cs=checks(S),sc=cs.filter(function(c){return c.ok}).length/cs.length;
    if(!S.done&&sc>=0.6&&S.statement.trim()){S.done=true;save();ctx.complete(Math.round(sc*100)/100)}}

  function inp(val,ph,on,attrs){var e=h('input',Object.assign({class:'input',value:val||'',placeholder:ph||''},attrs||{}));e.addEventListener('input',function(){on(e.value);changed()});return e}
  function area(val,ph,on,rows,attrs){var e=h('textarea',Object.assign({class:'textarea',placeholder:ph||'',style:{minHeight:(rows||3)*26+'px'}},attrs||{}));e.value=val||'';e.addEventListener('input',function(){on(e.value);changed()});return e}
  function head(i,title,intro){var s=STEPS[i];return h('div',{style:{marginBottom:'10px'}},h('div',{class:'row between'},h('h3',{style:{margin:0}},(i+1)+'. '+title),h('span',{class:'bb-cs'},s[2])),intro?h('p',{class:'muted',style:{margin:'8px 0 0',fontSize:'.95rem'}},intro):null)}
  function stepChecks(i){
    var box=h('div',{class:'card flat',style:{marginTop:'12px'}});
    function draw(){box.innerHTML='';var cs=checks(S).filter(function(c){return c.step===i});if(!cs.length){box.style.display='none';return}box.style.display='';
      box.appendChild(h('span',{class:'label'},'Quick check'));
      cs.forEach(function(c){box.appendChild(h('div',{class:'tiny',style:{marginTop:'6px'}},h('b',{class:c.ok?'ok':'bad'},c.ok?'✓ ':'! '),c.l,c.ok?null:h('span',{class:'muted'},' - '+c.msg)))})}
    draw();liveFns.push(draw);return box}
  function seg(opts,cur,on){return h('div',{class:'bb-seg',role:'group'},opts.map(function(o){return h('button',{class:cur===o[0]?'on':'','aria-pressed':cur===o[0]?'true':'false',onclick:function(){on(o[0])}},o[1])}))}
  function nav(i){return h('div',{class:'bb-nav'},i>0?h('button',{class:'btn ghost',onclick:function(){go(i-1)}},'Back'):h('span'),
    i<STEPS.length-1?h('button',{class:'btn primary',onclick:function(){go(i+1)}},i===STEPS.length-2?'See my brand':'Next: '+STEPS[i+1][1].toLowerCase()):null)}

  /* 1 values */
  function sValues(){
    var w=h('div',null,head(0,'Values: what do you believe in?','Values are "the things that you believe are important in the way you live and work". Think of times you felt happiest, proudest or most alive - at home and at work. Which values explain why? Tap to choose, then narrow to three to five.'));
    var chips=h('div',{class:'bb-chips'});
    var names=S.values.map(function(v){return v.n});
    VALUES.concat(S.values.filter(function(v){return !VALUES.some(function(x){return x[0]===v.n})}).map(function(v){return [v.n,v.k]})).forEach(function(v){
      var on=names.indexOf(v[0])>=0;
      chips.appendChild(h('button',{class:'chip'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){
        if(on)S.values=S.values.filter(function(x){return x.n!==v[0]});else S.values.push({n:v[0],k:v[1],ev:''});save();render();maybeDone()}},
        v[0],FTSE.indexOf(v[0])>=0?h('span',{class:'t',title:'FTSE top 10'},'TOP10'):null))});
    w.appendChild(chips);
    var add=h('input',{class:'input',placeholder:'Add your own value',style:{flex:'1',minWidth:'0'},'aria-label':'Add your own value'});
    function addV(){var v=uc(add.value.trim());if(!v||S.values.some(function(x){return x.n.toLowerCase()===v.toLowerCase()}))return;S.values.push({n:v,k:'b',ev:''});save();render()}
    add.addEventListener('keydown',function(e){if(e.key==='Enter')addV()});
    w.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap'}},add,h('button',{class:'btn',onclick:addV},'Add')));
    w.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0'}},'TOP10 = one of the ten values FTSE 100 companies state most often (Maitland). Fine to keep - but they rarely make you stand out.'));
    if(S.values.length){
      w.appendChild(h('span',{class:'label'},'Your values ('+S.values.length+')'));
      S.values.forEach(function(v){
        w.appendChild(h('div',{class:'bb-item'},
          h('div',{class:'r1'},h('b',null,v.n),h('div',{class:'row',style:{gap:'6px'}},seg([['b','Behaviour'],['o','Operational']],v.k,function(k){v.k=k;save();render();maybeDone()}),
            h('button',{class:'btn ghost bb-x','aria-label':'Remove '+v.n,onclick:function(){S.values=S.values.filter(function(x){return x!==v});save();render()}},'×'))),
          inp(v.ev,'A moment when this value showed, e.g. "When I..."',function(t){v.ev=t},{'aria-label':'Moment for '+v.n})))});
    }
    w.appendChild(stepChecks(0));w.appendChild(nav(0));return w}

  /* 2 strengths */
  function sStrengths(){
    var w=h('div',null,head(1,'Strengths: what do you have to offer?','Strengths are innate and energise you; skills can be learned and developed. List what you do that really enthuses you. Holloway\'s ideas below may help you name them.'));
    var chips=h('div',{class:'bb-chips'}),names=S.strengths.map(function(s){return s.n});
    STRENGTHS.concat(names.filter(function(n){return STRENGTHS.indexOf(n)<0})).forEach(function(n){var on=names.indexOf(n)>=0;
      chips.appendChild(h('button',{class:'chip'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){
        if(on)S.strengths=S.strengths.filter(function(x){return x.n!==n});else S.strengths.push({n:n,en:true,ev:''});save();render();maybeDone()}},n))});
    w.appendChild(chips);
    var add=h('input',{class:'input',placeholder:'Add your own strength or skill',style:{flex:'1',minWidth:'0'},'aria-label':'Add your own strength'});
    function addS(){var v=uc(add.value.trim());if(!v||names.indexOf(v)>=0)return;S.strengths.push({n:v,en:true,ev:''});save();render()}
    add.addEventListener('keydown',function(e){if(e.key==='Enter')addS()});
    w.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap'}},add,h('button',{class:'btn',onclick:addS},'Add')));
    if(S.strengths.length){
      w.appendChild(h('p',{class:'tiny muted',style:{margin:'12px 0 6px'}},'For each one: does using it energise you (a strength), or is it something you have learned to do well (a skill)?'));
      S.strengths.forEach(function(s){
        w.appendChild(h('div',{class:'bb-item'},h('div',{class:'r1'},h('b',null,s.n),h('div',{class:'row',style:{gap:'6px'}},
          seg([[true,'Energises me'],[false,'Learned skill']],s.en,function(v){s.en=v;save();render();maybeDone()}),
          h('button',{class:'btn ghost bb-x','aria-label':'Remove '+s.n,onclick:function(){S.strengths=S.strengths.filter(function(x){return x!==s});save();render()}},'×'))),
          inp(s.ev,'Where do you use it? (optional)',function(t){s.ev=t},{'aria-label':'Where you use '+s.n})))});
    }
    w.appendChild(h('div',{class:'callout note',style:{marginTop:'10px'}},'Even if something does not fill you with energy, you can still be good at it. But a brand built on your strengths points you to roles that let you feel highly engaged.'));
    w.appendChild(stepChecks(1));w.appendChild(nav(1));return w}

  /* 3 personality */
  function sPersonality(){
    var w=h('div',null,head(2,'Personality: how do you want to come across?','Brand personality is the human characteristics attributed to a brand. Yours are your own - choose which to highlight.'));
    var chips=h('div',{class:'bb-chips'});
    TRAITS.concat(S.traits.filter(function(t){return TRAITS.indexOf(t)<0})).forEach(function(t){var on=S.traits.indexOf(t)>=0;
      chips.appendChild(h('button',{class:'chip'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){
        if(on)S.traits=S.traits.filter(function(x){return x!==t});else S.traits.push(t);save();render();maybeDone()}},t))});
    w.appendChild(chips);
    var add=h('input',{class:'input',placeholder:'Add your own trait',style:{flex:'1',minWidth:'0'},'aria-label':'Add your own trait'});
    function addT(){var v=uc(add.value.trim());if(!v||S.traits.indexOf(v)>=0)return;S.traits.push(v);save();render()}
    add.addEventListener('keydown',function(e){if(e.key==='Enter')addT()});
    w.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap'}},add,h('button',{class:'btn',onclick:addT},'Add')));
    w.appendChild(h('div',{class:'label',style:{marginTop:'16px'}},'Tone of voice (Design Council)'));
    w.appendChild(h('div',{class:'bb-chips'},TONES.map(function(t){return h('button',{class:'chip'+(S.tone===t[0]?' on':''),'aria-pressed':S.tone===t[0]?'true':'false',onclick:function(){S.tone=S.tone===t[0]?'':t[0];save();render()}},t[1])})));
    w.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'What colour is my brand? (Figure 4)'));
    w.appendChild(h('div',{class:'bb-cols'},COLOURS.map(function(c){return h('button',{class:'bb-col'+(S.colour===c.id?' on':''),'aria-pressed':S.colour===c.id?'true':'false',onclick:function(){S.colour=S.colour===c.id?'':c.id;save();render()}},
      h('b',{style:{background:c.hex}}),h('span',null,c.n),h('small',null,c.w.join(', ')))})));
    if(S.colour){var col=COLOURS.filter(function(c){return c.id===S.colour})[0];
      var hit=col.w.filter(function(x){return overlap(x,S.traits.join(' ')+' '+S.values.map(function(v){return v.n}).join(' ')).length});
      w.appendChild(h('p',{class:'tiny muted'},hit.length?'Your traits and values share "'+hit.join('", "')+'" with '+col.n.toLowerCase()+'.':'None of '+col.n.toLowerCase()+'\'s words appear in your traits or values. That is fine - say why it fits you.'));
      w.appendChild(inp(S.colourWhy,'Why this colour?',function(t){S.colourWhy=t},{'aria-label':'Why this colour'}))}
    w.appendChild(stepChecks(2));w.appendChild(nav(2));return w}

  /* 4 vision */
  function sVision(){
    var w=h('div',null,head(3,'Vision: where are you going?','Microsoft\'s vision was "a computer on every desk, and in every home". Yours is where you want your career to be at a point in the future. It should be just out of reach.'));
    w.appendChild(h('div',{class:'label'},'Timeframe'));
    w.appendChild(h('div',{class:'bb-chips'},[1,3,5,10].map(function(y){return h('button',{class:'chip'+(S.years===y?' on':''),'aria-pressed':S.years===y?'true':'false',onclick:function(){S.years=y;save();render();maybeDone()}},y+(y===1?' year':' years'))})));
    w.appendChild(area(S.vision,'Within '+(S.years||'5')+' years I want to...',function(t){S.vision=t},3,{'aria-label':'Your vision'}));
    var lab=h('span',{class:'tiny muted'});
    function sl(){lab.textContent=['','I am nearly there already','A small step from now','A stretch - just out of reach','A big leap','A dream - very far away'][S.stretch]}
    var r=h('input',{type:'range',min:1,max:5,step:1,value:S.stretch,class:'bb-range','aria-label':'How far is this from where you are now?'});
    r.addEventListener('input',function(){S.stretch=+r.value;sl();changed()});sl();
    w.appendChild(h('div',{style:{marginTop:'12px'}},h('div',{class:'row between'},h('span',{class:'label'},'How far is this from where you are now?'),lab),r));
    w.appendChild(h('div',{class:'label',style:{marginTop:'14px'}},'Up to three career goals right now'));
    w.appendChild(h('p',{class:'tiny muted',style:{margin:'4px 0 8px'}},'Broad is fine: a context, a status, a location - or simply staying open to opportunities. Are they realistic given location, money or family? Tweak them if not.'));
    S.goals.forEach(function(g,i){
      w.appendChild(h('div',{class:'bb-item'},h('div',{class:'bb-chips',style:{margin:'0 0 4px'}},GOALTYPES.map(function(t){return h('button',{class:'chip'+(g.k===t[0]?' on':''),title:t[2],'aria-pressed':g.k===t[0]?'true':'false',onclick:function(){g.k=g.k===t[0]?'':t[0];save();render()}},t[1])})),
        inp(g.t,'Goal '+(i+1)+': '+GOALTYPES[i%4][2].replace('e.g. ',''),function(t){g.t=t},{'aria-label':'Career goal '+(i+1)})))});
    w.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'Knowledge and experience'));
    w.appendChild(area(S.know,'What you know and have done that supports your vision',function(t){S.know=t},2,{'aria-label':'Knowledge and experience'}));
    w.appendChild(stepChecks(3));w.appendChild(nav(3));return w}

  /* 5 audience */
  function sAudience(){
    var a=S.aud,w=h('div',null,head(4,'Target audience: who do you want to reach?','Blick\'s two stages: identify your audience (the smaller the group, the more manageable it is to reach), then research it before you communicate.'));
    w.appendChild(h('div',{class:'label'},'Stage 1: identify'));
    w.appendChild(inp(a.who,'Who can help you reach your vision? e.g. "Primary schools that run forest school sessions"',function(t){a.who=t},{'aria-label':'Your target audience'}));
    var g=h('div',{class:'grid g2',style:{marginTop:'10px'}});
    [['sector','Sector or kind of organisation','e.g. Landscaping firms'],['type','More specific type','e.g. Firms doing public parks'],['where','Postcode, town or county','e.g. Within 20 miles of Leeds'],['size','Size of organisation','e.g. Small, under 50 staff']].forEach(function(f){
      g.appendChild(h('label',null,h('span',{class:'tiny muted'},f[1]),inp(a[f[0]],f[2],function(t){a[f[0]]=t})))});
    w.appendChild(g);
    w.appendChild(h('div',{class:'label',style:{marginTop:'16px'}},'Stage 2: research'));
    w.appendChild(h('div',{class:'bb-chips'},RESEARCH.map(function(r){var on=!!a.res[r[0]];return h('button',{class:'chip'+(on?' on':''),'aria-pressed':on?'true':'false',style:{textAlign:'left'},onclick:function(){a.res[r[0]]=!on;save();render();maybeDone()}},r[1])})));
    w.appendChild(area(a.notes,'What did you find out? What are they looking for, and who are the key people?',function(t){a.notes=t},3,{'aria-label':'Research notes'}));
    w.appendChild(h('div',{class:'callout note',style:{marginTop:'10px'}},'Case study: Tara is a retail assistant who would love to be a landscape gardener. Her audience is not "employers" - it is specific local firms and groups she can research, call and meet.'));
    w.appendChild(stepChecks(4));w.appendChild(nav(4));return w}

  /* 6 position */
  function sPosition(){
    var w=h('div',null,head(5,'Positioning: a distinctive place in their mind','Positioning is "the act of designing the company\'s offering and image to occupy a distinctive place in the mind of the target market" (Kotler and Keller). Choose the focus that suits you best.'));
    w.appendChild(h('div',{class:'bb-focus'},FOCUS.map(function(f){return h('button',{class:'bb-fc'+(S.focus===f.id?' on':''),'aria-pressed':S.focus===f.id?'true':'false',onclick:function(){S.focus=S.focus===f.id?'':f.id;save();render();maybeDone()}},
      h('b',null,'Focus on '+f.n.toLowerCase()),h('div',{class:'tiny muted',style:{marginTop:'4px'}},f.you),h('span',{class:'ex'},f.ex))})));
    w.appendChild(h('label',null,h('span',{class:'label'},'What does your audience gain from you?'),inp(S.benefit,'e.g. projects that come in on time, without the drama',function(t){S.benefit=t},{'aria-label':'Benefit to your audience'})));
    w.appendChild(h('label',{style:{display:'block',marginTop:'10px'}},h('span',{class:'label'},'Your positioning line'),inp(S.posLine,'A short line, like a brand tagline',function(t){S.posLine=t},{'aria-label':'Positioning line'})));
    w.appendChild(stepChecks(5));w.appendChild(nav(5));return w}

  /* 7 why */
  function gcSvg(){var ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 150 150');svg.setAttribute('role','img');svg.setAttribute('aria-label','The Golden Circle: why at the centre, then how, then what');
    [[70,'var(--surface2)','WHAT',22],[48,'var(--line)','HOW',44],[25,'var(--red)','WHY',78]].forEach(function(c){var e=document.createElementNS(ns,'circle');e.setAttribute('cx',75);e.setAttribute('cy',75);e.setAttribute('r',c[0]);e.setAttribute('fill',c[1]);e.setAttribute('stroke','var(--ink3)');e.setAttribute('stroke-dasharray','2 3');svg.appendChild(e);
      var t=document.createElementNS(ns,'text');t.setAttribute('x',75);t.setAttribute('y',c[3]);t.setAttribute('text-anchor','middle');t.setAttribute('font-size','10');t.setAttribute('font-family','monospace');t.setAttribute('fill',c[2]==='WHY'?'#fff':'var(--ink)');t.textContent=c[2];svg.appendChild(t)});
    return svg}
  function sWhy(){
    var w=h('div',null,head(6,'Start with why: the big idea','Sinek\'s Golden Circle: most people explain what they do, then how. Inspiring brands start with why. What lies at the heart of your offer?'));
    w.appendChild(h('label',null,h('span',{class:'label'},'How do you answer "What do you do?" today?'),inp(S.old,'e.g. "I\'m in accounts."',function(t){S.old=t},{'aria-label':'Your current answer'})));
    var g=h('div',null);
    [['why','why','Why? Your purpose or belief','I believe... / Because...'],['how','','How? Your values and strengths in action','I use my... to...'],['what','','What? What you do, for whom','I...']].forEach(function(f){
      g.appendChild(h('div',{class:'bb-gc '+f[1]},h('span',{class:'label'},f[2]),area(S[f[0]],f[3],function(t){S[f[0]]=t;prev()},2,{'aria-label':f[2]})))});
    w.appendChild(h('div',{class:'bb-circle',style:{marginTop:'14px'}},gcSvg(),g));
    var pv=h('div',{class:'callout tip'});
    function prev(){var t=whatDoYouDo(S);pv.innerHTML='';pv.appendChild(h('b',null,'Your new answer: '));pv.appendChild(document.createTextNode(t||'Fill in why, how and what to see it.'));
      if(S.old.trim())pv.appendChild(h('div',{class:'tiny muted',style:{marginTop:'6px'}},'Before: "'+S.old.trim()+'" ('+words(S.old)+' words) - now '+words(t)+' words, leading with why.'))}
    prev();w.appendChild(pv);
    w.appendChild(stepChecks(6));w.appendChild(nav(6));return w}

  /* 8 brand */
  function sBrand(){
    var cs=checks(S),pass=cs.filter(function(c){return c.ok}).length,pct=Math.round(pass/cs.length*100),w=h('div',null,head(7,'My brand: consistent and clear','Big brands present the same message over and over to win trust. Check your brand fits together, then draft the statement you would put on a business card.'));
    w.appendChild(h('div',{class:'card flat'},h('div',{class:'row between'},h('span',{class:'label'},'Consistency score'),h('b',{style:{fontSize:'1.5rem',fontFamily:'var(--mono)'}},pass+' / '+cs.length)),
      h('div',{class:'bar'+(pct<50?' red':'')},h('i',{style:{width:pct+'%'}})),
      h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},pct>=85?'Strong and consistent. Test it on someone you trust (Week 4, Activity 1).':pct>=60?'Good foundations. Work through the open items.':'Early draft - open items are below, with the step to fix each.')));
    var list=h('div',{class:'card'}),okc=cs.filter(function(c){return c.ok});
    if(cs.length>okc.length)list.appendChild(h('span',{class:'label'},'Open items ('+(cs.length-okc.length)+')'));
    cs.filter(function(c){return !c.ok}).forEach(function(c){list.appendChild(h('div',{class:'bb-chk'},h('div',{class:'bb-mark '+(c.ok?'ok':'no'),'aria-label':c.ok?'Pass':'Not yet'},c.ok?'✓':'!'),
      h('div',null,h('b',null,c.l),h('div',{class:'tiny muted'},c.w),c.ok?null:h('div',{class:'tiny bad',style:{marginTop:'4px'}},c.msg)),
      c.ok||c.step===7?h('span'):h('button',{class:'btn sm ghost',onclick:function(){go(c.step)}},'Fix')))});
    if(okc.length){var det=h('details',{style:{marginTop:cs.length>okc.length?'10px':'0'}},h('summary',{style:{cursor:'pointer',minHeight:'44px',display:'flex',alignItems:'center'}},h('span',{class:'label'},'Passed ('+okc.length+') - tap to see why each matters')));
      okc.forEach(function(c){det.appendChild(h('div',{class:'tiny',style:{padding:'6px 0',borderTop:'1px solid var(--line)'}},h('b',{class:'ok'},'✓ '),h('b',null,c.l),h('div',{class:'muted'},c.w)))});
      list.appendChild(det)}
    w.appendChild(list);
    // statement
    var sc=h('div',{class:'card'},h('span',{class:'label'},'Draft statements - tap one to use it, then edit'));
    drafts(S).forEach(function(d){sc.appendChild(h('div',{class:'bb-draft'},h('div',null,h('div',{class:'tiny muted'},d.k),h('p',null,d.t)),h('button',{class:'btn sm',onclick:function(){S.statement=d.t;save();render();maybeDone()}},'Use')))});
    sc.appendChild(h('div',{class:'label',style:{marginTop:'10px'}},'My brand statement'));
    var sta=area(S.statement,'One sentence about what you do for others',function(t){S.statement=t},2,{'aria-label':'My brand statement'});
    sc.appendChild(sta);
    var cnt=h('div',{class:'tiny muted'});function cc(){cnt.textContent=words(S.statement)+' words'}cc();liveFns.push(cc);sc.appendChild(cnt);
    sc.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'Examples from BrandYourself: "I help people create new opportunities in their businesses and careers." "I spark new product ideas for large companies that have stagnant product cycles."'));
    w.appendChild(sc);
    // AI
    var out=h('div',null);
    function drawAi(){out.innerHTML='';if(ui.aiBusy)out.appendChild(h('div',{class:'ai-box',role:'status'},h('span',{class:'label'},'AI critique'),ui.aiTok||'Thinking...'));
      else if(S.aiText)out.appendChild(h('div',{class:'ai-box'},h('span',{class:'label'},S.aiText.indexOf('[rules]')===0?'Rule-based critique':'AI critique'),S.aiText.replace(/^\[rules\]\s*/,'')))}
    function rulesCrit(){var f=checks(S).filter(function(c){return !c.ok}).slice(0,3);
      return '[rules] '+(f.length?f.map(function(c){return '- '+c.l+': '+c.msg}).join('\n'):'- Every check passes. Now ask someone you trust whether it sounds like you.')}
    var crit=h('div',{class:'card flat'},h('span',{class:'label'},'Second opinion'));
    if(ctx.ai.available()){
      var ab=h('button',{class:'btn primary',onclick:function(){
        ui.aiBusy=true;ui.aiTok='';ab.disabled=true;drawAi();
        var fail=checks(S).filter(function(c){return !c.ok}).map(function(c){return c.l}).slice(0,4).join('; ')||'none';
        var prof='Values: '+(S.values.map(function(v){return v.n}).join(', ')||'none')+'\nStrengths: '+(S.strengths.map(function(s){return s.n}).join(', ')||'none')+'\nPersonality: '+(S.traits.join(', ')||'none')+
          '\nVision: '+clip(S.vision||'none',160)+'\nAudience: '+clip(S.aud.who||'none',100)+'\nWhy: '+clip(S.why||'none',140)+'\nStatement: '+clip(S.statement||'none',160)+'\nFailed checks: '+fail;
        ctx.ai.ask({system:'You are a friendly careers coach. Critique a personal brand draft. Reply in plain text: exactly 3 short bullet points starting with "- ". Under 90 words. Be specific and practical. Focus on consistency, authenticity and whether it starts with why.',
          prompt:prof+'\n\nGive 3 bullet points of critique.',maxTokens:180,temperature:0.3,onToken:function(t){ui.aiTok=t;drawAi()}})
        .then(function(t){ui.aiBusy=false;ab.disabled=false;t=String(t||'').trim();S.aiText=t||rulesCrit();save();drawAi()})
        .catch(function(){ui.aiBusy=false;ab.disabled=false;S.aiText=rulesCrit();save();drawAi();ctx.toast('AI unavailable - showing rule-based critique')})}},'Ask AI to critique my brand');
      crit.appendChild(h('p',{class:'tiny muted',style:{margin:'6px 0 10px'}},'The on-device AI reads your values, strengths, vision, why and statement. The checklist above is the main guide.'));crit.appendChild(ab);
    } else {
      crit.appendChild(h('p',{class:'tiny muted',style:{margin:'6px 0 10px'}},'No AI model is loaded, so you get a rule-based critique of your three most important open items.'));
      crit.appendChild(h('button',{class:'btn primary',onclick:function(){S.aiText=rulesCrit();save();drawAi()}},'Critique my brand'));
    }
    w.appendChild(crit);drawAi();w.appendChild(out);
    // card
    var col=COLOURS.filter(function(c){return c.id===S.colour})[0];
    var card=h('div',{class:'bb-card',style:{marginTop:'14px'}},h('span',{class:'label'},'My personal brand'),h('h2',null,S.statement.trim()||'Your brand statement goes here'),
      h('div',{class:'g'},
        h('div',null,h('span',{class:'label'},'Big idea - why'),h('div',null,S.why||'-')),
        h('div',null,h('span',{class:'label'},'Values'),h('div',null,S.values.map(function(v){return v.n}).join(' · ')||'-')),
        h('div',null,h('span',{class:'label'},'Vision'+(S.years?' - '+S.years+' yr':'')),h('div',null,S.vision||'-')),
        h('div',null,h('span',{class:'label'},'Personality'),h('div',null,col?h('span',{class:'bb-swatch',style:{background:col.hex}}):null,S.traits.join(' · ')||'-'))));
    w.appendChild(card);
    var sty=h('div',{class:'card'},h('span',{class:'label'},'My story (Week 4, Activity 6)'));
    story(S).forEach(function(r){sty.appendChild(h('div',{style:{padding:'8px 0',borderBottom:'1px solid var(--line)'}},h('b',null,r[0]+': '),h('span',{class:r[1]?'':'muted'},r[1]||'not yet written')))});
    w.appendChild(sty);
    w.appendChild(h('div',{class:'row'},h('button',{class:'btn primary',onclick:function(){copyText(plain(S,checks(S)),ctx,'Brand copied')}},'Copy as text')));
    w.appendChild(h('div',{class:'callout tip',style:{marginTop:'12px'}},'Next: share your story with someone from your Activity 1 list. It is easier to hear constructive feedback from people you trust than from an employer you are keen to work for.'));
    w.appendChild(nav(7));return w}

  function toolbar(){
    if(ui.confirm==='reset')return h('div',{class:'callout',style:{marginTop:'16px'}},h('p',null,'Clear everything and start again?'),h('div',{class:'row'},
      h('button',{class:'btn red',onclick:function(){S=blank();ui.confirm='';save();render()}},'Clear all'),h('button',{class:'btn ghost',onclick:function(){ui.confirm='';render()}},'Cancel')));
    if(ui.confirm==='example')return h('div',{class:'callout',style:{marginTop:'16px'}},h('p',null,'Replace your answers with the course\'s example (a freelance writer in education)?'),h('div',{class:'row'},
      h('button',{class:'btn primary',onclick:function(){var st=S.step;S=norm(JSON.parse(JSON.stringify(EXAMPLE)));S.step=st;S.done=false;ui.confirm='';save();render()}},'Load example'),h('button',{class:'btn ghost',onclick:function(){ui.confirm='';render()}},'Cancel')));
    return h('div',{class:'row',style:{marginTop:'16px',borderTop:'1px dotted var(--dot)',paddingTop:'12px'}},
      h('button',{class:'btn ghost sm',onclick:function(){ui.confirm='example';render()}},'Load example'),
      h('button',{class:'btn ghost sm',onclick:function(){ui.confirm='reset';render()}},'Reset'));
  }
  function render(){
    liveFns=[];
    var hgt=el.offsetHeight;el.style.minHeight=hgt+'px';el.innerHTML='';
    var tabs=h('div',{class:'bb-steps',role:'tablist'},STEPS.map(function(s,i){return h('button',{class:'bb-step'+(S.step===i?' on':''),role:'tab','aria-selected':S.step===i?'true':'false',onclick:function(){go(i)}},
      h('i',{class:stepOk(i)?'ok':''}),(i+1)+' '+s[1])}));
    var body=[sValues,sStrengths,sPersonality,sVision,sAudience,sPosition,sWhy,sBrand][S.step]();
    el.appendChild(h('div',{class:'tool'},tabs,body,toolbar()));
    el.style.minHeight='';
    var on=tabs.querySelector('.on');if(on){var d=on.getBoundingClientRect().left-tabs.getBoundingClientRect().left;if(d+on.offsetWidth>tabs.clientWidth||d<0)tabs.scrollLeft+=d-40}
  }
  render();
}});
})();

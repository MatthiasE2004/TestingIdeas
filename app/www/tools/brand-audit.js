/* Brand Presence Audit and Promotion Planner - Personal branding for career success, Weeks 5-7.
   Online footprint (Grothaus, Majeed, cautionary tales), promoting online (one platform, LinkedIn summary, groups, connections),
   in writing (CV personal profile: unique, concrete facts, consistent; tailoring; weaving brand into statements; email rapport; catchphrase),
   in person (3 As, non-verbal cues, opening lines, consistency, interviewer's three questions, nerves), STAR answers (Week 5 Activity 3,
   competency vs strengths-based questions) and a short action plan with the Week 5 three kinds of career goal and audiences.
   Tool id: brand-audit. Plain ES2017. State saved with ctx.save on every change. */
(function(){
var h=H.h;

/* ---------- audit items (area, id, label, why from the course, action if not done) ---------- */
var AREAS=[
 {id:'foot',n:'Digital footprint',short:'Footprint',intro:'Employers regularly look at your social media - LinkedIn (87% of recruiters), Facebook (43%), Twitter (22%). When you post, you are publishing, and it cannot always be retracted.',items:[
  ['google','I have Googled my name, including Images','Googling you is what an employer or networking contact will often do (Activity 1).','Search your name (and Images) and list anything to delete or make private'],
  ['private','My personal accounts are set to private','Grothaus: make your social media accounts private - Facebook tends to be personal.','Set personal accounts to private'],
  ['timeline','I have reviewed my timelines','Remove photos or comments that could cast you in a negative light.','Review timelines and remove anything unflattering'],
  ['tags','Tagging is under control','Tags with your name can appear in Google searches. Untag yourself, ask friends to untag you, or stop others tagging you.','Untag yourself and change tagging settings'],
  ['old','Old and unused accounts are closed','Find forgotten accounts (Google your name) and delete or deactivate the ones you no longer use.','Find and close old accounts'],
  ['alerts','I get alerts when I am mentioned online','Majeed: use Google Alerts, and post positive material to drive out negative results you cannot delete.','Set up a Google Alert for your name'],
  ['wrong','Nothing I post complains about work or shares confidential details','Kevin tweeted his job was boring and was fired; Susie\'s desk photo showed confidential papers; Martin was tagged at a party on a sick day.','Delete posts about work you would not want your employer to see'],
  ['views','Strong opinions I share fit the brand I want','Caution: think carefully before voicing views on controversial subjects such as politics or religion.','Check recent opinion posts against your brand']]},
 {id:'online',n:'Promoting online',short:'Online',intro:'Most commentators advise focusing on one platform to start with. Of all the platforms, LinkedIn is the one professionals should seriously consider.',items:[
  ['platform','I have chosen one main platform to do well','Gayle chose to do one platform well rather than spread herself thinly; keeping several profiles takes a lot of time.','Choose one platform and note why (Activity 4)'],
  ['summary','My LinkedIn summary is written (two or three paragraphs)','The summary is the first thing people read. Treat it like the personal profile on a CV.','Draft your LinkedIn summary using the profile checker'],
  ['keywords','My profile uses the words employers search for','Build your profile like an online CV with achievements, skills and qualifications, using the words employers search for.','Add the skills words from three job adverts to your profile'],
  ['groups','I contribute regularly to groups or conversations','Joining relevant groups and contributing regularly is one of the most valuable ways to build your brand on LinkedIn. Post regularly - and make time to.','Join one relevant group and comment once a week'],
  ['human','I share useful content, not just adverts for myself','Gayle: be human online and let people into your world; social media works best as a conversation, not a stream of adverts.','Plan three posts that share tips or ask a question'],
  ['connect','My connections are relevant and add value','Don\'t accept every invitation. To reach someone new, ask a mutual connection to introduce you.','Ask a mutual contact for one introduction']]},
 {id:'write',n:'In writing',short:'Writing',intro:'Applications, CVs, emails, reports and business cards all say something about your brand. Readers form opinions about you from what they read.',items:[
  ['profile','My CV personal profile is unique, factual and consistent','The common mistake is a vague, generic profile. It must be unique to you, backed by concrete facts and consistent with the rest of your CV.','Rewrite your CV profile with two concrete facts'],
  ['tailor','I tailor my CV to each employer','Aligning your brand with their values, or the strengths they look for, puts you ahead of much of your competition.','Tailor your CV to one employer\'s values and adverts'],
  ['weave','My statements link a strength, a benefit and an example','Week 7: "I pay close attention to detail because..." - a strength, the benefit to the employer and an example they can explore at interview.','Rewrite one statement as strength + benefit + example'],
  ['spec','I answer the job description and person specification first','Respond to the role requirements, then reread the draft to check your brand is prominent and reinforce it.','Highlight every requirement in a person specification and match each one'],
  ['email','My emails build rapport and have an authentic tone','Holloway: open with something that builds rapport. Tone is the hardest thing to get across by email.','Add a rapport line to your next three emails'],
  ['reply','I reply quickly, or send a holding email','A reader is more likely to notice your tone and content if they are not furious about how long you took.','Send holding replies within a day'],
  ['card','I have a one-sentence catchphrase about what I do for others','A business-card catchphrase focused on what you can do for others strengthens your offering.','Write your one-sentence brand statement']]},
 {id:'person',n:'In person',short:'In person',intro:'First impressions are formed within seconds - even before we start to speak.',items:[
  ['three','My image is authentic, appropriate and attractive','Jayne Chapman\'s 3 As: what you see is what you get; dress for other people and their context; look pleasing and well.','Plan an outfit that passes the 3 As for your next event'],
  ['dress','I find out the dress code and plan in advance','Do not pull your outfit together at the last minute. Ask or watch what people wear; for interviews, often go smarter.','Find out the dress code of your target employer'],
  ['nonverbal','I smile, make eye contact and keep an open posture','Folded arms can look defensive, slouching uninterested, staring aggressive; a strong handshake beats a limp one.','Ask a friend to watch your body language in a practice chat'],
  ['lines','I have three opening lines for networking','Think of networking as a conversation with an interesting person. A few prepared opening lines help your confidence.','Write three opening lines (Activity 4)'],
  ['consistent','I behave consistently with everyone I meet','From the receptionist to the canteen queue: treat everyone the same way. You build your brand even when unaware of it.','Follow up one chance conversation with an email'],
  ['interview','I can show I can do, will do and will fit in','The interviewer wants to know: can you do the job, will you do the job, and will you fit in?','Prepare one example for each of the interviewer\'s three questions'],
  ['nerves','I have a technique for nerves','Kermode: slow breathing (3 in, 3 out, three times), clenching thigh muscles, the Humpty Dumpty exercise beforehand.','Practise the 18-second breathing technique'],
  ['work','I am noticed for the right reasons at work','Homayun: network over lunch, help others, ask intelligent questions - and don\'t be late or on your laptop in meetings.','Invite a colleague for lunch and find out what they do']]}];
var MARK=[['y','Yes',1],['p','Partly',0.5],['n','Not yet',0]];

var GOALKINDS=[
 {id:'enhance',n:'Enhancing your current situation',d:'New responsibilities or an internal promotion.',aud:'Peers and colleagues, senior managers, your HR team.'},
 {id:'change',n:'Changing your emphasis',d:'The same job for a different employer, or your skills in a new context.',aud:'People in other departments or companies, professional bodies, recruitment consultancies.'},
 {id:'new',n:'Doing something new',d:'Starting your career, or a complete change.',aud:'People already doing the role you aspire to - they can tell you about the role, the main employers and what they look for.'}];
var PRONGS='Research them three ways: online (websites, social feeds, professional bodies\' news), on paper (internal newsletters, trade publications) and in person (conferences, breakfast meetings, networking evenings).';

var QUESTIONS=[
 {id:'adapt',k:'comp',q:'Describe a situation when you had to change the way you worked because of changing circumstances. How did you adapt?',src:'Week 5, Activity 3',re:/\b(chang\w*|adapt\w*|new|different|unexpect\w*|instead|switch\w*|flexib\w*|alternative)\b/i,need:'say what changed and how you adapted'},
 {id:'proud',k:'str',q:'Describe an occasion when you achieved something you were really proud of.',src:'Week 7',re:/\b(proud|enjoy\w*|lov\w*|energi[sz]\w*|thrill\w*|satisf\w*|motivat\w*|excit\w*)\b/i,need:'say what you enjoyed or why you were proud'},
 {id:'help',k:'str',q:'If a colleague was struggling to make a complex decision, what would you do to help? Give an example of when you have done this.',src:'Week 5',re:/\b(help\w*|support\w*|listen\w*|enjoy\w*|decision|options?|together)\b/i,need:'show how you helped and what you enjoy about it'},
 {id:'own',k:'comp',q:'',src:'Your own question',re:null,need:''}];
var STARF=[['s','Situation','Set the scene briefly: where, when, what was going on.'],['t','Task','What you needed to achieve, or the problem to solve.'],
  ['a','Action','What you did - the most important part. Say "I", and give the steps.'],['r','Result','What happened as a result. Numbers, feedback, what you learned.']];
var EXAMPLE_PROFILE="I'm a dedicated team player with retail experience. I have successfully managed a small concession in a large department store and have demonstrated my ability to make a profit. I am an excellent motivator and can work effectively with a wide range of customers and colleagues.";
var CLICHE=/\b(dedicated|team player|hard[- ]working|hardworking|excellent communicator|good communication skills|motivated|self[- ]starter|results[- ]driven|go[- ]getter|works? well under pressure|wide range|passionate about|dynamic|proactive|excellent motivator|people person|detail[- ]oriented|think outside the box|enthusiastic)\b/gi;

/* ---------- helpers ---------- */
function words(s){s=String(s||'').trim();return s?s.split(/\s+/).length:0}
function uc(s){s=String(s||'').trim();return s?s.charAt(0).toUpperCase()+s.slice(1):s}
function uniq(a){var m={};return a.filter(function(x){x=x.toLowerCase();if(m[x])return false;m[x]=1;return true})}
function kwList(s){return String(s||'').split(/[,;\n]+/).map(function(x){return x.trim()}).filter(function(x){return x.length>2})}
function hasKw(text,kws){var t=' '+String(text||'').toLowerCase()+' ';return kws.filter(function(k){var w=k.toLowerCase().split(/\s+/).filter(function(x){return x.length>3}).map(function(x){return x.replace(/(ing|ed|es|s|ly|ity)$/,'')});
  return w.length&&w.some(function(x){return t.indexOf(x)>=0})})}
function blank(){return {tab:0,m:{},kw:'',prof:{kind:'cv',text:''},q:'adapt',own:'',ownK:'comp',star:{s:'',t:'',a:'',r:''},saved:[],goal:'',who:'',plan:[],aiStar:'',aiProf:'',done:false}}
function norm(S){var b=blank();for(var k in b)if(S[k]==null)S[k]=b[k];return S}
function copyText(text,ctx,msg){
  function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();ctx.toast(ok?msg:'Select the text and copy it manually')}
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){ctx.toast(msg)},fb);else fb()}catch(e){fb()}}

function areaScore(S,a){var it=a.items,ans=it.filter(function(i){return S.m[i[0]]}),sum=ans.reduce(function(t,i){return t+MARK.filter(function(m){return m[0]===S.m[i[0]]})[0][2]},0);
  return {answered:ans.length,total:it.length,pct:it.length?Math.round(sum/it.length*100):0}}
function overall(S){var all=0,sum=0,ans=0;AREAS.forEach(function(a){a.items.forEach(function(i){all++;var v=S.m[i[0]];if(v){ans++;sum+=MARK.filter(function(m){return m[0]===v})[0][2]}})});return {pct:all?Math.round(sum/all*100):0,answered:ans,total:all}}
function gaps(S){var g=[];AREAS.forEach(function(a){a.items.forEach(function(i){var v=S.m[i[0]];if(v==='n'||v==='p')g.push({area:a,id:i[0],l:i[1],w:i[2],act:i[3],v:v})})});
  return g.sort(function(x,y){return (x.v==='n'?0:1)-(y.v==='n'?0:1)})}

/* ---------- profile checker ---------- */
function profChecks(P,kws){
  var t=P.text.trim(),n=words(t),paras=t.split(/\n\s*\n|\n/).filter(function(x){return x.trim()}).length,out=[];
  function add(l,w,ok,msg){out.push({l:l,w:w,ok:!!ok,msg:msg})}
  var cl=uniq(t.match(CLICHE)||[]);
  add('Not vague or generic','The mistake many people make is a vague, generic profile. These phrases could describe almost anyone.',cl.length<=1,'Generic phrases: "'+cl.slice(0,5).join('", "')+'". Replace each with what you actually did.');
  add('Backed by concrete facts','Back it up with some concrete facts - numbers and specifics make it believable and memorable.',/\d|£|%/.test(t),'Add a number: how many, how much, how long, by what percentage.');
  add('Shows the benefit to the employer','As in the Week 7 example: say why your strength matters to them.',/\b(so that|which means|because|to ensure|helping|helped|saving|saved|so they|enabl\w*)\b/i.test(t),'Add the benefit: "...so that customers..." or "...which saved..."');
  add('Unique to you: your brand shows','Weave in the strengths and values from your brand so it could only be you.',kws.length?hasKw(t,kws).length>=1:false,kws.length?'None of your brand words ('+kws.slice(0,4).join(', ')+') appear.':'Enter your brand words at the top of this tab first.');
  if(P.kind==='cv')add('Short enough to be read','A CV profile is a clear introduction that grabs attention and makes them read on: roughly 40-120 words.',n>=40&&n<=120,n<40?'Only '+n+' words - add a fact or an example.':n+' words - cut it to 120 or fewer.');
  else add('Two or three paragraphs','The LinkedIn summary is usually no more than two or three paragraphs.',paras>=2&&paras<=3&&n>=60,paras<2?'Split it into two or three short paragraphs.':paras>3?'Merge it into three paragraphs at most.':'Add more detail ('+n+' words).');
  return out;
}

/* ---------- STAR checks ---------- */
function starChecks(S,Q){
  var st=S.star,n={s:words(st.s),t:words(st.t),a:words(st.a),r:words(st.r)},tot=n.s+n.t+n.a+n.r,kws=kwList(S.kw),out=[];
  function add(l,w,ok,msg){out.push({l:l,w:w,ok:!!ok,msg:msg})}
  var miss=STARF.filter(function(f){return n[f[0]]<5}).map(function(f){return f[1]});
  add('All four parts','Situation, Task, Action, Result: each needs at least a sentence.',!miss.length,'Still thin: '+miss.join(', ')+'.');
  var ap=tot?Math.round(n.a/tot*100):0;
  add('The emphasis is on your action','Put the emphasis on the action you took - aim for at least 40% of your words.',ap>=40,'Action is '+ap+'% of your answer. Add the steps you took; trim the scene-setting.');
  var stp=tot?Math.round((n.s+n.t)/tot*100):0;
  add('Situation and task are brief','The scene only needs enough for the reader to follow.',tot&&stp<=40,stp+'% of your words set the scene. Aim for 40% or less.');
  var I=(st.a.match(/\b(i|i'm|i've|i'd|me|my)\b/gi)||[]).length,we=(st.a.match(/\b(we|our|us|the team)\b/gi)||[]).length;
  add('"I", not just "we"','The employer is hiring you: show what you personally did.',I>=1&&I>=we,I?'You say "we" '+we+' times and "I" '+I+'. Make your own part clear.':'Say what you did ("I...").');
  add('A concrete result','A result with a number, outcome or feedback shows it worked.',/\d|%|£|\b(result\w*|so that|improv\w*|reduc\w*|increas\w*|achiev\w*|feedback|prais\w*|sav\w*|won|award\w*|promot\w*|thank\w*|learn\w*)\b/i.test(st.r),'Say what changed: a number, feedback you received, or what you learned.');
  var re=Q.re;if(!re&&Q.q){var qw=Q.q.toLowerCase().match(/[a-z]{5,}/g)||[];re=qw.length?new RegExp('\\b('+qw.slice(0,8).join('|')+')','i'):null}
  var all=st.s+' '+st.t+' '+st.a+' '+st.r;
  add('Answers the actual question',Q.k==='str'?'A strengths-based question asks what you enjoy, not just what you can do.':'A competency question tests a specific skill - stay on it.',re?re.test(all):words(all)>20,Q.need?'Make sure you '+Q.need+'.':'Link your answer back to the question.');
  add('Your brand shows through','Week 7: make sure your personal brand is reflected in each answer.',kws.length&&hasKw(all,kws).length>=1,kws.length?'Mention one of your brand words: '+kws.slice(0,4).join(', ')+'.':'Enter your brand words at the top of this tab.');
  add('A sensible length','Long enough for evidence, short enough to read: about 120-350 words for an application form.',tot>=120&&tot<=350,tot<120?tot+' words - add detail to the action and result.':tot+' words - trim the situation.');
  return {list:out,n:n,tot:tot};
}

/* ---------- styles ---------- */
var CSS=[
'.ba-tabs{display:flex;gap:6px;overflow-x:auto;margin:0 0 14px;scrollbar-width:none}',
'.ba-tab{flex:0 0 auto;border:0;border-radius:999px;min-height:44px;padding:8px 14px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}',
'.ba-tab.on{background:var(--ink);color:var(--bg)}',
'.ba-tab small{font-family:var(--mono);margin-left:6px;opacity:.75}',
'.ba-it{display:grid;grid-template-columns:1fr auto;gap:8px 14px;padding:12px 0;border-bottom:1px solid var(--line);align-items:center}',
'.ba-it:last-child{border-bottom:0}',
'@media(max-width:620px){.ba-it{grid-template-columns:1fr}}',
'.ba-it .w{font-size:.82rem;color:var(--ink2);margin-top:3px}',
'.ba-seg{display:inline-flex;border-radius:999px;background:var(--surface2);padding:3px;gap:3px}',
'.ba-seg button{border:0;border-radius:999px;min-height:40px;min-width:64px;padding:6px 12px;background:transparent;cursor:pointer;font-size:.85rem;color:var(--ink2)}',
'.ba-seg button.on.y{background:var(--green);color:#fff}.ba-seg button.on.p{background:var(--amber);color:#fff}.ba-seg button.on.n{background:var(--red);color:#fff}',
'.ba-meter{display:grid;grid-template-columns:120px 1fr 48px;gap:10px;align-items:center;margin:8px 0;font-size:.9rem}',
'@media(max-width:420px){.ba-meter{grid-template-columns:104px 1fr 44px}.ba-meter .btn{font-size:.8rem}}',
'.ba-meter b{font-family:var(--mono);text-align:right}','.ba-meter .btn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
'.ba-chk{display:grid;grid-template-columns:28px 1fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}',
'.ba-chk:last-child{border-bottom:0}',
'.ba-mark{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;border:1.5px solid var(--dot)}',
'.ba-mark.ok{background:var(--green);border-color:var(--green);color:#fff}.ba-mark.no{border-color:var(--red);color:var(--red)}',
'.ba-star{display:flex;height:14px;border-radius:99px;overflow:hidden;background:var(--line);margin:8px 0 4px}',
'.ba-star i{display:block;height:100%;transition:width .3s}',
'.ba-leg{display:flex;gap:12px;flex-wrap:wrap;font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}',
'.ba-leg span:before{content:"";display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:var(--c)}',
'.ba-f{border-left:3px solid var(--ink3);padding:0 0 0 12px;margin:0 0 12px}',
'.ba-f.a{border-color:var(--red)}',
'.ba-q{display:block;width:100%;text-align:left;border:1.5px solid var(--line);border-radius:var(--r-sm);background:var(--surface);padding:10px 12px;margin:0 0 8px;cursor:pointer;min-height:44px;font:inherit;color:inherit}',
'.ba-q.on{border-color:var(--ink);box-shadow:inset 4px 0 0 var(--red);background:var(--surface2)}',
'.ba-q .k{display:block;font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);margin-bottom:3px}',
'.ba-gk{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0}',
'@media(max-width:620px){.ba-gk{grid-template-columns:1fr}}',
'.ba-gap{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}',
'.ba-gap:last-child{border-bottom:0}',
'.ba-plan{display:grid;grid-template-columns:44px 1fr;gap:8px 10px;align-items:start;background:var(--surface2);border-radius:var(--r-sm);padding:10px;margin:0 0 8px}',
'.ba-plan input[type=checkbox]{width:26px;height:26px;margin:9px;accent-color:var(--green)}',
'.ba-plan .r{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}',
'.ba-plan .r .input{width:auto;flex:1;min-width:140px}',
'.ba-plan.done .t{text-decoration:line-through;color:var(--ink2)}',
'.ba-nav{display:flex;justify-content:space-between;gap:10px;margin-top:14px;flex-wrap:wrap}'
].join('\n');
var COLS={s:'var(--ink3)',t:'var(--ink2)',a:'var(--red)',r:'var(--green)'};

/* ---------- mount ---------- */
Tools.register('brand-audit',{title:'Brand Presence Audit',desc:'Audit your online and offline brand, build STAR answers and plan your next actions.',
mount:function(el,ctx){
  if(!document.getElementById('ba-css')){var st=document.createElement('style');st.id='ba-css';st.textContent=CSS;document.head.appendChild(st)}
  var S=norm(ctx.load()||blank());
  var ui={busy:'',tok:'',confirm:false};
  var TABS=['Footprint','Online','Writing','In person','STAR','Plan'];
  var live=[];
  function save(){ctx.save(S)}
  function changed(){save();live.forEach(function(f){f()});maybeDone()}
  function go(i){S.tab=i;save();render();var t=el.querySelector('.ba-tabs');if(t)t.scrollIntoView({block:'nearest'})}
  function curQ(){var q=QUESTIONS.filter(function(x){return x.id===S.q})[0]||QUESTIONS[0];if(q.id==='own')return {id:'own',k:S.ownK,q:S.own,src:'Your own question',re:null,need:''};return q}
  function maybeDone(){var o=overall(S);if(!S.done&&o.answered>=o.total*0.8&&(S.plan.length>=1||S.saved.length>=1)){S.done=true;save();ctx.complete(Math.max(0.3,o.pct/100))}}
  function inp(val,ph,on,attrs){var e=h('input',Object.assign({class:'input',value:val||'',placeholder:ph||''},attrs||{}));e.addEventListener('input',function(){on(e.value);changed()});return e}
  function area(val,ph,on,rows,attrs){var e=h('textarea',Object.assign({class:'textarea',placeholder:ph||'',style:{minHeight:(rows||3)*26+'px'}},attrs||{}));e.value=val||'';e.addEventListener('input',function(){on(e.value);changed()});return e}
  function chkList(list){return list.map(function(c){return h('div',{class:'ba-chk'},h('div',{class:'ba-mark '+(c.ok?'ok':'no'),'aria-label':c.ok?'Pass':'Not yet'},c.ok?'✓':'!'),
    h('div',null,h('b',null,c.l),h('div',{class:'tiny muted'},c.w),c.ok?null:h('div',{class:'tiny bad',style:{marginTop:'3px'}},c.msg)))})}
  function nav(i){return h('div',{class:'ba-nav'},i>0?h('button',{class:'btn ghost',onclick:function(){go(i-1)}},'Back'):h('span'),i<TABS.length-1?h('button',{class:'btn primary',onclick:function(){go(i+1)}},'Next: '+TABS[i+1].toLowerCase()):null)}
  function aiBox(key,label){var box=h('div',null);function d(){box.innerHTML='';if(ui.busy===key)box.appendChild(h('div',{class:'ai-box',role:'status'},h('span',{class:'label'},label),ui.tok||'Thinking...'));
      else if(S[key])box.appendChild(h('div',{class:'ai-box',style:{marginTop:'10px'}},h('span',{class:'label'},label),S[key]))}d();box.redraw=d;return box}
  function kwField(){return h('label',{class:'card flat',style:{display:'block'}},h('span',{class:'label'},'My brand words'),
    h('p',{class:'tiny muted',style:{margin:'4px 0 8px'}},'Your key strengths and values from Week 4, separated by commas. The checks look for them, because your brand should show in every answer.'),
    inp(S.kw,'e.g. concern for others, creativity, calm in a crisis',function(t){S.kw=t},{'aria-label':'My brand words'}))}

  /* --- audit tabs --- */
  function auditTab(ai){
    var a=AREAS[ai],w=h('div',null),sc=areaScore(S,a);
    var bar=h('div',{class:'bar'+(sc.pct<50?' red':'')},h('i',{style:{width:sc.pct+'%'}})),lab=h('b',{style:{fontFamily:'var(--mono)'}},sc.pct+'%'),ans=h('span',{class:'tiny muted'},sc.answered+' of '+sc.total+' answered');
    w.appendChild(h('div',{class:'card flat'},h('div',{class:'row between'},h('h3',{style:{margin:0}},a.n),lab),bar,h('div',{style:{marginTop:'6px'}},ans),h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},a.intro)));
    var list=h('div',{class:'card'});
    a.items.forEach(function(it){
      var segEl=h('div',{class:'ba-seg',role:'group','aria-label':it[1]});
      function paint(){segEl.innerHTML='';MARK.forEach(function(m){var on=S.m[it[0]]===m[0];segEl.appendChild(h('button',{class:m[0]+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){
        S.m[it[0]]=on?undefined:m[0];if(!S.m[it[0]])delete S.m[it[0]];save();paint();var s2=areaScore(S,a);bar.firstChild.style.width=s2.pct+'%';bar.className='bar'+(s2.pct<50?' red':'');lab.textContent=s2.pct+'%';ans.textContent=s2.answered+' of '+s2.total+' answered';var bd=el.querySelector('.ba-tab.on small');if(bd)bd.textContent=s2.answered===s2.total?s2.pct+'%':s2.answered+'/'+s2.total;
        tip.className=S.m[it[0]]==='n'||S.m[it[0]]==='p'?'tiny':'tiny hide';maybeDone()}},m[1]))})}
      var tip=h('div',{class:S.m[it[0]]==='n'||S.m[it[0]]==='p'?'tiny':'tiny hide',style:{marginTop:'4px'}},h('b',{class:'bad'},'Action: '),it[3]);
      paint();
      list.appendChild(h('div',{class:'ba-it'},h('div',null,h('b',null,it[1]),h('div',{class:'w'},it[2]),tip),segEl))});
    w.appendChild(list);
    if(a.id==='write')w.appendChild(profileChecker());
    w.appendChild(nav(ai));return w}

  function profileChecker(){
    var P=S.prof,card=h('div',{class:'card'},h('h3',null,'Profile checker'),h('p',{class:'tiny muted'},'Paste your CV personal profile or LinkedIn summary. It must be unique to you, backed up by concrete facts, and consistent with the rest of your CV.'));
    card.appendChild(kwField());
    card.appendChild(h('div',{class:'row',style:{margin:'10px 0'}},[['cv','CV personal profile'],['li','LinkedIn summary']].map(function(k){return h('button',{class:'chip'+(P.kind===k[0]?' on':''),'aria-pressed':P.kind===k[0]?'true':'false',onclick:function(){P.kind=k[0];save();render()}},k[1])}),
      h('button',{class:'chip',onclick:function(){P.kind='cv';P.text=EXAMPLE_PROFILE;save();render()}},'Load the course example')));
    var ta=area(P.text,P.kind==='cv'?'Your personal profile (3-5 sentences)':'Your LinkedIn summary (two or three paragraphs)',function(t){P.text=t},5,{'aria-label':'Profile text'});
    card.appendChild(ta);
    var res=h('div',{style:{marginTop:'10px'}});
    function draw(){res.innerHTML='';if(words(P.text)<5){res.appendChild(h('p',{class:'tiny muted'},'Write or paste at least a sentence to check it.'));return}
      var cs=profChecks(P,kwList(S.kw)),p=cs.filter(function(c){return c.ok}).length;
      res.appendChild(h('div',{class:'row between'},h('span',{class:'label'},'Profile score'),h('b',{style:{fontFamily:'var(--mono)'}},p+' / '+cs.length)));
      res.appendChild(h('div',null,chkList(cs)))}
    draw();live.push(draw);card.appendChild(res);
    var aib=aiBox('aiProf','AI feedback on your profile');
    if(ctx.ai.available()){
      var b=h('button',{class:'btn',style:{marginTop:'10px'},onclick:function(){if(words(P.text)<10){ctx.toast('Write a little more first');return}
        ui.busy='aiProf';ui.tok='';aib.redraw();b.disabled=true;
        ctx.ai.feedback({question:'Give feedback on this '+(P.kind==='cv'?'CV personal profile':'LinkedIn summary')+'. It should be unique to the writer, backed by concrete facts and show their personal brand.',answer:P.text,
          points:['Avoids vague, generic phrases','Includes concrete facts or numbers','Shows the benefit to an employer','Reflects the writer\'s strengths and values'+(S.kw?' ('+S.kw+')':'')],onToken:function(t){ui.tok=t;aib.redraw()}})
        .then(function(r){ui.busy='';b.disabled=false;S.aiProf=r.text;save();aib.redraw()})
        .catch(function(){ui.busy='';b.disabled=false;S.aiProf='The AI could not respond. Use the checks above.';save();aib.redraw()})}},'Ask AI for feedback');
      card.appendChild(b)}
    card.appendChild(aib);
    return card}

  /* --- STAR --- */
  function starTab(){
    var w=h('div',null),Q=curQ();
    w.appendChild(h('div',{class:'callout note'},h('b',null,'STAR: '),'Situation, Task, Action, Result - put the emphasis on the action you took. Competency questions test what you can do; strengths-based questions focus on what you enjoy doing. Either way, make sure your brand is reflected in the answer.'));
    w.appendChild(kwField());
    var qs=h('div',{class:'card'},h('span',{class:'label'},'Choose a question'));
    QUESTIONS.forEach(function(q){var on=S.q===q.id;qs.appendChild(h('button',{class:'ba-q'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){S.q=q.id;S.aiStar='';save();render()}},
      h('span',{class:'k'},(q.id==='own'?'Custom':(q.k==='comp'?'Competency':'Strengths-based'))+' · '+q.src),q.id==='own'?'Write your own question (e.g. from a real application form)':q.q))});
    if(S.q==='own'){qs.appendChild(inp(S.own,'Type the question',function(t){S.own=t},{'aria-label':'Your own question'}));
      qs.appendChild(h('div',{class:'row',style:{marginTop:'8px'}},[['comp','Competency'],['str','Strengths-based']].map(function(k){return h('button',{class:'chip'+(S.ownK===k[0]?' on':''),'aria-pressed':S.ownK===k[0]?'true':'false',onclick:function(){S.ownK=k[0];save();render()}},k[1])})))}
    w.appendChild(qs);
    var fc=h('div',{class:'card'});
    var dist=h('div',{class:'ba-star','aria-hidden':'true'}),leg=h('div',{class:'ba-leg'}),tot=h('div',{class:'tiny muted'});
    STARF.forEach(function(f){var c=h('span',{class:'tiny muted'});
      var ta=area(S.star[f[0]],f[2],function(t){S.star[f[0]]=t},f[0]==='a'?4:2,{'aria-label':f[1]});
      function upd(){c.textContent=words(S.star[f[0]])+' words'}upd();live.push(upd);
      fc.appendChild(h('div',{class:'ba-f'+(f[0]==='a'?' a':'')},h('div',{class:'row between'},h('span',{class:'label'},f[1]),c),ta))});
    fc.appendChild(dist);fc.appendChild(leg);fc.appendChild(tot);
    w.appendChild(fc);
    var res=h('div',{class:'card'});
    function draw(){var r=starChecks(S,curQ());dist.innerHTML='';leg.innerHTML='';
      STARF.forEach(function(f){var p=r.tot?r.n[f[0]]/r.tot*100:0;dist.appendChild(h('i',{style:{width:p+'%',background:COLS[f[0]]}}));var sp=h('span',null,f[1]+' '+Math.round(p)+'%');sp.style.setProperty('--c',COLS[f[0]]);leg.appendChild(sp)});
      tot.textContent=r.tot+' words in total';
      var p=r.list.filter(function(c){return c.ok}).length;res.innerHTML='';
      res.appendChild(h('div',{class:'row between'},h('span',{class:'label'},'STAR check'),h('b',{style:{fontFamily:'var(--mono)',fontSize:'1.3rem'}},p+' / '+r.list.length)));
      res.appendChild(h('div',null,chkList(r.list)))}
    draw();live.push(draw);w.appendChild(res);
    var aib=aiBox('aiStar','AI feedback');
    var row=h('div',{class:'row'});
    row.appendChild(h('button',{class:'btn primary',onclick:function(){var r=starChecks(S,curQ());if(r.tot<20){ctx.toast('Write your answer first');return}
      var q=curQ();S.saved.unshift({q:q.q||'(your question)',k:q.k,star:JSON.parse(JSON.stringify(S.star)),score:r.list.filter(function(c){return c.ok}).length+'/'+r.list.length});S.saved=S.saved.slice(0,6);save();maybeDone();render();ctx.toast('Answer saved')}},'Save this answer'));
    if(ctx.ai.available()){var ab=h('button',{class:'btn',onclick:function(){var r=starChecks(S,curQ());if(r.tot<30){ctx.toast('Write a little more first');return}
      ui.busy='aiStar';ui.tok='';aib.redraw();ab.disabled=true;var q=curQ();
      ctx.ai.feedback({question:'Application form question ('+(q.k==='str'?'strengths-based':'competency')+'): '+(q.q||'your own question')+' The answer should use STAR with the emphasis on the action.',
        answer:STARF.map(function(f){return f[1]+': '+S.star[f[0]]}).join('\n'),
        points:['Briefly sets out the situation and task','Focuses on the actions the writer personally took','Gives a concrete result','Answers the question asked','Reflects the writer\'s brand'+(S.kw?' ('+S.kw+')':'')],onToken:function(t){ui.tok=t;aib.redraw()}})
      .then(function(x){ui.busy='';ab.disabled=false;S.aiStar=x.text;save();aib.redraw()})
      .catch(function(){ui.busy='';ab.disabled=false;S.aiStar='The AI could not respond. Use the STAR check above.';save();aib.redraw()})}},'Ask AI for feedback');row.appendChild(ab)}
    row.appendChild(h('button',{class:'btn ghost',onclick:function(){S.star={s:'',t:'',a:'',r:''};S.aiStar='';save();render()}},'Clear answer'));
    w.appendChild(row);w.appendChild(aib);
    if(S.saved.length){var sv=h('div',{class:'card flat',style:{marginTop:'14px'}},h('span',{class:'label'},'My saved answers'));
      S.saved.forEach(function(x,i){sv.appendChild(h('div',{class:'ba-gap'},h('div',{style:{minWidth:0}},h('div',{class:'tiny muted'},(x.k==='str'?'Strengths':'Competency')+' · check '+x.score),h('div',null,x.q.length>90?x.q.slice(0,89)+'…':x.q)),
        h('div',{class:'row',style:{gap:'6px',flexWrap:'nowrap'}},h('button',{class:'btn sm',onclick:function(){S.star=JSON.parse(JSON.stringify(x.star));var m=QUESTIONS.filter(function(q){return q.q===x.q})[0];if(m){S.q=m.id}else{S.q='own';S.own=x.q;S.ownK=x.k}save();render()}},'Open'),
          h('button',{class:'btn sm ghost','aria-label':'Delete saved answer',onclick:function(){S.saved.splice(i,1);save();render()}},'×'))))});
      w.appendChild(sv)}
    w.appendChild(nav(4));return w}

  /* --- plan --- */
  function planText(){var o=overall(S),L=['MY BRAND PROMOTION PLAN',''];var g=GOALKINDS.filter(function(k){return k.id===S.goal})[0];
    if(g)L.push('Career goal: '+g.n);if(S.who)L.push('Target audience: '+S.who);
    L.push('','Audit: '+o.pct+'% ('+o.answered+'/'+o.total+' answered)');AREAS.forEach(function(a){L.push('- '+a.n+': '+areaScore(S,a).pct+'%')});
    L.push('','ACTIONS');S.plan.forEach(function(p,i){L.push((i+1)+'. '+(p.done?'[done] ':'')+p.t+(p.when?' - by '+p.when:''))});return L.join('\n')}
  function planTab(){
    var w=h('div',null),o=overall(S);
    var sc=h('div',{class:'card flat'},h('div',{class:'row between'},h('h3',{style:{margin:0}},'Brand presence score'),h('b',{style:{fontFamily:'var(--mono)',fontSize:'1.5rem'}},o.pct+'%')),
      h('p',{class:'tiny muted',style:{margin:'4px 0 8px'}},o.answered+' of '+o.total+' items answered. Yes counts 1, partly 0.5.'));
    AREAS.forEach(function(a,i){var s=areaScore(S,a);sc.appendChild(h('div',{class:'ba-meter'},h('button',{class:'btn sm ghost',style:{justifyContent:'flex-start',padding:'4px 10px'},onclick:function(){go(i)}},a.short),
      h('div',{class:'bar'+(s.pct<50?' red':'')},h('i',{style:{width:s.pct+'%'}})),h('b',null,s.pct+'%')))});
    if(o.answered<o.total)sc.appendChild(h('p',{class:'tiny bad',style:{margin:'6px 0 0'}},(o.total-o.answered)+' items not answered yet - unanswered items count as zero.'));
    w.appendChild(sc);
    var gc=h('div',{class:'card'},h('span',{class:'label'},'Who are you promoting yourself to? (Week 5)'));
    gc.appendChild(h('div',{class:'ba-gk'},GOALKINDS.map(function(k){var on=S.goal===k.id;return h('button',{class:'ba-q'+(on?' on':''),'aria-pressed':on?'true':'false',onclick:function(){S.goal=on?'':k.id;save();render()}},h('b',null,k.n),h('div',{class:'tiny muted'},k.d))})));
    var g=GOALKINDS.filter(function(k){return k.id===S.goal})[0];
    if(g)gc.appendChild(h('div',{class:'callout tip'},h('b',null,'Likely audience: '),g.aud,h('div',{class:'tiny',style:{marginTop:'6px'}},PRONGS)));
    gc.appendChild(inp(S.who,'Name your audience: who exactly?',function(t){S.who=t},{'aria-label':'Your target audience'}));
    w.appendChild(gc);
    var gp=gaps(S),gl=h('div',{class:'card'},h('span',{class:'label'},'Biggest gaps - add the ones that matter to your plan'));
    var inPlan=S.plan.map(function(p){return p.src});
    if(!gp.length)gl.appendChild(h('p',{class:'tiny muted'},o.answered?'No gaps marked. Add your own action below.':'Answer the audit items first; anything marked "Not yet" or "Partly" appears here.'));
    gp.slice(0,6).forEach(function(x){var added=inPlan.indexOf(x.id)>=0;gl.appendChild(h('div',{class:'ba-gap'},h('div',{style:{minWidth:0}},h('div',{class:'tiny muted'},x.area.short+' · '+(x.v==='n'?'not yet':'partly')),h('div',null,x.act)),
      h('button',{class:'btn sm'+(added?' ghost':''),disabled:added||S.plan.length>=5,onclick:function(){S.plan.push({t:x.act,when:'',done:false,src:x.id});save();maybeDone();render()}},added?'Added':'Add')))});
    if(gp.length>6)gl.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'+'+(gp.length-6)+' more gaps. Start with these - do a few things well.'));
    w.appendChild(gl);
    var pc=h('div',{class:'card'},h('div',{class:'row between'},h('span',{class:'label'},'My action plan ('+S.plan.length+'/5)'),S.plan.length?h('span',{class:'tiny muted'},S.plan.filter(function(p){return p.done}).length+' done'):null));
    S.plan.forEach(function(p,i){var cb=h('input',{type:'checkbox','aria-label':'Done: '+p.t});cb.checked=!!p.done;cb.addEventListener('change',function(){p.done=cb.checked;save();render()});
      var d=h('input',{class:'input',type:'date',value:p.when||'','aria-label':'Complete by'});d.addEventListener('change',function(){p.when=d.value;save();render()});
      pc.appendChild(h('div',{class:'ba-plan'+(p.done?' done':'')},cb,h('div',null,h('div',{class:'t'},p.t),h('div',{class:'r'},h('span',{class:'tiny muted'},'By'),d,
        h('button',{class:'btn sm ghost','aria-label':'Remove action',onclick:function(){S.plan.splice(i,1);save();render()}},'Remove')),
        p.when?null:h('div',{class:'tiny bad',style:{marginTop:'4px'}},'Add a date - a goal without a deadline rarely happens.'))))});
    var ni=h('input',{class:'input',placeholder:'Add your own action, e.g. "Comment on two posts in my LinkedIn group"',style:{flex:'1',minWidth:'0'},'aria-label':'Your own action'});
    function addOwn(){var t=uc(ni.value.trim());if(words(t)<3){ctx.toast('Describe the action in a few words');return}if(S.plan.length>=5){ctx.toast('Five actions is plenty - finish one first');return}S.plan.push({t:t,when:'',done:false,src:''});save();maybeDone();render()}
    ni.addEventListener('keydown',function(e){if(e.key==='Enter')addOwn()});
    pc.appendChild(h('div',{class:'row',style:{flexWrap:'nowrap',marginTop:'6px'}},ni,h('button',{class:'btn',onclick:addOwn},'Add')));
    pc.appendChild(h('p',{class:'tiny muted',style:{margin:'10px 0 0'}},'Keep it to five actions at most. Your brand is not just a tool to get a job - maintain it all the time and keep your messages consistent wherever your employer might see them.'));
    w.appendChild(pc);
    w.appendChild(h('div',{class:'row'},h('button',{class:'btn primary',disabled:!S.plan.length,onclick:function(){copyText(planText(),ctx,'Plan copied')}},'Copy plan as text'),
      ui.confirm?null:h('button',{class:'btn ghost',onclick:function(){ui.confirm=true;render()}},'Reset everything')));
    if(ui.confirm)w.appendChild(h('div',{class:'callout',style:{marginTop:'12px'}},h('p',null,'Clear the audit, answers and plan?'),h('div',{class:'row'},
      h('button',{class:'btn red',onclick:function(){S=blank();ui.confirm=false;save();render()}},'Clear all'),h('button',{class:'btn ghost',onclick:function(){ui.confirm=false;render()}},'Cancel'))));
    w.appendChild(nav(5));return w}

  function render(){
    live=[];el.style.minHeight=el.offsetHeight+'px';el.innerHTML='';
    var tabs=h('div',{class:'ba-tabs',role:'tablist'},TABS.map(function(t,i){var badge=null;
      if(i<4){var s=areaScore(S,AREAS[i]);badge=h('small',null,s.answered===s.total?s.pct+'%':s.answered+'/'+s.total)}
      return h('button',{class:'ba-tab'+(S.tab===i?' on':''),role:'tab','aria-selected':S.tab===i?'true':'false',onclick:function(){go(i)}},(i+1)+' '+t,badge)}));
    var body=S.tab<4?auditTab(S.tab):S.tab===4?starTab():planTab();
    el.appendChild(h('div',{class:'tool'},tabs,body));el.style.minHeight='';
    var on=tabs.querySelector('.on');if(on){var d=on.getBoundingClientRect().left-tabs.getBoundingClientRect().left;if(d+on.offsetWidth>tabs.clientWidth||d<0)tabs.scrollLeft+=d-40}
  }
  render();
}});
})();

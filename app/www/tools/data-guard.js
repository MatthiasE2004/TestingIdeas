/* Data Guard - information security and responsibilities practice.
   "Hybrid working: skills for digital transformation", Section 5:
   5.1 digital wellbeing, safety and security (Figure 4, Table 7 online/offline tips), 5.3 the seven UK GDPR principles (Table 8)
   and the GitLab SAFE framework (Figure 7), 5.4 IP and copyright (two angles, deeplinking), 5.5 the CIA triad and common
   security threats (Imperva), 5.6 information classification (Table 9) and digital knowledge management basics,
   and the zero-trust approach (Jonathan Morgan, Object Matrix).
   Tool id: data-guard. Plain ES2017. State saved with ctx.save on every change. */
(function(){
var h=H.h;

/* ---------- Table 9 classification ---------- */
var CLS=[
 {id:'u',n:'Unclassified',d:'Not particularly valuable; no requirement to protect it. Anyone can access it, including the public.'},
 {id:'i',n:'Internal only',d:'Has value internally and may have some value to competitors. Can be shared freely inside the organisation.'},
 {id:'c',n:'Confidential',d:'Significant value; there may be legal requirements to protect it. Access limited to designated roles.'}];
var ITEMS=[
 {t:'A press release announcing a new short course',a:'u',w:'Press releases are written to be released to the public - Table 9 gives them as an example of unclassified information.'},
 {t:'An internal memo about the new desk-booking system',a:'i',w:'Internal memos have value inside the organisation and can be shared with anyone there, but not outside: internal only.'},
 {t:'Customer payment card details taken for course fees',a:'c',w:'Customer payment details have significant value and legal protection requirements, so access is limited to designated roles: confidential.'},
 {t:'An advert for a job vacancy in your team',a:'u',w:'Job vacancies are meant to be seen by anyone - Table 9 lists them as unclassified.'},
 {t:'Contract information for a supplier your department uses',a:'i',w:'Contract information is a Table 9 example of internal only: valuable internally and possibly to competitors.'},
 {t:'The draft five-year strategic plan for the university',a:'c',w:'Long-term strategic planning is a Table 9 example of confidential information - access is limited to designated roles or tiers.'},
 {t:'Design files for an innovation project that has not been announced',a:'c',w:'This is intellectual property with significant value. Section 5.4 warns it may be inadvisable to share details of a commercially sensitive innovation project.'},
 {t:'Employment data, such as your team\'s contract types and start dates',a:'i',w:'Table 9 lists employment data as internal only. Because it is also personal data, the GDPR principles still apply to how you handle it.'},
 {t:'The module timetable already published on the public website',a:'u',w:'It is already public, has no protection requirement and anyone can use it: unclassified.'},
 {t:'Notes from your weekly team meeting',a:'i',w:'Meeting notes have value inside the organisation but are not for the public: internal only.'}];

/* ---------- scenarios ---------- */
var TOPICS=[['cia','CIA triad'],['gdpr','GDPR'],['threat','Threats'],['ip','IP and copyright'],['safe','SAFE and zero trust'],['well','Wellbeing']];
var SC=[
 {k:'cia',t:'The kitchen table',s:'You are editing an unreleased promotional video at home. Your laptop stays open on the kitchen table while family members come and go.',
  o:['That is fine - it is your own home','Lock the screen whenever you step away, position it so others cannot see it, and put the device away securely when not in use','Copy the video to your personal phone so you can keep it with you'],a:1,
  w:'Jonathan Morgan describes exactly this risk: can someone else in the household see the data? Is it left on a coffee table? Table 7 asks who can see your screen, whether you lock your computer and where you secure devices. Copying to a personal phone creates an unmanaged extra copy.',
  cq:'Which part of the CIA triad is most at risk?',co:['Confidentiality','Integrity','Availability'],ca:0,cw:'Confidentiality: only authorised people, in relation to their role, should have access to information.'},
 {k:'cia',t:'Who changed the marks?',s:'A shared spreadsheet of assessment marks can be edited by the whole department. Several marks were overwritten by mistake and nobody can tell who changed what.',
  o:['Restrict editing to the roles that need it and use version history to restore and track changes','Give everyone their own copy to edit','Leave it - the marks were roughly right'],a:0,
  w:'Data must be accurate, consistent and used for its intended purpose, with controls that stop it being modified. Separate copies break another DKM basic - do not duplicate files.',
  cq:'Which part of the CIA triad was damaged?',co:['Confidentiality','Integrity','Availability'],ca:1,cw:'Integrity: information must be accurate and consistent, with non-repudiation and authenticity controls to stop it being modified or destroyed.'},
 {k:'cia',t:'The dead laptop',s:'The day before a deadline your laptop suddenly stops working - a total hardware failure. Which habit means you lose nothing?',
  o:['Saving everything to the desktop so it is quick to find','Saving work in the correct place on the organisation\'s servers / cloud','Keeping the only copy on a USB stick in your bag'],a:1,
  w:'Section 4: the author\'s laptop died, but no work was lost because it was all on the servers and accessible from a new laptop. Saving to the correct location (not your desktop or own hard drive) and backing up are DKM basics.',
  cq:'Which part of the CIA triad does this habit protect?',co:['Confidentiality','Integrity','Availability'],ca:2,cw:'Availability: information is readily available, with reliable access to it.'},
 {k:'gdpr',t:'The alumni newsletter',s:'A colleague producing an alumni newsletter asks you to send the whole alumni database: names, addresses, dates of birth, grades and email addresses.',
  o:['Send the whole database - they are a colleague','Send only the names and email addresses the newsletter needs, by the approved secure route','Post it in the team chat so everyone has it to hand'],a:1,
  w:'Personal data must be adequate, relevant and limited to what is necessary for the purpose. Posting it to a whole team also breaks confidentiality.',
  cq:'Which GDPR principle is this?',co:['Data minimisation','Accuracy','Storage limitation','Accountability'],ca:0,cw:'Data minimisation: limited to what is necessary in relation to the purposes for which it is processed.'},
 {k:'gdpr',t:'A new use for old emails',s:'Applicants gave their email addresses so you could send them interview times. Marketing now wants to use the list to promote a paid conference.',
  o:['Use it - you already have the data','Do not reuse it for an incompatible purpose; check with your data protection lead first','Use it, but leave out the unsubscribe link'],a:1,
  w:'Personal data is collected for specified, explicit and legitimate purposes and must not be further processed in a way that is incompatible with them.',
  cq:'Which GDPR principle is this?',co:['Purpose limitation','Data minimisation','Integrity and confidentiality','Accuracy'],ca:0,cw:'Purpose limitation.'},
 {k:'gdpr',t:'Spreadsheets from 2016',s:'Tidying a shared drive, you find spreadsheets of student contact details from projects that ended eight years ago. Nobody uses them.',
  o:['Keep them just in case','Follow your organisation\'s retention policy and securely delete or archive what is no longer needed','Copy them to your own hard drive, then delete them from the shared drive'],a:1,
  w:'Personal data should be kept for no longer than is necessary. Keeping files on your own hard drive also goes against the DKM basics.',
  cq:'Which GDPR principle is this?',co:['Storage limitation','Purpose limitation','Lawfulness, fairness and transparency','Accountability'],ca:0,cw:'Storage limitation.'},
 {k:'gdpr',t:'A change of address',s:'A learner emails to say she has changed her name and address. Her record still shows the old details.',
  o:['Update the record, or ask the responsible team to correct it, without delay','Wait for the annual data check','Write the new details in your notebook'],a:0,
  w:'Every reasonable step must be taken to make sure inaccurate personal data is erased or rectified without delay.',
  cq:'Which GDPR principle is this?',co:['Accuracy','Data minimisation','Storage limitation','Purpose limitation'],ca:0,cw:'Accuracy: kept accurate and, where necessary, up to date.'},
 {k:'gdpr',t:'The hybrid working survey',s:'You are planning a staff survey on hybrid working that records names and job roles, but you have not said how the answers will be used.',
  o:['Tell people clearly what you collect, why, and how it will be used before they answer','Collect everything now and decide later','Say it is anonymous but record email addresses anyway'],a:0,
  w:'Personal data must be processed lawfully, fairly and in a transparent manner in relation to the individuals. Misleading people breaks all three.',
  cq:'Which GDPR principle is this?',co:['Lawfulness, fairness and transparency','Accuracy','Storage limitation','Integrity and confidentiality'],ca:0,cw:'Lawfulness, fairness and transparency.'},
 {k:'gdpr',t:'"Not my job"',s:'A colleague says GDPR is only the data controller\'s problem, so the team need not worry about how they handle personal data.',
  o:['Agree - the controller is responsible','Disagree - anyone who handles personal data must follow the seven principles through the organisation\'s policies, and complete the training','Agree, unless the data is on paper'],a:1,
  w:'Section 5.3: there may be a nominated controller, but anyone who handles personal data must follow the principles. Most HEIs require annual GDPR training. Data also includes paper, emails, video and staff records.',
  cq:'Which principle says the controller must be able to demonstrate compliance?',co:['Accountability','Lawfulness, fairness and transparency','Purpose limitation','Accuracy'],ca:0,cw:'Accountability (Article 5(2)).'},
 {k:'threat',t:'"Your mailbox is full"',s:'An email that looks like it is from IT says your mailbox is full and asks you to click a link and re-enter your password.',
  o:['Click and log in quickly so you do not lose emails','Do not click; report it using your organisation\'s process for spam and suspicious emails','Forward it to your team to ask whether they got it too'],a:1,
  w:'Emails that trick users into an action are a common threat. Table 7 asks whether you know what to do if you receive spam. Forwarding spreads the risk.',
  cq:'Which common threat is this?',co:['Social media and email attacks','Security misconfiguration','Lack of encryption','Malware on endpoints'],ca:0,cw:'Social media and email attacks: accounts are hacked, or emails trick users into an action that compromises security.'},
 {k:'threat',t:'"Remind me tomorrow"',s:'For three weeks your work laptop has asked you to install an update and restart. You keep postponing it.',
  o:['Keep postponing until a quiet week','Install it as soon as possible - some updates rely on you','Turn off update notifications'],a:1,
  w:'Many updates are automatic, but some rely on individuals, and it is important to understand how to do them.',
  cq:'Which common threat is this?',co:['Security misconfiguration','Social media and email attacks','Poorly secured systems','Lack of encryption'],ca:0,cw:'Security misconfiguration: all platforms and tools must be configured and updated correctly.'},
 {k:'threat',t:'The family tablet',s:'You would like to read work email on your personal tablet, which your children also use for games.',
  o:['Install the email app - it is only email','Check your organisation\'s policy first; if allowed, use MFA and a passcode, keep it updated and do not share it for work use','Remove the passcode so the children do not get locked out'],a:1,
  w:'When people use their own devices for work, organisational control is limited, and antivirus alone is often not enough. Table 7: who do you let use your devices? Is MFA set up?',
  cq:'Which common threat is this?',co:['Malware on endpoints','Security misconfiguration','Social media and email attacks','Lack of encryption'],ca:0,cw:'Malware on endpoints: laptops, tablets and phones can be threatened in various ways.'},
 {k:'threat',t:'Research data on the road',s:'You are taking a laptop holding confidential research data to a conference.',
  o:['Make sure the device is encrypted and you have the recovery (BitLocker) key stored safely','Rely on the laptop\'s login password','Copy the data to a USB stick as a spare'],a:0,
  w:'Encryption can help prevent the loss of data if a device is lost or stolen. Table 7: do you have BitLocker keys for your devices? An unencrypted USB copy adds risk.',
  cq:'Which common threat does this address?',co:['Lack of encryption','Poorly secured systems','Social media and email attacks','Security misconfiguration'],ca:0,cw:'Lack of encryption.'},
 {k:'ip',t:'My course on my blog',s:'You wrote a course for your university and want to publish a long extract on your personal blog.',
  o:['It is my writing, so I can post it','Check first - your organisation probably owns the IP and copyright, so seek advice and permission','Post it, but do not mention the university'],a:1,
  w:'Section 5.4: your organisation owns the IP and copyright, so be aware of what you can share in the public domain - an extract from a course you authored is the course\'s own example.',
  cq:'Which angle of IP is this?',co:['Use and sharing of your organisation\'s information and content','Use of others\' (third-party) materials'],ca:0,cw:'Angle 1: your organisation\'s information, products, services and content.'},
 {k:'ip',t:'A photo and a deep link',s:'For a webinar you want to use a photo from a website and link straight to an article deep inside another organisation\'s site.',
  o:['It is freely available online, so it is free to use','Check the conditions of use for both - the author is not always the owner, and some sites charge for deeplinking; if unsure, ask','Use the photo but crop out the credit'],a:1,
  w:'Third-party content needs its conditions of use checked. Freely available to access is not the same as free to reuse, and deeplinking can cost the site owner income. Basic rule: if unsure, seek advice and permission.',
  cq:'Which angle of IP is this?',co:['Use and sharing of your organisation\'s information and content','Use of others\' (third-party) materials'],ca:1,cw:'Angle 2: use of others\' materials.'},
 {k:'safe',t:'Predictions for feedback',s:'A colleague wants to post next year\'s enrolment predictions and budget figures in a public online community to get feedback on their model.',
  o:['Fine, as long as the figures are accurate','Do not share without proper approvals','Share them, but mark them as a draft'],a:1,
  w:'In the GitLab SAFE framework a "yes" to any question - Sensitive, not Accurate, Financial, harmful Effect - means do not share without proper approvals. Being accurate is not enough.',
  cq:'Which SAFE question triggers the "do not share"?',co:['S - sensitive or non-public','A - accurate and verifiable','F - financial data, metrics or predictions','E - harmful effect'],ca:2,cw:'F: the information includes financial data, metrics or predictions. (It is probably also non-public, so S applies as well.)'},
 {k:'safe',t:'Home editors and the media library',s:'Your organisation is giving editors working from home access to a valuable media library. It cannot be sure their home Wi-Fi or devices are safe.',
  o:['Trust any device once it is inside the company firewall','Firewall and sandbox where the data is kept, and tightly control, at a granular level, what can access it','Ask staff to promise their Wi-Fi is secure'],a:1,
  w:'Zero trust accepts that the environments data is accessed from cannot be fully trusted. Instead of trying to secure every single aspect, you control the data very tightly.',
  cq:'In the post-production hack, why did the zero-trust systems survive?',co:['They had their own firewall and did not trust other computers on the same network','They had better antivirus software','They were never connected to the network'],ca:0,cw:'Once attackers got through the company firewalls they could reach everything else - except the zero-trust systems, which had their own firewall to breach.'},
 {k:'well',t:'Not feeling safe',s:'Since working from home you feel anxious. You are unsure your home set-up is secure, and you check messages late at night in case something has gone wrong.',
  o:['Keep it to yourself - it is your problem','Ask IT or your manager to help check your set-up, find out who to contact when things go wrong, and agree working-hours boundaries','Switch off the security features so they stop bothering you'],a:1,
  w:'If you do not feel safe because your digital security is not sufficient, this can affect your wellbeing. Table 7 asks whether you know who to contact if you cannot access your systems.',
  cq:'Why does the course consider wellbeing, safety and security together?',co:['They overlap: safety is linked to both wellbeing and security','One department always deals with all three','Security only matters offline'],ca:0,cw:'Figure 4: being digitally safe sits between safety, security and wellbeing.'}
];

/* ---------- Table 7 + DKM checklist ---------- */
var CHECK=[
 ['Online','I have BitLocker (encryption) keys for my devices, stored safely'],
 ['Online','My password is strong and complies with my organisation\'s guidance'],
 ['Online','I have set up multi-factor authentication (MFA) correctly'],
 ['Online','I think about how sensitive information is before I share it, internally or externally'],
 ['Online','I password-protect sensitive documents when necessary'],
 ['Online','I know what to do if I receive spam or suspicious emails'],
 ['Offline','I secure my devices when they are not in use'],
 ['Offline','I lock my computer when I leave my work area'],
 ['Offline','I know who to contact if I cannot access my systems or get online'],
 ['Offline','I check who can see my screen when I work'],
 ['Offline','I am careful about which work matters I discuss with others'],
 ['Offline','I store physical documents securely'],
 ['Offline','I do not let others use my work devices'],
 ['Data habits','I save files to the correct location, not my desktop or own hard drive'],
 ['Data habits','I back up my files regularly (or know they are backed up)'],
 ['Data habits','I do not keep duplicate copies of files in several places'],
 ['Data habits','I use correct file names and metadata'],
 ['Responsibilities','I have completed this year\'s GDPR / information security training'],
 ['Responsibilities','I know where my organisation\'s information security policy is'],
 ['Responsibilities','I know where to get advice on copyright and IP']];
var STATUS=[['y','Yes'],['n','Not yet'],['q','Not sure']];

/* ---------- SAFE ---------- */
var SAFEQ=[
 {k:'S',q:'Does it include any SENSITIVE or material non-public information?',bad:true},
 {k:'A',q:'Is the information ACCURATE and verifiable?',bad:false},
 {k:'F',q:'Does it include FINANCIAL data, metrics or predictions?',bad:true},
 {k:'E',q:'Could sharing it have a harmful EFFECT on team members or the business?',bad:true}];
var HINTS=[
 [/\b(name|names|address|addresses|date of birth|dob|email address|phone number|student record|staff record|grades?|marks|health|personal)\b/i,'It looks like personal data: the seven GDPR principles apply - share only what is necessary, for the purpose it was collected for, securely.'],
 [/\b(photo|image|picture|video|music|article|extract|logo|diagram|figure|book|course content|slides)\b/i,'Content like this may be someone\'s IP or copyright: check who owns it and the conditions of use. If unsure, seek advice and permission.'],
 [/\b(password|passcode|pin|login|log-in|credentials?)\b/i,'Never share passwords or log-in details.'],
 [/\b(budget|forecast|prediction|revenue|income|salary|salaries|financial|finance|cost|price)\b/i,'Financial data, metrics or predictions: under SAFE, do not share without proper approvals.'],
 [/\b(strategy|strategic|plan|unreleased|unannounced|innovation|prototype|draft)\b/i,'Strategic plans, unannounced projects and IP are usually confidential (Table 9).'],
 [/\b(public|blog|social media|twitter|linkedin|facebook|forum|community|external|outside)\b/i,'You are sharing outside the organisation: only unclassified information should go into the public domain.'],
 [/\b(usb|memory stick|personal (email|phone|laptop|device)|home computer|whatsapp)\b/i,'Personal devices and accounts are outside your organisation\'s control: use approved, secure tools.']];

/* ---------- helpers ---------- */
function blank(){return {tab:0,ci:0,cls:{},si:0,topic:'',sc:{},safe:{text:'',ans:{}},ai:'',chk:{},done:false}}
function norm(S){var b=blank();for(var k in b)if(S[k]==null)S[k]=b[k];if(!S.safe.ans)S.safe.ans={};return S}
function copyText(text,ctx,msg){
  function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();ctx.toast(ok?msg:'Select the text and copy it manually')}
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){ctx.toast(msg)},fb);else fb()}catch(e){fb()}}
function safeVerdict(ans){
  for(var i=0;i<SAFEQ.length;i++){var v=ans[SAFEQ[i].k];if(v==null)return {done:false,stop:null};if(v===SAFEQ[i].bad)return {done:true,ok:false,stop:SAFEQ[i]}}
  return {done:true,ok:true};
}

/* ---------- styles ---------- */
var CSS=[
'.dg-tabs{display:flex;gap:6px;overflow-x:auto;margin:0 0 12px;scrollbar-width:none}',
'.dg-tab{flex:0 0 auto;border:0;border-radius:999px;min-height:44px;padding:8px 16px;background:var(--surface2);color:var(--ink2);cursor:pointer;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;display:flex;align-items:center;gap:8px}',
'.dg-tab.on{background:var(--ink);color:var(--bg)}',
'.dg-tab small{font-size:.66rem;opacity:.8}',
'.dg-score{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:var(--surface2);border-radius:var(--r-md);padding:12px 16px;margin:0 0 14px}',
'.dg-score b{font-family:var(--mono);font-size:1.35rem}',
'.dg-score .bar{flex:1;min-width:120px}',
'.dg-item{background:#0B0B0B;color:#fff;border-radius:var(--r-lg);padding:22px 20px;margin:0 0 12px;background-image:radial-gradient(#2a2a2a 1.2px,transparent 1.4px);background-size:16px 16px}',
'.dg-item .label{color:#9a9a9a}',
'.dg-item p{font-family:var(--serif);font-size:1.18rem;line-height:1.4;margin:8px 0 0}',
'.dg-bins{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}',
'@media(max-width:560px){.dg-bins{grid-template-columns:1fr}}',
'.dg-bin{border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-md);padding:12px 14px;text-align:left;cursor:pointer;min-height:56px;font:inherit;color:inherit}',
'.dg-bin b{display:block;font-size:1rem}',
'.dg-bin span{display:block;font-size:.8rem;color:var(--ink2);line-height:1.35;margin-top:4px}',
'.dg-bin.good{border-color:var(--green);background:var(--surface2)}',
'.dg-bin.bad{border-color:var(--red);border-style:dotted;border-width:2px}',
'.dg-bin[disabled]{cursor:default}',
'.dg-fb{border-left:3px solid var(--green);background:var(--surface2);border-radius:0 var(--r-md) var(--r-md) 0;padding:12px 14px;margin:12px 0 0;font-size:.95rem}',
'.dg-fb.bad{border-color:var(--red)}',
'.dg-fb b.h{display:block;margin-bottom:4px}',
'.dg-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}',
'@media(max-width:560px){.dg-cols{grid-template-columns:1fr}}',
'.dg-col{background:var(--surface2);border-radius:var(--r-sm);padding:10px;min-height:60px}',
'.dg-col .label{display:block;margin-bottom:6px}',
'.dg-chipx{display:block;border:0;font-size:.8rem;line-height:1.3;padding:5px 8px;border-radius:8px;background:var(--surface);margin:0 0 5px;border-left:3px solid var(--green)}',
'.dg-chipx.bad{border-left-color:var(--red)}',
'.dg-dots{display:flex;gap:5px;flex-wrap:wrap;margin:0 0 10px}',
'.dg-dot{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--dot);background:var(--surface);cursor:pointer;font-family:var(--mono);font-size:.7rem;display:flex;align-items:center;justify-content:center;padding:0;color:var(--ink2)}',
'.dg-dot.cur{border-color:var(--ink);border-width:2px;color:var(--ink)}',
'.dg-dot.g{background:var(--green);border-color:var(--green);color:#fff}.dg-dot.r{background:var(--red);border-color:var(--red);color:#fff}.dg-dot.h{background:var(--amber);border-color:var(--amber);color:#fff}',
'.dg-chips{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}',
'.dg-chips .chip{min-height:44px}',
'.dg-opt{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);padding:11px 12px;margin:0 0 8px;cursor:pointer;min-height:44px;font:inherit;color:inherit;font-size:.95rem;line-height:1.35}',
'.dg-opt .l{flex:none;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--ink3);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.72rem}',
'.dg-opt.good{border-color:var(--green);background:var(--surface2)}.dg-opt.good .l{background:var(--green);border-color:var(--green);color:#fff}',
'.dg-opt.bad{border-color:var(--red);border-style:dotted;border-width:2px}.dg-opt.bad .l{border-color:var(--red);color:var(--red)}',
'.dg-opt[disabled]{cursor:default}',
'.dg-nav{display:flex;justify-content:space-between;gap:10px;margin-top:12px;flex-wrap:wrap}',
'.dg-tri{display:grid;grid-template-columns:180px 1fr;gap:14px;align-items:center}',
'@media(max-width:520px){.dg-tri{grid-template-columns:1fr}.dg-tri svg{max-width:180px;margin:0 auto}}',
'.dg-tri svg{width:100%;height:auto;display:block}',
'.dg-flow{counter-reset:q}',
'.dg-q{display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:start;padding:12px 0;border-bottom:1px dotted var(--dot)}',
'.dg-q.off{opacity:.35;pointer-events:none}',
'.dg-q .k{width:44px;height:44px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-weight:700;font-size:1.1rem}',
'.dg-q.stop .k{background:var(--red);color:#fff}',
'.dg-yn{display:flex;gap:8px;margin-top:8px}',
'.dg-yn button{border:1.5px solid var(--line);background:var(--surface);border-radius:999px;min-height:44px;min-width:76px;padding:6px 16px;cursor:pointer;font:inherit;color:inherit}',
'.dg-yn button.on{background:var(--ink);border-color:var(--ink);color:var(--bg)}',
'.dg-verdict{border-radius:var(--r-md);padding:16px;margin:14px 0 0;font-size:1.02rem}',
'.dg-verdict.good{background:var(--surface2);border:2px solid var(--green)}',
'.dg-verdict.no{background:var(--surface2);border:2px solid var(--red)}',
'.dg-ck{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:.93rem}',
'@media(max-width:560px){.dg-ck{grid-template-columns:1fr}}',
'.dg-seg{display:inline-flex;gap:4px;background:var(--surface2);border-radius:999px;padding:3px}',
'.dg-seg button{border:0;border-radius:999px;min-height:40px;padding:6px 12px;background:transparent;cursor:pointer;font-size:.82rem;color:var(--ink2);font-family:inherit}',
'.dg-seg button.on{background:var(--ink);color:var(--bg)}',
'.dg-seg button.on.n{background:var(--red);color:#fff}',
'.dg-seg button.on.q{background:var(--amber);color:#fff}',
'.dg-grp{margin:14px 0 2px}'
].join('\n');

/* ---------- mount ---------- */
Tools.register('data-guard',{title:'Data Guard',desc:'Classify information, decide what to do in workplace security scenarios and build your personal security checklist.',
mount:function(el,ctx){
  if(!document.getElementById('dg-css')){var st=document.createElement('style');st.id='dg-css';st.textContent=CSS;document.head.appendChild(st)}
  var S=norm(ctx.load()||blank());
  var ui={confirm:'',aiBusy:false,aiTok:''};
  function save(){ctx.save(S)}
  function clsScore(){return ITEMS.filter(function(it,i){return S.cls[i]===it.a}).length}
  function scScore(){var n=0;SC.forEach(function(s,i){var r=S.sc[i];if(!r)return;if(r.d===s.a)n++;if(r.c===s.ca)n++});return n}
  function nCls(){return Object.keys(S.cls).length}
  function nSc(){return SC.filter(function(s,i){return S.sc[i]&&S.sc[i].c!=null}).length}
  var MAX=ITEMS.length+SC.length*2;
  function total(){return clsScore()+scScore()}
  function maybeDone(){if(!S.done&&nCls()===ITEMS.length&&nSc()===SC.length){S.done=true;save();ctx.complete(Math.round(total()/MAX*100)/100)}}
  function go(t){S.tab=t;save();render();var x=el.querySelector('.dg-tabs');if(x&&x.getBoundingClientRect().top<0)x.scrollIntoView({block:'start'})}
  function scoreBar(){var answered=nCls()+nSc();var pct=Math.round(total()/MAX*100);
    return h('div',{class:'dg-score'},h('span',{class:'label'},'Score'),h('b',null,total()+' / '+MAX),h('div',{class:'bar'+(answered&&pct<50?' red':'')},h('i',{style:{width:pct+'%'}})),
      h('span',{class:'tiny muted'},nCls()+'/'+ITEMS.length+' sorted · '+nSc()+'/'+SC.length+' scenarios'))}

  /* --- 1 classify --- */
  function classify(){
    var w=h('div');
    w.appendChild(h('p',{class:'muted',style:{fontSize:'.93rem',margin:'0 0 10px'}},'Section 5.6: information is normally classified as unclassified, internal or confidential (Table 9). Sort each item - you get feedback straight away.'));
    var i=S.ci;
    if(i<ITEMS.length){
      var it=ITEMS[i],ans=S.cls[i];
      w.appendChild(h('div',{class:'dg-item'},h('span',{class:'label'},'Item '+(i+1)+' of '+ITEMS.length),h('p',null,it.t)));
      w.appendChild(h('div',{class:'dg-bins',role:'group','aria-label':'Classification'},CLS.map(function(c){
        var cls='dg-bin'+(ans!=null?(c.id===it.a?' good':c.id===ans?' bad':''):'');
        return h('button',{class:cls,disabled:ans!=null,onclick:function(){S.cls[i]=c.id;save();render();maybeDone()}},h('b',null,c.n),h('span',null,c.d))})));
      if(ans!=null){var ok=ans===it.a;
        w.appendChild(h('div',{class:'dg-fb'+(ok?'':' bad'),role:'status'},h('b',{class:'h '+(ok?'ok':'bad')},ok?'Correct':'Not quite - it is '+CLS.filter(function(c){return c.id===it.a})[0].n.toLowerCase()),it.w));
        w.appendChild(h('div',{class:'dg-nav'},h('span'),h('button',{class:'btn primary',onclick:function(){var n=-1;for(var k=0;k<ITEMS.length;k++){var kk=(i+1+k)%ITEMS.length;if(S.cls[kk]==null){n=kk;break}}S.ci=n<0?ITEMS.length:n;save();render()}},nCls()===ITEMS.length?'See results':'Next item')));
      }
    } else {
      var sc=clsScore();
      w.appendChild(h('div',{class:'callout '+(sc>=8?'tip':''),style:{marginBottom:'0'}},h('b',null,'You sorted '+sc+' of '+ITEMS.length+' correctly. '),sc>=8?'You understand the three classes. Now try the scenarios.':'Look at the red items below and the definitions again.'));
      w.appendChild(h('div',{class:'dg-nav'},h('button',{class:'btn ghost',onclick:function(){S.cls={};S.ci=0;save();render()}},'Sort again'),h('button',{class:'btn primary',onclick:function(){go(1)}},'Next: scenarios')));
    }
    if(nCls()){
      var cols=h('div',{class:'dg-cols'});
      CLS.forEach(function(c){var col=h('div',{class:'dg-col'},h('span',{class:'label'},c.n));
        ITEMS.forEach(function(it,k){if(S.cls[k]===c.id)col.appendChild(h('button',{class:'dg-chipx'+(it.a===c.id?'':' bad'),style:{width:'100%',textAlign:'left',cursor:'pointer',font:'inherit',fontSize:'.8rem',color:'inherit'},
          title:it.w,onclick:function(){S.ci=k;save();render()}},it.t))});
        cols.appendChild(col)});
      w.appendChild(cols);
      w.appendChild(h('p',{class:'tiny muted',style:{margin:'6px 0 0'}},'Green edge = correct, red edge = wrong. Tap an item to see why.'));
    }
    return w;
  }

  /* --- 2 scenarios --- */
  function triangle(hi){
    var NS='http://www.w3.org/2000/svg';function e(t,a,tx){var x=document.createElementNS(NS,t);for(var k in a)x.setAttribute(k,a[k]);if(tx)x.textContent=tx;return x}
    var s=e('svg',{viewBox:'0 0 180 150',role:'img','aria-label':'CIA triad: confidentiality, integrity, availability'});
    s.appendChild(e('polygon',{points:'90,24 150,118 30,118',fill:'none',stroke:'var(--ink)','stroke-width':1.5,'stroke-dasharray':'3 4'}));
    [['Integrity',90,24,1,90,12,'middle'],['Confidentiality',30,118,0,2,140,'start'],['Availability',150,118,2,178,140,'end']].forEach(function(p){var on=hi===p[3];
      s.appendChild(e('circle',{cx:p[1],cy:p[2],r:on?9:6,fill:on?'var(--red)':'var(--ink)'}));
      s.appendChild(e('text',{x:p[4],y:p[5],'text-anchor':p[6],'font-size':'9.5','font-family':'var(--mono)',fill:on?'var(--red)':'var(--ink2)','font-weight':on?'700':'400'},p[0].toUpperCase()))});
    s.appendChild(e('text',{x:90,y:92,'text-anchor':'middle','font-size':'8.5','font-family':'var(--mono)',fill:'var(--ink3)'},'INFO SECURITY'));
    return s;
  }
  function scenarios(){
    var w=h('div'),list=SC.map(function(s,i){return i}).filter(function(i){return !S.topic||SC[i].k===S.topic});
    if(list.indexOf(S.si)<0)S.si=list[0];
    w.appendChild(h('div',{class:'dg-chips'},[['','All']].concat(TOPICS).map(function(t){var n=SC.filter(function(s){return !t[0]||s.k===t[0]}).length;
      return h('button',{class:'chip'+(S.topic===t[0]?' on':''),'aria-pressed':S.topic===t[0]?'true':'false',onclick:function(){S.topic=t[0];S.si=SC.map(function(s,i){return i}).filter(function(i){return !t[0]||SC[i].k===t[0]})[0];save();render()}},t[1]+' '+n)})));
    w.appendChild(h('div',{class:'dg-dots'},list.map(function(i,n){var r=S.sc[i],c='';
      if(r&&r.c!=null){var p=(r.d===SC[i].a?1:0)+(r.c===SC[i].ca?1:0);c=p===2?' g':p===1?' h':' r'}
      return h('button',{class:'dg-dot'+c+(i===S.si?' cur':''),'aria-label':'Scenario '+(n+1),onclick:function(){S.si=i;save();render()}},n+1)})));
    var i=S.si,s=SC[i],r=S.sc[i]||{};
    var topic=TOPICS.filter(function(t){return t[0]===s.k})[0][1];
    var head=h('div',{class:'dg-item'},h('span',{class:'label'},topic+' · '+s.t),h('p',null,s.s));
    w.appendChild(head);
    w.appendChild(h('span',{class:'label'},'1. What should you do?'));
    var o1=h('div',{style:{marginTop:'8px'}});
    s.o.forEach(function(t,k){var c='dg-opt';if(r.d!=null){if(k===s.a)c+=' good';else if(k===r.d)c+=' bad'}
      o1.appendChild(h('button',{class:c,disabled:r.d!=null,onclick:function(){S.sc[i]={d:k,c:null};save();render()}},h('span',{class:'l'},'ABCD'[k]),h('span',null,t)))});
    w.appendChild(o1);
    if(r.d!=null){
      var ok1=r.d===s.a;
      w.appendChild(h('div',{class:'dg-fb'+(ok1?'':' bad'),role:'status'},h('b',{class:'h '+(ok1?'ok':'bad')},ok1?'Good decision':'Better: '+'ABCD'[s.a]),s.w));
      w.appendChild(h('div',{class:'label',style:{marginTop:'14px'}},'2. '+s.cq));
      var o2=h('div',{style:{marginTop:'8px'}});
      s.co.forEach(function(t,k){var c='dg-opt';if(r.c!=null){if(k===s.ca)c+=' good';else if(k===r.c)c+=' bad'}
        o2.appendChild(h('button',{class:c,disabled:r.c!=null,onclick:function(){S.sc[i].c=k;save();render();maybeDone()}},h('span',{class:'l'},'ABCD'[k]),h('span',null,t)))});
      if(s.k==='cia'&&r.c!=null)w.appendChild(h('div',{class:'dg-tri',style:{marginTop:'8px'}},triangle(s.ca),o2));else w.appendChild(o2);
      if(r.c!=null){var ok2=r.c===s.ca;
        w.appendChild(h('div',{class:'dg-fb'+(ok2?'':' bad'),role:'status'},h('b',{class:'h '+(ok2?'ok':'bad')},ok2?'Correct':'Not quite'),s.cw));
      }
    }
    var pos=list.indexOf(i);
    var nextUn=-1;for(var k=1;k<=list.length;k++){var j=list[(pos+k)%list.length];if(!(S.sc[j]&&S.sc[j].c!=null)){nextUn=j;break}}
    w.appendChild(h('div',{class:'dg-nav'},
      pos>0?h('button',{class:'btn ghost',onclick:function(){S.si=list[pos-1];save();render()}},'Previous'):h('span'),
      r.c!=null?(nextUn>=0?h('button',{class:'btn primary',onclick:function(){S.si=nextUn;save();render()}},'Next scenario'):h('button',{class:'btn primary',onclick:function(){go(2)}},'Next: SAFE check')):h('span')));
    if(nSc()===SC.length){
      var byT=TOPICS.map(function(t){var mx=0,got=0;SC.forEach(function(s,i){if(s.k!==t[0])return;mx+=2;var r=S.sc[i];if(r){if(r.d===s.a)got++;if(r.c===s.ca)got++}});return [t[1],got,mx]});
      var weak=byT.filter(function(x){return x[1]/x[2]<0.75});
      w.appendChild(h('div',{class:'card flat',style:{marginTop:'14px'}},h('span',{class:'label'},'Results by topic'),
        h('div',null,byT.map(function(x){return h('div',{class:'row between',style:{padding:'6px 0',borderBottom:'1px solid var(--line)'}},h('span',null,x[0]),h('b',{class:x[1]/x[2]>=0.75?'ok':'bad',style:{fontFamily:'var(--mono)'}},x[1]+'/'+x[2]))})),
        h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},weak.length?'Revisit: '+weak.map(function(x){return x[0]}).join(', ')+'. Filter by topic above to see the explanations again.':'Strong across every topic.')));
    }
    return w;
  }

  /* --- 3 SAFE check --- */
  function safe(){
    var w=h('div'),A=S.safe.ans;
    w.appendChild(h('p',{class:'muted',style:{fontSize:'.93rem',margin:'0 0 10px'}},'Activity 16: the GitLab SAFE framework helps you make informed choices before you share. Describe something real you might share, then answer the four questions in order.'));
    var ta=h('textarea',{class:'textarea',style:{minHeight:'70px'},placeholder:'e.g. Post our draft student survey results and the budget slide in a LinkedIn group','aria-label':'What do you want to share, and with whom?'});ta.value=S.safe.text;
    var hb=h('div');
    function hints(){hb.innerHTML='';var t=S.safe.text,hs=HINTS.filter(function(x){return x[0].test(t)});
      if(hs.length)hb.appendChild(h('div',{class:'callout note',style:{marginTop:'10px'}},h('span',{class:'label'},'Things to consider'),h('ul',{style:{margin:'6px 0 0',paddingLeft:'18px'}},hs.map(function(x){return h('li',{class:'tiny'},x[1])}))))}
    ta.addEventListener('input',function(){S.safe.text=ta.value;save();hints()});
    w.appendChild(h('span',{class:'label'},'What do you want to share, and with whom?'));w.appendChild(ta);hints();w.appendChild(hb);
    var v=safeVerdict(A),stopped=false,flow=h('div',{class:'dg-flow',style:{marginTop:'8px'}});
    SAFEQ.forEach(function(q,k){
      var prevOk=SAFEQ.slice(0,k).every(function(p){return A[p.k]!=null&&A[p.k]!==p.bad});
      var isStop=v.stop===q;
      flow.appendChild(h('div',{class:'dg-q'+(!prevOk?' off':'')+(isStop?' stop':'')},h('span',{class:'k'},q.k),
        h('div',null,h('div',null,q.q),h('div',{class:'dg-yn'},[[true,'Yes'],[false,'No']].map(function(o){
          return h('button',{class:A[q.k]===o[0]?'on':'','aria-pressed':A[q.k]===o[0]?'true':'false',onclick:function(){A[q.k]=o[0];SAFEQ.slice(k+1).forEach(function(n){delete A[n.k]});S.ai='';save();render()}},o[1])})))));
    });
    w.appendChild(flow);
    if(v.done){
      w.appendChild(h('div',{class:'dg-verdict '+(v.ok?'good':'no'),role:'status'},
        h('b',{style:{display:'block',marginBottom:'4px'}},v.ok?'SAFE to share':'Do not share without proper approvals'),
        v.ok?'All four checks passed. Share it through an approved channel, and only with the people who need it.':
          (v.stop.k==='A'?'The information is not accurate or verifiable.':'You answered yes to '+v.stop.k+': '+v.stop.q.toLowerCase().replace(/\?$/,'')+'.')+' GitLab\'s framework sends any "unSAFE" answer to "Do not share without proper approvals".'));
      var out=h('div',{style:{marginTop:'10px'}});
      function rules(){var t=S.safe.text,hs=HINTS.filter(function(x){return x[0].test(t)}).map(function(x){return '- '+x[1]});
        if(!hs.length)hs.push('- Check how the information is classified (Table 9): only unclassified information should be shared publicly.');
        hs.push('- If unsure, ask: your information security or data protection team, or your line manager.');
        return '[rules] '+hs.slice(0,4).join('\n')}
      function drawAi(){out.innerHTML='';if(ui.aiBusy)out.appendChild(h('div',{class:'ai-box',role:'status'},h('span',{class:'label'},'AI advice'),ui.aiTok||'Thinking...'));
        else if(S.ai)out.appendChild(h('div',{class:'ai-box'},h('span',{class:'label'},S.ai.indexOf('[rules]')===0?'What else to check':'AI advice'),S.ai.replace(/^\[rules\]\s*/,'')))}
      if(ctx.ai.available()&&S.safe.text.trim().split(/\s+/).length>=4){
        var ab=h('button',{class:'btn primary',onclick:function(){ui.aiBusy=true;ui.aiTok='';ab.disabled=true;drawAi();
          ctx.ai.ask({system:'You advise university staff on information security and GDPR. Reply in plain text: exactly 3 short bullet points starting with "- ". Under 80 words. Mention data classification (unclassified, internal, confidential), GDPR or copyright only where relevant. If unsure, tell them to ask their information security team.',
            prompt:'Planned sharing: '+S.safe.text.slice(0,300)+'\nSAFE check result: '+(v.ok?'safe to share':'do not share without approvals ('+v.stop.k+')')+'\n\nGive 3 bullet points of advice.',maxTokens:160,temperature:0.2,onToken:function(t){ui.aiTok=t;drawAi()}})
          .then(function(t){ui.aiBusy=false;ab.disabled=false;t=String(t||'').trim();S.ai=t||rules();save();drawAi()})
          .catch(function(){ui.aiBusy=false;ab.disabled=false;S.ai=rules();save();drawAi();ctx.toast('AI unavailable - showing rule-based advice')})}},'Ask AI about this');
        w.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},ab));
      } else {
        w.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn',onclick:function(){S.ai=rules();save();drawAi()}},'What else should I check?')));
      }
      drawAi();w.appendChild(out);
      w.appendChild(h('div',{class:'dg-nav'},h('button',{class:'btn ghost',onclick:function(){S.safe={text:'',ans:{}};S.ai='';save();render()}},'Check something else'),h('button',{class:'btn primary',onclick:function(){go(3)}},'Next: my checklist')));
    }
    return w;
  }

  /* --- 4 checklist --- */
  function checklist(){
    var w=h('div');
    w.appendChild(h('p',{class:'muted',style:{fontSize:'.93rem',margin:'0 0 10px'}},'Activity 14: consider what you are required to do - and what you actually do. Based on Table 7 (online and offline tips) and the digital knowledge management basics in Section 5.6.'));
    var yes=CHECK.filter(function(c,i){return S.chk[i]==='y'}).length,todo=CHECK.map(function(c,i){return i}).filter(function(i){return S.chk[i]==='n'||S.chk[i]==='q'});
    var pct=Math.round(yes/CHECK.length*100);
    w.appendChild(h('div',{class:'dg-score'},h('span',{class:'label'},'My security habits'),h('b',null,yes+' / '+CHECK.length),h('div',{class:'bar'+(Object.keys(S.chk).length&&pct<50?' red':'')},h('i',{style:{width:pct+'%'}}))));
    var grp='';
    CHECK.forEach(function(c,i){
      if(c[0]!==grp){grp=c[0];w.appendChild(h('div',{class:'label dg-grp'},grp))}
      w.appendChild(h('div',{class:'dg-ck'},h('span',null,c[1]),h('div',{class:'dg-seg',role:'group','aria-label':c[1]},STATUS.map(function(s){var on=S.chk[i]===s[0];
        return h('button',{class:(on?'on ':'')+s[0],'aria-pressed':on?'true':'false',onclick:function(){if(on)delete S.chk[i];else S.chk[i]=s[0];save();render()}},s[1])}))))});
    var tc=h('div',{class:'card flat',style:{marginTop:'14px'}},h('span',{class:'label'},'My to-do list ('+todo.length+')'));
    if(!todo.length)tc.appendChild(h('p',{class:'tiny muted',style:{margin:'6px 0 0'}},Object.keys(S.chk).length?'Nothing outstanding. Review this list again after your next annual training.':'Mark items "Not yet" or "Not sure" and they appear here as actions.'));
    else tc.appendChild(h('ol',{style:{margin:'8px 0 0',paddingLeft:'20px'}},todo.map(function(i){return h('li',{style:{margin:'4px 0',fontSize:'.92rem'}},(S.chk[i]==='q'?'Find out: ':'Do: ')+CHECK[i][1])})));
    if(todo.some(function(i){return S.chk[i]==='q'}))tc.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'"Not sure" items: your responsibilities vary by role and organisation - check your organisation\'s policies, processes and guidance, or ask your IT / information security team.'));
    tc.appendChild(h('p',{class:'tiny muted',style:{margin:'8px 0 0'}},'Further help (Activity 14 and 18): NCSC top tips for staying secure online · Learn My Way introduction to online safety · ICO information security guidance.'));
    w.appendChild(tc);
    w.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},h('button',{class:'btn',onclick:function(){
      var L=['MY DIGITAL SECURITY CHECKLIST ('+yes+'/'+CHECK.length+')',''];var g='';
      CHECK.forEach(function(c,i){if(c[0]!==g){g=c[0];L.push('',g.toUpperCase())}var st=S.chk[i];L.push('['+(st==='y'?'x':st==='n'?' ':st==='q'?'?':'-')+'] '+c[1])});
      L.push('','Practice score: '+total()+'/'+MAX);copyText(L.join('\n'),ctx,'Checklist copied')}},'Copy checklist')));
    return w;
  }

  function toolbar(){
    if(ui.confirm)return h('div',{class:'callout',style:{marginTop:'16px'}},h('p',null,'Clear your answers, score and checklist?'),h('div',{class:'row'},
      h('button',{class:'btn red',onclick:function(){S=blank();ui.confirm='';save();render()}},'Clear all'),h('button',{class:'btn ghost',onclick:function(){ui.confirm='';render()}},'Cancel')));
    return h('div',{class:'row',style:{marginTop:'16px',borderTop:'1px dotted var(--dot)',paddingTop:'12px'}},h('button',{class:'btn ghost sm',onclick:function(){ui.confirm='reset';render()}},'Reset'));
  }
  function render(){
    var hg=el.offsetHeight;el.style.minHeight=hg+'px';el.innerHTML='';
    var T=[['Classify',nCls()+'/'+ITEMS.length],['Scenarios',nSc()+'/'+SC.length],['SAFE check',''],['My checklist',Object.keys(S.chk).length?Object.keys(S.chk).length+'/'+CHECK.length:'']];
    var tabs=h('div',{class:'dg-tabs',role:'tablist'},T.map(function(t,i){return h('button',{class:'dg-tab'+(S.tab===i?' on':''),role:'tab','aria-selected':S.tab===i?'true':'false',onclick:function(){go(i)}},(i+1)+' '+t[0],t[1]?h('small',null,t[1]):null)}));
    var body=[classify,scenarios,safe,checklist][S.tab]();
    el.appendChild(h('div',{class:'tool'},tabs,S.tab<2?scoreBar():null,body,toolbar()));
    el.style.minHeight='';
  }
  render();
}});
})();

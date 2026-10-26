/* persona: customer persona + market segmentation builder (Entrepreneurship Session 4: Customers and markets) */
(function(){
  var h=H.h;
  var ROLES=[['customer','Customer – purchases the good or service'],['consumer','Consumer – uses it (may not be the buyer)'],['client','Client – professional service relationship'],['both','Both customer and consumer']];
  var LOYAL=[['butterflies','Butterflies – good fit, high profit, short-term'],['true','True friends – good fit, highest profit, long-term'],['strangers','Strangers – little fit, lowest profit, short-term'],['barnacles','Barnacles – limited fit, low profit, long-term']];
  var CHANNELS=['Social media','Word of mouth','Search online','Local shops / noticeboards','Events or trade shows','Email','Partners / distributors','Phone or visit'];
  var STAGES=[['Introduction','Sales are small; hard to make a profit because of the costs of taking the offer to market.'],['Growth','The market grows rapidly, giving opportunities for profit, and others may come in.'],['Maturity','Sales growth tails away then plateaus; profits are still present but competition may be intense.'],['Decline','Sales and profits decline.']];
  var STEPS=['Idea','Personas','Market','Review'];
  var VAGUE=/\b(everyone|anyone|all people|everybody|the public|general public|all ages)\b/i;

  function blankP(n){return {name:'',age:'',job:'',where:'',other:'',role:'customer',needs:'',pains:'',channels:[],custom:'',decision:'',loyalty:'',evidence:'',howmany:'',conf:''}}
  function filled(s){return s&&String(s).trim().length>0}
  function words(s){return String(s||'').trim().split(/\s+/).filter(Boolean).length}

  var CSS='.prs-steps{display:flex;gap:6px;margin-bottom:14px}.prs-steps button{flex:1;border:0;border-radius:99px;padding:8px 4px;min-height:44px;background:var(--surface2);cursor:pointer;font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}'+
  '.prs-steps button.on{background:var(--ink);color:var(--bg)}.prs-steps button.dn:not(.on){border:1.5px solid var(--ink)}'+
  '.prs-f{margin:0 0 14px}.prs-f label{display:block;font-weight:500;margin-bottom:2px}.prs-f .g{font-size:.82rem;color:var(--ink2);margin:0 0 6px;line-height:1.35}'+
  '.prs-f .textarea{min-height:80px}.prs-pt{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}'+
  '.prs-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:560px){.prs-two{grid-template-columns:1fr}}'+
  '.prs-chips{display:flex;gap:8px;flex-wrap:wrap}.prs-ck{margin:0 0 8px;padding:0;list-style:none}.prs-ck li{padding:6px 0 6px 24px;position:relative;font-size:.92rem;border-bottom:1px solid var(--line)}'+
  '.prs-ck li:before{content:"✓";position:absolute;left:2px;color:var(--green);font-weight:700}.prs-ck li.x:before{content:"!";color:var(--red)}'+
  '.prs-sum{border:1.5px dashed var(--dot);border-radius:var(--r-md);padding:14px;margin:0 0 12px}.prs-sum h4{margin:0 0 4px;font-weight:500}.prs-sum p{margin:0 0 4px;font-size:.9rem}'+
  '.prs-st{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 10px}@media(max-width:560px){.prs-st{grid-template-columns:1fr 1fr}}'+
  '.prs-st button{border:1.5px solid var(--line);background:var(--surface);border-radius:var(--r-sm);min-height:44px;cursor:pointer;padding:6px}.prs-st button.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}';

  Tools.register('persona',{title:'Customer persona and market',desc:'Define your idea, build up to three customer personas and describe your market segments.',
  mount:function(el,ctx){
    if(!document.getElementById('prs-style')){var st=document.createElement('style');st.id='prs-style';st.textContent=CSS;document.head.appendChild(st)}
    var sv=ctx.load()||{};
    var S={step:sv.step||0,idea:sv.idea||{name:'',offer:'',problem:'',market:'B2C',buyer:''},ps:sv.ps&&sv.ps.length?sv.ps:[blankP()],cur:sv.cur||0,
      mk:sv.mk||{geo:'',demo:'',behav:'',decision:'',stage:'',stagenote:'',target:'',compete:''},ai:sv.ai||''};
    var busy=false;
    function save(){ctx.save(S)}
    function field(label,guide,input){return h('div',{class:'prs-f'},h('label',null,label),guide?h('p',{class:'g'},guide):null,input)}
    function txt(obj,key,ph,rows){return h('textarea',{class:'textarea',placeholder:ph||'',value:obj[key]||'','aria-label':ph||key,style:rows?{minHeight:rows+'px'}:null,oninput:function(){obj[key]=this.value;save()}})}
    function inp(obj,key,ph){return h('input',{class:'input',placeholder:ph||'',value:obj[key]||'','aria-label':ph||key,oninput:function(){obj[key]=this.value;save()}})}

    /* ---- step 0: idea ---- */
    function idea(){
      var i=S.idea,b=h('div');
      b.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Step 1 · Your idea'),h('p',{style:{margin:0}},'Who is going to buy your offering and why should they? Start by stating the idea, then decide who really buys and who really uses it.')));
      var c=h('div',{class:'card'});
      c.appendChild(field('Business or idea name',null,inp(i,'name','e.g. FreshBite lunch boxes')));
      c.appendChild(field('What do you offer?','A product or service, in one or two sentences.',txt(i,'offer','We sell…')));
      c.appendChild(field('What need or problem does it address?','Does the product or service address a need or solve a problem?',txt(i,'problem','People struggle with…')));
      c.appendChild(field('Is your market business to business (B2B) or consumer facing (B2C)?','The simplest way to categorise a market.',
        h('div',{class:'prs-chips'},['B2C','B2B'].map(function(m){return h('button',{class:'chip'+(i.market===m?' on':''),onclick:function(){i.market=m;save();render()}},m==='B2C'?'B2C – consumers':'B2B – businesses')}))));
      c.appendChild(field('Is the buyer the same person as the user?','You can be a customer but not a consumer (buying avocados for your pop-up café) or a consumer but not the buying customer (using stationery bought centrally). “Client” is common in professional services.',
        h('div',{class:'prs-chips'},[['same','Same person'],['different','Different people'],['unsure','Not sure yet']].map(function(o){return h('button',{class:'chip'+(i.buyer===o[0]?' on':''),onclick:function(){i.buyer=o[0];save();render()}},o[1])}))));
      if(i.buyer==='different')c.appendChild(h('p',{class:'callout note'},'Build a persona for the buyer and, if their needs differ, a second one for the user.'));
      b.appendChild(c);
      return b;
    }

    /* ---- step 1: personas ---- */
    function personas(){
      var b=h('div');
      b.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Step 2 · Customer personas'),h('p',{style:{margin:0}},'Organisations develop “personas”: detailed descriptions of perfect or even difficult customers, used to inform decisions. Build one to three. Be specific: a persona is one made-up but realistic person, not “everyone”.')));
      var bar=h('div',{class:'prs-pt'},S.ps.map(function(p,k){return h('button',{class:'chip'+(k===S.cur?' on':''),onclick:function(){S.cur=k;save();render()}},p.name||('Persona '+(k+1)))}));
      if(S.ps.length<3)bar.appendChild(h('button',{class:'btn sm ghost',onclick:function(){S.ps.push(blankP());S.cur=S.ps.length-1;save();render()}},'+ Add persona'));
      b.appendChild(bar);
      var p=S.ps[S.cur], c=h('div',{class:'card'});
      c.appendChild(h('div',{class:'prs-two'},field('Name (invent one)',null,inp(p,'name','e.g. Priya')),field('Age',null,inp(p,'age','e.g. 34'))));
      c.appendChild(h('div',{class:'prs-two'},field('Occupation',null,inp(p,'job','e.g. nurse, shift work')),field('Where they live',null,inp(p,'where','e.g. suburban Leeds'))));
      c.appendChild(field('Other demographics','Income, household, education, stage of life.',inp(p,'other','e.g. mid income, two children')));
      c.appendChild(field('Their role in buying',null,h('select',{class:'input','aria-label':'Role',onchange:function(){p.role=this.value;save()}},ROLES.map(function(r){return h('option',{value:r[0],selected:p.role===r[0]?true:null},r[1])}))));
      c.appendChild(field('What do they need or want?','What are they trying to get done? Think of needs, not your solution. Would they find your benefits clear and believable?',txt(p,'needs','They need… They want…')));
      c.appendChild(field('What are their pains?','Frustrations with what they use today. What other products or services can they imagine using to meet the need?',txt(p,'pains','Right now they are frustrated by…')));
      var cs=h('div',{class:'prs-chips'},CHANNELS.map(function(ch){return h('button',{class:'chip'+(p.channels.indexOf(ch)>=0?' on':''),onclick:function(){var k=p.channels.indexOf(ch);if(k>=0)p.channels.splice(k,1);else p.channels.push(ch);save();render()}},ch)}));
      c.appendChild(field('Where can you reach them?','Where would they look for it, and how often would they use or buy it? Pick all that apply.',cs));
      c.appendChild(h('div',{class:'prs-f'},inp(p,'custom','Other places or channels (optional)')));
      c.appendChild(field('Who makes or influences the buying decision?','Who decides, and what factors or people influence them?',txt(p,'decision','The decision is made by… influenced by…')));
      c.appendChild(field('What kind of customer relationship do you hope for?','Reinartz and Kumar’s loyalty model: customers differ in profit potential and in whether they are short- or long-term.',
        h('div',{class:'col'},LOYAL.map(function(l){return h('button',{class:'chip'+(p.loyalty===l[0]?' on':''),style:{justifyContent:'flex-start'},onclick:function(){p.loyalty=(p.loyalty===l[0]?'':l[0]);save();render()}},l[1])}))));
      c.appendChild(field('How do you know this?','Are you representative of your customers? You can only really answer that by engaging with them.',
        h('div',{class:'prs-chips'},[['guess','A guess'],['me','My own experience'],['talked','I have talked to potential customers']].map(function(o){return h('button',{class:'chip'+(p.evidence===o[0]?' on':''),onclick:function(){p.evidence=o[0];save();render()}},o[1])}))));
      c.appendChild(field('Roughly how many people are like this persona?','Are there others like you and, if so, how many? A rough guess is fine, but say how sure you are.',
        h('div',{class:'prs-two'},inp(p,'howmany','e.g. about 5,000 in my town'),h('select',{class:'input','aria-label':'Confidence',onchange:function(){p.conf=this.value;save()}},[['','Confidence…'],['guess','Pure guess'],['estimate','Rough estimate'],['researched','Researched']].map(function(o){return h('option',{value:o[0],selected:p.conf===o[0]?true:null},o[1])})))));
      c.appendChild(h('div',{class:'row'},S.ps.length>1?h('button',{class:'btn ghost sm',onclick:function(){S.ps.splice(S.cur,1);S.cur=0;save();render()}},'Remove this persona'):null));
      b.appendChild(c);
      return b;
    }

    /* ---- step 2: market ---- */
    function market(){
      var m=S.mk,b=h('div');
      b.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Step 3 · What does the market look like?'),h('p',{style:{margin:0}},'Categorise your market ('+S.idea.market+') using the four criteria below. They help you refine your offer and choose which segments to focus on. Note: the course text gives no sizing formula, so describe the market in words and confirm numbers by research.')));
      var c=h('div',{class:'card'});
      c.appendChild(field('Geography','Where is the market? Is it local? International?',txt(m,'geo','e.g. local, within 5 miles')));
      c.appendChild(field('Demographics','Who is in it: for B2B the size of other businesses, stage of maturity, volume of potential business; for B2C age, income, household.',txt(m,'demo','')));
      c.appendChild(field('Behavioural characteristics','How do people or businesses buy and compete? Value of all purchases, and frequency: one-offs or regular.',txt(m,'behav','')));
      c.appendChild(field('Decision-making process','Who makes the purchase decision? What factors or people influence them?',txt(m,'decision','')));
      b.appendChild(c);
      var c2=h('div',{class:'card'});
      c2.appendChild(h('div',{class:'label'},'Market life cycle'));
      c2.appendChild(h('p',{class:'g muted'},'Markets grow, mature and often disappear. Which stage is yours in? (Kotler et al., 2012)'));
      c2.appendChild(h('div',{class:'prs-st'},STAGES.map(function(s){return h('button',{class:m.stage===s[0]?'on':'',onclick:function(){m.stage=s[0];save();render()}},s[0])})));
      if(m.stage)c2.appendChild(h('p',{class:'callout note'},STAGES.filter(function(s){return s[0]===m.stage})[0][1]));
      c2.appendChild(field('Why do you think so, and how could you test your intuition?',null,txt(m,'stagenote','')));
      b.appendChild(c2);
      var c3=h('div',{class:'card'});
      c3.appendChild(field('Which segment will you focus on first?','Name the segment, using the criteria above. Focus helps; “everyone” does not.',txt(m,'target','e.g. office workers within 2 miles who buy lunch 3+ times a week')));
      c3.appendChild(field('Who else serves them today?','Market maturity, the size and number of competitors, and complementary products all shape the market.',txt(m,'compete','')));
      b.appendChild(c3);
      return b;
    }

    /* ---- step 3: review ---- */
    function pChecks(p,i){
      var out=[];
      function ok(t){out.push({g:true,t:t})} function no(t){out.push({g:false,t:t})}
      var nm=p.name||'This persona';
      (filled(p.name)&&filled(p.age)&&(filled(p.job)||filled(p.where)))?ok('Demographics are concrete (name, age, occupation or place).'):no('Add concrete demographics: a name, an age and an occupation or place make the persona a person, not a category.');
      var all=[p.needs,p.pains,p.decision,i.offer,S.mk.target].join(' ');
      if(VAGUE.test(all))no('Words like “everyone” or “anyone” appear. Narrow it to a specific group you could actually find.');
      words(p.needs)>=8?ok('Needs are described in some detail.'):no('Describe needs in more detail: what is this person trying to get done, and what do they want?');
      if(i.name&&filled(p.needs)&&p.needs.toLowerCase().indexOf(i.name.toLowerCase())>=0)no('Needs mention your product by name. Describe the need itself, independent of your solution.');
      words(p.pains)>=8?ok('Pains are described in some detail.'):no('Pains are thin. What frustrates them today, and what do they use instead?');
      p.channels.length||filled(p.custom)?ok('You know where to reach them ('+(p.channels.concat(filled(p.custom)?[p.custom]:[]).slice(0,3).join(', '))+').'):no('Say where you can reach them: where would they look for it?');
      filled(p.decision)?ok('You thought about who decides and influences the purchase.'):no('Who makes or influences the buying decision? It may not be the user.');
      if(i.buyer==='different'&&p.role==='customer'&&!/user|child|team|staff|employee/i.test(p.decision))no('You said buyer and user differ. Check whether this persona is the buyer or the user, and who influences the buyer.');
      if(p.evidence==='guess'||!p.evidence)no('Your evidence is a guess. Test it: focus groups, or even a few conversations, with people who are not friends or family.');
      else if(p.evidence==='me')no('Based on your own experience only. Are you representative? Are there others like you, and how many? Talk to potential customers.');
      else ok('Grounded in conversations with potential customers.');
      if(!filled(p.howmany)||p.conf==='guess')no('Size of this group is unknown or a pure guess. Find out how many people are like this persona.');
      return out;
    }
    function review(){
      var b=h('div'), i=S.idea;
      var total=0,done=0;
      var parts=[i.name,i.offer,i.problem,S.mk.geo,S.mk.demo,S.mk.behav,S.mk.decision,S.mk.stage,S.mk.target];
      S.ps.forEach(function(p){parts.push(p.name,p.age,p.needs,p.pains,p.decision,(p.channels.length?'x':''))});
      parts.forEach(function(x){total++;if(filled(x))done++});
      var pct=Math.round(100*done/total);
      b.appendChild(h('div',{class:'card flat'},h('div',{class:'label'},'Step 4 · Review'),h('div',{class:'row between'},h('span',null,'Completeness'),h('b',null,pct+'%')),h('div',{class:'bar'},h('i',{style:{width:pct+'%'}}))));
      var c=h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'8px'}},(i.name||'Your idea')));
      if(filled(i.offer))c.appendChild(h('p',null,i.offer));
      S.ps.forEach(function(p){
        c.appendChild(h('div',{class:'prs-sum'},h('h4',null,(p.name||'Unnamed persona')+(p.age?', '+p.age:'')+(p.job?' · '+p.job:'')),
          h('p',{class:'muted'},[p.where,p.other].filter(filled).join(' · ')||'No demographics yet'),
          filled(p.needs)?h('p',null,h('b',null,'Needs: '),p.needs):null, filled(p.pains)?h('p',null,h('b',null,'Pains: '),p.pains):null,
          (p.channels.length||filled(p.custom))?h('p',null,h('b',null,'Reach via: '),p.channels.concat(filled(p.custom)?[p.custom]:[]).join(', ')):null,
          p.loyalty?h('p',null,h('b',null,'Relationship: '),LOYAL.filter(function(l){return l[0]===p.loyalty})[0][1]):null));
      });
      if(filled(S.mk.target))c.appendChild(h('p',null,h('b',null,'Focus segment: '),S.mk.target));
      if(S.mk.stage)c.appendChild(h('p',null,h('b',null,'Market stage: '),S.mk.stage));
      b.appendChild(c);
      // rules checklist
      var rc=h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'6px'}},'Quick check (rules-based)'));
      S.ps.forEach(function(p){
        rc.appendChild(h('div',{style:{fontWeight:500,margin:'8px 0 4px'}},p.name||'Unnamed persona'));
        var ul=h('ul',{class:'prs-ck'}); pChecks(p,i).forEach(function(x){ul.appendChild(h('li',{class:x.g?'':'x'},x.t))}); rc.appendChild(ul);
      });
      var mc=h('ul',{class:'prs-ck'});
      var mkc=[[S.mk.geo&&S.mk.demo&&S.mk.behav&&S.mk.decision,'All four market criteria described.','Describe all four market criteria: geography, demographics, behaviour, decision-making.'],
        [S.mk.stage,'You placed the market in a life-cycle stage.','Decide which life-cycle stage the market is in (introduction, growth, maturity, decline) and how to test it.'],
        [S.mk.target&&!VAGUE.test(S.mk.target),'A focused first segment is named.','Name a specific first segment rather than a broad group.']];
      rc.appendChild(h('div',{style:{fontWeight:500,margin:'12px 0 4px'}},'Market'));
      mkc.forEach(function(x){mc.appendChild(h('li',{class:x[0]?'':'x'},x[0]?x[1]:x[2]))}); rc.appendChild(mc);
      rc.appendChild(h('div',{class:'callout tip'},h('b',null,'Next step: test it. '),'Arrange a focus group of real or potential customers (not just friends and family). Ask: are the benefits clearly communicated and believable? Does it solve a problem? What else might they use? How valuable is it? Would they buy, how often and where would they look for it?'));
      b.appendChild(rc);
      // AI
      var aib=h('div',{class:'card'},h('div',{class:'label',style:{marginBottom:'8px'}},ctx.ai.available()?'AI challenge':'Challenge (offline)'));
      var out=h('div',{class:'ai-box'+(S.ai?'':' hide'),'aria-live':'polite'},h('span',{class:'label'},'Challenge'),h('span',{class:'t'},S.ai||''));
      var btn=h('button',{class:'btn primary',onclick:function(){challenge(btn,out)}},ctx.ai.available()?'Ask AI to challenge my persona':'Challenge my persona');
      aib.appendChild(h('p',{class:'muted'},ctx.ai.available()?'The on-device AI will act as a sceptical market researcher and question your persona. The quick check above always works without it.':'No AI model is loaded, so this gives the most important questions from the checklist above.'));
      aib.appendChild(btn); aib.appendChild(h('div',{style:{marginTop:'12px'}},out));
      b.appendChild(aib);
      b.appendChild(h('div',{class:'row'},h('button',{class:'btn ghost',onclick:function(){if(confirm('Clear everything?')){S={step:0,idea:{name:'',offer:'',problem:'',market:'B2C',buyer:''},ps:[blankP()],cur:0,mk:{geo:'',demo:'',behav:'',decision:'',stage:'',stagenote:'',target:'',compete:''},ai:''};save();render()}}},'Reset everything')));
      return b;
    }
    function ruleChallenge(){
      var q=[];
      S.ps.forEach(function(p){pChecks(p,S.idea).filter(function(x){return !x.g}).slice(0,3).forEach(function(x){q.push((p.name||'Persona')+': '+x.t)})});
      if(!q.length)q.push('Your persona looks solid. Next, test it with real people: which of your assumptions would surprise you most if you were wrong?');
      return 'Questions to answer before you rely on this persona:\n\n'+q.map(function(x,k){return (k+1)+'. '+x}).join('\n');
    }
    function challenge(btn,out){
      if(busy)return; var t=out.querySelector('.t'); out.classList.remove('hide');
      function setT(s){S.ai=s;t.textContent=s;save()}
      if(!ctx.ai.available()){setT(ruleChallenge());return}
      var p=S.ps[S.cur]||S.ps[0], i=S.idea;
      var prompt='Business: '+(i.name||'-')+'. Offer: '+(i.offer||'-')+'. Persona: '+[p.name,p.age,p.job,p.where].filter(filled).join(', ')+'. Needs: '+(p.needs||'-')+'. Pains: '+(p.pains||'-')+'. Reached via: '+(p.channels.join(', ')||'-')+'. Decision: '+(p.decision||'-')+'. Evidence: '+(p.evidence||'unknown')+'. Focus segment: '+(S.mk.target||'-')+'.\n\nAct as a sceptical market researcher. Ask 3 short, specific challenging questions about this persona (is it too vague, is it based on real evidence, who really buys, are there enough such people). Max 100 words.';
      busy=true; btn.disabled=true; setT('Thinking…');
      var got=false;
      ctx.ai.ask({system:'You are a sceptical but constructive market researcher. Reply in plain text with a numbered list.',prompt:prompt,maxTokens:220,temperature:0.6,onToken:function(s){got=true;t.textContent=s}})
        .then(function(s){setT((s||'').trim()||ruleChallenge())})
        .catch(function(){setT(ruleChallenge()+'\n\n(AI unavailable, so this is the rules-based version.)')})
        .then(function(){busy=false;btn.disabled=false;ctx.complete(1)});
    }

    function render(){
      el.innerHTML=''; var root=h('div',{class:'tool'});
      root.appendChild(h('div',{class:'prs-steps'},STEPS.map(function(s,k){return h('button',{class:(S.step===k?'on':'')+(k<S.step?' dn':''),onclick:function(){S.step=k;save();render()}},(k+1)+' '+s)})));
      root.appendChild([idea,personas,market,review][S.step]());
      root.appendChild(h('div',{class:'row between',style:{marginTop:'6px'}},
        h('button',{class:'btn ghost',disabled:S.step===0?true:null,onclick:function(){S.step--;save();render();window.scrollTo&&el.scrollIntoView&&el.scrollIntoView()}},'Back'),
        S.step<3?h('button',{class:'btn primary',onclick:function(){S.step++;save();render();el.scrollIntoView&&el.scrollIntoView()}},'Next'):h('button',{class:'btn primary',onclick:function(){ctx.complete(1);ctx.toast('Saved. Now test your persona with real people.')}},'Finish')));
      el.appendChild(root);
    }
    render();
  }});
})();

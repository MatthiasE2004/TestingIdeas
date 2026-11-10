/* Daily lesson reminders (Android notifications scheduled natively) with catchy messages written by the local AI,
   plus the home-screen widget data feed. */
(function(){
  var h=H.h,A=window.Android;
  function native(){return !!(A&&A.scheduleReminder)}
  function S(){return Store.settings}
  function lastCourse(){var a=window.__app,best=null,bt=0;(a?a.index():[]).forEach(function(i){var p=Store.getPos(i.id);if(p&&p.t>bt){bt=p.t;best=i}});return best}
  /* fallback messages: varied, urgent, course-specific */
  function templates(ctx){var c=ctx.course,t=ctx.topic,n=ctx.streak;
    return [
      {t:n>1?'🔥 '+n+'-day streak on the line!':'🔥 Start your streak today',b:'One page of '+c+' keeps it alive. Two minutes. Go!'},
      {t:'Your '+c+' is waiting',b:'“'+t+'” won’t learn itself. Tap to pick up exactly where you stopped.'},
      {t:'⏰ Daily lesson check',b:'Still at 0 pages today. Beat the clock – '+c+' in 5 minutes flat.'},
      {t:'Don’t break the chain',b:(n>0?n+' days in a row. ':'')+'One quick page of '+c+' and today counts.'},
      {t:'Quick one?',b:'Your future self wants you to finish “'+t+'”. Just one page!'},
      {t:'🚨 Streak alert',b:'Your streak ends at midnight. Save it with one page of '+c+'.'}]}
  function context(){var a=window.__app,c=lastCourse();if(!c)return Promise.resolve(null);
    return a.loadCourse(c.id).then(function(co){var p=Store.getPos(c.id)||{ch:0,pg:0},ch=co.chapters[p.ch]||co.chapters[0],pg=ch&&ch.pages[p.pg];
      return {course:co.title,chapter:ch?ch.title:'',topic:pg?pg.title:(ch?ch.title:co.title),streak:Streak.compute().streak,hash:'#/p/'+c.id+'/'+(p.ch||0)+'/'+(p.pg||0)}})}
  function parse(t){return String(t||'').split(/\n+/).map(function(l){return l.replace(/^\s*(\d+[.)]|[-*•])\s*/,'').replace(/^["“]|["”]$/g,'').trim()}).filter(function(l){return l.length>12&&l.length<140})}
  /** writes a fresh batch of notification texts to the native side; AI-written when a model is loaded */
  function refreshMessages(force){
    if(!native()||!S().remindOn)return Promise.resolve();
    var age=Date.now()-(+S().remindGenAt||0);if(!force&&age<36e5*20&&S().remindGenFor===(lastCourse()||{}).id)return Promise.resolve();
    return context().then(function(ctx){if(!ctx)return;var msgs=templates(ctx);
      var done=function(list){try{A.setReminderMessages(JSON.stringify({hash:ctx.hash,msgs:list}))}catch(e){}S().remindGenAt=Date.now();S().remindGenFor=(lastCourse()||{}).id;Store.saveSettings()};
      if(!AI.available()){done(msgs);return}
      var p='Write 5 different push-notification texts that remind a student to study one page today. Course: "'+ctx.course+'". They stopped at: "'+ctx.topic+'". Current streak: '+ctx.streak+' days. Make them catchy, fun, slightly urgent, varied, max 90 characters each, refer to the topic. One per line, no numbering.';
      return AI.ask({system:'You write short, punchy app notifications.',prompt:p,maxTokens:220,temperature:0.9}).then(function(t){
        var ai=parse(t).slice(0,5).map(function(b,i){return {t:['🔥 Keep the streak alive','⏰ Daily lesson','Your '+ctx.course+' is calling','🚨 Streak alert','One page. Right now.'][i%5],b:b}});
        done(ai.length>=3?ai.concat(msgs.slice(0,2)):msgs)},function(){done(msgs)})})}
  function schedule(){if(!native())return;try{var tm=(S().remindTime||'19:00').split(':');A.scheduleReminder(!!S().remindOn,+tm[0],+tm[1])}catch(e){}}
  /* ---------- home-screen widget feed ---------- */
  var wt=null;
  function pushWidget(){if(!(A&&A.updateWidget))return;clearTimeout(wt);wt=setTimeout(function(){var a=window.__app;if(!a)return;
    Promise.all(a.index().map(function(i){return a.loadCourse(i.id)})).then(function(cs){
      var list=cs.map(function(c){var tot=0,dn=0,first=null;c.chapters.forEach(function(ch,ci){ch.pages.forEach(function(p,pi){tot++;if(Store.isDone(p.id))dn++;else if(!first)first=[ci,pi]})});
        var pos=Store.getPos(c.id),r=pos?[pos.ch,pos.pg]:(first||[0,0]);return {id:c.id,title:c.title,pct:tot?Math.round(dn/tot*100):0,hash:'#/p/'+c.id+'/'+r[0]+'/'+r[1]}});
      var s=Streak.compute();try{A.updateWidget(JSON.stringify({courses:list,streak:s.streak}))}catch(e){}})},1500)}
  Store.on(pushWidget);
  var Reminders={
    refresh:refreshMessages,schedule:schedule,pushWidget:pushWidget,
    card:function(){
      var card=h('div',{class:'card'});
      card.appendChild(h('div',{class:'label'},'Daily lesson'));card.appendChild(h('h3',{style:{margin:'4px 0 6px'}},'Goal and reminders'));
      var g=h('input',{class:'input',type:'number',min:'1',max:'50',value:String(Streak.goal()),style:{width:'90px'}});
      g.addEventListener('change',function(){S().dailyGoal=Math.max(1,Math.min(50,+g.value||5));Store.saveSettings();H.toast('Daily goal: '+S().dailyGoal+' pages')});
      card.appendChild(h('div',{class:'row',style:{margin:'6px 0 12px'}},h('span',null,'Pages per daily lesson'),g));
      card.appendChild(h('p',{class:'muted tiny'},'Your streak counts every day you read at least one page; a full badge means you reached the daily goal.'));
      if(!native()){card.appendChild(h('div',{class:'callout note'},'Reminders are sent by the Android app.'));return card}
      var on=h('button',{class:'sw'+(S().remindOn?' on':''),onclick:function(){S().remindOn=!S().remindOn;Store.saveSettings();on.classList.toggle('on',!!S().remindOn);
        if(S().remindOn){try{A.requestNotificationPermission()}catch(e){}refreshMessages(true)}schedule();H.toast(S().remindOn?'Reminder on at '+(S().remindTime||'19:00'):'Reminder off')}});
      var tm=h('input',{class:'input',type:'time',value:S().remindTime||'19:00',style:{width:'130px'}});
      tm.addEventListener('change',function(){S().remindTime=tm.value||'19:00';Store.saveSettings();schedule();H.toast('Reminder at '+S().remindTime)});
      card.appendChild(h('div',{class:'row between',style:{marginTop:'8px'}},h('span',null,'Remind me every day'),on));
      card.appendChild(h('div',{class:'row',style:{marginTop:'10px'}},h('span',null,'At'),tm));
      card.appendChild(h('p',{class:'muted tiny',style:{marginTop:'8px'}},'Skipped automatically on days you already read. Messages are written by the local AI about the course you were last studying (when a model is loaded), otherwise from built-in templates.'));
      card.appendChild(h('button',{class:'btn sm ghost',style:{marginTop:'6px'},onclick:function(){refreshMessages(true).then(function(){try{A.testReminder()}catch(e){}H.toast('Test notification sent')})}},'Send a test reminder'));
      return card}
  };
  window.Reminders=Reminders;
  /* keep native state in sync: schedule, fresh messages once the model is ready, widget */
  setTimeout(function(){schedule();pushWidget();refreshMessages(false)},4000);
  LLM.on(function(s){if(s&&s.state==='ready')setTimeout(function(){refreshMessages(false)},3000)});
})();

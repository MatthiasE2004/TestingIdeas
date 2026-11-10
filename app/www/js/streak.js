/* Streak tracker: days in a row with at least one page read, and this week's badges (pages per day vs the daily goal). */
(function(){
  var h=H.h;
  function key(d){return Store.dayKey(d.getTime())}
  function goal(){return Math.max(1,+Store.settings.dailyGoal||5)}
  var Streak={
    goal:goal,
    compute:function(){
      Store.activity();var today=new Date();today.setHours(12,0,0,0);
      var n=0,d=new Date(today);
      if(!Store.readOn(key(d)))d.setDate(d.getDate()-1);   // today not done yet: the streak is still alive from yesterday
      while(Store.readOn(key(d))>0){n++;d.setDate(d.getDate()-1)}
      var monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
      var week=[];for(var i=0;i<7;i++){var x=new Date(monday);x.setDate(monday.getDate()+i);var k=key(x);
        week.push({key:k,label:'MTWTFSS'[i],count:Store.readOn(k),isToday:k===key(today),future:x>today})}
      return {streak:n,today:Store.readOn(key(today)),week:week,goal:goal()}},
    /** dotted red flame (Nothing style) */
    fire:function(px){var F=['0001000','0011000','0011100','0111100','0111110','1111111','1110111','1100011','0111110'],c=px||4,out='';
      F.forEach(function(r,y){for(var x=0;x<7;x++)if(r[x]==='1')out+='<circle cx="'+(x*c+c/2)+'" cy="'+(y*c+c/2)+'" r="'+(c*0.38)+'" fill="var(--red)"/>'});
      return '<svg viewBox="0 0 '+7*c+' '+9*c+'" width="'+7*c+'" height="'+9*c+'" aria-hidden="true">'+out+'</svg>'},
    card:function(onTap){
      var s=Streak.compute(),c=h('div',{class:'streak card',onclick:onTap||null});
      c.appendChild(h('div',{class:'row',style:{gap:'12px',alignItems:'center'}},h('span',{html:Streak.fire(4)}),
        h('div',{html:Dot.text(String(s.streak),{size:6})}),h('div',null,h('div',{style:{fontWeight:500}},s.streak===1?'day streak':'day streak'),
          h('div',{class:'tiny muted'},s.today?(s.today>=s.goal?'Daily lesson done ✓':s.today+' of '+s.goal+' pages today'):'Read a page today to keep it going'))));
      var row=h('div',{class:'wk'});
      s.week.forEach(function(d){var cls='bd'+(d.future?' fut':d.count>=s.goal?' full':d.count>0?' part':' empty')+(d.isToday?' today':'');
        row.appendChild(h('div',{class:'wd'},h('div',{class:cls,title:d.key+': '+d.count+' pages'},d.count&&!d.future?String(d.count):''),h('div',{class:'label'},d.label)))});
      c.appendChild(row);return c}
  };
  window.Streak=Streak;
})();

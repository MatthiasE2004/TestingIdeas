/* Pop-up AI chat (top-right AI button in the course viewer): page context chip that can be cancelled,
   mode pill next to the input with a mode menu and "Manage modes". */
(function(){
  var h=H.h,cur=null,hist={};
  function close(){if(!cur)return;var c=cur;cur=null;c.classList.remove('in');setTimeout(function(){c.remove()},200)}
  /** o:{course, pid, pageTitle} */
  function open(o){
    close();
    var key=o.course.id+'|'+(o.pid||''),msgs=hist[key]||(hist[key]=[]),ctxOn=!!o.pid,busy=false;
    var log=h('div',{class:'cp-log'}),inp=h('textarea',{class:'cp-input',rows:'1',placeholder:'Ask the AI...'}),send=h('button',{class:'cp-send','aria-label':'Send',html:Dot.icon('next',20)});
    var ctxRow=h('div',{class:'cp-ctx'}),pill=h('button',{class:'cp-mode','aria-haspopup':'menu'}),menu=h('div',{class:'cp-menu hide',role:'menu'});
    var chatView=h('div',{class:'cp-view'}),manageView=h('div',{class:'cp-view hide'});
    var card=h('div',{class:'cp-in'});
    var el=h('div',{class:'cp',role:'dialog','aria-label':'AI chat'},h('div',{class:'cp-scrim',onclick:close}),card);
    card.appendChild(h('div',{class:'cp-head'},h('div',{class:'row',style:{gap:'8px'}},h('span',{html:Dot.icon('spark',18)}),h('b',{style:{fontWeight:500}},'AI')),
      h('span',{class:'tiny muted',style:{flex:1,textAlign:'right',marginRight:'8px'}},AI.available()?((LLM.status().model||{}).name||''):'No model loaded'),
      h('button',{class:'round','aria-label':'Close',onclick:close,html:'<span style="font-size:18px">✕</span>'})));
    card.appendChild(chatView);card.appendChild(manageView);
    chatView.appendChild(ctxRow);chatView.appendChild(log);
    chatView.appendChild(h('div',{class:'cp-bar'},menu,pill,inp,send));
    function drawCtx(){ctxRow.innerHTML='';
      if(ctxOn)ctxRow.appendChild(h('span',{class:'cp-chip',title:o.pageTitle||''},'Context: current page',h('button',{class:'cp-x','aria-label':'Remove page context',onclick:function(){ctxOn=false;drawCtx()}},'✕')));
      else{ctxRow.appendChild(h('span',{class:'cp-chip off'},'General answers'));if(o.pid)ctxRow.appendChild(h('button',{class:'cp-add',onclick:function(){ctxOn=true;drawCtx()}},'+ Use current page'))}}
    function drawPill(){var m=Modes.active('chat');pill.innerHTML='';pill.appendChild(document.createTextNode(m.name));pill.appendChild(h('span',{class:'cp-caret'},'▾'))}
    function drawMenu(){menu.innerHTML='';
      Modes.list('chat').forEach(function(m){var on=Modes.active('chat').id===m.id;
        menu.appendChild(h('button',{class:'cp-mi'+(on?' on':''),role:'menuitemradio','aria-checked':on?'true':'false',onclick:function(){Modes.setActive(m.id,'chat');drawPill();menu.classList.add('hide')}},
          h('span',{class:'cp-check'},on?'✓':''),h('span',null,h('b',{style:{fontWeight:500}},m.name),h('div',{class:'tiny muted'},clipText(m.instructions,70)))))});
      menu.appendChild(h('button',{class:'cp-mi manage',onclick:function(){menu.classList.add('hide');showManage()}},h('span',{class:'cp-check',html:'<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 20h4L19 9l-4-4L4 16z M14 6l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'}),h('span',null,'Manage modes')))}
    pill.addEventListener('click',function(e){e.stopPropagation();if(menu.classList.contains('hide')){drawMenu();menu.classList.remove('hide')}else menu.classList.add('hide')});
    card.addEventListener('click',function(e){if(!menu.contains(e.target)&&e.target!==pill)menu.classList.add('hide')});
    function showManage(){chatView.classList.add('hide');manageView.classList.remove('hide');manageView.innerHTML='';
      manageView.appendChild(h('div',{class:'row',style:{gap:'8px',margin:'4px 0 10px'}},h('button',{class:'btn sm ghost',onclick:function(){manageView.classList.add('hide');chatView.classList.remove('hide');drawPill()}},'‹ Back to chat'),h('b',{style:{fontWeight:500}},'Chat modes')));
      manageView.appendChild(h('p',{class:'tiny muted'},'Choose how the AI answers. Add your own mode with custom instructions; your modes can be edited or deleted.'));
      manageView.appendChild(ModesUI.manager(function(){drawPill()},'chat'))}
    function drawLog(){log.innerHTML='';
      if(!msgs.length)log.appendChild(h('div',{class:'cp-empty'},ctxOn?'Ask anything about “'+(o.pageTitle||'this page')+'”. Remove the context chip for a general answer.':'Ask anything.'));
      msgs.forEach(function(m){var b=h('div',{class:'bub '+m.role},h('div',{style:{whiteSpace:'pre-wrap'}},m.text));
        if(m.role==='ai'&&m.mode)b.appendChild(h('div',{class:'tiny muted',style:{marginTop:'6px'}},m.mode+(m.ctx?' · page context':' · general')));log.appendChild(b)});
      log.scrollTop=log.scrollHeight}
    function go(){
      var q=inp.value.trim();if(!q||busy)return;
      if(!AI.available()){H.toast('Load a model first (Settings > AI)');return}
      inp.value='';autosize();busy=true;var m={role:'ai',text:'Thinking...',mode:Modes.active('chat').name,ctx:ctxOn};msgs.push({role:'user',text:q});msgs.push(m);drawLog();
      var p=Prompts.ask({question:q,course:o.course,pid:ctxOn?o.pid:null,selection:'',useCourse:ctxOn,useNotes:false,general:!ctxOn,history:msgs.slice(0,-2)});
      var t0=Date.now(),got=false,tick=setInterval(function(){if(!got){m.text='Thinking... '+Math.round((Date.now()-t0)/1000)+' s';last()}},1000);
      send.innerHTML='<span style="font-size:13px;font-weight:600">Stop</span>';send.onclick=function(){LLM.cancel()};
      AI.ask({system:p.system,prompt:p.prompt,maxTokens:p.maxTokens,temperature:0,onToken:function(t){got=true;m.text=t;last()}}).then(function(t){m.text=t||'(no answer)';fin()},function(e){m.text=e.message==='cancelled'?'Stopped.':e.message==='timeout'?'The AI took too long.':'AI error: '+e.message;fin()});
      function fin(){clearInterval(tick);busy=false;send.innerHTML=Dot.icon('next',20);send.onclick=go;drawLog()}}
    function last(){var bs=log.querySelectorAll('.bub.ai');if(bs.length){bs[bs.length-1].firstChild.textContent=msgs[msgs.length-1].text;log.scrollTop=log.scrollHeight}}
    function autosize(){inp.style.height='auto';inp.style.height=Math.min(120,inp.scrollHeight)+'px'}
    inp.addEventListener('input',autosize);inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});send.onclick=go;
    document.body.appendChild(el);drawCtx();drawPill();drawLog();requestAnimationFrame(function(){el.classList.add('in')});cur=el;
    return {close:close}
  }
  window.ChatPop={open:open,close:close};
})();

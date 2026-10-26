/* In-app AI self-test: tells the learner (and the automated tests) whether local AI really works on this device. */
(function(){
  function stallMeter(){var last=performance.now(),max=0,id=setInterval(function(){var n=performance.now();max=Math.max(max,n-last-100);last=n},100);return {stop:function(){clearInterval(id);return Math.round(Math.max(0,max))}}}
  window.SelfTest={
    /** onUpdate(steps) is called after every change. Resolves with {ok, steps, summary} */
    run:function(onUpdate,opts){
      opts=opts||{};var steps=[];
      function step(name){var s={name:name,status:'run',detail:''};steps.push(s);onUpdate&&onUpdate(steps);return s}
      function done(s,status,detail){s.status=status;s.detail=detail||'';onUpdate&&onUpdate(steps)}
      var dev=Store.settings.device==='webgpu'?'webgpu':'wasm',stall;
      var s1=step('Environment');
      return LLM.gpuInfo().then(function(g){
        var bits=['secure context: '+(self.isSecureContext?'yes':'NO'),'workers: '+(window.Worker?'yes':'NO'),'WebGPU: '+(g.webgpu?'yes'+(g.f16?' (fp16)':''):'no'),'threads: '+(self.crossOriginIsolated?'multi (isolated)':'single (not isolated - slower)')];
        done(s1,(self.isSecureContext&&window.Worker)?(self.crossOriginIsolated?'ok':'warn'):'fail',bits.join(' · ')+' · mode: '+(dev==='webgpu'?'GPU':'CPU'));
        if(!(self.isSecureContext&&window.Worker))throw new Error('stop');
        var s2=step('Model');var st=LLM.status();
        if(st.state==='ready'){done(s2,'ok',st.model.name+' already loaded ('+st.backend+')');return}
        var id=Store.settings.model;var m=id&&(LLM.catalog.filter(function(c){return c.id===id})[0]||(LLM.downloaded(id)?{id:id,repo:id,name:id,custom:true}:null));
        if(!m||!LLM.downloaded(m)){done(s2,'fail','No downloaded model is selected. Download/select one above first.');throw new Error('stop')}
        var t0=Date.now();s2.detail='loading '+m.name+'...';onUpdate&&onUpdate(steps);
        return LLM.load(m,{device:dev}).then(function(){done(s2,'ok',m.name+' loaded in '+((Date.now()-t0)/1000).toFixed(1)+' s ('+LLM.status().backend+')')},function(e){done(s2,'fail',String(e.message||e));throw new Error('stop')});
      }).then(function(){
        var s3=step('Generate');stall=stallMeter();var t0=Date.now(),first=0;
        return LLM.generate({system:'You are a helpful assistant.',prompt:'Say hello in five words.',maxTokens:16,temperature:0,timeoutMs:150000,onToken:function(){if(!first)first=Date.now()}}).then(function(t){
          var ms=stall.stop();var tps=LLM.lastTps;
          done(s3,(t&&t.length)?(ms>1500?'warn':'ok'):'fail','first word after '+((first-t0)/1000).toFixed(1)+' s · '+tps.toFixed(1)+' tokens/s · screen froze at most '+ms+' ms · "'+String(t).slice(0,60)+'"');
        },function(e){stall.stop();done(s3,'fail',e.message==='timeout'?'No answer within 150 s - this model is too slow for this device. Try a smaller model.':String(e.message||e));throw new Error('stop')});
      }).then(function(){
        var s4=step('Feedback test');var t0=Date.now();stall=stallMeter();
        return AI.feedback({question:'What is a project?',answer:'A project is a temporary effort to create a unique product within a budget.',points:['A project is temporary','It creates something unique','It has limited resources'],model:'x'}).then(function(r){
          var ms=stall.stop(),secs=(Date.now()-t0)/1000;
          done(s4,r.source==='ai'&&r.text?(secs>60?'warn':'ok'):'fail','real feedback request took '+secs.toFixed(0)+' s ('+(r.source==='ai'?'AI answered':'AI failed, fell back to rules')+') · freeze '+ms+' ms');
        });
      }).catch(function(e){if(e.message!=='stop')done(steps[steps.length-1]||step('Error'),'fail',String(e.message||e))}).then(function(){
        var bad=steps.some(function(s){return s.status==='fail'}),warn=steps.some(function(s){return s.status==='warn'});
        var out={ok:!bad,steps:steps,summary:bad?'FAILED - AI will not work with these settings.':warn?'PASSED with warnings - works, but slowly.':'PASSED - local AI works on this device.'};
        return out});
    }
  };
})();

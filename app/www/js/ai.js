/* AI facade. Uses the on-device LLM (js/llm.js) when a model is loaded, otherwise a rule-based fallback.
   Every tool must keep working when AI.available() is false. */
(function(){
  function tokens(s){return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(function(w){return w.length>3})}
  function stem(w){return w.replace(/(ing|ed|es|s|ly)$/,'')}
  // Fallback: which key points did the answer touch? points = array of sentences
  function coverage(answer,points){
    var a={}; tokens(answer).forEach(function(w){a[stem(w)]=1});
    return (points||[]).map(function(p){
      var t=tokens(p).map(stem); if(!t.length)return {point:p,hit:false};
      var n=t.filter(function(w){return a[w]}).length; return {point:p,hit:n/t.length>=0.34};});
  }
  var AI={
    available:function(){return !!(window.LLM&&window.LLM.isReady&&window.LLM.isReady())},
    /** opts:{system,prompt,maxTokens,temperature,onToken(text)} -> Promise<string>; rejects if no model */
    ask:function(opts){ if(!AI.available())return Promise.reject(new Error('no-model')); return window.LLM.generate(opts)},
    /** Feedback on a free-text answer. opts:{question,answer,points[],model,context}
        -> Promise<{text,source:'ai'|'rules',covered:[{point,hit}]}> never rejects */
    feedback:function(opts){
      var cov=coverage(opts.answer,opts.points); var hits=cov.filter(function(c){return c.hit}).length;
      var rules=function(){
        var txt=(opts.answer||'').trim().split(/\s+/).length<8?'Your answer is quite short - try to explain your reasoning in a few sentences.\n\n':'';
        txt+=cov.length?('You touched on '+hits+' of '+cov.length+' key ideas:\n'+cov.map(function(c){return (c.hit?'✓ ':'○ ')+c.point}).join('\n')):'';
        if(opts.model)txt+='\n\nSuggested answer:\n'+opts.model;
        return {text:txt.trim(),source:'rules',covered:cov};};
      if(!AI.available())return Promise.resolve(rules());
      // keep the prompt short: on CPU every prompt token costs time
      var pr=Prompts.feedback({question:opts.question,answer:opts.answer,points:opts.points,model:opts.model,course:opts.course,pid:opts.pid});
      return AI.ask({system:pr.system,prompt:pr.prompt,maxTokens:pr.maxTokens,temperature:0,onToken:opts.onToken}).then(function(t){return {text:t.trim(),source:'ai',covered:cov}}).catch(function(e){var r=rules();
        if(e&&(e.message==='timeout'||e.message==='cancelled'))r.text=(e.message==='timeout'?'The AI took too long, so here is a self-check instead.\n\n':'Cancelled. Self-check instead:\n\n')+r.text;
        return r});
    },
    coverage:coverage
  };
  window.AI=AI;
})();

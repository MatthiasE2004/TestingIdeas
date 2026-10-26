/* Lazy-loads tool scripts: window.ToolLoader.ensure(id) -> Promise. Tool files may register several ids. */
(function(){
  var FILES={'pm-sim':'pm-sim','stakeholder-grid':'stakeholder-grid','swot-pest':'swot-pest','org-objectives':'org-objectives','fin-calc':'fin-calc','risk-matrix':'risk-matrix','decision-matrix':'decision-matrix','lifecycle-sort':'lifecycle-sort','method-picker':'method-picker','persona':'persona','bmc':'bmc','value-prop':'value-prop','idea-lab':'idea-lab','breakeven':'breakeven','pitch':'pitch'};
  var loaded={};
  window.ToolLoader={ensure:function(id){
    if(Tools.get(id))return Promise.resolve(true);
    var f=FILES[id]||id; if(!loaded[f])loaded[f]=new Promise(function(res){var s=document.createElement('script');s.src='tools/'+f+'.js';s.onload=function(){res(true)};s.onerror=function(){res(false)};document.head.appendChild(s)});
    return loaded[f].then(function(){return !!Tools.get(id)});}};
})();

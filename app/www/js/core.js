/* Core helpers shared by app + interactive tools */
(function(){
  function h(tag,attrs){
    var el=document.createElement(tag); attrs=attrs||{};
    for(var k in attrs){var v=attrs[k]; if(v==null||v===false)continue;
      if(k==='class')el.className=v; else if(k==='style'&&typeof v==='object')Object.assign(el.style,v);
      else if(k.slice(0,2)==='on'&&typeof v==='function')el.addEventListener(k.slice(2),v);
      else if(k==='html')el.innerHTML=v; else if(k==='value')el.value=v; else el.setAttribute(k,v===true?'':v);}
    for(var i=2;i<arguments.length;i++)add(el,arguments[i]); return el;}
  function add(el,c){ if(c==null||c===false)return; if(Array.isArray(c))c.forEach(function(x){add(el,x)});
    else el.appendChild(c.nodeType?c:document.createTextNode(String(c)));}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  // tiny inline markdown: **bold**, *italic*
  function md(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>').replace(/\n/g,'<br>')}
  function toast(msg){var t=h('div',{style:{position:'fixed',left:'50%',bottom:'90px',transform:'translateX(-50%)',background:'#0B0B0B',color:'#fff',padding:'10px 20px',borderRadius:'99px',zIndex:9999,fontSize:'.9rem'}},msg);document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
  var reg={};
  window.Tools={register:function(id,def){def.id=id;reg[id]=def},get:function(id){return reg[id]},all:function(){return reg}};
  window.H={h:h,esc:esc,md:md,toast:toast};
})();

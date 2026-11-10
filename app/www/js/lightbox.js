/* Figure viewer: almost full-screen pop-up with pinch / wheel / double-tap zoom and pan.
   Press and hold the picture for Highlight / Note / Ask AI (handled by the caller through o.actions). */
(function(){
  var h=H.h,cur=null;
  function close(){if(!cur)return;var c=cur;cur=null;c.el.classList.remove('in');document.removeEventListener('keydown',c.key);setTimeout(function(){c.el.remove()},180)}
  /** o:{src,caption,alt, actions:function(bar,close) -> fills an action bar, showActions:bool} */
  function open(o){
    close();
    var img=h('img',{src:o.src,alt:o.alt||'',draggable:'false'}),stage=h('div',{class:'lb-stage'},img),bar=h('div',{class:'lb-bar hide'});
    var el=h('div',{class:'lb',role:'dialog','aria-label':'Figure'},h('div',{class:'lb-in'},
      h('div',{class:'lb-head'},h('span',{class:'label',style:{color:'#9a9a9a'}},'Pinch or double-tap to zoom · hold to highlight or add a note'),h('button',{class:'round dark','aria-label':'Close',onclick:close,html:'<span style="font-size:20px;line-height:1">✕</span>'})),
      stage,o.caption?h('div',{class:'lb-cap'},o.caption):null,bar));
    document.body.appendChild(el);requestAnimationFrame(function(){el.classList.add('in')});
    var s=1,tx=0,ty=0,base={w:0,h:0,x:0,y:0};
    function fit(){var r=stage.getBoundingClientRect(),iw=img.naturalWidth||r.width,ih=img.naturalHeight||r.height,k=Math.min(r.width/iw,r.height/ih);
      base={w:iw*k,h:ih*k,x:(r.width-iw*k)/2,y:(r.height-ih*k)/2};img.style.width=base.w+'px';img.style.height=base.h+'px';s=1;tx=base.x;ty=base.y;apply()}
    function apply(){var r=stage.getBoundingClientRect(),w=base.w*s,hh=base.h*s;
      if(w<=r.width)tx=(r.width-w)/2;else tx=Math.min(0,Math.max(r.width-w,tx));
      if(hh<=r.height)ty=(r.height-hh)/2;else ty=Math.min(0,Math.max(r.height-hh,ty));
      img.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')'}
    function zoomAt(px,py,ns){ns=Math.max(1,Math.min(6,ns));var r=stage.getBoundingClientRect(),x=px-r.left,y=py-r.top;tx=x-(x-tx)*(ns/s);ty=y-(y-ty)*(ns/s);s=ns;apply()}
    if(img.complete)setTimeout(fit,0);else img.onload=fit;window.addEventListener('resize',fit);
    /* touch: pinch, pan, double tap, long press */
    var t0=null,pinch=null,lastTap=0,lp=null,moved=false;
    function dist(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
    stage.addEventListener('touchstart',function(e){
      if(e.touches.length===2){clearTimeout(lp);pinch={d:dist(e.touches[0],e.touches[1]),s:s,mx:(e.touches[0].clientX+e.touches[1].clientX)/2,my:(e.touches[0].clientY+e.touches[1].clientY)/2};return}
      var t=e.touches[0];t0={x:t.clientX,y:t.clientY,tx:tx,ty:ty};moved=false;
      clearTimeout(lp);lp=setTimeout(function(){if(!moved&&!pinch)showActions()},500)},{passive:true});
    stage.addEventListener('touchmove',function(e){e.preventDefault();
      if(pinch&&e.touches.length===2){var d=dist(e.touches[0],e.touches[1]);zoomAt(pinch.mx,pinch.my,pinch.s*d/pinch.d);return}
      if(!t0)return;var t=e.touches[0];if(Math.abs(t.clientX-t0.x)+Math.abs(t.clientY-t0.y)>8){moved=true;clearTimeout(lp)}
      if(s>1){tx=t0.tx+(t.clientX-t0.x);ty=t0.ty+(t.clientY-t0.y);apply()}},{passive:false});
    stage.addEventListener('touchend',function(e){clearTimeout(lp);if(e.touches.length<2)pinch=null;
      if(!moved&&t0&&e.touches.length===0){var now=Date.now();if(now-lastTap<300){zoomAt(t0.x,t0.y,s>1.2?1:2.5);lastTap=0}else lastTap=now}
      if(e.touches.length===0)t0=null});
    /* mouse: wheel zoom, drag, double click, hold */
    var md=null;
    stage.addEventListener('wheel',function(e){e.preventDefault();zoomAt(e.clientX,e.clientY,s*(e.deltaY<0?1.15:0.87))},{passive:false});
    stage.addEventListener('dblclick',function(e){zoomAt(e.clientX,e.clientY,s>1.2?1:2.5)});
    stage.addEventListener('mousedown',function(e){md={x:e.clientX,y:e.clientY,tx:tx,ty:ty};moved=false;clearTimeout(lp);lp=setTimeout(function(){if(!moved)showActions()},500)});
    window.addEventListener('mousemove',mm);window.addEventListener('mouseup',mu);
    function mm(e){if(!md)return;if(Math.abs(e.clientX-md.x)+Math.abs(e.clientY-md.y)>6){moved=true;clearTimeout(lp)}if(s>1){tx=md.tx+(e.clientX-md.x);ty=md.ty+(e.clientY-md.y);apply()}}
    function mu(){md=null;clearTimeout(lp)}
    function showActions(){if(!o.actions)return;bar.innerHTML='';o.actions(bar,close);bar.classList.remove('hide');if(navigator.vibrate)try{navigator.vibrate(15)}catch(e){}}
    var key=function(e){if(e.key==='Escape')close()};document.addEventListener('keydown',key);
    el.addEventListener('click',function(e){if(e.target===el)close()});
    cur={el:el,key:key};
    var origClose=close;
    el.__cleanup=function(){window.removeEventListener('resize',fit);window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu)};
    if(o.showActions)setTimeout(showActions,50);
    return {close:close,zoom:function(){return s}};
  }
  var _close=close;close=function(){if(cur&&cur.el.__cleanup)cur.el.__cleanup();_close()};
  window.Lightbox={open:open,close:function(){close()}};
})();

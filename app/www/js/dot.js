/* Dot-matrix text + dotted progress ring + icons (Nothing-style) */
(function(){
  var F={};
  function def(c,s){F[c]=s.split('/')}
  def('A','01110/10001/10001/11111/10001/10001/10001');def('B','11110/10001/10001/11110/10001/10001/11110');
  def('C','01110/10001/10000/10000/10000/10001/01110');def('D','11110/10001/10001/10001/10001/10001/11110');
  def('E','11111/10000/10000/11110/10000/10000/11111');def('F','11111/10000/10000/11110/10000/10000/10000');
  def('G','01110/10001/10000/10111/10001/10001/01111');def('H','10001/10001/10001/11111/10001/10001/10001');
  def('I','01110/00100/00100/00100/00100/00100/01110');def('J','00111/00010/00010/00010/00010/10010/01100');
  def('K','10001/10010/10100/11000/10100/10010/10001');def('L','10000/10000/10000/10000/10000/10000/11111');
  def('M','10001/11011/10101/10101/10001/10001/10001');def('N','10001/11001/10101/10011/10001/10001/10001');
  def('O','01110/10001/10001/10001/10001/10001/01110');def('P','11110/10001/10001/11110/10000/10000/10000');
  def('Q','01110/10001/10001/10001/10101/10010/01101');def('R','11110/10001/10001/11110/10100/10010/10001');
  def('S','01111/10000/10000/01110/00001/00001/11110');def('T','11111/00100/00100/00100/00100/00100/00100');
  def('U','10001/10001/10001/10001/10001/10001/01110');def('V','10001/10001/10001/10001/10001/01010/00100');
  def('W','10001/10001/10001/10101/10101/11011/10001');def('X','10001/10001/01010/00100/01010/10001/10001');
  def('Y','10001/10001/01010/00100/00100/00100/00100');def('Z','11111/00001/00010/00100/01000/10000/11111');
  def('0','01110/10001/10011/10101/11001/10001/01110');def('1','00100/01100/00100/00100/00100/00100/01110');
  def('2','01110/10001/00001/00010/00100/01000/11111');def('3','11110/00001/00001/01110/00001/00001/11110');
  def('4','00010/00110/01010/10010/11111/00010/00010');def('5','11111/10000/11110/00001/00001/10001/01110');
  def('6','00110/01000/10000/11110/10001/10001/01110');def('7','11111/00001/00010/00100/01000/01000/01000');
  def('8','01110/10001/10001/01110/10001/10001/01110');def('9','01110/10001/10001/01111/00001/00010/01100');
  def('%','11001/11010/00010/00100/01000/01011/10011');def('.','00000/00000/00000/00000/00000/01100/01100');
  def(':','00000/01100/01100/00000/01100/01100/00000');def('-','00000/00000/00000/11111/00000/00000/00000');
  def('/','00001/00010/00010/00100/01000/01000/10000');def(' ','00000/00000/00000/00000/00000/00000/00000');
  def('!','00100/00100/00100/00100/00100/00000/00100');def('?','01110/10001/00001/00010/00100/00000/00100');
  def('+','00000/00100/00100/11111/00100/00100/00000');def('>','10000/01000/00100/00010/00100/01000/10000');
  /** returns an SVG element string: dots on a 5x7 grid per glyph */
  function dotText(str,o){o=o||{};var px=o.size||6,gap=o.gap||1,col=o.color||'currentColor',dim=o.dim||null,s=String(str).toUpperCase(),
    cw=5*px+gap*px,w=s.length*cw-gap*px,hh=7*px,out='',r=px*0.36;
    for(var i=0;i<s.length;i++){var g=F[s[i]]||F['?'];
      for(var y=0;y<7;y++)for(var x=0;x<5;x++){var on=g[y][x]==='1';
        if(!on&&!dim)continue;
        out+='<circle cx="'+(i*cw+x*px+px/2)+'" cy="'+(y*px+px/2)+'" r="'+(on?r:r*0.55)+'" fill="'+(on?col:dim)+'"/>';}}
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+hh+'" width="'+w+'" height="'+hh+'" style="max-width:100%;height:auto;display:block" aria-label="'+s+'">'+out+'</svg>';}
  /** ring of dots filled by pct (0..1); centre label as dot text */
  function ring(pct,o){o=o||{};var n=o.dots||48,R=o.r||44,size=R*2+14,c=size/2,filled=Math.round(n*pct),col=o.color||'var(--ink)',red=o.red,out='';
    for(var i=0;i<n;i++){var a=-Math.PI/2+i*2*Math.PI/n,x=c+R*Math.cos(a),y=c+R*Math.sin(a),on=i<filled,head=(i===filled-1&&filled<n&&filled>0&&red);
      out+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(on?3.1:2)+'" fill="'+(head?'var(--red)':(on?col:'var(--dot)'))+'"/>';}
    var label=Math.round(pct*100)+'%',ls=o.labelPx||(R>60?6:4),lw=label.length*6*ls-ls,lh=7*ls,lx=c-lw/2,ly=c-lh/2,lt='';
    for(var k=0;k<label.length;k++){var g=F[label[k]];for(var yy=0;yy<7;yy++)for(var xx=0;xx<5;xx++)if(g[yy][xx]==='1')
      lt+='<circle cx="'+(lx+k*6*ls+xx*ls+ls/2)+'" cy="'+(ly+yy*ls+ls/2)+'" r="'+(ls*0.36)+'" fill="'+col+'"/>';}
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+size+' '+size+'" width="'+(o.px||size)+'" height="'+(o.px||size)+'">'+out+lt+'</svg>';}
  var I={
    back:'<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    next:'<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    gear:'<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    play:'<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
    home:'<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    sync:'<path d="M4 12a8 8 0 0113.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.6L4 16M4 20v-4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    book:'<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z M5 17a3 3 0 013-3h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor"/>'};
  function icon(n,px){return '<svg viewBox="0 0 24 24" width="'+(px||22)+'" height="'+(px||22)+'" aria-hidden="true">'+I[n]+'</svg>'}
  window.Dot={text:dotText,ring:ring,icon:icon};
})();

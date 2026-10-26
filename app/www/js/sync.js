/* Bluetooth peer-to-peer progress sync (Android bridge) + manual code export/import fallback */
(function(){
  var A=window.Android, pending=null, permCb=null;
  window.onBtResult=function(r){var p=pending;pending=null;if(p)p(r)};
  window.onBtPermission=function(ok){var c=permCb;permCb=null;if(c)c(ok)};
  function payload(){return JSON.stringify({app:'learn',v:1,sent:Date.now(),state:Store.snapshot()})}
  function handle(r){
    if(!r.ok)return {ok:false,error:r.error||'failed'};
    try{var d=JSON.parse(r.data);if(d.app!=='learn')throw 0;return {ok:true,changed:Store.merge(d.state)}}catch(e){return {ok:false,error:'Received data was not valid'}}
  }
  var Sync={
    supported:function(){return !!(A&&A.btState)},
    state:function(){return A?A.btState():'unsupported'},
    requestPermission:function(){return new Promise(function(res){permCb=res;A.btRequestPermission()})},
    paired:function(){try{return JSON.parse(A.btPaired())}catch(e){return []}},
    openSettings:function(){A&&A.btOpenSettings()},
    /** initiate: connect to a paired device that is in "Receive" mode */
    connect:function(addr){return new Promise(function(res){pending=function(r){res(handle(r))};A.btConnect(addr,payload())})},
    /** wait up to 2 min for the other device to connect */
    listen:function(){return new Promise(function(res){pending=function(r){res(handle(r))};A.btListen(payload())})},
    cancel:function(){if(A)A.btCancel();if(pending){var p=pending;pending=null;p({ok:false,error:'cancelled'})}},
    exportCode:function(){return btoa(unescape(encodeURIComponent(payload())))},
    importCode:function(c){try{var d=JSON.parse(decodeURIComponent(escape(atob(c.trim()))));if(d.app!=='learn')throw 0;return {ok:true,changed:Store.merge(d.state)}}catch(e){return {ok:false,error:'Not a valid progress code'}}}
  };
  window.Sync=Sync;
})();

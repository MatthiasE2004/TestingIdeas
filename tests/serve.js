// static server mimicking the Android WebView asset origin: COOP/COEP headers => crossOriginIsolated
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2],port=+process.argv[3]||8810,iso=process.argv[4]!=='noiso';
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.jpg':'image/jpeg','.png':'image/png'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(root,p);
  fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('nf')}
    const h={'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'};
    if(iso){h['Cross-Origin-Opener-Policy']='same-origin';h['Cross-Origin-Embedder-Policy']='credentialless';h['Cross-Origin-Resource-Policy']='same-origin'}
    r.writeHead(200,h);r.end(d)})}).listen(port,()=>console.log('serving',root,port,iso?'isolated':'not isolated'));

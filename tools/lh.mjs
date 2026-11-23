import lighthouse from 'lighthouse'; import * as cl from 'chrome-launcher'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const dist=path.resolve('../dist');
const srv=http.createServer((q,r)=>{let p=new URL(q.url,'http://x').pathname;if(p.endsWith('/'))p+='index.html';const f=path.join(dist,p);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':{'.html':'text/html','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const port=srv.address().port; const out=[];
const chrome=await cl.launch({chromePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless=new','--no-sandbox']});
for(const id of (process.env.ORDER||'sales-1,sales-2').split(',')) for(const form of ['mobile','desktop']){
  const r=await lighthouse(`http://127.0.0.1:${port}/${id}/`,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},form==='desktop'?{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}}:undefined);
  const c=r.lhr.categories; const line=`${id} ${form}: perf ${Math.round(c.performance.score*100)} a11y ${Math.round(c.accessibility.score*100)} bp ${Math.round(c['best-practices'].score*100)} seo ${Math.round(c.seo.score*100)}`;
  out.push(line);console.log(line);if(process.env.DBG){const a=r.lhr.audits['label-content-name-mismatch'];console.log(JSON.stringify(a.details?.items?.map(i=>i.node?.snippet)));const m=r.lhr.audits;console.log('FCP',m['first-contentful-paint'].displayValue,'LCP',m['largest-contentful-paint'].displayValue,'TBT',m['total-blocking-time'].displayValue,'CLS',m['cumulative-layout-shift'].displayValue)}
  for(const a of Object.values(r.lhr.audits)) if(a.score!==null&&a.score<0.9&&a.scoreDisplayMode==='binary') console.log('   -',a.id,a.title);
  fs.writeFileSync(`../docs/lighthouse-${id}-${form}.json`,JSON.stringify({scores:line}));
}
fs.writeFileSync('../docs/lighthouse-summary.txt',out.join('\n')+'\n');
await chrome.kill();srv.close();

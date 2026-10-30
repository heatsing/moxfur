import fs from 'node:fs/promises';
import site from '../content/site.json' with {type:'json'};
const redirects=site.settings.urlRedirects.nodes;
await fs.writeFile('out/_redirects',redirects.flatMap(r=>[...new Set([r.path,decodeURIComponent(r.path)])].map(p=>`${p} ${r.target} 301`)).join('\n'));
for(const r of redirects){const decoded=decodeURIComponent(r.path),dir='out'+decoded;if(decoded!==r.path)await fs.rm('out'+r.path+'/index.html',{force:true});await fs.mkdir(dir,{recursive:true});const target=r.target.replace(/&/g,'&amp;').replace(/"/g,'&quot;');await fs.writeFile(dir+'/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://moxfur.com${target}"><title>Page moved</title></head><body><a href="${target}">Continue to the new page</a></body></html>`);}

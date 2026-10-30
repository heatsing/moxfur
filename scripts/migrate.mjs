import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const read = async p => JSON.parse((await fs.readFile(p,'utf8')).replace(/^\/\*[\s\S]*?\*\//,''));
await fs.mkdir('public/media',{recursive:true}); await fs.mkdir('content',{recursive:true});
const products=await read('migration/products.json'),collections=await read('migration/collections.json'),pages=await read('migration/pages.json'),articles=await read('migration/articles.json'),settings=(await read('migration/settings.json'))[0].data;
const templates={}; for(const file of await fs.readdir('migration/theme/templates')) if(file.endsWith('.json')) templates[file.slice(0,-5)]=await read('migration/theme/templates/'+file);
const data={products,collections,pages,articles,settings,templates};
const urls=new Set();
function collect(v){if(typeof v==='string'){for(const m of v.matchAll(/(?:https?:\/\/|\/\/)(?:cdn\.shopify\.com|moxfur\.com)\/[^\s"'<>]+|shopify:\/\/shop_images\/[^\s"'<>]+/g)){let u=m[0].replace(/&amp;/g,'&');if(u.startsWith('shopify://shop_images/'))u='https://moxfur.com/cdn/shop/files/'+u.split('/').pop();if(u.startsWith('//'))u='https:'+u;if(/\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|pdf)(\?|$)/i.test(u))urls.add(u);}}else if(v&&typeof v==='object')Object.values(v).forEach(collect);}
collect(data);const assets={},failures=[];const pending=[...urls];
async function worker(){while(pending.length){const url=pending.shift();const ext=path.extname(new URL(url).pathname);const dest='/media/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,20)+ext;try{await fs.access('public'+dest);}catch{try{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(r.status);await fs.writeFile('public'+dest,Buffer.from(await r.arrayBuffer()));}catch(e){failures.push({url,error:String(e)});continue;}}assets[url]=dest;if(Object.keys(assets).length%50===0)console.log('Downloaded',Object.keys(assets).length,'/',urls.size);}}
await Promise.all(Array.from({length:8},worker));
function rewrite(v){if(typeof v==='string'){v=v.replace(/shopify:\/\/shop_images\/([^\s"'<>]+)/g,(_,name)=>assets['https://moxfur.com/cdn/shop/files/'+name]||'https://moxfur.com/cdn/shop/files/'+name);for(const [url,local] of Object.entries(assets))v=v.split(url).join(local);return v.replace(/shopify:\/\/(pages|collections|products|blogs)\//g,'/$1/').replace(/https?:\/\/moxfur\.com(?=\/)/g,'');}if(Array.isArray(v))return v.map(rewrite);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,val])=>[k,rewrite(val)]));return v;}
await fs.writeFile('content/site.json',JSON.stringify(rewrite(data),null,2));await fs.writeFile('migration/asset-report.json',JSON.stringify({total:urls.size,downloaded:Object.keys(assets).length,failures},null,2));console.log('Migration assets',urls.size,'failures',failures.length);

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {load} from 'cheerio';
import site from '../content/site.json' with {type:'json'};
import index from '../content/rendered/index.json' with {type:'json'};
const digest=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const metadata={},downloads={},failures=[];
await fs.mkdir('public/imported',{recursive:true});
async function download(url){if(downloads[url])return downloads[url];let ext=path.extname(new URL(url).pathname);if(!/^\.(png|jpg|jpeg|webp|gif|svg)$/i.test(ext))ext='.jpg';const local='/imported/'+digest(url)+ext;try{await fs.access('public'+local);}catch{try{const r=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'Mozilla/5.0'}});if(!r.ok)throw Error('HTTP '+r.status);const type=r.headers.get('content-type')||'';if(!type.startsWith('image/'))throw Error('Not image: '+type);await fs.writeFile('public'+local,Buffer.from(await r.arrayBuffer()));}catch(e){failures.push({url,error:String(e)});return url;}}downloads[url]=local;return local;}
let repairedLinks=0;
for(const entry of index){const file='content/rendered/'+entry.file;const record=JSON.parse(await fs.readFile(file,'utf8'));const doc=load(record.html,null,false);const rawKey=entry.route.replace(/\/page\/(\d+)$/,'?page=$1');const raw=load(await fs.readFile('migration/html-cache/'+digest(rawKey)+'.html','utf8'));
 // Match original anchor IDs and text so only mistaken cart-prefix rewrites are repaired.
 raw('a[href*="/products/cartoon"]').each((_,e)=>{const anchor=raw(e),href=anchor.attr('href'),id=anchor.attr('id');if(id){doc('[id]').filter((_,el)=>doc(el).attr('id')===id).each((_,el)=>{if(doc(el).attr('href')!==href){doc(el).attr('href',href);repairedLinks++;}});}else{const text=anchor.text().replace(/\s+/g,' ').trim();if(text)doc('a[href="/pages/contact-us/"]').filter((_,el)=>doc(el).text().replace(/\s+/g,' ').trim()===text).each((_,el)=>{doc(el).attr('href',href);repairedLinks++;});}});
 for(const img of doc('img[src]').toArray()){const src=doc(img).attr('src');if(/^https?:\/\//.test(src)){doc(img).attr('src',await download(src));}}
 const get=key=>raw(`meta[property="${key}"],meta[name="${key}"]`).first().attr('content')||'';
 const m={title:record.title.trim(),description:record.description,openGraph:{title:get('og:title')||record.title.trim(),description:get('og:description')||record.description,siteName:get('og:site_name')||'Moxfur',type:get('og:type')==='article'?'article':'website'},twitter:{card:get('twitter:card')==='summary'?'summary':'summary_large_image',title:get('twitter:title')||get('og:title')||record.title.trim(),description:get('twitter:description')||record.description}};
 const originalImage=get('og:image');let image;
 const product=site.products.find(p=>record.route==='/products/'+p.handle),article=site.articles.find(a=>record.route==='/blogs/'+a.blog.handle+'/'+a.handle),collection=site.collections.find(c=>record.route==='/collections/'+c.handle);
 if(originalImage)image=product?.media.nodes.find(m=>m.image)?.image.url||article?.image?.url||collection?.image?.url||await download(new URL(originalImage,'https://moxfur.com').href);
 if(image){m.openGraph.images=[{url:image,alt:get('og:image:alt')||m.openGraph.title}];m.twitter.images=[image];}
 if(get('article:published_time'))m.openGraph.publishedTime=get('article:published_time');
 metadata[record.route]=m;
 record.html=doc.html();await fs.writeFile(file,JSON.stringify(record));
}
const home=load(await fs.readFile('migration/html-cache/'+digest('')+'.html','utf8'));const favicon=await download(new URL(home('link[rel="icon"]').attr('href'),'https://moxfur.com').href);
await fs.writeFile('content/metadata.json',JSON.stringify({favicon,pages:metadata},null,2));
await fs.writeFile('migration/audit-repairs.json',JSON.stringify({repairedLinks,downloads,failures},null,2));
console.log({repairedLinks,downloaded:Object.keys(downloads).length,failures});

import fs from 'node:fs/promises';
import {load} from 'cheerio';
import site from '../content/site.json' with {type:'json'};
import index from '../content/rendered/index.json' with {type:'json'};
const dates=JSON.parse(await fs.readFile('migration/audit-created-at.json','utf8')).products.nodes;
const cards=new Map();
for(const entry of index.filter(x=>/^\/collections\/all(?:\/page\/\d+)?$/.test(x.route))){const d=load(JSON.parse(await fs.readFile('content/rendered/'+entry.file,'utf8')).html);d('#product-grid > li').each((_,el)=>{const href=d(el).find('a[href*="/products/"]').first().attr('href');if(!href)return;d(el).find('[srcset]').removeAttr('srcset');d(el).removeClass('scroll-trigger animate--slide-in');cards.set(href.split('/products/')[1].split(/[/?#]/)[0],d(el).prop('outerHTML'));});}
const orders={};
for(const sort of ['manual','most-relevant','best-selling','title-ascending','title-descending','price-ascending','price-descending','created-ascending','created-descending']){orders[sort]=[];for(let page=1;page<=10;page++){const file=`migration/sort-${sort}-${page}.html`;let html;try{html=await fs.readFile(file,'utf8');}catch{for(let attempt=0;attempt<4;attempt++){const r=await fetch(`https://moxfur.com/collections/all?sort_by=${sort}&page=${page}`,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});if(r.ok){html=await r.text();break;}if(attempt===3)throw Error('Sort capture failed '+r.status);await new Promise(resolve=>setTimeout(resolve,2000));}await fs.writeFile(file,html);}const d=load(html);orders[sort].push(...d('#product-grid > li').map((_,el)=>d(el).find('a[href*="/products/"]').first().attr('href')?.split('/products/')[1].split(/[/?#]/)[0]).get());}if(new Set(orders[sort]).size!==site.products.length)throw Error('Incomplete '+sort+' order: '+orders[sort].length);console.log('Archived ordering:',sort,orders[sort].length);}
const products=site.products.map(p=>({handle:p.handle,title:p.title,price:Math.min(...p.variants.nodes.map(v=>Number(v.price))),createdAt:dates.find(d=>d.handle===p.handle).createdAt,available:true,html:cards.get(p.handle)}));
if(products.some(p=>!p.html))throw Error('Missing product card');
await fs.writeFile('public/catalog.json',JSON.stringify({products,orders,pageSize:20}));
console.log('Local catalog written:',products.length);

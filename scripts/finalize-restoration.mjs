import fs from 'node:fs/promises';
import {load} from 'cheerio';
import crypto from 'node:crypto';
import site from '../content/site.json' with {type:'json'};
const records=[];
const cards=new Map();
for(const file of (await fs.readdir('content/rendered')).filter(f=>f.endsWith('.json')&&f!=='index.json')){const p=JSON.parse(await fs.readFile('content/rendered/'+file,'utf8'));if(!p.route.startsWith('/collections'))continue;const $=load(p.html);$('#product-grid > li').each((_,e)=>{const href=$(e).find('a[href*="/products/"]').first().attr('href');if(href)cards.set(href.split('/products/')[1].split(/[?#/]/)[0],$.html(e));});}
for(const file of (await fs.readdir('content/rendered')).filter(f=>f.endsWith('.json')&&f!=='index.json')){
 const p=JSON.parse(await fs.readFile('content/rendered/'+file,'utf8'));const $=load(p.html,null,false);
 if(p.route.startsWith('/products/')){const product=site.products.find(x=>p.route==='/products/'+x.handle);if(product){const related=site.products.filter(x=>x.handle!==product.handle&&x.collections.nodes.some(c=>product.collections.nodes.some(z=>z.handle===c.handle))&&cards.has(x.handle)).slice(0,4);$('product-recommendations').each((_,el)=>{const cls=$(el).attr('class');$(el).replaceWith(`<div class="${cls}"><h2 class="related-products__heading inline-richtext h2">You may also like</h2><ul class="grid product-grid grid--4-col-desktop grid--2-col-tablet-down" role="list">${related.map(x=>cards.get(x.handle)).join('')}</ul></div>`);});}}
 const rawKey=p.route.replace(/\/page\/(\d+)$/,'?page=$1');
 try{const raw=load(await fs.readFile('migration/html-cache/'+crypto.createHash('sha256').update(rawKey).digest('hex').slice(0,20)+'.html','utf8'));p.structuredData=raw('script[type="application/ld+json"]').toArray().flatMap(e=>{try{const obj=JSON.parse(raw(e).text());delete obj.offers;if(obj.image){const handle=p.route.split('/').pop();const product=site.products.find(x=>x.handle===handle);const article=site.articles.find(x=>x.handle===handle);const image=product?.media.nodes.find(m=>m.image)?.image.url||article?.image?.url;if(image)obj.image='https://moxfur.com'+image;}if(obj.logo)obj.logo='https://moxfur.com'+$('.header__heading-logo').attr('src');return [obj];}catch{return [];}});}catch{}
 $('a[href*="customer_authentication"]').remove();
 if(p.route==='/search')$('#MainContent').html('<div id="mox-search-root"></div>');
 // All captured anchors remain same-origin; pagination gets its own static route.
 $('a[href]').each((_,e)=>{const el=$(e),href=el.attr('href');if(href.startsWith('/search'))return;if(href.includes('/collections/')&&href.includes('/products/'))el.attr('href','/products/'+href.split('/products/')[1]);});
 $('link').each((_,e)=>{const el=$(e);if(el.attr('media')==='print')el.attr('media','all');if(el.attr('as')==='style')el.attr('rel','stylesheet').removeAttr('as');});
 p.html=$.html();await fs.writeFile('content/rendered/'+file,JSON.stringify(p));records.push({route:p.route,file,title:p.title,description:p.description});
}
await fs.writeFile('content/rendered/index.json',JSON.stringify(records,null,2));
console.log('Finalized',records.length,'routes');

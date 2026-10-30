import fs from 'node:fs';
import path from 'node:path';
import index from '../content/rendered/index.json';
import site from '../content/site.json';
import ThemeRuntime from './ThemeRuntime';
export {index};
export function readPage(route){const entry=index.find(p=>p.route===route);return entry?JSON.parse(fs.readFileSync(path.join(process.cwd(),'content/rendered',entry.file),'utf8')):null;}
export default function RestoredPage({record}){const styles=record.css.map(s=>s.href?`<link rel="stylesheet" href="${s.href}">`:`<style>${s.text}</style>`).join('\n');const products=record.route==='/search'?site.products.map(p=>({handle:p.handle,title:p.title,tags:p.tags,image:p.media.nodes.find(m=>m.image)?.image.url})):null;return <>{(record.structuredData||[]).map((data,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>)}<div style={{display:'contents'}} dangerouslySetInnerHTML={{__html:styles+record.html.replace(/\s+srcset="[^"]*"/g,'')}} suppressHydrationWarning/><a className="mox-whatsapp" href="https://wa.me/8618924138371" target="_blank" rel="noopener noreferrer" aria-label="Contact Moxfur on WhatsApp"><span dangerouslySetInnerHTML={{__html:fs.readFileSync(path.join(process.cwd(),'content/whatsapp-icon.html'),'utf8')}}/></a><ThemeRuntime scripts={record.scripts} inline={record.inline} products={products}/></>}

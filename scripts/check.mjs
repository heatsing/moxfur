import fs from 'node:fs';
import {load} from 'cheerio';
const missing=new Set();let count=0;
function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=p+'/'+e.name;if(e.isDirectory())walk(f);else if(e.name.endsWith('.html')){count++;const doc=load(fs.readFileSync(f,'utf8'));doc('a[href],img[src]').each((_,e)=>{const h=(doc(e).attr('href')||doc(e).attr('src')).split(/[?#]/)[0];if(h.startsWith('/')&&!h.startsWith('//')&&!fs.existsSync('out'+h)&&!fs.existsSync('out'+h+'/index.html'))missing.add(h);});}}}
walk('out');console.log(JSON.stringify({htmlFiles:count,missing:[...missing]},null,2));if(missing.size)process.exitCode=1;

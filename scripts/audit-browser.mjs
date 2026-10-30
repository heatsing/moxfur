import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import index from '../content/rendered/index.json' with {type:'json'};
const base=process.env.AUDIT_URL||'http://127.0.0.1:3001';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const context=await browser.newContext();
const queue=[1440,390].flatMap(width=>index.map(({route})=>({route,width})));
const results=[],errors=[],external=[],responses=[],failed=[];
let done=0;
await Promise.all(Array.from({length:4},async()=>{
 const page=await context.newPage();let current;
 page.on('pageerror',e=>errors.push({...current,message:e.message}));
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))external.push({...current,url:r.url()});});
 page.on('response',r=>{if(r.status()>=400)responses.push({...current,url:r.url(),status:r.status()});});
 page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))failed.push({...current,url:r.url(),error:r.failure()?.errorText});});
 while(queue.length){current=queue.shift();const {route,width}=current;try{
  await page.setViewportSize({width,height:900});
  const response=await page.goto(base+(route||'')+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.classList.contains('mox-theme-ready'),{timeout:15000});
  const result=await page.evaluate(async()=>{
   const images=[...document.images];images.forEach(img=>img.loading='eager');
   await Promise.race([Promise.all(images.map(img=>img.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,15000))]);
   return {title:document.title,h1:document.querySelector('h1')?.textContent.trim(),overflow:document.documentElement.scrollWidth>innerWidth+1,images:images.length,brokenImages:images.filter(i=>i.currentSrc&&!i.naturalWidth).map(i=>i.currentSrc)};
  });
  results.push({...current,status:response.status(),...result});
 }catch(e){errors.push({...current,message:e.message});}
 done++;if(done%50===0)console.log(`Audited ${done}/${index.length*2} page/viewport combinations`);
 }
 await page.close();
}));
await browser.close();
const report={tested:done,results,errors,external,responses,failed};
await fs.writeFile('migration/audit-browser.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({tested:done,errors,external,responses,failed,overflow:results.filter(x=>x.overflow).map(({route,width})=>({route,width})),brokenImages:results.filter(x=>x.brokenImages.length)},null,2));
if(errors.length||external.length||responses.length||failed.length||results.some(x=>x.overflow||x.brokenImages.length))process.exitCode=1;

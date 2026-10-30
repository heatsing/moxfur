import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import index from '../content/rendered/index.json' with {type:'json'};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const errors=[],external=[],results=[];
const page=await browser.newPage();let route='';
page.on('pageerror',e=>errors.push({route,message:e.stack}));
page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1'))external.push({route,url:r.url()});});
const routes=['','/products/tiered-stationery-display-island','/collections/library-furniture','/collections/all','/blogs/news',...index.filter(x=>x.route.startsWith('/pages/')).map(x=>x.route),index.find(x=>x.route.startsWith('/blogs/news/'))?.route,'/policies/privacy-policy','/search'].filter(x=>x!==undefined);
for(const width of [1440,390]){await page.setViewportSize({width,height:1000});for(route of routes){await page.goto('http://127.0.0.1:3000'+(route||'/'),{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.classList.contains('mox-theme-ready'),{timeout:10000});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)errors.push({route,width,message:'Horizontal overflow'});results.push({route,width});}
route='';await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});
const tabs=page.locator('[role="tab"]');if(await tabs.count()>1){await tabs.nth(1).click();if(await tabs.nth(1).getAttribute('aria-selected')!=='true')errors.push({route,width,message:'FAQ tab failed'});}
if(width===390){const menu=page.locator('header-drawer summary').first();if(await menu.count()){await menu.click();await page.waitForTimeout(300);if(!(await page.locator('header-drawer details').first().getAttribute('open')!==null))errors.push({route,width,message:'Mobile menu failed'});}}
await page.screenshot({path:`migration/restored-home-${width}.png`,fullPage:true});
}
route='/search';await page.goto('http://127.0.0.1:3000/search/',{waitUntil:'networkidle'});await page.locator('#catalog-query').fill('tiered stationery display island');try{await expect(page.locator('#mox-search-root .card')).toHaveCount(1);}catch{errors.push({route,message:'Search result mismatch'});}
await browser.close();await fs.writeFile('migration/restoration-browser-report.json',JSON.stringify({results,errors,external},null,2));console.log(JSON.stringify({tested:results.length,errors,external},null,2));if(errors.length||external.some(x=>/shopify|moxfur\.com/.test(x.url)))process.exitCode=1;

import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>console.log('ERROR',e.stack));
page.on('requestfailed',r=>console.log('FAILED',r.url()));
for(const [name,url] of [['original','https://moxfur.com/'],['restored','http://127.0.0.1:3000/']]){
 await page.goto(url,{waitUntil:'domcontentloaded'});for(let y=0;y<await page.locator('body').evaluate(e=>e.scrollHeight);y+=700){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(180);}await page.waitForTimeout(800);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);await page.screenshot({path:`migration/${name}-home.png`,fullPage:true});
 console.log(name,await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)));
}
await browser.close();

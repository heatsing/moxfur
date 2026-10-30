import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('migration/original',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
for(const [name,path] of [['home','/'],['product','/products/tiered-stationery-display-island'],['collection','/collections/library-furniture'],['contact','/pages/contact-us'],['solution','/pages/public-libraries']]){
 await page.goto('https://moxfur.com'+path,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(1500);
 await fs.writeFile('migration/original/'+name+'.html',await page.content());
 await page.screenshot({path:'migration/original/'+name+'.png',fullPage:true});
 console.log(name,await page.title());
}
await browser.close();

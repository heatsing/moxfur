import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await fs.mkdir('migration/screenshots',{recursive:true});
for(const width of [1440,390]){await page.setViewportSize({width,height:900});for(const [name,route] of [['home','/'],['contact','/pages/contact-us/'],['product','/products/tiered-stationery-display-island/']]){await page.goto('http://127.0.0.1:3000'+route,{waitUntil:'networkidle'});await page.screenshot({path:`migration/screenshots/${name}-${width}.png`,fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)errors.push('Overflow '+route+' '+width);}}
await browser.close();console.log(JSON.stringify({errors},null,2));if(errors.length)process.exitCode=1;


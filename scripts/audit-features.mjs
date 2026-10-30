import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import site from '../content/site.json' with {type:'json'};
import catalog from '../public/catalog.json' with {type:'json'};
const base=process.env.AUDIT_URL||'http://127.0.0.1:3001';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
await context.addInitScript(()=>Object.defineProperty(navigator,'share',{value:undefined,configurable:true}));const page=await context.newPage();const passed=[];page.setDefaultTimeout(12000);const add=passed.push.bind(passed);passed.push=(...items)=>{console.log(items.join(", "));return add(...items);};
async function visit(route){await page.goto(base+route,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.documentElement.classList.contains('mox-theme-ready'));}
try{
 await visit('/collections/all/');
 for(const sort of Object.keys(catalog.orders)){
  await page.locator('#SortBy').selectOption(sort);
  await expect.poll(()=>page.locator('#product-grid > li a[href*="/products/"]').first().getAttribute('href')).toContain('/products/'+catalog.orders[sort][0]);
  await expect(page.locator('#product-grid > li')).toHaveCount(20);passed.push('Desktop sort: '+sort);
 }
 await page.locator('#ProductGridContainer .pagination a[aria-label="Go to page 2"]').first().click();
 await expect.poll(()=>page.locator('#product-grid > li a[href*="/products/"]').first().getAttribute('href')).toContain('/products/'+catalog.orders['created-descending'][20]);
 passed.push('Sorted pagination across the full catalog');
 await visit('/collections/all/?page=2&sort_by=title-descending');
 await expect.poll(()=>page.locator('#product-grid > li a[href*="/products/"]').first().getAttribute('href')).toContain('/products/'+catalog.orders['title-descending'][20]);passed.push('Legacy query pagination retains sort');
 await visit('/collections/all/?filter.v.availability=0');await expect(page.locator('#product-grid')).toHaveText('No products found.');passed.push('Availability filter');
 await page.setViewportSize({width:390,height:844});await visit('/collections/all/');
 await page.locator('menu-drawer.mobile-facets__wrapper > details > summary').click();
 await page.locator('#SortBy-mobile').selectOption('title-descending');
 await expect.poll(()=>page.locator('#product-grid > li a[href*="/products/"]').first().getAttribute('href')).toContain('/products/'+catalog.orders['title-descending'][0]);passed.push('Mobile sort drawer');
 for(const redirect of site.settings.urlRedirects.nodes){await visit(redirect.path);await expect(page).toHaveURL(new RegExp(redirect.target+'/?$'));passed.push('Redirect: '+redirect.path);}
 await page.setViewportSize({width:1440,height:1000});await visit('/blogs/news/what-colors-look-good-on-bookstore-bookshelves/');
 await page.locator('share-button summary').click();await page.locator('.share-button__copy').click();await expect(page.locator('.share-button__message')).toHaveText('Link copied');passed.push('Article copy link');
 for(const route of ['/pages/contact-us/',...site.articles.filter(a=>a.isPublished).map(a=>'/blogs/'+a.blog.handle+'/'+a.handle+'/')]){await visit(route);const form=page.locator('[data-mox-inquiry]');await expect(form).toHaveAttribute('action','mailto:info@moxfur.com');if(await form.evaluate(f=>f.checkValidity()))throw Error('Empty form passed validation: '+route);passed.push('Email form and validation: '+route);}
 await visit('/pages/video/');for(const video of await page.locator('video').all()){await video.scrollIntoViewIfNeeded();await video.evaluate(v=>{v.muted=true;void v.play();});await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThan(0);await video.evaluate(v=>v.pause());}passed.push('All 3 local videos play');
 await visit('/search/?q=tiered%20stationery%20display%20island');await expect(page.locator('#mox-search-root .card')).toHaveCount(1);passed.push('Search URL query');
 await visit('/');const tabs=page.locator('[role="tab"]');await tabs.nth(1).click();await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');passed.push('FAQ tabs');
 await page.setViewportSize({width:390,height:844});await page.locator('header-drawer summary').first().click();await expect(page.locator('header-drawer details').first()).toHaveAttribute('open','');passed.push('Mobile navigation');
 console.log(JSON.stringify({passed},null,2));await fs.writeFile('migration/audit-features.json',JSON.stringify({passed},null,2));
}finally{await browser.close();}

'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import Search from './Search';
export default function ThemeRuntime({scripts,inline,products}){
 const [target,setTarget]=useState(null);
 useEffect(()=>{let stopped=false;
  const url=new URL(window.location.href),page=Number(url.searchParams.get('page'));
  if(Number.isInteger(page)&&page>1&&/^\/(collections|blogs)\//.test(url.pathname)&&!url.pathname.includes('/page/')){window.location.replace(url.pathname.replace(/\/$/,'')+'/page/'+page+'/');return;}
  window.Shopify={designMode:false,routes:{root:'/'},locale:'en'};
  window.routes={root:'/',search_url:'/search/',predictive_search_url:'/search/'};
  window.accessibilityStrings={imageAvailable:'Image [index] is now available in gallery view',shareSuccess:'Link copied',pauseSlideshow:'Pause slideshow',playSlideshow:'Play slideshow'};
  window.variantStrings={addToCart:'Request a quote',soldOut:'Contact us',unavailable:'Contact us'};
  const run=async()=>{if(!document.getElementById('sections-script')){const marker=document.createElement('script');marker.id='sections-script';marker.type='application/json';marker.dataset.sections='header';document.body.append(marker);}for(const {src} of scripts){if(stopped)return;if(document.querySelector(`script[data-theme-src="${src}"]`))continue;await new Promise(resolve=>{const tag=document.createElement('script');tag.src=src;tag.dataset.themeSrc=src;tag.onload=resolve;tag.onerror=resolve;document.body.append(tag);});}
   if(stopped)return;for(const code of inline){const tag=document.createElement('script');tag.textContent=code;document.body.append(tag);}
   document.dispatchEvent(new Event('DOMContentLoaded'));document.documentElement.classList.add('mox-theme-ready');
  };run();
  const submit=e=>{const form=e.target;if(form.matches('[data-mox-inquiry]')){e.preventDefault();if(!form.reportValidity())return;const text=[...new FormData(form)].map(([k,v])=>k.replace(/^contact\[|\]$/g,'')+': '+v).join('\n');window.location.href='mailto:info@moxfur.com?subject='+encodeURIComponent('Moxfur project inquiry')+'&body='+encodeURIComponent(text);}};
  document.addEventListener('submit',submit);setTarget(document.getElementById('mox-search-root'));
  return()=>{stopped=true;document.removeEventListener('submit',submit);};
 },[scripts,inline]);
 return target&&products?createPortal(<Search products={products}/>,target):null;
}

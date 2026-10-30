// Preserve the original catalog markup while sorting and filtering the local export.
export function installCatalog() {
  if (!/^\/collections\/all(?:\/|$)/.test(location.pathname)) return () => {};
  const grid=document.getElementById('product-grid');
  if (!grid) return () => {};
  let dataPromise, disposed=false, version=0;
  const data=()=>dataPromise||(dataPromise=fetch('/catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}));
  const href=(page,params)=>'/collections/all/'+(page>1?'page/'+page+'/':'')+(params.size?'?'+params:'');
  const render=async()=>{
    const request=++version,url=new URL(location.href),params=url.searchParams;
    const catalog=await data();if(disposed||request!==version)return;
    const sort=params.get('sort_by')||'title-ascending',availability=params.getAll('filter.v.availability');
    let products=catalog.products.filter(p=>!availability.length||availability.includes(p.available?'1':'0'));
    if(catalog.orders[sort]){const rank=new Map(catalog.orders[sort].map((h,i)=>[h,i]));products.sort((a,b)=>rank.get(a.handle)-rank.get(b.handle));}
    else {const descending=sort.endsWith('descending');products.sort((a,b)=>{let comparison=sort.startsWith('price-')?a.price-b.price:sort.startsWith('created-')?Date.parse(a.createdAt)-Date.parse(b.createdAt):a.title.localeCompare(b.title,'en',{numeric:true});return comparison*(descending?-1:1);});}
    const pages=Math.ceil(products.length/catalog.pageSize),page=Math.max(1,Math.min(pages||1,Number(url.pathname.match(/\/page\/(\d+)/)?.[1]||1)));
    grid.innerHTML=products.slice((page-1)*catalog.pageSize,page*catalog.pageSize).map(p=>p.html).join('')||'<li class="grid__item">No products found.</li>';
    document.querySelectorAll('[name="sort_by"]').forEach(el=>el.value=sort);
    document.querySelectorAll('[name="filter.v.availability"]').forEach(el=>{el.checked=availability.includes(el.value);});
    document.querySelectorAll('.facets__selected').forEach(el=>el.textContent=availability.length+' selected');
    document.querySelectorAll('#ProductCount,#ProductCountDesktop').forEach(el=>el.textContent=products.length+' products');
    let wrapper=document.querySelector('#ProductGridContainer .pagination-wrapper');
    if(!wrapper){wrapper=document.createElement('div');wrapper.className='pagination-wrapper';grid.after(wrapper);}
    wrapper.hidden=pages<2;
    const link=(n,label,current=false)=>`<li><a href="${href(n,params).replaceAll('&','&amp;')}" class="pagination__item link${current?' pagination__item--current':''}"${current?' aria-current="page"':''} aria-label="${current?'Current page':'Go to page'} ${n}">${label}</a></li>`;
    let links=page>1?link(page-1,'‹'):'';let previous=0;
    for(const n of [...new Set([1,page-1,page,page+1,pages])].filter(n=>n>0&&n<=pages).sort((a,b)=>a-b)){if(previous&&n>previous+1)links+='<li><span class="pagination__item">…</span></li>';links+=link(n,n,n===page);previous=n;}
    if(page<pages)links+=link(page+1,'›');
    wrapper.innerHTML='<nav class="pagination" aria-label="Pagination"><ul class="pagination__list list-unstyled" role="list">'+links+'</ul></nav>';
    grid.setAttribute('data-local-catalog','ready');
  };
  const navigate=url=>{history.pushState({},'',url);void render();};
  const change=e=>{if(!e.target.matches('[name="sort_by"],[name="filter.v.availability"]'))return;const params=new URLSearchParams(location.search);if(e.target.name==='sort_by')params.set('sort_by',e.target.value);else{const values=new Set(params.getAll(e.target.name));if(e.target.checked)values.add(e.target.value);else values.delete(e.target.value);params.delete(e.target.name);values.forEach(v=>params.append(e.target.name,v));}navigate(href(1,params));};
  const click=e=>{const reset=e.target.closest('facet-remove a');if(reset){e.preventDefault();const params=new URLSearchParams(location.search);params.delete('filter.v.availability');navigate(href(1,params));return;}const link=e.target.closest('#ProductGridContainer .pagination a');if(link&&new URLSearchParams(location.search).size&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){e.preventDefault();navigate(link.href);document.getElementById('ProductGridContainer').scrollIntoView({behavior:'smooth'});}};
  const submit=e=>{if(e.target.matches('#FacetFiltersForm,#FacetFiltersFormMobile'))e.preventDefault();};
  document.addEventListener('change',change);document.addEventListener('click',click);document.addEventListener('submit',submit);window.addEventListener('popstate',render);
  if(new URLSearchParams(location.search).has('sort_by')||new URLSearchParams(location.search).has('filter.v.availability'))void render();
  return()=>{disposed=true;document.removeEventListener('change',change);document.removeEventListener('click',click);document.removeEventListener('submit',submit);window.removeEventListener('popstate',render);};
}

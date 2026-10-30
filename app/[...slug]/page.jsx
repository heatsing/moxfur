import RestoredPage,{index,readPage} from '../../components/RestoredPage';
import {notFound} from 'next/navigation';
export const dynamicParams=false;
export function generateStaticParams(){return index.filter(p=>p.route).map(p=>({slug:p.route.slice(1).split('/')}))}
export async function generateMetadata({params}){const {slug}=await params;const p=readPage('/'+slug.join('/'));return p?{title:p.title,description:p.description,alternates:{canonical:p.route+'/'}}:{}}
export default async function Page({params}){const {slug}=await params;const p=readPage('/'+slug.join('/'));if(!p)notFound();return <RestoredPage record={p}/>}

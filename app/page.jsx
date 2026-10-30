import RestoredPage,{readPage} from '../components/RestoredPage';
import {pageMetadata} from '../lib/page-metadata';
export function generateMetadata(){return pageMetadata(readPage(''))}
export default function Home(){return <RestoredPage record={readPage('')}/>}

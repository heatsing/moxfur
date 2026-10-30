import RestoredPage,{readPage} from '../components/RestoredPage';
export function generateMetadata(){const p=readPage('');return {title:p.title,description:p.description,alternates:{canonical:'/'}}}
export default function Home(){return <RestoredPage record={readPage('')}/>}

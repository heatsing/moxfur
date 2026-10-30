import {load} from 'cheerio';
import RestoredPage,{readPage} from '../components/RestoredPage';
export default function NotFound(){const record=readPage('');const $=load(record.html,null,false);$('#MainContent').html('<section class="page-width" style="padding:80px 24px;text-align:center"><h1>Page not found</h1><a class="button" href="/">Back to Moxfur</a></section>');return <RestoredPage record={{...record,html:$.html(),inline:[]}}/>}

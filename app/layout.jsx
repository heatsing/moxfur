import './restored.css';
export const metadata={metadataBase:new URL(process.env.SITE_URL||'https://moxfur.com')};
export default function Layout({children}){return <html lang="en" className="js" suppressHydrationWarning><body className="gradient" suppressHydrationWarning>{children}</body></html>}

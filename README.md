# Moxfur — Next.js B2B catalog

Standalone Next.js site with repository-managed content and local media. No Shopify API, checkout, database or secret is needed at runtime.

## Run

Node.js 22 or newer. Run `npm ci`, then `npm run dev`. `npm run build` exports static files to `out/` for a static host. The GitHub repository stores source; pushing source alone does not publish a website.

## Edit content

Edit `content/site.json`. Products, collection membership, pages, articles, policies, navigation and section content are stored there. Images live in `public/media/`. Original handles define URLs; preserve them when editing. Rebuild after changes. HTML content is sanitized at render time. Contact links use info@moxfur.com and the existing WhatsApp number; no form submission backend is included.

## Migration status

Exported 195 products, 10 collections, 17 pages, 4 articles, policies and navigation. Theme-based pages have been converted to a common Next.js section renderer. Layout and custom Liquid behavior require comparison against the original before a production domain switch. Raw Shopify exports and theme backups are retained locally under ignored `migration/`; do not publish them.

Policies are copied as source content, including existing Shopify references and placeholders. These must be reviewed against the actual independent site's operation before launch.

No DNS changes or Shopify cancellation have been performed. Keep the original site available until route, content, asset and visual verification is complete.

## Verification

Production build passes. Static audit checks 241 HTML files with no missing internal links or image paths. Chromium checks at 1440px and 390px pass for home, product and contact pages without runtime errors or horizontal overflow. Four legacy URLs have static redirect pages and a host-compatible _redirects manifest; HTTP 301 support depends on the deployment host.

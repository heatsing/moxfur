# Moxfur — standalone Next.js restoration

The original Moxfur storefront is preserved in Next.js static routes, including the original layout, local theme CSS, fonts, imagery, responsive navigation, galleries, sliders and FAQ tabs. There is no runtime Shopify API or Shopify-hosted media dependency.

## Run

Use Node.js 22+. Run `npm ci`, `npm run build`, `npm start`. The local static preview is http://127.0.0.1:3000. `npm run dev` starts the development server. Deploy `out/` to a static host. GitHub stores the source and builds a downloadable artifact; the production domain has not been switched.

## Content editing without Shopify

- `content/rendered/index.json` maps original URLs to page files.
- `content/rendered/<id>.json` contains each page's original HTML, SEO metadata, local stylesheet references and standalone interactions. Edit the `html`, `title` or `description` fields and rebuild. No Shopify account is needed.
- `content/site.json` retains the structured product catalog, collection memberships, page and blog content, navigation, policies and theme configuration. The local search uses this catalog; changing this file alone does not rewrite the restored HTML snapshots.
- `public/media/` and `public/theme/` contain all media, fonts, CSS and theme scripts. `app/restored.css` holds only independent-site adjustments.
- The migration scripts capture Shopify only during the one-time migration; they are not part of the normal build or runtime. Original raw exports remain in the ignored local `migration/` directory.

## Restored scope

195 published products, 10 collections, 17 content pages, 3 published blog articles, the blog index, 4 policies, catalog/search pages and original pagination routes. One unpublished blog draft is retained in the structured archive and is not published. The restored index contains 254 routes. Four historical redirects are provided as static redirect pages and a host-compatible `_redirects` manifest. HTTP 301 behavior depends on the host.

The original per-page markup is rendered by Next.js instead of approximating every page with a common layout. Recommendations are generated from local collection membership. The WhatsApp button opens the existing business contact directly. Shopify account, currency and checkout services are removed for this B2B catalog.

## Inquiry form

The contact page keeps its original form layout. Submitting prepares an email in the visitor's email application to info@moxfur.com; it does not silently send mail or save submissions. The form explains this behavior. A mail delivery backend is needed if submissions must be sent directly from the website.

## Verification and launch

`npm run check` audits exported links and assets. `scripts/verify-restoration.mjs` checks desktop/mobile rendering and interactions with Playwright; set `CHROMIUM_PATH` if using an existing browser executable. Raw comparison screenshots and reports are local under `migration/`.

Keep the original site active until hosting and domain cutover are complete. Policies are retained verbatim and still contain existing Shopify references/placeholders; update them to match the actual independent business operation before launch.

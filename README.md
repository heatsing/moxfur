# Moxfur — standalone Next.js restoration

The original Moxfur storefront is preserved in Next.js static routes, including the original layout, local theme CSS, fonts, imagery, responsive navigation, galleries, sliders and FAQ tabs. There is no runtime Shopify API or Shopify-hosted media dependency.

## Run

Use Node.js 22+. Run `npm ci`, `npm run build`, `npm start`. The local static preview is http://127.0.0.1:3000. `npm run dev` starts the development server. Deploy `out/` to a static host. GitHub stores the source and builds a downloadable artifact; the production domain has not been switched.

## Content editing without Shopify

- `content/rendered/index.json` maps original URLs to page files.
- `content/rendered/<id>.json` contains each page's original HTML, SEO metadata, local stylesheet references and standalone interactions. Edit the `html`, `title` or `description` fields and rebuild. No Shopify account is needed.
- `content/site.json` retains the structured product catalog, collection memberships, page and blog content, navigation, policies and theme configuration. The local search uses this catalog; changing this file alone does not rewrite the restored HTML snapshots.
- `public/media/`, `public/theme/` and `public/imported/` contain the localized media, fonts, CSS and theme scripts. One original Google-hosted blog image returns HTTP 403 and remains unresolved; see `MIGRATION-AUDIT.md`. `app/restored.css` holds only independent-site adjustments.
- `content/metadata.json` preserves original social sharing metadata and the favicon. `public/catalog.json` contains the original product cards and all nine original catalog sorting orders for local filtering, sorting and pagination. Update these alongside the rendered pages when changing content.
- The migration scripts capture Shopify only during the one-time migration; they are not part of the normal build or runtime. Original raw exports remain in the ignored local `migration/` directory.

## Restored scope

195 published products, 10 collections, 17 content pages, 3 published blog articles, the blog index, 4 policies, catalog/search pages and original pagination routes. One unpublished blog draft is retained in the structured archive and is not published. The restored index contains 254 routes. Four historical redirects are provided as static redirect pages and a host-compatible `_redirects` manifest. HTTP 301 behavior depends on the host.

The original per-page markup is rendered by Next.js instead of approximating every page with a common layout. Recommendations are generated from local collection membership. The WhatsApp button opens the existing business contact directly. Shopify account, currency and checkout services are removed for this B2B catalog.

## Inquiry form

The contact page keeps its original form layout. Submitting prepares an email in the visitor's email application to info@moxfur.com; it does not send mail or save submissions itself. Blog comment forms also prepare emails and explicitly state that they do not publish public comments. A mail delivery and storage backend is needed for direct website submissions. Required fields and email format are validated locally.

## Verification and launch

`npm run check` audits exported links and assets. `scripts/audit-browser.mjs` checks all 254 routes at desktop and mobile widths; `scripts/audit-features.mjs` checks sorting, filtering, pagination, redirects, sharing, email forms, video, search and navigation. These scripts default to the production preview at port 3001; override `AUDIT_URL` if needed, and set `CHROMIUM_PATH` if using an existing browser executable. The browser audit intentionally fails while the unresolved source image is broken. `scripts/audit-migration.mjs` compares the local Shopify export and raw HTML cache against restored content, collection membership, metadata and resources; it requires the ignored `migration/` audit inputs. Raw comparison screenshots and reports are local under `migration/`.

Keep the original site active until hosting and domain cutover are complete. Policies are retained verbatim and still contain existing Shopify references/placeholders; update them to match the actual independent business operation before launch.

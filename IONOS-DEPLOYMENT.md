# IONOS preview deployment

Domain supplied by the business: `www.expertsubzerorefrigeratorrepairservice.com`.

This site is built for static file hosting. It can be uploaded to an IONOS Web Hosting plan with webspace/SFTP access. IONOS Website Builder and some managed products have different capabilities; confirm the product before attempting an upload. No IONOS account access has been provided and no remote upload, DNS change, or publication has been performed.

## Prepare the preview

From this checkout, run `npm run package:ionos`. This creates:

- `release/mbg-ionos-preview.zip`: upload package.
- `release/mbg-ionos-preview/`: unpacked upload-ready files.

The preview contains search-engine exclusion metadata, `robots.txt`, and an Apache header rule. It is still publicly accessible to anyone with its address; search exclusion is not password protection. These changes are applied only to the generated preview copy, not the production build.

## Upload using an IONOS Web Hosting plan

1. In the IONOS hosting account, identify the existing domain target directory and preserve any current website before changing that target or its files. Do not replace the current site's root directory for a preview.
2. Create a separate, empty webspace directory such as `mbg-preview`. Extract the ZIP locally, then upload **all its contents** to that directory through Webspace Explorer or SFTP, including the hidden `.htaccess` file. `index.html`, `assets/`, and `images/` must be directly inside the target directory. Uploading the ZIP by itself does not install the website.
3. Create a subdomain such as `preview.expertsubzerorefrigeratorrepairservice.com` and connect its webspace destination to the new directory. Use the IONOS-supported domain connection controls for the hosting plan; exact menu labels vary. Keep the main domain pointing to the existing website.
4. Enable an SSL certificate for the preview subdomain through IONOS and wait for its domain/certificate setup to complete.
5. Open the preview subdomain over HTTPS. The site uses root-relative assets, so the preview must be served at the **root of its own hostname**, not a URL like `www.example.com/mbg-preview/`.

## Review the hosted result

- Open the home page, a brand page, a service-area page, and a guide directly by URL. Refresh each nested page; it should still load.
- Check the logo, fonts, kitchen illustration, and mobile navigation.
- Confirm guide filtering and the model-number locator work.
- Confirm call links use the correct business number.
- Fill in the booking form with test details and review the prepared message. Do not send a test message without the business's agreement. No service request is transmitted until the visitor sends it through their messaging app.
- Confirm the business number accepts texts, or replace this flow with the chosen booking integration before launch.
- Check an unknown path returns the custom 404 page with an HTTP 404 status.

## Launch later

After approval, build a fresh production version with `npm run build` and deploy the contents of `dist/`, not the search-excluded preview package. Configure the production domain and TLS in IONOS, and verify the final URL and redirects. Add domain-specific canonical URLs, sitemap, and verified business structured data before launch. Do not replace an existing site's files or change its live domain target without an agreed cutover and backup.

# MBG Appliance Services

## Download the complete website for IONOS

[Download the upload-ready website ZIP](https://github.com/Shuyi0715/MBG/raw/refs/heads/main/mbg-website-upload.zip)

The ZIP contains all 33 pages plus a 404 page, styles, scripts, images, fonts, and upload instructions. Extract it and upload its contents to the IONOS folder assigned to your website or preview subdomain. This is the built website: no Node.js installation is needed on IONOS. The development source files elsewhere in this repository are not the upload package.

A responsive, static website for MBG Appliance Services, focused on built-in refrigerator repair in South Florida. Built with Vite, vanilla JavaScript, and locally hosted Manrope fonts. The production build prerenders every page so content is present before JavaScript runs.

## Development

Requires Node.js 22.12+ or 24+. From this checkout:

```sh
npm ci
npm run dev -- --port 5173
```

## Build and validate

```sh
npm run build
npm test
npm run preview -- --port 4173
```

Tests use Playwright with `/usr/bin/chromium` in the cloud environment. Set `CHROMIUM_PATH` to another Chromium executable if needed, or install a Playwright Chromium browser with `npx playwright install chromium`.

Deploy the `dist` folder to a static host supporting directory index pages. `dist/404.html` provides a not-found page. No application server, API credentials, or external fonts/images are needed.

For an IONOS Web Hosting preview, run `npm run package:ionos` and follow [IONOS-DEPLOYMENT.md](IONOS-DEPLOYMENT.md). The generated preview package excludes search indexing and should be assigned its own subdomain.

## Content and assets

- `src/data.js`: phone number, brands, service areas, appliance services, FAQs, and guides.
- `src/render.js`: page content, navigation, and booking form.
- `src/style.css`: responsive layouts and brand styling.
- `public/images/logo.svg`: vector recreation of the supplied MBG logo.
- `public/images/kitchen.svg`: original kitchen illustration; replace with licensed business photography when available.

The service-request form validates details and prepares an SMS to **888-841-1175**, from the supplied wire diagram. It does not send data to a server or promise an appointment. Customers explicitly open their messaging app to send the request; calling and copying the request are alternatives. Confirm the number can receive texts before publishing. If it cannot, connect a booking provider or form backend before enabling online requests. No browser storage or analytics are used.

## Before launch

Confirm the phone/text number, exact service coverage, approved business copy, and preferred booking workflow. Add original repair photos and verified business credentials before making claims about completed work, certification, reviews, warranties, manufacturer authorization, or service times. None of those claims have been invented. The service-area map and kitchen are illustrations. Maintenance is inquiry-only; no unconfirmed plans or pricing are offered.

Set the public domain and add a sitemap, canonical URLs, and accurate business structured data when the deployment address and business details are confirmed. The site is not published by running the build.

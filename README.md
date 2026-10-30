# Chalema Tanzania Safaris — landing page

Static HTML/CSS/vanilla JS version of `Main.dc.html` (original export kept untouched in `uploads/`).

## Structure

```
index.html                 all page content (EN + FR)
assets/css/style.css       design tokens (CSS variables) + components
assets/css/responsive.css  breakpoints: 1080px (nav), 900px, 600px, 360px
assets/js/language.js      EN/FR switch, sets <html lang>, remembers choice
assets/js/main.js          mobile menu, package preselect, FAQ, form validation
assets/images/             logo.png, hero-landscape.svg
assets/fonts/              self-hosted Inter + Fraunces (woff2, latin + latin-ext)
```

## Editing copy

Every text appears twice in `index.html`:

```html
<span data-lang="en">English text</span><span data-lang="fr">Texte français</span>
```

Edit both. `<option>`, `<title>` and meta tags use `data-en` / `data-fr` attributes instead.
Language can be forced with `?lang=fr` in the URL.

## Forms

No backend is connected yet.

- **Quote form (`#quote-form`)**: stays visible after submit; a status message appears under the button.
  Set `data-endpoint="https://…"` on the form to connect a service. `main.js` POSTs `FormData` with
  `Accept: application/json` and shows the success message only for a 2xx response, the error message
  otherwise. While `data-endpoint` is empty, visitors see a notice that online requests aren't active yet,
  with the email and phone. The button is disabled ("Sending…") while a request is in flight.
- **Hero form (`#hero-form`)**: same behaviour and its own `data-endpoint`. Its success text is
  "Thank you! Your enquiry has been submitted successfully." The two forms' messages are independent. Field names: full_name, email, phone, safari_type, adults, children,
travel_date, duration, budget, date_flexibility, interests, message, consent, form_source, language.

## Photos

Photos are temporary Unsplash dummies (see `assets/images/CREDITS.md`). Replace a file with the same
name, or change its `src` in index.html. Images use object-fit: cover, so any aspect ratio fits.

## Viewing

Open `index.html` directly or serve the folder with any static server.

## Reviews (editorial note — not shown on the site)

Review wording is original (FR is a translation). Add reviewer names, photos and links to the source
platform only once the reviewers' permission and the source are confirmed. The star rows are carried over
from the original design; confirm they match the source ratings before launch.

## Package prices (placeholders)

The "From … / person" prices on the five Featured Itinerary cards are **dummy values for design only** and have not
been confirmed by the client. Each one is marked with a `PLACEHOLDER PRICE` comment in index.html; update the EN
(`€1,150`) and FR (`1 150 €`) amounts together.

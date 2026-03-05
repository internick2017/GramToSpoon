# GramToSpoon – Ingredient Conversion Site

Simple, SEO-friendly site to convert cooking measurements (grams ↔ cups, tablespoons, teaspoons) for common ingredients. Uses a **small generator script** (Node.js, no npm) so you can add hundreds of pages by editing data files.

## Structure

- **index.html** – Homepage with calculator and auto-generated list of conversion links
- **css/style.css** – Shared styles (mobile-friendly, fast)
- **js/ingredients-data.js** – *Generated* from `data/ingredients.json` (do not edit by hand if you use the generator)
- **js/app.js** – Calculator logic
- **data/ingredients.json** – Single source of truth for ingredients (grams per cup/tbsp/tsp, name, slug, explanation note)
- **data/conversion-pages.json** – List of conversions to generate (grams + ingredient + unit)
- **generate.js** – Static site generator: reads data, writes `conversions/*.html` and updates the homepage list
- **conversions/** – Generated HTML pages (one per conversion)

## Adding More Conversion Pages (no copy-paste)

1. **Edit `data/conversion-pages.json`** – Add one object per page:
   ```json
   { "grams": 150, "ingredient": "sugar", "unit": "tablespoons" }
   ```
   `unit` can be: `"cups"`, `"tablespoons"`, `"teaspoons"`. `ingredient` must exist in `data/ingredients.json`.

2. **Run the generator:**
   ```bash
   node generate.js
   ```
   This creates/overwrites the HTML in `conversions/`, updates the "Popular Conversions" list on the homepage, and regenerates `js/ingredients-data.js` from `data/ingredients.json`.

To add a **new ingredient**, edit `data/ingredients.json` (add name, slug, gramsPerCup, gramsPerTbsp, gramsPerTsp, and optional explanationNote), then run `node generate.js`. The calculator will pick it up via the generated `js/ingredients-data.js`.

## Running Locally

Open `index.html` in a browser, or serve the folder with any static server (e.g. `npx serve .`).

## SEO

- Each conversion page has its own URL, title, meta description, and canonical
- H1 and H2 headings and short explanation text on every page
- JSON-LD: `WebApplication` on the homepage; `HowTo` + `Question` on conversion pages

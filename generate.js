/**
 * Static site generator for conversion pages.
 * Run: node generate.js
 * Reads data/ingredients.json and data/conversion-pages.json, writes conversions/*.html,
 * generates conversions/index.html (all-conversions page), and updates the homepage.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const DATA_DIR = path.join(ROOT, 'data');
const CONVERSIONS_DIR = path.join(ROOT, 'conversions');

const ingredients = require(path.join(DATA_DIR, 'ingredients.json'));
const featuredPages = require(path.join(DATA_DIR, 'conversion-pages.json'));

const UNIT_LABELS = { cups: 'cups', tablespoons: 'tablespoons', teaspoons: 'teaspoons' };
const UNIT_GRAM_KEYS = { cups: 'gramsPerCup', tablespoons: 'gramsPerTbsp', teaspoons: 'gramsPerTsp' };

// Tier configuration: which gram amounts and units to generate per tier
const TIER_CONFIG = {
  1: {
    amounts: [50, 75, 100, 150, 200, 250, 300, 500],
    units: ['cups', 'tablespoons']
  },
  2: {
    amounts: [50, 100, 150, 200, 250, 500],
    units: ['cups', 'tablespoons']
  },
  3: {
    amounts: [50, 100, 200],
    units: ['cups', 'tablespoons']
  },
  4: {
    amounts: [5, 10, 25, 50],
    units: ['teaspoons', 'tablespoons']
  }
};

// Category display labels for the all-conversions index page
const CATEGORY_LABELS = {
  flours: 'Flours',
  sugars: 'Sugars & Sweeteners',
  dairy: 'Dairy',
  oils: 'Oils & Fats',
  grains: 'Grains & Starches',
  nuts: 'Nuts & Seeds',
  chocolate: 'Cocoa & Chocolate',
  spices: 'Baking & Spices',
  liquids: 'Liquids'
};

// Category display order
const CATEGORY_ORDER = ['flours', 'sugars', 'dairy', 'oils', 'grains', 'nuts', 'chocolate', 'spices', 'liquids'];

function formatAmount(value) {
  if (value == null || isNaN(value)) return '—';
  const n = Math.round(value * 100) / 100;
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function slug(grams, ingredientKey, unit) {
  const ing = ingredients[ingredientKey];
  if (!ing) return null;
  return `${grams}-grams-${ing.slug}-to-${unit.replace(' ', '-')}`;
}

function computeResult(grams, ingredientKey, unit) {
  const ing = ingredients[ingredientKey];
  const key = UNIT_GRAM_KEYS[unit];
  if (!ing || !key || !ing[key]) return null;
  return grams / ing[key];
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderConversionPage(opts) {
  const {
    title,
    description,
    keywords,
    canonicalPath,
    resultText,
    resultLabel,
    explanationHeading,
    explanationParagraph1,
    explanationParagraph2,
    otherConversionsHeading,
    breadcrumbText,
  } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalPath)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Convert ${escapeHtml(title)}",
    "description": "${escapeHtml(description)}",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Convert grams to ${escapeHtml(opts.unitLabel)}",
        "text": "${escapeHtml(resultText)}. Use a kitchen scale or measure with ${escapeHtml(opts.unitLabel)}."
      }
    ]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Question",
    "name": "How many ${escapeHtml(opts.unitLabel)} is ${escapeHtml(opts.grams + ' grams of ' + opts.ingredientName.toLowerCase())}?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "${escapeHtml(resultText)}. ${escapeHtml(explanationParagraph1)}"
    }
  }
  </script>
</head>
<body>
  <div class="container">
    <header>
      <a href="../index.html">GramToSpoon</a>
    </header>

    <main>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> &rarr; <a href="index.html">All Conversions</a> &rarr; <span>${escapeHtml(breadcrumbText)}</span>
      </nav>

      <h1>${escapeHtml(title)}</h1>
      <p>Convert ${escapeHtml(opts.grams + ' grams of ' + opts.ingredientName.toLowerCase())} to ${escapeHtml(opts.unitLabel)} for your recipe. Use the result below or try the calculator on the homepage for other amounts.</p>

      <div class="result-box">
        <div class="conversion-result">${escapeHtml(resultText)}</div>
        <p class="result-label">${escapeHtml(resultLabel)}</p>
      </div>

      <section class="explanation" aria-labelledby="explanation-heading">
        <h2 id="explanation-heading">${escapeHtml(explanationHeading)}</h2>
        <p>${explanationParagraph1}</p>
        <p>${explanationParagraph2}</p>
      </section>

      <h2>${escapeHtml(otherConversionsHeading)}</h2>
      <p>Need a different amount? Use our <a href="../index.html">conversion calculator</a> to convert any grams of ${escapeHtml(opts.ingredientName.toLowerCase())} to cups, tablespoons, or teaspoons.</p>
      <ul class="conversion-list">
        <li><a href="../index.html">Grams to tablespoons calculator</a></li>
        <li><a href="../index.html">Grams to cups calculator</a></li>
        <li><a href="index.html">All conversions</a></li>
      </ul>

    </main>

    <footer>
      <p><a href="../index.html">GramToSpoon</a> — Simple gram to cups, tablespoons &amp; teaspoons conversions for cooking.</p>
    </footer>
  </div>
  <script>(function(s){s.dataset.zone='10687186',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
  <script>(function(s){s.dataset.zone='10687272',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
</html>
`;
}

function buildPage(grams, ingredientKey, unit) {
  const ing = ingredients[ingredientKey];
  if (!ing) return null;
  const result = computeResult(grams, ingredientKey, unit);
  if (result == null) return null;
  const unitLabel = UNIT_LABELS[unit] || unit;
  const formatted = formatAmount(result);
  const ingredientName = ing.name;
  const title = `${grams} grams of ${ingredientName.toLowerCase()} to ${unitLabel}`;
  const resultText = `${grams} grams of ${ingredientName.toLowerCase()} = ${formatted} ${unitLabel}`;
  const gramPerUnit = ing[UNIT_GRAM_KEYS[unit]];
  const explanationParagraph1 = `${ingredientName} has a density of about ${gramPerUnit} grams per ${unitLabel === 'cups' ? 'cup' : unitLabel.slice(0, -1)}. So to convert ${grams} grams we divide: ${grams} ÷ ${gramPerUnit} = ${formatted}. So <strong>${grams} grams of ${ingredientName.toLowerCase()} equals ${formatted} ${unitLabel}</strong>.`;
  const explanationParagraph2 = ing.explanationNote || 'For best accuracy when baking, we recommend weighing with a kitchen scale. Slight variations can occur depending on packing.';

  return renderConversionPage({
    title,
    description: `${resultText}. See the exact conversion and how to measure ${grams}g ${ingredientName.toLowerCase()} in ${unitLabel} for baking and cooking.`,
    keywords: `${grams} grams ${ingredientName.toLowerCase()} to ${unitLabel}, ${grams}g ${ingredientName.toLowerCase()} in ${unit === 'tablespoons' ? 'tbsp' : unit === 'teaspoons' ? 'tsp' : 'cups'}, ${ingredientName.toLowerCase()} conversion`,
    canonicalPath: `conversions/${slug(grams, ingredientKey, unit)}.html`,
    resultText,
    resultLabel: `So ${grams}g of ${ingredientName.toLowerCase()} is about ${formatted} ${unitLabel}.`,
    explanationHeading: `How we convert ${grams} grams of ${ingredientName.toLowerCase()} to ${unitLabel}`,
    explanationParagraph1,
    explanationParagraph2,
    otherConversionsHeading: `Other ${ingredientName.toLowerCase()} conversions`,
    breadcrumbText: `${grams}g ${ingredientName.toLowerCase()} to ${unitLabel}`,
    grams,
    ingredientName,
    unitLabel,
  });
}

// Build the full list of pages to generate from ingredient tiers
function buildAllPages() {
  const pages = [];
  const seen = new Set();

  for (const [key, ing] of Object.entries(ingredients)) {
    const tier = ing.tier || 3;
    const config = TIER_CONFIG[tier];
    if (!config) continue;

    for (const amount of config.amounts) {
      for (const unit of config.units) {
        const id = `${amount}-${key}-${unit}`;
        if (!seen.has(id)) {
          seen.add(id);
          pages.push({ grams: amount, ingredient: key, unit });
        }
      }
    }
  }

  return pages;
}

// Generate the all-conversions index page (conversions/index.html)
function renderAllConversionsPage(allSlugs) {
  // Group pages by category, then by ingredient
  const grouped = {};
  for (const entry of allSlugs) {
    const ing = ingredients[entry.ingredientKey];
    if (!ing) continue;
    const cat = ing.category || 'other';
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][entry.ingredientKey]) grouped[cat][entry.ingredientKey] = [];
    grouped[cat][entry.ingredientKey].push(entry);
  }

  let sectionsHtml = '';
  for (const cat of CATEGORY_ORDER) {
    const ingredientMap = grouped[cat];
    if (!ingredientMap) continue;
    const label = CATEGORY_LABELS[cat] || cat;
    sectionsHtml += `\n      <h2>${escapeHtml(label)}</h2>`;

    for (const [ingKey, entries] of Object.entries(ingredientMap)) {
      const ing = ingredients[ingKey];
      sectionsHtml += `\n      <h3>${escapeHtml(ing.name)}</h3>\n      <ul class="conversion-list">`;
      for (const e of entries) {
        sectionsHtml += `\n        <li><a href="${e.slug}.html">${escapeHtml(e.title)}</a></li>`;
      }
      sectionsHtml += `\n      </ul>`;
    }
  }

  const totalCount = allSlugs.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Browse all ${totalCount}+ gram to cups, tablespoons, and teaspoons conversions for 47 cooking ingredients. Find the exact conversion you need.">
  <meta name="keywords" content="grams to cups, grams to tablespoons, grams to teaspoons, cooking conversions, ingredient measurements, baking conversions">
  <title>All Cooking Conversions – Grams to Cups, Tablespoons &amp; Teaspoons | GramToSpoon</title>
  <link rel="canonical" href="conversions/index.html">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div class="container">
    <header>
      <a href="../index.html">GramToSpoon</a>
    </header>

    <main>
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> &rarr; <span>All Conversions</span>
      </nav>

      <h1>All Cooking Conversions</h1>
      <p>Browse all ${totalCount} gram-to-spoon conversions for 47 ingredients, organized by category. Or use the <a href="../index.html">calculator</a> for any custom amount.</p>

      ${sectionsHtml}
    </main>

    <footer>
      <p><a href="../index.html">GramToSpoon</a> — Simple gram to cups, tablespoons &amp; teaspoons conversions for cooking.</p>
    </footer>
  </div>
  <script>(function(s){s.dataset.zone='10687186',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
  <script>(function(s){s.dataset.zone='10687272',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
</html>
`;
}

// --- Main generation ---

// Build full page list from tier config
const allPages = buildAllPages();

// Generate all conversion pages
const generatedSlugs = [];
fs.mkdirSync(CONVERSIONS_DIR, { recursive: true });

allPages.forEach(({ grams, ingredient, unit }) => {
  const fileSlug = slug(grams, ingredient, unit);
  if (!fileSlug) return;
  const html = buildPage(grams, ingredient, unit);
  if (!html) return;
  const outPath = path.join(CONVERSIONS_DIR, `${fileSlug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  generatedSlugs.push({
    slug: fileSlug,
    title: `${grams} grams of ${ingredients[ingredient].name.toLowerCase()} to ${UNIT_LABELS[unit]}`,
    ingredientKey: ingredient,
    grams,
    unit,
  });
});

console.log(`Generated ${generatedSlugs.length} conversion pages.`);

// Generate all-conversions index page
const indexPageHtml = renderAllConversionsPage(generatedSlugs);
fs.writeFileSync(path.join(CONVERSIONS_DIR, 'index.html'), indexPageHtml, 'utf8');
console.log('Written conversions/index.html (all-conversions page).');

// Build featured links set for dedup
const featuredSet = new Set(
  featuredPages.map(p => slug(p.grams, p.ingredient, p.unit)).filter(Boolean)
);

// Update homepage with featured conversion links only
const featuredSlugs = generatedSlugs.filter(s => featuredSet.has(s.slug));

const indexPath = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
const listItems = featuredSlugs
  .map(({ slug: s, title: t }) => `<li><a href="conversions/${escapeHtml(s)}.html">${escapeHtml(t)}</a></li>`)
  .join('\n        ');
const placeholder = /(\s*<!-- CONVERSION_LINKS_START -->)[\s\S]*?(<!-- CONVERSION_LINKS_END -->)/;
if (placeholder.test(indexHtml)) {
  indexHtml = indexHtml.replace(placeholder, `$1\n        ${listItems}\n      $2`);
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log(`Updated index.html with ${featuredSlugs.length} featured conversion links.`);
} else {
  console.log('Placeholder not found in index.html. Add <!-- CONVERSION_LINKS_START --> ... <!-- CONVERSION_LINKS_END --> around the list.');
}

// Write js/ingredients-data.js from data/ingredients.json (single source of truth)
const ingredientsForJs = Object.fromEntries(
  Object.entries(ingredients).map(([k, v]) => [
    k,
    {
      name: v.name,
      slug: v.slug,
      gramsPerCup: v.gramsPerCup,
      gramsPerTbsp: v.gramsPerTbsp,
      gramsPerTsp: v.gramsPerTsp,
    },
  ])
);
const ingredientsJsonStr = JSON.stringify(ingredientsForJs, null, 2);
const jsOut = `/**
 * Ingredient conversion data (grams per unit).
 * Generated from data/ingredients.json - run "node generate.js" after editing that file.
 */
const INGREDIENTS_DATA = ${ingredientsJsonStr};

function gramsToUnit(grams, unit, ingredientKey) {
  const data = INGREDIENTS_DATA[ingredientKey];
  if (!data || !grams || grams <= 0) return null;
  switch (unit) {
    case 'cups': return grams / data.gramsPerCup;
    case 'tablespoons': return grams / data.gramsPerTbsp;
    case 'teaspoons': return grams / data.gramsPerTsp;
    default: return null;
  }
}

function formatAmount(value) {
  if (value == null || isNaN(value)) return '—';
  const n = Math.round(value * 100) / 100;
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}
`;
fs.writeFileSync(path.join(ROOT, 'js', 'ingredients-data.js'), jsOut, 'utf8');
console.log('Written js/ingredients-data.js from data/ingredients.json.');
// Generate sitemap.xml
const SITE_URL = 'https://gramtospoon.nickgranados.com';
const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/index.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/conversions/index.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

for (const entry of generatedSlugs) {
  sitemapXml += `  <url>
    <loc>${SITE_URL}/conversions/${entry.slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
}

sitemapXml += `</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Written sitemap.xml with ${generatedSlugs.length + 2} URLs.`);

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt, 'utf8');
console.log('Written robots.txt');

console.log(`\nDone. Generated ${generatedSlugs.length} conversion pages + 1 index page + sitemap.xml + robots.txt.`);
console.log('');

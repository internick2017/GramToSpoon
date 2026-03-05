# Ad placement plan (GramToSpoon)

This document describes where ad slots are placed and how to fill them (e.g. Google AdSense).

## Responsive behavior

- **Mobile (&lt; 768px):** leaderboard slots use ~320x50 (mobile banner); rectangle stays 300x250.
- **Desktop (≥ 768px):** leaderboard 728x90; rectangle 300x250.
- All slots use the `.ad-slot` class and keep minimum height so layout doesn’t jump when ads load.

## Homepage (`index.html`)

| Slot ID       | Position        | Suggested format        | Notes                          |
|---------------|-----------------|--------------------------|--------------------------------|
| `top`         | Above H1        | Leaderboard / banner     | First thing after header       |
| `mid-content` | After calculator | Medium rectangle 300x250 | Between calculator and links   |
| `bottom`      | Before footer   | Leaderboard / banner     | End of main content            |

## Conversion pages (`conversions/*.html`)

| Slot ID        | Position           | Suggested format    | Notes                    |
|----------------|--------------------|---------------------|--------------------------|
| `after-result` | After result box   | Medium rectangle 300x250 | Right after the conversion result |
| `bottom`       | Before footer      | Leaderboard / banner    | End of main content      |

## HTML structure

Each slot is a `<div>` with:

- `class="ad-slot ad-slot--leaderboard"` or `ad-slot--rectangle`
- `data-ad-slot="slot-id"` (for your script or AdSense)
- `aria-label="Advertisement"`

Example placeholder:

```html
<div class="ad-slot ad-slot--leaderboard" data-ad-slot="top" aria-label="Advertisement">
  <!-- Ad: leaderboard 728x90 (desktop) / banner 320x50 (mobile) -->
</div>
```

## Adding AdSense (or another network)

1. Get your ad code (e.g. script + ins/slot from AdSense).
2. Replace the placeholder comment inside each `.ad-slot` with the actual ad tag, or inject ads with a small script that finds `[data-ad-slot]` and fills them.
3. Use responsive ad units where possible so one unit adapts to leaderboard/banner on mobile.

## Do not

- Put more than 3–4 ad units on the homepage (current: 3).
- Put more than 2 units on conversion pages (current: 2).
- Place ads so they cover the calculator or the main conversion result.

## Regenerating pages

After changing the template in `generate.js` (e.g. adding/removing slots), run:

```bash
node generate.js
```

This updates all conversion pages with the same ad structure.

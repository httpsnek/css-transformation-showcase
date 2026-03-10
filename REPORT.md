# DevTools Investigation Report — `.card__cta` Element

**Element:** `<button class="card__cta">Get started</button>`
**Authored source:** `src/scss/_components.scss`, line 119
**Generated CSS:** `dist/assets/index-DmuY2ztj.css` (minified, single line)

---

## 1. Property-by-Property Analysis

### 1.1 Padding (top / bottom)

| Layer | Value |
|---|---|
| **Computed** | `13.6px` |
| **Styles panel rule** | `padding: 0.85em 1.5em` |
| **Source (via source map)** | `src/scss/_components.scss:119` |

The authored value is `0.85em`. At runtime the browser resolves `em` against the element's computed `font-size` of `16px`: `0.85 × 16 = 13.6px`. The Computed panel shows only the resolved absolute value; the original relative unit is visible only by following the source-map link back to `_components.scss:119`.

---

### 1.2 Color

| Layer | Value |
|---|---|
| **Computed** | `rgb(0, 229, 255)` |
| **Styles panel rule** | `color: #00e5ff` |
| **Source (via source map)** | `src/scss/_components.scss:119` |

In the SCSS source the value is the variable `$color-neon-cyan` (declared in `_variables.scss` as `#00e5ff`). The Sass compiler resolves the variable at build time and writes the literal hex value `#00e5ff` into the generated CSS. The browser's Computed panel then converts that hex to its `rgb()` equivalent. Neither the variable name nor the hex token survives into the Computed panel; only the source map restores the original authoring context.

---

### 1.3 Box-shadow

| Layer | Value |
|---|---|
| **Computed** | `rgba(0, 229, 255, 0.502) 0px 0px 12px 0px, rgba(0, 229, 255, 0.251) 0px 0px 32px 0px, rgba(255, 255, 255, 0.102) 0px 1px 0px 0px inset` |
| **Styles panel rule** | `box-shadow: 0 0 12px rgba($color-neon-cyan, 0.5), 0 0 32px rgba($color-neon-cyan, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)` (after mixin expansion) |
| **Source (via source map)** | `src/scss/_components.scss:119` (via `@include neon-glow-button($color-neon-cyan)` defined in `_mixins.scss`) |

The three-layer shadow is authored as a single `@include neon-glow-button($color-neon-cyan)` call. The compiler expands the mixin inline, resolves `$color-neon-cyan` to `#00e5ff`, and writes the full `box-shadow` declaration into the CSS bundle. The Computed panel presents each layer separately and converts the alpha-hex shorthand to explicit `rgba()` notation.

---

### 1.4 Border-color

| Layer | Value |
|---|---|
| **Computed** | `rgba(0, 229, 255, 0.6)` |
| **Styles panel rule** | `border: 1px solid rgba($color-neon-cyan, 0.6)` |
| **Source (via source map)** | `src/scss/_components.scss:119` |

The shorthand `border` property is split by the browser into its longhand components (`border-width`, `border-style`, `border-color`, etc.). The Computed panel surfaces only `border-color` and renders the colour as `rgba()`. The SCSS source uses `rgba($color-neon-cyan, 0.6)`, which the compiler expands to `rgba(0, 229, 255, 0.6)` — the variable name is lost in the output.

---

### 1.5 Background-image

| Layer | Value |
|---|---|
| **Computed** | `linear-gradient(135deg, rgba(0, 229, 255, 0.149) 0%, rgba(100, 108, 255, 0.149) 100%)` |
| **Styles panel rule** | `background: linear-gradient(135deg, rgba($color-neon-cyan, 0.15) 0%, rgba($color-brand, 0.15) 100%)` |
| **Source (via source map)** | `src/scss/_components.scss:119` |

Two SCSS variables (`$color-neon-cyan` and `$color-brand`) are resolved at build time and their `rgba()` alpha values are slightly rounded by the browser (0.15 → 0.149). The Computed panel also separates `background-image` from `background-color`, a longhand split that is invisible in the authored `background` shorthand.

---

## 2. Where the Generated CSS Lives

The production build outputs a single minified stylesheet:

```
dist/assets/index-<hash>.css
```

All CSS from the five SCSS partials is concatenated, variable-resolved, mixin-expanded, selector-flattened, and then minified into one continuous line. The companion source map is located at:

```
dist/assets/index-<hash>.css.map
```

The final line of the CSS file contains the reference:

```css
/*# sourceMappingURL=index-<hash>.css.map */
```

Opening the **Sources** panel in Chrome DevTools and navigating to the `.css.map` entry restores the original partial structure, allowing inspection of `_components.scss`, `_mixins.scss`, and `_variables.scss` as authored.

---

## 3. Three Breakdown Cases

### 3.1 Unit Conversion

**Problem:** Relative units authored in SCSS (`em`, `rem`, `%`) are resolved by the browser into absolute pixel values in the Computed panel. In this element, `padding: 0.85em` becomes `13.6px`. The px value is context-dependent — it changes if the parent `font-size` changes — but the Computed panel shows only the resolved snapshot. A developer inspecting the Computed panel alone cannot tell whether the original rule used `em`, `rem`, or a hardcoded `px` value without consulting the Styles panel and following the source-map link back to `_components.scss:119`.

### 3.2 Variable Flattening

**Problem:** SCSS variables serve as named design tokens that communicate intent (`$color-neon-cyan`, `$glass-blur`, `$transition-fast`). The Sass compiler replaces every variable reference with its literal value before writing the CSS file. By the time the stylesheet reaches the browser, all variable names have been erased: `$color-neon-cyan` is just `#00e5ff`, `$transition-fast` is just `.25s`. The Styles panel in DevTools shows the raw hex and numeric values with no indication that they originated from a shared token. This makes it impossible to understand the design system's structure — or to identify which other properties share the same token — without opening the source map and tracing back to `_variables.scss`.

### 3.3 Mixin Abstraction

**Problem:** SCSS mixins compress multiple declarations behind a single human-readable name. The `.card__cta` button's neon glow is authored as one line — `@include neon-glow-button($color-neon-cyan)` — but the compiled output expands to a full multi-layer `box-shadow` declaration. Similarly, the `.card` element's glass effect is one `@include glass` call that expands into `background`, `backdrop-filter`, `-webkit-backdrop-filter`, `border`, `border-radius`, and `box-shadow`. In DevTools, these appear as five or more independent CSS properties with no visible relationship to each other. A developer debugging an unexpected shadow or blur has no way to know that all those properties share a common origin in a single mixin without source maps pointing back to `_mixins.scss`.

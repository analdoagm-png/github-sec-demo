# Design System

This document is the UI consistency reference for Security Findings. It
describes the design currently implemented in the application; it is not a
separate visual direction. When changing the UI, update this document and the
source tokens together.

## Design principles

- **Quiet, information-first security UI.** Prefer white cards on a soft-gray
  canvas, compact chrome, and thin neutral borders. Data and task completion
  should be more prominent than decoration.
- **Semantic color, used sparingly.** Blue means an interactive or selected
  control. Green is reserved for the primary confirmation action. Severity
  colors communicate risk only; do not use them as general decoration.
- **Dense but readable tables.** Keep labels concise, use a clear typographic
  hierarchy, and let the structure—not heavy visual styling—separate data.
- **Responsive equivalence.** Small screens retain every value from desktop
  tables, transforming rows into labelled cards instead of hiding information.
- **Accessible interaction.** Every interactive control needs a visible
  keyboard focus treatment, a usable name, and reduced-motion support where
  motion is introduced.

## Source of truth

| Concern | Source |
| --- | --- |
| Global tokens, reset, type family | `app/globals.css` |
| Shared shell, cards, table, filter header, pagination, breakpoints | `app/shared.module.css` |
| Filter panel and control states | `app/components/FilterPanel.module.css` |
| Service dashboard patterns | `app/page.module.css` |
| Findings-table patterns | `app/findings/page.module.css` |
| SVG and raster UI assets | `public/icons/` |

Use CSS Modules for component or route styles. Do not introduce Tailwind. Use
an existing custom property before adding a hard-coded value or a new token.

## Foundations

### Color

#### Surfaces and borders

| Token | Value | Intended use |
| --- | --- | --- |
| `--color-canvas-default` | `#ffffff` | Cards, fields, panels, primary content surface |
| `--color-canvas-subtle` | `#f6f8fa` | Page canvas, table headers, filter header, quiet hover state |
| `--color-neutral-emphasis` | `#24292e` | Global navigation background |
| `--color-border-default` | `#d0d7de` | Inputs and selects |
| `--color-border-muted` | `#e1e4e8` | Cards, table dividers, panel dividers |
| `--color-border-subtle` | `rgba(27, 31, 36, 0.15)` | Button and avatar borders |
| `--color-border-purple` | `#6f42c1` | Reserved existing token; do not use for new UI without a semantic purpose |
| `--color-border-stat` | `#e6e6e6` | Standard statistic cards |
| `--color-border-stat-total` | `rgba(230, 230, 230, 0.74)` | Primary total statistic card |
| `--color-overlay` | `rgba(27, 31, 36, 0.5)` | Modal and panel backdrop |

#### Text, links, and actions

| Token | Value | Intended use |
| --- | --- | --- |
| `--color-fg-default` | `#24292e` | Primary text |
| `--color-fg-muted` | `#586069` | Supporting metadata and status text |
| `--color-fg-subtle` | `#6a737d` | Secondary/tertiary text and mobile labels |
| `--color-fg-on-emphasis` | `#ffffff` | Text on dark or emphasized surfaces |
| `--color-fg-link` | `#0366d6` | Links, including finding titles and owner links |
| `--color-fg-accent` | `#0969da` | Interactive text and active filter chips |
| `--color-fg-danger` | `#cb2431` | Danger text when a dedicated severity treatment is not appropriate |
| `--color-fg-success` | `#22863a` | Success text when needed |
| `--color-accent-emphasis` | `#0969da` | Selected pagination, checked controls, focus outlines |
| `--color-accent-subtle` | `#ddf4ff` | Filter and label pill backgrounds |
| `--color-accent-coral` | `#f9826c` | Active navigation underline only |
| `--color-nav-hover` | `rgba(255, 255, 255, 0.08)` | Navbar-link hover fill |
| `--color-nav-active` | `rgba(255, 255, 255, 0.16)` | Navbar-link pressed fill |
| `--color-btn-bg` | `#f6f8fa` | Secondary button background |
| `--color-btn-border` | `#1b1f24` | Existing token; do not substitute for the established subtle button border |
| `--color-btn-counter-bg` | `rgba(27, 31, 36, 0.08)` | Filter-count pill |
| `--color-btn-primary-bg` | `#2da44e` | Primary confirmation action (currently Save) |
| `--color-btn-primary-border` | `#1a7f37` | Primary button border |
| `--color-btn-primary-hover` | `#2c974b` | Primary button hover fill |
| `--color-btn-primary-active` | `#298e46` | Primary button pressed fill |

#### Severity

Severity terms and tokens are a fixed vocabulary. Keep values aligned with
`app/lib/filters.ts` and render them consistently in filters, badges, data,
and mobile row accents.

| Severity | Token | Value | Treatment |
| --- | --- | --- | --- |
| Critical | `--color-severity-critical` | `#cb2431` | Badge border, row accent, critical metrics |
| High | `--color-severity-high` | `#bc4c00` | Badge border, row accent |
| Moderate | `--color-severity-moderate` | `#9a6700` | Badge border, row accent |
| Low | `--color-severity-low` | `#57606a` | Badge border, row accent |
| Informational | `--color-severity-informational` | `#6a737d` | Badge border, row accent |

Severity badges use a white background, default dark text, a 1px severity
border, and a full pill radius. Do not fill their backgrounds with severity
colors; color is intentionally restrained.

### Typography

Inter is the application typeface, loaded through `next/font` and exposed as
`--font-inter`. The base font stack is Inter, then system UI fallbacks.

| Role | Size / line height | Weight | Tracking | Typical use |
| --- | --- | --- | --- | --- |
| Small | 12px / 18px | 400 or 600 | normal | Metadata, chips, badges, disclaimers |
| Body | 14px / 20px | 400 | `-0.15px` when used with UI controls | Tables, controls, body copy |
| Section/page title | 24px / 36px | 600 | `0.3px` | Page headings, panel title |
| Mobile page title | 20px / 28px | 600 | inherit | Page heading at ≤700px |
| Fieldset/stat label | 16px / 24px | 400 or 600 | normal | Filter group headings, summary cards |

Use semibold (`600`) for headings, table headers, entity names, dates, badge
labels, and key numeric emphasis. The total statistic amount may use `700`.
Avoid adding arbitrary font weights or alternate typefaces.

### Spacing, radius, and elevation

| Token | Value |
| --- | --- |
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 16px |
| `--space-4` | 24px |
| `--space-5` | 32px |
| `--space-6` | 40px |
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-full` | 100px |

Follow the token scale for new layout gaps and padding. A component may retain
an existing exceptional value when matching the design exactly (for example a
20px stat-card inset or a 10px button inset), but new patterns should begin
from the scale.

| Shadow token | Use |
| --- | --- |
| `--shadow-btn` | Secondary buttons |
| `--shadow-input-inset` | Search and select inputs |
| `--shadow-card` | General data cards |
| `--shadow-stat-total` | Primary total-stat card |
| `--shadow-stat-card` | Supporting statistic cards |
| `--shadow-panel` | Right-side filter panel |

Shadows are subtle and functional. Do not add large, diffuse, colorful, or
stacked shadows outside these established treatments.

## Layout and responsive behavior

### Application shell

- The sticky navbar is 56px high, has a dark neutral surface, and uses 32px
  horizontal padding on desktop.
- The page canvas is `--color-canvas-subtle`; content uses 32px outer padding
  and a 24px vertical gap.
- The shared content card is white with a 1px muted border, 8px radius, and
  the standard card shadow.
- Navbar content, filter controls, table scaffolding, and pagination belong in
  `app/shared.module.css`; reuse them instead of creating route-specific
  variants.

### Breakpoints

Use only the two existing breakpoints unless the product gains a materially
different layout requirement.

| Viewport | Rule |
| --- | --- |
| Desktop (>1024px) | Horizontal nav, filter controls on one line, table grid, stats in one row |
| Tablet (≤1024px) | Page/nav padding becomes 24px; filter controls wrap; search and tags occupy full rows; pagination wraps; stats become a 3-column grid with total card full width |
| Mobile (≤700px) | Page padding becomes 16px; title becomes 20px/28px; nav logo narrows to 130px; table headers are hidden and each row becomes a vertically spaced card with a 3px semantic left accent; stats use two columns |

Mobile tables must use `shared.mobileLabel` to expose the column meaning above
the cell value. Never rely on a hidden desktop column header to communicate
data on small screens.

## Components and interaction patterns

### Navigation

- Keep the 56px dark navbar sticky at the top of the viewport.
- Navigation labels are semibold white, with a 2px coral underline for the
  active route. Do not change the active state to a filled tab.
- Navigation links use a 150ms quiet white hover fill. On press, the fill
  strengthens and the link moves down 1px for tactile feedback. Retain the
  coral underline while hovered or pressed, and show a 2px blue inset focus
  ring for keyboard navigation. Disable the transition under reduced motion.
- An unavailable destination is muted, uses the `not-allowed` cursor, and is
  rendered as noninteractive text with an explanatory label. Do not use `#`
  or another placeholder URL for an unavailable navigation item.
- Use 16px icons and a 24px circular avatar; decorative images have empty alt
  text, while meaningful images have descriptive alternatives.

### Cards and statistics

- Use a standard card for data collections. Avoid nested cards unless a visual
  grouping is genuinely needed.
- The total statistic card is the lead metric: fixed 296px width on desktop,
  larger elevation, and 24px horizontal padding.
- Supporting stat cards use equal flexible widths, 16px horizontal padding,
  one metric, then a muted label and muted trend row with 16px icons.
- Critical change data may use the critical severity color; do not infer that
  every upward or downward trend needs red or green.

### Tables and data rows

- Table headers are 40px high, soft-gray, semibold, and include a 20px sort
  affordance when the column supports sorting. The complete header cell is a
  button; a neutral double-arrow becomes an upward or downward arrow when its
  sort is active.
- Table-header labels and their sort affordances are always left-aligned inside
  their columns. Shared button defaults must not center a table-header control.
- Sort state begins inactive. The first selection sorts ascending, then each
  repeated selection alternates ascending and descending. Express the active
  state with a persistent blue label, visible arrow, and `aria-sort` on the
  column header. Announce result and sort changes through a polite live region.
- Data rows use 1px muted separators; cells use 24px vertical and 16px
  horizontal padding. On hover-capable devices, a hovered row (or a row
  containing focused content) uses the soft-gray surface; touch layouts keep
  the resting state.
- Desktop table content is left-aligned. Keep paired entity links, such as a
  service and owner, on a single line when the column has room; allow normal
  wrapping only in the mobile card layout.
- This includes each line in a stacked cell: its container and every child
  value must stretch from the cell's left padding and use `text-align: left`.
  Do not depend on flex alignment alone for table-cell text placement.
- Two-line table cells share a 4px gap: use a 14px/20px semibold primary line
  and a 12px/18px muted secondary line. This applies to finding references,
  due-date timing, severity detail, and missed-SLA breakdowns.
- Entity names and noninteractive finding titles use default semibold text.
  Reserve link blue and underlining for destinations that are actually
  available. Finding titles truncate on desktop and expand to normal wrapping
  on mobile.
- Status uses a 16px icon alongside muted text. Keep icon/text pairs at an 8px
  gap.
- A mobile row sets `--row-accent` inline from its severity. That variable is
  the single source for the 3px left border; do not create parallel ad-hoc
  mobile severity rules.

### Filters and search

- Reuse `app/components/Button.tsx` for every action button. It exposes
  primary (confirmation), secondary (contained neutral), tertiary (text-first),
  and icon variants. Each variant has the same 150ms hover feedback, pressed
  1px movement, 2px blue keyboard-focus ring, disabled treatment, and reduced-
  motion fallback; layout-specific components may only override its custom
  sizing properties.
- The filter header uses a soft-gray surface with 16px padding and a 16px gap.
- Secondary filter controls have 6px radius, soft-gray fill, subtle border,
  and the button shadow. Their label is 14px/20px. On hover they brighten to
  white with a stronger neutral border; on press they use the quiet counter
  fill and move down 1px.
- Search is 40px high, 355px wide on desktop, with a white fill, default input
  border, 6px radius, and inset shadow. A 2px blue focus ring and blue border
  make keyboard focus explicit. At tablet widths it fills its own row.
- Selected filters appear as blue-on-pale-blue full pills. The dismiss affordance
  is an icon button, not text. Its 16px icon sits in a 24px effective target.

### Filter panel

- The filter panel slides from the right, is at most 520px wide, and occupies
  the full dynamic viewport height.
- Its header and footer stay fixed; only the grouped checkbox body scrolls.
- The backdrop and panel use a 250ms ease transition. Honor
  `prefers-reduced-motion: reduce` by removing transitions.
- Group labels are 16px/24px semibold. Use unambiguous leaf labels for State
  and SLA Status rather than repeating category and child names. Nested
  options, if reintroduced, use 24px indentation.
- Checkbox rows have a 32px minimum target and a soft-gray hover fill.
  Checkboxes are custom 16px controls: blue fill when checked, a white check
  or indeterminate bar, and a 2px blue focus ring with a 2px offset.
- The footer is 72px high. Clear uses the tertiary button, Cancel uses the
  secondary button, and Save is the sole green primary action. Clear is
  disabled with no selections and Save is disabled until the draft differs
  from the applied filter state. The close affordance uses the icon button
  variant.

### Pagination

- Pagination separates from table content with a muted top border and has 8px
  vertical/16px horizontal padding.
- The page-size select is 28px high with a 6px radius. Page buttons are
  text-first; only the current page receives a blue fill and white text.
- Disabled controls are muted and use `not-allowed`; hover fills are soft gray
  and do not apply to active or disabled controls.

## Accessibility and motion checklist

- Use semantic buttons for actions and links for navigation.
- Give icon-only controls an `aria-label`; set `alt=""` for decorative icons.
- Make interactive column headings real buttons, give sort controls a next
  action label, and keep `aria-sort` synchronized with the displayed
  direction.
- Retain focus-visible styling for custom form controls. Add an equivalent
  visible focus state to any new keyboard-operable control.
- Inputs and selects use the same 2px blue focus ring and blue border as
  search. Interactive targets must provide at least a 24px effective target;
  32px is preferred for checkbox rows.
- Dialogs must have `role="dialog"`, `aria-modal="true"`, a label, Escape
  close behavior, an initial focus target, a focus trap, and focus return to
  the trigger when closed. Lock document scrolling while a modal panel is open.
- Do not convey severity, state, or status through color alone; retain the
  label, icon, or text value.
- Keep transition durations short (250ms is the existing panel standard) and
  disable them under reduced-motion preferences.

## Asset guidance

Use the existing assets in `public/icons/` for common GitHub-style actions and
statuses. Figma asset URLs expire after roughly seven days; if an asset must
change, re-download it from the Figma source rather than hand-editing an
exported SVG. Keep icons at their established 16px, 20px, or 24px sizes unless
the component specification above says otherwise.

## Change checklist

Before shipping a UI change:

1. Use an existing token and shared style where possible; add a token only for
   a reusable semantic value.
2. Check desktop, tablet (≤1024px), and mobile (≤700px), including table-card
   conversion on mobile.
3. Verify hover, disabled, keyboard focus, selected, empty, and reduced-motion
   states as appropriate.
4. Keep severity names and colors synchronized with `app/lib/filters.ts`.
5. Update this document when a token, shared pattern, breakpoint, or component
   rule changes.

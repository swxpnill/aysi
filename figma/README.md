# Foundry — Enterprise Operations Console (Figma)

Figma file: https://www.figma.com/design/AggzqprrzYxgubHv6J9bzM

## File structure (Starter plan: 3 pages)

| Page | Contents |
| --- | --- |
| 00 · Foundations & Components | Cover, foundations (colour, semantic-meaning rules, type ramp, space/radius/elevation, data-viz rules), component library (primitives + composites) |
| 01 · Desktop screens | 11 screens at 1440, 10 overlay frames, 4 toasts, interaction map; prototype flows A–C |
| 02 · Overlays, Responsive & Flows | Tablet 834 (dashboard, orders) and mobile 390 (dashboard, orders, order detail, nav drawer, bottom sheet) |

## Tokens

- **Variables:** `Primitives` (hidden), `Semantic` (58 colour aliases: bg, border, text, accent, status/{positive,negative,warning,info,neutral,critical}, chart, nav), `Dimension` (space, radius, control sizes).
- **Text styles:** 17 Inter styles (Display, Heading, Body, Label, Caption, Numeric, Chart, Button). Numbers use tabular figures.
- **Effect styles:** Elevation 1–4, Focus ring, Focus ring · Danger.

## Components

Icons (45), Button (Variant × State × Size, 40 variants), Icon button, Text field, Select, Checkbox, Toggle, Radio, Badge, Delta (polarity-aware), Avatar, Tab, Segment, Menu item, Pagination, Tooltip, Toast, Banner, Nav item, Sidebar, Top bar, KPI card (Default/Hover/Selected/Loading/No data), Card header, Legend item, Table header/row (Orders), Modal header/footer, Empty state, Filter chip, Date range trigger.

## Prototype

172 reactions. Covers sidebar navigation on every screen, the notifications bell, KPI drill-down, rows → order detail, all overlays (click-outside / ✕ / Cancel dismissal), confirm → toast and validation-error swap.

What it doesn't simulate: typing, sorting, live data and permissions. These are documented in the interaction map as implementation notes.

## Scripts

`scripts/` holds the Plugin API scripts used to generate the file through the Figma MCP `use_figma` tool. Each build script is prefixed with `00-helpers.js` (screen scripts also use `05-screen-helpers.js`). All sample figures and names are illustrative.

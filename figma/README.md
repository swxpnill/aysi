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

## v2 revision (operations refocus)

- **Type:** all text styles now use Geist.
- **Navigation:** Operations (Dashboard, Orders), Directory (Customers, Brokers, Products, Transporters) and Administration (Settings, Users & access, Integrations). Reports, Activity and the Yard board were removed.
- **Dashboard:**
  - **KPIs:** Total orders, Active shipments, On-time dispatch rate (measured at gate-out, because delivery isn't tracked) and At-risk shipments.
  - **Chart:** dispatched-tonnage line with a faint same-hue shadow, compared against the prior period. No invented target and no decorative gradient.
  - **Cards:** an order-status overview, "Needs attention" (at-risk and exceptions as separate lists, each order counted once) and active shipments.
- **Orders:** the primary filters are only All and Completed. There are frames for the Completed state and an empty state.
- **Directory:** list and detail pages for Customers, Brokers and Transporters. Products has a list plus a detail drawer and says plainly that stock isn't tracked.
- **Notifications:**
  - **Toasts:** shown top-right and can carry an action link.
  - **Notification centre:** keeps critical items until someone acknowledges them.
  - **Page banners:** removed.
  - **Rules:** documented in the interaction map, which also holds the KPI definitions and route mapping.
- **Prototype:** 245 links rewired.

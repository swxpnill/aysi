# v3 — Order detail redesign and repo-truth pass

Each file is self-contained and runs in one `use_figma` call against file `AggzqprrzYxgubHv6J9bzM`.

| Script | Status |
| --- | --- |
| `a-order-detail-request-vehicle.js` | **Applied.** Rebuilt `04 · Order detail`; added `04b · … vehicle requested`, the card-states board and 6 Request-vehicle overlays; re-linked 49 inbound prototype links. |
| `b-fixes-schema-truth-states.js` | **Not applied yet** (Figma Starter MCP limit reached). Run it once as-is when calls are available. |

What `b` does:
- **Order detail:** wraps the meta row; drops the Length column (length moves into the product subtitle); widens the product and transporter columns; shortens the field helper text; resets the four prototype flows.
- **Directory pages:** removes fields that are not in the Foundry schema:
  - customer code, PAN, legal name, price list, and the customer Notes card/tab
  - broker legal name and email
  - transporter code, PAN, email, legal name and lanes
  - product base rate and GST (HSN is shown instead)
  - "On hold" and "Under review" statuses become Inactive, because the only status column is `is_active`
- **Responsive:** relabels the stale "Open yard" links on the tablet and mobile pages.
- **New state frames:** dashboard chart loading/empty/error; orders list loading (skeleton rows) and error (with a persistent error toast).

Sources checked in swxpnill/Order:
- Migrations 0070 (vehicle_requests) and 0087 (customer optional).
- `vehicle-request-service.ts` (failure codes and messages) and `vehicle-request-panel.tsx` (form fields and labels).
- `order-events.ts` (event kinds) and `vocabulary.ts` (plant shown as "Company").
- Live table columns from the local Postgres database.

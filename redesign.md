# Crown Assurance — Enterprise Redesign Specification

> **Version**: 1.0.0 | **Date**: 2026-07-01
> **Stack**: React 19 + Vite + React Router v7 + Vanilla CSS + Phosphor Icons

---

## 1. Codebase Analysis

### 1.1 Project Structure

```
src/
├── api/
├── assets/
├── components/
│   ├── Card.jsx               # Stat card (minimal, needs enhancement)
│   ├── DownloadButton.jsx     # PDF export
│   ├── Modal.jsx              # Base modal wrapper
│   ├── ProtectedRoute.jsx     # Auth guard with role checking
│   ├── Sidebar.jsx            # App sidebar (styles via JS string — problem)
│   └── ToastProvider.jsx      # Context-based notifications
├── context/
│   └── AuthContext.jsx        # Auth state: userData, login, logout
├── hooks/
│   ├── useFetch.js
│   └── useForm.js
├── pages/
│   ├── AdminDashboard.jsx     # ADMIN stats (inline styles — problem)
│   ├── AgentDashboard.jsx     # AGENT stats (inline styles — problem)
│   ├── Claims.jsx             # 68KB! Role-aware claims management
│   ├── Customers.jsx          # Customer listing
│   ├── ForgotPassword.jsx
│   ├── Login.jsx
│   ├── Payments.jsx
│   ├── PlanCatalog.jsx
│   ├── Policies.jsx
│   ├── Policy.jsx
│   ├── ProductCatalog.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   ├── ResetPassword.jsx
│   ├── UserDashboard.jsx      # 593 lines, inline styles — problem
│   ├── Users.jsx
│   ├── VerifyOtp.jsx
│   └── landing/
│       ├── LandingLayout.jsx  # Navbar + Footer shared wrapper
│       ├── LandingPage.jsx    # 27KB single-page landing
│       ├── Home.jsx, About.jsx, Plans.jsx, Pricing.jsx, Features.jsx, ClaimsInfo.jsx
├── services/                  # 9 Axios service files
├── styles/
│   ├── LandingPage.css        # 1338 lines — own --rev-* token system
│   ├── Navbar.css
│   ├── Login.css, Register.css, VerifyOtp.css
│   ├── Plans.css, Pricing.css, About.css, Home.css, ClaimsInfo.css, Features.css
├── utils/
├── App.css                    # Dashboard layout + card system
├── index.css                  # Global design tokens + filter/toast
└── App.jsx                    # 26 routes
```

### 1.2 Routing Map

| Route | Component | Roles |
|---|---|---|
| `/` | LandingPage | Public |
| `/about`, `/plans`, `/pricing`, `/features`, `/claims-info` | LandingPage | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/verify-otp` | VerifyOtp | Public |
| `/forgot-password` | ForgotPassword | Public |
| `/reset-password` | ResetPassword | Public |
| `/admindashboard` | AdminDashboard | ADMIN |
| `/userdashboard` | UserDashboard | CUSTOMER |
| `/agentdashboard` | AgentDashboard | AGENT |
| `/policy` | Policy | All roles |
| `/policy/:type` | ProductCatalog | All roles |
| `/policy/:type/:productId/plans` | PlanCatalog | All roles |
| `/claims` | Claims | All roles |
| `/payments` | Payments | CUSTOMER |
| `/profile` | Profile | All roles |
| `/customers` | Customers | ADMIN, AGENT |
| `/users` | Users | ADMIN |
| `/policies` | Policies | ADMIN, AGENT |

### 1.3 Current Design Tokens

| Token | Current Value | New Value |
|---|---|---|
| `--primary` | `#494fdf` (Cobalt Violet) | `#FACC15` (Gold) |
| `--accent` | `#00a87e` (Teal) | Removed |
| `--surface` | `#f8f9fc` | `#FAFAFA` / `#000000` |
| `--card` | `#ffffff` | `#FFFFFF` / `#111111` |
| `--border` | `#e2e2e7` | `#E5E5E5` / `#2E2E2E` |
| `--radius-card` | `20px` | `12px` |
| `--radius-button` | `9999px` | `6px` |

---

## 2. Current Design Problems

### 2.1 Color Inconsistencies

- **Two token systems conflict**: `LandingPage.css` uses `--rev-*` tokens that override global `index.css` tokens.
- **Primary is purple (#494fdf)** — not appropriate for a gold/premium enterprise brand.
- **Logo is just letter "C"** — placeholder only. Not a real logo.
- **Dark theme has same primary** as light theme — no visual differentiation.

### 2.2 Architecture Issues

- **Inline JS styles** in `Sidebar.jsx`, `AdminDashboard.jsx`, `AgentDashboard.jsx`, `UserDashboard.jsx` — impossible to theme globally.
- **Topbar duplicated** across all 3 dashboard files — no shared component.
- **`.dashboard-container`, `.topbar`, `.role-badge`** styles are copy-pasted verbatim in 3 files.
- `Card.jsx` is only 17 lines — no loading/skeleton state, no trend indicator.
- `Modal.jsx` is just a wrapper div — no structure.

### 2.3 Navigation Issues

- **Sidebar links have NO icons** — `link.icon` exists in code but is never populated in `getLinks()`.
- **Mobile**: Sidebar just `display:none` below 1024px with no hamburger drawer alternative.
- **Landing navbar** mixes emoji icons with Phosphor icons inconsistently.

### 2.4 Accessibility Gaps

- `<a onClick>` without `href` — not keyboard navigable (Login, Register footer).
- No `role="dialog"` or `aria-modal` on modals.
- No visible focus states on most buttons.
- `11px` fonts fail WCAG minimum size guidelines.

---

## 3. New Brand Identity

### 3.1 New Logo: Shield + Crown SVG

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
  <!-- Shield body -->
  <path d="M20 3L5 9V21C5 29.5 12 36.5 20 38C28 36.5 35 29.5 35 21V9L20 3Z"
        fill="currentColor" opacity="0.1"
        stroke="currentColor" stroke-width="1.5"/>
  <!-- Crown integrated at top -->
  <path d="M13 15L15 11L17.5 14L20 10L22.5 14L25 11L27 15H13Z"
        fill="currentColor"/>
  <!-- Shield center accent -->
  <path d="M20 19V28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="20" cy="18" r="1.5" fill="currentColor"/>
</svg>
```

**Usage**:
- Sidebar: 32×32px, color `#FACC15`
- Topbar: 24×24px, color `var(--text-primary)`
- Auth pages: 40×40px centered, color `#FACC15`
- Landing navbar: 28×28px

---

## 4. New Design System

### 4.1 Color Tokens

#### Light Theme (`:root`)

```css
:root {
  /* Backgrounds */
  --bg-base:        #FFFFFF;
  --bg-subtle:      #FAFAFA;
  --bg-ui:          #F5F5F5;
  --bg-elevated:    #FFFFFF;

  /* Surfaces */
  --surface:        #FAFAFA;
  --card:           #FFFFFF;
  --card-hover:     #F9F9F9;

  /* Borders */
  --border:         #E5E5E5;
  --border-strong:  #D4D4D4;
  --border-subtle:  #F0F0F0;

  /* Gold Accent */
  --gold:           #EAB308;
  --gold-muted:     #CA8A04;
  --gold-dim:       rgba(234, 179, 8, 0.10);

  /* Text */
  --text-primary:   #0A0A0A;
  --text-secondary: #525252;
  --text-muted:     #737373;
  --text-disabled:  #A3A3A3;

  /* Semantic */
  --danger:         #DC2626;
  --danger-bg:      rgba(220, 38, 38, 0.06);
  --success:        #16A34A;
  --success-bg:     rgba(22, 163, 74, 0.06);
  --warning:        #D97706;
  --warning-bg:     rgba(217, 119, 6, 0.06);
  --info:           #2563EB;
  --info-bg:        rgba(37, 99, 235, 0.06);

  /* Primary (Black in light) */
  --primary:        #0A0A0A;
  --primary-light:  #262626;
  --primary-fg:     #FFFFFF;

  /* Sidebar — always black */
  --sidebar-bg:          #000000;
  --sidebar-border:      #1E1E1E;
  --sidebar-text:        #737373;
  --sidebar-active-bg:   #1E1E1E;
  --sidebar-active-text: #FFFFFF;
  --sidebar-hover-bg:    #111111;

  /* Nav */
  --nav-bg:     rgba(255, 255, 255, 0.95);
  --nav-border: #E5E5E5;
}
```

#### Dark Theme (`[data-theme="dark"]`)

```css
[data-theme="dark"] {
  --bg-base:        #000000;
  --bg-subtle:      #0A0A0A;
  --bg-ui:          #111111;
  --bg-elevated:    #1E1E1E;

  --surface:        #000000;
  --card:           #111111;
  --card-hover:     #181818;

  --border:         #2E2E2E;
  --border-strong:  #3D3D3D;
  --border-subtle:  #1E1E1E;

  --gold:           #FACC15;
  --gold-muted:     #EAB308;
  --gold-dim:       rgba(250, 204, 21, 0.12);

  --text-primary:   #FFFFFF;
  --text-secondary: #A3A3A3;
  --text-muted:     #737373;
  --text-disabled:  #525252;

  --danger:         #EF4444;
  --danger-bg:      rgba(239, 68, 68, 0.08);
  --success:        #22C55E;
  --success-bg:     rgba(34, 197, 94, 0.08);
  --warning:        #F59E0B;
  --warning-bg:     rgba(245, 158, 11, 0.08);
  --info:           #3B82F6;
  --info-bg:        rgba(59, 130, 246, 0.08);

  --primary:        #FACC15;
  --primary-light:  #FDE047;
  --primary-fg:     #000000;

  --sidebar-bg:          #000000;
  --sidebar-border:      #1E1E1E;
  --sidebar-text:        #737373;
  --sidebar-active-bg:   #1E1E1E;
  --sidebar-active-text: #FFFFFF;
  --sidebar-hover-bg:    #111111;

  --nav-bg:     rgba(0, 0, 0, 0.95);
  --nav-border: #1E1E1E;
}
```

### 4.2 Typography Scale

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 14px;
  --text-md:   15px;
  --text-lg:   16px;
  --text-xl:   20px;
  --text-2xl:  24px;
  --text-3xl:  30px;
  --text-4xl:  36px;
  --text-5xl:  48px;

  --fw-regular:  400;
  --fw-medium:   500;
  --fw-semibold: 600;
  --fw-bold:     700;
  --fw-extrabold:800;

  --tracking-tight:  -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.025em;
  --tracking-caps:    0.08em;
}
```

### 4.3 Spacing Scale

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

### 4.4 Border Radius Scale

```css
:root {
  --radius-sm:   4px;     /* Tags, badges */
  --radius-md:   6px;     /* Inputs, buttons */
  --radius-lg:   8px;     /* Cards, small panels */
  --radius-xl:   12px;    /* Modals, large cards */
  --radius-2xl:  16px;    /* Feature panels */
  --radius-full: 9999px;  /* Avatars, pills */

  /* Aliases for compat */
  --radius-card:   var(--radius-xl);
  --radius-button: var(--radius-md);
  --radius-badge:  var(--radius-sm);
  --radius-input:  var(--radius-md);
}
```

### 4.5 Shadow System

```css
:root {
  --shadow-xs:   0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-card: var(--shadow-xs);
  --shadow-none: none;
}
[data-theme="dark"] {
  --shadow-card: none;
}
```

### 4.6 Animation Tokens

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);

  --duration-fast:   100ms;
  --duration-base:   150ms;
  --duration-slow:   200ms;
  --duration-slower: 300ms;
}
```

---

## 5. Component Redesigns

### 5.1 Sidebar

**File**: `src/components/Sidebar.jsx`
**CSS**: New `src/styles/Sidebar.css` (extract from JS string)

```
Width: 240px, fixed position
Background: #000000 (always, both themes)
Border-right: 1px solid #1E1E1E

Brand (top):
  - SVG logo 32×32, color #FACC15
  - "Crown Assurance" white 14px fw-600
  - Role sub-label gray-500 11px
  - Border-bottom: 1px solid #1E1E1E

Navigation:
  - Section label: "NAVIGATION" 10px caps gray-600
  - Link height: 40px, padding: 0 12px
  - Icons: Phosphor 16px (REQUIRED — currently missing)
  - Active: bg=#1E1E1E, text=white, left-border: 2px solid #FACC15
  - Hover: bg=#111111
  - Gap: 2px between items

Footer:
  - Border-top: 1px solid #1E1E1E
  - Logout button: danger hover (red tint)
  - Theme toggle button
  - "v1.0.0" version label gray-600
```

**Icon map for links**:
```js
const ICON_MAP = {
  '/admindashboard':  'ph-squares-four',
  '/agentdashboard':  'ph-squares-four',
  '/userdashboard':   'ph-squares-four',
  '/policy':          'ph-shield-check',
  '/policies':        'ph-file-text',
  '/claims':          'ph-file-arrow-up',
  '/payments':        'ph-credit-card',
  '/customers':       'ph-users',
  '/users':           'ph-user-gear',
  '/profile':         'ph-user-circle',
};
```

**Mobile**: Overlay drawer below 1024px, triggered by topbar hamburger.

---

### 5.2 Topbar (New Shared Component)

**File**: `src/components/Topbar.jsx` (NEW)
**CSS**: `src/styles/Topbar.css` (NEW)

```
Height: 60px
Background: var(--card)
Border-bottom: 1px solid var(--border)
Sticky top: 0, z-index: 100

Left: Mobile hamburger + page title
Right: Theme toggle + notification bell + user avatar (initials, gold bg)
```

---

### 5.3 Card (Stat Card)

**Enhanced**:
```
Height: min 120px
Border: 1px solid var(--border)
Border-radius: 12px
Padding: 20px 24px
Hover: border-color → border-strong, translateY(-1px)

Top row: Label (11px caps) + Icon (32×32, accent bg)
Bottom: Value (28px fw-700 mono) + Sub-label (12px muted)

Accent variants:
  --accent-gold: icon bg = var(--gold-dim), icon color = var(--gold)
  --accent-blue: rgba(59,130,246,0.10)
  --accent-green: rgba(34,197,94,0.10)
  --accent-red: rgba(239,68,68,0.10)
```

---

### 5.4 Button System

**New file**: `src/styles/Buttons.css`

```css
.btn { height: 36px; padding: 0 14px; border-radius: var(--radius-md);
       font-size: 13px; font-weight: 600; border: 1px solid transparent; }

.btn-sm  { height: 30px; padding: 0 10px; font-size: 11px; }
.btn-lg  { height: 44px; padding: 0 20px; font-size: 14px; }
.btn-xl  { height: 52px; padding: 0 28px; font-size: 16px; }

.btn-primary   { background: var(--primary); color: var(--primary-fg); }
.btn-secondary { background: transparent; border-color: var(--border); color: var(--text-primary); }
.btn-ghost     { background: transparent; border: none; color: var(--text-secondary); }
.btn-danger    { background: var(--danger-bg); color: var(--danger); }
.btn-success   { background: var(--success-bg); color: var(--success); }
.btn-gold      { background: var(--gold); color: #000000; }  /* Premium CTA */

/* Hover: danger/success fill on hover */
/* Focus: outline: 2px solid var(--gold); outline-offset: 2px */
/* Active: transform: scale(0.97) */
```

---

### 5.5 Form Inputs

**New file**: `src/styles/Forms.css`

```css
.form-input {
  width: 100%; height: 40px;
  background: var(--bg-ui);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--text-primary); font-size: 14px;
}
.form-input:focus { border-color: var(--gold); background: var(--bg-elevated); }
.form-input.input-error { border-color: var(--danger); }
```

---

### 5.6 Table System

**New file**: `src/styles/Table.css`

```
Container: border, border-radius: 12px, overflow: hidden
Header: bg-ui bg, border-bottom, th: 12px caps fw-600 text-muted, sticky
Row: 14px, padding: 14px 16px, hover: bg-ui, border-bottom: border-subtle
Pagination: 32×32 buttons, border, active: primary bg
Mobile: horizontal scroll
```

---

### 5.7 Modal

**Redesigned** `src/components/Modal.jsx` + `src/styles/Modal.css`

```
Overlay: fixed inset-0, rgba(0,0,0,0.6), backdrop-filter: blur(4px)
Container: max-width 480px, border, border-radius: 12px, bg: card

Header: padding 20px 24px, border-bottom, title 16px fw-600, close btn
Body: padding 24px, max-height 70vh, overflow-y: auto
Footer: padding 16px 24px, border-top, flex end, gap 8px

Animation: scale(0.96)→scale(1) + translateY(8px)→0, 200ms ease-spring
ARIA: role="dialog", aria-modal="true", focus trap
```

---

### 5.8 Badge System

**New file**: `src/styles/Badges.css`

```css
.badge { font-size: 11px; fw-600; border-radius: 4px; padding: 2px 8px; }
.badge-success { background: var(--success-bg); color: var(--success); }
.badge-danger  { background: var(--danger-bg);  color: var(--danger); }
.badge-warning { background: var(--warning-bg); color: var(--warning); }
.badge-info    { background: var(--info-bg);    color: var(--info); }
.badge-neutral { background: var(--bg-ui);      color: var(--text-muted); }
.badge-gold    { background: var(--gold-dim);   color: var(--gold); }
```

---

### 5.9 Auth Pages (Login, Register, VerifyOtp, etc.)

**New unified file**: `src/styles/Auth.css` (replaces Login.css + Register.css)

```
Layout: full viewport, flex center
Background: var(--bg-base)

Card:
  - max-width: 400px
  - bg: var(--card)
  - border: 1px solid var(--border)
  - border-radius: 12px
  - padding: 32px

Header:
  - Logo SVG 40×40, gold color
  - Title: 22px fw-700
  - Subtitle: 13px text-secondary

Button: .btn .btn-gold .btn-xl full-width (gold bg, black text)
Links: text-secondary, hover: gold

REMOVE:
  - Radial gradient glows (.login-page::before/::after)
  - Hardcoded #494fdf blue logo
  - Hardcoded #16181a card bg
```

---

### 5.10 Dashboard Layout (New Shared Component)

**New file**: `src/components/DashboardLayout.jsx`

```jsx
const DashboardLayout = ({ children, title }) => (
  <div className="dashboard-shell">
    <Sidebar />
    <div className="dashboard-main">
      <Topbar title={title} />
      <div className="dashboard-content" id="main-content">
        {children}
      </div>
    </div>
  </div>
);
```

**New file**: `src/styles/Dashboard.css`

```
.dashboard-shell: display flex, min-height: 100vh
.dashboard-main: flex 1, margin-left: 240px, flex-col
.dashboard-content: padding: 32px, flex 1

Grid for stat cards:
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))
  gap: 16px

@media <1024px: margin-left: 0 (drawer mode)
```

---

### 5.11 Empty State Component

**New file**: `src/components/EmptyState.jsx`

```jsx
<EmptyState
  icon="ph-folder-open"
  title="No claims found"
  description="You haven't filed any claims yet."
  action={{ label: "File a Claim", onClick: fn }}
/>
```

Style: centered, icon 48px gray-500, title 16px fw-600, description 14px text-muted.

---

## 6. Landing Page Updates

### LandingLayout.jsx (Navbar)

- Replace `🛡️` emoji with SVG logo component
- Replace `ℹ️` emoji with `<i className="ph ph-info">` 
- Replace `🛡️` in Claims link with `<i className="ph ph-shield">`
- Active link indicator: gold underline (2px bottom border), not blue bg
- Buttons: `.btn-ghost` (Login) + `.btn-gold` (Register)

### LandingPage.css

- Replace all `--rev-primary` → `var(--gold)` or `var(--primary)`
- Replace all `--rev-accent-teal` → `var(--success)`
- Replace hardcoded `#494fdf` → `var(--gold)`
- Keep all animation keyframes and structural layouts intact

---

## 7. File Change Map

### Files to CREATE

| File | Purpose |
|---|---|
| `src/components/DashboardLayout.jsx` | Shared dashboard shell |
| `src/components/Topbar.jsx` | Extracted shared topbar |
| `src/components/EmptyState.jsx` | Reusable empty state |
| `src/styles/Sidebar.css` | Sidebar styles (from JS string) |
| `src/styles/Topbar.css` | Topbar styles |
| `src/styles/Buttons.css` | Unified button system |
| `src/styles/Forms.css` | Unified form styles |
| `src/styles/Table.css` | Unified table styles |
| `src/styles/Modal.css` | Unified modal styles |
| `src/styles/Badges.css` | Badge/status system |
| `src/styles/Dashboard.css` | Dashboard layout styles |
| `src/styles/Auth.css` | Unified auth page styles |

### Files to MODIFY

| File | Key Changes |
|---|---|
| `src/index.css` | Replace all tokens with new design system |
| `src/App.css` | Replace hardcoded colors with tokens |
| `src/components/Sidebar.jsx` | Remove inline styles → CSS file; add icons; mobile drawer |
| `src/components/Card.jsx` | New design, accents, skeleton loading |
| `src/components/Modal.jsx` | Header/body/footer structure; ARIA |
| `src/components/ToastProvider.jsx` | Gold accent color; updated animation |
| `src/pages/Login.jsx` | SVG logo; remove blue; Auth.css |
| `src/pages/Register.jsx` | Align with login; Auth.css |
| `src/pages/AdminDashboard.jsx` | Use DashboardLayout; remove inline styles |
| `src/pages/AgentDashboard.jsx` | Use DashboardLayout; remove inline styles |
| `src/pages/UserDashboard.jsx` | Use DashboardLayout; remove inline styles |
| `src/pages/landing/LandingLayout.jsx` | SVG logo; Phosphor icons; gold buttons |
| `src/styles/Navbar.css` | Update color references |
| `src/styles/LandingPage.css` | Replace `--rev-*` with new tokens |
| `src/styles/Login.css` | Superseded by Auth.css |
| `src/styles/Register.css` | Superseded by Auth.css |

### Files to RETAIN UNCHANGED

| File | Reason |
|---|---|
| All `src/services/*.js` | Pure API — no UI |
| `src/hooks/useFetch.js`, `useForm.js` | Pure data hooks |
| `src/context/AuthContext.jsx` | Auth state — no UI |
| `src/components/ProtectedRoute.jsx` | Auth guard — no UI |
| `src/components/DownloadButton.jsx` | PDF export functional |
| `src/main.jsx` | Entry point |
| `src/App.jsx` | Routing only |

---

## 8. Responsive Breakpoints

| Breakpoint | Sidebar | Card Grid | Filter Bar |
|---|---|---|---|
| < 768px | Drawer only | 1 col | Stack |
| 768–1024px | Drawer | 2 col | 2 col |
| 1024–1280px | Fixed 240px | 3 col | 3 col |
| > 1280px | Fixed 240px | 4 col | 4 col |

---

## 9. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Focus visible | `outline: 2px solid var(--gold); outline-offset: 2px` on all interactive |
| Contrast | text-primary/bg-base: >7:1; text-secondary: >4.5:1 |
| Min font size | 12px minimum (raise 11px labels) |
| Keyboard nav | `<a href>` not `<a onClick>`; focus traps in modals |
| ARIA | `role="dialog"` + `aria-modal` + `aria-label` on icon buttons |
| Live regions | Loading states use `aria-live="polite"` |
| Skip link | `<a href="#main-content">Skip to main content</a>` |
| Semantic HTML | `<nav>`, `<main>`, `<aside>`, `<header>` correctly |

---

## 10. Theme Toggle

```js
// Default: dark theme
const [theme, setTheme] = useState(
  () => localStorage.getItem('theme') || 'dark'
);
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);
```

- Toggle in sidebar footer AND in topbar right section
- Default: **dark** (premium experience)
- Icon: `ph-sun` (light mode) / `ph-moon` (dark mode)

---

## 11. Implementation Priority Order

### Phase 1 — Design Foundation
1. Replace `index.css` tokens
2. Create `Buttons.css`, `Forms.css`, `Table.css`, `Modal.css`, `Badges.css`
3. Update `Card.jsx`
4. Rebuild `Modal.jsx`

### Phase 2 — Navigation
5. Update `Sidebar.jsx` — icons, CSS file, mobile drawer
6. Create `Topbar.jsx` + `Topbar.css`
7. Create `DashboardLayout.jsx` + `Dashboard.css`

### Phase 3 — Auth Pages
8. Create `Auth.css`
9. Update `Login.jsx` — SVG logo, two-panel layout
10. Update `Register.jsx`, `VerifyOtp.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`

### Phase 4 — Dashboard Pages
11. Update `AdminDashboard.jsx` — use DashboardLayout
12. Update `AgentDashboard.jsx` — use DashboardLayout
13. Update `UserDashboard.jsx` — use DashboardLayout

### Phase 5 — Data Pages
14. `Claims.jsx` — extract to `Claims.css`
15. `Payments.jsx`, `Policies.jsx`, `Customers.jsx`, `Users.jsx` — unified table
16. `Profile.jsx`, `Policy.jsx`, `ProductCatalog.jsx`, `PlanCatalog.jsx`

### Phase 6 — Landing
17. `LandingLayout.jsx` + `Navbar.css`
18. `LandingPage.css` — replace `--rev-*`

### Phase 7 — Polish
19. Add `EmptyState.jsx` across data pages
20. Skeleton loading states
21. Accessibility audit + fixes
22. Cross-browser and responsive verification

---

## 12. Quality Checklist

- [ ] No `#494fdf` (purple) anywhere
- [ ] No `#00a87e` (teal) anywhere as primary accent
- [ ] No hardcoded `#f8fafc` or `#0f172a` in App.css
- [ ] No inline `style={}` props for colors/spacing
- [ ] No styles in JS template literals
- [ ] Sidebar links all have Phosphor icons
- [ ] Logo is SVG shield+crown, not letter "C"
- [ ] Theme toggle works on landing AND dashboard
- [ ] All buttons have `:focus-visible` gold outline
- [ ] All `<a onClick>` replaced with `<button>` or `<a href>`
- [ ] Modal has `role="dialog"` and focus trap
- [ ] Mobile sidebar drawer works (no `display:none` only)
- [ ] Skeleton loading during data fetch
- [ ] EmptyState when arrays empty
- [ ] Toast colors updated (gold for info, no purple)
- [ ] Tables have sticky headers
- [ ] Filter bar fully responsive
- [ ] No duplicated `.dashboard-container`, `.topbar`, `.role-badge` styles

---

## 13. Protected Functionality — DO NOT CHANGE

- All API service calls (`src/services/*.js`)
- All route paths in `App.jsx`
- Role-based access control in `ProtectedRoute.jsx`
- Form validation logic in all pages
- `AuthContext.jsx` state management
- `useFetch.js` and `useForm.js` hooks
- JWT decode and token storage
- PDF download in `DownloadButton.jsx`
- OTP verification flow in `VerifyOtp.jsx`
- Role-aware navigation `getLinks()` in Sidebar
- All data-fetching `useEffect` patterns

---

*This document is the authoritative redesign specification for the Crown Assurance Insurance Management System.*

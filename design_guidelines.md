# Design Guidelines: Product Showcase E-Commerce Platform

## Design Approach

**Reference-Based: Modern E-commerce Pattern**
Drawing inspiration from Shopify, Gumroad, and contemporary product marketplaces that prioritize visual product presentation and clean layouts.

**Core Principle:** Product-first design with immediate visual impact, optimized for bilingual Arabic/English support with seamless RTL/LTR switching.

---

## Layout System

**Spacing Framework:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm (p-4, gap-6, my-8, etc.)

**Grid Structure:**
- Desktop: Sidebar (280px fixed left) + Main content area (flex-1)
- Tablet/Mobile: Sidebar collapses to bottom or drawer menu
- Product grids: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)

**Container Widths:**
- Main content: max-w-7xl with px-4/6/8 responsive padding
- Product detail: max-w-5xl centered

---

## Typography Hierarchy

**Font Stack:** 
- Primary: Inter or Cairo (excellent Arabic support)
- Use single font family with weight variations (400, 500, 600, 700)

**Scale:**
- H1 (Page titles): text-4xl md:text-5xl, font-bold
- H2 (Section headings): text-2xl md:text-3xl, font-semibold
- H3 (Product titles): text-xl md:text-2xl, font-semibold
- Body: text-base, font-normal
- Small (meta info): text-sm, font-medium

**RTL Support:** Implement `dir="rtl"` and `dir="ltr"` switching with mirrored layouts.

---

## Component Library

### Homepage Layout (No Traditional Hero)
**Immediate Product Grid Entry:**
- Top: Language switcher (flags/text toggle) + Search bar (sticky)
- Banner carousel: 2-3 promotional banners (aspect-ratio 21:9), auto-rotate every 5s
- Product grid immediately below: Cards with hover lift effect

### Left Sidebar (Desktop)
**Fixed vertical section (280px width):**
- Payment Methods block: Grid of payment logos (3 columns), each 60x40px
- Telegram Channels block: List of channel images (120x120px) with links
- Bottom: Telegram contact button with icon + username, prominent CTA styling

**Mobile:** Convert to bottom navigation bar or slide-out drawer

### Product Cards
**Card structure:**
- Image: 1:1 aspect ratio, object-cover
- Title: 2-line clamp with ellipsis
- Quick view icon overlay on hover
- Subtle border, rounded corners (rounded-lg)

### Product Detail Page
**Layout:**
- Hero section: Video player or image gallery (60% width)
- Right panel: Title, features list (checkmark bullets), CTAs
- Mobile: Stack vertically
- Features list: Icon + text rows with dividers, generous spacing (py-4)

### Navigation
**Top header:**
- Logo (left for LTR, right for RTL)
- Category dropdown/tabs
- Search bar (expandable on mobile)
- Language toggle (flag icons)

### Banners
**Placement options:**
- Primary: Full-width below header (h-64 md:h-80)
- Secondary: Between product grid sections
- Clickable overlays with subtle hover scale (scale-105)

### Forms (Admin/Contact)
- Floating labels
- Rounded inputs (rounded-md)
- Clear error states
- Full-width mobile, max-w-md desktop

---

## Images

**Hero/Banner Images:**
- Multiple promotional banners showcasing products/offers
- Dimensions: 1920x600px for desktop banners
- Product lifestyle photography with professional lighting

**Product Images:**
- Square format (1:1) for consistency: 800x800px minimum
- Clean white or lifestyle backgrounds
- Support video embeds (16:9 aspect ratio players)

**Sidebar Images:**
- Payment logos: Transparent PNGs, 120x80px
- Telegram channel images: Square 240x240px

**Trust Badges:**
- Include security/payment badges in footer

---

## Accessibility

- Maintain 4.5:1 contrast ratios throughout
- Focus states: 2px offset ring
- All interactive elements min 44x44px touch targets
- Form labels always visible (floating or top-aligned)
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactive elements

---

## Responsive Breakpoints

- Mobile: < 768px (single column, stacked sidebar)
- Tablet: 768px - 1024px (2 column grid)
- Desktop: > 1024px (4 column grid, fixed sidebar)

---

## Animations

**Minimal, purposeful only:**
- Product card hover: subtle lift (translateY(-4px)) + shadow increase
- Banner transitions: smooth fade (transition-opacity duration-500)
- Language switch: content fade-out/fade-in (duration-200)
- No scroll animations or parallax effects

---

## RTL/LTR Considerations

- Mirror entire layout (sidebar moves right in RTL)
- Flip padding/margin directions automatically
- Icons that indicate direction must flip (arrows, etc.)
- Numbers remain LTR even in RTL context
- Text alignment: right for RTL, left for LTR

---

**Icons:** Use Heroicons via CDN (outline for UI, solid for emphasis)

# 🎨 Cake Topper Designer App – Full Project Prompt for Cursor AI

## 🧁 PROJECT TITLE:
**Cake Topper Designer** – Custom Visual Builder App for Vertical Cake Toppers

---

## 📌 PROJECT SUMMARY:
Build a **cross-platform app** (web-first, PWA, mobile-ready) that allows users to visually design **cake toppers** using pre-made design elements (no file uploads). The app should present a **side-view (not top-down)** of a cake and allow users to place decorative elements on a vertical canvas that simulates a real cake topper.

Final user designs are exported as **.SVG** (for laser cutting) and optionally **.PNG mockups**, then passed to the shop owner (Brandon Bouchey / Owltopthat) along with order info for production.

---

## 🧱 GOAL:
- Interactive, intuitive design environment for cake toppers
- Live canvas preview in vertical format
- User-friendly checkout + design submission
- Only pre-defined design elements (no user uploads)

---

## 📦 TECH STACK:

- **Frontend**: Next.js + TypeScript + TailwindCSS
- **Canvas Library**: Fabric.js or Konva.js
- **Cross-Platform**: Capacitor.js (iOS/Android wrap)
- **Storage**: Supabase / Firebase / AWS S3
- **Payment**: Stripe
- **Export Format**: SVG + PNG

---

## 🎯 USER FLOW:

1. Visit `/designer`
2. Canvas loads with side-view cake
3. User places/edit elements
4. Export SVG/PNG
5. Checkout → Order submitted

---

## 📐 CANVAS DETAILS:

- **Straight-on side view** (not top-down)
- Fixed cake image at bottom of canvas
- Toppers build upward from cake top
- Optional guides/rulers/snap-to-grid

---

## 🛠️ FEATURES (BY PHASE):

### 🔹 PHASE 1 – BASE APP + CANVAS

- Scaffold pages: `/designer`, `/checkout`, `/confirmation`
- Fixed cake image at canvas bottom
- Canvas with Fabric.js or Konva.js
- Zoom, undo/redo, reset view

### 🔹 PHASE 2 – DESIGN TOOLS

- SVG Library Panel (preloaded assets)
- Text Tool (fonts, curves, rotation)
- Object controls (align, front/back, delete)
- Grid overlay + snapping

### 🔹 PHASE 3 – EXPORT + CHECKOUT

- Export SVG + PNG
- Save JSON state (optional)
- Checkout with Stripe
- Send design to backend

### 🔹 PHASE 4 – RESPONSIVE + PWA

- Touch support (mobile/tablet)
- Wrap with Capacitor.js for native apps

### 🔹 PHASE 5 – POLISH

- Branding/styling
- Mockup preview animation
- Tutorial/walkthrough

---

## 📤 DELIVERABLES (PER ORDER):

- `.SVG` (laser-cut ready)
- `.PNG` (mockup)
- Customer info (name/email/notes)
- Order metadata
- JSON state (optional)

---

## 🚫 NO FILE UPLOADS:

- All design elements are from preset library
- No uploads allowed

---

## 📁 FOLDER STRUCTURE:

```
/pages
  /designer.tsx
  /checkout.tsx
  /confirmation.tsx

/components
  CanvasEditor.tsx
  Toolbar.tsx
  AssetPanel.tsx
  TextEditor.tsx

/public/assets/
  /cake_base.png
  /elements/floral/
  /elements/fantasy/
  /elements/wedding/
  /elements/geeky/

/utils
  exportSVG.ts
  exportPNG.ts
  saveDesign.ts

/styles
  globals.css (Tailwind)
```

---

## 💡 INITIAL CURSOR TASK:

Create a responsive Next.js page `/designer` with a Fabric.js canvas. Add a fixed side-view cake image at the bottom-center. Implement a toolbar with two buttons: “Add Text” and “Add Element”. Load SVGs from a local folder and allow drag/drop into canvas. Add zoom controls and export SVG/PNG.

---

✳️ **END OF MASTER PROMPT**

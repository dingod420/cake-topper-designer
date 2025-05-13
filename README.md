# Cake Topper Designer (a.k.a. CakeCanvas by OwlTopThat)

A modern web application for designing custom cake toppers, built with Next.js, Fabric.js, Firebase, and Stripe.

---

## 📌 Project Summary

Cake Topper Designer ("CakeCanvas by OwlTopThat") is a cross-platform app (web-first, PWA, mobile-ready) that allows users to visually design cake toppers using pre-made design elements. The app presents a side-view (not top-down) of a cake and allows users to place decorative elements on a vertical canvas that simulates a real cake topper. Final user designs are exported as SVG (for laser cutting) and optionally PNG mockups, then passed to the shop owner (Owltopthat) along with order info for production.

---

## 🎨 Features

- Interactive canvas design interface (Fabric.js)
- Snap-to-grid layout, drag/rotate/resize SVGs and text
- Live text editing: font, size, weight, style, case, spacing
- User authentication and design saving (Firebase)
- Secure payment processing (Stripe)
- Token-based premium SVG unlocks
- Admin panel for template management
- Responsive design for all devices
- Export SVG (laser-ready) and PNG mockups
- Option to order physical toppers from Owltopthat
- Gamified token/achievement system (optional/future)
- Watermark/lock overlays for premium assets
- Undo/redo, reset view, zoom controls
- Layer management, alignment, and arrangement tools
- Sidebar with templates, elements, shapes, text, and more

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (TypeScript), TailwindCSS
- **Canvas**: Fabric.js (and/or Konva.js)
- **State Management**: Zustand
- **Authentication & Database**: Firebase
- **Payment**: Stripe
- **Animation**: Framer Motion
- **Export**: SVG.js, html2canvas, or custom utils
- **Cross-Platform**: Capacitor.js (for mobile/PWA)

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd cake-topper-designer
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and Stripe credentials
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

---

## 🎯 User Flow & Canvas Details

1. Visit `/designer`
2. Canvas loads with side-view cake (bottom of canvas)
3. User places/edits elements (SVGs, text)
4. Export SVG/PNG
5. Checkout → Order submitted

- **Canvas**: Straight-on side view, fixed cake image at bottom, toppers build upward
- **Guides**: Optional rulers, grid, snap-to-grid
- **No file uploads**: Only pre-defined design elements

---

## 📁 Project Structure

```
├── app/
│   ├── api/            # API routes
│   ├── designer/       # Designer page
│   └── admin/          # Admin panel
├── components/         # Reusable components
├── lib/                # Utility functions and configurations
│   ├── firebase.ts     # Firebase configuration
│   ├── stripe.ts       # Stripe configuration
│   └── store.ts        # Zustand store
├── public/             # Static assets
│   ├── assets/
│   │   ├── cake_base.png
│   │   └── elements/
│   │       ├── floral/
│   │       ├── fantasy/
│   │       ├── wedding/
│   │       └── ...
├── utils/
│   ├── exportSVG.ts
│   ├── exportPNG.ts
│   └── saveDesign.ts
└── styles/
    └── globals.css (Tailwind)
```

---

## 💸 Monetization & Premium Features

### Token System
- Users buy tokens (e.g., 5 for $2.99, 10 for $5.49, etc.)
- Premium SVGs cost tokens to unlock
- Token bundles encourage upsell and reduce friction
- Gamification: daily login bonuses, achievements, streaks, challenges, referral rewards, mystery crates

### Premium SVG Unlock Flow
- Premium SVGs shown in sidebar with lock icon and price/token badge
- Locked SVGs can be previewed/placed on canvas but are ghosted/blurred/locked
- Clicking locked SVG triggers purchase modal (Stripe Checkout)
- After purchase, SVG is unlocked for user (tracked in Firebase)
- Only unlocked SVGs can be exported in final SVG

### Export & Security
- **SVG Export**: Always available for free assets; premium assets require unlock
- **Export formats**: SVG (primary), PNG (mockup), optional DXF/PDF
- **Watermark/lock overlays**: Unlocked assets export clean; locked assets export with watermark or are blocked
- **Canvas rendering**: All SVGs rendered on canvas, not as DOM SVGs, to deter theft
- **Right-click/devtools block**: Optional, deters casual copying
- **No file uploads**: All assets are from the curated library

---

## 🏷️ Naming & Branding

- **Brand**: Strongly recommended to use your established brand, e.g., "Owltopthat" (Owltopthat Studio, Owltopthat Designer, CakeCanvas by Owltopthat)
- **Alternative Names**: CakeCanvas, Topza, Cakely, Topply, TopMuse, TopperForge, CakeToppr, etc.
- **Domain & Trademark**: Always check for domain and trademark availability before finalizing
- **Branding Tips**: Short, memorable, and unique names work best; leverage your existing Etsy/shop brand for trust and SEO

---

## 🧩 Possible Added Features & Sidebar Ideas

- Boolean path operations (combine, subtract, intersect SVGs)
- Mirror/flip/rotate tools
- Exact size/position controls (inches/mm)
- Grid/snap settings (user control)
- Cut type preview (cut/score/engrave)
- Favorites (quick access to premium/free elements)
- Project info (title, size, estimated material)
- Marketplace/store tab for premium SVGs
- Layer management, alignment, and arrangement tools
- Save/export project as JSON for later editing

---

## 📤 Export & Order Flow

- **Digital Download**: Users can export SVG/PNG after unlocking premium assets
- **Physical Order**: Users can order a physical topper from Owltopthat; design and customer info sent to shop owner
- **Free download if premium assets are unlocked**; otherwise, charge tokens for export or block export
- **Watermark/lock overlays**: Prevents theft via screenshots or unpurchased exports

---

## 🔒 Security & Anti-Theft

- Canvas-based rendering (no DOM SVGs)
- Watermark/blur overlays for locked assets
- Disable right-click and basic devtools (optional)
- Token-gated export button
- Only unlocked assets export clean

---

## 🏷️ Naming & Branding (Summary)
- Use your existing brand (Owltopthat) for trust and SEO
- Trendy alternatives: CakeCanvas, Topza, Cakely, Topply, TopMuse, TopperForge, CakeToppr, etc.
- Always check domain/trademark before launch

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React community for the ecosystem
- All contributors who have helped shape this project
- Special thanks to the Owltopthat community and customers for inspiration

---

## 💡 Inspiration & Further Reading

- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Canva](https://www.canva.com/), [Figma](https://www.figma.com/), [Procreate](https://procreate.com/) for UI/UX inspiration

---

*This README was generated by merging all project documentation and feature planning files for a comprehensive overview.*

# Cake Topper Designer

A modern web application for designing custom cake toppers, built with Next.js, Firebase, and Stripe.

## Features

- 🎨 Interactive canvas design interface
- 🔒 User authentication and design saving
- 💳 Secure payment processing
- 👥 Admin panel for template management
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Canvas Manipulation**: Fabric.js & Konva
- **Authentication & Database**: Firebase
- **Payment Processing**: Stripe
- **Animation**: Framer Motion

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd cake-topper-designer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and Stripe credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Required environment variables:

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

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── designer/       # Designer page
│   └── admin/          # Admin panel
├── components/         # Reusable components
├── lib/               # Utility functions and configurations
│   ├── firebase.ts    # Firebase configuration
│   ├── stripe.ts      # Stripe configuration
│   └── store.ts       # Zustand store
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Next.js team for the amazing framework
- React community for the ecosystem
- All contributors who have helped shape this project

# Fun Prints - Premium T-Shirt E-Commerce Platform

A next-generation, production-ready e-commerce web application for custom t-shirt business with 360° product viewing, UPI payment integration, WhatsApp deep linking, and premium UI/UX.

## 🚀 Get Started

**New here?** → **[GETTING_STARTED.md](GETTING_STARTED.md)** - Choose your path

## 🎯 Quick Links

- **[Quick Start Guide](QUICKSTART.md)** - Get running in 10 minutes
- **[Production Hardening](PRODUCTION_HARDENING.md)** - Complete production checklist  
- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment
- **[Database Setup](lib/database-setup.md)** - Database configuration
- **[Testing Checklist](TESTING_CHECKLIST.md)** - Complete testing guide
- **[Project Summary](PROJECT_SUMMARY.md)** - Overview & features

## 🚀 Features

### Core Features
- ✅ **Responsive Design** - Works perfectly on Desktop, Android, iOS, MacBook, and Tablets
- ✅ **360° Product Viewer** - Interactive product rotation with zoom and gyroscope support
- ✅ **UPI Payment Integration** - Deep linking to Google Pay, PhonePe, Paytm with screenshot verification
- ✅ **Cash on Delivery** - Traditional COD payment option
- ✅ **Premium UI/UX** - Apple-like minimal design with smooth animations
- ✅ **SEO Optimized** - Server-side rendering, dynamic meta tags, schema markup
- ✅ **PWA Ready** - Installable as an app on mobile devices

### User Experience
- Animated hero section with smooth transitions
- Product cards with hover effects
- Size guide popup
- Wishlist functionality
- Shopping cart with real-time updates
- Multi-step checkout process
- Order tracking and confirmation

### Payment Flow (WhatsApp Deep Link - Zero Cost!)
1. User adds products to cart
2. Enters delivery information
3. Chooses payment method (COD or UPI)
4. For UPI: 
   - Opens payment app automatically (Google Pay/PhonePe/Paytm)
   - Completes payment
   - Clicks "Send Screenshot via WhatsApp"
   - WhatsApp opens with pre-filled message
   - User attaches screenshot and sends
5. Order placed with status "PAYMENT_PENDING" (UPI) or "CONFIRMED" (COD)
6. Admin receives screenshot on WhatsApp
7. Admin verifies payment and updates order status in admin panel

**Why WhatsApp Deep Link?**
- ✅ Zero cost (no WhatsApp Business API needed)
- ✅ No approval process
- ✅ Simple and reliable
- ✅ Perfect for Indian market
- ✅ Scales to medium volume

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** (App Router) - React framework with SSR
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Three.js / React Three Fiber** - 3D product viewing
- **GSAP** - Advanced animations
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **PostgreSQL / MySQL** - Database (to be configured)
- **Cloudinary** - Image and asset hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Steps

1. **Clone or navigate to the project directory**
```bash
cd fun-prints
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/funprints

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# UPI Configuration
NEXT_PUBLIC_UPI_ID=funprint@upi
NEXT_PUBLIC_UPI_NAME=Fun Prints

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Admin
ADMIN_SECRET=your_admin_secret_key
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
fun-prints/
├── app/
│   ├── api/              # API routes
│   │   ├── orders/       # Order management
│   │   └── payment/      # Payment verification
│   ├── products/         # Product pages
│   ├── checkout/         # Checkout flow
│   ├── cart/            # Shopping cart
│   ├── payment/         # Payment pages
│   ├── bulk-order/      # Bulk order enquiry
│   └── order-success/   # Order confirmation
├── components/
│   ├── home/            # Homepage components
│   ├── products/        # Product components
│   ├── checkout/        # Checkout components
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── store/               # State management
└── public/              # Static assets
```

## 🎨 Key Components

### 360° Product Viewer
- Drag to rotate product
- Zoom in/out functionality
- Mobile gyroscope support
- Smooth animations

### UPI Payment Flow
1. Auto-opens UPI apps (Google Pay, PhonePe, Paytm)
2. Pre-fills amount and merchant details
3. User completes payment
4. Uploads payment screenshot
5. Admin verifies and confirms order

### Cart & Checkout
- Add/remove items
- Update quantities
- Address form validation
- Payment method selection
- Order summary

## 🚀 Deployment

### Vercel (Recommended)

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy

### Environment Variables on Vercel
Add all variables from `.env` in Vercel dashboard under Settings → Environment Variables

## 📱 PWA Configuration

To enable PWA features, add `manifest.json` and service worker:

```json
// public/manifest.json
{
  "name": "Fun Prints",
  "short_name": "Fun Prints",
  "description": "Premium Custom T-Shirts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔧 Database Setup

### PostgreSQL Schema (Example)

```sql
-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending',
  screenshot_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  size VARCHAR(10),
  color VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL
);
```

## 📊 Performance Optimization

- **Image Optimization**: WebP/AVIF formats with lazy loading
- **Code Splitting**: Automatic with Next.js
- **SSR**: Server-side rendering for SEO
- **Caching**: Static generation where possible
- **Lighthouse Score Target**: 90+

## 🎯 SEO Features

- Dynamic meta tags per page
- Open Graph tags for social sharing
- Schema markup for products
- Sitemap generation
- Robots.txt configuration

## 📞 Support & Contact

For issues or questions:
- WhatsApp: +91 98765 43210
- Email: hello@funprints.com

## 📄 License

This project is proprietary and confidential.

## 🔮 Future Enhancements

- [ ] Admin dashboard for order management
- [ ] Real-time order tracking
- [ ] Email notifications
- [ ] WhatsApp order updates
- [ ] Product reviews and ratings
- [ ] Advanced customization tool
- [ ] Multiple payment gateways
- [ ] Inventory management
- [ ] Analytics dashboard

---

Built with ❤️ for Fun Prints

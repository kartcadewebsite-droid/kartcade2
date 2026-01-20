# AgencyStarter - Premium Web Design Agency Template

A modern, animated React template for web design agencies, digital studios, and creative professionals. Built with React 19, Vite, GSAP animations, and Lenis smooth scrolling.

![AgencyStarter Preview](./preview.png)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Features

- **Modern Tech Stack**: React 19, Vite 6, TypeScript
- **Premium Animations**: GSAP-powered smooth animations throughout
- **Smooth Scrolling**: Lenis smooth scroll for premium feel
- **Fully Responsive**: Mobile-first design, works on all devices
- **SEO Optimized**: Meta tags, structured data, sitemap included
- **8+ Pages**: Home, About, Services, Projects, Pricing, Contact, Express Launch
- **Niche Landing Pages**: Pre-built landing page templates for different industries
- **Dark & Light Themes**: Sections with both dark and light styling
- **Easy Customization**: Centralized config file for branding

## 📁 Project Structure

```
├── components/          # Reusable UI components
│   ├── home/           # Homepage-specific components
│   ├── ui/             # Generic UI components
│   ├── Navbar.tsx      # Main navigation
│   ├── Footer.tsx      # Site footer
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── services/       # Service detail pages
│   └── niche/          # Industry-specific landing pages
├── config/             # Configuration files
│   └── site.ts         # ⭐ Main brand configuration
├── data/               # Static data files
├── public/             # Static assets (images, fonts)
└── index.html          # Main HTML file
```

## ⚙️ Configuration

### Brand Customization

Edit `config/site.ts` to update your brand details:

```typescript
export const siteConfig = {
  name: "Your Agency Name",
  tagline: "Your Tagline",
  description: "Your agency description",
  
  // Contact
  email: "contact@yourdomain.com",
  phone: "+1 234 567 8900",
  whatsapp: "12345678900",
  
  // URLs
  siteUrl: "https://yourdomain.com",
};
```

### Logo & Favicon

Replace these files in `/public/`:
- `logo.png` - Main logo (recommended: 200x50px, transparent PNG)
- `favicon.png` - Browser favicon (recommended: 32x32px or 512x512px)

### Colors & Fonts

The template uses TailwindCSS. Customize in `index.html`:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#your-color',
        },
        fontFamily: {
          display: ['Your Font', 'sans-serif'],
        },
      },
    },
  }
</script>
```

### Contact Form Setup

The contact forms use a configurable endpoint. Update in these files:
- `pages/Contact.tsx` - Main contact form
- `pages/ExpressLaunchPage.tsx` - Express launch form

**Options:**
1. **Google Apps Script** (Free)
2. **Formspree** (formspree.io)
3. **EmailJS** (emailjs.com)
4. **Your own API endpoint**

## 📄 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main landing page with all sections |
| About | `/about` | Company story & values |
| Services | `/services` | Service offerings with scroll animations |
| Projects | `/projects` | Portfolio showcase |
| Pricing | `/pricing` | Pricing plans with FAQ |
| Contact | `/contact` | Contact form |
| Express Launch | `/express-launch` | Quick project submission |

## 🎨 Customization Guide

### Updating Content

1. **Homepage sections**: Edit components in `components/home/`
2. **Service descriptions**: Edit `pages/ServicesPage.tsx`
3. **Portfolio projects**: Edit `pages/Projects.tsx`
4. **Pricing plans**: Edit `pages/PricingPage.tsx`
5. **Testimonials**: Edit `components/Testimonials.tsx`

### Adding New Pages

1. Create component in `pages/` folder
2. Add route in `App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

### Modifying Animations

Animations use GSAP. Key files:
- `components/home/HeroSection.tsx` - Hero animations
- `pages/ServicesPage.tsx` - Scroll-triggered animations
- `pages/About.tsx` - Timeline animations

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Netlify

1. Build: `npm run build`
2. Publish directory: `dist`

### Traditional Hosting

1. Run `npm run build`
2. Upload contents of `dist/` folder to your server

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 6.x | Build tool |
| GSAP | 3.14 | Animations |
| Lenis | 1.3 | Smooth scrolling |
| React Router | 6.22 | Routing |
| Lucide React | 0.562 | Icons |
| TypeScript | 5.8 | Type safety |

## 🆘 Support

For questions and support:
- Email: [your-support-email]
- Documentation: [your-docs-url]

## 📄 License

This template is licensed for single use. Please review the license terms.

---

**Thank you for purchasing AgencyStarter!**

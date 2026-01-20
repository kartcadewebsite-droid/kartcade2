# Customization Guide

## 1. Brand Configuration

The main configuration file is `config/site.ts`. Update these values:

```typescript
export const siteConfig = {
  // Your brand name
  name: "Your Agency Name",
  tagline: "Your Tagline Here",
  description: "Your agency description for SEO.",
  
  // Contact Information
  email: "hello@youragency.com",
  phone: "+1 555 123 4567",
  whatsapp: "15551234567",  // Without + sign
  
  // Website URL
  siteUrl: "https://youragency.com",
  
  // Social Links
  social: {
    twitter: "https://twitter.com/youragency",
    linkedin: "https://linkedin.com/company/youragency",
    instagram: "https://instagram.com/youragency",
  },
};
```

## 2. Logo & Favicon

Replace these files in the `/public/` folder:

| File | Size | Purpose |
|------|------|---------|
| `logo.png` | 200x50px | Header logo |
| `favicon.png` | 512x512px | Browser icon |

**Tips:**
- Use transparent PNG for logo
- Keep logo under 50KB for fast loading

## 3. Colors & Typography

Edit `index.html` to change the Tailwind config:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          accent: '#3B82F6',  // Your accent color
        },
        fontFamily: {
          sans: ['Your Font', 'sans-serif'],
          display: ['Your Display Font', 'sans-serif'],
        },
      },
    },
  }
</script>
```

**Adding Google Fonts:**
1. Get embed code from fonts.google.com
2. Add to `<head>` in `index.html`
3. Update font family in tailwind config

## 4. Updating Content

### Homepage
Edit components in `components/home/`:
- `HeroSection.tsx` - Main hero area
- `ServicesShowcase.tsx` - Services grid
- `StatsSection.tsx` - Statistics
- `PortfolioGrid.tsx` - Work samples
- `TestimonialsSection.tsx` - Client reviews
- `FinalCTA.tsx` - Call to action

### Services Page
Edit `pages/ServicesPage.tsx`:
```typescript
const services = [
  {
    title: "Your Service",
    desc: "Service description here",
    features: ["Feature 1", "Feature 2"],
    image: "/images/your-image.jpg",
  },
  // Add more services...
];
```

### Projects/Portfolio
Edit `pages/Projects.tsx`:
```typescript
const projects = [
  {
    id: 1,
    title: "Project Name",
    category: "Web Design",
    image: "https://your-image-url.jpg",
    desc: "Project description",
    liveUrl: "https://project-url.com",
  },
  // Add more projects...
];
```

### Pricing
Edit `pages/PricingPage.tsx` to update:
- Pricing tiers
- Features list
- FAQ section

### About Page
Edit `pages/About.tsx`:
- Company story
- Timeline (horizontal scroll section)
- Values

## 5. Meta Tags & SEO

### Page Titles
Each page sets its own title in a `useEffect`:
```typescript
useEffect(() => {
  document.title = "Your Page Title | Your Brand";
}, []);
```

### Structured Data
Edit `index.html` JSON-LD sections:
- Organization schema
- Website schema
- ProfessionalService schema

### Sitemap
Update `public/sitemap.xml` with your domain.

## 6. Images

### Using Stock Images
Current images use Unsplash. Replace URLs in:
- `components/Hero.tsx`
- `pages/ServicesPage.tsx`
- `pages/Projects.tsx`

### Using Local Images
1. Add images to `/public/images/`
2. Reference as `/images/filename.jpg`

## 7. Navigation

Edit `components/Navbar.tsx` to add/remove links:
```typescript
const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Your New Page', path: '/new-page' },
  // ...
];
```

## 8. Footer

Edit `components/Footer.tsx` to update:
- Navigation links
- Contact info
- Copyright text

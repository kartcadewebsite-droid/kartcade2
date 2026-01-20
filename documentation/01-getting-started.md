# Getting Started

## Requirements

- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)
- **Code Editor**: VS Code recommended

## Installation

### Step 1: Extract Files

Extract the downloaded ZIP file to your desired location.

### Step 2: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (React, GSAP, etc.)

### Step 3: Start Development Server

```bash
npm run dev
```

Your site will be available at `http://localhost:5173`

### Step 4: Open in Browser

Visit the URL shown in terminal to see your template.

## File Overview

```
agencystarter/
├── components/       # UI components
├── pages/           # Page files
├── config/          # Configuration
├── public/          # Images, fonts
├── documentation/   # This folder
├── index.html       # Main HTML
├── App.tsx          # Routes
└── package.json     # Dependencies
```

## Next Steps

1. Update branding in `config/site.ts`
2. Replace logo files in `/public/`
3. Customize content in pages
4. See [Customization Guide](./02-customization.md)

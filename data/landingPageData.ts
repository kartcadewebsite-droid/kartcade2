// Landing Page Data Types and Configurations
// This file contains all the data for 25 niche/city landing pages

export interface FAQ {
    question: string;
    answer: string;
}

export interface Feature {
    number: string;
    title: string;
    desc: string;
}

export interface TrustPoint {
    text: string;
    image: string;
}

export interface PortfolioItem {
    name: string;
    result: string;
    image: string;
}

export interface SEOContent {
    block1: string;
    block2: string;
    block3: string;
}

export interface LandingPageConfig {
    // URL and routing
    slug: string;                    // "solar-companies-phoenix"

    // Location
    niche: string;                   // "solar"
    nicheLabel: string;              // "Solar Companies"
    nicheAdjective: string;          // "solar" (for phrases like "solar website")
    city: string;                    // "Phoenix"
    state: string;                   // "Arizona"
    stateShort: string;              // "AZ"
    nearbyCities: string[];          // ["Mesa", "Scottsdale", "Tempe", "Gilbert"]

    // Hero
    heroHeadline: string;
    heroSubheadline: string;

    // Problem Statement
    statementText: string;

    // SEO Content (3 blocks with character animation)
    seoContent: SEOContent;

    // SEO Meta
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalPath: string;

    // Features (6 items)
    features: Feature[];

    // FAQs (6 items)
    faqs: FAQ[];

    // Trust Points (6 items)
    trustPoints: TrustPoint[];

    // Portfolio (3 items)
    portfolio: PortfolioItem[];
}

// ===========================================
// SOLAR COMPANIES
// ===========================================

const solarFeatures: Feature[] = [
    { number: '01', title: 'Custom Solar Design', desc: 'Tailored website design that highlights your solar services and builds trust with homeowners.' },
    { number: '02', title: 'Mobile-First Build', desc: 'Optimized for smartphones where 70% of your potential customers are browsing.' },
    { number: '03', title: 'Lead Capture Forms', desc: 'Strategic contact forms designed to convert visitors into consultation requests.' },
    { number: '04', title: 'SEO Foundation', desc: 'Built with local SEO best practices to rank in your city\'s search results.' },
    { number: '05', title: 'Fast Loading Speed', desc: 'Optimized performance so visitors don\'t leave before seeing your offer.' },
    { number: '06', title: 'Hosting Included', desc: 'First year of reliable hosting included. No hidden fees.' },
];

const solarTrustPoints: TrustPoint[] = [
    { text: "50+ websites built for service businesses", image: "/illustrations/trust_websites_built_illustration.png" },
    { text: "4.9 average client rating", image: "/illustrations/trust_rating_v2_illustration.png" },
    { text: "100% satisfaction guarantee", image: "/illustrations/trust_guarantee_illustration.png" },
    { text: "Free preview before you pay", image: "/illustrations/trust_preview_illustration.png" },
    { text: "Delivered in 1 week, not months", image: "/illustrations/trust_fast_delivery_illustration.png" },
    { text: "Dedicated support after launch", image: "/illustrations/trust_support_v2_illustration.png" },
];

const solarFAQs = (city: string, state: string): FAQ[] => [
    {
        question: `How much does a website for a solar company in ${city} cost?`,
        answer: `Our solar company websites are a flat $799—no hidden fees. This includes custom design, mobile optimization, basic SEO, contact forms, and hosting for the first year. Traditional agencies charge $3,000-$10,000 for similar work.`
    },
    {
        question: "Do I need to pay before seeing my website?",
        answer: "No. We create a free preview of your website within 24 hours. You only pay if you love it. This zero-risk approach means you can see exactly what you're getting before committing."
    },
    {
        question: "How long does it take to build my solar website?",
        answer: "We deliver your complete website within 1 week of approval. Most clients have their site live within 5-7 business days. Traditional agencies take 6-8 weeks for the same work."
    },
    {
        question: `Will my website rank on Google in ${city}?`,
        answer: `Every website we build includes local SEO fundamentals—proper meta tags, fast loading speed, mobile optimization, and location-specific content. This gives you a strong foundation to rank in ${city} and surrounding ${state} areas.`
    },
    {
        question: "What if I want changes after the website is live?",
        answer: "We offer unlimited revisions during the design phase. After launch, we provide 30 days of free support for minor updates. Need ongoing changes? We offer affordable monthly maintenance plans."
    },
    {
        question: "Do you provide hosting and domain?",
        answer: "Hosting for the first year is included free. After that, it's just $15/month. For domains, we can help you purchase one (typically $12-15/year) or connect your existing domain."
    }
];

const solarSEOContent = (city: string, state: string, nearbyCities: string[]): SEOContent => ({
    block1: `${city} is one of the fastest-growing solar markets in the United States. With abundant sunshine year-round, 93% of ${state} homeowners start their solar buying journey with a Google search. Without a professional website, your solar company is invisible to these customers.`,
    block2: `Most solar companies in ${city} either don't have a website, or have outdated designs that don't convert. A modern solar company website should load fast, look professional on mobile, and be optimized for local SEO to appear in searches like "solar installation ${city}" or "best solar company in ${state}."`,
    block3: `Traditional agencies charge $3,000 to $10,000 with 6-8 week timelines. We deliver premium solar websites for $799 in one week. Free 24-hour preview before you pay. 50+ websites built across ${city}, ${nearbyCities.slice(0, 4).join(', ')}.`
});

// Generic Portfolio - Used across all niches
const genericPortfolio: PortfolioItem[] = [
    { name: 'Premium Website Design', result: '3x more leads', image: '/mockups/portfolio_mockup_1.png' },
    { name: 'Modern Business Site', result: 'Top 5 Google ranking', image: '/mockups/portfolio_mockup_2.png' },
    { name: 'Professional Web Presence', result: '200% traffic increase', image: '/mockups/portfolio_mockup_3.png' },
];

// ===========================================
// ROOFING COMPANIES
// ===========================================

const roofingFeatures: Feature[] = [
    { number: '01', title: 'Roofing-Focused Design', desc: 'Showcase your craftsmanship with before/after galleries and project portfolios.' },
    { number: '02', title: 'Mobile-First Build', desc: 'Homeowners searching for emergency roof repair are on their phones.' },
    { number: '03', title: 'Lead Capture Forms', desc: 'Get more estimate requests with strategically placed contact forms.' },
    { number: '04', title: 'SEO Foundation', desc: 'Rank for "roofing company near me" searches in your service area.' },
    { number: '05', title: 'Fast Loading Speed', desc: 'Don\'t lose impatient visitors to slow page loads.' },
    { number: '06', title: 'Hosting Included', desc: 'First year of reliable hosting included free.' },
];

const roofingFAQs = (city: string, state: string): FAQ[] => [
    {
        question: `How much does a website for a roofing company in ${city} cost?`,
        answer: `Our roofing company websites are a flat $799—no hidden fees. This includes custom design, mobile optimization, before/after galleries, contact forms, and hosting for the first year.`
    },
    {
        question: "Do I need to pay before seeing my website?",
        answer: "No. We create a free preview within 24 hours. You only pay if you love it."
    },
    {
        question: "How long does it take to build my roofing website?",
        answer: "We deliver your complete website within 1 week. Traditional agencies take 6-8 weeks."
    },
    {
        question: `Will my website rank on Google in ${city}?`,
        answer: `Every website includes local SEO setup—meta tags, speed optimization, and ${city}-specific content to help you rank in local searches.`
    },
    {
        question: "Can I show before/after photos of my roofing projects?",
        answer: "Absolutely! We include a gallery section specifically designed to showcase your best work with before/after comparisons."
    },
    {
        question: "Do you provide hosting and domain?",
        answer: "Hosting for the first year is included free. After that, it's $15/month. We can help with domain setup too."
    }
];

const roofingSEOContent = (city: string, state: string, nearbyCities: string[]): SEOContent => ({
    block1: `Homeowners in ${city} search for roofing companies online after storms, leaks, or when planning renovations. 87% of them choose a contractor from the first page of Google. Without a professional website, your roofing company is losing jobs to competitors who show up in search results.`,
    block2: `Most roofing companies in ${city} have outdated websites or none at all. A modern roofing website should showcase your work, load fast on mobile, and include clear calls-to-action for free estimates. Local SEO optimization helps you appear for "${city} roofing contractor" searches.`,
    block3: `Traditional agencies charge $3,000+ for a roofing website with 6-8 week timelines. We deliver premium roofing websites for $799 in one week. Free 24-hour preview before you pay. Serving ${city}, ${nearbyCities.slice(0, 4).join(', ')}.`
});

// Roofing uses generic portfolio

// ===========================================
// HVAC COMPANIES
// ===========================================

const hvacFeatures: Feature[] = [
    { number: '01', title: 'HVAC-Focused Design', desc: 'Highlight your services—AC repair, heating, maintenance—with clear navigation.' },
    { number: '02', title: 'Mobile-First Build', desc: 'Customers with broken AC need you NOW—on their phones.' },
    { number: '03', title: 'Lead Capture Forms', desc: 'Convert visitors into service calls with prominent contact forms.' },
    { number: '04', title: 'SEO Foundation', desc: 'Rank for emergency HVAC searches in your service area.' },
    { number: '05', title: 'Fast Loading Speed', desc: 'Speed matters when someone\'s house is freezing or boiling.' },
    { number: '06', title: 'Hosting Included', desc: 'First year of reliable hosting included free.' },
];

const hvacFAQs = (city: string, state: string): FAQ[] => [
    {
        question: `How much does a website for an HVAC company in ${city} cost?`,
        answer: `Our HVAC company websites are a flat $799—no hidden fees. Includes custom design, service pages, mobile optimization, and hosting for the first year.`
    },
    {
        question: "Do I need to pay before seeing my website?",
        answer: "No. Free 24-hour preview first. You only pay if you love it."
    },
    {
        question: "How long does it take to build my HVAC website?",
        answer: "1 week delivery. Traditional agencies take 6-8 weeks."
    },
    {
        question: `Will my website rank for emergency HVAC searches in ${city}?`,
        answer: `We build with local SEO fundamentals so you can rank for "${city} AC repair" and similar emergency searches.`
    },
    {
        question: "Can I list all my services separately?",
        answer: "Yes! We create dedicated sections for AC repair, heating, maintenance, and any other services you offer."
    },
    {
        question: "Do you provide hosting and domain?",
        answer: "Hosting for year one is included. $15/month after. We help with domain setup too."
    }
];

const hvacSEOContent = (city: string, state: string, nearbyCities: string[]): SEOContent => ({
    block1: `When AC breaks in ${city}'s heat or heating fails in winter, homeowners immediately search Google for help. 82% choose an HVAC company from page one results. Without a professional website, you're invisible during these high-intent searches.`,
    block2: `Most HVAC companies in ${city} rely on word-of-mouth alone. A modern HVAC website should list all services, load instantly on mobile, and make it dead easy to request service. Local SEO optimization means showing up for "${city} AC repair" and "${city} heating company" searches.`,
    block3: `Traditional agencies charge $3,000+ with month-long timelines. We deliver premium HVAC websites for $799 in one week. Free 24-hour preview before you pay. Serving ${city}, ${nearbyCities.slice(0, 4).join(', ')}.`
});

// HVAC uses generic portfolio

// ===========================================
// LAW FIRMS
// ===========================================

const lawFirmFeatures: Feature[] = [
    { number: '01', title: 'Professional Legal Design', desc: 'Convey trust and authority with a sophisticated, clean design.' },
    { number: '02', title: 'Mobile-First Build', desc: 'Clients researching attorneys do it on their phones.' },
    { number: '03', title: 'Lead Capture Forms', desc: 'Confidential contact forms for consultation requests.' },
    { number: '04', title: 'SEO Foundation', desc: 'Rank for practice area + city searches.' },
    { number: '05', title: 'Fast Loading Speed', desc: 'Professionals expect fast, polished experiences.' },
    { number: '06', title: 'Hosting Included', desc: 'First year of secure hosting included free.' },
];

const lawFirmFAQs = (city: string, state: string): FAQ[] => [
    {
        question: `How much does a website for a law firm in ${city} cost?`,
        answer: `Our law firm websites are a flat $799—no hidden fees. Includes professional design, practice area pages, contact forms, and hosting for the first year.`
    },
    {
        question: "Do I need to pay before seeing my website?",
        answer: "No. Free 24-hour preview first. You only pay if you approve it."
    },
    {
        question: "How long does it take to build my law firm website?",
        answer: "1 week delivery. Most legal web agencies take 6-8 weeks."
    },
    {
        question: `Will my website rank for law firm searches in ${city}?`,
        answer: `We build with local SEO fundamentals for practice area + city searches like "${city} personal injury lawyer."`,
    },
    {
        question: "Can I have separate pages for each practice area?",
        answer: "Absolutely. We create dedicated pages for each practice area—personal injury, family law, criminal defense, etc."
    },
    {
        question: "Is the hosting secure for confidential contact forms?",
        answer: "Yes. We use SSL encryption and secure hosting to protect client inquiries."
    }
];

const lawFirmSEOContent = (city: string, state: string, nearbyCities: string[]): SEOContent => ({
    block1: `People in ${city} searching for legal help start with Google. 96% of people seeking legal advice use a search engine. Without a professional website, your law firm is invisible to potential clients who need your expertise right now.`,
    block2: `Many law firms in ${city} have outdated websites that don't convey trust. A modern law firm website should look polished, load fast, clearly list practice areas, and make it easy to schedule consultations. Local SEO helps you rank for "${city} divorce attorney" or "${city} personal injury lawyer."`,
    block3: `Traditional legal marketing agencies charge $5,000+ with multi-month timelines. We deliver premium law firm websites for $799 in one week. Free 24-hour preview before you pay. Serving attorneys in ${city}, ${nearbyCities.slice(0, 4).join(', ')}.`
});

// Law firms use generic portfolio

// ===========================================
// REAL ESTATE AGENTS
// ===========================================

const realEstateFeatures: Feature[] = [
    { number: '01', title: 'Realtor-Focused Design', desc: 'Showcase your listings, testimonials, and local expertise beautifully.' },
    { number: '02', title: 'Mobile-First Build', desc: 'Home buyers browse listings on their phones while touring neighborhoods.' },
    { number: '03', title: 'Lead Capture Forms', desc: 'Capture buyer and seller leads with smart contact forms.' },
    { number: '04', title: 'SEO Foundation', desc: 'Rank for neighborhood and city real estate searches.' },
    { number: '05', title: 'Fast Loading Speed', desc: 'Fast loading for quick browsing between showings.' },
    { number: '06', title: 'Hosting Included', desc: 'First year of reliable hosting included free.' },
];

const realEstateFAQs = (city: string, state: string): FAQ[] => [
    {
        question: `How much does a website for a realtor in ${city} cost?`,
        answer: `Our real estate agent websites are a flat $799—no hidden fees. Includes professional design, listing showcase, testimonials, and hosting for the first year.`
    },
    {
        question: "Do I need to pay before seeing my website?",
        answer: "No. Free 24-hour preview first. You only pay if you love it."
    },
    {
        question: "How long does it take to build my real estate website?",
        answer: "1 week delivery. Traditional agencies take 6-8 weeks."
    },
    {
        question: `Will my website rank for real estate searches in ${city}?`,
        answer: `We build with local SEO for searches like "${city} realtor" and "${city} homes for sale."`,
    },
    {
        question: "Can I showcase my current listings?",
        answer: "Yes! We create a listings section that you can easily update, or integrate with your MLS feed."
    },
    {
        question: "Do you include a testimonials section?",
        answer: "Absolutely. Client testimonials and reviews are prominently featured to build trust with potential clients."
    }
];

const realEstateSEOContent = (city: string, state: string, nearbyCities: string[]): SEOContent => ({
    block1: `Home buyers and sellers in ${city} start their search online. 97% of buyers use the internet to search for homes. Without a professional website, you're relying solely on Zillow and Realtor.com—where you're just one of hundreds of agents.`,
    block2: `Most realtors in ${city} don't have personal websites, or have generic brokerage templates. A modern real estate website should showcase your listings, highlight client testimonials, and position you as the local expert. SEO helps you rank for "${city} real estate agent" searches.`,
    block3: `Traditional agencies charge $2,000+ for realtor websites. We deliver premium real estate websites for $799 in one week. Free 24-hour preview before you pay. Helping agents in ${city}, ${nearbyCities.slice(0, 4).join(', ')}.`
});

// Real estate uses generic portfolio

// ===========================================
// CITY DATA
// ===========================================

interface CityData {
    name: string;
    state: string;
    stateShort: string;
    nearbyCities: string[];
}

const cities: Record<string, CityData> = {
    phoenix: {
        name: 'Phoenix',
        state: 'Arizona',
        stateShort: 'AZ',
        nearbyCities: ['Mesa', 'Scottsdale', 'Tempe', 'Gilbert', 'Chandler']
    },
    austin: {
        name: 'Austin',
        state: 'Texas',
        stateShort: 'TX',
        nearbyCities: ['Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'San Marcos']
    },
    denver: {
        name: 'Denver',
        state: 'Colorado',
        stateShort: 'CO',
        nearbyCities: ['Aurora', 'Lakewood', 'Thornton', 'Arvada', 'Boulder']
    },
    miami: {
        name: 'Miami',
        state: 'Florida',
        stateShort: 'FL',
        nearbyCities: ['Fort Lauderdale', 'Hollywood', 'Hialeah', 'Coral Gables', 'Miami Beach']
    },
    'san-diego': {
        name: 'San Diego',
        state: 'California',
        stateShort: 'CA',
        nearbyCities: ['Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon']
    }
};

// ===========================================
// GENERATE CONFIGS
// ===========================================

type NicheType = 'solar' | 'roofing' | 'hvac' | 'law-firms' | 'real-estate';

const nicheData: Record<NicheType, {
    label: string;
    adjective: string;
    features: Feature[];
    trustPoints: TrustPoint[];
    portfolio: PortfolioItem[];
    getFAQs: (city: string, state: string) => FAQ[];
    getSEOContent: (city: string, state: string, nearbyCities: string[]) => SEOContent;
}> = {
    'solar': {
        label: 'Solar Companies',
        adjective: 'solar',
        features: solarFeatures,
        trustPoints: solarTrustPoints,
        portfolio: genericPortfolio,
        getFAQs: solarFAQs,
        getSEOContent: solarSEOContent,
    },
    'roofing': {
        label: 'Roofing Companies',
        adjective: 'roofing',
        features: roofingFeatures,
        trustPoints: solarTrustPoints,
        portfolio: genericPortfolio,
        getFAQs: roofingFAQs,
        getSEOContent: roofingSEOContent,
    },
    'hvac': {
        label: 'HVAC Companies',
        adjective: 'HVAC',
        features: hvacFeatures,
        trustPoints: solarTrustPoints,
        portfolio: genericPortfolio,
        getFAQs: hvacFAQs,
        getSEOContent: hvacSEOContent,
    },
    'law-firms': {
        label: 'Law Firms',
        adjective: 'legal',
        features: lawFirmFeatures,
        trustPoints: solarTrustPoints,
        portfolio: genericPortfolio,
        getFAQs: lawFirmFAQs,
        getSEOContent: lawFirmSEOContent,
    },
    'real-estate': {
        label: 'Real Estate Agents',
        adjective: 'real estate',
        features: realEstateFeatures,
        trustPoints: solarTrustPoints,
        portfolio: genericPortfolio,
        getFAQs: realEstateFAQs,
        getSEOContent: realEstateSEOContent,
    },
};

export function generateLandingPageConfig(niche: NicheType, cityKey: string): LandingPageConfig {
    const nicheInfo = nicheData[niche];
    const cityInfo = cities[cityKey];

    const slug = `${niche}-${cityKey}`;
    const seoContent = nicheInfo.getSEOContent(cityInfo.name, cityInfo.state, cityInfo.nearbyCities);

    return {
        slug,
        niche,
        nicheLabel: nicheInfo.label,
        nicheAdjective: nicheInfo.adjective,
        city: cityInfo.name,
        state: cityInfo.state,
        stateShort: cityInfo.stateShort,
        nearbyCities: cityInfo.nearbyCities,

        heroHeadline: `${nicheInfo.label} in ${cityInfo.name} deserve a website that works`,
        heroSubheadline: `Get a premium ${nicheInfo.adjective} website in 1 week. $799 flat rate. Free preview in 24 hours.`,

        statementText: `Without a professional website, you're losing customers to competitors every single day.`,

        seoContent,

        metaTitle: `${nicheInfo.label.slice(0, -1)} Website Design ${cityInfo.name} | Free 24hr Preview`,
        metaDescription: `Professional website design for ${nicheInfo.label.toLowerCase()} in ${cityInfo.name}. $799 flat rate. Free 24-hour preview before you pay. Rank on Google & get more customers.`,
        keywords: [
            `${nicheInfo.adjective} company website ${cityInfo.name.toLowerCase()}`,
            `web design ${nicheInfo.label.toLowerCase()}`,
            `${nicheInfo.adjective} website design ${cityInfo.state.toLowerCase()}`,
            `${nicheInfo.adjective} company website cost`,
            `${cityInfo.name.toLowerCase()} ${nicheInfo.adjective} web design`
        ],
        canonicalPath: `/for/${slug}`,

        features: nicheInfo.features,
        faqs: nicheInfo.getFAQs(cityInfo.name, cityInfo.state),
        trustPoints: nicheInfo.trustPoints,
        portfolio: nicheInfo.portfolio,
    };
}

// Pre-generated configs for all 25 pages
export const landingPageConfigs: Record<string, LandingPageConfig> = {};

const niches: NicheType[] = ['solar', 'roofing', 'hvac', 'law-firms', 'real-estate'];
const cityKeys = ['phoenix', 'austin', 'denver', 'miami', 'san-diego'];

niches.forEach(niche => {
    cityKeys.forEach(cityKey => {
        const config = generateLandingPageConfig(niche, cityKey);
        landingPageConfigs[config.slug] = config;
    });
});

// Export individual configs for easy access
export const solarPhoenix = landingPageConfigs['solar-phoenix'];
export const solarAustin = landingPageConfigs['solar-austin'];
export const solarDenver = landingPageConfigs['solar-denver'];
export const solarMiami = landingPageConfigs['solar-miami'];
export const solarSanDiego = landingPageConfigs['solar-san-diego'];

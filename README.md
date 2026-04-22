#Features:
**## 🔐 1. Authentication & Security**
Google Sign-In: Secure one-click authentication powered by Firebase.
Custom Domain Support: Configured for Vercel deployment (e.g., lance.mcjs.ca).

**🤖 2. AI Coach & Gig Sourcer (Chat)**
Elite Gig Sourcer Persona: A specialized AI agent designed to hunt down high-paying freelance contracts and clients.
Live Web Searching: Uses Google Search behind the scenes to scrape broad job boards (Upwork), niche boards (GitHub Jobs), company career pages, and organic social signals (Reddit/LinkedIn).
Structured Outputs: Automatically formats job leads into a clean, scannable Markdown table (Role, Company, Rate, Date Posted, Direct Link, Key Requirements).
"High Thinking" Mode: A toggle that upgrades the underlying AI model (to Gemini 3.1 Pro) for deep analytical vetting, scam-filtering, and complex multi-layered searches.

**💼 3. Portfolio Builder**
AI Case Study Generation: Turns brief project descriptions into persuasive, data-driven case studies formatted with Challenges, Solutions, and concrete Results.
External Linking: Attach live URLs, GitHub repos, or Figma links directly to case studies.
Author's Elaboration: Dedicated "behind-the-scenes" note sections for the author to add personal context or insights, cleanly separated from the AI copy.
Performance Analytics: Tracks and displays Views, Link Clicks, and dynamic Click-Through Rates (CTR) for each case study.
Community Discussion: A threaded comment section on every case study where users can ask questions. Includes character limits, automatic whitespace trimming, and a profanity/spam word filter.

**🎨 4. Branding Studio**
Multi-Format Asset Generation: Generate social media posts, profile pictures, banners, AI-animated videos (from uploaded images), and professional color palettes.
Palette Extraction: Upload an inspiration photo or provide a text prompt to generate a 5-color hex palette, complete with AI-generated design usage tips."
Active Palette Enforcement: Set a generated palette as "Active" to inform the brand consistency of future asset generations.
Project Organization: Tag assets with specific "Project Names" and custom #hashtags during generation.
Smart Dashboard Repository: A powerful search and filter system to query your generated assets by prompt text, AI captions, asset type, tags, or specific project names.
In-App Image Editing: Users can interact with image assets to directly manipulate or regenerate them.

**📄 5. Profile Optimizer**
Platform-Specific Generation: Generates optimized, high-conversion freelancer profiles tailored perfectly for specific platforms (e.g., Upwork, Fiverr).
**Monetization Focused:**Crafts headlines, bios, skill arrays, and pricing strategies specifically tailored to attract high-ticket clients based on your input skills.

**🌐 6. Global UI / UX**
Cyber-Aesthetic Design: Modern, dark-themed UI featuring glassmorphism, cyan neon glows, pulse animations, and animated hover states.
Toast Notifications: A sleek pop-up notification system to alert users of successes, validation errors, and system warnings.
Drag-and-Drop Dropzones: Seamless file-upload handling for images and video generation tools across the platform."
# Run and deploy your AI Studio app

## This contains *everything* you need to run LANCE locally:

---

### Run Locally:
**Prerequisites:** 
- Node.js
- Google Account
- Microphone & Audio device for live Career Coach feature
  
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

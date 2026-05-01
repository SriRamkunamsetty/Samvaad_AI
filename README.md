# Samvaad AI

**AI That Understands People Before Selling To Them.**

Samvaad AI is a production-grade, AI-native B2B sales relationship intelligence platform. Instead of generating generic spam templates, Samvaad AI uses deep psychology, emotional intent analysis, and cognitive persuasion science to craft hyper-personalized outreach that resonates with human buyers.

![Samvaad AI Demo](https://images.unsplash.com/photo-1620912189868-30769d7a2292?auto=format&fit=crop&q=80&w=1200)

---

## 🎯 The Problem
Modern cold outreach is broken. Sales reps send thousands of generic, robotic templates that get ignored because they fail to understand the core psychology, personality, and emotional drivers of the buyer. Spam filters catch them, and relationships are never built.

## ✨ The Solution: Samvaad AI
We built a deterministic AI pipeline using Google's **Gemini AI** to decode prospect psychology. Samvaad AI analyzes LinkedIn profiles, company data, and recent signals to output:
1. **Prospect Intelligence:** DISC personality types, communication styles, and hidden pain points.
2. **Adaptive Outreach:** Tailored cold emails/DMs with full Explainable AI reasoning behind every generated sentence.
3. **Response Analyzer:** Read sentiment, objection risks, and intent from prospect replies.
4. **Follow-Up Engine:** Generates hyper-contextual next steps. 

---

## 🏗 Architecture & Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS (Premium Dark Glassmorphism UI)
- Framer Motion / CSS Animations
- Lucide Icons
- React Router DOM

**Backend / AI Services:**
- Express.js Node API
- `@google/genai` (Gemini 3.1 Pro / Flash for streaming logic)
- RESTful JSON APIs for agent isolation

**Database & Auth:**
- Firebase Authentication (Google OAuth + Email/Password)
- Cloud Firestore (Fully secured via granular Rules)

---

## 🔒 Security & Optimization

* **Hardened Firestore Rules:** All database operations are restricted via `isValidId()`, `hasOnly()`, and schema validations.
* **Backend Model Proxies:** Gemini API keys are *never* leaked to the frontend. All AI logic runs securely behind `/api/*` Express endpoints.
* **Streaming AI:** Real-time generation of outreach copy for instant UX feedback.
* **WCAG Accessibility:** ARIA live regions, semantic HTML, and `reduceMotion` user preferences.

---

## 🚀 Setup & Execution

### 1. Prerequisites
- Node.js v18+
- A Google Gemini API Key (`GEMINI_API_KEY`)
- A Firebase Web project

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Ensure your `firebase-applet-config.json` is properly populated with your Firebase Web configuration if testing locally.

### 3. Install & Run
```bash
npm install
npm run dev
```
The server will boot up the Express API securely and proxy Vite for the frontend.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔑 Firebase Authentication Configuration

To enable Google Auth:
1. Go to your Firebase Console -> **Authentication** -> **Sign-in method**.
2. Enable **Email/Password** and **Google**.
3. Under **Google** settings, add the following authorized domains (or your custom host URLs):
   - `ais-dev-k7j2v5ualqidsrwjr4pfwh-809808179192.asia-southeast1.run.app`
   - `ais-pre-k7j2v5ualqidsrwjr4pfwh-809808179192.asia-southeast1.run.app`
4. *(If deploying as a standalone app with Android/iOS linking later via Firebase, generate a SHA-1 from your keystore using `keytool -list -v -keystore ~/.android/debug.keystore` and add it to the Project Settings).*

---

## 🔮 Future Scope
- **CRM Integrations:** Two-way sync with Salesforce & HubSpot.
- **Chrome Extension:** Live analysis directly over LinkedIn profiles.
- **Voice Synthesis:** AI-powered cold-calling scripts tailored to real-time buyer objections.

---

> Built for the future of relationship-first sales. Waitless, secure, and production-ready.

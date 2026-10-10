# Cloudflare Pages এ ওয়েবসাইট ডিপ্লয় করার সম্পূর্ণ গাইডলাইন

আপনার ওয়েবসাইটটি সম্পূর্ণ **Vite + React SPA** আর্কিটেকচারে তৈরি এবং ক্লাউডফ্লেয়ার পেজেস (Cloudflare Pages)-এর জন্য সম্পূর্ণভাবে সমাধান ও অপ্টিমাইজ করা হয়েছে।

---

## বিল্ড ফেইল হওয়ার কারণ ও সমাধান (Fix Summary):
- **সমস্যার কারণ**: প্রজেক্টে একটি `bun.lock` ফাইল ছিল যার ফরম্যাট ছিল `lockfileVersion: 2`। কিন্তু Cloudflare Pages-এ Bun-এর পুরনো ভার্সন (v1.2.15) থাকার কারণে সেটি `bun install` চালাতে গিয়ে `UnknownLockfileVersion: failed to parse lockfile` এরর দিচ্ছিল।
- **সমাধান**: 
  1. ক্ষতিকর `bun.lock` ফাইলটি সম্পূর্ণ মুছে ফেলা হয়েছে।
  2. স্ট্যান্ডার্ড ও ত্রুটিমুক্ত `package-lock.json` জেনারেট করা হয়েছে, যাতে Cloudflare এখন ডিফল্টভাবে নিরাপদ **Node.js + npm (`npm ci` / `npm install`)** ব্যবহার করে।
  3. `package.json` থেকে অপ্রয়োজনীয় কনফ্লিক্টিং `esbuild` ডিপেনডেন্সি সরিয়ে ফেলা হয়েছে।
  4. `.gitignore`-এ `bun.lock*` যোগ করা হয়েছে যেন এটি আর ভুল করে পুশ না হয়।
  5. `public/_redirects` ফাইল যুক্ত রয়েছে, যার ফলে `/admin`, `/checkout`, `/track` সহ যেকোনো লিংকে গেলে 404 হবে না।

---

## এখন কী করতে হবে (Deploy Steps):

### আপনি যদি GitHub কানেক্ট করে ডিপ্লয় করে থাকেন:
1. কোড গিটহাবে পুশ করুন (Push changes to GitHub)।
2. Cloudflare Pages স্বয়ংক্রিয়ভাবে নতুন কমিট পেয়ে বিল্ড শুরু করবে, অথবা Cloudflare Dashboard-এ গিয়ে **Retry deployment** বাটনে ক্লিক করুন।
3. **Build settings** চেক করুন:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: খালি (বা `/`)
4. **Environment variables (Settings > Environment variables)**:
   - `NODE_VERSION`: `20`
   - `VITE_SUPABASE_URL`: `https://iuvgammnubrarjyenbxi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_497tjJOz_L9950HFlJZ4DQ_VBn9b6yV`

---

### আপনি যদি সরাসরি ডিরেক্ট ফাইল আপলোড (Direct Upload) করতে চান:
1. আপনার লোকাল কম্পিউটারে রান করুন:
   ```bash
   npm run build
   ```
2. তৈরি হওয়া **`dist`** ফোল্ডারটি Cloudflare Dashboard-এ (Workers & Pages > Create application > Pages > Upload assets) ড্র্যাগ করে ছেড়ে দিন এবং **Deploy site** এ ক্লিক করুন!

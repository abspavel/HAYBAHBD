# Cloudflare Pages এ ওয়েবসাইট ডিপ্লয় করার সম্পূর্ণ গাইডলাইন

আপনার ওয়েবসাইটটি সম্পূর্ণ **Vite + React SPA** আর্কিটেকচারে তৈরি এবং ক্লাউডফ্লেয়ার পেজেস (Cloudflare Pages / Workers)-এর জন্য শতভাগ ত্রুটিমুক্ত ও অপ্টিমাইজ করা হয়েছে।

---

## বিল্ড এবং ডিপ্লয় ফেইল হওয়ার কারণ ও সমাধান (Fix Summary):

1. **`Infinite loop detected in this rule` এরর ফিক্স**:
   - **কারণ**: Cloudflare Pages / Wrangler-এ `_redirects` ফাইলে `/* /index.html 200` দেওয়া থাকলে Cloudflare-এর রাউটার প্রতিটি পেজকে বারবার রিরাইট করে ইনফিনিট লুপ তৈরি করে এবং ডিপ্লয়মেন্ট আটকে দেয়।
   - **সমাধান**: 
     - কনফ্লিক্ট সৃষ্টিকারী `_redirects` ফাইলটি পুরোপুরি মুছে ফেলা হয়েছে।
     - প্রজেক্টে স্ট্যান্ডার্ড `wrangler.jsonc` ফাইল যুক্ত করা হয়েছে, যার মধ্যে `"not_found_handling": "single-page-application"` কনফিগার করা রয়েছে। এটি ক্লাউডফ্লেয়ারের নিজস্ব নিরাপদ উপায়ে যেকোনো সাবপেজে (যেমন: `/admin`, `/checkout`, `/cart`) 404 হওয়া থেকে রক্ষা করে এবং কোনো ইনফিনিট লুপ তৈরি করে না।

2. **`EBADENGINE` Node.js ভার্সন ওয়ার্নিং ফিক্স**:
   - **কারণ**: `@supabase/supabase-js` এর নতুন ভার্সন চালানোর জন্য Node.js `>=22.0.0` প্রয়োজন। আগের `.nvmrc` ফাইলে Node 20 থাকায় ওয়ার্নিং আসছিল।
   - **সমাধান**: `.nvmrc` এবং `.node-version` ফাইলে নোড ভার্সন `22` করে দেওয়া হয়েছে।

3. **`Vite config __dirname` ওয়ার্নিং ফিক্স**:
   - `vite.config.ts`-এ আধুনিক `import.meta.dirname` ব্যবহার করা হয়েছে যাতে কোনো deprecation ওয়ার্নিং না আসে।

4. **Wrangler কনফিগারেশন যোগ**:
   - `wrangler.jsonc` সরাসরি যুক্ত করে দেওয়া হয়েছে, ফলে ডিপ্লয়ের সময় Wrangler কোনো প্রশ্ন বা প্রম্পট ছাড়াই স্মুথলি ডিপ্লয় করবে।

---

## ডিপ্লয় করার সহজ ধাপসমূহ:

### বিকল্প ১: GitHub কানেক্ট করা থাকলে (স্বয়ংক্রিয় ডিপ্লয়)
1. গিটহাবে এই নতুন পরিবর্তনগুলো পুশ (Push) করুন।
2. Cloudflare Pages অটোমেটিক নতুন কোড নিয়ে বিল্ড ও ডিপ্লয় করে দেবে।
3. **Cloudflare Dashboard Settings চেক করুন**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Deploy command** (যদি থাকে): খালি রাখুন অথবা `npx wrangler deploy`
4. **Environment variables (Settings > Environment variables)**:
   - `NODE_VERSION`: `22`
   - `VITE_SUPABASE_URL`: `https://iuvgammnubrarjyenbxi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_497tjJOz_L9950HFlJZ4DQ_VBn9b6yV`

---

### বিকল্প ২: সরাসরি ড্র্যাগ অ্যান্ড ড্রপ (Direct Upload - সবচেয়ে দ্রুত ও সহজ)
কোনো গিটহাব বা জটিল কনফিগারেশন ছাড়াই ১ মিনিটে লাইভ করতে:
1. টার্মিনালে রান করুন:
   ```bash
   npm run build
   ```
2. প্রজেক্টের ভেতর তৈরি হওয়া **`dist`** ফোল্ডারটি Cloudflare Dashboard-এ যান:
   - **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** > **Upload assets**
   - **`dist`** ফোল্ডারটি টেনে ছেড়ে দিন (Drag and Drop)
   - **Deploy site** বাটনে ক্লিক করুন!
   - সাইট সাথে সাথে ১০০% লাইভ হয়ে যাবে!

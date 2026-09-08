import blogThumbnail from "@/assets/blog-kaamsaathi-features.jpg";

export type BlogLanguage = "en" | "hi" | "hinglish";

export interface BlogSection {
  id: string;
  heading: string;
  html: string;
}

export interface BlogFAQ {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  language: BlogLanguage;
  keywords: string;
  image: string;
  intro: string;
  sections: BlogSection[];
  faqs: BlogFAQ[];
}

export const BLOG_CATEGORIES = [
  "Labour Management",
  "Contractor Tips",
  "Construction Site Management",
  "Worker Attendance",
  "Daily Wage Management",
  "Construction Technology",
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "kaamsaathi-app-features-daily-wage-worker-attendance",
    title:
      "KaamSaathi App Features: The Ultimate Daily Wage Worker Attendance & Payment Management Solution",
    excerpt:
      "Discover how KaamSaathi simplifies daily wage worker attendance tracking, payment management, and reporting for contractors and site managers across India.",
    description:
      "Discover how KaamSaathi simplifies daily wage worker attendance tracking, payment management, and reporting for contractors and site managers across India. Free attendance app for construction workers.",
    date: "2025-07-10",
    readTime: "8 min read",
    category: "Worker Attendance",
    language: "en",
    keywords:
      "daily wage worker attendance app, worker attendance tracker, construction worker attendance, labour attendance app India, KaamSaathi app, mazdoor attendance app",
    image: blogThumbnail,
    intro:
      "Managing daily wage workers on construction sites in India has always been a challenge. From tracking attendance to calculating payments, contractors often rely on paper registers that are error-prone and time-consuming. <strong>KaamSaathi</strong> is a lightweight Android app built to solve these problems.",
    sections: [
      {
        id: "what-is-kaamsaathi",
        heading: "What is KaamSaathi?",
        html: `<p>KaamSaathi (meaning "work companion" in Hindi) is a free-to-start mobile application for Indian contractors, site supervisors, and small business owners who manage daily wage workers. The app replaces manual registers with a digital system that tracks <strong>daily wage worker attendance</strong>, calculates payments, and generates reports — all from your smartphone.</p>`,
      },
      {
        id: "key-features",
        heading: "Key Features of KaamSaathi App",
        html: `<ul><li><strong>One-tap attendance</strong> — full-day, half-day, overtime support</li><li><strong>Payment tracking</strong> — wages, advances, dues auto-calculated</li><li><strong>Detailed reports</strong> — daily, weekly, monthly PDF exports</li><li><strong>Multi-site management</strong> from a single dashboard</li><li><strong>Works offline</strong> — sync when connected</li><li><strong>Hindi &amp; English</strong> support</li></ul>`,
      },
      {
        id: "how-it-works",
        heading: "How KaamSaathi Works: Step-by-Step",
        html: `<ol><li><strong>Download &amp; Sign Up</strong> — install from Google Play in under a minute.</li><li><strong>Create Your Site</strong> — add project location and details.</li><li><strong>Add Workers</strong> — enter names, daily wage rates, contact details.</li><li><strong>Mark Attendance</strong> — tap present, half-day, or absent each day.</li><li><strong>Track Payments</strong> — record advances, view dues automatically.</li><li><strong>Export Reports</strong> — share PDFs anytime.</li></ol>`,
      },
      {
        id: "who-should-use",
        heading: "Who Should Use KaamSaathi?",
        html: `<p>Construction contractors, site supervisors, labour suppliers, farm owners, interior renovation contractors, and any small business that pays workers daily. Learn more on our <a href="/labour-management-app">labour management app page</a> and <a href="/contractor-attendance-app">contractor attendance app page</a>.</p>`,
      },
      {
        id: "pricing",
        heading: "Pricing Plans",
        html: `<p>Start free with up to 5 workers for your first month. <strong>Starter ₹249/month</strong> (25 workers), <strong>Standard ₹549/month</strong> (100 workers, priority support). Custom plans for enterprises.</p>`,
      },
    ],
    faqs: [
      {
        q: "Is KaamSaathi free to use?",
        a: "Yes! You can start with the Free plan that supports up to 5 workers for your first month. Upgrade anytime as your team grows.",
      },
      {
        q: "Does KaamSaathi work without internet?",
        a: "Yes, you can mark daily wage worker attendance offline. Data syncs automatically when you're back online.",
      },
      {
        q: "Is my data safe on KaamSaathi?",
        a: "Absolutely. All data is encrypted and backed up to the cloud. Your worker records are always secure and accessible.",
      },
    ],
  },
  {
    slug: "mazdoor-hajri-app-kaise-istemal-karein",
    title: "मज़दूर हाज़िरी ऐप कैसे इस्तेमाल करें — पूरी गाइड हिंदी में",
    excerpt:
      "कंस्ट्रक्शन साइट पर मज़दूरों की हाज़िरी मोबाइल से कैसे लगाएं? KaamSaathi ऐप की पूरी हिंदी गाइड ठेकेदारों और सुपरवाइज़र के लिए।",
    description:
      "मज़दूर हाज़िरी ऐप KaamSaathi की पूरी हिंदी गाइड — हाज़िरी, पेमेंट, रिपोर्ट और साइट मैनेजमेंट कैसे करें।",
    date: "2025-08-02",
    readTime: "7 min read",
    category: "Daily Wage Management",
    language: "hi",
    keywords:
      "मज़दूर हाज़िरी ऐप, मजदूर हाजरी, ठेकेदार ऐप, labour attendance Hindi, construction attendance Hindi, KaamSaathi Hindi guide",
    image: blogThumbnail,
    intro:
      "अगर आप ठेकेदार, बिल्डर या साइट सुपरवाइज़र हैं और रोज़ कागज़ के रजिस्टर पर मज़दूरों की हाज़िरी लगाते हैं, तो <strong>KaamSaathi मज़दूर हाज़िरी ऐप</strong> आपके लिए बना है। ये ऐप मोबाइल पर बहुत आसान है और हिंदी में काम करता है।",
    sections: [
      {
        id: "kya-hai-kaamsaathi",
        heading: "KaamSaathi क्या है?",
        html: `<p>KaamSaathi एक मोबाइल ऐप है जिससे आप <strong>दिहाड़ी मज़दूरों की हाज़िरी, पेमेंट और एडवांस</strong> मोबाइल पर ही मैनेज कर सकते हैं। इसे ठेकेदारों, बिल्डरों और लेबर सप्लायर के लिए बनाया गया है।</p>`,
      },
      {
        id: "hajri-kaise-lagayen",
        heading: "हाज़िरी कैसे लगाएं?",
        html: `<ol><li>ऐप खोलें और अपनी साइट चुनें</li><li>हर मज़दूर के नाम के सामने <strong>Present, Half Day या Absent</strong> टैप करें</li><li>ओवरटाइम हो तो ओवरटाइम घंटे भी डाल दें</li><li>एक टैप में पूरी हाज़िरी सेव हो जाती है</li></ol>`,
      },
      {
        id: "payment-aur-advance",
        heading: "पेमेंट और एडवांस कैसे ट्रैक करें?",
        html: `<p>हर मज़दूर का <strong>दैनिक रेट</strong> सेट करें। ऐप अपने आप हाज़िरी के हिसाब से <strong>कुल कमाई और बकाया</strong> निकाल देगा। एडवांस दें तो उसे भी रिकॉर्ड करें — हिसाब हमेशा सही रहेगा।</p>`,
      },
      {
        id: "report-export",
        heading: "रिपोर्ट कैसे निकालें?",
        html: `<p>महीने के अंत में <strong>PDF रिपोर्ट</strong> एक टैप में बन जाती है। इसे WhatsApp पर मालिक या क्लाइंट को भेज सकते हैं। और जानकारी के लिए <a href="/mazdoor-hajri-app">मज़दूर हाज़िरी ऐप पेज</a> देखें।</p>`,
      },
      {
        id: "offline-feature",
        heading: "बिना इंटरनेट भी काम करता है",
        html: `<p>साइट पर नेटवर्क न हो तो भी हाज़िरी लगा सकते हैं। जब इंटरनेट आएगा, डेटा अपने आप क्लाउड पर सेव हो जाएगा।</p>`,
      },
    ],
    faqs: [
      {
        q: "क्या KaamSaathi हिंदी में है?",
        a: "हाँ, KaamSaathi पूरी तरह हिंदी और अंग्रेज़ी दोनों में चलता है।",
      },
      {
        q: "क्या ये ऐप फ्री है?",
        a: "जी हाँ, पहले महीने तक 5 मज़दूरों तक बिल्कुल फ्री है। बाद में ₹249/महीना से प्लान शुरू होते हैं।",
      },
      {
        q: "क्या बिना नेट के हाज़िरी लग सकती है?",
        a: "हाँ, ऑफलाइन मोड में भी हाज़िरी लगती है और बाद में अपने आप सिंक हो जाती है।",
      },
    ],
  },
  {
    slug: "labour-management-tips-for-contractors",
    title: "Top 7 Labour Management Tips Har Contractor Ko Pata Hone Chahiye",
    excerpt:
      "Construction contractors ke liye 7 practical labour management tips — attendance, payments, productivity aur worker retention ke liye.",
    description:
      "7 practical labour management tips for Indian contractors covering attendance, payments, productivity, retention and digital tools like KaamSaathi.",
    date: "2025-08-20",
    readTime: "6 min read",
    category: "Contractor Tips",
    language: "hinglish",
    keywords:
      "labour management tips, contractor tips India, construction labour management, mazdoor management, KaamSaathi tips",
    image: blogThumbnail,
    intro:
      "Construction site par labour ko manage karna sirf hajri lagana nahi hai — ye <strong>productivity, trust aur paisa</strong> ka game hai. Yahan 7 practical tips hain jo har Indian contractor ke kaam aayenge.",
    sections: [
      {
        id: "tip-1-digital-attendance",
        heading: "1. Digital attendance use karein",
        html: `<p>Paper register bhool jao. <strong>Digital attendance app</strong> jaise <a href="/worker-attendance-app">KaamSaathi</a> use karne se errors khatam hote hain aur payment disputes nahi hote.</p>`,
      },
      {
        id: "tip-2-daily-wage-rate",
        heading: "2. Daily wage rate clearly fix karein",
        html: `<p>Har worker ke saath <strong>shuru mein hi rate decide</strong> karein — mason, helper, mistri, sab ka alag rate. App mein save kar dein taaki monthly hisab smooth chale.</p>`,
      },
      {
        id: "tip-3-advance",
        heading: "3. Advance payments record karein",
        html: `<p>Workers advance maangte hain — ye normal hai. Lekin har advance ko <strong>turant record</strong> karein, warna mahine ke end mein hisab galat ho jaata hai.</p>`,
      },
      {
        id: "tip-4-multi-site",
        heading: "4. Multi-site projects ke liye dashboard rakhein",
        html: `<p>Agar aap 2-3 sites pe kaam kar rahe hain to <a href="/construction-site-management">site-wise dashboard</a> rakhein. Sab kuch ek jagah dikhega.</p>`,
      },
      {
        id: "tip-5-overtime",
        heading: "5. Overtime ka clear rule banayein",
        html: `<p>Overtime kab milega, kitne ka milega — ye <strong>likh kar rakhein</strong>. KaamSaathi mein overtime hours alag se mark hote hain.</p>`,
      },
      {
        id: "tip-6-reports",
        heading: "6. Weekly reports check karte rahein",
        html: `<p>Har Sunday <strong>weekly report</strong> dekhein — kis site pe kitna labour cost, kis worker ne kitne din kaam kiya. Decisions data se lo, gut feeling se nahi.</p>`,
      },
      {
        id: "tip-7-respect-trust",
        heading: "7. Workers ke saath trust banayein",
        html: `<p>Time pe payment, sahi hisab aur respect — ye 3 cheezein workers ko <strong>long-term retain</strong> karti hain. Achhe workers milna mushkil hai, retain karna asaan.</p>`,
      },
    ],
    faqs: [
      {
        q: "Sabse common contractor problem kya hai?",
        a: "Payment disputes — jo hamesha galat attendance records ki wajah se hote hain. Digital attendance app inhe khatam kar deta hai.",
      },
      {
        q: "Kya KaamSaathi multi-site supports karta hai?",
        a: "Haan, aap unlimited sites bana sakte hain aur har site ka alag dashboard milta hai.",
      },
    ],
  },
  {
    slug: "construction-site-management-best-practices-india",
    title: "Construction Site Management Best Practices for Indian Builders (2025)",
    excerpt:
      "A practical playbook for Indian builders and site engineers to run construction sites efficiently — labour, materials, safety and digital tools.",
    description:
      "2025 guide to construction site management for Indian builders covering labour planning, material tracking, safety, reporting and digital tools.",
    date: "2025-09-05",
    readTime: "9 min read",
    category: "Construction Site Management",
    language: "en",
    keywords:
      "construction site management India, builder tips, site engineer, construction project management, KaamSaathi site management",
    image: blogThumbnail,
    intro:
      "Indian construction sites are complex — multiple trades, daily wage labour, weather delays, and tight budgets. This guide covers proven <strong>site management best practices</strong> used by professional builders in 2025.",
    sections: [
      {
        id: "labour-planning",
        heading: "1. Plan Labour by Trade and Day",
        html: `<p>Don't bring 30 masons when you only need 12. Build a <strong>weekly labour plan</strong> by trade — masons, helpers, electricians, painters — and adjust as work progresses.</p>`,
      },
      {
        id: "digital-attendance",
        heading: "2. Use Digital Attendance",
        html: `<p>Paper musters lose data, get wet, and create payment disputes. A digital <a href="/contractor-attendance-app">contractor attendance app</a> like KaamSaathi gives you accurate records and instant reports.</p>`,
      },
      {
        id: "material-tracking",
        heading: "3. Track Materials In and Out",
        html: `<p>Cement, steel, sand — log every delivery and consumption. Material wastage is one of the biggest hidden costs on Indian sites.</p>`,
      },
      {
        id: "safety",
        heading: "4. Make Safety Non-Negotiable",
        html: `<p>Helmets, harnesses, scaffolding inspections — small investments that prevent expensive accidents and downtime.</p>`,
      },
      {
        id: "weekly-review",
        heading: "5. Weekly Site Review Meetings",
        html: `<p>Every Saturday, sit with your supervisor for 30 minutes. Review labour cost, progress vs plan, and next week's priorities.</p>`,
      },
      {
        id: "client-reports",
        heading: "6. Send Clients Weekly Reports",
        html: `<p>Clients who get clean weekly progress + cost reports trust you more — and pay faster. Generate them automatically from your <a href="/construction-site-management">site management dashboard</a>.</p>`,
      },
    ],
    faqs: [
      {
        q: "What's the biggest cost leak on construction sites?",
        a: "Inaccurate labour attendance and unrecorded material consumption. Both are easily fixed with a digital site management app.",
      },
      {
        q: "Can KaamSaathi handle multiple sites?",
        a: "Yes — unlimited sites with separate dashboards, attendance and payment records per site.",
      },
    ],
  },
  {
    slug: "daily-wage-payment-calculation-guide",
    title: "Daily Wage Payment Calculation: Complete Guide for Indian Contractors",
    excerpt:
      "Step-by-step guide to calculating daily wages, advances, overtime and dues for construction workers in India — with examples.",
    description:
      "Complete guide to daily wage payment calculation in India: rates, overtime, advances, deductions and automation with KaamSaathi.",
    date: "2025-09-22",
    readTime: "7 min read",
    category: "Daily Wage Management",
    language: "en",
    keywords:
      "daily wage calculation, wage payment India, overtime calculation, advance payment workers, construction wage management",
    image: blogThumbnail,
    intro:
      "Calculating <strong>daily wages</strong> for construction workers seems simple — until advances, overtime and half-days enter the picture. Here's a clear, example-driven guide.",
    sections: [
      {
        id: "basic-formula",
        heading: "The Basic Formula",
        html: `<p><strong>Total Wage = (Daily Rate × Present Days) + (Half-Day Rate × Half Days) + Overtime − Advances</strong></p><p>Example: Rate ₹600/day, 22 present, 2 half-days, ₹400 overtime, ₹2,000 advance → (600×22) + (300×2) + 400 − 2000 = <strong>₹12,200</strong>.</p>`,
      },
      {
        id: "overtime-rules",
        heading: "Overtime Rules of Thumb",
        html: `<p>Most Indian contractors pay overtime at <strong>1.25× to 1.5×</strong> the normal hourly rate. Decide upfront and document it.</p>`,
      },
      {
        id: "advances",
        heading: "Handling Advances",
        html: `<p>Record every advance the day it is given. Workers expect transparency — and so does the math.</p>`,
      },
      {
        id: "automation",
        heading: "Automate with KaamSaathi",
        html: `<p>Manual calculation is error-prone. The <a href="/worker-attendance-app">KaamSaathi worker attendance app</a> auto-computes wages, advances and dues every day.</p>`,
      },
    ],
    faqs: [
      {
        q: "How is half-day wage usually calculated?",
        a: "Most contractors pay 50% of the daily rate for half-day attendance. KaamSaathi lets you set this rule per worker.",
      },
      {
        q: "Should advances be deducted in one go?",
        a: "Usually no — they are deducted from the next payment cycle. KaamSaathi tracks running advance balances automatically.",
      },
    ],
  },
  {
    slug: "construction-technology-trends-india-2025",
    title: "Construction Technology Trends Reshaping Indian Sites in 2025",
    excerpt:
      "From AI-powered site monitoring to mobile attendance apps — the tech shifts every Indian builder should know about in 2025.",
    description:
      "Top construction technology trends for Indian builders in 2025: mobile apps, AI, drones, BIM and digital labour management.",
    date: "2025-10-12",
    readTime: "6 min read",
    category: "Construction Technology",
    language: "en",
    keywords:
      "construction technology India, contech trends 2025, construction apps India, digital construction, KaamSaathi technology",
    image: blogThumbnail,
    intro:
      "Indian construction is going digital faster than most people realise. Here are the <strong>technology trends</strong> reshaping how sites are run in 2025.",
    sections: [
      {
        id: "mobile-first-apps",
        heading: "1. Mobile-First Site Apps",
        html: `<p>Site supervisors live on smartphones. Mobile apps for <a href="/worker-attendance-app">attendance</a>, materials and reporting are replacing desktop software.</p>`,
      },
      {
        id: "ai-monitoring",
        heading: "2. AI-Powered Site Monitoring",
        html: `<p>CCTV + computer vision is being used on larger sites for safety compliance and progress tracking.</p>`,
      },
      {
        id: "drones",
        heading: "3. Drone Surveys",
        html: `<p>Drone-based volumetric surveys cut survey time from days to hours.</p>`,
      },
      {
        id: "digital-labour",
        heading: "4. Digital Labour Management",
        html: `<p>Apps like <a href="/labour-management-app">KaamSaathi</a> are replacing paper musters and Excel sheets across thousands of Indian sites.</p>`,
      },
      {
        id: "cloud-reports",
        heading: "5. Cloud-Based Client Reporting",
        html: `<p>Clients increasingly expect real-time dashboards instead of weekly PDF emails.</p>`,
      },
    ],
    faqs: [
      {
        q: "Is construction technology only for big builders?",
        a: "No — many tools like KaamSaathi are designed for small contractors and start free.",
      },
      {
        q: "What's the easiest tech upgrade for a small contractor?",
        a: "A mobile attendance and payment app. Lowest cost, biggest immediate impact.",
      },
    ],
  },
  {
    slug: "ghar-ki-foundation-work-kaise-kare",
    title: "Ghar ki Foundation Work kaise kare",
    excerpt:
      "घर की नींव (Foundation) कैसे बनाएं — गहराई, ऊँचाई, सही समय और आम गलतियाँ। मजबूत और टिकाऊ घर के लिए पूरी हिंदी गाइड।",
    description:
      "नींव का काम (Foundation Work) कैसे करें — 1, 2 और 3 मंजिला घर के लिए सही गहराई, घर की ऊँचाई, नींव बनाने का सही समय और बचने वाली गलतियाँ। मजबूत घर की पहली सीढ़ी की पूरी हिंदी गाइड।",
    date: "2026-06-04",
    readTime: "5 min read",
    category: "Construction Site Management",
    language: "hi",
    keywords:
      "ghar ki foundation, foundation work in hindi, neev ka kaam, ghar ki neev kitni gehri honi chahiye, foundation depth, construction tips hindi, KaamSaathi blog hindi",
    image: blogThumbnail,
    intro:
      "घर बनाते समय लोग अक्सर डिजाइन, टाइल्स और पेंट पर ज्यादा ध्यान देते हैं, लेकिन घर की असली मजबूती उसकी <strong>नींव (Foundation)</strong> में होती है। अगर नींव मजबूत होगी, तो घर लंबे समय तक सुरक्षित और टिकाऊ बना रहेगा। इसलिए नींव का काम हमेशा सोच-समझकर करना चाहिए।",
    sections: [
      {
        id: "neev-kitni-gehri",
        heading: "नींव कितनी गहरी होनी चाहिए?",
        html: `<p>नींव की गहराई मिट्टी और घर के डिजाइन पर निर्भर करती है, लेकिन सामान्य तौर पर:</p><ul><li><strong>1 मंजिला घर</strong> — 4 से 5 फीट</li><li><strong>2 मंजिला घर</strong> — 5 से 6 फीट</li><li><strong>3 मंजिला घर</strong> — 6 से 8 फीट</li></ul><p><strong>उदाहरण के लिए</strong>, अगर आज आप सिर्फ ग्राउंड फ्लोर बना रहे हैं लेकिन भविष्य में ऊपर मंजिल बनाने का प्लान है, तो शुरुआत से ही उसी हिसाब से नींव तैयार करवाना बेहतर रहता है।</p>`,
      },
      {
        id: "ghar-ki-unchai",
        heading: "घर की ऊँचाई कितनी रखनी चाहिए?",
        html: `<p>घर का फर्श जमीन या सड़क के स्तर से कम से कम <strong>2 से 3 फीट ऊँचा</strong> रखना अच्छा माना जाता है। इससे बारिश का पानी घर में नहीं आता और सीलन की समस्या भी कम होती है।</p>`,
      },
      {
        id: "sahi-samay",
        heading: "नींव बनाने का सही समय",
        html: `<p>गर्मी और सर्दी का मौसम नींव के काम के लिए सबसे अच्छा माना जाता है। बारिश के मौसम में खुदाई वाली जगह में पानी भर सकता है, जिससे काम प्रभावित हो सकता है।</p>`,
      },
      {
        id: "galtiyan",
        heading: "कौन-सी गलतियाँ नहीं करनी चाहिए?",
        html: `<ul><li>सिर्फ वर्तमान जरूरत देखकर नींव न बनवाएं।</li><li>घटिया सामग्री का इस्तेमाल न करें।</li><li>बिना सलाह के नींव की गहराई तय न करें।</li><li>घर की ऊँचाई बहुत कम न रखें।</li><li>कंक्रीट डालने के बाद वॉटरिंग (पानी देना) में लापरवाही न करें।</li></ul>`,
      },
      {
        id: "nishkarsh",
        heading: "निष्कर्ष",
        html: `<p>नींव घर का वह हिस्सा है जो दिखाई नहीं देता, लेकिन पूरे घर को संभालता है। इसलिए इस चरण में जल्दबाजी न करें। सही योजना, अच्छी सामग्री और मजबूत नींव आपके सपनों के घर को वर्षों तक सुरक्षित बनाए रख सकती है।</p>`,
      },
    ],
    faqs: [
      {
        q: "1 मंजिला घर की नींव कितनी गहरी होनी चाहिए?",
        a: "सामान्य मिट्टी में 1 मंजिला घर के लिए 4 से 5 फीट गहरी नींव पर्याप्त मानी जाती है। लेकिन अगर भविष्य में ऊपर मंजिल बनाने का प्लान है, तो शुरुआत से ही 2 या 3 मंजिला घर के हिसाब से नींव तैयार करवाएं।",
      },
      {
        q: "घर का फर्श जमीन से कितना ऊँचा रखना चाहिए?",
        a: "घर का फर्श सड़क या जमीन के स्तर से कम से कम 2 से 3 फीट ऊँचा रखना चाहिए, जिससे बारिश का पानी अंदर न आए और सीलन की समस्या न हो।",
      },
      {
        q: "नींव बनाने का सबसे अच्छा मौसम कौन-सा है?",
        a: "गर्मी और सर्दी का मौसम नींव के काम के लिए सबसे अच्छा होता है। बारिश में खुदाई वाली जगह पानी से भर जाती है, जिससे काम की गुणवत्ता पर असर पड़ता है।",
      },
    ],
  },
];

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 3): BlogPost[] => {
  const current = getPostBySlug(slug);
  if (!current) return [];
  const sameCat = blogPosts.filter(
    (p) => p.slug !== slug && p.category === current.category,
  );
  const others = blogPosts.filter(
    (p) => p.slug !== slug && p.category !== current.category,
  );
  return [...sameCat, ...others].slice(0, limit);
};
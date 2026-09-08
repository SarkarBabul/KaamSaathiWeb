import { SeoLandingPage, type SeoLandingProps } from "@/components/kaamsaathi/SeoLandingPage";
import { CalendarCheck, WifiOff, Users, MapPin, FileBarChart, Clock, Smartphone, ShieldCheck, HardHat, Building2, UserCog, Truck, ClipboardList } from "lucide-react";

const data: SeoLandingProps = {
  slug: "worker-attendance-app",
  meta: {
    title: "Worker Attendance App for Contractors & Builders | KaamSaathi",
    description: "KaamSaathi is India's #1 worker attendance app for contractors. Mark daily wage worker attendance, track overtime and generate reports — works offline. मजदूरों की हाजरी मोबाइल से लगाएँ। Free download.",
    keywords: "worker attendance app, daily wage worker attendance app, online worker attendance app, mobile worker attendance app, attendance app for workers, मजदूर हाजरी ऐप, मजदूरों की हाजरी ऐप",
  },
  hero: {
    badge: "India's #1 Worker Attendance App",
    h1: "Worker Attendance App — Mark Daily Wage Worker Attendance from Mobile",
    hindiSub: "मजदूरों की हाजरी अब रजिस्टर पर नहीं, मोबाइल से लगाएँ — बस एक टैप में।",
    intro: "Track present, absent, half-day और overtime हर worker के लिए — site पर खड़े-खड़े। Works offline, syncs automatically.",
  },
  intro: {
    h2: "India's Easiest Worker Attendance App",
    paragraphs: [
      "KaamSaathi एक mobile-first worker attendance app है जो खासतौर पर contractors, builders और small construction businesses के लिए बना है। पुराने रजिस्टर, Excel sheets और WhatsApp messages के झंझट को छोड़िए — अब हर daily wage worker की हाजरी आपके मोबाइल में, एक tap में लगती है।",
      "चाहे आप 10 मजदूरों की team चलाते हों या 500+ workers की, KaamSaathi worker attendance app आपके हर site, हर shift और हर party का हिसाब रखता है। Present, absent, half-day और overtime को रंग-कोडित (color-coded) करके दिखाता है ताकि एक नज़र में पूरी team की हालत समझ आ जाए।",
      "Best part? यह app बिना internet के भी काम करता है। Site पर network नहीं है? कोई बात नहीं — हाजरी offline mark करें, network आते ही data अपने आप cloud पर sync हो जाएगा। आपकी सारी attendance information हमेशा safe और बैकअप में रहती है।",
      "Worker attendance app होने के साथ-साथ KaamSaathi labour payments, advance और daily wage calculation भी करता है। यानी एक ही app में attendance और payroll दोनों का पूरा solution। यही वजह है कि हज़ारों Indian contractors KaamSaathi को पसंद कर रहे हैं।",
    ],
  },
  problems: {
    h2: "रजिस्टर वाली हाजरी की दिक्कतें",
    intro: "अगर आप अब भी कागज़ पर हाजरी लगा रहे हैं, तो ये problems आम होंगी।",
    items: [
      { icon: ClipboardList, title: "रजिस्टर खो जाना", desc: "महीने भर का record एक ही पन्ने के साथ गायब।" },
      { icon: Clock, title: "Time की बर्बादी", desc: "हर रोज़ 1 घंटा सिर्फ हाजरी और हिसाब में निकल जाता है।" },
      { icon: FileBarChart, title: "गलत Calculations", desc: "Overtime और half-day का हिसाब करते वक्त गलतियाँ।" },
      { icon: Users, title: "Workers का झगड़ा", desc: "“मेरी हाजरी नहीं लगी” — हर हफ्ते की कहानी।" },
      { icon: MapPin, title: "Multiple Sites Confusion", desc: "किस site पर कौन था, याद रखना मुश्किल।" },
      { icon: WifiOff, title: "Site पर Network नहीं", desc: "Online apps fail हो जाती हैं जब signal नहीं होता।" },
    ],
  },
  features: {
    h2: "KaamSaathi Worker Attendance App Features",
    intro: "वो सब कुछ जो एक contractor को रोज़ चाहिए।",
    items: [
      { icon: CalendarCheck, title: "One-Tap Attendance", desc: "Present, Absent, Half-day, Overtime — एक tap में mark करें।" },
      { icon: WifiOff, title: "Offline Mode", desc: "बिना internet हाजरी लगाएँ — auto sync जब network आए।" },
      { icon: MapPin, title: "Site-wise Attendance", desc: "हर site और party का अलग record।" },
      { icon: Clock, title: "Overtime Tracking", desc: "Extra hours अपने आप calculate होंगे।" },
      { icon: FileBarChart, title: "PDF/Excel Reports", desc: "Daily, weekly, monthly reports — WhatsApp पर share करें।" },
      { icon: ShieldCheck, title: "Secure Cloud Backup", desc: "आपका data हमेशा safe — phone खोने पर भी।" },
    ],
  },
  benefits: {
    h2: "क्यों चुनें KaamSaathi Worker Attendance App?",
    items: [
      "रोज़ का 1+ घंटा बचता है — हाजरी 30 second में",
      "Workers से झगड़ा खत्म — सब कुछ रिकॉर्ड में",
      "Payroll calculation में 0 गलतियाँ",
      "किसी भी time, कहीं से भी attendance देख सकते हैं",
      "हिंदी और English दोनों में आसानी से इस्तेमाल",
      "₹0 से शुरू — Free plan में 10 workers मुफ़्त",
      "WhatsApp पर तुरंत support",
      "Android phone पर Play Store से 1 minute में install",
    ],
  },
  audience: {
    h2: "किस-किस के लिए है यह Attendance App?",
    items: [
      { icon: HardHat, title: "Contractors", desc: "Labour ठेकेदारों के लिए perfect।" },
      { icon: Building2, title: "Builders", desc: "Multi-site projects easily handle करें।" },
      { icon: UserCog, title: "Site Supervisors", desc: "रोज़ की हाजरी owner को तुरंत भेजें।" },
      { icon: Truck, title: "Labour Suppliers", desc: "हर party का अलग हिसाब।" },
    ],
  },
  howItWorks: {
    h2: "3 Step में शुरू करें",
    steps: [
      { title: "Download App", desc: "Play Store से KaamSaathi free download करें।" },
      { title: "Add Workers & Sites", desc: "अपने मजदूर और sites जोड़ें — बस नाम लिखें।" },
      { title: "Mark Attendance", desc: "रोज़ एक tap में हाजरी, बाकी सब अपने आप।" },
    ],
  },
  hindiBlock: {
    h2: "ठेकेदारों का भरोसेमंद हाजरी ऐप",
    paragraphs: [
      "KaamSaathi worker attendance app उन ठेकेदारों के लिए बना है जो हिंदी में काम करना पसंद करते हैं। ऐप का interface इतना simple है कि कोई भी supervisor, चाहे उसे technology का अनुभव हो या नहीं, 5 minute में सीख सकता है।",
      "अब रजिस्टर भीगने, फटने या खोने की चिंता नहीं। हर मजदूर की हाजरी, advance और payment का record आपके मोबाइल में हमेशा safe रहेगा।",
    ],
  },
  comparison: {
    h2: "रजिस्टर बनाम KaamSaathi",
    rows: [
      { label: "Time per day", old: "60+ minutes", new: "Just 2 minutes" },
      { label: "Calculation mistakes", old: "अक्सर होती हैं", new: "Automatic, 100% सही" },
      { label: "Data loss risk", old: "बहुत ज़्यादा", new: "Cloud पर safe" },
      { label: "Reports", old: "हाथ से बनानी पड़ती हैं", new: "1 click PDF/Excel" },
      { label: "Multi-site", old: "अलग-अलग रजिस्टर", new: "एक app में सब" },
    ],
  },
  faqs: [
    { q: "Worker attendance app क्या है?", a: "Worker attendance app एक mobile application है जिससे contractor और builders अपने मजदूरों की रोज़ की हाजरी डिजिटल तरीके से लगाते हैं — रजिस्टर की जगह पर।" },
    { q: "क्या KaamSaathi worker attendance app free है?", a: "हाँ, KaamSaathi का free plan हमेशा free है — इसमें आप 10 workers और 1 site मुफ्त में manage कर सकते हैं।" },
    { q: "क्या यह app offline काम करता है?", a: "हाँ, बिना internet भी आप हाजरी mark कर सकते हैं। Network आते ही data अपने आप cloud पर sync हो जाता है।" },
    { q: "मैं overtime कैसे track करूँ?", a: "हर worker की attendance के साथ overtime hours add कर सकते हैं — app अपने आप extra payment calculate कर देता है।" },
    { q: "क्या मैं attendance report PDF में download कर सकता हूँ?", a: "हाँ, daily, weekly और monthly reports आप PDF और Excel में download करके WhatsApp पर share कर सकते हैं।" },
    { q: "एक से ज़्यादा sites कैसे handle करूँ?", a: "Pro plan में आप unlimited sites add कर सकते हैं — हर site का अलग attendance और labour list।" },
    { q: "क्या iOS पर भी मिलता है?", a: "अभी KaamSaathi Android पर available है। iOS version जल्द आएगा।" },
    { q: "क्या मेरा data secure है?", a: "हाँ, सारा data encrypted cloud पर store होता है। केवल आप ही उसे access कर सकते हैं।" },
    { q: "हाजरी mark करने में कितना time लगता है?", a: "Average 30 seconds में पूरी team की हाजरी हो जाती है — एक tap per worker।" },
    { q: "Free plan से Pro में कैसे upgrade करें?", a: "App में जाकर Pricing section से आप upgrade कर सकते हैं। Pro plan ₹99/महीना से शुरू है।" },
  ],
  finalCta: {
    h2: "आज ही Worker Attendance App Download करें",
    sub: "हज़ारों ठेकेदार KaamSaathi से हर रोज़ अपने मजदूरों की हाजरी लगा रहे हैं — अब आपकी बारी।",
  },
};

export default function WorkerAttendanceApp() {
  return <SeoLandingPage data={data} />;
}
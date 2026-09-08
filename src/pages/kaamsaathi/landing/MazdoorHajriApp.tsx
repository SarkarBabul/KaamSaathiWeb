import { SeoLandingPage, type SeoLandingProps } from "@/components/kaamsaathi/SeoLandingPage";
import { CalendarCheck, Wallet, FileBarChart, MapPin, WifiOff, ShieldCheck, HardHat, Building2, UserCog, Truck, Users, ClipboardList } from "lucide-react";

const data: SeoLandingProps = {
  slug: "mazdoor-hajri-app",
  meta: {
    title: "मजदूर हाजरी ऐप | Mazdoor Hajri App for Contractors — KaamSaathi",
    description: "KaamSaathi मजदूर हाजरी ऐप — मजदूरों की हाजरी, पेमेंट और advance का पूरा हिसाब मोबाइल से। ठेकेदारों के लिए free Android app। आज ही download करें।",
    keywords: "मजदूर हाजरी ऐप, mazdoor hajri app, मजदूर हाजरी, मजदूरों की हाजरी ऐप, हाजरी ऐप, labour hajri app, हाजरी रजिस्टर ऐप",
  },
  hero: {
    badge: "हिंदी में सबसे आसान ऐप",
    h1: "मजदूर हाजरी ऐप — Mazdoor Hajri App",
    hindiSub: "अब रजिस्टर नहीं, मोबाइल से लगाओ हर मजदूर की हाजरी।",
    intro: "Daily wage workers की हाजरी, advance और payment का पूरा हिसाब आपके मोबाइल में — हिंदी में, simple और free।",
  },
  intro: {
    h2: "मजदूर हाजरी ऐप क्या है?",
    paragraphs: [
      "मजदूर हाजरी ऐप यानी एक ऐसा mobile application जिससे ठेकेदार और builders अपने मजदूरों की रोज़ की हाजरी डिजिटल तरीके से लगा सकते हैं। पहले यह काम कागज़ रजिस्टर पर होता था — जो अक्सर खो जाता, फट जाता या भीग जाता। KaamSaathi मजदूर हाजरी ऐप इस पुरानी समस्या का modern solution है।",
      "यह ऐप पूरी तरह हिंदी और Hinglish बोलने वाले ठेकेदारों के लिए design किया गया है। Buttons बड़े हैं, language simple है और कोई technical knowledge नहीं चाहिए। चाहे आप पहली बार smartphone use कर रहे हों, फिर भी 5 minute में हाजरी लगाना आ जाएगा।",
      "मजदूरों की हाजरी सिर्फ count नहीं है — यह आपकी payment, payroll और profit का base है। एक भी गलत entry का मतलब है पैसों का नुकसान या मजदूर से झगड़ा। KaamSaathi हर हाजरी को timestamp के साथ record करता है ताकि कोई dispute ना हो।",
      "Best of all, यह ऐप offline भी काम करता है। Site पर network नहीं? कोई बात नहीं — हाजरी offline mark करें। जब network आएगा, data अपने आप cloud पर save हो जाएगा। आपकी मेहनत कभी बेकार नहीं जाएगी।",
    ],
  },
  problems: {
    h2: "रजिस्टर वाली मजदूर हाजरी की समस्याएँ",
    items: [
      { icon: ClipboardList, title: "रजिस्टर खो जाना", desc: "एक रजिस्टर खोया, महीनों का record गया।" },
      { icon: Users, title: "मजदूरों की बहस", desc: "“मेरी हाजरी नहीं लगी” — रोज़ का झगड़ा।" },
      { icon: FileBarChart, title: "हिसाब में गलतियाँ", desc: "Half-day, overtime में अक्सर भूल।" },
      { icon: Wallet, title: "Advance याद नहीं", desc: "किसको कितना advance दिया, भूल जाते हैं।" },
      { icon: MapPin, title: "Multi-site उलझन", desc: "अलग-अलग sites के अलग रजिस्टर।" },
      { icon: ShieldCheck, title: "Data Backup नहीं", desc: "रजिस्टर भीगने से सब बेकार।" },
    ],
  },
  features: {
    h2: "हाजरी ऐप के Features",
    items: [
      { icon: CalendarCheck, title: "एक-टैप हाजरी", desc: "Present, Absent, Half-day, Overtime — एक tap।" },
      { icon: WifiOff, title: "बिना Internet काम", desc: "Offline mode — कहीं भी हाजरी।" },
      { icon: Wallet, title: "पेमेंट का हिसाब", desc: "हर मजदूर का payment record।" },
      { icon: MapPin, title: "हर साइट अलग", desc: "Multi-site support।" },
      { icon: FileBarChart, title: "PDF/Excel रिपोर्ट", desc: "1 click में reports।" },
      { icon: ShieldCheck, title: "Cloud पर Safe", desc: "Phone खोए तब भी data safe।" },
    ],
  },
  benefits: {
    h2: "क्यों चुनें KaamSaathi मजदूर हाजरी ऐप?",
    items: [
      "100% हिंदी friendly interface",
      "5 minute में सीख जाएँगे",
      "रोज़ का 1+ घंटा बचेगा",
      "मजदूरों से झगड़े बंद",
      "हर हाजरी timestamp के साथ",
      "Free plan हमेशा free",
      "WhatsApp पर हिंदी में support",
      "Android के लिए तैयार",
    ],
  },
  audience: {
    h2: "किसके लिए है मजदूर हाजरी ऐप?",
    items: [
      { icon: HardHat, title: "ठेकेदार", desc: "Labour ठेकेदारों का साथी।" },
      { icon: Building2, title: "Builders", desc: "बड़े projects के लिए perfect।" },
      { icon: UserCog, title: "मुंशी / Supervisor", desc: "Site पर हाजरी और reports।" },
      { icon: Truck, title: "Labour Supplier", desc: "हर party का अलग record।" },
    ],
  },
  howItWorks: {
    h2: "3 Step में हाजरी शुरू",
    steps: [
      { title: "ऐप Install करें", desc: "Play Store से KaamSaathi download।" },
      { title: "मजदूर जोड़ें", desc: "नाम लिखें, daily wage set करें।" },
      { title: "रोज़ हाजरी लगाएँ", desc: "एक tap — पूरा record save।" },
    ],
  },
  hindiBlock: {
    h2: "“अब रजिस्टर की जरूरत नहीं”",
    paragraphs: [
      "मजदूरों की हाजरी अब आपके मोबाइल में। हर मजदूर का नाम, हाजरी, advance और payment — सब कुछ एक जगह।",
      "हिंदी में लिखा हुआ, बड़े buttons, simple flow — हर ठेकेदार के लिए बनाया गया।",
    ],
  },
  comparison: {
    h2: "रजिस्टर बनाम मजदूर हाजरी ऐप",
    rows: [
      { label: "हाजरी का तरीका", old: "कागज़ पर लिखना", new: "एक tap" },
      { label: "Backup", old: "नहीं", new: "Cloud पर automatic" },
      { label: "रिपोर्ट", old: "हाथ से बनाना", new: "1 click PDF" },
      { label: "Advance हिसाब", old: "याददाश्त पर", new: "App में log" },
      { label: "Multi-site", old: "अलग रजिस्टर", new: "एक app" },
    ],
  },
  faqs: [
    { q: "मजदूर हाजरी ऐप क्या है?", a: "यह एक मोबाइल ऐप है जिससे ठेकेदार और मुंशी मजदूरों की रोज़ की हाजरी डिजिटल तरीके से लगाते हैं — रजिस्टर की जगह।" },
    { q: "क्या KaamSaathi मजदूर हाजरी ऐप free है?", a: "हाँ, free plan में 10 मजदूर और 1 site पूरी तरह मुफ्त है।" },
    { q: "क्या ऐप हिंदी में है?", a: "हाँ, ऐप हिंदी और Hinglish बोलने वाले ठेकेदारों के लिए बनाया गया है।" },
    { q: "Internet ना हो तो हाजरी कैसे लगाएँ?", a: "Offline mode में हाजरी लगाएँ — network आते ही data अपने आप sync।" },
    { q: "क्या advance और payment भी track होगा?", a: "हाँ, हर मजदूर का advance, payment और बकाया अलग track होता है।" },
    { q: "रिपोर्ट कैसे मिलेगी?", a: "Daily, weekly और monthly reports PDF/Excel में download कर WhatsApp पर share करें।" },
    { q: "Multi-site हाजरी मिलती है?", a: "हाँ, Pro plan में unlimited sites add कर सकते हैं।" },
    { q: "क्या iPhone पर मिलेगा?", a: "अभी सिर्फ Android पर। iOS version जल्द आएगा।" },
    { q: "Phone खो जाए तो data?", a: "Cloud पर safe — नए phone पर login करते ही सब वापस।" },
    { q: "Pro plan की कीमत?", a: "₹99/महीना से शुरू। Annual में 2 महीने free।" },
  ],
  finalCta: {
    h2: "आज ही मजदूर हाजरी ऐप Download करें",
    sub: "रजिस्टर का झंझट छोड़ें — मोबाइल से हाजरी लगाएँ।",
  },
};

export default function MazdoorHajriApp() {
  return <SeoLandingPage data={data} />;
}
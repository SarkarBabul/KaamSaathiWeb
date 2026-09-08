import { SeoLandingPage, type SeoLandingProps } from "@/components/kaamsaathi/SeoLandingPage";
import { MapPin, CalendarCheck, Wallet, FileBarChart, WifiOff, ShieldCheck, HardHat, Building2, UserCog, Truck, Users, ClipboardList } from "lucide-react";

const data: SeoLandingProps = {
  slug: "construction-site-management",
  meta: {
    title: "Construction Site Management App for Contractors | KaamSaathi",
    description: "KaamSaathi construction site management app — manage labour, attendance, payments and reports across multiple sites. साइट मैनेजमेंट अब मोबाइल से। Free download.",
    keywords: "construction site management, construction site management app, site management software, multi-site labour management, construction worker management, साइट मैनेजमेंट ऐप",
  },
  hero: {
    badge: "Built for Indian Construction Sites",
    h1: "Construction Site Management App for Contractors & Builders",
    hindiSub: "हर साइट की labour, हाजरी और हिसाब — एक मोबाइल ऐप से control करें।",
    intro: "Manage labour attendance, daily wages, advances and reports across all your construction sites. Mobile-first, offline ready.",
  },
  intro: {
    h2: "Modern Construction Site Management",
    paragraphs: [
      "Construction site management सिर्फ बिल्डिंग बनाने का काम नहीं है। एक site पर labour, material, payment और reports — हर चीज़ का सही हिसाब रखना ही असली site management है। और जब आप 2, 5 या 10 sites एक साथ चला रहे होते हैं, तो यह काम और भी मुश्किल हो जाता है।",
      "KaamSaathi construction site management app इस challenge को आसान बनाता है। हर site का अलग dashboard, अलग labour list, अलग payment record और अलग reports — सब कुछ एक app में। आपको अब हर site पर physically जाने की ज़रूरत नहीं — मोबाइल से ही पूरा control।",
      "इस app में site supervisors रोज़ की हाजरी मार्क करते हैं, advance entries डालते हैं और work updates देते हैं। आप, contractor या builder, अपने मोबाइल पर real-time देख सकते हैं कि किस site पर क्या हो रहा है। सब कुछ transparent और tracked।",
      "Construction site management में सबसे बड़ी challenge होती है cost control। KaamSaathi हर site की labour cost अलग दिखाता है ताकि आपको पता रहे कौन-सा project profit में है और कौन-सा loss में। यह data-driven decisions लेने में मदद करता है।",
    ],
  },
  problems: {
    h2: "Construction Site Management की Challenges",
    items: [
      { icon: MapPin, title: "Multi-Site Confusion", desc: "एक site पर रहते दूसरी का status नहीं।" },
      { icon: Users, title: "Labour Tracking", desc: "हर site पर कितने मजदूर, याद रखना मुश्किल।" },
      { icon: Wallet, title: "Cost Control नहीं", desc: "कौन-सा site profit में, पता नहीं।" },
      { icon: ClipboardList, title: "Manual Records", desc: "हर site के अलग रजिस्टर — chaos।" },
      { icon: FileBarChart, title: "Owner Reports", desc: "हर site की reports बनाना समय-खाऊ।" },
      { icon: ShieldCheck, title: "Data खोना", desc: "रजिस्टर खो जाने पर पूरा project record गया।" },
    ],
  },
  features: {
    h2: "Site Management App Features",
    items: [
      { icon: MapPin, title: "Multi-Site Dashboard", desc: "सारी sites का overview एक screen में।" },
      { icon: CalendarCheck, title: "Site-wise Attendance", desc: "हर site की labour list अलग।" },
      { icon: Wallet, title: "Site-wise Payments", desc: "हर site का अलग payment record।" },
      { icon: FileBarChart, title: "Cost Reports", desc: "हर site का labour cost और profit।" },
      { icon: WifiOff, title: "Offline Ready", desc: "Site पर network नहीं? कोई बात नहीं।" },
      { icon: UserCog, title: "Supervisor Access", desc: "हर site supervisor को अलग role दें।" },
    ],
  },
  benefits: {
    h2: "Construction Site Management के फायदे",
    items: [
      "हर site का real-time status",
      "Multi-site labour management आसान",
      "Site-wise profit/loss पता",
      "Owners को timely reports",
      "Supervisor accountability बढ़ी",
      "Material और labour cost track",
      "Data हमेशा secure cloud पर",
      "Hindi-friendly, मोबाइल पर पूरा control",
    ],
  },
  audience: {
    h2: "किसके लिए है यह App?",
    items: [
      { icon: HardHat, title: "Civil Contractors", desc: "Multi-project labour control।" },
      { icon: Building2, title: "Builders", desc: "Big construction projects।" },
      { icon: UserCog, title: "Project Managers", desc: "Site-wise budget control।" },
      { icon: Truck, title: "Sub-Contractors", desc: "हर party के लिए अलग ledger।" },
    ],
  },
  howItWorks: {
    h2: "कैसे शुरू करें?",
    steps: [
      { title: "Sites Add करें", desc: "अपनी सारी construction sites जोड़ें।" },
      { title: "Workers & Supervisors", desc: "हर site पर labour और supervisor assign करें।" },
      { title: "रोज़ Track करें", desc: "Attendance, payments और reports — मोबाइल से।" },
    ],
  },
  hindiBlock: {
    h2: "हर साइट का पूरा हिसाब आपकी जेब में",
    paragraphs: [
      "अब हर site पर जाने की ज़रूरत नहीं। आपके मोबाइल पर हर site की हाजरी, payment और reports live update होती हैं।",
      "Builders और बड़े contractors के लिए KaamSaathi एक ऐसा साथी है जो हर site का पूरा हिसाब रखता है।",
    ],
  },
  comparison: {
    h2: "पुराना तरीका बनाम Site Management App",
    rows: [
      { label: "Multi-site control", old: "हर site पर जाना", new: "Mobile dashboard" },
      { label: "Reports", old: "हाथ से, late", new: "Real-time, instant" },
      { label: "Cost tracking", old: "End-of-month", new: "Daily updates" },
      { label: "Supervisor accountability", old: "मुश्किल", new: "हर action logged" },
      { label: "Data backup", old: "नहीं", new: "Cloud पर automatic" },
    ],
  },
  faqs: [
    { q: "Construction site management app क्या है?", a: "यह एक mobile app है जिससे contractor और builders एक साथ कई construction sites की labour, attendance और payments manage कर सकते हैं।" },
    { q: "क्या मैं multiple sites add कर सकता हूँ?", a: "हाँ, Pro plan में unlimited sites — हर एक का अलग dashboard और reports।" },
    { q: "क्या site supervisor को अलग access मिलेगा?", a: "हाँ, हर supervisor को आप specific site का access दे सकते हैं।" },
    { q: "क्या हर site की cost अलग दिखती है?", a: "हाँ, हर site की labour cost और payment record अलग track होती है।" },
    { q: "Offline काम करता है?", a: "हाँ, site पर network ना हो तो भी attendance और entries काम करती हैं।" },
    { q: "Owner को reports कैसे मिलेंगी?", a: "1 click में site-wise PDF/Excel reports बनाकर WhatsApp या email से भेजें।" },
    { q: "क्या यह free है?", a: "Free plan में 1 site मुफ्त। Multi-site के लिए Pro ₹99/महीना से।" },
    { q: "क्या iOS पर मिलेगा?", a: "अभी सिर्फ Android — iOS जल्द आएगा।" },
    { q: "Material tracking मिलती है?", a: "अभी app labour management और attendance पर focused है। Material features जल्द आएंगे।" },
    { q: "Data कितना secure है?", a: "Bank-level encryption के साथ cloud पर safe। केवल authorized users access कर सकते हैं।" },
  ],
  finalCta: {
    h2: "Construction Sites को Smart बनाइए",
    sub: "हर site का पूरा control अपने मोबाइल पर लाइए — आज ही।",
  },
};

export default function ConstructionSiteManagement() {
  return <SeoLandingPage data={data} />;
}
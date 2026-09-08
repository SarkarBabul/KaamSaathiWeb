import { SeoLandingPage, type SeoLandingProps } from "@/components/kaamsaathi/SeoLandingPage";
import { Wallet, Users, ClipboardList, FileBarChart, MapPin, ShieldCheck, HardHat, Building2, UserCog, Truck, CalendarCheck, WifiOff } from "lucide-react";

const data: SeoLandingProps = {
  slug: "labour-management-app",
  meta: {
    title: "Labour Management App for Construction Businesses | KaamSaathi",
    description: "KaamSaathi labour management app — manage labour attendance, payments, advances and payroll for construction sites. लेबर का पूरा हिसाब अब मोबाइल में। Free download for Android.",
    keywords: "labour management app, labour attendance app, construction labour management software, labour payroll app, labour payment app, लेबर मैनेजमेंट ऐप, मजदूरों का हिसाब ऐप",
  },
  hero: {
    badge: "Trusted by 10,000+ Contractors",
    h1: "Labour Management App for Contractors & Construction Sites",
    hindiSub: "लेबर की हाजरी, payment और advance — एक ही ऐप में पूरा हिसाब रखें।",
    intro: "Manage labour attendance, daily wages, advances and reports — all from your mobile. Offline-ready and built for Indian construction businesses.",
  },
  intro: {
    h2: "Complete Labour Management — Mobile पर",
    paragraphs: [
      "Labour management सिर्फ हाजरी लगाने का नाम नहीं है। हर मजदूर का daily wage, advance, बकाया, overtime और final payment — इन सबका सही हिसाब रखना ही असली labour management है। KaamSaathi labour management app यही करता है, वो भी एक simple mobile interface में।",
      "ज़्यादातर ठेकेदार आज भी कागज़ रजिस्टर, अलग-अलग notebook और WhatsApp messages से labour का हिसाब रखते हैं। नतीजा? महीने के अंत में payment के समय confusion, गलतियाँ और कई बार labour से झगड़े। KaamSaathi इन सबको खत्म करता है।",
      "इस labour management app में आप हर worker की पूरी history देख सकते हैं — कब काम पर आया, कितने घंटे काम किया, कितना advance लिया, और कितना payment बाकी है। पूरी team का हिसाब हमेशा आपकी जेब में।",
      "Multi-site contractors और builders के लिए यह ऐप और भी useful है। हर site की अलग labour list, अलग payment record और अलग reports — एक dashboard में सब कुछ। यही है modern construction labour management का तरीका।",
    ],
  },
  problems: {
    h2: "Labour Management की आम Problems",
    items: [
      { icon: Wallet, title: "Advance का हिसाब भूलना", desc: "किसको कितना advance दिया, याद नहीं रहता।" },
      { icon: ClipboardList, title: "Payment Disputes", desc: "“मेरा payment बाकी है” — हर महीने वही बहस।" },
      { icon: FileBarChart, title: "गलत Wage Calculation", desc: "Daily wage × दिन — पर overtime और half-day उलझन में।" },
      { icon: Users, title: "Workers की पूरी history नहीं", desc: "कौन कितना regular है, यह data कहीं नहीं।" },
      { icon: MapPin, title: "Site-wise हिसाब नहीं", desc: "किस site पर कितनी labour cost हुई, पता नहीं।" },
      { icon: ShieldCheck, title: "रजिस्टर खो जाना", desc: "एक रजिस्टर गया तो महीनों का record गया।" },
    ],
  },
  features: {
    h2: "Labour Management App के Features",
    items: [
      { icon: CalendarCheck, title: "Labour Attendance", desc: "हर worker की हाजरी एक tap में।" },
      { icon: Wallet, title: "Advance Tracking", desc: "हर advance entry timestamp के साथ save।" },
      { icon: FileBarChart, title: "Auto Payroll", desc: "Daily wage, overtime, advance — सब अपने आप calculate।" },
      { icon: MapPin, title: "Site-wise Reports", desc: "हर site की labour cost अलग देखें।" },
      { icon: Users, title: "Worker Profiles", desc: "हर मजदूर की पूरी history एक जगह।" },
      { icon: WifiOff, title: "Works Offline", desc: "Network ना हो तब भी काम करता रहे।" },
    ],
  },
  benefits: {
    h2: "Labour Management App के फायदे",
    items: [
      "Payment disputes 90% तक कम",
      "हर मजदूर का transparent record",
      "Monthly payroll मिनटों में तैयार",
      "Site-wise profit/loss देखें",
      "Cloud पर automatic backup",
      "Owners को तुरंत reports भेजें",
      "Audit और tax filing आसान",
      "Free plan से शुरू कर सकते हैं",
    ],
  },
  audience: {
    h2: "किसके लिए है यह Labour Management App?",
    items: [
      { icon: HardHat, title: "Contractors", desc: "Labour ठेकेदारों के लिए complete solution।" },
      { icon: Building2, title: "Builders", desc: "बड़े projects का labour cost track करें।" },
      { icon: UserCog, title: "Project Managers", desc: "Sites का labour budget control करें।" },
      { icon: Truck, title: "Labour Suppliers", desc: "हर party के लिए अलग ledger।" },
    ],
  },
  howItWorks: {
    h2: "कैसे काम करता है?",
    steps: [
      { title: "Workers और Sites Add करें", desc: "एक बार setup, फिर रोज़ का काम आसान।" },
      { title: "Daily Attendance & Advance Entry", desc: "हर दिन हाजरी और advance तुरंत record करें।" },
      { title: "Auto Payroll & Reports", desc: "महीने के अंत में 1 click से payroll तैयार।" },
    ],
  },
  hindiBlock: {
    h2: "लेबर मैनेजमेंट अब आसान",
    paragraphs: [
      "“मजदूरों का पूरा हिसाब मोबाइल में” — KaamSaathi का यही वादा है। हर contractor, builder और site supervisor के लिए यह ऐप एक भरोसेमंद साथी है।",
      "ना कोई रजिस्टर, ना Excel की झंझट — बस एक मोबाइल और आपका labour business पूरी तरह organized।",
    ],
  },
  comparison: {
    h2: "Manual Tracking बनाम KaamSaathi",
    rows: [
      { label: "Advance tracking", old: "Notebook/memory", new: "App में log + history" },
      { label: "Wage calculation", old: "हाथ से, गलतियों के साथ", new: "Automatic, बिल्कुल सही" },
      { label: "Payment disputes", old: "बहुत common", new: "Record से तुरंत solve" },
      { label: "Monthly reports", old: "घंटों लगते हैं", new: "1 click में" },
      { label: "Site-wise cost", old: "अंदाज़ा", new: "Exact data" },
    ],
  },
  faqs: [
    { q: "Labour management app क्या है?", a: "Labour management app एक digital tool है जिससे contractor labour की attendance, payment, advance और payroll को मोबाइल से manage कर सकते हैं।" },
    { q: "क्या मैं advance और बकाया track कर सकता हूँ?", a: "हाँ, हर worker के लिए advance, payment और बकाया अलग-अलग दिखते हैं और auto-calculated होते हैं।" },
    { q: "क्या payroll अपने आप बनेगी?", a: "हाँ, daily wage, overtime, advance और deductions के basis पर app अपने आप payroll तैयार करता है।" },
    { q: "Multi-site labour कैसे handle होती है?", a: "Pro plan में unlimited sites — हर site का अलग labour list और अलग payment record।" },
    { q: "क्या यह app हिंदी में है?", a: "हाँ, app पूरी तरह से हिंदी और Hinglish में आसानी से इस्तेमाल हो सकता है।" },
    { q: "क्या free plan में labour management मिलता है?", a: "Free plan में 10 workers और 1 site तक पूरी labour management मिलती है।" },
    { q: "Reports owner को कैसे भेजें?", a: "1 click में PDF/Excel report बनेगी जो आप WhatsApp या email से तुरंत भेज सकते हैं।" },
    { q: "Data कितना secure है?", a: "Bank-level encryption के साथ data cloud पर store होता है। केवल आप access कर सकते हैं।" },
    { q: "Phone खो जाने पर data जाएगा?", a: "नहीं — आपका data cloud पर safe है। नए phone पर login करते ही सब वापस।" },
    { q: "Pro plan की कीमत क्या है?", a: "Pro plan ₹99/महीना से शुरू है। Annual plan में 2 महीने free मिलते हैं।" },
  ],
  finalCta: {
    h2: "Labour Management आसान करें — आज ही",
    sub: "रजिस्टर छोड़िए, मोबाइल से पूरी labour team manage कीजिए।",
  },
};

export default function LabourManagementApp() {
  return <SeoLandingPage data={data} />;
}
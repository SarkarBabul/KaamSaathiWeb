import { SeoLandingPage, type SeoLandingProps } from "@/components/kaamsaathi/SeoLandingPage";
import { CalendarCheck, Wallet, FileBarChart, MapPin, WifiOff, ShieldCheck, HardHat, Building2, UserCog, Truck, Users, ClipboardList } from "lucide-react";

const data: SeoLandingProps = {
  slug: "contractor-attendance-app",
  meta: {
    title: "Contractor Attendance App — Manage Workers & Payments | KaamSaathi",
    description: "KaamSaathi contractor attendance app — track labour attendance, payments and sites from your phone. ठेकेदारों के लिए सबसे आसान हाजरी ऐप। Free download.",
    keywords: "contractor attendance app, attendance app for contractors, contractor app for labour, ठेकेदार ऐप, ठेकेदार हाजरी ऐप, contractor labour app",
  },
  hero: {
    badge: "ठेकेदारों का No.1 ऐप",
    h1: "Contractor Attendance App — हर ठेकेदार की पहली पसंद",
    hindiSub: "ठेकेदारों के लिए बना हुआ, ठेकेदारों ने टेस्ट किया हुआ हाजरी ऐप।",
    intro: "Mark labour attendance, manage advances, calculate payroll और send reports — ठेकेदारों के लिए सब कुछ एक app में।",
  },
  intro: {
    h2: "ठेकेदारों के लिए विशेष रूप से बनाया गया App",
    paragraphs: [
      "एक ठेकेदार की ज़िंदगी आसान नहीं होती। एक तरफ owner से deal, दूसरी तरफ मजदूरों का payment और बीच में रोज़ की हाजरी और material का हिसाब। KaamSaathi contractor attendance app इन्हीं रोज़मर्रा की दिक्कतों को solve करने के लिए बनाया गया है।",
      "इस app की हर feature ठेकेदारों के साथ बैठकर design की गई है। यही वजह है कि चाहे आप 5 मजदूरों के साथ काम करते हों या 500, KaamSaathi आपके साथ scale करता है। Hindi-friendly interface, simple buttons और किसी भी training की ज़रूरत नहीं।",
      "Contractor attendance app होने का सबसे बड़ा फायदा यह है कि आप किसी भी site पर बिना जाए, अपने मोबाइल से देख सकते हैं कि कौन-कौन present है, कितना काम हुआ और कितना payment बनता है। Site supervisor की reports तुरंत आपके phone पर।",
      "महीने के अंत में जब payment का time आता है, तो KaamSaathi अपने आप हर मजदूर का wage, overtime और advance कम करके final amount दिखा देता है। Payment disputes लगभग खत्म।",
    ],
  },
  problems: {
    h2: "ठेकेदारों की रोज़ की दिक्कतें",
    items: [
      { icon: ClipboardList, title: "रजिस्टर का झंझट", desc: "हर site पर अलग रजिस्टर — manage करना मुश्किल।" },
      { icon: Wallet, title: "Advance भूलना", desc: "किसको कितना advance दिया, याद नहीं रहता।" },
      { icon: Users, title: "मजदूरों से बहस", desc: "हर महीने payment पर argument।" },
      { icon: MapPin, title: "Multiple Sites", desc: "एक site पर रहते हुए दूसरी का status नहीं पता।" },
      { icon: FileBarChart, title: "Owner को Reports", desc: "Reports बनाने में घंटों जाते हैं।" },
      { icon: ShieldCheck, title: "Data खोना", desc: "रजिस्टर भीगा या खोया तो record गया।" },
    ],
  },
  features: {
    h2: "Contractor Attendance App Features",
    items: [
      { icon: CalendarCheck, title: "1-Tap Attendance", desc: "हर मजदूर की हाजरी एक tap में।" },
      { icon: Wallet, title: "Payment & Advance", desc: "पूरा hisaab हमेशा up-to-date।" },
      { icon: MapPin, title: "Multi-Site Dashboard", desc: "सारी sites का overview एक screen में।" },
      { icon: FileBarChart, title: "Owner Reports", desc: "Owner को 1 click में reports send करें।" },
      { icon: WifiOff, title: "Offline Mode", desc: "Network ना हो तब भी काम चलता रहे।" },
      { icon: ShieldCheck, title: "Cloud Backup", desc: "हर record हमेशा safe।" },
    ],
  },
  benefits: {
    h2: "ठेकेदार KaamSaathi क्यों चुनते हैं?",
    items: [
      "रोज़ का 1 घंटा बचता है",
      "मजदूरों का transparent record",
      "Owner को timely reports — trust बढ़ता है",
      "Payment disputes कम",
      "Advance tracking 100% accurate",
      "Multiple sites एक मोबाइल से",
      "हिंदी में simple interface",
      "Free से शुरू करें, ज़रूरत पर upgrade",
    ],
  },
  audience: {
    h2: "हर तरह के ठेकेदार के लिए",
    items: [
      { icon: HardHat, title: "Civil Contractors", desc: "Construction labour management।" },
      { icon: Building2, title: "Sub-Contractors", desc: "Multiple parties का हिसाब।" },
      { icon: UserCog, title: "Site Supervisors", desc: "रोज़ की हाजरी owner को भेजें।" },
      { icon: Truck, title: "Labour Suppliers", desc: "हर party के लिए अलग ledger।" },
    ],
  },
  howItWorks: {
    h2: "ठेकेदार के लिए 3 Step",
    steps: [
      { title: "App Install करें", desc: "Play Store से free download।" },
      { title: "Sites & Workers Add", desc: "एक बार setup करें।" },
      { title: "रोज़ की हाजरी & हिसाब", desc: "मोबाइल से सब कुछ control।" },
    ],
  },
  hindiBlock: {
    h2: "“ठेकेदारों के लिए, ठेकेदारों का ऐप”",
    paragraphs: [
      "KaamSaathi को इस्तेमाल करने वाले ठेकेदार बताते हैं कि अब उनका रजिस्टर का काम लगभग खत्म हो गया है। मजदूरों की हाजरी, advance और payment — सब कुछ मोबाइल में।",
      "“पहले 2 घंटे रोज़ हिसाब में लगते थे, अब 5 minute में हो जाता है,” — यह सबसे common feedback है।",
    ],
  },
  comparison: {
    h2: "पुराना तरीका बनाम KaamSaathi",
    rows: [
      { label: "Daily time", old: "1–2 घंटे", new: "5–10 minutes" },
      { label: "Owner reports", old: "Manual, late", new: "Instant, professional" },
      { label: "Mistakes", old: "अक्सर", new: "लगभग शून्य" },
      { label: "Site control", old: "जाना ज़रूरी", new: "मोबाइल से" },
      { label: "Worker trust", old: "कम", new: "ज़्यादा (transparent)" },
    ],
  },
  faqs: [
    { q: "Contractor attendance app क्या है?", a: "यह एक mobile app है जिससे ठेकेदार अपने मजदूरों की हाजरी, payment और sites को मोबाइल से manage कर सकते हैं।" },
    { q: "क्या यह app मेरे जैसे small contractor के लिए है?", a: "बिल्कुल। चाहे 5 मजदूर हों या 500, KaamSaathi हर size के contractor के लिए perfect है।" },
    { q: "क्या मुझे training चाहिए?", a: "नहीं, app इतना simple है कि कोई भी 5 minute में सीख सकता है। हम WhatsApp पर भी help करते हैं।" },
    { q: "क्या मैं owner को directly reports भेज सकता हूँ?", a: "हाँ, 1 click में PDF/Excel report बनाकर WhatsApp या email से भेज सकते हैं।" },
    { q: "Multiple sites manage हो सकती हैं?", a: "Pro plan में unlimited sites — हर site का अलग record।" },
    { q: "क्या advance tracking मिलेगी?", a: "हाँ, हर worker का advance, payment और बकाया अलग-अलग track होता है।" },
    { q: "क्या site supervisor भी इस्तेमाल कर सकता है?", a: "हाँ, आप अपने supervisor को access दे सकते हैं — वो हाजरी लगाएगा, आप देखेंगे।" },
    { q: "क्या यह free है?", a: "Free plan में 10 workers और 1 site मुफ्त। Pro plan ₹99/महीना से।" },
    { q: "Internet ना हो तो?", a: "Offline mode काम करता है। Network आते ही data sync हो जाता है।" },
    { q: "Data secure है?", a: "हाँ, encrypted cloud पर — सिर्फ आप access कर सकते हैं।" },
  ],
  finalCta: {
    h2: "ठेकेदार बन कर smart काम करें",
    sub: "हज़ारों ठेकेदार KaamSaathi के साथ — आज आप भी जुड़िए।",
  },
};

export default function ContractorAttendanceApp() {
  return <SeoLandingPage data={data} />;
}
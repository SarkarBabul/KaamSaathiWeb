import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Smartphone,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  User,
  Phone,
} from "lucide-react";

type Step = "calendar" | "form" | "success";

const DEMO_TIME = "4:00 PM";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function KaamSaathiScheduleDemo() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("calendar");
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // Disable past dates and Sundays
    return date < now || date.getDay() === 0;
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setSelectedTime(null);
  };

  const handleTimeSelect = () => {
    setSelectedTime(DEMO_TIME);
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setStep("success");
    }, 1200);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `${days[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  };

  const isPrevDisabled =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <>
      <Helmet>
        <title>Schedule a Demo - KaamSaathi | Book Your Free Live Demo</title>
        <meta
          name="description"
          content="Book a free live demo of KaamSaathi - the smart attendance and workforce management app. Daily demos at 4 PM IST."
        />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">
                Kaam<span className="text-accent">Saathi</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Schedule a Live Demo
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              See KaamSaathi in action. Book a free 30-minute live demo with our team.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-5 py-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Daily Demo at 4:00 PM IST
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {step === "success" ? (
              /* ——— SUCCESS ——— */
              <Card className="max-w-lg mx-auto border-border shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Demo Booked Successfully!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Your demo has been scheduled for{" "}
                    <span className="font-semibold text-foreground">
                      {formatSelectedDate()}
                    </span>{" "}
                    at{" "}
                    <span className="font-semibold text-foreground">
                      {selectedTime}
                    </span>
                    .
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium">
                      <MessageCircle className="h-5 w-5" />
                      Demo details will be sent to your WhatsApp number
                    </div>
                    <p className="text-sm text-emerald-600 mt-1">
                      +91 {formData.phone}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Our team will share the meeting link and confirmation on WhatsApp shortly.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setStep("calendar");
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setFormData({ name: "", phone: "" });
                    }}
                  >
                    Book Another Demo
                  </Button>
                </CardContent>
              </Card>
            ) : step === "form" ? (
              /* ——— FORM ——— */
              <Card className="max-w-lg mx-auto border-border shadow-lg">
                <CardContent className="p-8">
                  <button
                    onClick={() => setStep("calendar")}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back to calendar
                  </button>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Enter Your Details
                  </h2>
                  <p className="text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">
                      {formatSelectedDate()}
                    </span>{" "}
                    at{" "}
                    <span className="font-medium text-foreground">
                      {selectedTime}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Web conferencing details will be sent on WhatsApp upon confirmation.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="demo-name">Full Name *</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="demo-name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          className="pl-10"
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="demo-phone">WhatsApp Number *</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="demo-phone"
                          type="tel"
                          placeholder="e.g. 9997394773"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                            })
                          }
                          required
                          className="pl-10"
                          maxLength={10}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Demo link & confirmation will be sent here
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submitting || formData.phone.length < 10}
                    >
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              /* ——— CALENDAR ——— */
              <div className="max-w-4xl mx-auto">
                <Card className="border-border shadow-lg">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
                      {/* Left panel */}
                      <div className="p-6 bg-muted/30">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="font-bold text-foreground">
                            Kaam<span className="text-primary">Saathi</span>
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-1">
                          KaamSaathi Live Demo
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                          <Clock className="h-4 w-4" /> 30 min
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Web conferencing details provided upon confirmation.
                        </p>
                      </div>

                      {/* Right panel */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            Select a Date & Time
                          </h3>
                        </div>

                        <div className="grid md:grid-cols-[1fr_180px] gap-6">
                          {/* Calendar grid */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <button
                                onClick={prevMonth}
                                disabled={isPrevDisabled}
                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                              >
                                <ChevronLeft className="h-5 w-5 text-foreground" />
                              </button>
                              <span className="font-semibold text-foreground">
                                {MONTH_NAMES[currentMonth]} {currentYear}
                              </span>
                              <button
                                onClick={nextMonth}
                                className="p-1 rounded hover:bg-muted transition-colors"
                              >
                                <ChevronRight className="h-5 w-5 text-foreground" />
                              </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                              {DAY_NAMES.map((d) => (
                                <div key={d} className="py-1">
                                  {d}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                              {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} />
                              ))}
                              {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const disabled = isDateDisabled(day);
                                const selected = isSelected(day);
                                const todayDay = isToday(day);

                                return (
                                  <button
                                    key={day}
                                    disabled={disabled}
                                    onClick={() => handleDateSelect(day)}
                                    className={`h-10 w-10 mx-auto rounded-full text-sm font-medium transition-colors ${
                                      selected
                                        ? "bg-primary text-primary-foreground"
                                        : todayDay
                                        ? "border-2 border-primary text-primary"
                                        : disabled
                                        ? "text-muted-foreground/40 cursor-not-allowed"
                                        : "text-foreground hover:bg-primary/10"
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Time slots */}
                          <div>
                            {selectedDate ? (
                              <>
                                <p className="text-sm font-semibold text-foreground mb-3">
                                  {formatSelectedDate()}
                                </p>
                                <button
                                  onClick={handleTimeSelect}
                                  className="w-full py-3 px-4 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-colors text-center"
                                >
                                  {DEMO_TIME}
                                </button>
                                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" /> India Standard Time
                                </p>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                                <CalendarDays className="h-8 w-8 mb-2 opacity-40" />
                                Select a date to see available times
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
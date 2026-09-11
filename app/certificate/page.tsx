"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { getCurrentCitizen, requestCertificate, refreshCitizen, type Citizen, type Certificate } from "@/lib/store";
import { CheckCircle2, ArrowRight, Download } from "lucide-react";

const ACHIEVEMENTS = [
  "Always Late Award",
  "Professional Sleeper",
  "Phone Usage Champion",
  "Biscuit Champion",
  "Professional Gamer",
  "Couch Potato",
  "Professional Overthinker",
  "Tea/Coffee Specialist",
  "Custom Achievement",
];

const TALENT_SUGGESTIONS: Record<string, string> = {
  "sleeping for": "Professional Sleep Specialist",
  "late": "Certified Tardiness Expert",
  "phone": "Distinguished Mobile Device Operator",
  "eat": "Culinary Consumption Specialist",
  "overthink": "Advanced Cognitive Overload Practitioner",
  "procrastinat": "Master of Strategic Delay",
  "forget": "Memory Management Consultant",
  "nap": "Certified Nap Technician",
};

function generateTitle(talent: string): string {
  const lower = talent.toLowerCase();
  for (const [key, title] of Object.entries(TALENT_SUGGESTIONS)) {
    if (lower.includes(key)) return title;
  }
  return "Distinguished Practitioner of Questionable Skills";
}

export default function CertificatePage() {
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [achievement, setAchievement] = useState("");
  const [customTalent, setCustomTalent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  useEffect(() => {
    const c = getCurrentCitizen();
    if (!c) { router.push("/login"); return; }
    setCitizen(refreshCitizen(c.id) ?? c);
  }, [router]);

  const finalAchievement = achievement === "Custom Achievement" && generatedTitle
    ? generatedTitle
    : achievement;

  const handleGenerateTitle = () => {
    if (!customTalent.trim()) return;
    setGeneratedTitle(generateTitle(customTalent));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!finalAchievement) {
      setError("Please select or generate an achievement. The Ministry cannot issue blank certificates.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const cert = requestCertificate(citizen!.id, finalAchievement);
      setResult(cert);
      setLoading(false);
    }, 1000);
  };

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#fffaf0" });
      const link = document.createElement("a");
      link.download = `MUA-Certificate-${result?.id ?? "cert"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Download requires html2canvas. Run: npm install html2canvas");
    }
  };

  if (!citizen) return null;

  const certAchievement = result ? result.achievement : (finalAchievement || "Your Achievement Here");
  const certDate = result ? result.requestedAt : today;
  const certId = result?.id;

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#efe6ce] text-[#7a5a12] px-3 py-1 rounded-full">
            Certificate Services · Form MUA-CERT-001
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-black text-[#172235] mt-4">Request for a Certificate</h1>
          <p className="text-[#818792] mt-3 leading-7">
            Apply for official recognition of your completely unnecessary achievement.
          </p>
        </div>

        {/* Certificate Preview — always visible */}
        <div ref={certRef}
          className="bg-[#fffaf0] border-[6px] border-double border-[#c9a44b] rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-3 border border-dashed border-[#c9a44b] rounded-xl pointer-events-none" />
          <div className="relative">
            <img src="/mua-logo.png" alt="MUA" className="h-16 w-16 object-contain mx-auto mb-3" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9b1c31]">Ministry of Useless Affairs</p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#818792]">Republic of Questionable Decisions</p>
            <div className="my-4 h-px bg-[#c9a44b]" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#818792]">Certificate of Recognition</p>
            <p className="font-serif text-lg mt-3 text-[#818792]">This is to officially certify that</p>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-[#172235] mt-2">{citizen.name}</h2>
            <p className="font-serif text-lg mt-3 text-[#818792]">has demonstrated exceptional and entirely unnecessary proficiency in</p>
            <h3 className="font-serif text-2xl md:text-3xl font-black text-[#9b1c31] mt-2 px-4">{certAchievement}</h3>
            <p className="text-sm text-[#818792] mt-4">
              Awarded on <span className="font-bold">{certDate}</span>
            </p>
            {certId && <p className="text-[10px] text-[#818792] mt-1">{certId}</p>}
            <div className="my-5 h-px bg-[#c9a44b]" />
            <div className="grid grid-cols-2 gap-8 mt-4 max-w-sm mx-auto">
              <div className="text-center">
                <div className="h-8 border-b-2 border-[#172235] mb-1 flex items-end justify-center">
                  <span className="font-serif italic text-lg text-[#172235]">Senthil</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Chief Useless Officer</p>
              </div>
              <div className="text-center">
                <div className="h-8 border-b-2 border-[#172235] mb-1 flex items-end justify-center">
                  <span className="font-serif italic text-lg text-[#172235]">Parvathy</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Deputy Useless Officer</p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#9b1c31] bg-[#fde8e8]">
              <span className="text-[8px] font-black uppercase leading-3 text-[#9b1c31] text-center">Ministry<br/>Seal</span>
            </div>
          </div>
        </div>

        {result ? (
          <div className="bg-[#fffaf0] border-2 border-[#172235] rounded-2xl overflow-hidden shadow-[6px_6px_0_#172235]">
            <div className="bg-[#172235] px-7 py-5 text-white flex items-center gap-3">
              <CheckCircle2 size={22} className="text-[#e8c878]" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8c878]">Certificate Successfully Issued</p>
                <h2 className="font-serif text-2xl font-black mt-0.5">Application Confirmed</h2>
              </div>
            </div>
            <div className="p-7 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#f4efe4] rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Application ID</p>
                  <p className="font-black text-xl text-[#172235] mt-1">{result.id}</p>
                </div>
                <div className="bg-[#f4efe4] rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Points Earned</p>
                  <p className="font-black text-xl text-[#c9a44b] mt-1">+20 pts</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-3 bg-[#172235] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#0f1a2a] transition">
                  <Download size={14} /> Download Certificate
                </button>
                <Link href="/track" className="flex items-center gap-2 px-5 py-3 border-2 border-[#172235] rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#eee8dc] transition">
                  Track Application <ArrowRight size={14} />
                </Link>
                <Link href="/dashboard" className="px-5 py-3 border-2 border-[#172235] rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#eee8dc] transition">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4 animate-bounce">🏆</div>
            <p className="font-black uppercase tracking-widest text-sm text-[#172235]">Preparing Your Certificate...</p>
            <p className="text-sm text-[#818792] mt-2">The Ministry is applying its official seal.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7 md:p-9 space-y-7">
            {error && (
              <div className="rounded-lg border-2 border-[#9b1c31] bg-[#fde8e8] px-4 py-3 text-sm font-bold text-[#9b1c31]">⚠ {error}</div>
            )}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-2">Citizen Name</label>
              <input value={citizen.name} readOnly
                className="w-full border-2 border-[#ded6c9] bg-[#f4efe4] rounded-xl px-4 py-3 text-sm font-bold text-[#818792] cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-3">Select Achievement</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {ACHIEVEMENTS.map((a) => (
                  <label key={a} className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${achievement === a ? "border-[#7a5a12] bg-[#efe6ce]" : "border-[#ded6c9] bg-white hover:border-[#c9a44b]"}`}>
                    <input type="radio" name="achievement" value={a} checked={achievement === a} onChange={() => setAchievement(a)} className="accent-[#7a5a12]" />
                    <span className="text-sm font-bold">{a}</span>
                  </label>
                ))}
              </div>
            </div>
            {achievement === "Custom Achievement" && (
              <div className="bg-[#f4efe4] border border-[#c9a44b] rounded-xl p-5 space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-[0.18em]">Describe Your Useless Talent</label>
                <textarea value={customTalent} onChange={(e) => setCustomTalent(e.target.value)}
                  placeholder='e.g. "My useless talent is sleeping for 12 hours and still feeling tired."'
                  rows={3}
                  className="w-full border-2 border-[#172235] bg-white rounded-xl px-4 py-3 text-sm outline-none focus:bg-[#fff8d9] transition resize-none" />
                <button type="button" onClick={handleGenerateTitle}
                  className="px-4 py-2 bg-[#172235] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.1em] hover:bg-[#0f1a2a] transition">
                  Generate Official Title
                </button>
                {generatedTitle && (
                  <div className="bg-[#efe6ce] rounded-lg px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#7a5a12]">Generated Title</p>
                    <p className="font-bold text-[#172235] mt-1">{generatedTitle}</p>
                  </div>
                )}
              </div>
            )}
            <button type="submit"
              className="w-full h-14 rounded-xl border-2 border-[#172235] bg-[#7a5a12] text-white text-[12px] font-black uppercase tracking-[0.1em] shadow-[5px_5px_0_#172235] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#172235] transition">
              Request Official Certificate →
            </button>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}

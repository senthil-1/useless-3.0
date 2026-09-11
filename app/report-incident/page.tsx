"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { getCurrentCitizen, submitIncident, refreshCitizen, type Citizen, type Incident } from "@/lib/store";
import { CheckCircle2, ArrowRight } from "lucide-react";

const INCIDENT_TYPES = [
  "Lost My Pen",
  "Someone Took My Seat",
  "Someone Ate My Food",
  "Charger Missing",
  "Friend Arrived Late",
  "Someone Didn't Reply",
  "Someone Took My Favorite Spot",
  "Other",
];
const PEOPLE = ["Friend", "Sibling", "Roommate", "Classmate", "Unknown", "Other"];
const SEVERITIES = ["Mild", "Annoying", "Very Serious", "Extremely Serious"];

export default function ReportIncidentPage() {
  const router = useRouter();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [person, setPerson] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Incident | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const c = getCurrentCitizen();
    if (!c) { router.push("/login"); return; }
    setCitizen(refreshCitizen(c.id) ?? c);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!type || !description.trim() || !person || !severity) {
      setError("Please fill in all fields. The Ministry requires complete information.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const incident = submitIncident(citizen!.id, type, description, person, severity);
      setResult(incident);
      setLoading(false);
    }, 1000);
  };

  if (!citizen) return null;

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#fde8e8] text-[#9b1c31] px-3 py-1 rounded-full">
            Incident Reporting · Form MUA-INC-001
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-black text-[#172235] mt-4">Report an Incident</h1>
          <p className="text-[#818792] mt-3 leading-7">
            Submit an official complaint regarding an issue of questionable importance.
          </p>
        </div>

        {result ? (
          <div className="bg-[#fffaf0] border-2 border-[#172235] rounded-2xl overflow-hidden shadow-[6px_6px_0_#172235]">
            <div className="bg-[#172235] px-7 py-5 text-white">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={22} className="text-[#e8c878]" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8c878]">Incident Successfully Registered</p>
                  <h2 className="font-serif text-2xl font-black mt-0.5">Case Created</h2>
                </div>
              </div>
            </div>
            <div className="p-7 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#f4efe4] rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Case ID</p>
                  <p className="font-black text-xl text-[#172235] mt-1">{result.id}</p>
                </div>
                <div className="bg-[#f4efe4] rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Department</p>
                  <p className="font-bold text-sm text-[#172235] mt-1">{result.department}</p>
                </div>
                <div className="bg-[#f4efe4] rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Status</p>
                  <p className="font-bold text-sm text-[#9b1c31] mt-1">{result.status}</p>
                </div>
                <div className="bg-[#f4efe4] rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Points Earned</p>
                  <p className="font-black text-xl text-[#c9a44b] mt-1">+10 pts</p>
                </div>
              </div>
              <div className="bg-[#efe6ce] rounded-xl p-5 border border-[#c9a44b]">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#7a5a12] mb-2">Official Ministry Message</p>
                <p className="text-sm leading-6 text-[#172235] italic">
                  "Your complaint has been forwarded to the appropriate department for unnecessarily serious consideration."
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/track" className="flex items-center gap-2 px-5 py-3 bg-[#172235] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#0f1a2a] transition">
                  Track This Case <ArrowRight size={14} />
                </Link>
                <button onClick={() => { setResult(null); setType(""); setDescription(""); setPerson(""); setSeverity(""); }}
                  className="px-5 py-3 border-2 border-[#172235] rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#eee8dc] transition">
                  Report Another
                </button>
                <Link href="/dashboard" className="px-5 py-3 border-2 border-[#172235] rounded-xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#eee8dc] transition">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4 animate-bounce">📋</div>
            <p className="font-black uppercase tracking-widest text-sm text-[#172235]">Processing Your Complaint...</p>
            <p className="text-sm text-[#818792] mt-2">An officer has been assigned to think about your problem.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7 md:p-9 space-y-7">
            {error && (
              <div className="rounded-lg border-2 border-[#9b1c31] bg-[#fde8e8] px-4 py-3 text-sm font-bold text-[#9b1c31]">
                ⚠ {error}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-2">Incident Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full border-2 border-[#172235] bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-[#fff8d9] transition">
                <option value="">Select an incident type</option>
                {INCIDENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the unnecessary situation in full detail. The Ministry takes all complaints equally seriously."
                rows={4}
                className="w-full border-2 border-[#172235] bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-[#fff8d9] transition resize-none" />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-2">Person Involved</label>
              <select value={person} onChange={(e) => setPerson(e.target.value)}
                className="w-full border-2 border-[#172235] bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-[#fff8d9] transition">
                <option value="">Select a person</option>
                {PEOPLE.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-3">Severity</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {SEVERITIES.map((s) => (
                  <label key={s} className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${severity === s ? "border-[#9b1c31] bg-[#fde8e8]" : "border-[#ded6c9] bg-white hover:border-[#9b1c31]"}`}>
                    <input type="radio" name="severity" value={s} checked={severity === s} onChange={() => setSeverity(s)} className="accent-[#9b1c31]" />
                    <span className="text-sm font-bold">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit"
              className="w-full h-14 rounded-xl border-2 border-[#172235] bg-[#9b1c31] text-white text-[12px] font-black uppercase tracking-[0.1em] shadow-[5px_5px_0_#172235] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#172235] transition">
              Submit Incident →
            </button>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}

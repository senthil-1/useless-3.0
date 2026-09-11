"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { getCurrentCitizen, findApplicationById, type Application } from "@/lib/store";
import { SearchCheck, CheckCircle2, Clock, FileText, Building2, Calendar, ArrowRight } from "lucide-react";

const TIMELINE_STEPS = [
  "Application Submitted",
  "Department Assigned",
  "Under Review",
  "Investigation / Processing",
  "Completed",
  "Closed",
];

const STATUS_MESSAGES: Record<string, string> = {
  "Under Investigation": "Your application is currently being taken very seriously by someone who has been assigned to think about it.",
  "Pending": "The responsible officer is currently unavailable. They may be at lunch, or thinking about lunch.",
  "Under Review": "Your application is currently being taken very seriously.",
  "Certificate Issued": "Your achievement has been officially recognised. The Ministry congratulates you on your unnecessary accomplishment.",
  "Completed": "Your problem has been officially handled. Nothing has changed, but it has been handled.",
  "Closed": "The Ministry has decided that this matter requires no further government attention.",
};

function getTimelineStep(status: string): number {
  if (status === "Application Submitted") return 0;
  if (status === "Department Assigned") return 1;
  if (status === "Under Review") return 2;
  if (status === "Under Investigation") return 3;
  if (status === "Certificate Issued" || status === "Completed") return 4;
  if (status === "Closed") return 5;
  return 2;
}

export default function TrackPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Application | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const c = getCurrentCitizen();
    if (!c) { router.push("/login"); return; }
    setReady(true);
  }, [router]);

  const handleTrack = () => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    const found = findApplicationById(trimmed);
    setResult(found);
    setSearched(true);
    setNotFound(!found);
  };

  if (!ready) return null;

  const currentStep = result ? getTimelineStep(
    result.kind === "incident" ? result.data.status : result.data.status
  ) : 0;

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#e4ebf2] text-[#172235] px-3 py-1 rounded-full">
            Application Tracking · Form MUA-TRK-001
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-black text-[#172235] mt-4">Track Application</h1>
          <p className="text-[#818792] mt-3 leading-7">
            Enter your Application ID or Case ID to discover the current state of your bureaucracy.
          </p>
        </div>

        {/* Search */}
        <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7 mb-6">
          <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-3">Case / Application ID</label>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="e.g. MUA-2026-1001 or MUA-CERT-1001"
              className="flex-1 border-2 border-[#172235] bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-[#fff8d9] transition"
            />
            <button onClick={handleTrack}
              className="flex items-center gap-2 px-5 py-3 bg-[#9b1c31] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.1em] border-2 border-[#172235] shadow-[3px_3px_0_#172235] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#172235] transition">
              <SearchCheck size={16} /> Track
            </button>
          </div>
        </div>

        {/* Not found */}
        {searched && notFound && (
          <div className="bg-[#fde8e8] border-2 border-[#9b1c31] rounded-2xl p-7 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-black uppercase tracking-widest text-sm text-[#9b1c31]">Application Not Found</h3>
            <p className="text-sm text-[#818792] mt-2">
              The Ministry has no record of this ID. Please check your Case ID and try again.
              The Ministry does not lose applications. It simply gives them exciting new locations.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            {/* Details card */}
            <div className="bg-[#fffaf0] border-2 border-[#172235] rounded-2xl overflow-hidden shadow-[5px_5px_0_#172235]">
              <div className="bg-[#172235] px-7 py-5 text-white flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[#e8c878]" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8c878]">
                    {result.kind === "incident" ? "Incident Report" : "Certificate Application"}
                  </p>
                  <h2 className="font-serif text-2xl font-black mt-0.5">
                    {result.kind === "incident" ? result.data.type : result.data.achievement}
                  </h2>
                </div>
              </div>
              <div className="p-7">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-[#9b1c31] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Application ID</p>
                      <p className="font-black text-[#172235] mt-0.5">{result.kind === "incident" ? result.data.id : result.data.id}</p>
                    </div>
                  </div>
                  {result.kind === "incident" && (
                    <div className="flex items-start gap-3">
                      <Building2 size={16} className="text-[#9b1c31] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Department</p>
                        <p className="font-bold text-sm text-[#172235] mt-0.5">{result.data.department}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-[#9b1c31] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Date Submitted</p>
                      <p className="font-bold text-sm text-[#172235] mt-0.5">
                        {result.kind === "incident" ? result.data.submittedAt : result.data.requestedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-[#9b1c31] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Current Status</p>
                      <p className="font-black text-[#9b1c31] mt-0.5">{result.data.status}</p>
                    </div>
                  </div>
                </div>

                {/* Status message */}
                <div className="bg-[#efe6ce] border border-[#c9a44b] rounded-xl p-5 mb-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#7a5a12] mb-2">Official Status Update</p>
                  <p className="text-sm leading-6 italic text-[#172235]">
                    "{STATUS_MESSAGES[result.data.status] ?? STATUS_MESSAGES["Under Investigation"]}"
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#818792] mb-4">Progress Timeline</p>
                  <div className="space-y-0">
                    {TIMELINE_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition ${active ? "border-[#9b1c31] bg-[#9b1c31] text-white" : done ? "border-[#c9a44b] bg-[#efe6ce] text-[#7a5a12]" : "border-[#ded6c9] bg-white text-[#818792]"}`}>
                              {done && !active ? "✓" : i + 1}
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                              <div className={`w-0.5 h-6 ${done ? "bg-[#c9a44b]" : "bg-[#ded6c9]"}`} />
                            )}
                          </div>
                          <div className="pb-4 pt-1">
                            <p className={`text-sm font-bold ${active ? "text-[#9b1c31]" : done ? "text-[#172235]" : "text-[#818792]"}`}>{step}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final decision for incidents */}
                {result.kind === "incident" && result.data.finalDecision && (
                  <div className="mt-6 bg-[#172235] text-white rounded-xl p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8c878] mb-3">Final Decision</p>
                    <p className="text-sm leading-6 italic">"{result.data.finalDecision}"</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-[#9b1c31] px-3 py-1 rounded-full">
                        Case Status: Closed
                      </span>
                    </div>
                  </div>
                )}

                {/* Certificate view button */}
                {result.kind === "certificate" && (
                  <div className="mt-6 bg-[#efe6ce] border border-[#c9a44b] rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#7a5a12]">Status</p>
                      <p className="font-black text-[#172235] mt-1">Certificate Issued ✓</p>
                    </div>
                    <Link href="/certificate"
                      className="flex items-center gap-2 px-4 py-2 bg-[#7a5a12] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.1em] hover:bg-[#5a4010] transition">
                      View Certificate <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

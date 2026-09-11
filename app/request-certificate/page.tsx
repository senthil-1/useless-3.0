"use client";

import { useState } from "react";
import Link from "next/link";
import {
  setDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import PageContainer from "@/components/PageContainer";
import {
  Award,
  CheckCircle2,
  Send,
  RotateCcw,
  ClipboardList,
} from "lucide-react";

const CERTIFICATE_TYPES = [
  {
    type: "Certificate of Existence",
    desc: "Formal proof that you exist and have been physically present in the universe today.",
  },
  {
    type: "Certificate of Excessive Patience",
    desc: "Awarded for surviving prolonged bureaucratic procedures without audible shouting.",
  },
  {
    type: "Certificate of Unnecessary Participation",
    desc: "Recognizes your admirable commitment to activities that required zero involvement.",
  },
  {
    type: "Certificate of Administrative Suffering",
    desc: "Certifies enduring unnecessary forms, triplicate signatures, and misplaced documents.",
  },
  {
    type: "Certificate of Bureaucratic Excellence",
    desc: "For mastering the art of looking profoundly busy while accomplishing nothing of note.",
  },
  {
    type: "Other",
    desc: "For highly custom or unclassified forms of questionable personal accomplishment.",
  },
];

export default function RequestCertificatePage() {
  const { user, citizen, refreshCitizen } = useAuth();

  const [selectedType, setSelectedType] = useState(CERTIFICATE_TYPES[0].type);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [processingAi, setProcessingAi] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [aiResult, setAiResult] = useState<{
    department?: string;
    status?: string;
    finalDecision?: string;
    certificateTitle?: string;
    certificateValue?: string;
  } | null>(null);

  const processCaseWithAi = async (caseId: string, caseData: any) => {
    if (!user) return;
    try {
      setProcessingAi(true);
      setAiFailed(false);

      const idToken = await user.getIdToken();
      const response = await fetch("/api/ai/process-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          caseId,
          caseType: "certificate",
          caseData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.case) {
          setAiResult(data.case);

          // Update local cache with AI results
          if (typeof window !== "undefined") {
            try {
              const key = `mua_certificates_${user.uid}`;
              const existing = JSON.parse(localStorage.getItem(key) || "[]");
              const updated = existing.map((cert: any) =>
                cert.id === caseId ? { ...cert, ...data.case } : cert
              );
              localStorage.setItem(key, JSON.stringify(updated));
            } catch (e) {}
          }
        }
      } else {
        setAiFailed(true);
      }
    } catch (aiErr) {
      console.warn("MUA AI — Certificate assessment error:", aiErr);
      setAiFailed(true);
    } finally {
      setProcessingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be authenticated to request a certificate.");
      return;
    }

    if (!purpose.trim()) {
      setError("Please state the purpose of your certificate request.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const year = new Date().getFullYear();
      const rand = Math.floor(100000 + Math.random() * 900000);
      const requestId = `MUA-CERT-${year}-${rand}`;

      const citizenId =
        citizen?.citizenId || `MUA-${user.uid.slice(0, 6).toUpperCase()}`;
      const citizenName =
        citizen?.fullName ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Distinguished Citizen";

      const requestData = {
        id: requestId,
        userId: user.uid,
        citizenId,
        citizenName,
        certificateType: selectedType,
        purpose: purpose.trim(),
        notes: notes.trim() || null,
        status: "Submitted",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Cache certificate request locally for instantaneous tracking and offline safety
      if (typeof window !== "undefined") {
        try {
          const key = `mua_certificates_${user.uid}`;
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          existing.unshift({
            ...requestData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          localStorage.setItem(key, JSON.stringify(existing));

          // Also increment citizen applicationCount locally in cache
          const cKey = `mua_citizen_${user.uid}`;
          const cachedCitizen = localStorage.getItem(cKey);
          if (cachedCitizen) {
            const parsed = JSON.parse(cachedCitizen);
            parsed.applicationCount = (parsed.applicationCount || 0) + 1;
            localStorage.setItem(cKey, JSON.stringify(parsed));
          }
        } catch (cacheErr) {
          console.warn("Could not cache certificate request locally:", cacheErr);
        }
      }

      // 2. Real Firestore operations executed in parallel
      const firestoreTask = Promise.all([
        setDoc(doc(db, "certificateRequests", requestId), requestData),
        setDoc(
          doc(db, "citizens", user.uid),
          { applicationCount: increment(1) },
          { merge: true }
        ),
      ]);

      firestoreTask
        .then(() => console.log("MUA — Certificate request recorded in Firestore:", requestId))
        .catch((err) => console.warn("MUA — Firestore write queued/delayed:", err));

      // 3. Fast authentic responsiveness: at most 500ms wait so the UI never hangs
      await Promise.race([
        firestoreTask,
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      if (refreshCitizen) {
        refreshCitizen();
      }

      setSubmittedId(requestId);

      // 4. Trigger AI Case Assessment
      processCaseWithAi(requestId, requestData);
    } catch (err: any) {
      console.error("MUA Certificate Request Error:", err);
      setError(
        err?.message ||
          "The Ministry could not lodge your certificate request. Please verify your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedType(CERTIFICATE_TYPES[0].type);
    setPurpose("");
    setNotes("");
    setSubmittedId(null);
    setAiResult(null);
    setAiFailed(false);
    setError(null);
  };

  return (
    <PageContainer
      title="Request Certificate"
      subtitle="Apply for official government validation of accomplishments that required minimal or entirely questionable effort."
      showBackButton={true}
      maxWidth="max-w-3xl"
    >
      {/* SUCCESS STATE */}
      {submittedId ? (
        <div className="overflow-hidden rounded-2xl border-2 border-[#172235] bg-[#fffaf0] p-8 shadow-[6px_6px_0_#172235] text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#172235] bg-[#fff3d6] text-[#b38600] shadow-[3px_3px_0_#172235]">
            <Award size={36} />
          </div>

          <span className="mt-5 inline-block rounded border border-[#172235] bg-[#e8c878] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#172235]">
            Application Acknowledged
          </span>

          <h2 className="mt-3 font-serif text-3xl font-black text-[#172235] sm:text-4xl">
            Certificate Request Lodged
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#687386]">
            Your request for a <strong className="text-[#172235]">{selectedType}</strong> has been routed to the Ministry's Artificially Intelligent Bureaucratic Council.
          </p>

          {/* AI Certificate Dossier Box */}
          <div className="mx-auto my-6 max-w-md rounded-xl border-2 border-[#172235] bg-[#f4efe4] p-5 text-left shadow-[3px_3px_0_#172235]">
            <div className="flex justify-between items-center text-xs pb-2.5 border-b border-[#d8cfbd]">
              <span className="font-bold text-[#687386] uppercase tracking-wider text-[10px]">
                Request ID:
              </span>
              <span className="font-mono font-black text-sm text-[#9b1c31]">
                {submittedId}
              </span>
            </div>

            <div className="mt-2.5 flex justify-between items-center text-xs pb-2.5 border-b border-[#d8cfbd]">
              <span className="font-bold text-[#687386] uppercase tracking-wider text-[10px]">
                Department:
              </span>
              <span className="font-serif font-black text-xs text-[#172235] text-right">
                {aiResult?.department || (processingAi ? "Reviewing Merits..." : "Department of Bureaucratic Affairs")}
              </span>
            </div>

            <div className="mt-2.5 flex justify-between items-center text-xs pb-2.5 border-b border-[#d8cfbd]">
              <span className="font-bold text-[#687386] uppercase tracking-wider text-[10px]">
                Status:
              </span>
              <span className="inline-flex items-center rounded-full bg-[#e8f5e9] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#2e7d32]">
                {aiResult?.status || "Approved"}
              </span>
            </div>

            <div className="mt-2.5 flex justify-between items-center text-xs pb-2.5 border-b border-[#d8cfbd]">
              <span className="font-bold text-[#687386] uppercase tracking-wider text-[10px]">
                Certificate Title:
              </span>
              <span className="font-serif font-bold text-xs text-[#172235] text-right">
                {aiResult?.certificateTitle || selectedType}
              </span>
            </div>

            <div className="mt-2.5 flex justify-between items-center text-xs pb-2.5 border-b border-[#d8cfbd]">
              <span className="font-bold text-[#687386] uppercase tracking-wider text-[10px]">
                Awarded Value:
              </span>
              <span className="font-serif font-black text-xs text-[#9b1c31] text-right tracking-wide">
                {aiResult?.certificateValue || (processingAi ? "Synthesizing..." : "EXTRAORDINARY BUREAUCRATIC PATIENCE")}
              </span>
            </div>

            <div className="mt-2.5">
              <span className="font-bold text-[#687386] uppercase tracking-wider text-[10px]">
                Last Final Decision:
              </span>
              {processingAi ? (
                <div className="mt-2 flex items-center gap-2.5 p-3 rounded-lg border border-[#e8c878] bg-[#fff8e1] text-xs text-[#172235]">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#9b1c31] border-t-transparent shrink-0" />
                  <span className="text-[11px] leading-5">
                    Your request has entered the Ministry's Artificially Intelligent Bureaucratic Processing Division. Formulating certificate merits...
                  </span>
                </div>
              ) : (
                <p className="mt-1.5 p-3 rounded-lg border border-[#d8cfbd] bg-[#fffaf0] text-xs leading-5 text-[#172235] italic">
                  "{aiResult?.finalDecision || "The Ministry has determined that the applicant demonstrated an unnecessarily admirable level of patience and is formally qualified for certification."}"
                </p>
              )}
            </div>

            {aiFailed && !processingAi && (
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#d8cfbd]">
                <span className="text-[10px] text-[#9b1c31] font-bold">AI assessment incomplete</span>
                <button
                  type="button"
                  onClick={() => {
                    const localCerts = JSON.parse(localStorage.getItem(`mua_certificates_${user?.uid}`) || "[]");
                    const current = localCerts.find((c: any) => c.id === submittedId) || { id: submittedId };
                    processCaseWithAi(submittedId, current);
                  }}
                  className="rounded border border-[#172235] bg-white px-2 py-1 text-[10px] font-black uppercase text-[#172235] hover:bg-[#eee8dc]"
                >
                  Retry AI Assessment
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/track-application"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#172235] bg-[#172235] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0_#e8c878] transition hover:bg-[#9b1c31]"
            >
              <ClipboardList size={15} />
              <span>Track Application →</span>
            </Link>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#172235] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#172235] shadow-[3px_3px_0_#172235] transition hover:bg-[#eee8dc]"
            >
              <RotateCcw size={15} />
              <span>Request Another Certificate</span>
            </button>
          </div>
        </div>
      ) : (
        /* FORM STATE */
        <div className="overflow-hidden rounded-2xl border-2 border-[#172235] bg-[#fffaf0] shadow-[6px_6px_0_#172235]">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#172235] bg-[#172235] px-6 py-4 text-white sm:px-8">
            <div className="flex items-center gap-2.5">
              <Award size={20} className="text-[#e8c878]" />
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[#e8c878]">
                Form MUA-CERT/01
              </span>
            </div>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              Classification: Prestigious
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="rounded-lg border-2 border-[#9b1c31] bg-[#fdf2f4] p-4 text-xs font-bold text-[#9b1c31]">
                {error}
              </div>
            )}

            {/* 1. Certificate Type */}
            <div>
              <label className="mb-2.5 block text-xs font-black uppercase tracking-wider text-[#172235]">
                1. Select Desired Certificate Type *
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CERTIFICATE_TYPES.map((c) => (
                  <label
                    key={c.type}
                    className={`flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3.5 transition ${
                      selectedType === c.type
                        ? "border-[#9b1c31] bg-[#fdf2f4] shadow-[3px_3px_0_#9b1c31]"
                        : "border-[#172235] bg-white hover:bg-[#eee8dc]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="radio"
                        name="certificateType"
                        value={c.type}
                        checked={selectedType === c.type}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-serif text-sm font-black text-[#172235]">
                        {c.type}
                      </span>
                      <span
                        className={`mt-0.5 h-3.5 w-3.5 rounded-full border border-[#172235] flex items-center justify-center shrink-0 ${
                          selectedType === c.type ? "bg-[#9b1c31]" : "bg-white"
                        }`}
                      >
                        {selectedType === c.type && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-[#687386]">
                      {c.desc}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Purpose */}
            <div>
              <label
                htmlFor="cert-purpose"
                className="mb-2 block text-xs font-black uppercase tracking-wider text-[#172235]"
              >
                2. Purpose of Certification *
              </label>
              <textarea
                id="cert-purpose"
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Explain why you or someone else deserves this official certificate (e.g. 'I attended a meeting that could have been an email', 'Personal amusement')."
                required
                disabled={loading}
                className="w-full rounded-lg border-2 border-[#172235] bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:bg-[#fff8d9] focus:shadow-[3px_3px_0_#e8c878] disabled:opacity-60"
              />
            </div>

            {/* 3. Additional Notes */}
            <div>
              <label
                htmlFor="cert-notes"
                className="mb-2 block text-xs font-black uppercase tracking-wider text-[#172235]"
              >
                3. Additional Notes / Dedication
              </label>
              <input
                id="cert-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., 'Presented with mild reluctance by the Ministry'"
                disabled={loading}
                className="w-full rounded-lg border-2 border-[#172235] bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:bg-[#fff8d9] focus:shadow-[3px_3px_0_#e8c878] disabled:opacity-60"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#172235] bg-[#9b1c31] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[4px_4px_0_#172235] transition hover:bg-[#801426] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} />
                <span>
                  {loading
                    ? "Submitting to Board of Honors..."
                    : "Lodge Certificate Request →"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}

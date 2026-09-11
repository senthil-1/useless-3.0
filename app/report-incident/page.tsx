"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/AuthGuard";

const categories = ["Excessive Paperwork", "Unnecessary Waiting", "Missing Signature", "Wrong Form", "Form Requesting Another Form", "Departmental Confusion", "Missing Pen", "Stolen Seat", "Missing Charger", "Other"];
const severities = ["Mild", "Annoying", "Very Serious", "Extremely Serious 😂"];

function ReportIncidentPage() {
  const { user, citizen, refreshCitizen } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !citizen) return;
    if (!title || !category || !description || !severity) {
      setError("Please complete all required fields.");
      return;
    }
    try {
      setLoading(true);
      setError("");

      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const generatedCaseId = `MUA-${year}-${rand}`;

      await addDoc(collection(db, "applications"), {
        userId: user.uid,
        citizenId: citizen.citizenId,
        type: "incident",
        serviceId: "incident-report",
        serviceName: "Incident Report",
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        location: location.trim() || null,
        incidentDate: date || null,
        caseId: generatedCaseId,
        status: "Submitted",
        department: "Department of Minor Incidents",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Add notification
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Incident Report Received",
        message: `Your incident report "${title}" has been received. Case ID: ${generatedCaseId}. The Ministry will investigate with maximum seriousness.`,
        read: false,
        type: "application",
        createdAt: serverTimestamp(),
      });

      // Update citizen points and application count
      await updateDoc(doc(db, "citizens", user.uid), {
        uselessPoints: increment(10),
        applicationCount: increment(1),
      });

      await refreshCitizen();
      setCaseId(generatedCaseId);
      setDone(true);
    } catch (e: any) {
      setError("Failed to submit report. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6f1020] mb-8 transition-colors">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
        <div className="card rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
            <div>
              <div className="text-xs uppercase tracking-[.16em] text-[#6f1020] font-bold">Case Created</div>
              <div className="serif text-4xl mt-1">{caseId}</div>
            </div>
          </div>
          <p className="text-slate-600 mt-2">Department: <b>Department of Minor Incidents</b></p>
          <p className="text-slate-600">Status: <b>Submitted</b></p>
          <div className="mt-6 bg-[#efe6ce] rounded-xl p-4 text-sm leading-6 text-[#7a5a12]">
            Your incident has been officially received. The Ministry will investigate with maximum seriousness and minimum results. You have earned <b>+10 Useless Points</b>.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/track" className="btn btn-primary py-2.5 px-5 text-sm">Track this case</Link>
            <button onClick={() => { setDone(false); setTitle(""); setCategory(""); setDescription(""); setLocation(""); setDate(""); setSeverity(""); }} className="btn btn-secondary py-2.5 px-5 text-sm">Report another</button>
            <Link href="/" className="btn btn-secondary py-2.5 px-5 text-sm">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#6f1020] mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <div className="badge bg-[#efe6ce] text-[#6f1020] mb-3">Incident Reporting</div>
        <h1 className="serif text-5xl md:text-6xl leading-tight">Report something<br />completely unnecessary.</h1>
        <p className="text-lg text-slate-600 mt-4 leading-8">Tell the Ministry what went wrong. We will assign a department, create an important-looking case ID, and investigate with maximum seriousness.</p>
      </div>

      <div className="card rounded-2xl p-7 md:p-9">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold block mb-2">Incident Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Someone took my pen" required />
            </div>
            <div>
              <label className="text-sm font-bold block mb-2">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" required>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-32" placeholder="Explain the unnecessary situation in as much detail as possible..." required />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold block mb-2">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" placeholder="e.g. Office, Floor 3" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-2">Date of Incident</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Severity *</label>
            <div className="grid sm:grid-cols-4 gap-3">
              {severities.map((s) => (
                <label key={s} className={`border rounded-xl p-3 flex items-center gap-2 cursor-pointer transition-colors ${severity === s ? "border-[#6f1020] bg-[#f3e1e3]" : "border-[#ded6c9] bg-white hover:bg-[#f7f3ea]"}`}>
                  <input type="radio" name="severity" value={s} checked={severity === s} onChange={(e) => setSeverity(e.target.value)} className="sr-only" />
                  <span className="text-sm font-semibold">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[#6f1020] font-semibold bg-[#f3e1e3] rounded-xl px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-wine w-full py-3.5 text-sm">
            {loading ? "Submitting to the Ministry..." : "Submit Official Complaint"}
          </button>

        </form>
        <div className="mt-5 flex gap-2 items-center text-xs text-slate-500">
          <ShieldCheck size={14} /> Your submission will be treated with an entirely unnecessary level of seriousness.
        </div>
      </div>
    </div>
  );
}

export default function ReportIncident() {
  return <AuthGuard><ReportIncidentPage /></AuthGuard>;
}

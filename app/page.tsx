"use client";

import Link from "next/link";
import { ArrowRight, FileWarning, Award, SearchCheck, Crown, Bell, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { notices } from "@/lib/data";

const services = [
  { icon: FileWarning, label: "Report an Incident", desc: "Submit a complaint about something completely unnecessary.", href: "/report-incident", accent: "bg-[#f3e1e3] text-[#6f1020]" },
  { icon: Award, label: "Request a Certificate", desc: "Turn everyday mediocrity into an official-looking achievement.", href: "/certificate", accent: "bg-[#efe6ce] text-[#7a5a12]" },
  { icon: SearchCheck, label: "Track an Application", desc: "Discover whether anything meaningful has happened.", href: "/track", accent: "bg-[#e4ebf2] text-[#10243d]" },
  { icon: Crown, label: "Citizen Rankings", desc: "See where you stand in the hierarchy of uselessness.", href: "/leaderboard", accent: "bg-[#f0ece4] text-[#5a4a2a]" },
];

function Dashboard() {
  const { user, citizen } = useAuth();

  const displayName = citizen?.fullName || user?.displayName || user?.email?.split("@")[0] || "Distinguished Citizen";
  const firstName = displayName.split(" ")[0];
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">

      {/* Welcome banner */}
      <div className="card rounded-2xl overflow-hidden mb-8">
        <div className="bg-[#10243d] px-7 py-6 md:px-10 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#c9a44b] text-[#10243d] grid place-items-center text-xl font-black shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a44b] mb-1">
                Welcome back, Distinguished Citizen
              </div>
              <h1 className="serif text-3xl md:text-4xl text-white font-black">{firstName}</h1>
              <p className="text-slate-400 text-sm mt-1">
                Your continued participation in unnecessary administrative activities is appreciated.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/report-incident" className="btn btn-wine px-5 py-2.5 text-sm">
              Report Incident <ArrowRight size={15} />
            </Link>
            <Link href="/certificate" className="flex items-center gap-2 px-5 py-2.5 rounded-[.65rem] border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Request Certificate
            </Link>
          </div>
        </div>

        {/* Citizen stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#ded6c9]">
          {[
            { label: "Citizen ID", value: citizen?.citizenId || "Pending", icon: "🪪" },
            { label: "Useless Points", value: citizen?.uselessPoints?.toString() || "0", icon: "⭐" },
            { label: "Current Rank", value: citizen?.rank || "Probationary Citizen", icon: "🏛️" },
            { label: "Applications", value: citizen?.applicationCount?.toString() || "0", icon: "📋" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="px-6 py-4">
              <div className="text-[10px] uppercase tracking-[.14em] text-slate-400 font-bold flex items-center gap-1.5">
                <span>{icon}</span> {label}
              </div>
              <div className="font-black text-lg mt-1 truncate">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_.42fr] gap-8">

        {/* Left column */}
        <div className="space-y-8">

          {/* Services */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="serif text-2xl font-black">Ministry Services</h2>
              <span className="text-xs text-slate-500 font-semibold">All services →</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map(({ icon: Icon, label, desc, href, accent }) => (
                <Link key={label} href={href} className="group card rounded-2xl p-6 hover:-translate-y-1 transition-transform block">
                  <div className={`w-11 h-11 rounded-xl grid place-items-center ${accent} mb-4`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="serif text-xl font-bold">{label}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-6">{desc}</p>
                  <div className="mt-4 text-sm font-bold text-[#10243d] group-hover:text-[#6f1020] transition-colors">
                    Open service →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Citizen status */}
          <section className="card rounded-2xl p-7">
            <h2 className="serif text-2xl font-black mb-5">Citizen Status</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#f7f3ea] rounded-xl p-4 border border-[#ded6c9]">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="font-bold text-sm">{citizen?.citizenshipStatus || "Active"}</span>
                </div>
              </div>
              <div className="bg-[#f7f3ea] rounded-xl p-4 border border-[#ded6c9]">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Member Since</div>
                <div className="font-bold text-sm mt-2">
                  {citizen?.joinedAt ? new Date(citizen.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
              </div>
              <div className="bg-[#f7f3ea] rounded-xl p-4 border border-[#ded6c9]">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Classification</div>
                <div className="font-bold text-sm mt-2">Public Citizen</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 p-4 bg-[#efe6ce] rounded-xl">
              <CheckCircle2 size={18} className="text-[#7a5a12] shrink-0" />
              <p className="text-sm text-[#7a5a12] font-semibold">
                Your citizenship is active. The Ministry acknowledges your existence.
              </p>
            </div>
          </section>

        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick actions */}
          <section className="card rounded-2xl p-6">
            <h3 className="font-black text-sm uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: "/report-incident", icon: FileWarning, label: "New Incident Report" },
                { href: "/certificate", icon: Award, label: "Request Certificate" },
                { href: "/track", icon: SearchCheck, label: "Track Application" },
                { href: "/notifications", icon: Bell, label: "View Notifications" },
                { href: "/profile", icon: ClipboardList, label: "My Profile" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={label} href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f1eee7] transition-colors group">
                  <Icon size={16} className="text-[#6f1020] shrink-0" />
                  <span className="text-sm font-semibold group-hover:text-[#6f1020] transition-colors">{label}</span>
                  <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-[#6f1020] transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* Notice board */}
          <section className="card rounded-2xl overflow-hidden">
            <div className="bg-[#10243d] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">Ministry Notices</span>
              <span className="text-[10px] tracking-[.18em] text-[#c9a44b]">LIVE</span>
            </div>
            <div className="divide-y divide-[#ded6c9]">
              {notices.slice(0, 2).map((n) => (
                <div key={n.tag} className="p-5">
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="badge bg-[#efe6ce] text-[#6f1020] text-[9px]">{n.tag}</span>
                    <span className="text-[10px] text-slate-400">{n.date}</span>
                  </div>
                  <h4 className="serif text-base font-bold">{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-5">{n.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Points progress */}
          <section className="card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm uppercase tracking-wider">Useless Points</h3>
              <span className="serif text-2xl font-black text-[#6f1020]">{citizen?.uselessPoints || 0}</span>
            </div>
            <div className="w-full bg-[#ede8df] rounded-full h-2 mb-3">
              <div
                className="bg-[#c9a44b] h-2 rounded-full transition-all"
                style={{ width: `${Math.min(((citizen?.uselessPoints || 0) / 500) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {citizen?.rank || "Probationary Citizen"} · {500 - (citizen?.uselessPoints || 0)} pts to Supreme Bureaucratic Entity
            </p>
            <div className="mt-3 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center gap-2"><Clock size={11} /> +10 pts per incident report</div>
              <div className="flex items-center gap-2"><Clock size={11} /> +20 pts per certificate</div>
              <div className="flex items-center gap-2"><Clock size={11} /> +30 pts for exceptional uselessness</div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

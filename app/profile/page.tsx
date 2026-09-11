"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  getCurrentCitizen, refreshCitizen, getCitizenIncidents, getCitizenCertificates,
  getRankedCitizens, getTitle,
  type Citizen, type Incident, type Certificate,
} from "@/lib/store";
import { FileWarning, Award, ClipboardList, Star, Trophy, CheckCircle2 } from "lucide-react";

function getAchievements(incidents: Incident[], certs: Certificate[], points: number): string[] {
  const list: string[] = [];
  if (incidents.length >= 1) list.push("🖊️ Reported a Missing Pen (or something equally important)");
  if (incidents.length >= 3) list.push("📋 Filed 3 Unnecessary Complaints");
  if (incidents.length >= 5) list.push("🏛️ Filed 5 Unnecessary Complaints — Ministry VIP");
  if (certs.length >= 1) list.push("🏆 Received First Official Certificate");
  if (certs.length >= 3) list.push("🎖️ Requested 3 Certificates — Overachiever");
  if (points >= 100) list.push("⭐ Reached 100 Useless Points");
  if (points >= 300) list.push("🌟 Reached 300 Useless Points — Senior Status");
  if (points >= 500) list.push("💫 Reached 500 Useless Points — Legendary");
  if (incidents.length + certs.length >= 5) list.push("📁 Completed 5 Applications — Bureaucracy Champion");
  return list;
}

export default function ProfilePage() {
  const router = useRouter();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    const c = getCurrentCitizen();
    if (!c) { router.push("/login"); return; }
    const fresh = refreshCitizen(c.id) ?? c;
    setCitizen(fresh);
    setIncidents(getCitizenIncidents(fresh.id));
    setCerts(getCitizenCertificates(fresh.id));
    const ranked = getRankedCitizens();
    const r = ranked.find((x) => x.id === fresh.id);
    setRank(r?.rank ?? ranked.length);
  }, [router]);

  if (!citizen) return null;

  const achievements = getAchievements(incidents, certs, citizen.points);
  const initials = citizen.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const recentActivity = [
    ...incidents.slice(-5).map((i) => ({
      text: `Reported: ${i.type}`,
      sub: `${i.id} · ${i.department}`,
      date: i.submittedAt,
      color: "border-[#9b1c31]",
      badge: "bg-[#fde8e8] text-[#9b1c31]",
      badgeText: "Incident",
    })),
    ...certs.slice(-5).map((c) => ({
      text: `Certificate: ${c.achievement}`,
      sub: `${c.id} · ${c.requestedAt}`,
      date: c.requestedAt,
      color: "border-[#c9a44b]",
      badge: "bg-[#efe6ce] text-[#7a5a12]",
      badgeText: "Certificate",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <DashboardShell>
      <div className="mb-8">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#e4ebf2] text-[#172235] px-3 py-1 rounded-full">
          Citizen Profile · {citizen.id}
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-black text-[#172235] mt-4">Citizen Profile</h1>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Left: Identity card */}
        <div className="space-y-5">
          <div className="bg-[#fffaf0] border-2 border-[#172235] rounded-2xl p-7 shadow-[5px_5px_0_#172235]">
            <div className="w-20 h-20 rounded-full bg-[#172235] text-[#e8c878] flex items-center justify-center text-2xl font-black mb-5">
              {initials}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#efe6ce] text-[#7a5a12] px-3 py-1 rounded-full">
              Active Citizen
            </span>
            <h2 className="font-serif text-3xl font-black text-[#172235] mt-3">{citizen.name}</h2>
            <p className="text-sm text-[#818792] mt-1">{citizen.id}</p>
            <p className="text-sm text-[#818792]">Member since {citizen.joinedAt}</p>

            <div className="mt-6 bg-[#f4efe4] rounded-xl p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#818792]">Current Rank</p>
              <p className="font-serif text-xl font-black text-[#172235] mt-1">{getTitle(citizen.points)}</p>
              <p className="text-sm font-black text-[#9b1c31] mt-1">#{rank} · {citizen.points} Useless Points</p>
            </div>

            <Link href="/leaderboard"
              className="mt-4 flex items-center justify-center gap-2 w-full border-2 border-[#172235] rounded-xl py-3 text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#eee8dc] transition">
              View Full Ranking
            </Link>
          </div>

          {/* Stats */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-6">
            <h3 className="font-black uppercase tracking-[0.12em] text-sm mb-4">Statistics</h3>
            <div className="space-y-3">
              {[
                { label: "Incidents Reported", value: incidents.length, icon: FileWarning, color: "text-[#9b1c31]" },
                { label: "Certificates Received", value: certs.length, icon: Award, color: "text-[#7a5a12]" },
                { label: "Applications Completed", value: incidents.length + certs.length, icon: ClipboardList, color: "text-[#172235]" },
                { label: "Useless Points", value: citizen.points, icon: Star, color: "text-[#c9a44b]" },
                { label: "National Rank", value: `#${rank}`, icon: Trophy, color: "text-[#6f1020]" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between border border-[#ded6c9] rounded-xl px-4 py-3 bg-white">
                  <div className="flex items-center gap-3">
                    <Icon size={15} className={color} />
                    <span className="text-sm font-bold">{label}</span>
                  </div>
                  <span className="font-black text-[#172235]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Activity + Achievements */}
        <div className="space-y-5">
          {/* Achievements */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7">
            <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2 mb-5">
              <Trophy size={16} className="text-[#c9a44b]" /> Achievements
            </h3>
            {achievements.length === 0 ? (
              <p className="text-sm text-[#818792] italic">No achievements yet. Start by reporting something completely unnecessary.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {achievements.map((a) => (
                  <div key={a} className="flex items-start gap-3 bg-[#f4efe4] border border-[#ded6c9] rounded-xl p-4">
                    <CheckCircle2 size={16} className="text-[#c9a44b] mt-0.5 shrink-0" />
                    <span className="text-sm font-bold text-[#172235]">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Incidents */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2">
                <FileWarning size={16} className="text-[#9b1c31]" /> Recent Incidents
              </h3>
              <Link href="/report-incident" className="text-[10px] font-black uppercase tracking-widest text-[#9b1c31] hover:underline">+ New</Link>
            </div>
            {incidents.length === 0 ? (
              <p className="text-sm text-[#818792] italic">No incidents reported. The Ministry is waiting for your first complaint.</p>
            ) : (
              <div className="space-y-3">
                {incidents.slice().reverse().slice(0, 4).map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between border border-[#ded6c9] rounded-xl px-4 py-3 bg-white">
                    <div>
                      <p className="font-bold text-sm">{inc.type}</p>
                      <p className="text-[10px] text-[#818792] mt-0.5">{inc.id} · {inc.submittedAt}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#fde8e8] text-[#9b1c31] px-2 py-1 rounded-full">{inc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Certificates */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2">
                <Award size={16} className="text-[#7a5a12]" /> Recent Certificates
              </h3>
              <Link href="/certificate" className="text-[10px] font-black uppercase tracking-widest text-[#9b1c31] hover:underline">+ New</Link>
            </div>
            {certs.length === 0 ? (
              <p className="text-sm text-[#818792] italic">No certificates issued. Your mediocrity awaits official recognition.</p>
            ) : (
              <div className="space-y-3">
                {certs.slice().reverse().slice(0, 4).map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between border border-[#ded6c9] rounded-xl px-4 py-3 bg-white">
                    <div>
                      <p className="font-bold text-sm">{cert.achievement}</p>
                      <p className="text-[10px] text-[#818792] mt-0.5">{cert.id} · {cert.requestedAt}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#efe6ce] text-[#7a5a12] px-2 py-1 rounded-full">{cert.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          {recentActivity.length > 0 && (
            <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7">
              <h3 className="font-black uppercase tracking-[0.12em] text-sm mb-5">Activity Record</h3>
              <div className="space-y-4">
                {recentActivity.map((a, i) => (
                  <div key={i} className={`border-l-4 ${a.color} pl-4`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{a.text}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${a.badge}`}>{a.badgeText}</span>
                    </div>
                    <p className="text-[10px] text-[#818792] mt-0.5">{a.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

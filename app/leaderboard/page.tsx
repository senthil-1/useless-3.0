"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { getCurrentCitizen, getRankedCitizens, type Citizen } from "@/lib/store";
import { Trophy, Crown, Star } from "lucide-react";

type RankedCitizen = Citizen & { rank: number; title: string };

const POINTS_SYSTEM = [
  { action: "Report an Incident", points: "+10" },
  { action: "Request a Certificate", points: "+20" },
  { action: "Complete an Application", points: "+5" },
  { action: "Exceptional Uselessness", points: "+30" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [citizens, setCitizens] = useState<RankedCitizen[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const c = getCurrentCitizen();
    if (!c) { router.push("/login"); return; }
    setCurrentId(c.id);
    setCitizens(getRankedCitizens());
  }, [router]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#efe6ce] text-[#7a5a12] px-3 py-1 rounded-full inline-flex items-center gap-2">
            <Crown size={11} /> Citizen Rankings
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-black text-[#172235] mt-4">Ranking of Citizens</h1>
          <p className="text-[#818792] mt-3 leading-7 max-w-xl mx-auto">
            See who has contributed the most to unnecessary government activity.
            Points are awarded for bureaucratic interaction and exceptional commitment to uselessness.
          </p>
        </div>

        {/* Leaderboard table */}
        <div className="bg-[#fffaf0] border-2 border-[#172235] rounded-2xl overflow-hidden shadow-[6px_6px_0_#172235] mb-8">
          <div className="bg-[#172235] px-6 py-4 flex items-center gap-3">
            <Trophy size={18} className="text-[#e8c878]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8c878]">Official Uselessness Rankings</span>
          </div>

          {citizens.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="font-black uppercase tracking-widest text-sm text-[#172235]">No Citizens Registered Yet</p>
              <p className="text-sm text-[#818792] mt-2">Be the first to register and claim the top spot.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#ded6c9]">
              {citizens.map((c, i) => {
                const isMe = c.id === currentId;
                return (
                  <div key={c.id}
                    className={`flex items-center gap-5 px-6 py-5 transition ${isMe ? "bg-[#efe6ce] border-l-4 border-[#c9a44b]" : "hover:bg-[#f9f6ef]"}`}>
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${i < 3 ? "bg-[#efe6ce] text-[#7a5a12]" : "bg-[#f4efe4] text-[#818792]"}`}>
                      {i < 3 ? medals[i] : c.rank}
                    </div>

                    {/* Name + title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[#172235]">{c.name}</span>
                        {isMe && <span className="text-[9px] font-black uppercase tracking-widest bg-[#c9a44b] text-white px-2 py-0.5 rounded-full">You</span>}
                      </div>
                      <p className="text-sm text-[#818792] mt-0.5">{c.title}</p>
                      <p className="text-[10px] text-[#818792]">{c.id}</p>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-xl text-[#172235]">{c.points}</div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-[#818792]">useless pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Points system */}
        <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-7">
          <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2 mb-5">
            <Star size={16} className="text-[#c9a44b]" /> Points System
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {POINTS_SYSTEM.map(({ action, points }) => (
              <div key={action} className="flex items-center justify-between bg-[#f4efe4] border border-[#ded6c9] rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-[#172235]">{action}</span>
                <span className="font-black text-[#c9a44b]">{points}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#818792] mb-3">Citizen Titles</p>
            <div className="space-y-2">
              {[
                ["0 – 99", "Useless Beginner"],
                ["100 – 299", "Junior Citizen"],
                ["300 – 599", "Senior Citizen of Useless Affairs"],
                ["600 – 799", "Expert in Uselessness"],
                ["800+", "Most Useless Citizen"],
              ].map(([range, title]) => (
                <div key={range} className="flex items-center justify-between text-sm">
                  <span className="text-[#818792]">{range} pts</span>
                  <span className="font-bold text-[#172235]">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

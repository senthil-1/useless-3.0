"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { getCurrentCitizen, NOTICES } from "@/lib/store";
import { Megaphone, AlertTriangle, Info } from "lucide-react";

const URGENCY = ["URGENT NOTICE", "IMPORTANT NOTICE", "PUBLIC NOTICE", "ADVISORY", "CIRCULAR", "BULLETIN"];
const ICONS = [AlertTriangle, AlertTriangle, Info, Info, Megaphone, Megaphone];

export default function NoticesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = getCurrentCitizen();
    if (!c) { router.push("/login"); return; }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#172235] text-[#e8c878] px-3 py-1 rounded-full inline-flex items-center gap-2">
            <Megaphone size={11} /> Official Communications
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-black text-[#172235] mt-4">Ministry Notices</h1>
          <p className="text-[#818792] mt-3 leading-7">
            Official communications from the Ministry of Useless Affairs. All notices are issued with the highest level of unnecessary seriousness.
          </p>
        </div>

        {/* Notice board header */}
        <div className="bg-[#172235] rounded-t-2xl px-7 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone size={20} className="text-[#e8c878]" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8c878]">Ministry of Useless Affairs</p>
              <h2 className="font-serif text-xl font-black text-white">Official Notice Board</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#e8c878]">Live</span>
          </div>
        </div>

        <div className="border-2 border-t-0 border-[#172235] rounded-b-2xl overflow-hidden divide-y divide-[#ded6c9] mb-8">
          {NOTICES.map((notice, i) => {
            const Icon = ICONS[i % ICONS.length];
            const urgency = URGENCY[i % URGENCY.length];
            return (
              <div key={notice.number} className="bg-[#fffaf0] p-7 hover:bg-[#f9f6ef] transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#efe6ce] text-[#6f1020] px-3 py-1 rounded-full">
                      {urgency}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#818792]">
                      Notice No. {notice.number}
                    </span>
                  </div>
                  <span className="text-xs text-[#818792] font-bold shrink-0">{notice.date}</span>
                </div>

                <div className="flex items-start gap-4 mt-4">
                  <div className="w-10 h-10 rounded-xl bg-[#172235] flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#e8c878]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-black text-[#172235]">{notice.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9b1c31] mt-1">{notice.department}</p>
                    <p className="text-sm text-[#818792] leading-7 mt-3">{notice.body}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#ded6c9] flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[#818792]">
                  <span>Ministry of Useless Affairs · Official Communication</span>
                  <span>Ref: MUA/{notice.number}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer notice */}
        <div className="bg-[#f4efe4] border border-[#ded6c9] rounded-2xl p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#818792]">
            All notices are issued by the Ministry of Useless Affairs and are entirely official.
            The Ministry accepts no responsibility for any action taken based on these notices,
            as no action was intended to be taken.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}

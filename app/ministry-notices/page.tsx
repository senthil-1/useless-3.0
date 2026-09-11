"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import PageContainer from "@/components/PageContainer";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import {
  Bell,
  Radio,
  Clock,
  Sparkles,
  Megaphone,
} from "lucide-react";

interface NoticeItem {
  id: string;
  title: string;
  message: string;
  department?: string;
  priority?: "Routine" | "Urgent" | "Completely Unnecessary" | string;
  date: Date;
  isUserSpecific?: boolean;
}

export default function MinistryNoticesPage() {
  const { user } = useAuth();

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoticesAndNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const items: NoticeItem[] = [];

        // 1. Fetch public Ministry notices from 'notices' collection
        try {
          const noticesSnap = await getDocs(collection(db, "notices"));
          noticesSnap.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              title: data.title || "Official Ministry Circular",
              message: data.message || data.description || "No message body.",
              department: data.department || "Department of Administrative Announcements",
              priority: data.priority || "Routine",
              date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              isUserSpecific: false,
            });
          });
        } catch (noticeErr) {
          console.warn("Could not fetch public notices from Firestore:", noticeErr);
        }

        // 2. Fetch user-specific notifications from 'notifications' collection
        if (user) {
          try {
            // Check welcome notification: notifications/{uid}_welcome
            const welcomeDoc = await getDoc(
              doc(db, "notifications", `${user.uid}_welcome`)
            );
            if (welcomeDoc.exists()) {
              const wData = welcomeDoc.data();
              items.push({
                id: welcomeDoc.id,
                title: wData.title || "Welcome to the Ministry",
                message: wData.message || "Your citizenship application has been approved.",
                department: "Office of the Prime Bureaucrat",
                priority: "Official Greeting",
                date: wData.createdAt?.toDate ? wData.createdAt.toDate() : new Date(),
                isUserSpecific: true,
              });
            }

            // Also query any other notifications for this user
            const notifQuery = query(
              collection(db, "notifications"),
              where("userId", "==", user.uid)
            );
            const notifSnap = await getDocs(notifQuery);
            notifSnap.forEach((docSnap) => {
              if (docSnap.id !== `${user.uid}_welcome`) {
                const nData = docSnap.data();
                items.push({
                  id: docSnap.id,
                  title: nData.title || "Ministry Dispatch",
                  message: nData.message || "",
                  department: nData.department || "Bureau of Notifications",
                  priority: nData.type || "Personal Dispatch",
                  date: nData.createdAt?.toDate ? nData.createdAt.toDate() : new Date(),
                  isUserSpecific: true,
                });
              }
            });
          } catch (notifErr) {
            console.warn("Could not fetch user notifications from Firestore:", notifErr);
          }
        }

        // Sort by date descending
        items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setNotices(items);
      } catch (err: any) {
        console.error("MUA Notices Error:", err);
        setError("Unable to retrieve official notices at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchNoticesAndNotifications();
  }, [user]);

  const getPriorityBadge = (priority: string = "Routine") => {
    const p = priority.toLowerCase();
    if (p.includes("urgent") || p.includes("critical")) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-[#9b1c31] bg-[#f5dfe3] px-2 py-0.5 text-[9px] font-black uppercase text-[#9b1c31]">
          ⚠️ {priority}
        </span>
      );
    }
    if (p.includes("welcome") || p.includes("greeting")) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-[#b38600] bg-[#fff8e1] px-2 py-0.5 text-[9px] font-black uppercase text-[#b38600]">
          <Sparkles size={11} /> {priority}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded border border-[#172235] bg-[#e3f2fd] px-2 py-0.5 text-[9px] font-black uppercase text-[#1565c0]">
        <Radio size={10} /> {priority}
      </span>
    );
  };

  return (
    <PageContainer
      title="Ministry Notices"
      subtitle="Read official announcements, administrative updates, and dispatches that may or may not impact your daily existence."
      showBackButton={true}
      maxWidth="max-w-4xl"
    >
      {error && (
        <div className="mb-6 rounded-xl border-2 border-[#9b1c31] bg-[#fdf2f4] p-4 text-xs font-bold text-[#9b1c31]">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingState message="Checking the Ministry's official bulletin board..." />
      ) : notices.length === 0 ? (
        <EmptyState
          title="No Official Notices Posted"
          description="The Ministry has nothing to announce today. Please proceed with your day under the assumption that bureaucracy continues uninterrupted."
        />
      ) : (
        <div className="space-y-5">
          {notices.map((notice) => (
            <article
              key={notice.id}
              className={`overflow-hidden rounded-2xl border-2 border-[#172235] bg-[#fffaf0] shadow-[5px_5px_0_#172235] transition-all hover:shadow-[7px_7px_0_#172235] ${
                notice.isUserSpecific ? "border-l-[6px] border-l-[#9b1c31]" : ""
              }`}
            >
              {/* Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#172235] bg-[#172235] px-6 py-2.5 text-white">
                <div className="flex items-center gap-2">
                  <Megaphone size={14} className="text-[#e8c878]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8c878]">
                    {notice.isUserSpecific
                      ? "Personal Citizen Dispatch"
                      : "Official Public Gazette"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getPriorityBadge(notice.priority)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-[#687386]">
                  <span className="uppercase tracking-wider text-[#9b1c31]">
                    {notice.department || "Ministry of Useless Affairs"}
                  </span>

                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    {notice.date instanceof Date
                      ? notice.date.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Recent"}
                  </span>
                </div>

                <h3 className="mt-2.5 font-serif text-xl font-black text-[#172235] sm:text-2xl">
                  {notice.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-[#172235] whitespace-pre-line bg-[#f4efe4]/60 p-4 rounded-xl border border-[#d8cfbd]">
                  {notice.message}
                </p>
              </div>

              {/* Official Stamp Footer */}
              <div className="border-t border-[#d8cfbd] bg-[#eee8dc] px-6 py-2 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-[#687386]">
                <span>Republic of Questionable Decisions</span>
                <span>☑ Authorized by the Ministry</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface CitizenData {
  uid: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  citizenId: string;
  citizenshipStatus: string;
  joinedAt: string;
  uselessPoints: number;
  rank: string;
  applicationCount: number;
}

interface AuthContextType {
  user: User | null;
  citizen: CitizenData | null;
  loading: boolean;
  refreshCitizen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  citizen: null,
  loading: true,
  refreshCitizen: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [citizen, setCitizen] = useState<CitizenData | null>(null);
  const [loading, setLoading] = useState(true);

  const buildFallbackCitizen = (firebaseUser: User): CitizenData => {
    let hash = 0;
    for (let i = 0; i < firebaseUser.uid.length; i++) {
      hash = (hash * 31 + firebaseUser.uid.charCodeAt(i)) % 900000;
    }
    const citizenNum = 100000 + Math.abs(hash);

    return {
      uid: firebaseUser.uid,
      fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Distinguished Citizen",
      email: firebaseUser.email || "",
      citizenId: `MUA-${new Date().getFullYear()}-${citizenNum}`,
      citizenshipStatus: "Active",
      joinedAt: new Date().toISOString(),
      uselessPoints: 0,
      rank: "Probationary Citizen",
      applicationCount: 0,
    };
  };

  const fetchCitizen = (firebaseUser: User) => {
    const uid = firebaseUser.uid;

    // 1. Immediately read from localStorage or fallback for 0ms latency
    let currentCitizen: CitizenData = buildFallbackCitizen(firebaseUser);
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`mua_citizen_${uid}`);
        if (cached) {
          currentCitizen = JSON.parse(cached);
        }
      } catch {
        // Fallback already assigned
      }
    }
    setCitizen(currentCitizen);

    // 2. Fetch from Firestore in the background without blocking the UI
    getDoc(doc(db, "citizens", uid))
      .then((snap) => {
        if (snap && snap.exists()) {
          const data = snap.data() as CitizenData;
          setCitizen(data);
          if (typeof window !== "undefined") {
            localStorage.setItem(`mua_citizen_${uid}`, JSON.stringify(data));
          }
        }
      })
      .catch(() => {
        // Firestore may not be initialized or offline; fallback is already displayed
      });
  };

  const refreshCitizen = async () => {
    if (user) fetchCitizen(user);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchCitizen(firebaseUser);
      } else {
        setCitizen(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, citizen, loading, refreshCitizen }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

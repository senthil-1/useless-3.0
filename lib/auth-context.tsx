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

  const fetchCitizen = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "citizens", uid));
      if (snap.exists()) {
        setCitizen(snap.data() as CitizenData);
      }
    } catch (e) {
      console.error("Failed to fetch citizen data:", e);
    }
  };

  const refreshCitizen = async () => {
    if (user) await fetchCitizen(user.uid);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchCitizen(firebaseUser.uid);
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

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { LoginButton } from "@/components/LoginButton";
import type { AccountUser } from "@/types";

function AccountCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 flex justify-center items-start">
        <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 max-w-md w-full p-8 mt-12 mb-16 flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Account() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Account fetch error:", err);
        setLoading(false);
      });
  }, []);

  let cardContent: React.ReactNode;
  if (loading) {
    cardContent = (
      <>
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" aria-label="Loading spinner"></span>
        </div>
        <div className="text-lg text-gray-300 text-center">Loading your account...</div>
      </>
    );
  } else if (!user) {
    cardContent = (
      <>
        <h1 className="text-2xl font-bold text-white mb-4 text-center">You are not signed in</h1>
        <p className="text-gray-300 text-center mb-6">To view your account, please sign in with Slack using the button below.</p>
        <LoginButton />
      </>
    );
  } else {
    cardContent = (
      <>
        {user.picture ? (
          <img
            src={user.picture}
            alt="User avatar"
            className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg mb-6"
          />
        ) : null}
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Your Account</h1>
        <div className="space-y-4 w-full">
          <div>
            <span className="block text-gray-400 text-sm">Name</span>
            <span className="block text-lg text-white font-semibold">{user.name}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-sm">Email</span>
            <span className="block text-lg text-white font-semibold">{user.email}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-sm">Slack User ID</span>
            <span className="block text-lg text-white font-semibold">{user.user_id}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-sm">Slack Team ID</span>
            <span className="block text-lg text-white font-semibold">{user.team_id}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24 flex flex-col justify-between">
        <AccountCard>{cardContent}</AccountCard>
        <Footer />
      </div>
    </>
  );
}

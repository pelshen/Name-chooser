import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export function Account() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-8">Loading or not signed in.</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24 flex flex-col justify-between">
        <div className="flex-1">
          <div className="container mx-auto px-4 flex justify-center items-start">
            <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 max-w-md w-full p-8 mt-12 flex flex-col items-center">
              {user.image_192 || user.image_72 ? (
                <img
                  src={user.image_192 || user.image_72}
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
                  <span className="block text-gray-400 text-sm">Slack ID</span>
                  <span className="block text-lg text-white font-semibold">{user.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const apiHost = import.meta.env.VITE_API_HOST;

export function LoginButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${apiHost}/api/account`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 200) setLoggedIn(true);
        else setLoggedIn(false);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  const handleLogin = () => {
    window.location.href = `${apiHost}/api/auth/slack`;
  };

  const handleLogout = async () => {
    await fetch(`${apiHost}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    toast.success('You have been logged out');
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  if (loggedIn === null) return null; // Optionally show spinner

  if (loggedIn) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="bg-primary text-white px-5 py-2 min-h-[44px] font-semibold rounded shadow-sm hover:bg-accent1 transition"
        aria-label="Logout"
      >
        <span className="text-base font-bold">Logout</span>
      </button>
    );
  }

  // Not logged in
  return (
    <button
      type="button"
      onClick={handleLogin}
      className="flex items-center gap-3 bg-white border border-gray-300 shadow-sm rounded px-5 py-2 min-h-[44px] font-semibold text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-[#611f69] transition"
      aria-label="Sign in with Slack"
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {/* Official Slack logo SVG */}
        {/* Official Slack octothorpe logo SVG */}
        <svg viewBox="0 0 122.8 122.8">
          <path
            d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
            fill="#e01e5a"
          ></path>
          <path
            d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
            fill="#36c5f0"
          ></path>
          <path
            d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
            fill="#2eb67d"
          ></path>
          <path
            d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
            fill="#ecb22e"
          ></path>
        </svg>
      </span>
      <span
        className="text-base font-bold"
        style={{
          fontFamily: 'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
        }}
      >
        Sign in with Slack
      </span>
    </button>
  );
}

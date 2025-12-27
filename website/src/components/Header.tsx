import { Link } from "react-router-dom";
import { LoginButton } from "./LoginButton";

export default function Header() {
  return (
    <header className="fixed w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-4 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/name-draw-logo.svg" alt="Name Draw" className="h-10 w-10" />
          <span className="text-xl font-bold text-primary dark:text-white">Name Draw</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/#features" className="text-accent2 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/#how-it-works" className="text-accent2 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
            How it works
          </Link>
          {/* <Link to="/#pricing" className="text-accent2 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
            Pricing
          </Link> */}
          <Link to="/blog" className="text-accent2 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors">
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LoginButton />
          <button className="md:hidden text-gray-700 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

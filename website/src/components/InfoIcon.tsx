import React, { useState } from "react";

interface InfoIconProps {
  message: string;
}

export function InfoIcon({ message }: InfoIconProps) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
        aria-label="Information"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        tabIndex={0}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      </button>
      {show && (
        <div className="absolute left-1/2 z-10 mt-2 w-56 -translate-x-1/2 rounded bg-gray-900 text-gray-100 text-sm p-3 shadow-lg border border-gray-700 whitespace-pre-line">
          {message}
        </div>
      )}
    </span>
  );
}

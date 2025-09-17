"use client";
// import Image from "next/image";


import { useEffect, useState } from "react";

export default function Home() {
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => { setHasToken(!!localStorage.getItem("token")); }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-[20%] py-10">
      <div className="w-full">
        {/* Nav */}
        <div className="flex items-center justify-between mb-14">
          <div className="text-2xl font-semibold text-[#ff6b6b] transition-colors">Note<span className="text-white">Pad</span></div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#team" className="hover:text-white transition-colors">Team</a>
            <a href="#oss" className="hover:text-white transition-colors">Opensource</a>
            {!hasToken ? (
              <a href="/login" className="px-5 py-2 rounded bg-white text-black shadow-sm hover:shadow transition-all">Try now</a>
            ) : (
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-5 py-2 rounded border border-gray-800 hover:bg-gray-900 transition">Sign out</button>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div className="space-y-7">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">Forget about your messy Notes.</h1>
            <p className="text-gray-400 text-lg max-w-xl">NotePad is an open‑source notes app for teams. Multi‑tenant, secure, role‑aware, and blazing fast on Vercel.</p>
            <div className="flex items-center gap-3">
              <a href={hasToken ? "/dashboard" : "/login"} className="px-7 py-3 rounded-lg bg-white text-black shadow-md hover:shadow-lg transition-all">{hasToken ? "Go to app" : "Try now"}</a>
              {!hasToken && <a href="/signup" className="px-7 py-3 rounded-lg border border-gray-800 hover:bg-gray-900 transition">Create account</a>}
            </div>
          </div>
          <div className="flex justify-center">
            <svg width="420" height="300" viewBox="0 0 360 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 hover:scale-[1.02]">
              <rect x="20" y="20" width="320" height="220" rx="20" fill="#0b0b0b" stroke="#fff" strokeWidth="3"/>
              <path d="M120 180 L220 80" stroke="#fff" strokeWidth="6"/>
              <path d="M140 100 C160 80, 200 80, 220 100" stroke="#ff6b6b" strokeWidth="20"/>
              <circle cx="220" cy="120" r="8" fill="#fff"/>
              <g stroke="#fff" strokeWidth="3">
                <rect x="75" y="70" width="46" height="34" rx="3"/>
                <rect x="260" y="60" width="40" height="30" rx="3"/>
                <rect x="250" y="170" width="44" height="28" rx="3"/>
                <rect x="90" y="190" width="44" height="28" rx="3"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

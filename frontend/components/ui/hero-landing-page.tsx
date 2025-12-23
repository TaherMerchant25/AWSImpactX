'use client'

import { useEffect, useState } from "react"
import { ArrowRight } from 'lucide-react'
import Link from "next/link"

export function TuringLanding() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden relative">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-[60px] py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-light">ASPERA</Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </button>
            </Link>
            <Link href="/analyze">
              <button className="text-gray-400 hover:text-white transition-colors">
                Analyze
              </button>
            </Link>
            <Link href="/documents">
              <button className="text-gray-400 hover:text-white transition-colors">
                Documents
              </button>
            </Link>
            <Link href="/findings">
              <button className="text-gray-400 hover:text-white transition-colors">
                Findings
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Subtle blue background gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,132,255,0.15)] via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[rgba(0,132,255,0.1)] via-transparent to-transparent opacity-50" />
      </div>

      {/* Main Content */}
      <main className="main min-h-screen pt-[300px] pb-20 relative">
        {/* Hero Video Background */}
        <video
          className="hero-video absolute -top-[20%] left-0 w-full h-[120%] object-cover z-0 bg-[#111]"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://mybycketvercelprojecttest.s3.sa-east-1.amazonaws.com/animation-bg.mp4"
            type="video/mp4"
          />
        </video>

        <div className="content-wrapper max-w-[1400px] mx-auto px-[60px] flex justify-between items-end relative z-[2]">
          {/* Left Content */}
          <div className="max-w-[800px]">
            <h1 className="text-[80px] font-light leading-[1.1] mb-8 tracking-[-2px]">
              Accelerate your
              <br />
              AI-Powered Due Diligence
            </h1>
            <p className="text-lg leading-relaxed text-[#b8b8b8] mb-12 font-normal">
              ASPERA analyzes financial documents, detects greenwashing, ensures compliance,
              <br />
              and delivers actionable insights powered by Gemini AI agents.
            </p>
            <div className="flex gap-5 items-center">
              <Link href="/analyze">
                <button className="flex items-center gap-2.5 bg-[#0084ff] text-white py-3.5 px-7 rounded-md text-base font-medium hover:bg-[#0066cc] hover:translate-x-0.5 transition-all duration-200">
                  Analyze Document
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="bg-transparent text-[#b8b8b8] py-3.5 px-7 text-base font-medium hover:text-white transition-colors duration-200 border border-gray-700 rounded-md">
                  View Dashboard
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex gap-20 items-end">
            <div className="text-center">
              <div className="text-[64px] font-light leading-none mb-3">5</div>
              <div className="text-base text-[#b8b8b8] font-normal">AI Agents deployed</div>
            </div>
            <div className="text-center">
              <div className="text-[64px] font-light leading-none mb-3">99%</div>
              <div className="text-base text-[#b8b8b8] font-normal">Accuracy rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

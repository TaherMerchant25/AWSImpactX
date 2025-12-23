"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Brain, Shield, FileSearch, Calculator, TrendingUp, Github, Linkedin, Mail } from "lucide-react";
import { Footer } from "@/components/ui/footer";

// Inline Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-white text-black hover:bg-gray-100",
      secondary: "bg-gray-800 text-white hover:bg-gray-700",
      ghost: "hover:bg-gray-800/50 text-white",
      gradient: "bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95"
    };
    
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-10 px-5 text-sm",
      lg: "h-12 px-8 text-base"
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Navigation Component
const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" />
            <span className="text-xl font-semibold text-white">ASPERA</span>
          </div>
          
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#agents" className="text-sm text-white/60 hover:text-white transition-colors">
              AI Agents
            </Link>
            <Link href="#architecture" className="text-sm text-white/60 hover:text-white transition-colors">
              Architecture
            </Link>
            <Link href="#documentation" className="text-sm text-white/60 hover:text-white transition-colors">
              Documentation
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button type="button" variant="ghost" size="sm">
              Sign in
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="default" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50 animate-[slideDown_0.3s_ease-out]">
          <div className="px-6 py-4 flex flex-col gap-4">
            <Link
              href="#features"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#agents"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Agents
            </Link>
            <Link
              href="#architecture"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Architecture
            </Link>
            <Link
              href="#documentation"
              className="text-sm text-white/60 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documentation
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-800/50">
              <Button type="button" variant="ghost" size="sm">
                Sign in
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="default" size="sm" className="w-full">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

Navigation.displayName = "Navigation";

// Hero Component
const Hero = React.memo(() => {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start px-6 py-20 md:py-24"
      style={{
        animation: "fadeIn 0.6s ease-out"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <aside className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm max-w-full">
        <span className="text-xs text-center whitespace-nowrap" style={{ color: '#9ca3af' }}>
          🚀 Powered by AWS Bedrock & Claude 3.5 Sonnet
        </span>
        <a
          href="#architecture"
          className="flex items-center gap-1 text-xs hover:text-white transition-all active:scale-95 whitespace-nowrap"
          style={{ color: '#9ca3af' }}
          aria-label="Learn more about architecture"
        >
          Learn more
          <ArrowRight size={12} />
        </a>
      </aside>

      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-medium text-center max-w-4xl px-6 leading-tight mb-6"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.05em"
        }}
      >
        AI-Powered Due Diligence <br />Made Simple
      </h1>

      <p className="text-sm md:text-base text-center max-w-2xl px-6 mb-10" style={{ color: '#9ca3af' }}>
        ASPERA accelerates capital deployment into high-impact sectors by automating <br />
        technical and financial due diligence with semantic reasoning
      </p>

      <div className="flex items-center gap-4 relative z-10 mb-16">
        <Link href="/dashboard">
          <Button
            type="button"
            variant="gradient"
            size="lg"
            className="rounded-lg flex items-center justify-center"
            aria-label="Get started with ASPERA"
          >
            Get started
            <ArrowRight size={16} />
          </Button>
        </Link>
        <Link href="#documentation">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="rounded-lg"
            aria-label="View documentation"
          >
            View docs
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-5xl relative pb-20">
        <div
          className="absolute left-1/2 w-[90%] pointer-events-none z-0"
          style={{
            top: "-23%",
            transform: "translateX(-50%)"
          }}
          aria-hidden="true"
        >
          <img
            src="https://i.postimg.cc/Ss6yShGy/glows.png"
            alt=""
            className="w-full h-auto"
            loading="eager"
          />
        </div>
        
        <div className="relative z-10">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop"
            alt="Dashboard preview showing analytics and due diligence metrics"
            className="w-full h-auto rounded-lg shadow-2xl border border-gray-800"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

// Features Section
const Features = React.memo(() => {
  const features = [
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Intelligent Document Processing",
      description: "Automated OCR and table extraction using Amazon Textract with structured JSON output"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Semantic Knowledge Graph",
      description: "Hierarchical relationships and vector search powered by Amazon OpenSearch Serverless"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Multi-Agent Analysis",
      description: "Specialized agents for consistency, greenwashing detection, compliance, and risk analysis"
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Financial Modeling",
      description: "Advanced math agent for complex financial calculations and projections"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Risk Heatmap",
      description: "Visual risk assessment and comprehensive findings across all document dimensions"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "MCP Hub Integration",
      description: "Universal tool access protocol for seamless agent coordination and data flow"
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-3xl md:text-4xl font-semibold text-center mb-4"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Platform Features
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Enterprise-grade AI infrastructure for automated due diligence
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-all hover:border-gray-700"
            >
              <div className="text-white mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Features.displayName = "Features";

// Agents Section
const AgentsSection = React.memo(() => {
  const agents = [
    {
      name: "Consistency Agent",
      description: "Validates data integrity and consistency across multiple documents",
      status: "Active"
    },
    {
      name: "Greenwashing Detector",
      description: "Identifies unsubstantiated environmental claims and validates sustainability metrics",
      status: "Active"
    },
    {
      name: "Compliance Agent",
      description: "Ensures regulatory adherence across multiple jurisdictions and frameworks",
      status: "Active"
    },
    {
      name: "Math Agent",
      description: "Performs complex financial calculations and modeling with high precision",
      status: "Active"
    },
    {
      name: "Risk Analysis Agent",
      description: "Comprehensive risk assessment with multi-dimensional analysis",
      status: "Active"
    }
  ];

  return (
    <section id="agents" className="py-20 px-6 bg-gray-900/30">
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-3xl md:text-4xl font-semibold text-center mb-4"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Specialized AI Agents
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Powered by Amazon Bedrock and Claude 3.5 Sonnet with Chain of Thought reasoning
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-800 bg-black/50 hover:bg-black transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {agent.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{agent.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

AgentsSection.displayName = "AgentsSection";

// Main Component
export default function AsperaLanding() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <Hero />
      <Features />
      <AgentsSection />
      <Footer
        logo={<Brain className="h-10 w-10 text-white" />}
        brandName="ASPERA"
        socialLinks={[
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com",
            label: "GitHub",
          },
          {
            icon: <Linkedin className="h-5 w-5" />,
            href: "https://linkedin.com",
            label: "LinkedIn",
          },
          {
            icon: <Mail className="h-5 w-5" />,
            href: "mailto:contact@aspera.ai",
            label: "Email",
          },
        ]}
        mainLinks={[
          { href: "#features", label: "Features" },
          { href: "#agents", label: "AI Agents" },
          { href: "#architecture", label: "Architecture" },
          { href: "#documentation", label: "Documentation" },
          { href: "/dashboard", label: "Dashboard" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
          { href: "/security", label: "Security" },
        ]}
        copyright={{
          text: "© 2025 ASPERA - AI-Powered Due Diligence Platform",
          license: "Powered by AWS Bedrock & Claude 3.5 Sonnet",
        }}
      />
    </main>
  );
}

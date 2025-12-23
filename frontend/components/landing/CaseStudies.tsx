"use client";

import React, { useEffect, useState } from "react";
import { Monitor, LayoutDashboard, Users } from "lucide-react";
import CountUp from "react-countup";

/** Hook: respects user's motion preferences */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** Utility: parse a metric like "98%", "3.8x", "$1,200+", "1.5M", "€23.4k" */
function parseMetricValue(raw: string) {
  const value = (raw ?? "").toString().trim();
  const m = value.match(
    /^([^\d\-+]*?)\s*([\-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([^\d\s]*)$/
  );
  if (!m) {
    return { prefix: "", end: 0, suffix: value, decimals: 0 };
  }
  const [, prefix, num, suffix] = m;
  const normalized = num.replace(/,/g, "");
  const end = parseFloat(normalized);
  const decimals = (normalized.split(".")[1]?.length ?? 0);
  return {
    prefix: prefix ?? "",
    end: isNaN(end) ? 0 : end,
    suffix: suffix ?? "",
    decimals,
  };
}

interface MetricStatProps {
  value: string;
  label: string;
  sub?: string;
  duration?: number;
}

/** Small component: one animated metric */
const MetricStat: React.FC<MetricStatProps> = ({
  value,
  label,
  sub,
  duration = 1.6,
}) => {
  const reduceMotion = usePrefersReducedMotion();
  const { prefix, end, suffix, decimals } = parseMetricValue(value);

  return (
    <div className="flex flex-col gap-2 text-left p-6">
      <p
        className="text-2xl font-medium text-gray-900 sm:text-4xl"
        aria-label={`${label} ${value}`}
      >
        {prefix}
        {reduceMotion ? (
          <span>
            {end.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </span>
        ) : (
          <CountUp
            end={end}
            decimals={decimals}
            duration={duration}
            separator=","
            enableScrollSpy
            scrollSpyOnce
          />
        )}
        {suffix}
      </p>
      <p className="font-medium text-gray-900 text-left">
        {label}
      </p>
      {sub ? (
        <p className="text-gray-600 text-left">{sub}</p>
      ) : null}
    </div>
  );
};

export default function CaseStudies() {
  const caseStudies = [
    {
      id: 1,
      quote:
        "ASPERA transformed our due diligence process. What used to take weeks now happens in hours with greater accuracy and consistency.",
      name: "Sarah Chen",
      role: "Investment Director",
      company: "Global Infrastructure Partners",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      metrics: [
        { label: "Time Saved", value: "85%" },
        { label: "Risk Detection", value: "3.2x" },
      ],
    },
    {
      id: 2,
      quote:
        "The greenwashing detection caught claims we would have missed. It's like having an expert ESG analyst on every deal.",
      name: "Marcus Rodriguez",
      role: "ESG Lead",
      company: "Sustainable Capital",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      metrics: [
        { label: "False Claims Detected", value: "47" },
        { label: "Compliance Score", value: "99%" },
      ],
    },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by investment professionals.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how teams are using AI-powered due diligence to make faster, more informed investment decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {caseStudies.map((study) => (
            <div key={study.id} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4 mb-6">
                  <img src={study.image} alt={study.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                     <h4 className="font-bold text-gray-900">{study.name}</h4>
                     <p className="text-sm text-gray-500">{study.role}, {study.company}</p>
                  </div>
               </div>
               <blockquote className="text-xl text-gray-800 font-medium mb-8 leading-relaxed">
                  &ldquo;{study.quote}&rdquo;
               </blockquote>
               <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                  {study.metrics.map((metric, i) => (
                     <div key={i}>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{metric.label}</p>
                     </div>
                  ))}
               </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-20 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
           <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <MetricStat value="500+" label="Documents Processed" sub="Daily throughput capacity" />
              <MetricStat value="99.7%" label="Accuracy Rate" sub="AI-verified extractions" />
              <MetricStat value="4" label="Specialized Agents" sub="Working in parallel" />
           </div>
        </div>

      </div>
    </section>
  );
}

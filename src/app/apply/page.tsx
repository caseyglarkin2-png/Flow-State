"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-lg px-4">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-4xl font-bold mb-4">Application Received</h1>
          <p className="text-slate-400">
            Thank you for applying to the Founding Member Program. We review applications weekly and will be in touch soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Founding Member Program</h1>
          <p className="text-xl text-slate-400">
            Join the first cohort of logistics leaders transforming their operations with Flow State.
          </p>
          <p className="text-cyan-400 mt-4 font-medium">Only 23 spots remaining</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What You Get</h2>
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Priority access to Flow State platform before public launch</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Direct line to our engineering team for custom integrations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Founding member pricing locked in for life</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Shape the product roadmap based on your facility needs</span>
            </li>
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Work Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Company
            </label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="Acme Logistics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Facilities
            </label>
            <select
              required
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select...</option>
              <option value="1">1 facility</option>
              <option value="2-5">2 to 5 facilities</option>
              <option value="6-20">6 to 20 facilities</option>
              <option value="20+">20+ facilities</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What is your biggest yard management challenge?
            </label>
            <textarea
              rows={4}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="Tell us about the friction in your current operations..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 text-lg"
          >
            Submit Application
          </Button>

          <p className="text-center text-sm text-slate-500">
            We review applications weekly. Qualified applicants will receive a response within 5 business days.
          </p>
        </form>
      </div>
    </div>
  );
}

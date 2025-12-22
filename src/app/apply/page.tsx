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
            Thank you for applying. We review applications personally and will reach out within 48 hours if there is a fit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider mb-4">By Invitation Only</p>
          <h1 className="text-5xl font-bold mb-6">Founding Member Program</h1>
          <p className="text-xl text-slate-300 mb-4">
            We currently power yard operations for <span className="text-white font-semibold">Primo Water</span>, the largest bottled water shipper in North America.
          </p>
          <p className="text-lg text-slate-400">
            Shipping water is one of the hardest logistics challenges in the industry. If we can solve it for them, we can solve it for you.
          </p>
          <p className="text-red-400 mt-6 font-bold text-lg">5 spots remaining</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-slate-400">Ideal Candidates</h2>
          <p className="text-slate-300 mb-6">We are selectively onboarding operations with complex trailer management needs:</p>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span><strong className="text-white">Reefer operations</strong> with temperature sensitive cargo and tight dock windows</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span><strong className="text-white">Flatbed yards</strong> managing oversized loads, staging complexity, and equipment tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span><strong className="text-white">High volume facilities</strong> running 100+ trailer moves per day</span>
            </li>
          </ul>
        </div>

        <div className="bg-cyan-950/30 border border-cyan-500/20 p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">What Founding Members Receive</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>White glove implementation with our engineering team on site</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Founding member pricing locked for the lifetime of your contract</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Direct input on product roadmap and feature prioritization</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 mt-1">→</span>
              <span>Priority support with same day response guarantee</span>
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
              Primary Trailer Type
            </label>
            <select
              required
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select...</option>
              <option value="reefer">Reefer</option>
              <option value="flatbed">Flatbed</option>
              <option value="dry-van">Dry Van</option>
              <option value="tanker">Tanker</option>
              <option value="mixed">Mixed Fleet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Daily Trailer Moves
            </label>
            <select
              required
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select...</option>
              <option value="under-50">Under 50</option>
              <option value="50-100">50 to 100</option>
              <option value="100-250">100 to 250</option>
              <option value="250+">250+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What is your biggest yard challenge?
            </label>
            <textarea
              rows={4}
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="Dwell time, detention costs, trailer visibility, dock scheduling..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 text-lg"
          >
            Request Consideration
          </Button>

          <p className="text-center text-sm text-slate-500">
            Applications are reviewed within 48 hours. We will reach out directly if there is a fit.
          </p>
        </form>
      </div>
    </div>
  );
}

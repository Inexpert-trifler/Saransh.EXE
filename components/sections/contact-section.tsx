"use client";

import React, { useState } from "react";
import { portfolioData } from "@/data/portfolio";
import {
  Copy,
  Check,
  Send,
  ArrowUpRight,
  Info,
  Clock,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/icons";
import confetti from "canvas-confetti";

export function ContactSection() {
  const { contact } = portfolioData;

  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: contact.preferredTopics[0] || "General Inquiry",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formState.name.trim()) errs.name = "Please provide your name or alias.";
    if (!formState.email.trim() || !formState.email.includes("@")) {
      errs.email = "Please provide a valid contact email.";
    }
    if (!formState.message.trim() || formState.message.length < 10) {
      errs.message = "Message must be at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmittedFeedback(null);

    // Honest simulation of submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedFeedback(
        `[DEMO MODE TRANSMISSION RECORDED]: Thank you, ${formState.name}! In this live demo environment, messages are validated on the client. For direct contact, reach out at ${contact.email}.`
      );

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#B9FF66", "#38BDF8", "#F5F5F5"],
      });

      setFormState({
        name: "",
        email: "",
        subject: contact.preferredTopics[0] || "General Inquiry",
        message: "",
      });
    }, 800);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-white/10 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#B9FF66]">
            {"// 07 · INITIATE TRANSMISSION"}
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            LET&apos;S BUILD TOGETHER
          </h2>
          <div className="mt-2 h-1 w-12 bg-[#B9FF66]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info & Copy Button */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Have an ambitious project, an AI agent prototype, or a creative product to build?
            </h3>

            <p className="text-sm text-[#A1A1AA] leading-relaxed font-sans">
              I love collaborating with forward-thinking founders, creative teams, and fellow builders. Whether it&apos;s a greenfield build or scaling an existing frontend architecture, let&apos;s talk.
            </p>

            {/* Email Card with Copy Action */}
            <div className="rounded-xl border border-white/10 bg-[#111111] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-zinc-500 uppercase">DIRECT DISPATCH</span>
                <span className="flex items-center gap-1 font-mono text-xs text-[#B9FF66]">
                  <Clock className="h-3 w-3" />
                  {contact.responseTime}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#171717] p-3">
                <span className="font-mono text-xs sm:text-sm text-white font-semibold truncate">
                  {contact.email}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                    className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 font-mono text-xs text-zinc-300 hover:bg-[#B9FF66] hover:text-[#080808] transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#B9FF66]" />
                        <span className="text-[#B9FF66] font-bold">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${contact.email}`}
                    aria-label="Open default mail client"
                    className="rounded-md bg-white/10 p-1.5 text-zinc-300 hover:bg-[#B9FF66] hover:text-[#080808] transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Preferred Topics */}
            <div>
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                IDEAL COLLABORATIONS:
              </span>
              <div className="space-y-1.5 font-mono text-xs text-zinc-400">
                {contact.preferredTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[#B9FF66]">&gt;</span>
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-4 border-t border-white/10">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider block mb-3">
                NETWORK PROFILES:
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Inexpert-trifler"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-xs font-mono text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-xs font-mono text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
                >
                  <LinkedinIcon className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-xs font-mono text-zinc-300 hover:border-[#B9FF66] hover:text-[#B9FF66] transition-colors"
                >
                  <TwitterIcon className="h-3.5 w-3.5" />
                  <span>Twitter / X</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 shadow-2xl">
              {/* Demo Mode Notice */}
              <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-blue-400/20 bg-blue-400/5 p-3 font-mono text-xs text-blue-300">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                <span>{contact.formNotice}</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block font-mono text-xs text-zinc-400 mb-1.5">
                      YOUR NAME / ALIAS *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Alex Vance"
                      className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#B9FF66] focus:outline-none focus:ring-1 focus:ring-[#B9FF66]"
                    />
                    {errors.name && (
                      <p className="mt-1 font-mono text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block font-mono text-xs text-zinc-400 mb-1.5">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="alex@domain.com"
                      className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#B9FF66] focus:outline-none focus:ring-1 focus:ring-[#B9FF66]"
                    />
                    {errors.email && (
                      <p className="mt-1 font-mono text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject Topic */}
                <div>
                  <label htmlFor="subject" className="block font-mono text-xs text-zinc-400 mb-1.5">
                    TRANSMISSION TOPIC
                  </label>
                  <select
                    id="subject"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-2.5 text-sm text-white focus:border-[#B9FF66] focus:outline-none focus:ring-1 focus:ring-[#B9FF66]"
                  >
                    {contact.preferredTopics.map((t, idx) => (
                      <option key={idx} value={t} className="bg-[#171717]">
                        {t}
                      </option>
                    ))}
                    <option value="Other" className="bg-[#171717]">Other Collaboration</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block font-mono text-xs text-zinc-400 mb-1.5">
                    PROJECT BRIEF / MESSAGE *
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Tell me about the problem, timeline, or idea you're looking to explore..."
                    className="w-full rounded-lg border border-white/10 bg-[#171717] px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#B9FF66] focus:outline-none focus:ring-1 focus:ring-[#B9FF66]"
                  />
                  {errors.message && (
                    <p className="mt-1 font-mono text-xs text-red-400">{errors.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B9FF66] py-3.5 font-mono text-sm font-bold text-[#080808] transition-all hover:bg-[#a3e635] hover:shadow-[0_0_20px_rgba(185,255,102,0.4)] disabled:opacity-50"
                >
                  {submitting ? (
                    <span>DISPATCHING PACKETS...</span>
                  ) : (
                    <>
                      <span>TRANSMIT MESSAGE</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Feedback Alert */}
                {submittedFeedback && (
                  <div className="mt-4 rounded-lg border border-[#B9FF66]/30 bg-[#B9FF66]/10 p-4 font-mono text-xs text-[#B9FF66]">
                    {submittedFeedback}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

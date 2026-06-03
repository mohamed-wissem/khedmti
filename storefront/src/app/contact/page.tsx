"use client";

import { useState } from "react";
import { Mail, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-widest text-ember">Talk to us</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-moon">Contact support</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Form */}
        <div className="forged-surface rounded-bf border border-ash/60 p-6">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-ember" />
              <h2 className="mt-3 font-display text-xl font-bold text-moon">Message sent</h2>
              <p className="mt-1 text-sm text-smoke">We&apos;ll reply to your email shortly. (Demo — no message is actually delivered yet.)</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" name="name" required />
                <Input label="Email" name="email" type="email" required />
              </div>
              <Input label="Subject" name="subject" required />
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-smoke">Message</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full rounded-bf border border-ash bg-iron px-4 py-3 text-moon outline-none focus:border-ember"
                />
              </label>
              <Button type="submit" size="lg">Send message</Button>
            </form>
          )}
        </div>

        {/* Aside */}
        <aside className="space-y-4">
          <Info icon={Clock} title="Response time" body="Usually under an hour, 7 days a week." />
          <Info icon={MessageCircle} title="Live chat" body="Available from your dashboard during peak hours." />
          <Info icon={Mail} title="Email" body="support@blackforge.gg" />
        </aside>
      </div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-smoke">{label}</span>
      <input {...props} className="w-full rounded-bf border border-ash bg-iron px-4 py-3 text-moon outline-none focus:border-ember" />
    </label>
  );
}

function Info({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="forged-surface rounded-bf border border-ash/60 p-4">
      <Icon className="h-5 w-5 text-ember" />
      <h3 className="mt-2 text-sm font-medium text-moon">{title}</h3>
      <p className="text-sm text-smoke">{body}</p>
    </div>
  );
}

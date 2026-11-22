"use client";

import { useState } from "react";
import { saveNote } from "@/lib/services/local-notes";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (message.trim().length < 12) next.message = "Write at least a short note.";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveNote("smartlms.messages", { name: name.trim(), email: email.trim(), message: message.trim(), createdAt: new Date().toISOString() });
    setSaved(true);
  }

  if (saved) {
    return <p className="border border-line bg-shell p-5 text-[15px] leading-7">Saved on this device. Nothing was emailed. The support address above is a demo contact, not a monitored inbox.</p>;
  }

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      <label className="block text-[13px] font-medium">
        Full name
        <input className="field mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />
        {errors.name ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.name}</span> : null}
      </label>
      <label className="block text-[13px] font-medium">
        Email address
        <input className="field mt-1.5" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        {errors.email ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.email}</span> : null}
      </label>
      <label className="block text-[13px] font-medium">
        Message
        <textarea className="field mt-1.5 min-h-32" value={message} onChange={(event) => setMessage(event.target.value)} />
        {errors.message ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.message}</span> : null}
      </label>
      <button type="submit" className="h-11 w-fit bg-blue px-5 text-[14px] font-semibold text-[var(--on-action)]">Send message</button>
    </form>
  );
}

export function DemoForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRoleName] = useState("");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (organization.trim().length < 2) next.organization = "Enter an organization name.";
    if (!role) next.role = "Select a role.";
    if (!when) next.when = "Choose a preferred time.";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveNote("smartlms.demos", {
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      role,
      when,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="border border-line bg-shell p-6">
        <h2 className="text-[22px] font-semibold">Request kept on this device</h2>
        <p className="mt-3 text-[15px] leading-7 text-muted">No calendar invite is sent. Open a demo workspace now if you want to walk through the product yourself.</p>
        <a href="/login" className="mt-5 inline-flex h-11 items-center bg-teal px-5 text-[14px] font-semibold text-[#08211e]">Choose a demo role</a>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      <label className="block text-[13px] font-medium">Full name<input className="field mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />{errors.name ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.name}</span> : null}</label>
      <label className="block text-[13px] font-medium">Work email<input className="field mt-1.5" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />{errors.email ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.email}</span> : null}</label>
      <label className="block text-[13px] font-medium">Organization<input className="field mt-1.5" value={organization} onChange={(event) => setOrganization(event.target.value)} />{errors.organization ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.organization}</span> : null}</label>
      <label className="block text-[13px] font-medium">
        Role
        <select className="field mt-1.5" value={role} onChange={(event) => setRoleName(event.target.value)}>
          <option value="">Select</option>
          <option>Student</option>
          <option>Instructor</option>
          <option>Institution</option>
        </select>
        {errors.role ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.role}</span> : null}
      </label>
      <label className="block text-[13px] font-medium">
        Preferred time
        <select className="field mt-1.5" value={when} onChange={(event) => setWhen(event.target.value)}>
          <option value="">Select a window</option>
          <option>Weekday morning</option>
          <option>Weekday afternoon</option>
          <option>I will explore the demo myself</option>
        </select>
        {errors.when ? <span className="mt-1 block text-[12px] font-normal text-red">{errors.when}</span> : null}
      </label>
      <label className="block text-[13px] font-medium">What you want to see<textarea className="field mt-1.5 min-h-28" value={note} onChange={(event) => setNote(event.target.value)} /></label>
      <button type="submit" className="h-11 w-fit bg-teal px-5 text-[14px] font-semibold text-[#08211e]">Book a demo</button>
      <p className="text-[13px] leading-6 text-muted">Stored locally. This does not schedule a meeting.</p>
    </form>
  );
}

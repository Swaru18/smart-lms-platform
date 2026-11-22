"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ROLE_HOME } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { passwordChecks, validateEmail, validatePassword, validateRegistration } from "@/lib/validation";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function AuthShell({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-5 py-12">
        <Link href="/" className="font-display text-[15px] font-semibold tracking-tight">Smart LMS</Link>
        <h1 className="mt-8 text-[28px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-[14px] leading-6 text-muted">{lede}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-[12px] leading-5 text-muted">Accounts are stored only in this browser and are not production authentication. They will not be available on another device until Supabase Auth is connected.</p>
      </div>
    </div>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <span className="mt-1 block text-[12px] text-red" role="alert">{children}</span>;
}

export function SignInScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, state } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const hasAdmin = state.users.some((user) => user.role === "admin");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    if (!password) return setError("Enter your password.");
    setPending(true);
    const result = await login(email, password, remember);
    setPending(false);
    if (result) return setError(result);
    const next = safeNext(params.get("next"));
    const role = state.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase())?.role ?? "learner";
    router.push(next ?? ROLE_HOME[role]);
  }

  return (
    <AuthShell title="Sign in" lede="Use the email and password you created on this browser.">
      <form className="grid gap-3" onSubmit={submit} noValidate>
        <label className="text-[13px] font-medium">Email
          <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="text-[13px] font-medium">Password
          <input className="field mt-1.5" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Remember me on this browser
        </label>
        {error ? <p className="text-[13px] text-red" role="alert">{error}</p> : null}
        <button type="submit" className="h-11 rounded-[11px] bg-blue text-[14px] font-medium text-[var(--on-action)] disabled:opacity-50" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-[13px]">
        <Link className="text-blue" href="/forgot-password">Forgot password</Link>
        <Link className="text-blue" href="/signup">Create account</Link>
      </div>
      {hasAdmin ? null : <p className="mt-4 text-[13px] text-muted">No administrator yet. <Link className="text-blue" href="/setup">Create the administrator account</Link>.</p>}
    </AuthShell>
  );
}

export function SignUpScreen() {
  const router = useRouter();
  const { register } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<"learner" | "instructor">("learner");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const checks = passwordChecks(password);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = validateRegistration({ name, email, password, confirm, terms, role });
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;
    setPending(true);
    const result = await register({ name, email, password, role });
    setPending(false);
    if (result) return setFormError(result);
    if (role === "instructor") {
      setWaiting(true);
      return;
    }
    router.push(ROLE_HOME.learner);
  }

  return (
    <AuthShell title="Create account" lede="Students can start immediately. Instructor accounts wait for approval.">
      {waiting ? (
        <div className="rounded-[14px] border border-line bg-card p-4 text-[14px] leading-6">
          <p className="font-medium">Waiting for approval</p>
          <p className="mt-2 text-muted">An administrator needs to activate this instructor account before you can sign in.</p>
          <Link className="mt-4 inline-flex text-blue" href="/login">Back to sign in</Link>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={submit} noValidate>
          <label className="text-[13px] font-medium">Full name
            <input className="field mt-1.5" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required aria-invalid={Boolean(errors.name)} />
            <FieldError>{errors.name}</FieldError>
          </label>
          <label className="text-[13px] font-medium">Email
            <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required aria-invalid={Boolean(errors.email)} />
            <FieldError>{errors.email}</FieldError>
          </label>
          <label className="text-[13px] font-medium">Password
            <input className="field mt-1.5" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required aria-invalid={Boolean(errors.password)} />
            <FieldError>{errors.password}</FieldError>
            <span className="mt-1 block text-[12px] text-muted">{checks.length ? "Length ok." : "At least 8 characters."} {checks.mixed ? "Letter and number ok." : "Add a letter and a number."}</span>
          </label>
          <label className="text-[13px] font-medium">Confirm password
            <input className="field mt-1.5" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required aria-invalid={Boolean(errors.confirm)} />
            <FieldError>{errors.confirm}</FieldError>
          </label>
          <label className="text-[13px] font-medium">Role
            <select className="field mt-1.5" value={role} onChange={(event) => setRole(event.target.value as "learner" | "instructor")}>
              <option value="learner">Student</option>
              <option value="instructor">Instructor</option>
            </select>
            <FieldError>{errors.role}</FieldError>
          </label>
          <div className="flex items-start gap-2 text-[13px]">
            <input id="terms" className="mt-1" type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
            <label htmlFor="terms">I agree to the <Link className="text-blue" href="/terms">terms</Link> and <Link className="text-blue" href="/privacy">privacy note</Link>.</label>
          </div>
          <FieldError>{errors.terms}</FieldError>
          {formError ? <p className="text-[13px] text-red" role="alert">{formError}</p> : null}
          <button type="submit" className="h-11 rounded-[11px] bg-blue text-[14px] font-medium text-[var(--on-action)] disabled:opacity-50" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
          <p className="text-[13px] text-muted">Already registered? <Link className="text-blue" href="/login">Sign in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}

export function ForgotPasswordScreen() {
  const { state } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);
    if (password !== confirm) return setError("Passwords do not match.");
    const user = state.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    setPending(true);
    if (!user) {
      setPending(false);
      setMessage("If this email has an account on this browser, the password can be changed here. No match was found, and nothing was emailed.");
      return;
    }
    const { authRepository } = await import("@/lib/services/auth-repository");
    const saved = await authRepository.saveCredential(user.id, user.email, password);
    setPending(false);
    if (saved) return setError(saved);
    setMessage("Password updated on this browser. Email delivery is not connected.");
  }

  return (
    <AuthShell title="Reset password" lede="Email is not sent in this release. If the address exists on this browser, you can set a new password.">
      <form className="grid gap-3" onSubmit={submit} noValidate>
        <label className="text-[13px] font-medium">Email
          <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="text-[13px] font-medium">New password
          <input className="field mt-1.5" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label className="text-[13px] font-medium">Confirm password
          <input className="field mt-1.5" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
        </label>
        {error ? <p className="text-[13px] text-red" role="alert">{error}</p> : null}
        {message ? <p className="text-[13px] leading-6 text-muted">{message}</p> : null}
        <button type="submit" className="h-11 rounded-[11px] bg-blue text-[14px] font-medium text-[var(--on-action)] disabled:opacity-50" disabled={pending}>{pending ? "Saving…" : "Update password"}</button>
      </form>
      <p className="mt-4 text-[13px]"><Link className="text-blue" href="/login">Back to sign in</Link></p>
    </AuthShell>
  );
}

export function SetupAdminScreen() {
  const router = useRouter();
  const { setupAdmin, state } = useStore();
  const hasAdmin = state.users.some((user) => user.role === "admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter your full name.");
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);
    if (password !== confirm) return setError("Passwords do not match.");
    setPending(true);
    const result = await setupAdmin({ name, email, password });
    setPending(false);
    if (result) return setError(result);
    router.push(ROLE_HOME.admin);
  }

  return (
    <AuthShell title="Administrator setup" lede="Public registration cannot create an administrator. This screen is available until the first administrator exists on this browser.">
      {hasAdmin ? (
        <p className="text-[14px] leading-6">An administrator already exists. <Link className="text-blue" href="/login">Sign in</Link>.</p>
      ) : (
        <form className="grid gap-3" onSubmit={submit} noValidate>
          <label className="text-[13px] font-medium">Full name
            <input className="field mt-1.5" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="text-[13px] font-medium">Email
            <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="text-[13px] font-medium">Password
            <input className="field mt-1.5" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label className="text-[13px] font-medium">Confirm password
            <input className="field mt-1.5" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
          </label>
          {error ? <p className="text-[13px] text-red" role="alert">{error}</p> : null}
          <button type="submit" className="h-11 rounded-[11px] bg-blue text-[14px] font-medium text-[var(--on-action)] disabled:opacity-50" disabled={pending}>{pending ? "Creating…" : "Create administrator"}</button>
        </form>
      )}
    </AuthShell>
  );
}

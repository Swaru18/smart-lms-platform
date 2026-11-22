"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[11px] px-3.5 text-[14px] font-medium transition-colors disabled:opacity-50",
        variant === "primary" && "bg-[#CFAC87] text-[#392E27] hover:bg-[#B9916B]",
        variant === "secondary" && "border border-[#E3D4C4] bg-[#F7F2EA] text-[#392E27] hover:bg-[#EEE5DA]",
        variant === "quiet" && "bg-transparent text-muted hover:bg-elevated hover:text-ink",
        variant === "danger" && "border border-red/40 bg-transparent text-red hover:bg-[var(--red-soft)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn("grid h-10 w-10 place-items-center rounded-[11px] text-muted hover:bg-elevated hover:text-ink", className)}
      {...props}
    >
      {children}
    </button>
  );
}

const pillTone = {
  neutral: "bg-elevated text-ink",
  teal: "bg-[var(--teal-soft)] text-teal",
  blue: "bg-[var(--blue-soft)] text-blue",
  orange: "bg-[var(--orange-soft)] text-orange",
  green: "bg-[var(--green-soft)] text-green",
  red: "bg-[var(--red-soft)] text-red",
};

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof pillTone }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium", pillTone[tone])}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-elevated"
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className="h-full rounded-full bg-teal" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line bg-card px-6 py-10 text-center">
      <h3 className="text-[16px] font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-red/30 bg-[var(--red-soft)] px-6 py-8" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0 text-red" size={18} />
        <div>
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <p className="mt-1 text-[13px] leading-6 text-ink/80">{body}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[14px] bg-elevated", className)} />;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[12px] text-muted">{eyebrow}</p> : null}
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      <span className="contents" onFocus={() => undefined}>
        {typeof children === "object" && children && "type" in (children as object)
          ? children
          : children}
      </span>
      {error ? <span className="mt-1 block text-[12px] text-red">{error}</span> : hint ? <span className="mt-1 block text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("field", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("field min-h-28", props.className)} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("field", props.className)} />;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-[var(--scrim)]"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cn(
              "relative max-h-[90vh] w-full overflow-y-auto rounded-[16px] border border-line bg-shell p-5 shadow-[var(--shadow)] outline-none",
              wide ? "max-w-2xl" : "max-w-lg",
            )}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-[18px] font-semibold">{title}</h2>
                {description ? <p className="mt-1 text-[13px] leading-6 text-muted">{description}</p> : null}
              </div>
              <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  title,
  onClose,
  children,
  side = "right",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
}) {
  const reduce = useReducedMotion();
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const position = side === "left"
    ? "left-0 top-0 h-full w-[min(100%,320px)]"
    : side === "bottom"
      ? "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-[16px]"
      : "right-0 top-0 h-full w-[min(100%,420px)]";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button type="button" aria-label="Close panel" className="absolute inset-0 bg-[var(--scrim)]" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn("absolute flex flex-col border-line bg-shell p-4 shadow-[var(--shadow)]", position, side !== "bottom" && "border-l")}
            initial={reduce ? false : side === "bottom" ? { y: 24 } : { x: side === "left" ? -16 : 16 }}
            animate={{ x: 0, y: 0 }}
            exit={reduce ? undefined : side === "bottom" ? { y: 24 } : { x: side === "left" ? -16 : 16 }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-[16px] font-semibold">{title}</h2>
              <IconButton label="Close panel" onClick={onClose}><X size={18} /></IconButton>
            </div>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} description={body} onClose={onClose}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function ToastViewport() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(100%-2rem,360px)] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto flex items-start gap-3 rounded-[12px] border border-line bg-shell px-3 py-3 shadow-[var(--shadow)]"
          >
            <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", toast.tone === "danger" ? "bg-[var(--red-soft)] text-red" : "bg-[var(--teal-soft)] text-teal")}>
              {toast.tone === "danger" ? <AlertTriangle size={14} /> : <Check size={14} />}
            </span>
            <p className="flex-1 text-[13px] leading-5">{toast.title}</p>
            <button type="button" className="text-muted hover:text-ink" aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}>
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function DemoChip() {
  return <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted">Demo mode</span>;
}

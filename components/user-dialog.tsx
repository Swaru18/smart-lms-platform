"use client";

import { useState } from "react";
import { newId } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Engagement, Role, User, UserStatus } from "@/lib/types";
import { Button, Modal, SelectInput, TextArea, TextInput } from "./ui";

const colors = ["#D8C8B8", "#A18B7B", "#CDBBA8", "#E8E0D7", "#765C4B"];

export function UserDialog({
  open,
  initial,
  onClose,
  defaultRole = "learner",
}: {
  open: boolean;
  initial?: User | null;
  onClose: () => void;
  defaultRole?: Role;
}) {
  return (
    <Modal open={open} title={initial?.id ? "Edit person" : "Add person"} description="Saved on this browser. A password lets them sign in here." onClose={onClose} wide>
      {open ? <UserForm key={initial?.id || "new"} initial={initial?.id ? initial : null} defaultRole={defaultRole} onClose={onClose} /> : null}
    </Modal>
  );
}

function UserForm({ initial, onClose, defaultRole }: { initial?: User | null; onClose: () => void; defaultRole: Role }) {
  const { provisionAccount } = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initial?.role ?? defaultRole);
  const [status, setStatus] = useState<UserStatus>(initial?.status ?? "active");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [engagement, setEngagement] = useState<Engagement>(initial?.engagement ?? "inactive");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (name.trim().length < 2) return setError("Enter a full name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
        const user: User = {
          id: initial?.id || newId("user"),
          name: name.trim(),
          email: email.trim(),
          role,
          status,
          title: title.trim() || (role === "admin" ? "Administrator" : role === "instructor" ? "Instructor" : "Student"),
          engagement: role === "learner" ? engagement : undefined,
          lastActive: initial?.lastActive ?? new Date().toISOString().slice(0, 10),
          bio: bio.trim(),
          color: initial?.color ?? colors[Math.floor(Math.random() * colors.length)],
          avatar: initial?.avatar,
        };
        setPending(true);
        const result = await provisionAccount(user, password || undefined);
        setPending(false);
        if (result) return setError(result);
        onClose();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px] font-medium">Name
          <TextInput className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="block text-[13px] font-medium">Email
          <TextInput className="mt-1.5" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block text-[13px] font-medium sm:col-span-2">Password
          <TextInput className="mt-1.5" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={initial ? "Leave blank to keep the current password" : "At least 8 characters, with a letter and a number"} />
        </label>
        <label className="block text-[13px] font-medium">Role
          <SelectInput className="mt-1.5" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="learner">Learner</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </SelectInput>
        </label>
        <label className="block text-[13px] font-medium">Account status
          <SelectInput className="mt-1.5" value={status} onChange={(event) => setStatus(event.target.value as UserStatus)}>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </SelectInput>
        </label>
        <label className="block text-[13px] font-medium sm:col-span-2">Title
          <TextInput className="mt-1.5" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        {role === "learner" ? (
          <label className="block text-[13px] font-medium sm:col-span-2">Learning state
            <SelectInput className="mt-1.5" value={engagement} onChange={(event) => setEngagement(event.target.value as Engagement)}>
              <option value="active">Active</option>
              <option value="at_risk">At risk</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </SelectInput>
          </label>
        ) : null}
        <label className="block text-[13px] font-medium sm:col-span-2">Note
          <TextArea className="mt-1.5" value={bio} onChange={(event) => setBio(event.target.value)} />
        </label>
      </div>
      {error ? <p className="text-[13px] text-red" role="alert">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : initial ? "Save changes" : "Add person"}</Button>
      </div>
    </form>
  );
}

import { useState } from "react";
import { addCompany, addContact, updateContact, useStore } from "@/lib/store";
import type { Contact } from "@/lib/types";
import {
  Modal,
  Field,
  inputClass,
  textareaClass,
  btnPrimary,
  btnGhost,
} from "@/components/ui-kit/Modal";

interface Props {
  onClose: () => void;
  defaultPhone?: string;
  initial?: Contact;
}

export function AddContactModal({ onClose, defaultPhone, initial }: Props) {
  const companies = useStore((s) => s.companies);
  const isEdit = !!initial;

  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? defaultPhone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [companyId, setCompanyId] = useState<string>(initial?.companyId ?? "");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) return;
    let finalCompanyId = companyId || undefined;
    if (creatingCompany && newCompanyName.trim()) {
      const c = addCompany({ name: newCompanyName.trim() });
      finalCompanyId = c.id;
    }
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      companyId: finalCompanyId,
      designation: designation.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEdit && initial) updateContact(initial.id, payload);
    else addContact(payload);
    onClose();
  }

  return (
    <Modal
      title={isEdit ? "Edit contact" : "New contact"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button form="contact-form" type="submit" className={btnPrimary}>
            {isEdit ? "Save changes" : "Add contact"}
          </button>
        </>
      }
    >
      <form id="contact-form" onSubmit={submit} className="grid grid-cols-2 gap-4">
        <Field label="First name">
          <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus required />
        </Field>
        <Field label="Last name">
          <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </Field>
        <Field label="Email">
          <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Company">
          {creatingCompany ? (
            <div className="flex gap-1">
              <input
                className={inputClass}
                placeholder="New company name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setCreatingCompany(false);
                  setNewCompanyName("");
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <select
                className={inputClass}
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">— None —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={btnGhost}
                onClick={() => setCreatingCompany(true)}
              >
                + New
              </button>
            </div>
          )}
        </Field>
        <Field label="Designation">
          <input className={inputClass} value={designation} onChange={(e) => setDesignation(e.target.value)} />
        </Field>
        <div className="col-span-2">
          <Field label="Notes">
            <textarea rows={3} className={textareaClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

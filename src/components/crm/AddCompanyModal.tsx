import { useState } from "react";
import { addCompany, updateCompany } from "@/lib/store";
import type { Company } from "@/lib/types";
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
  initial?: Company;
}

export function AddCompanyModal({ onClose, initial }: Props) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [revenue, setRevenue] = useState(initial?.revenue ?? "");
  const [currentErp, setCurrentErp] = useState(initial?.currentErp ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      website: website.trim() || undefined,
      industry: industry.trim() || undefined,
      revenue: revenue.trim() || undefined,
      currentErp: currentErp.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEdit && initial) updateCompany(initial.id, payload);
    else addCompany(payload);
    onClose();
  }

  return (
    <Modal
      title={isEdit ? "Edit company" : "New company"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button form="company-form" type="submit" className={btnPrimary}>
            {isEdit ? "Save changes" : "Add company"}
          </button>
        </>
      }
    >
      <form id="company-form" onSubmit={submit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Company name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </Field>
        </div>
        <Field label="Website">
          <input className={inputClass} placeholder="acme.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </Field>
        <Field label="Industry">
          <input className={inputClass} value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </Field>
        <Field label="Revenue">
          <input className={inputClass} placeholder="$10M – $50M" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
        </Field>
        <Field label="Current ERP">
          <input className={inputClass} value={currentErp} onChange={(e) => setCurrentErp(e.target.value)} />
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { HIRING_STAGES, type Candidate, type HiringStage } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface CandidateFormProps {
  initialData?: Partial<Candidate>;
  mode: 'create' | 'edit';
  candidateId?: string;
}

interface FormErrors {
  [key: string]: string;
}

function validate(data: Record<string, string>): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName?.trim()) errors.fullName = 'Full name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Invalid email address';
  if (!data.appliedRole?.trim()) errors.appliedRole = 'Applied role is required';
  if (!data.experience?.trim()) errors.experience = 'Experience is required';
  return errors;
}

export function CandidateForm({ initialData, mode, candidateId }: CandidateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [form, setForm] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    appliedRole: initialData?.appliedRole || '',
    skills: initialData?.skills?.join(', ') || '',
    experience: initialData?.experience || '',
    hiringStage: initialData?.hiringStage || 'Applied',
    resumeUrl: initialData?.resumeUrl || '',
    notes: initialData?.notes || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const url = mode === 'create' ? '/api/candidates' : `/api/candidates/${candidateId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Something went wrong');
        return;
      }

      router.push(mode === 'create' ? '/candidates' : `/candidates/${data._id}`);
      router.refresh();
    } catch {
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {apiError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Full Name"
            required
            error={errors.fullName}
          >
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={handleChange}
              className={inputClass(!!errors.fullName)}
            />
          </Field>

          <Field label="Email Address" required error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass(!!errors.email)}
            />
          </Field>

          <Field label="Phone Number">
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={handleChange}
              className={inputClass(false)}
            />
          </Field>

          <Field label="Applied Role" required error={errors.appliedRole}>
            <input
              id="appliedRole"
              name="appliedRole"
              type="text"
              placeholder="Senior Software Engineer"
              value={form.appliedRole}
              onChange={handleChange}
              className={inputClass(!!errors.appliedRole)}
            />
          </Field>

          <Field label="Experience" required error={errors.experience}>
            <input
              id="experience"
              name="experience"
              type="text"
              placeholder="3 years, Senior, 5+ years..."
              value={form.experience}
              onChange={handleChange}
              className={inputClass(!!errors.experience)}
            />
          </Field>

          <Field label="Hiring Stage">
            <select
              id="hiringStage"
              name="hiringStage"
              value={form.hiringStage}
              onChange={handleChange}
              className={inputClass(false)}
            >
              {HIRING_STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Skills" className="md:col-span-2">
            <input
              id="skills"
              name="skills"
              type="text"
              placeholder="React, Node.js, TypeScript (comma separated)"
              value={form.skills}
              onChange={handleChange}
              className={inputClass(false)}
            />
            <p className="text-xs text-slate-400 mt-1">Separate multiple skills with commas</p>
          </Field>

          <Field label="Resume URL" className="md:col-span-2">
            <input
              id="resumeUrl"
              name="resumeUrl"
              type="url"
              placeholder="https://drive.google.com/file/..."
              value={form.resumeUrl}
              onChange={handleChange}
              className={inputClass(false)}
            />
          </Field>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Notes</h2>
        </div>
        <div className="p-5">
          <Field label="Internal Notes">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Any additional notes about this candidate..."
              value={form.notes}
              onChange={handleChange}
              className={`${inputClass(false)} resize-none`}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Add Candidate' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
    hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'
  }`;
}

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

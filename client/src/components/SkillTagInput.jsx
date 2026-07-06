import { useState } from 'react';
import { Plus, X } from 'lucide-react';

/** Reusable "type + Enter to add" tag input used for skills across the app. */
export default function SkillTagInput({ value = [], onChange, placeholder = 'Add a skill' }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
  };

  const remove = (skill) => onChange(value.filter((s) => s !== skill));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          className="input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <span key={skill} className="badge bg-signal/10 text-signal-dark gap-1.5">
            {skill}
            <button type="button" onClick={() => remove(skill)}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { FormFieldDraft, FormFieldType } from '@/types/form-field.types';

const fieldTypeOptions: { value: FormFieldType; label: string }[] = [
  { value: 'TEXT', label: 'Văn bản ngắn' },
  { value: 'TEXTAREA', label: 'Văn bản dài' },
  { value: 'URL', label: 'Đường dẫn URL' },
  { value: 'SELECT', label: 'Danh sách lựa chọn' },
  { value: 'FILE', label: 'Tệp đính kèm' },
];

interface Props {
  fields: FormFieldDraft[];
  onChange: (fields: FormFieldDraft[]) => void;
  disabled?: boolean;
}

export const FormFieldsEditor: React.FC<Props> = ({ fields, onChange, disabled = false }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateField = (index: number, updates: Partial<FormFieldDraft>) => {
    onChange(fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...updates } : field));
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, fieldIndex) => fieldIndex !== index).map((field, displayOrder) => ({ ...field, displayOrder })));
  };

  const moveField = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    const next = [...fields];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next.map((field, displayOrder) => ({ ...field, displayOrder })));
  };

  const dropField = (event: React.DragEvent<HTMLElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedIndex == null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    moveField(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const addField = () => onChange([...fields, { label: '', fieldType: 'TEXT', required: false, options: [], displayOrder: fields.length }]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Form ứng tuyển</h2>
          <p className="mt-1 text-xs text-slate-500">Thêm câu hỏi riêng cho Job. Các trường mặc định họ tên, email, số điện thoại và CV vẫn do flow apply cung cấp.</p>
        </div>
        <button
          type="button"
          onClick={addField}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Thêm câu hỏi
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
          <p className="text-sm font-bold text-slate-600">Đang dùng form mặc định</p>
          <p className="mt-1 text-xs text-slate-400">Bạn có thể thêm câu hỏi tùy chỉnh cho ứng viên.</p>
        </div>
      ) : (
        <div className="space-y-4" aria-label="Danh sách câu hỏi form ứng tuyển">
          {fields.map((field, index) => (
            <article
              key={field.id ?? `new-${index}`}
              draggable={!disabled}
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={event => event.preventDefault()}
              onDrop={event => dropField(event, index)}
              className={`rounded-2xl border border-slate-200 bg-slate-50/60 p-4 ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="mb-4 flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-slate-300" aria-hidden="true" />
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">{index + 1}</span>
                <span className="text-xs font-extrabold text-slate-700">Câu hỏi tùy chỉnh</span>
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" onClick={() => moveField(index, index - 1)} disabled={disabled || index === 0} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-white disabled:opacity-30" aria-label="Đưa câu hỏi lên">↑</button>
                  <button type="button" onClick={() => moveField(index, index + 1)} disabled={disabled || index === fields.length - 1} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-white disabled:opacity-30" aria-label="Đưa câu hỏi xuống">↓</button>
                  <button type="button" onClick={() => removeField(index)} disabled={disabled} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 disabled:opacity-30" aria-label={`Xóa câu hỏi ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Nhãn câu hỏi *</span>
                  <input value={field.label} required disabled={disabled} onChange={event => updateField(index, { label: event.target.value })} placeholder="Ví dụ: Link Portfolio" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-60" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Loại input *</span>
                  <select value={field.fieldType} required disabled={disabled} onChange={event => updateField(index, { fieldType: event.target.value as FormFieldType, options: event.target.value === 'SELECT' ? field.options : [] })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-60">
                    {fieldTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>

              {field.fieldType === 'SELECT' && <OptionsEditor options={field.options} disabled={disabled} onChange={options => updateField(index, { options })} />}

              <label className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-600">
                <input type="checkbox" checked={field.required} disabled={disabled} onChange={event => updateField(index, { required: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                Bắt buộc ứng viên trả lời
              </label>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

const OptionsEditor: React.FC<{ options: string[]; disabled: boolean; onChange: (options: string[]) => void }> = ({ options, disabled, onChange }) => (
  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
    <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Các lựa chọn *</span><button type="button" disabled={disabled} onClick={() => onChange([...options, ''])} className="text-[11px] font-bold text-primary-600 hover:text-primary-800 disabled:opacity-40">+ Thêm lựa chọn</button></div>
    <div className="space-y-2">
      {(options.length ? options : ['']).map((option, index) => <div key={`${index}-${option}`} className="flex gap-2"><input value={option} required disabled={disabled} onChange={event => onChange((options.length ? options : ['']).map((item, optionIndex) => optionIndex === index ? event.target.value : item))} placeholder={`Lựa chọn ${index + 1}`} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary-500 disabled:opacity-60" />{(options.length > 1) && <button type="button" disabled={disabled} onClick={() => onChange(options.filter((_, optionIndex) => optionIndex !== index))} className="rounded-lg px-2 text-xs font-bold text-red-400 hover:bg-red-50 disabled:opacity-40" aria-label={`Xóa lựa chọn ${index + 1}`}>×</button>}</div>)}
    </div>
  </div>
);

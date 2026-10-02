import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { LocationOption } from '@/services/location.service';

interface Props {
  label: string;
  value: string;
  options: LocationOption[];
  placeholder: string;
  searchPlaceholder: string;
  loadingText?: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  onChange: (code: string) => void;
}

const normalizeForSearch = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('vi').replace(/đ/g, 'd');

export const SearchableLocationSelect: React.FC<Props> = ({
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  loadingText = 'Đang tải danh sách...',
  emptyText,
  disabled = false,
  loading = false,
  required = false,
  onChange,
}) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<HTMLLIElement>(null);

  const selectedOption = options.find(option => option.code === value);
  const normalizedSearch = normalizeForSearch(search.trim());
  const filteredOptions = useMemo(
    () => options.filter(option =>
      normalizeForSearch(`${option.name} ${option.code}`).includes(normalizedSearch),
    ),
    [normalizedSearch, options],
  );
  const clearOption = value && !normalizedSearch
    ? [{ code: '', name: `Bỏ chọn ${label.toLocaleLowerCase('vi')}` }]
    : [];
  const visibleOptions = [...clearOption, ...filteredOptions];
  const listboxId = `${id}-options`;
  const activeOptionId = visibleOptions[activeIndex] ? `${listboxId}-${activeIndex}` : undefined;
  const showInvalid = required && touched && !value;

  useEffect(() => {
    if (!open) return;

    searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setTouched(true);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const selectOption = (code: string) => {
    onChange(code);
    setTouched(true);
    setSearch('');
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      setSearch('');
      setTouched(true);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!visibleOptions.length) return;
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(current => Math.max(0, Math.min(visibleOptions.length - 1, current + direction)));
      return;
    }

    if (event.key === 'Enter' && visibleOptions[activeIndex]) {
      event.preventDefault();
      selectOption(visibleOptions[activeIndex].code);
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0 space-y-1.5">
      <span id={`${id}-label`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}{required && ' *'}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-required={required}
        aria-invalid={showInvalid || undefined}
        disabled={disabled || loading}
        onClick={() => {
          if (open) {
            setOpen(false);
            setSearch('');
            setTouched(true);
          } else {
            setSearch('');
            setActiveIndex(0);
            setOpen(true);
          }
        }}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold outline-none transition-colors focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${showInvalid ? 'border-red-300' : 'border-slate-200'}`}
      >
        <span id={`${id}-value`} className={`min-w-0 truncate ${selectedOption ? 'text-slate-700' : 'text-slate-400'}`}>
          {loading ? loadingText : selectedOption?.name || placeholder}
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {showInvalid ? <span role="alert" className="block text-xs font-medium text-rose-600">Vui lòng chọn {label.toLocaleLowerCase('vi')}.</span> : null}

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="search"
                role="combobox"
                aria-label={searchPlaceholder}
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                autoComplete="off"
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-primary-500"
              />
            </div>
          </div>

          {visibleOptions.length ? (
            <ul id={listboxId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto overscroll-contain p-1">
              {visibleOptions.map((option, index) => (
                <li
                  key={option.code || 'clear-selection'}
                  ref={index === activeIndex ? activeOptionRef : null}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={option.code === value}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => selectOption(option.code)}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${
                    index === activeIndex
                      ? 'bg-primary-50 text-primary-700'
                      : option.code === value
                        ? 'font-semibold text-slate-800'
                        : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate">{option.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p role="status" className="px-3 py-4 text-center text-sm text-slate-500">{emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
};

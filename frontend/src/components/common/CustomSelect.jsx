import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  icon: Icon,
  id,
  name,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(options.length - 1);
      } else {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (focusedIndex >= 0 && focusedIndex < options.length) {
        const selected = options[focusedIndex];
        const val = typeof selected === 'object' ? selected.value : selected;
        onChange(val);
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (option) => {
    const val = typeof option === 'object' ? option.value : option;
    onChange(val);
    setIsOpen(false);
  };

  const getLabel = () => {
    if (!value) return placeholder;
    const found = options.find((opt) => (typeof opt === 'object' ? opt.value === value : opt === value));
    if (!found) return value;
    return typeof found === 'object' ? found.label : found;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full text-left"
      onKeyDown={handleKeyDown}
      id={id}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between pl-10 pr-3.5 py-2.5 text-xs rounded-xl border transition-all select-none
          ${error ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-400' : 'border-unis-border dark:border-unis-dark-border'}
          bg-stone-50/50 dark:bg-unis-dark-elevated text-unis-ink dark:text-unis-dark-text
          focus:outline-none focus:ring-2 focus:ring-unis-brand dark:focus:ring-unis-dark-brand focus:bg-white dark:focus:bg-unis-dark-card
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-unis-brand/40'}
        `}
      >
        {Icon && (
          <Icon className="w-4 h-4 text-unis-slate/60 absolute left-3.5 inset-y-0 my-auto pointer-events-none" />
        )}

        <span className={`truncate ${!value ? 'text-unis-slate/70 dark:text-unis-dark-muted' : 'font-medium'}`}>
          {getLabel()}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-unis-slate/60 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-unis-brand' : ''
          }`}
        />
      </button>

      {/* Hidden input for form registration / accessibility */}
      <input type="hidden" name={name} value={value} />

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 w-full mt-1.5 py-1.5 rounded-xl border border-unis-border dark:border-unis-dark-border bg-white dark:bg-unis-dark-card shadow-elevated dark:shadow-dark-elevated max-h-56 overflow-y-auto focus:outline-none animate-fade-in"
        >
          {options.map((option, idx) => {
            const optVal = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            const isSelected = value === optVal;
            const isFocused = focusedIndex === idx;

            return (
              <li
                key={optVal}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer transition-colors
                  ${isSelected ? 'bg-unis-brand/10 dark:bg-unis-dark-brand/20 text-unis-brand dark:text-unis-dark-brand font-bold' : 'text-unis-ink dark:text-unis-dark-text'}
                  ${isFocused && !isSelected ? 'bg-stone-100 dark:bg-unis-dark-elevated' : ''}
                `}
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-unis-brand dark:text-unis-dark-brand shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

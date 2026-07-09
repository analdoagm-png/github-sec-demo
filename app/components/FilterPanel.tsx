"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FILTER_GROUPS,
  cloneFilterState,
  createEmptyFilterState,
  flattenLeaves,
  getOptionState,
  type FilterOption,
  type FilterState,
} from "../lib/filters";
import styles from "./FilterPanel.module.css";

type FilterPanelProps = {
  open: boolean;
  applied: FilterState;
  onApply: (next: FilterState) => void;
  onClose: () => void;
};

export default function FilterPanel({
  open,
  applied,
  onApply,
  onClose,
}: FilterPanelProps) {
  const [draft, setDraft] = useState<FilterState>(() => cloneFilterState(applied));
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Reset the draft from `applied` right when the panel transitions from
  // closed to open — adjusted during render (React's recommended pattern
  // for "reset state on a prop change"), not in an effect, so a Save
  // elsewhere while this panel is open can't clobber in-progress edits.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(cloneFilterState(applied));
  }

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  function toggleOption(groupKey: string, option: FilterOption) {
    setDraft((prev) => {
      const next = cloneFilterState(prev);
      const set = next[groupKey];
      if (option.children) {
        const leaves = flattenLeaves(option.children);
        const allSelected = leaves.every((l) => set.has(l.value));
        leaves.forEach((l) => (allSelected ? set.delete(l.value) : set.add(l.value)));
      } else if (set.has(option.value)) {
        set.delete(option.value);
      } else {
        set.add(option.value);
      }
      return next;
    });
  }

  function handleClear() {
    setDraft(createEmptyFilterState());
  }

  function handleSave() {
    onApply(draft);
    onClose();
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-panel-title"
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <h2 id="filter-panel-title" className={styles.title}>
            Filter
          </h2>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Close filter panel"
            tabIndex={open ? 0 : -1}
          >
            <Image src="/icons/filter-close.svg" alt="" width={24} height={24} />
          </button>
        </div>

        <div className={styles.body}>
          {FILTER_GROUPS.map((group) => (
            <div key={group.key} className={styles.fieldset}>
              <p className={styles.fieldsetLabel}>{group.label}</p>
              {group.options.map((option) => (
                <FilterOptionRow
                  key={option.value}
                  option={option}
                  selected={draft[group.key]}
                  onToggle={(opt) => toggleOption(group.key, opt)}
                  tabIndex={open ? 0 : -1}
                />
              ))}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.clearButton}
            onClick={handleClear}
            type="button"
            tabIndex={open ? 0 : -1}
          >
            <Image src="/icons/clear-filters.svg" alt="" width={16} height={16} />
            Clear all filters
          </button>
          <div className={styles.footerActions}>
            <button
              className={styles.cancelButton}
              onClick={onClose}
              type="button"
              tabIndex={open ? 0 : -1}
            >
              Cancel
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              type="button"
              tabIndex={open ? 0 : -1}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterOptionRow({
  option,
  selected,
  onToggle,
  tabIndex,
}: {
  option: FilterOption;
  selected: Set<string>;
  onToggle: (option: FilterOption) => void;
  tabIndex: number;
}) {
  const state = getOptionState(option, selected);

  return (
    <>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={state === "checked"}
          ref={(el) => {
            if (el) el.indeterminate = state === "indeterminate";
          }}
          onChange={() => onToggle(option)}
          tabIndex={tabIndex}
        />
        <span className={styles.checkboxLabel}>{option.label}</span>
      </label>
      {option.children?.map((child) => (
        <label
          key={child.value}
          className={`${styles.checkboxRow} ${styles.checkboxRowNested}`}
        >
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selected.has(child.value)}
            onChange={() => onToggle(child)}
            tabIndex={tabIndex}
          />
          <span className={styles.checkboxLabel}>{child.label}</span>
        </label>
      ))}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import Button from "./Button";
import {
  FILTER_GROUPS,
  cloneFilterState,
  countSelected,
  createEmptyFilterState,
  filterStatesEqual,
  flattenLeaves,
  getOptionState,
  type FilterOption,
  type FilterState,
} from "../lib/filters";
import styles from "./FilterPanel.module.css";

type FilterPanelProps = {
  open: boolean;
  applied: FilterState;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onApply: (next: FilterState) => void;
  onClose: () => void;
};

export default function FilterPanel({
  open,
  applied,
  triggerRef,
  onApply,
  onClose,
}: FilterPanelProps) {
  const [draft, setDraft] = useState<FilterState>(() => cloneFilterState(applied));
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset the draft from `applied` right when the panel transitions from
  // closed to open — adjusted during render (React's recommended pattern
  // for "reset state on a prop change"), not in an effect, so a Save
  // elsewhere while this panel is open can't clobber in-progress edits.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(cloneFilterState(applied));
  }

  const requestClose = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, requestClose]);

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
    requestClose();
  }

  const hasSelections = countSelected(draft) > 0;
  const hasChanges = !filterStatesEqual(draft, applied);

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        id="filter-panel"
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-panel-title"
        aria-hidden={!open}
        ref={panelRef}
      >
        <div className={styles.header}>
          <h2 id="filter-panel-title" className={styles.title}>
            Filter
          </h2>
          <Button
            ref={closeButtonRef}
            variant="icon"
            className={styles.closeButton}
            onClick={requestClose}
            type="button"
            aria-label="Close filter panel"
            tabIndex={open ? 0 : -1}
          >
            <Image src="/icons/filter-close.svg" alt="" width={24} height={24} />
          </Button>
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
          <Button
            variant="tertiary"
            className={styles.clearButton}
            onClick={handleClear}
            type="button"
            tabIndex={open ? 0 : -1}
            disabled={!hasSelections}
          >
            <Image src="/icons/clear-filters.svg" alt="" width={16} height={16} />
            Clear all filters
          </Button>
          <div className={styles.footerActions}>
            <Button
              variant="secondary"
              onClick={requestClose}
              type="button"
              tabIndex={open ? 0 : -1}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              type="button"
              tabIndex={open ? 0 : -1}
              disabled={!hasChanges}
            >
              Save
            </Button>
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

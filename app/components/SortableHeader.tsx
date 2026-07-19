"use client";

import Image from "next/image";
import Button from "./Button";
import styles from "../shared.module.css";

export type SortDirection = "asc" | "desc";

type SortableHeaderProps = {
  label: string;
  column: string;
  activeColumn: string | null;
  direction: SortDirection;
  className?: string;
  onSort: (column: string) => void;
};

export default function SortableHeader({
  label,
  column,
  activeColumn,
  direction,
  className = "",
  onSort,
}: SortableHeaderProps) {
  const isActive = activeColumn === column;
  const ariaSort = isActive
    ? direction === "asc"
      ? "ascending"
      : "descending"
    : "none";
  const nextDirection = isActive && direction === "asc" ? "descending" : "ascending";

  return (
    <div
      className={`${styles.headerCell} ${className}`}
      role="columnheader"
      aria-sort={ariaSort}
    >
      <Button
        variant="tertiary"
        className={styles.sortButton}
        data-sort-active={isActive}
        type="button"
        onClick={() => onSort(column)}
        aria-label={`Sort by ${label} ${nextDirection}`}
      >
        <span>{label}</span>
        {isActive ? (
          <span className={styles.sortDirection} aria-hidden="true">
            {direction === "asc" ? "↑" : "↓"}
          </span>
        ) : (
          <Image
            className={styles.selectorIcon}
            src="/icons/selector.svg"
            alt=""
            width={20}
            height={20}
          />
        )}
      </Button>
    </div>
  );
}

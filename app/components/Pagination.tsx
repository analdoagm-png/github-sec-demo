"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import Button from "./Button";
import styles from "../shared.module.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  function handlePageSizeChange(e: ChangeEvent<HTMLSelectElement>) {
    onPageSizeChange(Number(e.target.value));
  }

  return (
    <div className={styles.pagination}>
      <div className={styles.resultsPerPage}>
        <select
          className={styles.resultsSelect}
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className={styles.resultsLabel}>Results per page</span>
      </div>
      <div className={styles.paginationNav}>
        <Button
          variant="tertiary"
          className={styles.pageBtn}
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <Image
            className={styles.chevronIcon}
            src="/icons/chevron-left.svg"
            alt=""
            width={16}
            height={16}
          />
          Previous
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant="tertiary"
              className={`${styles.pageBtn} ${pageNumber === currentPage ? styles.pageBtnActive : ""}`}
              type="button"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ),
        )}
        <Button
          variant="tertiary"
          className={`${styles.pageBtn} ${styles.pageBtnLink}`}
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <Image
            className={styles.chevronIcon}
            src="/icons/chevron-right.svg"
            alt=""
            width={16}
            height={16}
          />
        </Button>
      </div>
      <p className={styles.totalItems}>Total: {totalItems} items</p>
    </div>
  );
}

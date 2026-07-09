"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import { OWNERS } from "../lib/owners";
import shared from "../shared.module.css";
import styles from "./page.module.css";

type ServiceRow = {
  service: string;
  team: string;
  overdueDays: number;
  overdueSeverity: string;
  missedCritical: number;
  missedHigh: number;
  inSla: number;
};

const OVERDUE_POOL = [
  { days: 5, severity: "Critical" },
  { days: 12, severity: "High" },
  { days: 19, severity: "Medium" },
  { days: 34, severity: "Low" },
  { days: 47, severity: "Informational" },
  { days: 61, severity: "High" },
];

const MISSED_SLA_POOL = [
  { critical: 23, high: 12 },
  { critical: 8, high: 19 },
  { critical: 15, high: 6 },
  { critical: 2, high: 31 },
  { critical: 11, high: 9 },
];

const IN_SLA_POOL = [427, 318, 512, 289, 601, 375];

function buildServices(count: number): ServiceRow[] {
  return Array.from({ length: count }, (_, i) => {
    const owner = OWNERS[i % OWNERS.length];
    const overdue = OVERDUE_POOL[i % OVERDUE_POOL.length];
    const missed = MISSED_SLA_POOL[i % MISSED_SLA_POOL.length];
    const inSla = IN_SLA_POOL[i % IN_SLA_POOL.length];

    return {
      service: owner.repo,
      team: owner.owner,
      overdueDays: overdue.days,
      overdueSeverity: overdue.severity,
      missedCritical: missed.critical,
      missedHigh: missed.high,
      inSla,
    };
  });
}

const ALL_SERVICES = buildServices(34);

const STATS = [
  { label: "Missed SLA", value: "1,072", icon: "x-circle", trendIcon: "arrow-up-right", trendValue: "96", trendCaption: "more than last month" },
  { label: "In SLA", value: "1,651", icon: "check-circle", trendIcon: "arrow-down-left", trendValue: "35", trendCaption: "less than last month" },
  { label: "Near SLA", value: "2,299", icon: "alert", trendIcon: "arrow-up-right", trendValue: "268", trendCaption: "more than last month" },
  { label: "Exceptions", value: "169", icon: "zap", trendIcon: "arrow-up-right", trendValue: "2", trendCaption: "more than last month" },
  { label: "Remediated", value: "478", icon: "tools", trendIcon: "arrow-down-left", trendValue: "6", trendCaption: "less than last month" },
];

function ServiceTableRow({ row }: { row: ServiceRow }) {
  return (
    <div className={shared.tableRow}>
      <div className={`${shared.cell} ${styles.colServices}`}>
        <span className={styles.serviceName}>{row.service}</span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.mutedText}`}>
        {row.team}
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${styles.stackedCell}`}>
        <p className={styles.overdueDays}>{row.overdueDays} Days</p>
        <p className={styles.overdueSeverity}>
          Severity: {row.overdueSeverity}
        </p>
      </div>
      <div className={`${shared.cell} ${shared.colFlex}`}>
        <div className={styles.missedSlaCell}>
          <div className={styles.missedSlaHeader}>
            <Image
              src="/icons/x-circle.svg"
              alt=""
              width={16}
              height={16}
            />
            <span className={styles.missedSlaHeaderText}>Missed SLA</span>
          </div>
          <p className={styles.missedSlaBreakdown}>
            <span className={styles.missedSlaCount}>{row.missedCritical}</span>{" "}
            Critical - <span className={styles.missedSlaCount}>{row.missedHigh}</span>{" "}
            High
          </p>
        </div>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.iconRow}`}>
        <Image className={shared.icon16} src="/icons/alert.svg" alt="" width={16} height={16} />
        <span className={shared.mutedText}>Near SLA</span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.iconRow}`}>
        <Image
          className={shared.icon16}
          src="/icons/check-circle.svg"
          alt=""
          width={16}
          height={16}
        />
        <span className={shared.mutedText}>{row.inSla}</span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.iconRow}`}>
        <Image className={shared.icon16} src="/icons/zap.svg" alt="" width={16} height={16} />
        <span className={shared.mutedText}>Exception</span>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalItems = ALL_SERVICES.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return ALL_SERVICES.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  return (
    <div>
      <Navbar />

      <div className={shared.page}>
        <h1 className={shared.pageTitle}>Services</h1>

        <div className={styles.statsRow}>
          <div className={styles.statTotal}>
            <p className={styles.statTotalLabel}>Total Security Findings</p>
            <div className={styles.statTotalAmountRow}>
              <span className={styles.statTotalAmount}>5,022</span>
              <span className={styles.statTotalChange}>21.5% critical</span>
            </div>
            <p className={styles.statTotalSubtitle}>
              Since the beginning of time
            </p>
          </div>

          {STATS.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabelRow}>
                <Image
                  src={`/icons/${stat.icon}.svg`}
                  alt=""
                  width={16}
                  height={16}
                />
                <span className={shared.mutedText}>{stat.label}</span>
              </div>
              <div className={styles.statTrendRow}>
                <div className={styles.trendIndicator}>
                  <Image
                    src={`/icons/${stat.trendIcon}.svg`}
                    alt=""
                    width={16}
                    height={16}
                  />
                  <span className={styles.trendValue}>{stat.trendValue}</span>
                </div>
                <span className={styles.trendValue}>{stat.trendCaption}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={shared.card}>
          <div className={shared.filterHeader}>
            <button className={shared.filterButton} type="button">
              <Image
                className={shared.filterIcon}
                src="/icons/filter.svg"
                alt=""
                width={16}
                height={16}
              />
              <span>Filter</span>
              <span className={shared.filterCounter}>4</span>
            </button>
            <div className={shared.filterTags}>
              {["Missed SLA", "Near SLA", "c2c-actions", "SRE Team"].map(
                (label, i) => (
                  <span key={i} className={shared.tag}>
                    {label}
                    <Image
                      className={shared.tagDismiss}
                      src="/icons/dismiss.svg"
                      alt="Remove filter"
                      width={16}
                      height={16}
                    />
                  </span>
                ),
              )}
            </div>
            <input
              className={shared.searchInput}
              type="text"
              placeholder="Search"
            />
          </div>

          <div className={shared.tableHeaderRow}>
            <div className={`${shared.headerCell} ${styles.colServices}`}>
              <span>Services</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Team/Owner</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Most Overdue Finding</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Missed SLA</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Near SLA</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>In SLA</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Exceptions</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
          </div>

          {visibleServices.map((row, i) => (
            <ServiceTableRow key={`${row.service}-${i}`} row={row} />
          ))}

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}

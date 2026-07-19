"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Button from "./components/Button";
import FilterPanel from "./components/FilterPanel";
import Navbar from "./components/Navbar";
import Pagination from "./components/Pagination";
import SortableHeader, { type SortDirection } from "./components/SortableHeader";
import {
  createEmptyFilterState,
  countSelected,
  getActiveChips,
  matchesFilters,
  type FilterState,
} from "./lib/filters";
import { OWNERS } from "./lib/owners";
import shared from "./shared.module.css";
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

type ServiceSortKey =
  | "service"
  | "team"
  | "overdueDays"
  | "missedSla"
  | "nearSla"
  | "inSla"
  | "exceptions";

const SERVICE_SORT_LABELS: Record<ServiceSortKey, string> = {
  service: "Services",
  team: "Team/Owner",
  overdueDays: "Most Overdue Finding",
  missedSla: "Missed SLA",
  nearSla: "Near SLA",
  inSla: "In SLA",
  exceptions: "Exceptions",
};

const OVERDUE_POOL = [
  { days: 5, severity: "Critical" },
  { days: 12, severity: "High" },
  { days: 19, severity: "Moderate" },
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

function matchesServiceSearch(row: ServiceRow, query: string) {
  const searchableText = [
    row.service,
    row.team,
    row.overdueDays,
    row.overdueSeverity,
    "Missed SLA",
    row.missedCritical,
    row.missedHigh,
    "Near SLA",
    row.inSla,
    "Exception",
  ]
    .join(" ")
    .toLocaleLowerCase();

  return searchableText.includes(query);
}

function compareServices(left: ServiceRow, right: ServiceRow, key: ServiceSortKey) {
  switch (key) {
    case "service":
      return left.service.localeCompare(right.service);
    case "team":
      return left.team.localeCompare(right.team);
    case "overdueDays":
      return left.overdueDays - right.overdueDays;
    case "missedSla":
      return left.missedCritical + left.missedHigh - (right.missedCritical + right.missedHigh);
    case "inSla":
      return left.inSla - right.inSla;
    case "nearSla":
    case "exceptions":
      return 0;
  }
}

const STATS = [
  { label: "Missed SLA", value: "1,072", icon: "x-circle", trendIcon: "arrow-up-right", trendValue: "96", trendCaption: "more than last month" },
  { label: "In SLA", value: "1,651", icon: "check-circle", trendIcon: "arrow-down-left", trendValue: "35", trendCaption: "less than last month" },
  { label: "Near SLA", value: "2,299", icon: "alert", trendIcon: "arrow-up-right", trendValue: "268", trendCaption: "more than last month" },
  { label: "Exceptions", value: "169", icon: "zap", trendIcon: "arrow-up-right", trendValue: "2", trendCaption: "more than last month" },
  { label: "Remediated", value: "478", icon: "tools", trendIcon: "arrow-down-left", trendValue: "6", trendCaption: "less than last month" },
];

function ServiceTableRow({ row }: { row: ServiceRow }) {
  const rowStyle = {
    "--row-accent":
      row.missedCritical > 0
        ? "var(--color-severity-critical)"
        : "var(--color-border-muted)",
  } as React.CSSProperties;

  return (
    <div className={shared.tableRow} style={rowStyle}>
      <div className={`${shared.cell} ${styles.colServices}`}>
        <span className={styles.serviceName}>{row.service}</span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.mutedText}`}>
        <span className={shared.mobileLabel}>Team/Owner</span>
        {row.team}
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${styles.stackedCell}`}>
        <span className={shared.mobileLabel}>Most Overdue Finding</span>
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
        <span className={shared.mobileLabel}>In SLA</span>
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

export default function Home() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(createEmptyFilterState);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<ServiceSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  // Services rows only carry a severity (via their most-overdue finding) —
  // State/SLA Status/Exception Status are per-finding concepts, so those
  // fieldsets stay visible in the shared panel but don't constrain this table.
  const filteredServices = useMemo(
    () =>
      ALL_SERVICES.filter((row) =>
        matchesFilters({ severity: row.overdueSeverity }, appliedFilters) &&
        matchesServiceSearch(row, searchQuery.trim().toLocaleLowerCase()),
      ),
    [appliedFilters, searchQuery],
  );

  const sortedServices = useMemo(() => {
    if (!sortKey) return filteredServices;

    return [...filteredServices].sort((left, right) => {
      const result = compareServices(left, right, sortKey);
      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredServices, sortDirection, sortKey]);

  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedServices.slice(start, start + pageSize);
  }, [sortedServices, currentPage, pageSize]);

  const activeChips = getActiveChips(appliedFilters);
  const resultAnnouncement = `${totalItems} of ${ALL_SERVICES.length} services shown${
    sortKey ? `, sorted by ${SERVICE_SORT_LABELS[sortKey]} ${sortDirection === "asc" ? "ascending" : "descending"}` : ""
  }.`;

  function removeChip(groupKey: string, value: string) {
    setAppliedFilters((prev) => {
      const next = { ...prev, [groupKey]: new Set(prev[groupKey]) };
      next[groupKey].delete(value);
      return next;
    });
    setPage(1);
  }

  function handleApplyFilters(next: FilterState) {
    setAppliedFilters(next);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setPage(1);
  }

  function handleSort(column: string) {
    const nextKey = column as ServiceSortKey;
    if (sortKey === nextKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      setSortDirection("asc");
    }
    setPage(1);
  }

  return (
    <div>
      <Navbar />

      <div className={shared.page}>
        <h1 className={shared.pageTitle}>Services</h1>
        <p aria-atomic="true" aria-live="polite" className={shared.srOnly}>
          {resultAnnouncement}
        </p>

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
            <Button
              variant="secondary"
              className={shared.filterButton}
              type="button"
              ref={filterTriggerRef}
              onClick={() => setFilterPanelOpen(true)}
              aria-expanded={filterPanelOpen}
              aria-controls="filter-panel"
            >
              <Image
                className={shared.filterIcon}
                src="/icons/filter.svg"
                alt=""
                width={16}
                height={16}
              />
              <span>Filter</span>
              {countSelected(appliedFilters) > 0 && (
                <span className={shared.filterCounter}>
                  {countSelected(appliedFilters)}
                </span>
              )}
            </Button>
            <div className={shared.filterTags}>
              {activeChips.map((chip) => (
                <span key={`${chip.groupKey}-${chip.value}`} className={shared.tag}>
                  {chip.label}
                  <Button
                    variant="icon"
                    type="button"
                    className={shared.tagDismissButton}
                    onClick={() => removeChip(chip.groupKey, chip.value)}
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <Image
                      className={shared.tagDismiss}
                      src="/icons/dismiss.svg"
                      alt=""
                      width={16}
                      height={16}
                    />
                  </Button>
                </span>
              ))}
            </div>
            <input
              className={shared.searchInput}
              type="text"
              placeholder="Search"
              aria-label="Search services"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <div className={shared.tableHeaderRow}>
            <SortableHeader label="Services" column="service" activeColumn={sortKey} direction={sortDirection} className={styles.colServices} onSort={handleSort} />
            <SortableHeader label="Team/Owner" column="team" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="Most Overdue Finding" column="overdueDays" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="Missed SLA" column="missedSla" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="Near SLA" column="nearSla" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="In SLA" column="inSla" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="Exceptions" column="exceptions" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
          </div>

          {visibleServices.length > 0 ? (
            visibleServices.map((row, i) => (
              <ServiceTableRow key={`${row.service}-${i}`} row={row} />
            ))
          ) : (
            <p className={shared.disclaimer}>
              No services match the selected filters.
            </p>
          )}

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

      <FilterPanel
        open={filterPanelOpen}
        applied={appliedFilters}
        triggerRef={filterTriggerRef}
        onApply={handleApplyFilters}
        onClose={() => setFilterPanelOpen(false)}
      />
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Button from "../components/Button";
import FilterPanel from "../components/FilterPanel";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import SortableHeader, { type SortDirection } from "../components/SortableHeader";
import {
  createEmptyFilterState,
  countSelected,
  getActiveChips,
  matchesFilters,
  type FilterState,
} from "../lib/filters";
import { OWNERS } from "../lib/owners";
import shared from "../shared.module.css";
import styles from "./page.module.css";

type Severity = "Critical" | "High" | "Moderate" | "Low" | "Informational";
type FindingState = "Open" | "Reopened" | "False Positive" | "Risk Acceptance" | "Closed";
type SlaStatus = "In SLA" | "Near SLA" | "Missed SLA" | "Exception" | "Remediated";
type ExceptionStatus = "Active" | "Archived" | "Expired" | "Pending" | "Denied";

type Finding = {
  title: string;
  issueRef: string;
  labels: string[];
  extraLabelCount?: number;
  severity: Severity;
  repo: string;
  owner: string;
  dueDate: string;
  daysRemaining: string;
  state: FindingState;
  slaStatus: SlaStatus;
  exceptionStatus: ExceptionStatus;
};

type FindingSortKey =
  | "title"
  | "state"
  | "labels"
  | "severity"
  | "serviceOwner"
  | "dueDate"
  | "slaStatus";

const FINDING_SORT_LABELS: Record<FindingSortKey, string> = {
  title: "Finding",
  state: "State",
  labels: "Labels",
  severity: "Severity",
  serviceOwner: "Service / Owner",
  dueDate: "Due Date",
  slaStatus: "SLA Status",
};

const FINDING_TEMPLATES: { title: string; severity: Severity; category: string }[] = [
  { title: "Publicly readable storage bucket detected", severity: "Critical", category: "Cloud Infrastructure" },
  { title: "Hardcoded API credential in source", severity: "Critical", category: "Secrets Management" },
  { title: "Unencrypted database snapshot", severity: "Critical", category: "Data Protection" },
  { title: "SSH port open to 0.0.0.0/0", severity: "Critical", category: "Network Security" },
  { title: "Unpatched CVE in base container image", severity: "High", category: "Container Security" },
  { title: "Missing MFA enforcement for admin role", severity: "High", category: "Identity & Access" },
  { title: "Excessive IAM permissions on service role", severity: "High", category: "Identity & Access" },
  { title: "Outdated dependency with known vulnerability", severity: "High", category: "Application Security" },
  { title: "TLS certificate expiring within 30 days", severity: "Moderate", category: "Network Security" },
  { title: "Sensitive data logged in plaintext", severity: "Moderate", category: "Data Protection" },
  { title: "Container running as root user", severity: "Moderate", category: "Container Security" },
  { title: "Missing WAF rule for public endpoint", severity: "Moderate", category: "Network Security" },
  { title: "Weak password policy on legacy portal", severity: "Low", category: "Identity & Access" },
  { title: "Verbose error messages expose stack traces", severity: "Informational", category: "Application Security" },
];

const STATES: FindingState[] = ["Open", "Reopened", "False Positive", "Risk Acceptance", "Closed"];
const SLA_STATUSES: SlaStatus[] = ["In SLA", "Near SLA", "Missed SLA", "Exception", "Remediated"];
const EXCEPTION_STATUSES: ExceptionStatus[] = ["Active", "Archived", "Expired", "Pending", "Denied"];

const DUE_DATES: { date: string; remaining: string }[] = [
  { date: "Jul 15, 2026", remaining: "6 days remaining" },
  { date: "Jul 22, 2026", remaining: "13 days remaining" },
  { date: "Aug 1, 2026", remaining: "23 days remaining" },
  { date: "Aug 15, 2026", remaining: "37 days remaining" },
  { date: "Jun 30, 2026", remaining: "9 days overdue" },
  { date: "Jul 9, 2026", remaining: "Due today" },
  { date: "Sep 1, 2026", remaining: "54 days remaining" },
];

function buildFindings(count: number): Finding[] {
  return Array.from({ length: count }, (_, i) => {
    const template = FINDING_TEMPLATES[i % FINDING_TEMPLATES.length];
    const ownerInfo = OWNERS[i % OWNERS.length];
    const due = DUE_DATES[i % DUE_DATES.length];
    const noLabel = i % 11 === 10;
    const labels = noLabel ? ["--"] : [template.category];
    const extraLabelCount = !noLabel && i % 5 === 4 ? 3 : undefined;

    return {
      title: template.title,
      issueRef: `sec-tracker #${1000 + i}`,
      labels,
      extraLabelCount,
      severity: template.severity,
      repo: ownerInfo.repo,
      owner: ownerInfo.owner,
      dueDate: due.date,
      daysRemaining: due.remaining,
      state: STATES[i % STATES.length],
      slaStatus: SLA_STATUSES[i % SLA_STATUSES.length],
      exceptionStatus: EXCEPTION_STATUSES[i % EXCEPTION_STATUSES.length],
    };
  });
}

const ALL_FINDINGS = buildFindings(37);

const SEVERITY_RANK: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Moderate: 2,
  Low: 3,
  Informational: 4,
};

const SLA_STATUS_RANK: Record<SlaStatus, number> = {
  "Missed SLA": 0,
  "Near SLA": 1,
  Exception: 2,
  "In SLA": 3,
  Remediated: 4,
};

function matchesFindingSearch(finding: Finding, query: string) {
  const searchableText = [
    finding.title,
    finding.issueRef,
    finding.labels.join(" "),
    finding.severity,
    finding.repo,
    finding.owner,
    finding.dueDate,
    finding.daysRemaining,
    finding.state,
    finding.slaStatus,
    finding.exceptionStatus,
  ]
    .join(" ")
    .toLocaleLowerCase();

  return searchableText.includes(query);
}

function compareFindings(left: Finding, right: Finding, key: FindingSortKey) {
  switch (key) {
    case "title":
      return left.title.localeCompare(right.title);
    case "state":
      return left.state.localeCompare(right.state);
    case "labels":
      return left.labels.join(" ").localeCompare(right.labels.join(" "));
    case "severity":
      return SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity];
    case "serviceOwner":
      return `${left.repo} ${left.owner}`.localeCompare(`${right.repo} ${right.owner}`);
    case "dueDate":
      return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
    case "slaStatus":
      return SLA_STATUS_RANK[left.slaStatus] - SLA_STATUS_RANK[right.slaStatus];
  }
}

const SEVERITY_CLASS: Record<Severity, string> = {
  Critical: styles.severityCritical,
  High: styles.severityHigh,
  Moderate: styles.severityModerate,
  Low: styles.severityLow,
  Informational: styles.severityInformational,
};

const SEVERITY_ACCENT: Record<Severity, string> = {
  Critical: "var(--color-severity-critical)",
  High: "var(--color-severity-high)",
  Moderate: "var(--color-severity-moderate)",
  Low: "var(--color-severity-low)",
  Informational: "var(--color-severity-informational)",
};

function FindingRow({ finding }: { finding: Finding }) {
  const rowStyle = { "--row-accent": SEVERITY_ACCENT[finding.severity] } as React.CSSProperties;

  return (
    <div className={shared.tableRow} style={rowStyle}>
      <div className={`${shared.cell} ${styles.cellFinding}`}>
        <p className={styles.findingTitle}>{finding.title}</p>
        <p className={styles.findingSubtitle}>{finding.issueRef}</p>
      </div>
      <div className={`${shared.cell} ${styles.cellState}`}>
        <span className={shared.mobileLabel}>State</span>
        <Image
          src={finding.state === "Closed" ? "/icons/check-circle.svg" : "/icons/issue-opened.svg"}
          alt={finding.state}
          width={16}
          height={16}
        />
      </div>
      <div className={`${shared.cell} ${styles.cellLabels}`}>
        <span className={shared.mobileLabel}>Labels</span>
        {finding.labels.map((label) => (
          <span
            key={label}
            className={`${styles.labelPill} ${label === "--" ? styles.labelPillMuted : ""}`}
          >
            {label}
          </span>
        ))}
        {finding.extraLabelCount ? (
          <span className={`${styles.labelPill} ${styles.labelPillCount}`}>
            +{finding.extraLabelCount}
          </span>
        ) : null}
      </div>
      <div className={`${shared.cell} ${shared.colFlex}`}>
        <span className={shared.mobileLabel}>Severity</span>
        <span
          className={`${styles.severityBadge} ${SEVERITY_CLASS[finding.severity]}`}
        >
          {finding.severity}
        </span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${styles.cellOwner}`}>
        <span className={shared.mobileLabel}>Service / Owner</span>
        <span className={styles.ownerText}>{finding.repo}</span>
        {" / "}
        <span className={styles.ownerText}>{finding.owner}</span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${styles.cellDueDate}`}>
        <span className={shared.mobileLabel}>Due Date</span>
        <p className={styles.dueDate}>{finding.dueDate}</p>
        <p className={styles.daysRemaining}>{finding.daysRemaining}</p>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.iconRow}`}>
        <span className={shared.mobileLabel}>SLA Status</span>
        <Image
          className={shared.icon16}
          src="/icons/zap.svg"
          alt=""
          width={16}
          height={16}
        />
        <span className={shared.mutedText}>{finding.slaStatus}</span>
      </div>
    </div>
  );
}

export default function FindingsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(createEmptyFilterState);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<FindingSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const filterTriggerRef = useRef<HTMLButtonElement>(null);

  const filteredFindings = useMemo(
    () =>
      ALL_FINDINGS.filter((finding) =>
        matchesFilters(
          {
            state: finding.state,
            severity: finding.severity,
            slaStatus: finding.slaStatus,
            exceptionStatus: finding.exceptionStatus,
          },
          appliedFilters,
        ) && matchesFindingSearch(finding, searchQuery.trim().toLocaleLowerCase()),
      ),
    [appliedFilters, searchQuery],
  );

  const sortedFindings = useMemo(() => {
    if (!sortKey) return filteredFindings;

    return [...filteredFindings].sort((left, right) => {
      const result = compareFindings(left, right, sortKey);
      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredFindings, sortDirection, sortKey]);

  const totalItems = filteredFindings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleFindings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFindings.slice(start, start + pageSize);
  }, [sortedFindings, currentPage, pageSize]);

  const activeChips = getActiveChips(appliedFilters);
  const resultAnnouncement = `${totalItems} of ${ALL_FINDINGS.length} findings shown${
    sortKey ? `, sorted by ${FINDING_SORT_LABELS[sortKey]} ${sortDirection === "asc" ? "ascending" : "descending"}` : ""
  }.`;

  function removeChip(groupKey: string, value: string) {
    setAppliedFilters((prev) => {
      const next = { ...prev, [groupKey]: new Set(prev[groupKey]) };
      next[groupKey].delete(value);
      setPage(1);
      return next;
    });
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
    const nextKey = column as FindingSortKey;
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
        <h1 className={shared.pageTitle}>
          {totalItems === ALL_FINDINGS.length
            ? `${ALL_FINDINGS.length} Findings`
            : `${totalItems} of ${ALL_FINDINGS.length} Findings`}
        </h1>
        <p aria-atomic="true" aria-live="polite" className={shared.srOnly}>
          {resultAnnouncement}
        </p>

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
              aria-label="Search findings"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <div className={shared.tableHeaderRow}>
            <SortableHeader label="Finding" column="title" activeColumn={sortKey} direction={sortDirection} className={styles.colFinding} onSort={handleSort} />
            <SortableHeader label="State" column="state" activeColumn={sortKey} direction={sortDirection} className={styles.colState} onSort={handleSort} />
            <SortableHeader label="Labels" column="labels" activeColumn={sortKey} direction={sortDirection} className={styles.colLabels} onSort={handleSort} />
            <SortableHeader label="Severity" column="severity" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="Service / Owner" column="serviceOwner" activeColumn={sortKey} direction={sortDirection} className={styles.cellOwner} onSort={handleSort} />
            <SortableHeader label="Due Date" column="dueDate" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
            <SortableHeader label="SLA Status" column="slaStatus" activeColumn={sortKey} direction={sortDirection} className={shared.colFlex} onSort={handleSort} />
          </div>

          {visibleFindings.length > 0 ? (
            visibleFindings.map((finding) => (
              <FindingRow key={finding.issueRef} finding={finding} />
            ))
          ) : (
            <p className={shared.disclaimer}>
              No findings match the selected filters.
            </p>
          )}

          <p className={shared.disclaimer}>
            The security findings shown are based on your service catalog
            ownership and collaboration.
          </p>

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

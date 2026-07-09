"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Severity = "Critical" | "High" | "Medium" | "Low";

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
  status: string;
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
  { title: "TLS certificate expiring within 30 days", severity: "Medium", category: "Network Security" },
  { title: "Sensitive data logged in plaintext", severity: "Medium", category: "Data Protection" },
  { title: "Container running as root user", severity: "Medium", category: "Container Security" },
  { title: "Missing WAF rule for public endpoint", severity: "Medium", category: "Network Security" },
  { title: "Weak password policy on legacy portal", severity: "Low", category: "Identity & Access" },
];

const OWNERS: { repo: string; owner: string }[] = [
  { repo: "payments-api", owner: "Platform Team" },
  { repo: "auth-service", owner: "Identity Team" },
  { repo: "web-frontend", owner: "Growth Team" },
  { repo: "data-pipeline", owner: "Data Eng" },
  { repo: "billing-service", owner: "Finance Systems" },
  { repo: "notification-service", owner: "Comms Team" },
  { repo: "user-service", owner: "Core Platform" },
  { repo: "search-service", owner: "Search Team" },
  { repo: "inventory-api", owner: "Commerce Team" },
  { repo: "edge-gateway", owner: "SRE Team" },
  { repo: "logging-agent", owner: "Observability" },
  { repo: "infra-network", owner: "SRE Team" },
];

const STATUSES = ["Exception", "In Progress", "Overdue", "Accepted Risk"];

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
    const status = STATUSES[i % STATUSES.length];
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
      status,
    };
  });
}

const ALL_FINDINGS = buildFindings(37);
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const SEVERITY_CLASS: Record<Severity, string> = {
  Critical: styles.severityCritical,
  High: styles.severityHigh,
  Medium: styles.severityMedium,
  Low: styles.severityLow,
};

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <div className={styles.tableRow}>
      <div className={`${styles.cell} ${styles.cellFinding}`}>
        <p className={styles.findingTitle}>{finding.title}</p>
        <p className={styles.findingSubtitle}>{finding.issueRef}</p>
      </div>
      <div className={`${styles.cell} ${styles.cellState}`}>
        <Image
          src="/icons/issue-opened.svg"
          alt="Open issue"
          width={16}
          height={16}
        />
      </div>
      <div className={`${styles.cell} ${styles.cellLabels}`}>
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
      <div className={`${styles.cell} ${styles.cellSeverity}`}>
        <span
          className={`${styles.severityBadge} ${SEVERITY_CLASS[finding.severity]}`}
        >
          {finding.severity}
        </span>
      </div>
      <div className={`${styles.cell} ${styles.cellOwner}`}>
        <a className={styles.ownerLink} href="#">
          {finding.repo}
        </a>
        {" / "}
        <a className={styles.ownerLink} href="#">
          {finding.owner}
        </a>
      </div>
      <div className={`${styles.cell} ${styles.cellDueDate}`}>
        <p className={styles.dueDate}>{finding.dueDate}</p>
        <p className={styles.daysRemaining}>{finding.daysRemaining}</p>
      </div>
      <div className={`${styles.cell} ${styles.cellStatus}`}>
        <Image src="/icons/zap.svg" alt="" width={16} height={16} />
        <span className={styles.statusText}>{finding.status}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalItems = ALL_FINDINGS.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleFindings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return ALL_FINDINGS.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  function goToPage(target: number) {
    setPage(Math.min(Math.max(1, target), totalPages));
  }

  function handlePageSizeChange(e: ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  return (
    <div>
      <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <Image
            className={styles.logo}
            src="/icons/logo.svg"
            alt="Company logo"
            width={183}
            height={40}
            priority
          />
          <a className={styles.navLink} href="#">
            Services
          </a>
          <a className={`${styles.navLink} ${styles.navLinkActive}`} href="#">
            Findings
          </a>
          <a className={styles.navLink} href="#">
            Exceptions
          </a>
        </div>
        <div className={styles.navbarRight}>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              <Image
                src="/icons/avatar.png"
                alt="User avatar"
                width={24}
                height={24}
              />
            </div>
            <Image
              className={styles.dropdownIcon}
              src="/icons/triangle-down.svg"
              alt=""
              width={16}
              height={16}
            />
          </div>
        </div>
      </nav>

      <div className={styles.page}>
        <h1 className={styles.pageTitle}>{totalItems} Findings</h1>

        <div className={styles.card}>
          <div className={styles.filterHeader}>
            <button className={styles.filterButton} type="button">
              <Image
                className={styles.filterIcon}
                src="/icons/filter.svg"
                alt=""
                width={16}
                height={16}
              />
              <span>Filter</span>
              <span className={styles.filterCounter}>4</span>
            </button>
            <div className={styles.filterTags}>
              {["Critical", "High", "Cloud Infrastructure", "Identity & Access"].map(
                (label, i) => (
                  <span key={i} className={styles.tag}>
                    {label}
                    <Image
                      className={styles.tagDismiss}
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
              className={styles.searchInput}
              type="text"
              placeholder="Search"
            />
          </div>

          <div className={styles.tableHeaderRow}>
            <div className={`${styles.headerCell} ${styles.colFinding}`}>
              <span>Finding</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.headerCell} ${styles.colState}`}>
              <span>State</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.headerCell} ${styles.colLabels}`}>
              <span>Labels</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.headerCell} ${styles.colFlex}`}>
              <span>Severity</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.headerCell} ${styles.colFlex}`}>
              <span>Service / Owner</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.headerCell} ${styles.colFlex}`}>
              <span>Due Date</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.headerCell} ${styles.colFlex}`}>
              <span>SLA Status</span>
              <Image
                className={styles.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
          </div>

          {visibleFindings.map((finding) => (
            <FindingRow key={finding.issueRef} finding={finding} />
          ))}

          <p className={styles.disclaimer}>
            The security findings shown are based on your service catalog
            ownership and collaboration.
          </p>

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
              <button
                className={styles.pageBtn}
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <Image
                  className={styles.chevronIcon}
                  src="/icons/chevron-left.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`${styles.pageBtn} ${pageNumber === currentPage ? styles.pageBtnActive : ""}`}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
              <button
                className={`${styles.pageBtn} ${styles.pageBtnLink}`}
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
                <Image
                  className={styles.chevronIcon}
                  src="/icons/chevron-right.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
            </div>
            <p className={styles.totalItems}>Total: {totalItems} items</p>
          </div>
        </div>
      </div>
    </div>
  );
}

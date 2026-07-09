"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Pagination from "./components/Pagination";
import { OWNERS } from "./lib/owners";
import shared from "./shared.module.css";
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

const SEVERITY_CLASS: Record<Severity, string> = {
  Critical: styles.severityCritical,
  High: styles.severityHigh,
  Medium: styles.severityMedium,
  Low: styles.severityLow,
};

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <div className={shared.tableRow}>
      <div className={`${shared.cell} ${styles.cellFinding}`}>
        <p className={styles.findingTitle}>{finding.title}</p>
        <p className={styles.findingSubtitle}>{finding.issueRef}</p>
      </div>
      <div className={`${shared.cell} ${styles.cellState}`}>
        <Image
          src="/icons/issue-opened.svg"
          alt="Open issue"
          width={16}
          height={16}
        />
      </div>
      <div className={`${shared.cell} ${styles.cellLabels}`}>
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
        <span
          className={`${styles.severityBadge} ${SEVERITY_CLASS[finding.severity]}`}
        >
          {finding.severity}
        </span>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${styles.cellOwner}`}>
        <a className={styles.ownerLink} href="#">
          {finding.repo}
        </a>
        {" / "}
        <a className={styles.ownerLink} href="#">
          {finding.owner}
        </a>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${styles.cellDueDate}`}>
        <p className={styles.dueDate}>{finding.dueDate}</p>
        <p className={styles.daysRemaining}>{finding.daysRemaining}</p>
      </div>
      <div className={`${shared.cell} ${shared.colFlex} ${shared.iconRow}`}>
        <Image
          className={shared.icon16}
          src="/icons/zap.svg"
          alt=""
          width={16}
          height={16}
        />
        <span className={shared.mutedText}>{finding.status}</span>
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

  return (
    <div>
      <Navbar />

      <div className={shared.page}>
        <h1 className={shared.pageTitle}>{totalItems} Findings</h1>

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
              {["Critical", "High", "Cloud Infrastructure", "Identity & Access"].map(
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
            <div className={`${shared.headerCell} ${styles.colFinding}`}>
              <span>Finding</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${styles.colState}`}>
              <span>State</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${styles.colLabels}`}>
              <span>Labels</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Severity</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Service / Owner</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>Due Date</span>
              <Image
                className={shared.selectorIcon}
                src="/icons/selector.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={`${shared.headerCell} ${shared.colFlex}`}>
              <span>SLA Status</span>
              <Image
                className={shared.selectorIcon}
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
    </div>
  );
}

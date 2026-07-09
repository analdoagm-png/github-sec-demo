import Image from "next/image";
import styles from "./page.module.css";

type Finding = {
  title: string;
  issueRef: string;
  labels: string[];
  extraLabelCount?: number;
  severity: string;
  repo: string;
  owner: string;
  dueDate: string;
  daysRemaining: string;
  status: string;
};

const findings: Finding[] = [
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["CloudPlatform: AWS"],
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["CloudPlatform: AWS"],
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["CloudPlatform: AWS"],
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["CloudPlatform: AWS"],
    extraLabelCount: 5,
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["CloudPlatform: AWS"],
    extraLabelCount: 5,
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["CloudPlatform: AWS"],
    extraLabelCount: 5,
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["--"],
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["--"],
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
  {
    title: "Vulnerabilities Unknown (76474-snmp-getbulk-ddos.yaml)",
    issueRef: "vuln-mgmt #5983",
    labels: ["--"],
    severity: "Critical",
    repo: "vuln-notifier",
    owner: "Owner-name",
    dueDate: "Oct. 6, 2025",
    daysRemaining: "20 days remaining",
    status: "Exception",
  },
];

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
        <span className={styles.severityBadge}>{finding.severity}</span>
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
        <h1 className={styles.pageTitle}>10,456 Findings</h1>

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
              {["FilterName", "FilterName", "FilterName", "FilterName"].map(
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

          {findings.map((finding, i) => (
            <FindingRow key={i} finding={finding} />
          ))}

          <p className={styles.disclaimer}>
            The security findings shown are based on your service catalog
            ownership and collaboration.
          </p>

          <div className={styles.pagination}>
            <div className={styles.resultsPerPage}>
              <select className={styles.resultsSelect} defaultValue={10}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className={styles.resultsLabel}>Results per page</span>
            </div>
            <div className={styles.paginationNav}>
              <button className={styles.pageBtn} type="button">
                <Image
                  className={styles.chevronIcon}
                  src="/icons/chevron-left.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                Previous
              </button>
              <button
                className={`${styles.pageBtn} ${styles.pageBtnActive}`}
                type="button"
              >
                1
              </button>
              <button className={styles.pageBtn} type="button">
                2
              </button>
              <button className={styles.pageBtn} type="button">
                3
              </button>
              <button className={styles.pageBtn} type="button">
                4
              </button>
              <button
                className={`${styles.pageBtn} ${styles.pageBtnLink}`}
                type="button"
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
            <p className={styles.totalItems}>Total: 9,467 items</p>
          </div>
        </div>
      </div>
    </div>
  );
}

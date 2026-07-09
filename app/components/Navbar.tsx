"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../shared.module.css";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/", label: "Findings" },
  { href: "#", label: "Exceptions" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
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
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
          >
            {link.label}
          </Link>
        ))}
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
  );
}

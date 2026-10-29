import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export function Arrow() {
  return <ArrowUpRight size={17} />;
}
export function ButtonLink({
  to,
  children,
  light = false,
}: {
  to: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`button ${light ? "light" : ""}`} to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-intro wrap">
      <p className="eyebrow">
        <span />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      {children && <div className="intro-text">{children}</div>}
    </section>
  );
}

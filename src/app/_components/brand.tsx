import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Equipar, voltar ao início">
      <span className="brand-mark" aria-hidden="true">
        <span /><span /><span /><span />
      </span>
      <span>equipar<span className="brand-period">.</span></span>
    </Link>
  );
}

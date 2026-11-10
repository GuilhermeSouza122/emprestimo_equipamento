import { openSans } from "./fonts";

export function NocturneRoot({ children }: { children: React.ReactNode }) {
  return <div className={`nocturne ${openSans.variable}`}>{children}</div>;
}

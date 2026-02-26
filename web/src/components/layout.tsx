import { Link } from "wouter";
import { Search } from "./search";
import css from "./layout.module.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css.layout}>
      <header className={css.header}>
        <Link href="/" className={css.logo}>
          Otherworld Codex
        </Link>
        <Search />
      </header>
      <main className={css.main}>{children}</main>
    </div>
  );
}

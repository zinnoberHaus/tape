"use client";
import { useState, useRef } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="mk-header"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div className="mk-nav-wrap">
        <a href="/" className="mk-brand">
          <span aria-hidden="true">T</span>Tape
        </a>
        <nav
          id="marketing-navigation"
          className={`mk-nav ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
          onClick={() => setOpen(false)}
        >
          <a href="#workspace">Workspace</a>
          <a href="#research">Research tools</a>
          <a href="#how-it-works">How it works</a>
          <a href="#questions">FAQs</a>
          <a className="mk-mobile-signin" href="/auth/sign-in">
            Sign in
          </a>
        </nav>
        <div className="mk-nav-actions">
          <a className="mk-signin" href="/auth/sign-in">
            Sign in
          </a>
          <a className="mk-button mk-button-small" href="/demo">
            Explore Tape <ArrowUpRight size={16} />
          </a>
          <button
            ref={menuButton}
            className="mk-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="marketing-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}

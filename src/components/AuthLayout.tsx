import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, footerText, footerLinkLabel, footerLinkTo, children }: AuthLayoutProps) {
  return (
    <main className="auth">
      <section className="auth__card" aria-labelledby="auth-title">
        <div className="brand">
          <span className="brand__mark">
            <Icon name="note" size={20} />
          </span>
          <span className="brand__name">Reproductor</span>
        </div>
        <h1 id="auth-title">{title}</h1>
        <p className="auth__subtitle">{subtitle}</p>
        {children}
        <p className="auth__footer">
          {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
        </p>
      </section>
    </main>
  );
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HydraB Vehicle 360',
  description: 'Fleet intelligence powered by Snowflake',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="topnav">
          <div className="nav-brand">
            <span className="logo">⚡</span> Hydra<span className="accent">B</span> Vehicle 360
          </div>
          <div className="nav-links">
            <a href="/">Overview</a>
            <a href="/fleet">Fleet Map</a>
            <a href="/pipeline">Pipeline</a>
            <a href="/technical">Technical</a>
          </div>
        </nav>
        {children}
        <footer className="footer">
          Powered by <strong>Snowflake</strong> — Data unified from Salesforce CRM + Odos Telemetry API
        </footer>
      </body>
    </html>
  )
}

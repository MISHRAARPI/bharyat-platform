'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/bom-upload', label: 'BOM Upload', icon: '↑' },
  { href: '/projects', label: 'Projects', icon: '◫' },
  { href: '/components', label: 'Component Intel', icon: '⚙' },
  { href: '/savings', label: 'Savings', icon: '◈' },
  { href: '/reports', label: 'Reports', icon: '≡' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isAuth = pathname === '/login' || pathname === '/signup'
  if (isAuth) return null

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: '#0f1923',
      borderRight: '1px solid #1e2d3d',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #1e2d3d',
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: '700',
          color: '#00d4ff',
          letterSpacing: '-0.02em',
        }}>
          Bharyat <span style={{ color: 'white' }}>AI</span>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#4a6a8a',
          marginTop: '4px',
          fontFamily: 'monospace',
        }}>
          BOM Intelligence Platform
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              marginBottom: '2px',
              borderRadius: '6px',
              color: active ? '#00d4ff' : '#7a9ab5',
              background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: active ? '600' : '400',
              borderLeft: active ? '2px solid #00d4ff' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '14px', width: '18px' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #1e2d3d',
        fontSize: '11px',
        color: '#2a4a6a',
        fontFamily: 'monospace',
      }}>
        v1.0.0 · Sprint Day 2
      </div>
    </div>
  )
}
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/bom-upload', label: 'BOM Upload' },
  { href: '/projects', label: 'Projects' },
  { href: '/components', label: 'Component Intel' },
  { href: '/savings', label: 'Savings' },
  { href: '/reports', label: 'Reports' },
  { href: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div style={{
      width: '220px', minHeight: '100vh',
      background: '#1E3A5F', padding: '1.5rem 1rem'
    }}>
      <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '16px' }}>
        Bharyat AI
      </h2>
      {links.map((link) => (
        <Link key={link.href} href={link.href} style={{
          display: 'block', padding: '10px 12px',
          marginBottom: '4px', borderRadius: '6px',
          color: pathname === link.href ? '#1E3A5F' : 'white',
          background: pathname === link.href ? 'white' : 'transparent',
          textDecoration: 'none', fontSize: '14px'
        }}>
          {link.label}
        </Link>
      ))}
    </div>
  )
}
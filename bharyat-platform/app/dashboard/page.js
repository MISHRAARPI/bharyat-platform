'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const kpis = [
    { label: 'Total BOM Spend', value: '$12.4M', color: '#00d4ff', sub: 'Across all projects' },
    { label: 'Savings Potential', value: '$1.8M', color: '#00ff9d', sub: '14.5% optimization' },
    { label: 'High Risk Parts', value: '34', color: '#ff5555', sub: 'Needs attention' },
    { label: 'Avg Lead Time', value: '18 Wks', color: '#ffb347', sub: 'High volatility' },
  ]

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f1923', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#7a9ab5' }}>
            BOM Optimization & Component Intelligence
          </p>
        </div>
        <button onClick={handleLogout} style={{
          padding: '8px 16px',
          background: 'transparent',
          color: '#7a9ab5',
          border: '1px solid #d0dde8',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          Logout
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{
            background: 'white',
            border: '1px solid #e2eaf2',
            borderRadius: '8px',
            padding: '1.5rem',
            borderTop: `3px solid ${kpi.color}`,
          }}>
            <div style={{ fontSize: '12px', color: '#7a9ab5', marginBottom: '8px', fontWeight: '500' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f1923', marginBottom: '4px' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '11px', color: kpi.color, fontWeight: '500' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div style={{
        background: 'white',
        border: '1px solid #e2eaf2',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f1923', marginBottom: '1rem' }}>
          ✦ AI Insights
        </div>
        {[
          { text: 'DDR5 pricing expected to rise 18% in next 90 days.', color: '#ff5555' },
          { text: '3 PMICs identified as single-source dependency.', color: '#ffb347' },
          { text: 'Switching MLCC vendor could save $180K annually.', color: '#00ff9d' },
        ].map((insight, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '10px 0',
            borderBottom: i < 2 ? '1px solid #f0f4f8' : 'none'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: insight.color, marginTop: '6px', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#4a6a8a' }}>{insight.text}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem'
      }}>
        {[
          { label: 'Upload BOM', href: '/bom-upload', color: '#00d4ff' },
          { label: 'View Projects', href: '/projects', color: '#00ff9d' },
          { label: 'Component Intel', href: '/components', color: '#ffb347' },
          { label: 'Savings Report', href: '/savings', color: '#ff5555' },
        ].map((item, i) => (
          <a key={i} href={item.href} style={{
            display: 'block',
            padding: '1rem',
            background: 'white',
            border: `1px solid ${item.color}33`,
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            color: item.color,
            fontSize: '13px',
            fontWeight: '600',
          }}>
            {item.label} →
          </a>
        ))}
      </div>
    </div>
  )
}
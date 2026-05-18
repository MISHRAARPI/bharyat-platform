'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to Bharyat Dashboard</h1>
      <p>BOM Optimization & Component Intelligence Platform</p>
      <button onClick={handleLogout} style={{ 
        marginTop: '1rem', padding: '8px 24px',
        background: '#1E3A5F', color: 'white',
        border: 'none', borderRadius: '6px', cursor: 'pointer'
      }}>
        Logout
      </button>
    </div>
  )
}
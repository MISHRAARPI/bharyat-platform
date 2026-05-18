'use client'
import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:8000'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', customer: '', product: '', industry: '', region: '' })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await fetch(`${API}/projects`)
    const data = await res.json()
    setProjects(data)
  }

  const createProject = async () => {
    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setShowModal(false)
    setForm({ name: '', customer: '', product: '', industry: '', region: '' })
    fetchProjects()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Projects</h1>
        <button onClick={() => setShowModal(true)} style={{
          padding: '10px 20px', background: '#1E3A5F',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p style={{ color: '#888' }}>No projects yet. Create your first project!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {projects.map(p => (
            <div key={p.id} style={{
              padding: '1.5rem', border: '1px solid #ddd',
              borderRadius: '8px', background: 'white'
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{p.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>Customer: {p.customer || '—'}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>Product: {p.product || '—'}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>Industry: {p.industry || '—'}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>Region: {p.region || '—'}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>New Project</h2>
            {['name', 'customer', 'product', 'industry', 'region'].map(field => (
              <input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            ))}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={createProject} style={{
                flex: 1, padding: '10px', background: '#1E3A5F',
                color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>
                Create
              </button>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '10px', background: '#eee',
                border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
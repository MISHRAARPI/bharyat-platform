'use client'
import { useState } from 'react'

const API = 'http://127.0.0.1:8000'

export default function BomUploadPage() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API}/bom/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f1923', marginBottom: '4px' }}>BOM Upload</h1>
        <p style={{ fontSize: '13px', color: '#7a9ab5' }}>Upload your Bill of Materials Excel file for AI analysis</p>
      </div>

      {/* Upload Zone */}
      {!result && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragging ? '#00d4ff' : '#d0dde8'}`,
              borderRadius: '8px', padding: '3rem', textAlign: 'center',
              cursor: 'pointer', background: dragging ? 'rgba(0,212,255,0.03)' : 'white',
              marginBottom: '1.5rem', transition: 'all 0.2s'
            }}
          >
            <input id="fileInput" type="file" accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f1923', marginBottom: '8px' }}>
              {file ? file.name : 'Drop your BOM file here'}
            </div>
            <div style={{ fontSize: '13px', color: '#7a9ab5' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse · .xlsx · .xls · .csv'}
            </div>
          </div>

          {file && (
            <button onClick={handleUpload} disabled={loading} style={{
              padding: '12px 32px', background: loading ? '#d0dde8' : '#1E3A5F',
              color: 'white', border: 'none', borderRadius: '6px',
              fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1.5rem'
            }}>
              {loading ? 'Parsing BOM...' : 'Upload & Parse BOM →'}
            </button>
          )}
        </>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '6px', color: '#dc2626', fontSize: '13px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Parsing Review Screen */}
      {result && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Parts', value: result.total_rows, color: '#00d4ff' },
              { label: 'Duplicates', value: result.duplicates_found, color: result.duplicates_found > 0 ? '#ff5555' : '#00ff9d' },
              { label: 'Columns Detected', value: Object.keys(result.columns_detected).length, color: '#ffb347' },
              { label: 'File', value: result.filename, color: '#7a9ab5' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px 18px', background: 'white',
                borderRadius: '8px', border: '1px solid #e2eaf2', borderTop: `3px solid ${item.color}` }}>
                <div style={{ fontSize: '11px', color: '#7a9ab5', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f1923' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {result.duplicates_found > 0 && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '6px', marginBottom: '1rem', fontSize: '13px', color: '#dc2626' }}>
              ⚠ {result.duplicates_found} duplicate MPNs found: {result.duplicate_mpns.join(', ')}
            </div>
          )}

          {/* Column mapping */}
          <div style={{ background: 'white', border: '1px solid #e2eaf2', borderRadius: '8px',
            padding: '1rem 1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f1923', marginBottom: '8px' }}>
              Column Mapping Detected
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(result.columns_detected).map(([key, val]) => (
                <span key={key} style={{ padding: '4px 10px', background: '#e8f0fe',
                  borderRadius: '4px', fontSize: '12px', color: '#1E3A5F', fontWeight: '600' }}>
                  {val} → {key}
                </span>
              ))}
            </div>
          </div>

          {/* Parts Table */}
          <div style={{ background: 'white', border: '1px solid #e2eaf2',
            borderRadius: '8px', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2eaf2',
              fontSize: '13px', fontWeight: '600', color: '#0f1923' }}>
              Parsed Components ({result.total_rows} parts)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['#', 'Raw MPN', 'Canonical MPN', 'Qty', 'Manufacturer', 'Unit Cost', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left',
                        borderBottom: '1px solid #e2eaf2', color: '#7a9ab5',
                        fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 20).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
                      <td style={{ padding: '10px 14px', color: '#7a9ab5' }}>{i + 1}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace',
                        fontWeight: '600', color: '#0f1923' }}>{row.raw_mpn}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace',
                        color: '#1E3A5F' }}>{row.canonical_mpn}</td>
                      <td style={{ padding: '10px 14px', color: '#0f1923' }}>{row.quantity || 1}</td>
                      <td style={{ padding: '10px 14px', color: '#7a9ab5' }}>{row.manufacturer || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#7a9ab5' }}>{row.unit_cost || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {row.is_duplicate ? (
                          <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: '600' }}>⚠ Duplicate</span>
                        ) : (
                          <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: '600' }}>✓ OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.rows.length > 20 && (
                <div style={{ padding: '12px 16px', color: '#7a9ab5', fontSize: '12px',
                  borderTop: '1px solid #f0f4f8', textAlign: 'center' }}>
                  Showing 20 of {result.rows.length} parts
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ padding: '12px 32px', background: '#00d4ff', color: '#0f1923',
              border: 'none', borderRadius: '6px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer' }}>
              ✓ Confirm & Import →
            </button>
            <button onClick={() => { setResult(null); setFile(null) }}
              style={{ padding: '12px 24px', background: 'white', color: '#7a9ab5',
                border: '1px solid #d0dde8', borderRadius: '6px',
                fontSize: '14px', cursor: 'pointer' }}>
              Upload Different File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
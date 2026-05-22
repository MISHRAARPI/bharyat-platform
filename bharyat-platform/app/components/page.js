'use client'
import { useState } from 'react'

const API = 'http://127.0.0.1:8000'

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState('pricing')
  const [mpn, setMpn] = useState('')
  const [component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manualAlt, setManualAlt] = useState({ alt_mpn: '', manufacturer: '', supplier: '', price: '', lead_time: '' })

  const demoComponent = {
    mpn: 'STM32F103C8T6',
    manufacturer: 'STMicroelectronics',
    description: 'ARM Cortex-M3 MCU, 72MHz, 64KB Flash, 20KB RAM',
    package: 'LQFP-48',
    lifecycle: 'Active',
    risk_score: 25,
    risk_level: 'Low',
    unit_cost: 4.20,
    quantity: 100,
    specs: {
      core: 'ARM Cortex-M3',
      frequency: '72MHz',
      flash: '64KB',
      ram: '20KB',
      voltage: '2.0V - 3.6V',
      temperature: '-40°C to 85°C',
      interfaces: 'UART, SPI, I2C, CAN, USB',
    },
    alternates: [
      { alt_mpn: 'STM32F103CBT6', manufacturer: 'STMicro', score: 92, risk: 'Low', cost_savings: '5%', validation_required: true },
      { alt_mpn: 'GD32F103C8T6', manufacturer: 'GigaDevice', score: 78, risk: 'Medium', cost_savings: '15%', validation_required: true },
      { alt_mpn: 'STM32F303CCT6', manufacturer: 'STMicro', score: 55, risk: 'High', cost_savings: '8%', validation_required: true },
    ],
    risk_reasons: ['Active lifecycle', 'Multiple sources available'],
    ai_summary: 'STM32F103C8T6 is a well-established MCU with low obsolescence risk. Multiple pin-compatible alternatives exist. Recommend qualifying STM32F103CBT6 as primary backup. CONFIDENCE: 90'
  }

  const tabs = ['pricing', 'alternates', 'risk', 'ai_summary']

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f1923', marginBottom: '4px' }}>
          Component Intelligence
        </h1>
        <p style={{ fontSize: '13px', color: '#7a9ab5' }}>
          Search any component for datasheet, specs, alternates and risk analysis
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Enter MPN e.g. STM32F103C8T6"
          value={mpn}
          onChange={e => setMpn(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setComponent(demoComponent)}
          style={{
            flex: 1, padding: '12px 16px', border: '1px solid #d0dde8',
            borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace',
            outline: 'none', background: 'white'
          }}
        />
        <button
          onClick={() => setComponent(demoComponent)}
          style={{
            padding: '12px 28px', background: '#1E3A5F', color: 'white',
            border: 'none', borderRadius: '6px', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer'
          }}
        >
          Analyze →
        </button>
      </div>

      {component && (
        <div>
          <div style={{
            background: 'white', border: '1px solid #e2eaf2',
            borderRadius: '8px', padding: '1.5rem', marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '700', color: '#00d4ff', marginBottom: '4px' }}>
                  {component.mpn}
                </div>
                <div style={{ fontSize: '14px', color: '#4a6a8a', marginBottom: '8px' }}>
                  {component.manufacturer} · {component.description}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', background: '#d4edda', color: '#155724', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {component.lifecycle}
                  </span>
                  <span style={{ padding: '3px 10px', background: '#e8f0fe', color: '#1E3A5F', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {component.package}
                  </span>
                  <span style={{ padding: '3px 10px', background: component.risk_level === 'Low' ? '#d4edda' : component.risk_level === 'High' ? '#fdecea' : '#fff3cd', color: component.risk_level === 'Low' ? '#155724' : component.risk_level === 'High' ? '#721c24' : '#856404', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    Risk: {component.risk_level} ({component.risk_score}/100)
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f1923' }}>${component.unit_cost}</div>
                <div style={{ fontSize: '12px', color: '#7a9ab5' }}>Unit price · Qty {component.quantity}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', marginBottom: '1rem', background: 'white', border: '1px solid #e2eaf2', borderRadius: '8px', overflow: 'hidden' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? '#1E3A5F' : 'white',
                color: activeTab === tab ? 'white' : '#7a9ab5',
                fontSize: '13px', fontWeight: activeTab === tab ? '600' : '400',
                textTransform: 'capitalize', transition: 'all 0.15s'
              }}>
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid #e2eaf2', borderRadius: '8px', padding: '1.5rem' }}>

            {activeTab === 'pricing' && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f1923', marginBottom: '1rem' }}>
                  Key Specifications
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    {Object.entries(component.specs).map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #f0f4f8' }}>
                        <td style={{ padding: '10px', color: '#7a9ab5', fontWeight: '600', textTransform: 'capitalize', width: '40%' }}>
                          {key.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '10px', color: '#0f1923', fontFamily: 'monospace' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'alternates' && (
              <div>
                <div style={{ padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px', color: '#856404' }}>
                  ⚠ All alternatives require engineering validation before substitution. Do not use as direct replacement.
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Alt MPN', 'Manufacturer', 'Score', 'Risk', 'Cost Savings', 'Validation'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#7a9ab5', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid #e2eaf2' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {component.alternates.map((alt, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: '600', color: '#1E3A5F' }}>{alt.alt_mpn}</td>
                        <td style={{ padding: '12px 14px', color: '#4a6a8a' }}>{alt.manufacturer}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#f0f4f8', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${alt.score}%`, height: '100%', background: alt.score > 80 ? '#00ff9d' : alt.score > 50 ? '#ffb347' : '#ff5555', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f1923', minWidth: '30px' }}>{alt.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: alt.risk === 'Low' ? '#d4edda' : alt.risk === 'High' ? '#fdecea' : '#fff3cd', color: alt.risk === 'Low' ? '#155724' : alt.risk === 'High' ? '#721c24' : '#856404' }}>
                            {alt.risk}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#00ff9d', fontWeight: '600' }}>{alt.cost_savings}</td>
                        <td style={{ padding: '12px 14px', fontSize: '11px', color: '#856404' }}>⚠ Required</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Manual Alternate Form */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f0f4f8', paddingTop: '1.5rem' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f1923', marginBottom: '1rem' }}>
                    + Add Alternate Manually
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      placeholder="Alt MPN"
                      value={manualAlt.alt_mpn}
                      onChange={e => setManualAlt({ ...manualAlt, alt_mpn: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #d0dde8', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', width: '160px' }}
                    />
                    <input
                      placeholder="Manufacturer"
                      value={manualAlt.manufacturer}
                      onChange={e => setManualAlt({ ...manualAlt, manufacturer: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #d0dde8', borderRadius: '6px', fontSize: '13px', width: '140px' }}
                    />
                    <input
                      placeholder="Supplier"
                      value={manualAlt.supplier}
                      onChange={e => setManualAlt({ ...manualAlt, supplier: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #d0dde8', borderRadius: '6px', fontSize: '13px', width: '120px' }}
                    />
                    <input
                      placeholder="Price $"
                      type="number"
                      value={manualAlt.price}
                      onChange={e => setManualAlt({ ...manualAlt, price: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #d0dde8', borderRadius: '6px', fontSize: '13px', width: '90px' }}
                    />
                    <input
                      placeholder="Lead Time (wks)"
                      type="number"
                      value={manualAlt.lead_time}
                      onChange={e => setManualAlt({ ...manualAlt, lead_time: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #d0dde8', borderRadius: '6px', fontSize: '13px', width: '130px' }}
                    />
                    <button
                      onClick={() => alert(`Added: ${manualAlt.alt_mpn}`)}
                      style={{ padding: '8px 20px', background: '#1E3A5F', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Add →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '700', color: component.risk_level === 'Low' ? '#00ff9d' : component.risk_level === 'High' ? '#ff5555' : '#ffb347' }}>
                      {component.risk_score}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7a9ab5' }}>Risk Score / 100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f1923', marginBottom: '8px' }}>
                      {component.risk_level} Risk
                    </div>
                    {component.risk_reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff9d' }} />
                        <span style={{ fontSize: '13px', color: '#4a6a8a' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai_summary' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '12px', padding: '2px 8px', background: '#e8f0fe', color: '#1E3A5F', borderRadius: '4px', fontWeight: '600' }}>
                    ✦ AI Generated
                  </span>
                  <span style={{ fontSize: '11px', color: '#7a9ab5' }}>Powered by OpenAI · Requires engineering validation</span>
                </div>
                <p style={{ fontSize: '14px', color: '#4a6a8a', lineHeight: 1.7 }}>
                  {component.ai_summary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!component && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#7a9ab5' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Search for a component</div>
          <div style={{ fontSize: '13px' }}>Enter any MPN to get datasheet, specs, alternates and risk analysis</div>
        </div>
      )}
    </div>
  )
}

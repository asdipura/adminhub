import { useEffect, useState } from 'react'

/** Detik berlalu sejak `active` jadi true (0 saat tidak aktif). */
export function useElapsed(active: boolean) {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    if (!active) { setSec(0); return }
    const start = Date.now()
    const id = setInterval(() => setSec(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [active])
  return sec
}

const BULAN =['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** yyyy-mm-dd → "12 Okt 2026" */
export function fmtTanggal(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return y && m && d ? `${d} ${BULAN[m - 1]} ${y}` : iso || '—'
}

/** Hanya render link http(s) — data dari spreadsheet tidak dipercaya mentah-mentah. */
export function SafeLink({ href, children }: { href: string; children?: React.ReactNode }) {
  if (!/^https?:\/\//i.test(href)) return <span className="sk-link">{href}</span>
  return (
    <a className="sk-link" href={href} target="_blank" rel="noopener noreferrer">
      {children ?? href}
    </a>
  )
}

export function MiniTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="sk-mini-wrap">
      <table className="sk-mini">
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{headers.map((_, j) => <td key={j}>{r[j] || '—'}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

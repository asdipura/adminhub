'use client'

import { useRef } from 'react'
import type { TujuanTabel } from '@/types/surat'

interface TujuanTableProps {
  value: TujuanTabel
  onChange: (v: TujuanTabel) => void
  invalid?: boolean
}

export const emptyTujuan = (): TujuanTabel => ({ headers: ['Tujuan'], rows: [[''], [''], ['']] })

export default function TujuanTable({ value, onChange, invalid }: TujuanTableProps) {
  const { headers, rows } = value
  const tableRef = useRef<HTMLTableElement>(null)

  function focusCell(r: number, c: number) {
    requestAnimationFrame(() => {
      tableRef.current?.querySelector<HTMLInputElement>(`[data-cell="${r}-${c}"]`)?.focus()
    })
  }

  function setCell(r: number, c: number, v: string) {
    onChange({ headers, rows: rows.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? v : x)) : row)) })
  }

  function addRow(): number {
    onChange({ headers, rows: [...rows, headers.map(() => '')] })
    return rows.length
  }

  function delRow(r: number) {
    if (rows.length <= 1) return
    onChange({ headers, rows: rows.filter((_, i) => i !== r) })
  }

  function addCol(label = `Keterangan ${headers.length}`) {
    onChange({ headers: [...headers, label], rows: rows.map((r) => [...r, '']) })
  }

  function delCol(c: number) {
    onChange({ headers: headers.filter((_, i) => i !== c), rows: rows.map((r) => r.filter((_, i) => i !== c)) })
  }

  function renameCol(c: number, label: string) {
    onChange({ headers: headers.map((h, i) => (i === c ? label : h)), rows })
  }

  function onKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (r === rows.length - 1) addRow()
      focusCell(r + 1, c)
    } else if (e.key === 'ArrowUp' && r > 0) {
      e.preventDefault()
      focusCell(r - 1, c)
    } else if (e.key === 'Tab' && !e.shiftKey && c === headers.length - 1 && r === rows.length - 1) {
      e.preventDefault()
      addRow()
      focusCell(r + 1, 0)
    }
  }

  // Paste blok dari Excel / Google Sheets (TSV) → isi mulai dari sel ini
  function onPaste(e: React.ClipboardEvent, r0: number, c0: number) {
    const text = e.clipboardData.getData('text')
    if (!text.includes('\t') && !text.includes('\n')) return // teks biasa: biarkan default
    e.preventDefault()
    const block = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((l) => l.split('\t'))
    const width = Math.max(...block.map((b) => b.length))

    const nextHeaders = [...headers]
    while (nextHeaders.length < c0 + width) nextHeaders.push(`Keterangan ${nextHeaders.length}`)
    const nextRows = rows.map((row) => [...row, ...Array(nextHeaders.length - row.length).fill('')])
    while (nextRows.length < r0 + block.length) nextRows.push(nextHeaders.map(() => ''))

    block.forEach((line, i) => line.forEach((v, j) => { nextRows[r0 + i][c0 + j] = v.trim() }))
    onChange({ headers: nextHeaders, rows: nextRows })
  }

  return (
    <div className={`tj-wrap${invalid ? ' err' : ''}`}>
      <div className="tj-scroll">
        <table className="tj-table" ref={tableRef}>
          <thead>
            <tr>
              <th className="tj-rn">#</th>
              {headers.map((h, c) => (
                <th key={c}>
                  {c === 0 ? (
                    <span className="tj-head-fixed">Tujuan</span>
                  ) : (
                    <div className="tj-head">
                      <input
                        className="tj-head-input"
                        aria-label={`Nama kolom ${c + 1}`}
                        value={h}
                        onChange={(e) => renameCol(c, e.target.value)}
                      />
                      <button type="button" className="tj-x" aria-label={`Hapus kolom ${h}`} onClick={() => delCol(c)}>✕</button>
                    </div>
                  )}
                </th>
              ))}
              <th className="tj-addcol">
                <button type="button" className="tj-addcol-btn" onClick={() => addCol()}>＋ Keterangan</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <td className="tj-rn">{r + 1}</td>
                {row.map((v, c) => (
                  <td key={c}>
                    <input
                      className="tj-cell"
                      data-cell={`${r}-${c}`}
                      aria-label={`${headers[c]} baris ${r + 1}`}
                      placeholder={r === 0 && c === 0 ? 'Nama / jabatan penerima…' : ''}
                      value={v}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      onKeyDown={(e) => onKeyDown(e, r, c)}
                      onPaste={(e) => onPaste(e, r, c)}
                    />
                  </td>
                ))}
                <td className="tj-del">
                  <button type="button" className="tj-x" aria-label={`Hapus baris ${r + 1}`} onClick={() => delRow(r)} disabled={rows.length <= 1}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="tj-addrow" onClick={() => { const r = addRow(); focusCell(r, 0) }}>＋ Tambah tujuan</button>
    </div>
  )
}

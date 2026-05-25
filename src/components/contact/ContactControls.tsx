'use client'

interface ContactControlsProps {
  sort: string
  filter: string
  query: string
  onSortChange: (sort: string) => void
  onFilterChange: (filter: string) => void
  onQueryChange: (q: string) => void
}

const SEARCH_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export default function ContactControls({
  sort,
  filter,
  query,
  onSortChange,
  onFilterChange,
  onQueryChange,
}: ContactControlsProps) {
  return (
    <>
      {/* Search Bar */}
      <div className="kontak-search-wrap">
        <div className="kontak-search-line"></div>
        <div className="kontak-search-box">
          <span className="kontak-search-icon">{SEARCH_ICON}</span>
          <input
            className="kontak-search-input"
            type="text"
            placeholder="Cari nama, jabatan, divisi..."
            autoComplete="off"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <div className="kontak-search-line"></div>
      </div>

      {/* Sort & Filter */}
      <div className="kontak-body" style={{ paddingTop: '44px', paddingBottom: 0 }}>
        <div className="kontak-controls">
          <span className="kontak-ctrl-label">Urutkan:</span>
          <div className="kontak-sort-group">
            {['kategori', 'az'].map((s) => (
              <button
                key={s}
                className={`kontak-pill${sort === s ? ' active' : ''}`}
                onClick={() => onSortChange(s)}
              >
                {s === 'kategori' ? 'Per Kategori' : 'A–Z'}
              </button>
            ))}
          </div>
          <div className="kontak-ctrl-sep"></div>
          <span className="kontak-ctrl-label">Filter:</span>
          <div className="kontak-filter-group">
            {[
              { id: 'semua', label: 'Semua' },
              { id: 'fungsio', label: 'Fungsio HIMAIDE' },
              { id: 'dosen', label: 'Dosen' },
              { id: 'tendik', label: 'Tendik' },
              { id: 'kadep', label: 'Kepala Departemen' },
            ].map((f) => (
              <button
                key={f.id}
                className={`kontak-pill${filter === f.id ? ' active' : ''}`}
                onClick={() => onFilterChange(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

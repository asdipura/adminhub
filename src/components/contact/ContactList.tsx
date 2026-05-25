'use client'

import { useMemo } from 'react'
import ContactCard from './ContactCard'
import { contacts, catMeta, catOrder } from '@/config/contacts'
import type { Contact } from '@/types/contact'

interface ContactListProps {
  sort: string
  filter: string
  query: string
}

export default function ContactList({ sort, filter, query }: ContactListProps) {
  const filtered = useMemo(() => {
    return contacts.filter((c: Contact) => {
      if (filter !== 'semua' && c.category !== filter) return false
      if (!query) return true
      const q = query.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        (catMeta[c.category]?.label || '').toLowerCase().includes(q)
      )
    })
  }, [filter, query])

  if (!filtered.length) {
    return (
      <div className="kontak-no-result">
        <div className="k-no-icon">🔍</div>
        <div>
          Tidak ada kontak yang cocok
          {query && (
            <>
              {' '}dengan pencarian{' '}
              <b style={{ color: 'var(--txt)' }}>&quot;{query}&quot;</b>
            </>
          )}
        </div>
      </div>
    )
  }

  if (sort === 'az') {
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'id'))
    return (
      <div className="kontak-list">
        {sorted.map((c, i) => (
          <ContactCard key={c.id} contact={c} meta={catMeta[c.category]} index={i} />
        ))}
      </div>
    )
  }

  // Sort by category
  return (
    <>
      {catOrder.map((cat) => {
        if (filter !== 'semua' && cat !== filter) return null
        const items = filtered.filter((c) => c.category === cat)
        if (!items.length) return null
        const meta = catMeta[cat]
        return (
          <div key={cat} className="kontak-category">
            <div className="kontak-cat-header">
              <div className="kontak-cat-icon">{meta.icon}</div>
              <div className="kontak-cat-title">{meta.label}</div>
              <div className="kontak-cat-count">{items.length} kontak</div>
            </div>
            <div className="kontak-list">
              {items.map((c, i) => (
                <ContactCard key={c.id} contact={c} meta={meta} index={i} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}

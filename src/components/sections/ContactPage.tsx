'use client'

import { useState } from 'react'
import ContactControls from '@/components/contact/ContactControls'
import ContactList from '@/components/contact/ContactList'

export default function ContactPage() {
  const [sort, setSort] = useState('kategori')
  const [filter, setFilter] = useState('semua')
  const [query, setQuery] = useState('')

  return (
    <div id="kontak-page">
      {/* Hero Section */}
      <section className="kontak-hero">
        <div className="kontak-hero-bg"></div>
        <div className="kontak-hero-grid"></div>
        <div className="kontak-hero-vignette"></div>
        <div className="kontak-hero-content">
          <div className="kontak-hero-eyebrow">HIMAIDE ITS &middot; Kabinet Evagranada</div>
          <h1>Contact</h1>
          <p className="kontak-hero-sub">Temukan kontak yang kamu butuhkan</p>
        </div>
      </section>

      {/* Search & Controls */}
      <ContactControls
        sort={sort}
        filter={filter}
        query={query}
        onSortChange={setSort}
        onFilterChange={setFilter}
        onQueryChange={setQuery}
      />

      {/* Contact List */}
      <div className="kontak-body">
        <ContactList sort={sort} filter={filter} query={query} />
      </div>
    </div>
  )
}

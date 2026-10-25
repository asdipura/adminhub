// Halaman Kontak disembunyikan; komponennya masih ada di sections/ContactPage.tsx
export type PageId = 'home' | 'about'

export type NavItem = {
  label: string
  page: PageId
  href?: string
  external?: boolean
  icon?: string
}

export type ActionItem = {
  contactId?: string
  type?: string
  href?: string
  label: string
}

export type CardButton = {
  label: string
  cls: string
  url?: string
  copy?: string
}

export type CardData = {
  id: string
  emoji: string
  title: string
  desc: string
  tl: string
  body: string
  btns: CardButton[]
}

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
  icon: string // nama Material Symbols Rounded; tambahkan juga ke MATERIAL_ICONS di layout.tsx
  title: string
  desc: string
  tl: string
  body: string
  btns: CardButton[]
}

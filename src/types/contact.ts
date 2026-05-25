export type ContactCategory = 'fungsio' | 'dosen' | 'tendik' | 'kadep'

export type Contact = {
  id: string
  name: string
  role: string
  category: ContactCategory
  wa?: string
  email?: string
  initials: string
  color: string
  tags?: string[]
}

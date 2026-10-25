import type { NavItem } from '@/types/config'

export const navItems: NavItem[] = [
  { label: 'Home', page: 'home' },
  { label: 'About HIMAIDE', page: 'about' },
]

export const navItemsTKO = {
  label: 'TKO ↗',
  href: '#', // TODO: add TKO link
  external: true,
}

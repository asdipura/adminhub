import type { Contact } from '@/types/contact'

export const contacts: Contact[] = [
  // ── Fungsio HIMAIDE ──
  {
    id: 'rifki',
    name: 'Rifki',
    role: 'President',
    category: 'fungsio',
    wa: '6281235966365',
    initials: 'RI',
    color: 'linear-gradient(135deg,#4f46e5,#818cf8)',
  },
  {
    id: 'alula',
    name: 'Alula',
    role: 'Vice President 1',
    category: 'fungsio',
    wa: '62811960081',
    initials: 'AL',
    color: 'linear-gradient(135deg,#7c3aed,#c084fc)',
  },
  {
    id: 'savio',
    name: 'Savio',
    role: 'Vice President 2',
    category: 'fungsio',
    wa: '6287852555220',
    initials: 'SA',
    color: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
  },
  {
    id: 'ahmad',
    name: 'Ahmad',
    role: 'Secretary 1',
    category: 'fungsio',
    wa: '6281280126505',
    initials: 'AH',
    color: 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
  },
  {
    id: 'tara',
    name: 'Tara',
    role: 'Secretary 2',
    category: 'fungsio',
    wa: '6282262626393',
    initials: 'TA',
    color: 'linear-gradient(135deg,#0e7490,#67e8f9)',
  },
  {
    id: 'ghania',
    name: 'Ghania',
    role: 'Treasurer 1',
    category: 'fungsio',
    wa: '6208977406276',
    initials: 'GH',
    color: 'linear-gradient(135deg,#065f46,#34d399)',
  },
  {
    id: 'aliya',
    name: 'Aliya',
    role: 'Treasurer 2',
    category: 'fungsio',
    wa: '6287820060405',
    initials: 'AY',
    color: 'linear-gradient(135deg,#047857,#6ee7b7)',
  },
  {
    id: 'michelle',
    name: 'Michelle',
    role: 'Head of Dept. Student Resource Development',
    category: 'fungsio',
    wa: '6281229300310',
    initials: 'MI',
    color: 'linear-gradient(135deg,#b45309,#fcd34d)',
  },
  {
    id: 'shabrina',
    name: 'Shabrina',
    role: 'Head of Div. Orientation and Development',
    category: 'fungsio',
    wa: '6282237758026',
    initials: 'SH',
    color: 'linear-gradient(135deg,#9d174d,#f9a8d4)',
  },
  {
    id: 'meng',
    name: 'Meng',
    role: 'Head of Div. Student Training and Mapping',
    category: 'fungsio',
    wa: '6281230010853',
    initials: 'ME',
    color: 'linear-gradient(135deg,#92400e,#fbbf24)',
  },
  {
    id: 'robby',
    name: 'Robby',
    role: 'Head of Dept. Internal Affairs Division',
    category: 'fungsio',
    wa: '6281997144170',
    initials: 'RO',
    color: 'linear-gradient(135deg,#1e40af,#93c5fd)',
  },
  {
    id: 'bhirawa',
    name: 'Bhirawa',
    role: 'Head of Dept. Student Professionalism and Welfare',
    category: 'fungsio',
    wa: '6287860006058',
    initials: 'BH',
    color: 'linear-gradient(135deg,#155e75,#38bdf8)',
  },
  {
    id: 'zafira',
    name: 'Zafira',
    role: 'Head of Div. Academic and Professional Division',
    category: 'fungsio',
    wa: '628117870419',
    initials: 'ZA',
    color: 'linear-gradient(135deg,#6d28d9,#ddd6fe)',
  },
  {
    id: 'rima',
    name: 'Rima',
    role: 'Head of Div. Student Advocacy and Welfare',
    category: 'fungsio',
    wa: '6285806910847',
    initials: 'RM',
    color: 'linear-gradient(135deg,#be185d,#f472b6)',
  },
  {
    id: 'ann',
    name: 'Ann',
    role: 'Head of Dept. External Relations Division',
    category: 'fungsio',
    wa: '628517425814',
    initials: 'AN',
    color: 'linear-gradient(135deg,#0f766e,#5eead4)',
  },
  {
    id: 'nayla',
    name: 'Nayla',
    role: 'Head of Dept. Creative Information Media',
    category: 'fungsio',
    wa: '628115137007',
    initials: 'NA',
    color: 'linear-gradient(135deg,#7c3aed,#f0abfc)',
  },
  {
    id: 'abel',
    name: 'Abel',
    role: 'Head of Dept. Entrepreneurship Business Management',
    category: 'fungsio',
    wa: '6281558006258',
    initials: 'AB',
    color: 'linear-gradient(135deg,#c2410c,#fb923c)',
  },

  // ── Dosen ──
  {
    id: 'ahmad-rieskha-harseno',
    name: 'Ahmad Rieskha Harseno, S.T., M.Ds.',
    role: 'Koordinator Kemahasiswaan / Dosen TKK',
    category: 'dosen',
    wa: '6282136902121',
    initials: 'AR',
    color: 'linear-gradient(135deg,#0369a1,#38bdf8)',
  },

  // ── Tendik/Staff Departement ──
  {
    id: 'faza',
    name: 'Faza Addina, S.Stat.',
    role: 'Staff Bendahara Pengeluaran',
    category: 'tendik',
    wa: '6287855997054',
    initials: 'FA',
    color: 'linear-gradient(135deg,#064e3b,#10b981)',
  },

  // ── Kepala Departemen ──
  {
    id: 'bambang-tristiyono',
    name: 'Bambang Tristiyono, ST., M.SI.',
    role: 'Kepala Departemen Desain Produk ITS',
    category: 'kadep',
    wa: '62812', // TODO: verify real number
    initials: 'BT',
    color: 'linear-gradient(135deg,#78350f,#f59e0b)',
  },
]

export type CategoryMeta = {
  label: string
  icon: string
  tagClass: string
}

export const catMeta: Record<string, CategoryMeta> = {
  fungsio: { label: 'Fungsio HIMAIDE', icon: '🏛️', tagClass: 'ktag-fungsio' },
  dosen: { label: 'Dosen', icon: '🎓', tagClass: 'ktag-dosen' },
  tendik: { label: 'Tendik/Staff Departemen', icon: '🏢', tagClass: 'ktag-tendik' },
  kadep: { label: 'Kepala Departemen', icon: '👑', tagClass: 'ktag-kadep' },
}

export const catOrder = ['fungsio', 'dosen', 'tendik', 'kadep'] as const

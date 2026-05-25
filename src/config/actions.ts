import { links } from './links'

export const actions = {
  tanyaSekre: {
    type: 'whatsapp' as const,
    wa: '6281280126505', // Secretary 1 (Ahmad)
    label: 'Tanya Sekre',
  },
  pengajuanDana: {
    type: 'whatsapp' as const,
    wa: '6208977406276', // Treasurer 1 (Ghania)
    label: 'Pengajuan Dana',
  },
  suratMasuk: {
    type: 'whatsapp' as const,
    wa: '6281280126505', // Secretary 1
    label: 'Surat Masuk',
  },
  bayarKas: {
    type: 'link' as const,
    href: links.bayarKas,
    label: 'Bayar Kas',
  },
}

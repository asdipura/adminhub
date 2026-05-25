export function toWaLink(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  const normalized = clean.startsWith('0') ? '62' + clean.slice(1) : clean
  return `https://wa.me/${normalized}`
}

export function openWhatsApp(phone: string, message?: string): void {
  const url = message
    ? `${toWaLink(phone)}?text=${encodeURIComponent(message)}`
    : toWaLink(phone)
  window.open(url, '_blank')
}

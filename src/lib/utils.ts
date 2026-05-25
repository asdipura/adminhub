export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, max)
    .join('')
    .toUpperCase()
}

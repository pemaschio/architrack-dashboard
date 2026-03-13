// Architectural palette — muted, material, never loud
const PALETTE = [
  '#B5614A', // terra
  '#4E7C5E', // sage
  '#3B5E7A', // slate
  '#7A5E3B', // sienna
  '#654E7A', // mauve
  '#3B6E6E', // teal
  '#7A6E3B', // ochre
  '#5E3B65', // aubergine
]

function hashStr(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function projectColor(identifier: string): string {
  if (!identifier) return PALETTE[0]
  return PALETTE[hashStr(identifier) % PALETTE.length]
}

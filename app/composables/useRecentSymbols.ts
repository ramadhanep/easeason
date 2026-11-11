import { useLocalStorage } from '@vueuse/core'

const MAX = 8

/** Recently viewed symbols, newest first. Per-browser only (localStorage). */
export function useRecentSymbols() {
  const recent = useLocalStorage<string[]>('easeason:recent', [])
  const track = (symbol: string) => {
    recent.value = [symbol, ...recent.value.filter((s) => s !== symbol)].slice(0, MAX)
  }
  return { recent, track }
}

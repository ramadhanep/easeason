/** Research articles, newest first. Pass `symbol` to keep only articles tagged with it. */
export function useResearchArticles(key: string, symbol?: string) {
  return useAsyncData(key, () =>
    queryCollection('research')
      .select('title', 'description', 'meta', 'path')
      .all()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((docs: any[]) =>
        docs
          .map((d) => ({ ...d, symbol: d.meta?.tags?.[0] ?? d.title.split(' ')[0] }))
          .filter((a) => !symbol || a.meta?.tags?.some((t: string) => t.toUpperCase() === symbol.toUpperCase()))
          .sort((a, b) => new Date(b.meta?.publishedOn).getTime() - new Date(a.meta?.publishedOn).getTime()),
      ),
  )
}

export function getGoogleMapLinks(location: string, address?: string | null, mapUrl?: string | null) {
  const query = [location, address].filter(Boolean).join(', ')
  const search = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  let stored: URL | undefined
  try {
    const parsed = new URL(mapUrl || '')
    if (parsed.protocol === 'https:' && ['www.google.com', 'google.com', 'www.google.de', 'maps.google.com', 'maps.app.goo.gl', 'goo.gl'].includes(parsed.hostname)) stored = parsed
  } catch { /* Use the address when no Google Maps link is stored. */ }
  const isEmbed = stored?.pathname.startsWith('/maps/embed')
  return {
    embed: isEmbed ? stored!.href : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`,
    open: stored && !isEmbed ? stored.href : search,
  }
}

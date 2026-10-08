/** Plain HTTP browsers omit Fetch Metadata on read requests. Keep the
 * configured origin allowlist and only accept an exact same-origin Referer. */
export function inferCookieOrigin(headers: Headers, method: string, serverURL: string): string | null {
  if (!['GET', 'HEAD'].includes(method) || headers.has('origin') || headers.has('sec-fetch-site') || !headers.has('cookie')) {
    return null
  }
  const referer = headers.get('referer')
  if (!referer) return null
  try {
    const expected = new URL(serverURL).origin
    return new URL(referer).origin === expected ? expected : null
  } catch {
    return null
  }
}

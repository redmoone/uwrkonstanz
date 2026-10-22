# Security update, 22 October 2026

The application uses Node.js 22.23.4, Next.js 16.4.2, React/React DOM 19.2.9, Payload 3.92.0 and Sharp 0.35.5. CI and the container use the pinned Node.js version. Payload's Next.js peer range supports Next.js 16; it excludes Next.js 15.5.

The request-origin adapter moved from `middleware.ts` to the Next.js 16 `proxy.ts` convention. Production builds explicitly retain Webpack for the Payload integration. The three scoped pnpm overrides update DOMPurify in the CMS editor, Sass's file-watcher dependency chain and the esbuild helper used by database tooling.

Validation before deployment: all 55 existing tests pass, the production build passes with type checking, and `pnpm audit --prod` reports zero known vulnerabilities. The deployment also tests CMS cookie authentication, rejection of foreign origins, training/team content and contact delivery to an isolated SMTP sink.

The complete development dependency audit retains one advisory for `braces@3.0.3`, through `eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch`. The advisory has no published patched version. That dependency is absent from the production dependency audit and is used by the lint tooling. Recheck it when updating eslint-config-next.

Primary security notices:

- https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://github.com/payloadcms/payload/releases/tag/v3.92.0

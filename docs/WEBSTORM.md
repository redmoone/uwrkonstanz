# WebStorm Setup

1. `File > Open` und den Projektordner wählen.
2. `Settings > Languages & Frameworks > Node.js`: Node 22 auswählen.
3. Package Manager: `pnpm`.
4. `.env.example` nach `.env` kopieren.
5. Terminal: `pnpm install`.
6. Danach `pnpm generate:importmap` und `pnpm generate:types`.
7. Run Configuration: npm/pnpm Script `dev`.

Empfohlene Plugins: keine zwingend nötig. WebStorm versteht TypeScript/React/Next.js nativ.

Wichtig: `src/app/(payload)/admin/importMap.js` wird von Payload regeneriert. Nicht manuell pflegen.

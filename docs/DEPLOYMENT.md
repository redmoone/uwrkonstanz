# Günstiges Self-Hosting

## Ziel

Eine einzelne Node-App mit SQLite und lokalen Media-Dateien. Für einen kleinen Verein genügt ein kleiner VPS völlig.

## Docker

```bash
cp .env.example .env
# PAYLOAD_SECRET + öffentliche URL setzen
docker compose up -d --build
```

Vor dem echten Produktionsstart sollten Payload-Migrationen erzeugt und getestet werden:

```bash
pnpm migrate:create
pnpm migrate
```

## Persistente Daten

Unbedingt sichern:

- `data/uwr.db` (+ WAL-Dateien, falls App läuft)
- `media/`
- `.env` separat/sicher

Einfachste sichere Backup-Strategie: App kurz stoppen, `data/` + `media/` tar/zippen, wieder starten.

## Reverse Proxy

Vor die App Caddy/Traefik/Nginx setzen und TLS automatisch verwalten. Die App selbst läuft intern auf Port 3000.

## Wann weg von SQLite?

Erst wenn mehrere App-Instanzen parallel schreiben müssen oder die Seite wesentlich größer wird. Dann Payload-DB-Adapter auf PostgreSQL umstellen und Daten migrieren.

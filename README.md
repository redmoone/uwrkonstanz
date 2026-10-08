# UWR Konstanz – Next.js + Payload + SQLite

Starterpaket für die neue UWR-Konstanz-Website. Ziel: moderne Sport-/Editorial-Seite vorne, sehr simples CMS für Trainer hinten.

## Stack

- Next.js 15.4.11
- React 19.2.1
- Payload CMS 3.90.2
- SQLite via `@payloadcms/db-sqlite`
- Lexical Rich Text
- Sharp für Bildvarianten
- Tailwind CSS 4 ist installiert; das aktuelle Mockup nutzt bewusst zusätzlich normales CSS für maximale Kontrolle.
- Docker / Docker Compose für Self-Hosting

> Next 15.4.11 ist hier bewusst gepinnt. Payload unterstützt diese Version und es gab 2026 noch offene Next-16-Probleme rund um unauthentifizierte Admin-Routen. Später kann man nachziehen.

## In WebStorm starten

1. ZIP entpacken und den Ordner in WebStorm öffnen.
2. Node.js 22 (oder mindestens 20.9) als Project Interpreter auswählen.
3. Im Terminal:

```bash
corepack enable
cp .env.example .env
pnpm install
pnpm generate:importmap
pnpm generate:types
pnpm dev
```

4. Website: `http://localhost:3000`
5. Payload Admin: `http://localhost:3000/admin`
6. Beim ersten Aufruf des Admins den ersten Benutzer anlegen.

## SQLite

Die DB liegt lokal in `data/uwr.db`. WAL ist aktiviert. Für diesen Verein ist das ideal: keine eigene PostgreSQL-Instanz, sehr wenig Wartung und Backup ist überschaubar.

Wichtig beim Self-Hosting: eine App-Instanz betreiben. Wenn später mehrere Serverinstanzen gleichzeitig schreiben sollen, auf PostgreSQL wechseln.

## Was Trainer im CMS sehen

- **Berichte** – Titel, Bild, Kurztext, Kategorie, Text, Entwurf/Veröffentlichen
- **Termine & Aktionen** – Turniere, Aktionen, Trainingslager
- **Trainingszeiten** – Zeiten ändern, ohne Code anzufassen
- **Team & Ansprechpartner**
- **Bilder** – mit Fotocredit und dokumentiertem Nutzungsrecht
- **Seiten** – längere statische Inhalte
- **Website-Einstellungen**

Die Teamseite `/team` zeigt aktive Profile aus **Team & Ansprechpartner**, nach Reihenfolge sortiert. Gesa und Nico werden einmalig mit `gesa@uwr-kn.de` und `nico@uwr-kn.de` angelegt; auf dem Server übernimmt dies die nächste Produktionsmigration. Lokal vorhandene CMS-Daten lassen sich mit `npm run payload -- run scripts/seed-trainers.ts` ergänzen, ohne vorhandene Profile zu überschreiben.

Das Kontaktformular sendet mit E-Mail-Adresse, optionaler Handynummer und Nachricht direkt über SMTP. Unter **Website-Einstellungen → Kontakt-E-Mail / Verteiler** lässt sich ein gemeinsamer Empfänger setzen. Bleibt das Feld leer, erhalten alle aktiven Trainer mit E-Mail-Adresse die Nachricht. `CONTACT_TO_EMAIL` kann den CMS-Empfänger überschreiben. Der Besucher wird als Reply-To gesetzt; der Absender ist die eigene SMTP-Adresse. Ohne SMTP-Konfiguration gibt das Formular einen Fehler zurück und behauptet keinen erfolgreichen Versand. Die notwendigen Variablen stehen in `.env.example`; auf dem Server gehören sie ausschließlich in `/srv/uwrkonstanz/shared/app.env`.

## Ordner

- `src/app/(frontend)` – öffentliche Website
- `src/app/(payload)` – Payload Admin + API
- `src/collections` – CMS-Datenmodell
- `public/images/uwr` – vorbereitete Website-Bilder
- `docs` – Design, Bildplan, Roadmap und Deployment
- `data` – SQLite-Datei (nicht committen)
- `media` – Uploads aus Payload (nicht committen)

## Nächste Schritte

Siehe `docs/ROADMAP.md`. Der aktuelle Stand ist absichtlich ein starker erster visueller Prototyp, kein fertiger Launch.

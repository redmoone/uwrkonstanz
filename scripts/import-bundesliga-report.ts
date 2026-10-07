import path from 'node:path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import type { Post } from '../src/payload-types'

// Usage: pnpm payload run scripts/import-bundesliga-report.ts [imagePath] [publicationDate]
// Use the existing local schema without running development schema changes.
process.env.PAYLOAD_MIGRATING = 'true'

const slug = 'uwr-bodensee-klassenerhalt-2-bundesliga-sued'
const imagePath = path.resolve(process.argv[2] || 'public/images/uwr/source/bundesliga-klassenerhalt-bodensee.png')
const publicationDate = new Date(process.argv[3] || '2026-04-28T12:00:00+02:00')

if (Number.isNaN(publicationDate.getTime())) throw new Error('Ungültiges Veröffentlichungsdatum')

const paragraphs = [
  'Mit dem entscheidenden Sieg zum direkten Klassenerhalt kehrte die Spielgemeinschaft aus Tauch-Sport-Club Friedrichshafen, eine Abteilung der TSG Ailingen e.V. und Tauchsportgruppe Konstanz vom letzten Spieltag der Saison in Wiesbaden an den Bodensee zurück. Vor dem Spieltag lag als direkter Gegner der TSV Malsch II mit lediglich einem Punkt Vorsprung auf dem fünften Tabellenplatz vor UWR Bodensee auf Rang 6, dem Relegationsplatz.',
  'Zum Auftakt ging es gegen den stark aufgestellten 1. TC Freiburg. Das Team vom Bodensee schlug sich wacker und konnte kurz vor Abpfiff noch einen Strafwurf verwandeln und damit auf den Endstand von 1:5 verkürzen. Im zweiten Spiel traf UWR Bodensee auf den Tabellenführer TC Pulpo Wiesbaden. Gegen die Gastgeber zeigte das Team eine reife Leistung, brachte die Heimmannschaft zwischenzeitlich mehrfach in Bedrängnis und unterlag am Ende lediglich mit 0:4.',
  'Im dritten und letzten Spiel des Tages ging es ins direkte Duell mit dem TSV Malsch II um den Klassenerhalt. Das Bodensee-Team ließ den Malschern nicht den Hauch einer Chance und gewann souverän mit 7:0. Damit hat sich UWR Bodensee den direkten Verbleib in der 2. Bundesliga Süd gesichert und darf sich auf die dritte Saison in Folge in der zweithöchsten Spielklasse freuen. Die jungen U18 Spielern haben sich im Team des Bodensees fest etabliert und sich ihren Stammplatz erspielt.',
]

const content: Post['content'] = {
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: paragraphs.map(text => ({
      type: 'paragraph',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      children: [{ type: 'text', version: 1, text, format: 0, detail: 0, style: '', mode: 'normal' }],
    })),
  },
}

const payload = await getPayload({ config: configPromise })

try {
  const existing = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1, depth: 0 })

  if (existing.docs.length) {
    if (process.argv[3] && existing.docs[0].publishedAt !== publicationDate.toISOString()) {
      await payload.update({
        collection: 'posts',
        id: existing.docs[0].id,
        data: { publishedAt: publicationDate.toISOString() },
      })
      console.log(`Veröffentlichungsdatum aktualisiert: ${publicationDate.toISOString()}`)
    } else {
      console.log(`Bericht bereits vorhanden: /news/${slug}`)
    }
  } else {
    const existingMedia = await payload.find({ collection: 'media', where: { filename: { equals: path.basename(imagePath) } }, limit: 1, depth: 0 })
    const media = existingMedia.docs[0] || await payload.create({
      collection: 'media',
      filePath: imagePath,
      data: {
        alt: 'Das Team von UWR Bodensee jubelt am Beckenrand nach dem Klassenerhalt',
        credit: 'TSCF',
        source: 'TSCF',
        rights: 'club-permission',
        rightsNote: 'Vom Nutzer für die lokale Website bereitgestellt. Credit: TSCF. Dauerhafte Webfreigabe vor öffentlichem Launch dokumentieren.',
        focalX: 50,
        focalY: 46,
      },
    })

    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'UnterwasserRugby Bodensee bleibt in der 2. Bundesliga Süd',
        slug,
        category: 'turnier',
        excerpt: 'Mit einem 7:0 gegen den TSV Malsch II sichert sich UWR Bodensee den direkten Klassenerhalt und bleibt zum dritten Mal in Folge in der 2. Bundesliga Süd.',
        heroImage: media.id,
        publishedAt: publicationDate.toISOString(),
        content,
        _status: 'published',
      },
    })

    console.log(`Bericht ${post.id} angelegt: /news/${slug}`)
  }
} finally {
  await payload.destroy()
}

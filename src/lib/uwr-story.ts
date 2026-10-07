import { uwrScenes } from './uwr-explainer'
import { ballHotspots, basketHotspots, teamHotspots } from './uwr-hotspots'

export type StoryImageAsset = { src: string; width: number; height: number; alt: string }
export type StoryHotspot = {
  id: string
  x: number
  y: number
  label: string
  description: string
  outlinePath?: string
}
export type StoryStateId = 'ball' | 'basket' | 'gear' | 'air' | 'team'
export type StoryStateData = {
  id: StoryStateId
  eyebrow: string
  title: string
  paragraphs: string[]
  image: StoryImageAsset
  placement: 'right' | 'left' | 'bottom-left' | 'bottom-right'
  hotspots?: StoryHotspot[]
}
export type StoryTriggerData = {
  id: string
  stateId: StoryStateId
  hotspotId?: string
  label?: string
  text?: string
}

// All five states share one stage. Teamplay keeps its photo for three triggers.
export const uwrStoryStates: StoryStateData[] = [
  {
    id: 'ball', eyebrow: '01 / DER BALL', title: 'DER BALL\nSINKT.',
    paragraphs: ['Unter Wasser bleibt er im Spiel.', 'Getragen, gepasst und weitergespielt wird mit einer Hand.'],
    image: uwrScenes.overview, placement: 'right', hotspots: ballHotspots,
  },
  {
    id: 'basket', eyebrow: '02 / DER KORB', title: 'DAS TOR STEHT\nAM BODEN.',
    paragraphs: ['Der Ball muss in den gegnerischen Metallkorb am Beckenboden.'],
    image: uwrScenes.positions, placement: 'left', hotspots: basketHotspots,
  },
  {
    id: 'gear', eyebrow: '03 / AUSRÜSTUNG', title: 'MASKE.\nSCHNORCHEL.\nFLOSSEN.',
    paragraphs: ['Klare Sicht. Luft an der Oberfläche. Vortrieb unter Wasser.'],
    image: uwrScenes.overview, placement: 'bottom-left',
  },
  {
    id: 'air', eyebrow: '04 / LUFT & WECHSEL', title: 'IRGENDWANN\nMUSST DU HOCH.',
    paragraphs: ['Gespielt wird ohne Atemgerät.', 'Luft holen, ablösen, wieder eintauchen.'],
    image: {
      src: '/images/uwr/variants/poolside-original-web.jpg',
      width: 2560, height: 1920,
      alt: 'UWR-Spieler mit Maske und Schnorchel holen am Beckenrand Luft',
    },
    placement: 'bottom-right',
  },
  {
    id: 'team', eyebrow: '05 / TEAMPLAY', title: 'ALLEIN KOMMST\nDU NICHT WEIT.',
    paragraphs: [], image: uwrScenes.positions, placement: 'left', hotspots: teamHotspots,
  },
]

export const uwrStoryTriggers: StoryTriggerData[] = [
  { id: 'ball', stateId: 'ball', hotspotId: 'ball' },
  { id: 'basket', stateId: 'basket', hotspotId: 'korb' },
  { id: 'gear', stateId: 'gear' },
  { id: 'air', stateId: 'air' },
  { id: 'team-support', stateId: 'team', hotspotId: 'support',
    label: 'Weg sichern.', text: 'Mitspieler sichern die Situation am Korb ab.' },
  { id: 'team-carrier', stateId: 'team', hotspotId: 'ball-carrier',
    label: 'Ballführer unterstützen.', text: 'Gemeinsam entstehen freie Wege zum Korb.' },
  { id: 'team-cover', stateId: 'team', hotspotId: 'cover',
    label: 'Ablösen.', text: 'Wer Luft braucht, wird abgelöst. Das Spiel bleibt in Bewegung.' },
]

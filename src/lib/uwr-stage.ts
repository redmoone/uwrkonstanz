import { uwrCopy, uwrScenes } from './uwr-explainer'

export type StoryStateId = 'ball' | 'korb' | 'ausruestung' | 'deckel' | 'dackel' | 'stuermer'
export type Camera = { x: number; y: number; zoom: number }
export type StoryHotspot = {
  id: string
  x: number
  y: number
  label: string
  description: string
  groupId?: 'ausruestung'
  outlinePath?: string
}
export type StoryStateData = {
  id: StoryStateId
  eyebrow: string
  title: string
  paragraphs: string[]
  camera: Camera
  mobileCamera?: Camera
}

// Technical stage mapping only. All explanatory copy comes from uwrCopy;
// there are no independent photographs or newly invented chapters here.
const { width, height } = uwrScenes.positions
const camera = (focusX: number, focusY: number, zoom: number): Camera => ({
  zoom,
  x: Math.min(0, Math.max(width * (1 - zoom), width / 2 - focusX * zoom)),
  y: Math.min(0, Math.max(height * (1 - zoom), height / 2 - focusY * zoom)),
})
const firstSentence = (text: string) => text.slice(0, text.indexOf('.') + 1)
export const uwrStageSteps: StoryStateData[] = [
  { id: 'ball', eyebrow: '01 / DER BALL', title: 'DER BALL SINKT.',
    paragraphs: [uwrCopy.ball[0]], camera: camera(918, 663, 1.18), mobileCamera: camera(918, 663, 1.4) },
  { id: 'korb', eyebrow: '02 / DER KORB', title: 'DAS TOR STEHT AM BODEN.',
    paragraphs: [firstSentence(uwrCopy.korb[0])], camera: camera(450, 690, 1.22), mobileCamera: camera(450, 690, 1.4) },
  { id: 'ausruestung', eyebrow: '03 / DIE AUSRÜSTUNG', title: 'MASKE.\nSCHNORCHEL.\nFLOSSEN.',
    paragraphs: uwrCopy.ausruestung, camera: camera(835, 430, 1.1), mobileCamera: camera(835, 430, 1.3) },
  { id: 'deckel', eyebrow: '04 / DER DECKEL', title: 'DER DECKEL',
    paragraphs: [firstSentence(uwrCopy.deckel[0])], camera: camera(465, 525, 1.24), mobileCamera: camera(465, 525, 1.35) },
  { id: 'dackel', eyebrow: '05 / UNTERTOR / DACKEL', title: 'UNTERTOR /\nDACKEL',
    paragraphs: [firstSentence(uwrCopy.dackel[0])], camera: camera(690, 664, 1.28), mobileCamera: camera(690, 664, 1.35) },
  { id: 'stuermer', eyebrow: '06 / DER STÜRMER', title: 'Mit dem Ball nach vorne.',
    paragraphs: uwrCopy.stuermer, camera: camera(780, 390, 1.25), mobileCamera: camera(780, 320, 1.35) },
]
export const isHotspotActive = (point: StoryHotspot, activeId: string | null) =>
  point.id === activeId || (activeId === 'ausruestung' && point.groupId === 'ausruestung')

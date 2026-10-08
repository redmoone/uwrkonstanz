import { uwrCopy, uwrEquipment } from './uwr-explainer'
import { uwrOutlinePaths } from './uwr-outlines'
import type { StoryHotspot } from './uwr-stage'

// Development tracing also available via ?trace=1.
export const DEBUG_HOTSPOTS = false

// Native coordinates of the supplied 1536 × 1024 photograph and SVGs.
// Each equipment contour remains independent within the explicit ABC group.
export const uwrHotspots: StoryHotspot[] = [
  { id: 'ball', x: 915, y: 662, label: 'Ball', description: uwrCopy.ball[0], outlinePath: uwrOutlinePaths.ball },
  { id: 'korb', x: 450, y: 694, label: 'Korb', description: uwrCopy.korb[0], outlinePath: uwrOutlinePaths.korb },
  { id: 'deckel', x: 465, y: 558, label: 'Deckel', description: uwrCopy.deckel[0], outlinePath: uwrOutlinePaths.deckel },
  { id: 'dackel', x: 641, y: 683, label: 'Untertor / Dackel', description: uwrCopy.dackel[0], outlinePath: uwrOutlinePaths.dackel },
  { id: 'stuermer', x: 780, y: 360, label: 'Stürmer', description: uwrCopy.stuermer[0], outlinePath: uwrOutlinePaths.stuermer },
  { id: 'maske', x: 827, y: 465, label: uwrEquipment[0].label, description: uwrEquipment[0].text, groupId: 'ausruestung', outlinePath: uwrOutlinePaths.maske },
  { id: 'schnorchel', x: 973, y: 220, label: uwrEquipment[1].label, description: uwrEquipment[1].text, groupId: 'ausruestung', outlinePath: uwrOutlinePaths.schnorchel },
  { id: 'flossen', x: 695, y: 508, label: uwrEquipment[2].label, description: uwrEquipment[2].text, groupId: 'ausruestung', outlinePath: uwrOutlinePaths.flossen },
]

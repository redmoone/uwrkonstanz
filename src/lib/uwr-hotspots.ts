import type { StoryHotspot } from './uwr-story'

// Set true while tracing: original coordinates, IDs, viewBox and all paths.
// Debug intentionally bypasses the single-highlight rule; production never does.
export const DEBUG_HOTSPOTS = false

// explainer-overview.png, 1024 × 819. Trace of the visible ball edge,
// including the boundary where the hand covers its right side.
export const BALL_OUTLINE = `M 650.5 583.8
  C 651.2 581.2 652.7 578.9 654.3 576.8
  C 656 574.6 658 572.9 660.2 571.4
  C 662.2 570 664.6 569.1 667 568.5
  C 669.3 568 671.8 568.2 674.3 568.6
  C 676.5 569.1 678.5 570 680.2 571.2
  C 681.7 572.3 683.1 573.7 684.2 575.2
  C 683.8 577.5 683.4 579.5 683.6 582
  C 683.7 584.6 683.2 587.1 681.9 589.4
  C 681.3 590.4 680.4 591.8 679.4 592.8
  C 678.1 594.4 676.9 595.9 675.4 597.1
  C 673.5 598.3 671.5 599.3 669.5 599.7
  C 667.3 600 665.2 599.9 663.1 599.2
  C 661.2 598.8 659.4 598 657.8 597.1
  C 656.3 596.2 655 595.1 653.9 593.8
  C 652.7 592.4 651.6 590.7 651 588.8
  C 650.4 587.1 650.1 585.5 650.5 583.8 Z`

// explainer-positions.png, 1024 × 683. Visible basket frame and base plate.
// The upper boundary follows the occlusion by the player, not her body.
export const BASKET_OUTLINE = `M 265 412
  C 265.8 418 266.1 423 266.5 429
  C 267 435 267.1 442 267.5 449
  C 267.9 456 268.1 462 268.3 469
  C 268.5 475 268.8 481 269.1 487
  L 260.5 488.8 L 255 494.5 L 249.8 500.3
  L 244.1 506.8 L 239.5 512
  C 240.1 513.7 241.6 514.9 244 515.8
  C 247.6 517 253.2 517.6 260 518.1
  C 267.7 518.6 275 519.2 282.8 519.6
  C 291.7 520.1 301.2 520.6 311 521
  C 317.1 521.3 322.4 521.5 328.3 521.3
  C 333.4 521.1 338.3 520.1 341.9 517.8
  C 344.2 516.2 346.1 514.1 347.8 511.7
  L 351.8 504.4 L 355.6 497 L 359 490
  L 352.9 488.9 L 341.8 489.7 L 332.6 492
  L 334.7 481.7 L 337.7 464.2 L 340.6 446.3
  L 343.6 428.3 L 346.3 414.1
  C 343.6 415.2 340.2 416.2 337 417
  C 333.1 418.1 328.8 418.6 325.1 419.1
  C 320.6 419.7 316.7 420.2 313.2 420.2
  C 309.9 420.2 306 419.8 303.1 419
  L 294.2 417.5 L 286 417 L 276.5 415.5
  C 272.7 414.4 268.6 413.5 265 412 Z`

// All x/y values are image pixels, never percentages. IDs are unique across
// scenes so a temporary hover can suppress every other scene's highlight.
export const ballHotspots: StoryHotspot[] = [
  { id: 'ball', x: 669, y: 584, label: 'Ball', description: 'Mit Salzwasser gefüllt – der Ball sinkt.', outlinePath: BALL_OUTLINE },
]

export const basketHotspots: StoryHotspot[] = [
  { id: 'korb', x: 300, y: 460, label: 'Korb', description: 'Das Ziel steht auf dem Beckenboden.', outlinePath: BASKET_OUTLINE },
]

// Overlapping bodies: deliberately no speculative player contours.
export const teamHotspots: StoryHotspot[] = [
  { id: 'support', x: 420, y: 452, label: 'Unterstützung', description: 'Absicherung direkt vor dem Korb.' },
  { id: 'ball-carrier', x: 586, y: 470, label: 'Ballführer', description: 'Mit dem Ball den nächsten freien Weg finden.' },
  { id: 'cover', x: 308, y: 370, label: 'Ablösen', description: 'Gemeinsam die Korböffnung schützen.' },
]

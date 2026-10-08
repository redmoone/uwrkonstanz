export type SceneId = 'overview' | 'positions'

// Image sources and editorial copy are independent of layout and interactions.
export const uwrScenes = {
  overview: {
    src: '/images/uwr/source/explainer-overview.png',
    width: 1024,
    height: 819,
    alt: 'Unterwasserrugby am Korb: ein Stürmer mit Ball, die Deckel-Spielerin auf dem Korb und die Untertorverteidigung davor',
  },
  positions: {
    src: '/images/uwr/source/explainer-positions-upscaled.png',
    width: 1536,
    height: 1024,
    alt: 'Unterwasserrugby: Deckel-Spielerin auf dem Korb links, Untertorverteidigung davor und der kopfüber schwimmende Stürmer in der Mitte',
  },
} satisfies Record<SceneId, { src: string; width: number; height: number; alt: string }>

export const uwrEquipment = [
  {
    id: 'maske', label: 'Maske',
    text: 'Die Maske gibt dir unter Wasser klare Sicht auf Ball, Mitspieler und Gegner.',
  },
  {
    id: 'schnorchel', label: 'Schnorchel',
    text: 'Mit dem Schnorchel kannst du an der Oberfläche atmen und das Spiel im Blick behalten. Unter Wasser hältst du die Luft an.',
  },
  {
    id: 'flossen', label: 'Flossen',
    text: 'Flossen sorgen für Vortrieb. Mit ihnen beschleunigst du, wechselst die Richtung und bewegst dich durch alle drei Dimensionen.',
  },
  {
    id: 'kappe', label: 'Kappe',
    text: 'Die Kappe schützt die Ohren. Farbe und Nummer machen die Teams und einzelne Spieler erkennbar.',
  },
  {
    id: 'badehose', label: 'Badehose',
    text: 'Eine eng anliegende Badehose gehört zur Ausrüstung. Im Spiel unterscheiden sich die Teams durch weiße und blaue beziehungsweise dunkle Kleidung.',
  },
  {
    id: 'badeanzug', label: 'Badeanzug',
    text: 'Auch der Badeanzug ist eng anliegend und in Teamfarbe. Hier siehst du ihn an der Deckel-Spielerin auf dem Korb.',
  },
] as const

export const uwrCopy = {
  dreidimensional: [
    'Unterwasserrugby spielt sich nicht nur auf einer Fläche ab. Der ganze Raum unter Wasser gehört zum Spiel: vor dir, hinter dir, über dir und unter dir.',
    'Zwei Mannschaften versuchen, den Ball im gegnerischen Korb am Beckenboden zu versenken. Gespielt wird ohne Atemgerät – zum Luftholen geht es an die Oberfläche.',
  ],
  ball: [
    'Der Ball ist mit Salzwasser gefüllt. Dadurch sinkt er, statt an der Oberfläche zu schwimmen. Unter Wasser wird er getragen und gepasst – und mit ihm bewegt sich das Spiel durch den ganzen Raum.',
    'Wer den Ball besitzt, sucht freie Wege und Mitspieler. Ein guter Pass bringt den Ball an der Verteidigung vorbei und das Team näher an den gegnerischen Korb. Dabei zählt der Blick nach oben und unten genauso wie nach vorne.',
  ],
  korb: [
    'An beiden Enden des Spielfelds steht ein Metallkorb auf dem Beckenboden. Hier soll der Ball hinein: Ein Tor zählt, wenn er vollständig im gegnerischen Korb ist.',
    'Der Weg dorthin ist selten frei. Die Verteidigung schützt die Öffnung, während der Angriff nach einer Lücke sucht. Rund um den Korb treffen beide Teams aufeinander – von oben, von der Seite und von unten. Ein freier Weg kann sich im nächsten Moment schon wieder schließen.',
  ],
  ausruestung: [
    'Die Maske gibt dir klare Sicht, der Schnorchel hilft beim Atmen an der Oberfläche und die Flossen bringen dich in Bewegung. Unter Wasser hältst du die Luft an und spielst durch alle drei Dimensionen.',
    'Kappe und Kleidung machen die Teams erkennbar. Die Kappe schützt außerdem die Ohren. Zusammen hilft dir die Ausrüstung, den Ball im Blick zu behalten, deine Mitspieler zu finden und schnell die Richtung zu wechseln.',
  ],
  deckel: [
    'Der Deckel verteidigt die Korböffnung von oben. Dafür legt sich die Torverteidigung mit dem Rücken auf den Korbrand und versperrt den direkten Weg zum Tor. Angreifer müssen einen anderen Weg finden, um den Ball im Korb unterzubringen.',
    'Auf dem Foto übernimmt die Spielerin im weißen Badeanzug diese Aufgabe. Zum Luftholen wird sie abgelöst. Damit der Korb dabei geschützt bleibt, müssen die Verteidiger aufeinander achten und ihre Wechsel gut abstimmen.',
  ],
  dackel: [
    'Der Dackel verteidigt den Bereich vor und unterhalb der Korböffnung. Dort erschwert er Angriffe von unten und schützt den Deckel. Er behält den Ball im Blick und stellt sich den Angreifern in den Weg, bevor sie die Öffnung erreichen.',
    'Auf dem Foto liegt die Untertorverteidigung direkt am Boden vor dem Korb. Deckel und Dackel ergänzen sich: Einer sichert die Öffnung von oben, der andere den Raum davor und darunter. Gemeinsam halten sie den Weg zum Tor geschlossen.',
  ],
  stuermer: [
    'Der Stürmer sucht Räume, bindet Gegenspieler, bringt den Ball vom eigenen Korb weg und startet den Angriff. Er behält seine Mitspieler im Blick und sucht einen Weg, den Ball nach vorne zu bringen.',
    'Dabei entscheiden Timing, Übersicht und Zusammenspiel. Mal öffnet sich eine Lücke für den eigenen Vorstoß, mal bringt ein Pass das Team weiter. Wer sich gut bewegt und den richtigen Moment erkennt, schafft Raum für den nächsten Angriff.',
  ],
  ausprobieren: [
    'Jetzt kennst du das Spiel. Wie sich die Bewegung unter Wasser und das Zusammenspiel wirklich anfühlen, erlebst du am besten selbst.',
    'Du brauchst noch keine UWR-Erfahrung. Melde dich für ein Probetraining – wir klären mit dir den Einstieg und was du mitbringen solltest.',
  ],
}

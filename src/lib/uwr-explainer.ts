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
    'Der Ball ist mit Salzwasser gefüllt. Dadurch sinkt er, statt an der Oberfläche zu schwimmen.',
    'Unter Wasser wird er getragen und gepasst. Wer den Ball besitzt, muss den Raum lesen, Mitspieler finden und einen Weg zum Korb schaffen.',
  ],
  korb: [
    'An beiden Enden des Spielfelds steht ein Metallkorb auf dem Beckenboden. Ein Tor zählt, wenn der Ball vollständig im gegnerischen Korb ist.',
    'Der Weg dorthin ist selten frei. Angriff und Verteidigung treffen direkt am Korb aufeinander – von oben, von der Seite und von unten.',
  ],
  ausruestung: [
    'Maske, Schnorchel, Flossen, Kappe und Badehose oder Badeanzug: Die Ausrüstung hilft beim Sehen, Bewegen und Erkennen der Teams.',
  ],
  deckel: [
    'Der Deckel verteidigt die Korböffnung von oben. Dafür legt sich die Torverteidigung mit dem Rücken auf den Korbrand und verschließt den direkten Weg zum Tor.',
    'Hier übernimmt die Spielerin im weißen Badeanzug diese Aufgabe. Zum Luftholen wird sie abgelöst – die Absicherung funktioniert nur im Zusammenspiel.',
  ],
  dackel: [
    'Der Dackel verteidigt den Bereich vor und unterhalb der Korböffnung. Von dort erschwert er Angriffe von unten und schützt den Deckel.',
    'Auf dem Foto siehst du die Untertorverteidigung direkt am Boden vor dem Korb. Gemeinsam halten Deckel und Dackel den Weg zum Tor geschlossen.',
  ],
  stuermer: [
    'Der Stürmer sucht Räume, bindet Angreifer, bringt den Ball vom eigenen Korb weg und startet den Angriff. Dabei geht es nicht nur um Kraft – Timing, Übersicht und das Zusammenspiel mit den Mitspielern sind entscheidend.',
  ],
  ausprobieren: [
    'Jetzt kennst du das Spiel. Wie sich die Bewegung unter Wasser und das Zusammenspiel wirklich anfühlen, erlebst du am besten selbst.',
    'Du brauchst noch keine UWR-Erfahrung. Melde dich für ein Probetraining – wir klären mit dir den Einstieg und was du mitbringen solltest.',
  ],
}

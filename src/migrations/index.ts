import * as migration_20261008_095547_initial from './20261008_095547_initial';

export const migrations = [
  {
    up: migration_20261008_095547_initial.up,
    down: migration_20261008_095547_initial.down,
    name: '20261008_095547_initial'
  },
];

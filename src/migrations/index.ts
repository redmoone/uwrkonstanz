import * as migration_20261008_095547_initial from './20261008_095547_initial';
import * as migration_20261008_145251_training_plan_exceptions from './20261008_145251_training_plan_exceptions';
import * as migration_20261008_175400_team_trainers from './20261008_175400_team_trainers';

export const migrations = [
  {
    up: migration_20261008_095547_initial.up,
    down: migration_20261008_095547_initial.down,
    name: '20261008_095547_initial',
  },
  {
    up: migration_20261008_145251_training_plan_exceptions.up,
    down: migration_20261008_145251_training_plan_exceptions.down,
    name: '20261008_145251_training_plan_exceptions'
  },
  {
    up: migration_20261008_175400_team_trainers.up,
    down: migration_20261008_175400_team_trainers.down,
    name: '20261008_175400_team_trainers'
  },
];

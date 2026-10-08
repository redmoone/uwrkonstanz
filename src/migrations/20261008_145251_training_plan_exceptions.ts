import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`training_breaks\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`reason\` text NOT NULL,
    \`start_date\` text NOT NULL,
    \`end_date\` text,
    \`active\` integer DEFAULT true,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`training_breaks_updated_at_idx\` ON \`training_breaks\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`training_breaks_created_at_idx\` ON \`training_breaks\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`training_breaks_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`training_times_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`training_breaks\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`training_times_id\`) REFERENCES \`training_times\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`training_breaks_rels_order_idx\` ON \`training_breaks_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`training_breaks_rels_parent_idx\` ON \`training_breaks_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`training_breaks_rels_path_idx\` ON \`training_breaks_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`training_breaks_rels_training_times_id_idx\` ON \`training_breaks_rels\` (\`training_times_id\`);`)
  await db.run(sql`ALTER TABLE \`training_times\` ADD \`one_off_date\` text;`)
  await db.run(sql`ALTER TABLE \`training_times\` ADD \`valid_from\` text;`)
  await db.run(sql`ALTER TABLE \`training_times\` ADD \`valid_until\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`training_breaks_id\` integer REFERENCES training_breaks(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_training_breaks_id_idx\` ON \`payload_locked_documents_rels\` (\`training_breaks_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`payload_locked_documents_rels_training_breaks_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`training_breaks_id\`;`)
  await db.run(sql`DROP TABLE \`training_breaks_rels\`;`)
  await db.run(sql`DROP TABLE \`training_breaks\`;`)
  await db.run(sql`ALTER TABLE \`training_times\` DROP COLUMN \`one_off_date\`;`)
  await db.run(sql`ALTER TABLE \`training_times\` DROP COLUMN \`valid_from\`;`)
  await db.run(sql`ALTER TABLE \`training_times\` DROP COLUMN \`valid_until\`;`)
}

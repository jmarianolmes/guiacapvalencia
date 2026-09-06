import { sql } from 'drizzle-orm';
import { getDb } from '../server/db';

const statements = [
  `CREATE TABLE IF NOT EXISTS \`user_error_notebook_items\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`questionId\` int NOT NULL,
    \`chapterId\` varchar(50),
    \`wrongCount\` int NOT NULL DEFAULT 1,
    \`reviewLevel\` int NOT NULL DEFAULT 0,
    \`lastAnswer\` varchar(1),
    \`nextReviewAt\` timestamp NULL,
    \`lastReviewedAt\` timestamp NULL,
    \`resolvedAt\` timestamp NULL,
    \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`user_error_notebook_items_id\` PRIMARY KEY(\`id\`),
    CONSTRAINT \`user_error_notebook_user_question_unique\` UNIQUE(\`userId\`, \`questionId\`)
  )`,
  'CREATE INDEX `user_error_notebook_user_due_idx` ON `user_error_notebook_items` (`userId`, `nextReviewAt`)',
];

async function main() {
  const db = await getDb();
  if (!db) throw new Error('DATABASE_URL não está disponível para aplicar a migração.');

  await db.execute(sql.raw(statements[0]));
  try {
    await db.execute(sql.raw(statements[1]));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate key name|already exists/i.test(message)) throw error;
  }

  const [columns] = await db.execute(sql.raw('SHOW COLUMNS FROM `user_error_notebook_items`'));
  console.log(`Migração aplicada. Colunas encontradas: ${Array.isArray(columns) ? columns.length : 0}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

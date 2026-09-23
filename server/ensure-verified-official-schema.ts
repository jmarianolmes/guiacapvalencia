import { sql } from "drizzle-orm";
import { getDb } from "./db";

async function ensureVerifiedOfficialSchema() {
  const db = await getDb();
  if (!db) throw new Error("Falha de conexão com o banco de dados.");

  // Deliberately creates only the two isolated tables introduced for the
  // homologated official exams. It never runs the legacy migration history.
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS verified_official_questions (
      id int AUTO_INCREMENT NOT NULL,
      sourceId varchar(64) NOT NULL,
      examDate varchar(10) NOT NULL,
      model varchar(20) NOT NULL DEFAULT 'VERIFIED_OFFICIAL',
      questionNumber int NOT NULL,
      subject varchar(50) NOT NULL DEFAULT 'Mercancias',
      question text NOT NULL,
      stem text NOT NULL,
      optionA text NOT NULL,
      optionB text NOT NULL,
      optionC text NOT NULL,
      optionD text NOT NULL,
      correctAnswer varchar(1) NOT NULL,
      isReserve boolean NOT NULL DEFAULT false,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY verified_official_questions_sourceId_unique (sourceId),
      UNIQUE KEY verified_official_questions_exam_number_unique (examDate, questionNumber),
      KEY verified_official_questions_exam_order_idx (examDate, questionNumber)
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS verified_official_corrections (
      id int AUTO_INCREMENT NOT NULL,
      sourceId varchar(64) NOT NULL,
      correctAnswer varchar(1) NOT NULL,
      note text,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY verified_official_corrections_sourceId_unique (sourceId)
    )
  `));

  console.log("Schema isolado das provas homologadas confirmado.");
}

ensureVerifiedOfficialSchema().catch((error) => {
  console.error("Erro ao garantir o schema isolado das provas homologadas:", error);
  process.exitCode = 1;
});

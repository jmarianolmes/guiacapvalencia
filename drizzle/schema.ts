import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Email/Password authentication fields
  passwordHash: text("passwordHash"),
  isApproved: boolean("isApproved").default(false).notNull(),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
  isMaster: boolean("isMaster").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Password reset tokens table
export const passwordResets = mysqlTable("password_resets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

// User access logs table
export const userAccessLogs = mysqlTable("user_access_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // 'login', 'logout', 'view_guide', etc.
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAccessLog = typeof userAccessLogs.$inferSelect;
export type InsertUserAccessLog = typeof userAccessLogs.$inferInsert;

// Simulator questions table
export const simulatorQuestions = mysqlTable("simulator_questions", {
  id: int("id").autoincrement().primaryKey(),
  model: varchar("model", { length: 10 }).notNull(), // A, B, C, etc.
  provaDate: varchar("provaDate", { length: 20 }).notNull(), // "01/02/2025"
  questionNumber: int("questionNumber").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(), // "Mercadorias", "Materiais Comuns", etc.
  question: text("question").notNull(),
  stem: text("stem").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: varchar("correctAnswer", { length: 1 }).notNull(), // A, B, C, D
  normalized: text("normalized"), // Normalized version for search
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("simulator_questions_model_question_idx").on(table.model, table.questionNumber),
  index("simulator_questions_official_date_question_idx").on(table.model, table.provaDate, table.questionNumber),
  uniqueIndex("simulator_questions_model_date_position_unique").on(table.model, table.provaDate, table.questionNumber),
]);

export type SimulatorQuestion = typeof simulatorQuestions.$inferSelect;
export type InsertSimulatorQuestion = typeof simulatorQuestions.$inferInsert;

// Repeated questions table
export const repeatedQuestions = mysqlTable("repeated_questions", {
  id: int("id").autoincrement().primaryKey(),
  percentage: varchar("percentage", { length: 10 }).notNull(), // "33.3%"
  question: text("question").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: text("correctAnswer").notNull(), // Full text of correct answer
  exams: varchar("exams", { length: 255 }).notNull(), // JSON array of exam dates
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RepeatedQuestion = typeof repeatedQuestions.$inferSelect;
export type InsertRepeatedQuestion = typeof repeatedQuestions.$inferInsert;

// Tricks table
export const tricks = mysqlTable("tricks", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  percentage: varchar("percentage", { length: 10 }).notNull(), // "44.4%"
  descriptionPt: text("descriptionPt").notNull(),
  descriptionEs: text("descriptionEs").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Trick = typeof tricks.$inferSelect;
export type InsertTrick = typeof tricks.$inferInsert;

// Siglas table
export const siglas = mysqlTable("siglas", {
  id: int("id").autoincrement().primaryKey(),
  acronym: varchar("acronym", { length: 20 }).notNull().unique(),
  fullName: text("fullName").notNull(),
  descriptionPt: text("descriptionPt").notNull(),
  descriptionEs: text("descriptionEs").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sigla = typeof siglas.$inferSelect;
export type InsertSigla = typeof siglas.$inferInsert;

// User simulator results table
export const userSimulatorResults = mysqlTable("user_simulator_results", {
  id: int("id").autoincrement().notNull(),
  userId: int("userId").notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  mode: varchar("mode", { length: 20 }).default("statistical").notNull(),
  chapterId: varchar("chapterId", { length: 50 }),
  attemptNumber: int("attemptNumber").default(1).notNull(),
  questionCount: int("questionCount").default(100).notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  wrongAnswers: int("wrongAnswers").notNull(),
  blankAnswers: int("blankAnswers").notNull(),
  score: int("score").notNull(), // Score out of 100
  timeTaken: int("timeTaken").notNull(), // In seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("user_simulator_results_user_created_idx").on(table.userId, table.createdAt),
]);

export type UserSimulatorResult = typeof userSimulatorResults.$inferSelect;
export type InsertUserSimulatorResult = typeof userSimulatorResults.$inferInsert;

// Study preferences used to generate a personalized plan on demand.
export const userStudyProfiles = mysqlTable("user_study_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  track: mysqlEnum("track", ["goods", "passengers"]).default("goods").notNull(),
  targetExamDate: varchar("targetExamDate", { length: 10 }), // ISO date: YYYY-MM-DD
  dailyStudyMinutes: int("dailyStudyMinutes").default(60).notNull(),
  planEnabled: boolean("planEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("user_study_profiles_user_unique").on(table.userId),
]);

export type UserStudyProfile = typeof userStudyProfiles.$inferSelect;
export type InsertUserStudyProfile = typeof userStudyProfiles.$inferInsert;

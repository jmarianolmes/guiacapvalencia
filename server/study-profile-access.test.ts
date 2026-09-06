import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(process.cwd());
const source = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('perfil e proteção do conteúdo de estudo', () => {
  it('mantém o perfil em tabela própria com uma única preferência por usuário', () => {
    const schema = source('drizzle/schema.ts');
    const migration = source('drizzle/0008_user_study_profiles.sql');

    expect(schema).toContain('export const userStudyProfiles');
    expect(schema).toContain('uniqueIndex("user_study_profiles_user_unique").on(table.userId)');
    expect(migration).toContain('CREATE TABLE `user_study_profiles`');
    expect(migration).toContain("enum('goods','passengers')");
  });

  it('restringe perguntas e análises detalhadas a procedimentos autenticados', () => {
    const router = source('server/routers.ts');

    expect(router).toContain('getSimulatorQuestions: protectedProcedure');
    expect(router).toContain('getSimulatorQuestionsByChapter: protectedProcedure');
    expect(router).toContain('getOfficialExamAnalysis: protectedProcedure');
    expect(router).toContain('getRepeatedQuestions: protectedProcedure');
    expect(router).toContain('getStudyPlan: protectedProcedure');
  });

  it('valida as opções de perfil e conserva a modalidade Viajantes como reservada', () => {
    const router = source('server/routers.ts');
    const plan = source('server/studyPlan.ts');

    expect(router).toContain("track: z.enum(['goods', 'passengers'])");
    expect(router).toContain('dailyStudyMinutes: z.union([z.literal(40), z.literal(60), z.literal(90)])');
    expect(plan).toContain("status: 'passengers_coming_soon'");
  });

  it('aplica cabeçalhos e limite de taxa no tráfego tRPC', () => {
    const server = source('server/_core/index.ts');

    expect(server).toContain("createRateLimit({ windowMs: 10 * 60 * 1000, maxRequests: 300, keyPrefix: 'trpc' })");
    expect(server).toContain("res.setHeader('Cache-Control', 'no-store, private')");
    expect(server).toContain("res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')");
  });
});

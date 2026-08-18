import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

const projectRoot = path.resolve(process.cwd());
const source = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('fluxo administrativo de acesso', () => {
  it('armazena senhas com hash bcrypt verificável', async () => {
    const passwordHash = await hashPassword('SenhaTemporaria#2026');

    await expect(verifyPassword('SenhaTemporaria#2026', passwordHash)).resolves.toBe(true);
    await expect(verifyPassword('SenhaIncorreta#2026', passwordHash)).resolves.toBe(false);
  });

  it('mantém a troca de senha inicial e a criação de contas no contrato do backend', () => {
    const schema = source('drizzle/schema.ts');
    const auth = source('server/auth.ts');
    const router = source('server/routers.ts');

    expect(schema).toContain('mustChangePassword: boolean("mustChangePassword").default(false).notNull()');
    expect(schema).toContain('isMaster: boolean("isMaster").default(false).notNull()');
    expect(auth).toContain('export async function createUserByAdmin');
    expect(auth).toContain('mustChangePassword: true');
    expect(auth).toContain('export async function changePasswordForUser');
    expect(router).toContain('changePassword: protectedProcedure');
    expect(router).toContain('createUser: protectedProcedure');
  });

  it('protege a conta mestre contra bloqueio e não expõe hashes nas respostas de usuário', () => {
    const database = source('server/db.ts');
    const router = source('server/routers.ts');

    expect(database).toContain('if (targetUser.isMaster)');
    expect(database).toContain('The master account cannot be blocked');
    expect(router).toContain('mustChangePassword: user.mustChangePassword');
    expect(router).not.toContain('passwordHash: user.passwordHash');
  });

  it('permite redefinir senha temporária sem ler o hash e protege exclusões administrativas', () => {
    const auth = source('server/auth.ts');
    const database = source('server/db.ts');
    const router = source('server/routers.ts');

    expect(auth).toContain('export async function resetPasswordByAdmin');
    expect(auth).toContain('mustChangePassword: true');
    expect(auth).toContain('The master account password must be changed from its own session');
    expect(database).toContain('export async function deleteUser');
    expect(database).toContain('The master account cannot be deleted');
    expect(database).toContain('await tx.delete(passwordResets)');
    expect(database).toContain('await tx.delete(userSimulatorResults)');
    expect(router).toContain('resetUserPassword: protectedProcedure');
    expect(router).toContain('deleteUser: protectedProcedure');
    expect(router).toContain('A própria conta administrativa não pode ser excluída nesta sessão');
  });
});

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('recuperação de senha em modo de desenvolvimento', () => {
  it('mantém a orientação operacional documentada e não promete envio externo', () => {
    const projectRoot = path.resolve(process.cwd());
    const setupGuide = fs.readFileSync(path.join(projectRoot, 'ADMIN_SETUP.md'), 'utf8');
    const routerSource = fs.readFileSync(path.join(projectRoot, 'server', 'routers.ts'), 'utf8');

    expect(setupGuide).toContain('modo de desenvolvimento');
    expect(routerSource).toContain('[Password reset - development]');
    expect(routerSource).not.toContain('Link de redefinição de senha enviado para o email.');
  });
});

# Guia CAP Valência Pro — Progresso da Implementação

## Status Geral: Fase 3 (Migração de Dados) em Andamento

### ✅ Fases Concluídas

#### Fase 1: Banco de Dados e Autenticação Backend
- [x] Schema com tabelas: users, password_resets, userAccessLogs
- [x] Funções de hash de senha (bcryptjs)
- [x] Procedures tRPC: register, login, requestPasswordReset, resetPassword
- [x] Integração com sistema de sessão (SDK createSessionToken)
- [x] Geração de openId único para usuários email/senha

#### Fase 2: Páginas de Autenticação Frontend
- [x] Login.tsx: Página de login com email e senha
- [x] Register.tsx: Página de cadastro com validação
- [x] ForgotPassword.tsx: Página para solicitar redefinição
- [x] ResetPassword.tsx: Página para redefinir com token
- [x] Rotas adicionadas ao App.tsx: /login, /register, /forgot-password, /reset-password
- [x] Integração com tRPC e useAuth hook

### 🔄 Fase 3: Extração e Migração de Dados do Guia v1.9 (EM ANDAMENTO)

#### Dados Extraídos do index.html v1.9:
- ✅ 1000 questões do simulador (10 modelos A-J com 100 questões cada)
- ✅ 146 questões repetidas (com percentual de repetição)
- ✅ 21 pegadinhas (com percentual de ocorrência)
- ✅ 18 siglas (com nomes completos e descrições PT/ES)

#### Arquivos Criados:
- `/home/ubuntu/extract_guide_data.py` - Script de extração
- `/home/ubuntu/guia-cap-valencia-pro/server/data/simulator_questions.json` (730KB)
- `/home/ubuntu/guia-cap-valencia-pro/server/data/repeated_questions.json` (82KB)
- `/home/ubuntu/guia-cap-valencia-pro/server/data/tricks.json`
- `/home/ubuntu/guia-cap-valencia-pro/server/data/siglas.json`

#### Tabelas de Banco de Dados Criadas:
- `simulator_questions`: 1000 registros (14 colunas)
- `repeated_questions`: 146 registros (10 colunas)
- `tricks`: 21 registros (6 colunas)
- `siglas`: 18 registros (6 colunas)
- `user_simulator_results`: Para rastrear resultados dos usuários

#### Próximas Ações:
1. Executar seed script para importar dados JSON para o banco
2. Criar procedures tRPC para servir dados (guide.getSimulator, guide.getRepeated, etc.)
3. Criar páginas React para exibir os dados (GuideOverview, SimulatorPage, etc.)
4. Implementar bilíngue PT/ES nas páginas

### ⏳ Fases Pendentes

#### Fase 4: Implementação das Abas do Guia
- [ ] Página Visão Geral (gráficos, estatísticas)
- [ ] Página Estratégia (simulador de pontuação)
- [ ] Página Questões Repetidas
- [ ] Página Pegadinhas
- [ ] Página Cola de Estudo (tabelas)
- [ ] Página Siglas
- [ ] Página Simulado (10 modelos)
- [ ] Proteção de rotas com autenticação

#### Fase 5: Painel Administrativo
- [ ] Dashboard admin com lista de usuários
- [ ] Funcionalidade de aprovar usuários
- [ ] Funcionalidade de bloquear/desbloquear
- [ ] Visualizar logs de acesso
- [ ] Estatísticas de uso

#### Fase 6: Sistema Bilíngue (PT/ES) e Rodapé
- [ ] Implementar toggle PT/ES
- [ ] Traduzir todos os menus e títulos
- [ ] Adicionar rodapé com créditos "João Mariano L. Macedo"
- [ ] Adicionar aviso "Proibida a reprodução"

#### Fase 7: Testes e Publicação
- [ ] Testar fluxo completo
- [ ] Criar checkpoint final
- [ ] Publicar

## Estrutura de Dados

### Estrutura de Questão do Simulador
```json
{
  "prova": "01/02/2025",
  "q_num": 1,
  "materia": "Mercadorias",
  "question": "...",
  "stem": "...",
  "options": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "answer": "A",
  "normalized": "..."
}
```

### Estrutura de Questão Repetida
```json
{
  "percentage": "33.3%",
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "C) ...",
  "exams": ["01/02/2025", "19/07/2025", "27/09/2025"]
}
```

### Estrutura de Pegadinha
```json
{
  "title": "⚠️ Proibição de Carga/Descarga",
  "percentage": "55.6%",
  "description_pt": "...",
  "description_es": "..."
}
```

### Estrutura de Sigla
```json
{
  "acronym": "CAP",
  "full_name": "Certificado de Aptitud Profesional",
  "description_pt": "...",
  "description_es": "..."
}
```

## Próximos Comandos

```bash
# 1. Importar dados para o banco
cd /home/ubuntu/guia-cap-valencia-pro
node server/seed-guide-data.mjs

# 2. Verificar dados importados
pnpm drizzle-kit studio

# 3. Criar procedures tRPC
# Editar server/routers.ts para adicionar guide router

# 4. Criar páginas React
# Criar client/src/pages/Guide.tsx, SimulatorPage.tsx, etc.

# 5. Criar checkpoint
# webdev_save_checkpoint
```

## Notas Importantes

- Todos os dados foram extraídos com sucesso do HTML v1.9
- As tabelas foram criadas com sucesso no banco de dados
- O próximo passo é executar o seed script para importar os dados JSON
- A estrutura de dados foi preservada do original para manter compatibilidade
- Bilíngue PT/ES já está nos dados (description_pt, description_es)

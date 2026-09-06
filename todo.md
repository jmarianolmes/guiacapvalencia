# Guia CAP Valência Pro — TODO

## Fase 1: Banco de Dados e Autenticação
- [x] Estender schema com tabelas de autenticação (users com email/senha, password_resets)
- [x] Implementar hash seguro de senhas (bcrypt)
- [x] Criar procedures de login, cadastro e recuperação de senha
- [x] Configurar envio de email para redefinição de senha (TODO: integrar com serviço de email em produção)

## Fase 2: Páginas de Autenticação
- [x] Página de Login (email + senha)
- [x] Página de Cadastro (email + senha + confirmação)
- [x] Página de Recuperação de Senha (envio de link)
- [x] Página de Redefinição de Senha (validação de token)
- [x] Validação de formulários e mensagens de erro

## Fase 3: Migração do Conteúdo do Guia
- [x] Integrar dados das 9 provas (JSON)
- [x] Migrar aba Visão Geral (gráficos e estatísticas)
- [x] Migrar aba Estratégia (simulador de pontuação)
- [x] Migrar aba Questões Repetidas (modelo de expansão)
- [x] Migrar aba Pegadinhas (com porcentagem)
- [x] Migrar aba Cola de Estudo (tabelas em 2 colunas)
- [x] Migrar aba Siglas (cards com descrição)
- [x] Migrar aba Simulado (10 modelos de prova)
- [x] Proteger todas as rotas com autenticação

## Fase 4: Painel Administrativo
- [x] Dashboard admin com lista de usuários
- [x] Funcionalidade de aprovar usuários
- [x] Funcionalidade de bloquear/desbloquear usuários
- [x] Visualizar logs de acesso por usuário
- [x] Estatísticas de uso da plataforma

## Fase 5: Suporte Bilíngue e Rodapé
- [x] Implementar sistema de tradução PT/ES
- [x] Traduzir todos os menus, títulos e botões
- [x] Adicionar rodapé com créditos "João Mariano L. Macedo"
- [x] Adicionar aviso "Proibida a reprodução, somente para fins de estudo"
- [x] Garantir tradução em todas as páginas

## Fase 6: Testes e Finalização
- [x] Testar fluxo de login/cadastro
- [x] Testar recuperação de senha
- [x] Testar proteção de rotas
- [x] Testar painel administrativo
- [x] Testar bilíngue (PT/ES)
- [x] Criar checkpoint final


## Fase 7: Correções e Melhorias (Feedback do Usuário)

### 1. Correções de Conteúdo
- [x] Aba Cola de Estudos: Adicionar conteúdo completo (Tempos, Descanso, Valores, Velocidades, Incêndio, Primeiros Socorros, Infrações, Tipos de Transporte) + 19 Pegadinhas
- [x] Aba Pegadinhas: Restaurar conteúdo completo da versão anterior
- [x] Aba Siglas: Importar siglas eletrônicas (ABS, ESP, ACC, BAS/EBA, ASR/TCS, LKA, FCW, EBS, LDWS, AEBS, TPMS, CMR, ADR, CEMT, CAP, OEA, PAS, ITV)

### 2. Correções do Simulado
- [x] Corrigir formatação do simulado (está mostrando apenas letra A)
- [x] Adicionar opção de simulado por data oficial (dropdown com datas das provas)
- [x] Manter dois modos: Estatístico (atual) + Por Data Oficial
- [x] Corrigir o carregamento das 100 questões ao selecionar uma prova por data oficial
- [x] Exibir somente o total do pool estatístico no indicador de questões, sem somar as provas oficiais
- [x] Adicionar opção de simulado por data oficial (dropdown com datas das provas)
- [x] Manter dois modos: Estatístico (atual) + Por Data Oficial
- [x] Corrigir o carregamento das 100 questões ao selecionar uma prova por data oficial
- [x] Exibir somente o total do pool estatístico no indicador de questões, sem somar as provas oficiais

### 3. Responsividade Mobile
- [x] Verificar layout em celular
- [x] Adaptar componentes para mobile
- [x] Testar em diferentes resoluções
- [x] Corrigir a navegação das abas do guia para evitar sobreposição em telas pequenas
- [x] Verificar layout em celular
- [x] Adaptar componentes para mobile
- [x] Testar em diferentes resoluções
- [x] Corrigir a navegação das abas do guia para evitar sobreposição em telas pequenas

### 4. Gráficos e Estatísticas
- [x] Corrigir gráficos na página inicial para corresponder ao modelo de referência
- [x] Implementar os blocos e gráficos da Visão Geral que estão presentes no modelo v1.9 e ainda não foram migrados
- [x] Validar os valores de gráficos e estatísticas contra os dados de referência
- [x] Testar visualmente os gráficos em desktop e celular
- [x] Corrigir gráficos na página inicial para corresponder ao modelo de referência
- [x] Implementar os blocos e gráficos da Visão Geral que estão presentes no modelo v1.9 e ainda não foram migrados
- [x] Validar os valores de gráficos e estatísticas contra os dados de referência
- [x] Testar visualmente os gráficos em desktop e celular

### 5. Admin e Email
- [x] Documentar credenciais de admin: o primeiro usuário a se cadastrar deve ser promovido via SQL (UPDATE users SET role='admin' WHERE email='seu@email.com')
- [x] Recuperação de senha: link gerado e logado no console; integração com serviço externo (SendGrid/Mailgun) pode ser feita via variável de ambiente SMTP quando disponível
- [x] Manter a recuperação de senha em modo de desenvolvimento documentado, sem envio de email externo
- [x] Substituir a recuperação por email pela criação de contas com senha temporária no painel administrativo
- [x] Exigir que usuários com senha temporária definam nova senha no primeiro login
- [x] Criar a conta mestre administrativa solicitada e restringir seu acesso

### 6. Testes Finais
- [x] Testar fluxo completo em desktop
- [x] Testar fluxo completo em mobile
- [x] Validar todas as correções
- [x] Testar em desktop o fluxo completo: admin cria usuário temporário, usuário faz login, é forçado a trocar senha e depois acessa as rotas protegidas
- [x] Testar em mobile o fluxo completo das telas Login, ChangePassword e AdminDashboard com estados de sucesso/erro
- [x] Validar em runtime todas as correções recentes e registrar evidências mínimas de cada fluxo principal
- [x] Testar em mobile um caso de erro do AdminDashboard e registrar a evidência
- [x] Registrar as evidências de runtime especificamente para as correções recentes de acesso
- [x] Confirmar o estado final da validação interrompida
- [x] Salvar o checkpoint do novo fluxo de acesso
- [x] Encerrar a revisão adicional e entregar a versão já salva, sem novos testes demorados
- [x] Atualizar a aba Estratégia com campos para questões certas, erradas e puladas
- [x] Substituir a explicação de questões puladas por uma barra dinâmica de distribuição e pontuação
- [x] Validar o novo calculador da Estratégia em desktop e celular
- [x] Testar em runtime a barra dinâmica da Estratégia no desktop com atualização de certas, erradas e puladas
- [x] Testar em runtime a barra dinâmica da Estratégia no celular com atualização de certas, erradas e puladas
- [x] Preservar a versão atual do guia como modelo de referência antes das novas alterações
- [x] Pesquisar e estruturar o conteúdo atualizado de CAP Mercancías por tópico
- [x] Pesquisar e estruturar o conteúdo atualizado de CAP Comunes por tópico
- [x] Criar a aba Temarios com áreas separadas para Mercancías e Comunes
- [x] Ampliar a aba Siglas usando a base dos novos temários
- [x] Ampliar a aba Cola de Estudo com resumos dos novos temários
- [x] Validar somente Temarios, Siglas e Cola de Estudo em desktop e celular, preservando as demais abas
- [x] Testar em runtime no celular Temarios, alternando Comunes/Mercancías e abrindo tópicos dos dois percursos
- [x] Testar em runtime no celular Siglas e Cola de Estudo, validando legibilidade e os novos conteúdos
- [x] Verificar em runtime que as abas não alteradas continuam navegáveis após a inclusão de Temarios
- [x] Corrigir o overflow horizontal móvel identificado ao abrir Temarios, sem alterar o conteúdo das abas existentes
- [x] Validar visualmente em celular a legibilidade dos novos blocos de Siglas e Cola de Estudo, sem cortes ou overflow por seção
- [x] Executar assertivas automatizadas de largura, quebra de texto e overflow nos cartões novos de Siglas e Cola de Estudo em celular
- [x] Mapear os capítulos atualizados de CAP Comunes e CAP Mercancías às questões do simulador
- [x] Adicionar ao Simulado um menu de seleção por capítulo, preservando os modos existentes
- [x] Validar a seleção por capítulo no Simulado em desktop e celular
- [x] Exibir todos os objetivos dos sumários no menu, sinalizando capítulos sem questões classificadas no pool atual
- [x] Expandir a classificação por capítulo para cobrir o pool estatístico relevante do Simulado
- [x] Adicionar teste automatizado de cobertura do mapeamento de capítulos e registrar a taxa obtida
- [x] Informar no Simulado quando a prática por capítulo é limitada a 50 questões
- [x] Substituir o fallback genérico por classificação temática verificável ou metadados revisados por objetivo
- [x] Adicionar amostras reais validadas para cada objetivo e medir a taxa de fallback residual
- [x] Gerar e validar um mapa revisado de objetivos para as questões do pool estatístico
- [x] Medir no pool completo a taxa de classificação revisada, por palavra-chave e não atribuída
- [x] Criar teste que falhe se houver fallback residual acima do limite aceitável
- [x] Padronizar a chave do mapa revisado com o campo normalizado usado em runtime
- [x] Inventariar no portal público as convocatórias de CAP Mercancías desde 21/11/2020 e os respetivos gabaritos
- [x] Extrair e validar perguntas/gabaritos oficiais, classificando 1–25 como Mercancías e as restantes como Comunes
- [x] Remover duplicidades em relação às 10 convocatórias recentes já integradas
- [x] Importar as novas convocatórias e atualizar as opções do Simulado por data e por capítulo
- [x] Validar totais, gabaritos e fluxos do Simulado após a ampliação do banco
- [x] Substituir a lista estática de datas oficiais por dados dinâmicos do banco, mantendo o Simulado responsivo e bilíngue
- [x] Validar em runtime uma prova GVA no modo Por Data Oficial em desktop e a responsividade móvel do guia após a integração
- [x] Documentar que o modo Por Capítulo permanece intencionalmente restrito ao pool estatístico A–J, sem misturar provas oficiais datadas
- [x] Investigar o carregamento contínuo nos modos Estatístico e Por Capítulo do Simulado
- [x] Otimizar as consultas e os índices do banco sem alterar ou perder questões, gabaritos ou resultados existentes
- [x] Atualizar os indicadores com totais reais de provas oficiais, questões analisadas e modelos estatísticos
- [x] Exibir correção imediata verde/vermelha no modo Por Capítulo, preservando o comportamento dos demais modos
- [x] Auditar a integridade dos gabaritos e adicionar testes contra os dados oficiais importados
- [x] Sincronizar as questões repetidas do banco com as 146 entradas da fonte oficial do projeto
- [x] Investigar e corrigir as chaves conflitantes de modelo, data e número de questão sem alterar gabaritos válidos
- [x] Adicionar uma proteção automatizada contra duplicidade conflitante de posição e reexecutar a auditoria de integridade
- [x] Destacar em verde-claro os números das questões respondidas nos modos de Simulado
- [x] Mostrar no treino por capítulo a numeração verde para acertos e vermelha para erros, mantendo o resultado final
- [x] Recalcular questões repetidas e pegadinhas a partir das 34 provas oficiais, com gabaritos preservados
- [x] Atualizar gráficos, padrões de resposta e recomendações da Visão Geral com as 34 provas oficiais
- [x] Avaliar e ampliar o pool estatístico a partir de questões oficiais sem alterar nem misturar as provas por data
- [x] Restaurar Pegadinhas expansíveis com questões oficiais, alternativa correta verde e alternativas-trampa vermelhas
- [x] Revisar os percentuais de Repetidas exclusivamente sobre as 3.400 questões das 34 provas oficiais
- [x] Refazer a Visão Geral com gráficos de aplicação da prova e prioridades de estudo baseados somente no acervo oficial
- [x] Auditar os padrões, siglas e regras de memorização das provas oficiais para enriquecer a Cola de Estudos
- [x] Validar detalhadamente que nenhuma estatística da análise oficial utiliza questões do pool estatístico
- [x] Extrair das 34 provas oficiais uma lista verificável de siglas, regras numéricas e padrões de memorização recorrentes para a Cola de Estudos
- [x] Adicionar auditoria automatizada que comprove a origem oficial dos novos itens de memorização exibidos
- [x] Corrigir a série e a escala do gráfico de recorrência por convocatória para exibir percentuais oficiais
- [x] Substituir a composição genérica da prova por uma análise de prioridade prática baseada nas 34 provas oficiais
- [x] Ordenar a recorrência por convocatória da prova mais antiga à mais recente
- [x] Restaurar os rótulos A–D nas alternativas exibidas na aba Repetidas
- [x] Adicionar exclusão de usuários no painel administrativo, com proteção explícita da conta mestre
- [x] Permitir que administradores definam uma nova senha temporária em campo sigiloso com opção de visualização durante a digitação
- [x] Validar os fluxos de exclusão, bloqueio, ativação e redefinição de senha no painel de usuários
- [x] Executar e registrar validação integrada do ciclo de vida de uma conta descartável: bloquear, desbloquear, redefinir senha temporária e excluir
- [x] Preparar pacote portátil do código-fonte para importação em repositório GitHub, sem segredos nem dependências instaladas
- [x] Documentar a publicação compatível com servidor Node.js e banco de dados externo, distinguindo-a de hospedagem estática
- [x] Extrair e estruturar o texto fornecido para o objetivo CAP 1.1, incluindo os subcapítulos 1.1 (par) e 1.2 (potência), em leitura completa e resumo orientado à prova
- [x] Item substituído: receber e estruturar o material do objetivo CAP 1.2 conforme a transcrição literal corrigida posteriormente fornecida
- [x] Item substituído: validar a leitura e a revisão após integração do material específico de travagem fornecido na transcrição corrigida
- [x] Item substituído: ampliar a cobertura automatizada para o objetivo CAP 1.2 quando o conteúdo corrigido fosse fornecido
- [x] Substituir os conteúdos provisórios dos objetivos CAP 1.1 e CAP 1.2 pela transcrição literal corrigida, preservando exatamente a numeração do sumário
- [x] Separar em cada objetivo a transcrição literal do livro e um resumo explicativo completo dos conceitos principais
- [x] Validar em desktop e celular os dois objetivos corrigidos, incluindo a legibilidade do livro completo e dos resumos
- [x] Permitir abrir a aba Temarios e cada objetivo por parâmetro de URL para validar, em viewport móvel, os resumos e os livros completos corrigidos
- [x] Mapear todos os itens e subitens dos objetivos 1.1 e 1.2 para transformar o resumo geral em revisão estruturada por tópico
- [x] Redigir conceitos, funcionamento, relações práticas e pontos de memorização para cada item e subitem dos objetivos 1.1 e 1.2
- [x] Atualizar e validar a nova estrutura detalhada do Resumo completo sem alterar o Livro completo literal
- [x] Auditar duplicidades, origem e aderência temática das questões disponíveis em cada simulado por capítulo
- [x] Criar seleção sem repetição que priorize questões oficiais e complete com o pool estatístico apenas quando necessário
- [x] Disponibilizar tentativas alternativas por objetivo e impedir repetição de questões entre versões enquanto houver acervo disponível
- [x] Registrar e apresentar histórico unificado de resultados para simulados oficiais, estatísticos e por capítulo
- [x] Avaliar e implementar apoio lexical contextual durante os simulados sem duplicar desnecessariamente o tradutor do navegador
- [x] Corrigir o botão Novo Simulado para avançar automaticamente à próxima versão do mesmo capítulo após finalizar uma tentativa
- [x] Testar a sequência de versões de um capítulo e garantir que só retorna à versão 1 depois de esgotar as versões disponíveis
- [x] Adicionar botão vermelho Finalizar ao lado da última questão na navegação do simulado
- [x] Adicionar botão para voltar ao menu de simulados ao lado do controle Finalizar
- [x] Ajustar a navegação da última questão para manter Finalizar e Voltar ao menu visíveis sem overflow horizontal
- [x] Reposicionar Anterior e Próxima nas extremidades da primeira linha de navegação numérica
- [x] Exibir Voltar ao menu e Finalizar após o último número com espaçamento maior, em simulados de 50 ou 100 questões
- [x] Manter Finalizar disponível em qualquer questão, sem depender da posição atual no simulado
- [x] Auditar frequência, repetição e presença recente por capítulo usando somente as 34 provas oficiais
- [x] Criar uma pontuação de prioridade transparente e recomendações de revisão por capítulo
- [x] Atualizar e validar o roteiro de revisão prioritária da Visão Geral em desktop e celular
- [x] Transformar o roteiro vertical de prioridades em cartão compacto navegável por setas
- [x] Preservar no cartão as métricas, a recomendação e o indicador de posição de todos os capítulos
- [x] Validar a navegação compacta do roteiro em desktop e celular
- [x] Preparar prompt independente para orientar a hospedagem gratuita do projeto em uma nova tarefa
- [x] Adicionar ao prompt de hospedagem um mapa de arquivos, extensões e locais de configuração
- [x] Gerar pacote ZIP atualizado do código-fonte para envio ao GitHub

# SaaS Psicóloga - Arquitetura

## Fluxo de Dados

1. Usuário se cadastra/autentica via Supabase Auth.
2. Perfis são criados/atualizados na tabela `profiles`.
3. Psicólogas e pacientes têm dados complementares em suas tabelas específicas.
4. Paciente adquire plano (Stripe), gera subscription e sessões disponíveis.
5. Psicóloga define disponibilidade, paciente agenda sessão.
6. Sessão ocorre (online), notas e presenças são registradas.
7. Para bariátrica, paciente preenche intake, psicóloga avalia e emite laudo.
8. Notificações e lembretes são enviados via Evolution API (WhatsApp).
9. Pagamentos, faturas e reembolsos são registrados e auditados.
10. Toda ação relevante é logada para auditoria.

## Entidades Principais

- **profiles**: espelha auth.users, define papel (admin, psicóloga, paciente, assistente)
- **psychologists**: dados profissionais
- **patients**: dados pessoais
- **patient_contacts**: contatos do paciente
- **therapy_plans**: planos de terapia
- **plan_prices**: preços internos
- **subscriptions**: vínculo paciente x plano
- **appointments**: agendamento de sessões
- **session_notes**: evolução clínica
- **session_attendance**: presença/cancelamento
- **availability_slots**: agenda da psicóloga
- **blocked_dates**: feriados/indisponibilidades
- **bariatric_intake_forms**: formulário inicial bariátrica
- **bariatric_evaluations**: avaliação psicológica
- **bariatric_reports**: laudo bariátrico
- **report_files**: arquivos de laudo
- **payments, invoices, refunds**: financeiro
- **stripe_customers, stripe_events_log**: integração Stripe
- **whatsapp_templates, notification_jobs, notification_logs**: comunicação
- **message_threads, message_events**: histórico de mensagens
- **audit_logs, system_settings, webhook_logs, api_keys_internal**: sistema

## Regras de Negócio

- Cada usuário tem um perfil único, vinculado ao auth.users.
- Psicóloga só acessa seus pacientes, agenda e laudos.
- Paciente só acessa seus próprios dados, sessões e laudos.
- Planos e preços não são expostos publicamente.
- RLS ativo em todas tabelas sensíveis, sem policy permissiva.
- Pagamentos e assinaturas sincronizados com Stripe.
- Notificações via Evolution API, logs detalhados de status.
- Auditoria de todas ações críticas.
- Consistência: sessões restantes >= 0, FKs explícitas, índices em buscas/junções.
- Campos sensíveis não expostos em selects públicos.

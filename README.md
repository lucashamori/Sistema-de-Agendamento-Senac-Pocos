# LabManager - Sistema de Agendamento de Salas e Laboratórios

![Status](https://img.shields.io/badge/Status-Concluído-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)
![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F)

## 📖 Sobre o Projeto

O **Sistema de Agendamento de Salas** é uma Aplicação Web Progressiva (PWA) desenvolvida para modernizar e centralizar a gestão de agendamentos de laboratórios e recursos didáticos. O projeto foi concebido para substituir o uso de planilhas manuais, mitigando problemas críticos como duplicidade de reservas, falta de integridade de dados e ausência de mobilidade para os docentes[cite: 2, 3].

A solução foca em **"Security by Design"** e alta performance, utilizando uma arquitetura moderna baseada em Serverless e renderização híbrida.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído sobre uma stack moderna, priorizando escalabilidade e tipagem estática[cite: 25, 27]:

- **Frontend:** React, Next.js 14 (App Router), Tailwind CSS, Shadcn/ui.
- **Backend:** Next.js Server Actions (arquitetura sem API exposta).
- **Banco de Dados:** PostgreSQL (Serverless via Neon Tech).
- **ORM:** Drizzle ORM (Type-safe).
- **Autenticação:** Firebase Auth (Google Provider) + RBAC Customizado.
- **Infraestrutura:** Vercel (Edge Network) + Integração CI/CD.

---

## ✨ Funcionalidades Principais

### 📅 Agendamento Inteligente
- **Validação em Tempo Real:** O sistema verifica conflitos de horário no banco de dados antes de efetivar qualquer reserva[cite: 13].
- **Agendamento em Lote:** Permite reservar uma sala para múltiplos dias ou semanas recorrentes em uma única operação.
- **Feedback Visual:** Uso de cores para distinguir turnos (Manhã/Tarde/Noite) e estados (Pendente/Confirmado) [cite: 251-255].

### 🛡️ Controle de Acesso e Segurança (RBAC)
O sistema implementa uma separação estrita entre autenticação (quem você é) e autorização (o que você pode fazer)[cite: 140]:
- **Administrador:** Gerenciamento total (CRUD), aprovação de reservas e relatórios.
- **Coordenador:** Visualização ampliada e gestão de equipamentos.
- **Docente:** Solicitação de agendamentos e checklist de uso.

### 📱 Experiência do Usuário
- **Design Responsivo:** Interface adaptável para desktops e dispositivos móveis.
- **Soft Delete:** Exclusão lógica de usuários e registros para manter histórico e integridade referencial[cite: 195].
- **Login Institucional:** Integração com Google/Firebase para acesso facilitado[cite: 16].

---

## 🏗️ Arquitetura e Engenharia de Dados

### Modelagem de Dados
O banco de dados relacional foi normalizado para garantir a integridade. []As principais entidades incluem [cite: 58-91]:
- **Agendamentos:** Núcleo do sistema, com timestamps precisos e status (Pendente, Confirmado).
- **Usuários & Perfis:** Vínculo lógico entre o UID do Firebase e as permissões locais.
- **Infraestrutura:** Tabelas para Unidades, Salas e Equipamentos interligadas.

### Server Actions
Diferente de APIs REST tradicionais, o projeto utiliza **Server Actions** do Next.js. Isso permite que o código de backend (como queries ao banco de dados) seja executado diretamente no servidor, garantindo segurança e eliminando a necessidade de gerenciar endpoints públicos.

---

## 🤝 Contexto do Projeto
Este projeto foi desenvolvido originalmente como um Projeto Integrador no Senac Minas.

### Minha Atuação:
Atuei como Full Stack Developer e Scrum Master, sendo responsável por:

- Definição da arquitetura Next.js e integração com Neon DB.
- Implementação das regras de negócio de agendamento e validação de conflitos.
- Configuração do pipeline de CI/CD na Vercel.
- Modelagem do banco de dados e migrações com Drizzle ORM.



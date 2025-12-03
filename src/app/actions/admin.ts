'use server'

import { db } from "@/db";
import { usuarios, unidades } from "@/db/migrations/schema";
import { eq } from "drizzle-orm";

// 1. Busca as unidades para preencher o Select do formulário
export async function listarUnidades() {
  return await db.select().from(unidades);
}

// 2. Salva os dados no Neon após o Firebase criar o usuário
export async function cadastrarDocenteNoBanco(
  uid: string, 
  nome: string, 
  email: string, 
  idUnidade: number
) {
  try {
    // PERFIL FIXO: 2 (Docente)
    const ID_PERFIL_DOCENTE = 2; 

    await db.insert(usuarios).values({
      uidFirebase: uid,
      nome: nome,
      email: email,
      idUnidade: idUnidade,
      idPerfil: ID_PERFIL_DOCENTE, // <--- AQUI ESTÁ A LÓGICA
      // matricula: "DOC-" + Math.floor(Math.random() * 1000) // Opcional: Gerar matrícula
    });

    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao salvar docente no banco:", error);
    return { sucesso: false, erro: "Erro ao vincular dados no sistema." };
  }
}
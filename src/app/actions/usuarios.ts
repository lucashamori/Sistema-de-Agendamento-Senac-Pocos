"use server"

import { db } from "@/db";
import { usuarios, perfis, unidades } from "@/db/migrations/schema"; // Importando unidades
import { asc, eq, ilike, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { adminAuth } from "@/lib/firebase-admin"

type FiltrosUsuario = {
  term?: string;
  perfil?: string;
  status?: string;
}

export async function getUsuariosAction(filtros?: FiltrosUsuario) {
  try {
    let query = db
      .select({
        id: usuarios.idUsuario,
        nome: usuarios.nome,
        email: usuarios.email,
        ativo: usuarios.ativo,
        idPerfil: usuarios.idPerfil,
        nomePerfil: perfis.descricaoPerfil,
        departamento: usuarios.departamento,
        // 1. Buscando dados da Unidade
        idUnidade: usuarios.idUnidade, 
        nomeUnidade: unidades.descricaoUnidade, 
      })
      .from(usuarios)
      .leftJoin(perfis, eq(usuarios.idPerfil, perfis.idPerfil))
      // 2. Join com tabela Unidades
      .leftJoin(unidades, eq(usuarios.idUnidade, unidades.idUnidade))
      .$dynamic();

    const conditions = [];

    if (filtros?.term) {
      conditions.push(
        or(
          ilike(usuarios.nome, `%${filtros.term}%`),
          ilike(usuarios.email, `%${filtros.term}%`)
        )
      );
    }

    if (filtros?.perfil && filtros.perfil !== "all") {
      conditions.push(eq(usuarios.idPerfil, Number(filtros.perfil)));
    }

    if (filtros?.status && filtros.status !== "all") {
      const isAtivo = filtros.status === "ativo";
      conditions.push(eq(usuarios.ativo, isAtivo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const data = await query.orderBy(asc(usuarios.nome));
    return data;

  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

// 3. Atualizado para receber e salvar idUnidade
export async function updateUsuarioAction(id: number, data: { 
    nome: string; 
    email: string; 
    idPerfil: number; 
    idUnidade: number; // Campo obrigatório
    departamento?: string | null 
}) {
  try {
    await db
      .update(usuarios)
      .set({
        nome: data.nome,
        email: data.email,
        idPerfil: data.idPerfil,
        idUnidade: data.idUnidade, // Salva a nova unidade
        departamento: data.departamento 
      })
      .where(eq(usuarios.idUsuario, id));

    revalidatePath("/cadastroUsuarios/exibirUsuarios");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: "Erro ao atualizar usuário." };
  }
}

export async function toggleStatusUsuarioAction(id: number, novoStatus: boolean) {
  try {
    await db
      .update(usuarios)
      .set({ ativo: novoStatus })
      .where(eq(usuarios.idUsuario, id));

    revalidatePath("/cadastroUsuarios/exibirUsuarios");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    return { success: false, error: "Erro ao alterar status do usuário." };
  }
}

export async function deleteUsuarioAction(id: number) {
  try {
    const usuarioParaDeletar = await db
      .select({ uid: usuarios.uidFirebase })
      .from(usuarios)
      .where(eq(usuarios.idUsuario, id))
      .limit(1);

    if (!usuarioParaDeletar.length) {
      throw new Error("Usuário não encontrado no banco.");
    }

    const uid = usuarioParaDeletar[0].uid;

    if (uid) {
      try {
        await adminAuth.deleteUser(uid);
        console.log(`Usuário ${uid} excluído do Firebase.`);
      } catch (firebaseError) {
        console.error("Erro ao excluir do Firebase:", firebaseError);
      }
    }

    await db.delete(usuarios).where(eq(usuarios.idUsuario, id));

    revalidatePath("/cadastroUsuarios/exibirUsuarios");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    throw new Error("Falha ao excluir usuário.");
  }
}

export async function getPerfisOptionsAction() {
    return await db.select().from(perfis);
}
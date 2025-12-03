"use client"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { cadastrarDocenteNoBanco } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Tipagem para receber as unidades do banco
interface FormularioDocenteProps {
  unidadesDisponiveis: {
    idUnidade: number;
    descricaoUnidade: string;
  }[]
}

export function FormularioDocente({ unidadesDisponiveis }: FormularioDocenteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      if (!unidadeSelecionada) throw new Error("Selecione uma unidade.")

      // 1. Cria no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // 2. Salva no Neon (Postgres) como Docente
      const resultado = await cadastrarDocenteNoBanco(
        uid, 
        nome, 
        email, 
        Number(unidadeSelecionada)
      )

      if (!resultado.sucesso) {
        throw new Error(resultado.erro)
      }

      alert("Docente cadastrado com sucesso!")
      router.push("/dashboard") // Ou limpar o form

    } catch (error: any) {
      console.error(error)
      let msg = "Erro ao cadastrar."
      if (error.code === 'auth/email-already-in-use') msg = "E-mail já cadastrado."
      if (error.code === 'auth/weak-password') msg = "A senha deve ter pelo menos 6 caracteres."
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Novo Docente</CardTitle>
        <CardDescription>
          Crie uma conta para um professor acessar o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" name="nome" placeholder="Ex: Carlos Silva" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Corporativo</Label>
            <Input id="email" name="email" type="email" placeholder="carlos@senac.com.br" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unidade">Unidade de Lotação</Label>
            <Select onValueChange={setUnidadeSelecionada} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {unidadesDisponiveis.map((unidade) => (
                  <SelectItem key={unidade.idUnidade} value={String(unidade.idUnidade)}>
                    {unidade.descricaoUnidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Senha Provisória</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Docente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
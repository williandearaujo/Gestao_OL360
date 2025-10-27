"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Employee, EmployeeFormData } from "./types";
import { api } from "@/lib/api";
import { OLButton } from "@/components/ui/OLButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { OLModal } from "@/components/ui/OLModal";

interface EmployeeFormProps {
  employee?: Employee; // Para modo de edição
}

// Este é o nosso formulário ÚNICO e padronizado
export default function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter();
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: "", message: "" });

  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!employee;

  // Estados para carregar os dropdowns
  const [managers, setManagers] = useState<{ id: string; nome_completo: string }[]>(
    []
  );
  const [areas, setAreas] = useState<{ id: string; nome: string }[]>([]);
  const [teams, setTeams] = useState<{ id: string; nome: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    defaultValues: isEditMode
      ? {
          nome_completo: employee.nome_completo,
          email: employee.email,
          email_pessoal: employee.email_pessoal,
          telefone: employee.telefone,
          telefone_pessoal: employee.telefone_pessoal,
          data_nascimento: employee.data_nascimento
            ? new Date(employee.data_nascimento).toISOString().split("T")[0]
            : "",
          data_admissao: employee.data_admissao
            ? new Date(employee.data_admissao).toISOString().split("T")[0]
            : "",
          cargo: employee.cargo,
          senioridade: employee.senioridade,
          cpf: employee.cpf,
          rg: employee.rg,
          endereco: employee.endereco,
          contato_emergencia: employee.contato_emergencia,
          // IDs para os selects
          area_id: employee.area_id || "",
          team_id: employee.team_id || "",
          manager_id: employee.manager_id || "",
        }
      : {
          status: "ATIVO", // Valor padrão para novos
        },
  });

  // Buscar dados para os dropdowns (Gerentes, Áreas, Times)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [managersRes, areasRes, teamsRes] = await Promise.all([
          api.get("/managers/"),
          api.get("/areas/"),
          api.get("/teams/"),
        ]);
        setManagers(managersRes.data);
        setAreas(areasRes.data);
        setTeams(teamsRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados para formulário:", error);
        setModal({
          show: true,
          title: "Erro de Conexão",
          message:
            "Não foi possível carregar os dados para os campos de seleção (Gerentes, Áreas, Times). Verifique o backend.",
        });
      }
    };
    fetchData();
  }, []);

  const onSubmit: SubmitHandler<EmployeeFormData> = async (data) => {
    setIsLoading(true);
    // Limpar valores nulos ou vazios que o backend não espera
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== null && v !== "" && v !== undefined
      )
    );

    try {
      if (isEditMode) {
        // Modo Edição
        await api.put(`/employees/${employee.id}`, cleanData);
        setModal({
          show: true,
          title: "Sucesso!",
          message: "Colaborador atualizado com sucesso.",
        });
        // Atraso para o usuário ver a mensagem antes de voltar
        setTimeout(() => router.push("/dashboard/colaboradores"), 1500);
      } else {
        // Modo Criação
        await api.post("/employees/", cleanData);
        setModal({
          show: true,
          title: "Sucesso!",
          message: "Colaborador criado com sucesso.",
        });
        // Atraso para o usuário ver a mensagem antes de voltar
        setTimeout(() => router.push("/dashboard/colaboradores"), 1500);
      }
      router.refresh(); // Atualiza os dados da lista (cache do Next.js)
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error);
      setIsLoading(false);
      setModal({
        show: true,
        title: "Erro ao Salvar",
        message:
          error.response?.data?.detail ||
          "Ocorreu um erro. Verifique o console.",
      });
    }
  };

  return (
    <>
      <OLModal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
      >
        <p>{modal.message}</p>
      </OLModal>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção Pessoal */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-ol-primary">
            Informações Pessoais
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                {...register("nome_completo", { required: "Nome é obrigatório" })}
                className={errors.nome_completo ? "border-red-500" : ""}
              />
              {errors.nome_completo && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nome_completo.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                {...register("data_nascimento")}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} placeholder="123.456.789-00" />
            </div>
            <div>
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" {...register("rg")} />
            </div>
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-ol-primary">
            Informações de Contato
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email é obrigatório" })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="telefone">Telefone Corporativo</Label>
              <Input id="telefone" {...register("telefone")} />
            </div>
            <div>
              <Label htmlFor="email_pessoal">Email Pessoal</Label>
              <Input
                id="email_pessoal"
                type="email"
                {...register("email_pessoal")}
              />
            </div>
            <div>
              <Label htmlFor="telefone_pessoal">Telefone Pessoal</Label>
              <Input id="telefone_pessoal" {...register("telefone_pessoal")} />
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...register("endereco")}
                placeholder="Rua, Nº, Bairro, Cidade - UF"
              />
            </div>
            <div>
              <Label htmlFor="contato_emergencia">Contato de Emergência</Label>
              <Input
                id="contato_emergencia"
                {...register("contato_emergencia")}
                placeholder="Nome e telefone"
              />
            </div>
          </div>
        </div>

        {/* Seção Profissional */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-ol-primary">
            Informações Profissionais
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                {...register("cargo", { required: "Cargo é obrigatório" })}
                className={errors.cargo ? "border-red-500" : ""}
              />
              {errors.cargo && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cargo.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="senioridade">Senioridade</Label>
              <Controller
                name="senioridade"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="senioridade">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trainee">Trainee</SelectItem>
                      <SelectItem value="Estagiário">Estagiário</SelectItem>
                      <SelectItem value="Júnior">Júnior</SelectItem>
                      <SelectItem value="Pleno">Pleno</SelectItem>
                      <SelectItem value="Sênior">Sênior</SelectItem>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="data_admissao">Data de Admissão</Label>
              <Input
                id="data_admissao"
                type="date"
                {...register("data_admissao")}
              />
            </div>
          </div>
        </div>

        {/* Seção de Hierarquia */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-ol-primary">
            Hierarquia e Equipe
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label htmlFor="area_id">Área</Label>
              <Controller
                name="area_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value || "")}
                  >
                    <SelectTrigger id="area_id">
                      <SelectValue placeholder="Selecione a área..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={String(area.id)}>
                          {area.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="team_id">Equipe</Label>
              <Controller
                name="team_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value || "")}
                  >
                    <SelectTrigger id="team_id">
                      <SelectValue placeholder="Selecione a equipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={String(team.id)}>
                          {team.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="manager_id">Gerente / Líder</Label>
              <Controller
                name="manager_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value || "")}
                  >
                    <SelectTrigger id="manager_id">
                      <SelectValue placeholder="Selecione o gerente..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem
                          key={manager.id}
                          value={String(manager.id)}
                        >
                          {manager.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end space-x-4">
          <OLButton
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </OLButton>
          <OLButton type="submit" disabled={isLoading}>
            {isLoading
              ? "Salvando..."
              : isEditMode
              ? "Salvar Alterações"
              : "Criar Colaborador"}
          </OLButton>
        </div>
      </form>
    </>
  );
}

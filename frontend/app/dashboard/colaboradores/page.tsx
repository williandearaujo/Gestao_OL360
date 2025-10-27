"use client"; // MUDANÇA: Precisa ser Client Component para buscar dados e ter interação

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Employee } from "@/components/employees/types";
import { api } from "@/lib/api";
import { OLButton } from "@/components/ui/OLButton";
import { OLModal } from "@/components/ui/OLModal";

// MUDANÇA: Removido MOCK_COLABORADORES

export default function ColaboradoresPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ show: false, title: "", message: "" });

  // MUDANÇA: Busca dados reais da API
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        setLoading(true);
        const response = await api.get("/employees/");
        setColaboradores(response.data);
      } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        setModal({
          show: true,
          title: "Erro ao Carregar",
          message:
            "Não foi possível buscar a lista de colaboradores. Verifique o backend.",
          onConfirm: () => setModal({ ...modal, show: false }),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchColaboradores();
  }, []);

  const handleDelete = (id: string) => {
    setModal({
      show: true,
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja excluir este colaborador?",
      onConfirm: async () => {
        try {
          await api.delete(`/employees/${id}`);
          setColaboradores(colaboradores.filter((c) => c.id !== id));
          setModal({ show: false, title: "", message: "" });
        } catch (error) {
          console.error("Erro ao excluir:", error);
          setModal({
            show: true,
            title: "Erro",
            message: "Não foi possível excluir o colaborador.",
            onConfirm: () => setModal({ ...modal, show: false }),
          });
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      <OLModal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        onConfirm={modal.onConfirm}
        confirmText={modal.onConfirm ? "Confirmar" : undefined}
      >
        <p>{modal.message}</p>
      </OLModal>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gerenciamento de Colaboradores
          </h1>
          <p className="mt-2 text-gray-600">
            Adicione, edite ou visualize os colaboradores da OL.
          </p>
        </div>
        <Link href="/dashboard/colaboradores/novo" passHref>
          <OLButton>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Colaborador
          </OLButton>
        </Link>
      </header>

      {/* MUDANÇA: Tabela de dados reais */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Nome
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Cargo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : colaboradores.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            ) : (
              colaboradores.map((colaborador) => (
                <tr key={colaborador.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {colaborador.nome_completo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {colaborador.area?.nome || "Sem área"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {colaborador.cargo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {colaborador.senioridade || "N/A"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {colaborador.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        colaborador.status === "ATIVO"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {colaborador.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/colaboradores/${colaborador.id}/editar`
                        )
                      }
                      className="text-ol-primary hover:text-ol-hover"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(colaborador.id)}
                      className="ml-4 text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

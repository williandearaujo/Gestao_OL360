'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import OLCardStats from '@/components/ui/OLCardStats';
import { OLButton } from '@/components/ui/OLButton';
import OLModal from '@/components/ui/OLModal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  createKnowledge,
  deleteKnowledge,
  getKnowledge,
  getKnowledgeSummary,
  updateKnowledge,
} from '@/lib/api';
import { formatStatus, formatCurrency } from '@/lib/format';

type KnowledgeType = 'CERTIFICACAO' | 'CURSO' | 'IDIOMA' | 'FORMACAO';

interface KnowledgeItem {
  id: string;
  nome: string;
  descricao?: string | null;
  tipo: KnowledgeType;
  fornecedor?: string | null;
  status: string;
  obrigatorio: boolean;
  validade_meses?: number | null;
  carga_horaria?: number | null;
  total_vinculos: number;
  total_obrigatorios: number;
  total_obtidos: number;
  total_desejados: number;
  codigo_certificacao?: string | null;
  orgao_certificador?: string | null;
  tipo_formacao?: string | null;
  url_referencia?: string | null;
  custo_estimado?: number | null;
}

interface KnowledgeSummaryResponse {
  total: number;
  por_tipo: Record<string, number>;
  obrigatorios: number;
  expiram_ate_60_dias: number;
  colaboradores_afetados: number;
}

const TIPO_FORMACAO_OPCOES = ['GRADUACAO', 'POS_GRADUACAO', 'MBA', 'MESTRADO', 'DOUTORADO', 'ESPECIALIZACAO'];

const defaultForm = {
  nome: '',
  descricao: '',
  tipo: 'CURSO' as KnowledgeType,
  status: 'ATIVO',
  obrigatorio: false,
  fornecedor: '',
  validade_meses: '',
  codigo_certificacao: '',
  orgao_certificador: '',
  tipo_formacao: '',
  semestres: '',
  url_referencia: '',
  custo_estimado: '',
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.';

const formatCurrencyDisplay = (value?: number | null) =>
  value != null ? formatCurrency(value) : '';

const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const numberValue = Number(digits) / 100;
  return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseCurrency = (value: string): number | null => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return Number(digits) / 100;
};

const KnowledgeDashboard: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [summary, setSummary] = useState<KnowledgeSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formState, setFormState] = useState(defaultForm);
  const [editing, setEditing] = useState<KnowledgeItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [knowledgeData, summaryData] = await Promise.all([
        getKnowledge(),
        getKnowledgeSummary(),
      ]);
      setItems(knowledgeData ?? []);
      setSummary(summaryData ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [
        item.nome,
        item.fornecedor ?? '',
        formatStatus(item.tipo),
        formatStatus(item.status),
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const openCreateModal = () => {
    setEditing(null);
    setFormState(defaultForm);
    setModalOpen(true);
  };

    const openEditModal = (item: KnowledgeItem) => {
    setEditing(item);
    setFormState({
      ...defaultForm,
      nome: item.nome,
      descricao: item.descricao ?? '',
      tipo: item.tipo,
      status: item.status,
      fornecedor: item.fornecedor ?? '',
      validade_meses: item.validade_meses != null ? String(item.validade_meses) : '',
      codigo_certificacao: item.codigo_certificacao ?? '',
      orgao_certificador: item.orgao_certificador ?? '',
      tipo_formacao: item.tipo_formacao ?? '',
      semestres: item.carga_horaria != null ? String(item.carga_horaria) : '',
      url_referencia: item.url_referencia ?? '',
      custo_estimado: formatCurrencyDisplay(item.custo_estimado),
    });
    setModalOpen(true);
  };

  const handleTipoChange = (tipo: KnowledgeType) => {
    setFormState((prev) => ({
      ...defaultForm,
      nome: prev.nome,
      descricao: prev.descricao,
      status: prev.status,
      tipo,
    }));
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(event.target.value);
    setFormState((prev) => ({ ...prev, custo_estimado: formatted }));
  };

  const handleSubmit = async () => {
    try {
      setModalLoading(true);
      const nomeTrim = formState.nome.trim();
      if (!nomeTrim) {
        throw new Error('Informe o nome do conhecimento.');
      }

      const payload: Record<string, unknown> = {
        nome: nomeTrim,
        tipo: formState.tipo,
        status: formState.status,
        descricao: formState.descricao.trim() || null,
      };

      if (formState.tipo === 'CERTIFICACAO') {
        const validade = formState.validade_meses.trim();
        const custoValor = parseCurrency(formState.custo_estimado);
        const validadeNumero = validade ? Number(validade) : null;
        if (validade && Number.isNaN(Number(validade))) {
          throw new Error('Informe uma validade em meses valida.');
        }
        payload.fornecedor = formState.fornecedor.trim() || null;
        payload.validade_meses = validadeNumero;
        payload.codigo_certificacao = formState.codigo_certificacao.trim() || null;
        payload.orgao_certificador = formState.orgao_certificador.trim() || null;
        payload.url_referencia = formState.url_referencia.trim() || null;
        payload.custo_estimado = custoValor;
      } else if (formState.tipo === 'CURSO' || formState.tipo === 'IDIOMA') {
        payload.fornecedor = formState.fornecedor.trim() || null;
        payload.url_referencia = formState.url_referencia.trim() || null;
      } else if (formState.tipo === 'FORMACAO') {
        const semestres = formState.semestres.trim();
        const semestresNumero = semestres ? Number(semestres) : null;
        if (semestres && Number.isNaN(Number(semestres))) {
          throw new Error('Informe a quantidade de semestres com um numero valido.');
        }
        payload.fornecedor = formState.fornecedor.trim() || null;
        payload.tipo_formacao = formState.tipo_formacao.trim() || null;
        payload.carga_horaria = semestresNumero;
        payload.url_referencia = formState.url_referencia.trim() || null;
      }

      if (formState.tipo !== 'CERTIFICACAO') {
        payload.validade_meses = null;
        payload.codigo_certificacao = null;
        payload.orgao_certificador = null;
        payload.custo_estimado = null;
      }

      if (formState.tipo !== 'FORMACAO') {
        payload.tipo_formacao = null;
        payload.carga_horaria = null;
      }

      if (editing) {
        await updateKnowledge(editing.id, payload);
      } else {
        await createKnowledge(payload);
      }

      setModalOpen(false);
      setEditing(null);
      setFormState(defaultForm);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item: KnowledgeItem) => {
    if (!window.confirm(`Remover o conhecimento "${item.nome}"?`)) return;
    try {
      await deleteKnowledge(item.id);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const isCertificacao = formState.tipo === 'CERTIFICACAO';
  const isCursoOuIdioma = formState.tipo === 'CURSO' || formState.tipo === 'IDIOMA';
  const isFormacao = formState.tipo === 'FORMACAO';

  if (loading) {
    return (
      <div className="p-6 text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
        Carregando conhecimentos...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ol-text dark:text-darkOl-text">
            Catálogo de conhecimentos
          </h1>
          <p className="text-sm text-ol-grayMedium dark:text-darkOl-grayMedium">
            Manage certificações, cursos, idiomas e formações vinculados aos colaboradores.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            type="search"
            placeholder="Pesquisar conhecimento..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-md border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40 md:w-64"
          />
          <OLButton onClick={openCreateModal} iconLeft={<Plus className="h-4 w-4" />}>
            Novo conhecimento
          </OLButton>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OLCardStats label="Total cadastrados" value={summary.total} color="info" />
          <OLCardStats label="Obrigatórios" value={summary.obrigatorios} color="warning" />
          <OLCardStats label="Expiram em 60 dias" value={summary.expiram_ate_60_dias} color="danger" />
          <OLCardStats
            label="Colaboradores impactados"
            value={summary.colaboradores_afetados}
            color="success"
          />
        </div>
      )}

      <div className="rounded-lg border border-ol-border bg-white shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
        <table className="min-w-full divide-y divide-ol-border dark:divide-darkOl-border">
          <thead className="bg-ol-bg dark:bg-darkOl-bg">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-ol-grayMedium dark:text-darkOl-grayMedium">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Obrigatório</th>
              <th className="px-4 py-3 text-right">Vínculos</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ol-border text-sm dark:divide-darkOl-border">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-ol-grayMedium dark:text-darkOl-grayMedium"
                >
                  Nenhum conhecimento encontrado.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="bg-white dark:bg-darkOl-cardBg">
                  <td className="px-4 py-3 font-medium text-ol-text dark:text-darkOl-text">
                    {item.nome}
                  </td>
                  <td className="px-4 py-3 text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {formatStatus(item.tipo)}
                  </td>
                  <td className="px-4 py-3 text-ol-grayMedium dark:text-darkOl-grayMedium">
                    {item.fornecedor || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.obrigatorio
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
                      }`}
                    >
                      {item.obrigatorio ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-ol-text dark:text-darkOl-text">
                    {item.total_vinculos}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center rounded-md px-2 py-1 text-sm text-ol-primary transition hover:bg-ol-bg dark:text-darkOl-primary dark:hover:bg-darkOl-cardBg"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="ml-2 inline-flex items-center rounded-md px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {summary && (
        <section className="space-y-3 rounded-lg border border-ol-border bg-white p-6 shadow-sm dark:border-darkOl-border dark:bg-darkOl-cardBg">
          <h2 className="text-lg font-semibold text-ol-text dark:text-darkOl-text">
            Distribuição por tipo
          </h2>
          <div className="flex flex-wrap gap-3 text-sm">
            {Object.entries(summary.por_tipo).map(([tipo, count]) => (
              <span
                key={tipo}
                className="rounded-full border border-ol-border px-3 py-1 text-ol-text dark:border-darkOl-border dark:text-darkOl-text"
              >
                {formatStatus(tipo)}: {count}
              </span>
            ))}
          </div>
        </section>
      )}

            <OLModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onConfirm={handleSubmit}
        confirmText={editing ? 'Salvar alteracoes' : 'Cadastrar conhecimento'}
        loading={modalLoading}
        title={editing ? 'Editar conhecimento' : 'Novo conhecimento'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formState.nome}
              onChange={(event) => setFormState((prev) => ({ ...prev, nome: event.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descricao</Label>
            <textarea
              id="descricao"
              value={formState.descricao}
              onChange={(event) => setFormState((prev) => ({ ...prev, descricao: event.target.value }))}
              rows={3}
              className="w-full rounded-md border border-ol-border bg-white p-3 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Tipo *</Label>
              <select
                value={formState.tipo}
                onChange={(event) => handleTipoChange(event.target.value as KnowledgeType)}
                className="w-full rounded-md border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
              >
                <option value="CURSO">Curso</option>
                <option value="CERTIFICACAO">Certificacao</option>
                <option value="IDIOMA">Idioma</option>
                <option value="FORMACAO">Formacao</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={formState.status}
                onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-md border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="EM_ATUALIZACAO">Em atualizacao</option>
                <option value="OBSOLETO">Obsoleto</option>
              </select>
            </div>
          </div>

          {isCertificacao && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fornecedor">Vendor</Label>
                <Input
                  id="fornecedor"
                  value={formState.fornecedor}
                  onChange={(event) => setFormState((prev) => ({ ...prev, fornecedor: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="validade_meses">Validade (meses)</Label>
                <Input
                  id="validade_meses"
                  type="number"
                  min="0"
                  value={formState.validade_meses}
                  onChange={(event) => setFormState((prev) => ({ ...prev, validade_meses: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="codigo_certificacao">Codigo certificacao</Label>
                <Input
                  id="codigo_certificacao"
                  value={formState.codigo_certificacao}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, codigo_certificacao: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="orgao_certificador">Orgao certificador</Label>
                <Input
                  id="orgao_certificador"
                  value={formState.orgao_certificador}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, orgao_certificador: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="url_referencia">URL de referencia</Label>
                <Input
                  id="url_referencia"
                  type="url"
                  value={formState.url_referencia}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, url_referencia: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="custo_estimado">Custo (R$)</Label>
                <Input
                  id="custo_estimado"
                  value={formState.custo_estimado}
                  onChange={handleCurrencyChange}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          )}

          {isCursoOuIdioma && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fornecedor">Instituicao</Label>
                <Input
                  id="fornecedor"
                  value={formState.fornecedor}
                  onChange={(event) => setFormState((prev) => ({ ...prev, fornecedor: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="url_referencia">URL de referencia</Label>
                <Input
                  id="url_referencia"
                  type="url"
                  value={formState.url_referencia}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, url_referencia: event.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {isFormacao && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fornecedor">Instituicao</Label>
                <Input
                  id="fornecedor"
                  value={formState.fornecedor}
                  onChange={(event) => setFormState((prev) => ({ ...prev, fornecedor: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="semestres">Quantidade de semestres</Label>
                <Input
                  id="semestres"
                  type="number"
                  min="0"
                  value={formState.semestres}
                  onChange={(event) => setFormState((prev) => ({ ...prev, semestres: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="tipo_formacao">Tipo</Label>
                <select
                  id="tipo_formacao"
                  value={formState.tipo_formacao}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tipo_formacao: event.target.value }))
                  }
                  className="w-full rounded-md border border-ol-border bg-white px-3 py-2 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
                >
                  <option value="">Selecione...</option>
                  {TIPO_FORMACAO_OPCOES.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {formatStatus(opcao)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="url_referencia">URL de referencia</Label>
                <Input
                  id="url_referencia"
                  type="url"
                  value={formState.url_referencia}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, url_referencia: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </OLModal>
    </div>
  );
};

export default KnowledgeDashboard;






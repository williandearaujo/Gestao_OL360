'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { OLButton } from '@/components/ui/OLButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { createEmployee, getAreas, getSupervisors, getTeams, updateEmployee } from '@/lib/api';
import { onlyNumbers } from '@/lib/format';
import { maskCEP, maskCPF, maskPhone } from '@/lib/masks';

interface Area {
  id: string;
  nome: string;
}

interface Supervisor {
  id: string;
  nome_completo: string;
}

interface Team {
  id: string;
  nome: string;
}

type EmployeeType = 'DIRETOR' | 'GERENTE' | 'COORDENADOR' | 'COLABORADOR';

const ROLE_OPTIONS: { value: EmployeeType; label: string }[] = [
  { value: 'DIRETOR', label: 'Diretor(a)' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'COORDENADOR', label: 'Coordenador(a)' },
  { value: 'COLABORADOR', label: 'Colaborador(a)' },
];

const SENIORITY_OPTIONS = ['Estagiario', 'Trainee', 'Junior', 'Pleno', 'Senior', 'Especialista'];

const STATUS_OPTIONS = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' },
  { value: 'FERIAS', label: 'Ferias' },
  { value: 'DAYOFF', label: 'Day Off' },
];

const TABS = [
  { id: 'basic', label: 'Dados Corporativos' },
  { id: 'personal', label: 'Dados Pessoais' },
  { id: 'address', label: 'Endereco' },
  { id: 'extras', label: 'Financeiro & Observacoes' },
];

const DEFAULT_STATE = {
  nome_completo: '',
  email_corporativo: '',
  email_pessoal: '',
  telefone_corporativo: '',
  telefone_pessoal: '',
  contato_emergencia_nome: '',
  contato_emergencia_telefone: '',
  tipo_cadastro: 'COLABORADOR' as EmployeeType,
  cargo: '',
  senioridade: '',
  area_id: '',
  team_id: '',
  manager_id: '',
  status: 'ATIVO',
  data_nascimento: '',
  data_admissao: '',
  cpf: '',
  rg: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  salario_atual: '',
  ultima_alteracao_salarial: '',
  observacoes_internas: '',
};

type EmployeeFormState = typeof DEFAULT_STATE;

type EmployeeInitialData = Partial<EmployeeFormState> & {
  endereco_completo?: string | null;
  [key: string]: unknown;
};

const mergeInitialState = (initialData: EmployeeInitialData): EmployeeFormState => {
  const merged = { ...DEFAULT_STATE, ...initialData };

  return {
    nome_completo: merged.nome_completo ?? '',
    email_corporativo: merged.email_corporativo ?? '',
    email_pessoal: merged.email_pessoal ?? '',
    telefone_corporativo: merged.telefone_corporativo
      ? maskPhone(String(merged.telefone_corporativo))
      : '',
    telefone_pessoal: merged.telefone_pessoal ? maskPhone(String(merged.telefone_pessoal)) : '',
    contato_emergencia_nome: merged.contato_emergencia_nome ?? '',
    contato_emergencia_telefone: merged.contato_emergencia_telefone
      ? maskPhone(String(merged.contato_emergencia_telefone))
      : '',
    tipo_cadastro: (merged.tipo_cadastro as EmployeeType) ?? 'COLABORADOR',
    cargo: merged.cargo ?? '',
    senioridade: merged.senioridade ?? '',
    area_id: merged.area_id ?? '',
    team_id: merged.team_id ?? '',
    manager_id: (merged.manager_employee_id as string) ?? '',
    status: merged.status ?? 'ATIVO',
    data_nascimento: merged.data_nascimento
      ? String(merged.data_nascimento).split('T')[0]
      : '',
    data_admissao: merged.data_admissao ? String(merged.data_admissao).split('T')[0] : '',
    cpf: merged.cpf ? maskCPF(String(merged.cpf)) : '',
    rg: merged.rg ?? '',
    cep: merged.cep ? maskCEP(String(merged.cep)) : '',
    logradouro: merged.logradouro || merged.endereco_completo || '',
    numero: String(merged.numero ?? ''),
    complemento: merged.complemento ?? '',
    bairro: merged.bairro ?? '',
    cidade: merged.cidade ?? '',
    estado: merged.estado ?? '',
    salario_atual: merged.salario_atual ? String(merged.salario_atual) : '',
    ultima_alteracao_salarial: merged.ultima_alteracao_salarial
      ? String(merged.ultima_alteracao_salarial).split('T')[0]
      : '',
    observacoes_internas: merged.observacoes_internas ?? '',
  };
};

type EmployeeFormProps = {
  employeeId?: string;
  initialData?: EmployeeInitialData;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Erro inesperado.';

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, initialData = {} }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<EmployeeFormState>(() => mergeInitialState(initialData));
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [areas, setAreas] = useState<Area[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(mergeInitialState(initialData));
  }, [initialData?.id]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const [areasData, teamsData, supervisorsData] = await Promise.all([
          getAreas(),
          getTeams(),
          getSupervisors(),
        ]);
        setAreas(areasData ?? []);
        setTeams(teamsData ?? []);
        setSupervisors(supervisorsData ?? []);
      } catch {
        setError('Falha ao carregar dados auxiliares.');
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const requiresManager = formData.tipo_cadastro !== 'DIRETOR';

  const handleValueChange = React.useCallback(
    (field: keyof EmployeeFormState) =>
    (value: string): void => {
      setFormData((prev) => {
        if (field === 'tipo_cadastro') {
          const nextType = value as EmployeeType;
          return {
            ...prev,
            tipo_cadastro: nextType,
            manager_id: nextType === 'DIRETOR' ? '' : prev.manager_id,
          };
        }
        return { ...prev, [field]: value };
      });
    },
    [],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaskedInputChange =
    (mask: (value: string) => string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormData((prev) => ({ ...prev, [name]: mask(value) }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.team_id) {
        throw new Error('Selecione a equipe do colaborador.');
      }

      if (requiresManager && !formData.manager_id) {
        throw new Error('Selecione o gestor responsavel.');
      }

      if (!formData.telefone_pessoal) {
        throw new Error('Informe o telefone pessoal.');
      }

      const {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        ...rest
      } = formData;

      const addressParts: string[] = [];
      if (logradouro.trim()) addressParts.push(logradouro.trim());
      if (numero.trim()) addressParts.push(`nº ${numero.trim()}`);
      if (complemento.trim()) addressParts.push(`Compl. ${complemento.trim()}`);
      if (bairro.trim()) addressParts.push(bairro.trim());

      const cityState = [cidade.trim(), estado.trim()].filter(Boolean).join('/');
      if (cityState) addressParts.push(cityState);

      const cepDigits = onlyNumbers(cep);

      const payload: Record<string, any> = {
        ...rest,
        status: rest.status || 'ATIVO',
      };

      if (addressParts.length || cepDigits) {
        const address = addressParts.join(', ');
        payload.endereco_completo = cepDigits
          ? `${address}${address ? ' - ' : ''}CEP: ${cepDigits.replace(/(\d{5})(\d)/, '$1-$2')}`
          : address;
      }

      ['observacoes_internas', 'email_pessoal', 'cargo', 'senioridade', 'contato_emergencia_nome'].forEach(
        (field) => {
          if (payload[field]) {
            payload[field] = String(payload[field]).trim();
            if (!payload[field]) delete payload[field];
          }
        },
      );

      ['telefone_corporativo', 'telefone_pessoal', 'contato_emergencia_telefone'].forEach((field) => {
        if (payload[field]) {
          const digits = onlyNumbers(payload[field]);
          if (digits) {
            payload[field] = digits;
          } else {
            delete payload[field];
          }
        }
      });

      if (payload.telefone_pessoal && payload.telefone_pessoal.length < 10) {
        throw new Error('Informe um telefone pessoal valido.');
      }

      if (payload.cpf) {
        const digits = onlyNumbers(payload.cpf);
        if (digits && digits.length !== 11) {
          throw new Error('Informe um CPF valido.');
        }
        if (digits) payload.cpf = digits;
        else delete payload.cpf;
      }

      if (payload.salario_atual) {
        const amount = Number(
          String(payload.salario_atual)
            .replace(/\./g, '')
            .replace(',', '.'),
        );
        if (!Number.isFinite(amount)) {
          throw new Error('Informe um salario valido.');
        }
        payload.salario_atual = amount;
      } else {
        delete payload.salario_atual;
      }

      if (!payload.ultima_alteracao_salarial) delete payload.ultima_alteracao_salarial;
      if (!payload.manager_id || !requiresManager) delete payload.manager_id;
      if (!payload.area_id) delete payload.area_id;
      if (!payload.team_id) delete payload.team_id;
      if (!payload.data_nascimento) delete payload.data_nascimento;
      if (!payload.data_admissao) delete payload.data_admissao;

      if (employeeId) {
        await updateEmployee(employeeId, payload);
      } else {
        await createEmployee(payload);
      }

      router.push('/dashboard/colaboradores');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const renderBasicData = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Nome completo</Label>
        <Input
          name="nome_completo"
          value={formData.nome_completo}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <Label>E-mail corporativo</Label>
        <Input
          name="email_corporativo"
          type="email"
          value={formData.email_corporativo}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <Label>Telefone corporativo</Label>
        <Input
          name="telefone_corporativo"
          value={formData.telefone_corporativo}
          onChange={handleMaskedInputChange(maskPhone)}
        />
      </div>

      <div>
        <Label>Cargo</Label>
        <Input name="cargo" value={formData.cargo} onChange={handleInputChange} required />
      </div>

      <div>
        <Label>Senioridade</Label>
        <Select value={formData.senioridade} onValueChange={handleValueChange('senioridade')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {SENIORITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tipo de cadastro</Label>
        <Select value={formData.tipo_cadastro} onValueChange={handleValueChange('tipo_cadastro')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Area</Label>
        <Select
          value={formData.area_id}
          onValueChange={handleValueChange('area_id')}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Equipe</Label>
        <Select
          value={formData.team_id}
          onValueChange={handleValueChange('team_id')}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Gestor</Label>
        <Select
          value={formData.manager_id}
          onValueChange={handleValueChange('manager_id')}
          disabled={loading || !requiresManager}
        >
          <SelectTrigger>
            <SelectValue placeholder={requiresManager ? 'Selecione...' : 'Nao requerido'} />
          </SelectTrigger>
          <SelectContent>
            {supervisors.map((supervisor) => (
              <SelectItem key={supervisor.id} value={supervisor.id}>
                {supervisor.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={handleValueChange('status')}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPersonalData = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <Label>E-mail pessoal</Label>
        <Input
          name="email_pessoal"
          type="email"
          value={formData.email_pessoal}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label>Telefone pessoal</Label>
        <Input
          name="telefone_pessoal"
          value={formData.telefone_pessoal}
          onChange={handleMaskedInputChange(maskPhone)}
          required
        />
      </div>

      <div>
        <Label>Data de nascimento</Label>
        <Input
          name="data_nascimento"
          type="date"
          value={formData.data_nascimento}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label>Data de admissao</Label>
        <Input
          name="data_admissao"
          type="date"
          value={formData.data_admissao}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label>CPF</Label>
        <Input name="cpf" value={formData.cpf} onChange={handleMaskedInputChange(maskCPF)} />
      </div>

      <div>
        <Label>RG</Label>
        <Input name="rg" value={formData.rg} onChange={handleInputChange} />
      </div>

      <div>
        <Label>Contato de emergencia</Label>
        <Input
          name="contato_emergencia_nome"
          value={formData.contato_emergencia_nome}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label>Telefone de emergencia</Label>
        <Input
          name="contato_emergencia_telefone"
          value={formData.contato_emergencia_telefone}
          onChange={handleMaskedInputChange(maskPhone)}
        />
      </div>
    </div>
  );

  const renderAddressData = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
      <div className="md:col-span-2">
        <Label>CEP</Label>
        <Input name="cep" value={formData.cep} onChange={handleMaskedInputChange(maskCEP)} />
      </div>

      <div className="md:col-span-4">
        <Label>Logradouro</Label>
        <Input name="logradouro" value={formData.logradouro} onChange={handleInputChange} />
      </div>

      <div>
        <Label>Numero</Label>
        <Input name="numero" value={formData.numero} onChange={handleInputChange} />
      </div>

      <div className="md:col-span-2">
        <Label>Complemento</Label>
        <Input name="complemento" value={formData.complemento} onChange={handleInputChange} />
      </div>

      <div className="md:col-span-2">
        <Label>Bairro</Label>
        <Input name="bairro" value={formData.bairro} onChange={handleInputChange} />
      </div>

      <div className="md:col-span-2">
        <Label>Cidade</Label>
        <Input name="cidade" value={formData.cidade} onChange={handleInputChange} />
      </div>

      <div>
        <Label>Estado</Label>
        <Input name="estado" value={formData.estado} onChange={handleInputChange} />
      </div>
    </div>
  );

  const renderExtraData = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <Label>Salario (opcional)</Label>
        <Input
          name="salario_atual"
          type="number"
          step="0.01"
          value={formData.salario_atual}
          onChange={handleInputChange}
          placeholder="0,00"
        />
      </div>

      <div>
        <Label>Data do ultimo reajuste</Label>
        <Input
          name="ultima_alteracao_salarial"
          type="date"
          value={formData.ultima_alteracao_salarial}
          onChange={handleInputChange}
          disabled={!formData.salario_atual}
        />
      </div>

      <div className="md:col-span-2">
        <Label>Observacoes internas</Label>
        <textarea
          name="observacoes_internas"
          value={formData.observacoes_internas}
          onChange={handleInputChange}
          rows={4}
          className="w-full rounded-md border border-ol-border bg-white p-3 text-sm text-ol-text outline-none transition focus:border-ol-primary focus:ring-2 focus:ring-ol-primary/40 dark:border-darkOl-border dark:bg-darkOl-bg dark:text-darkOl-text dark:focus:border-darkOl-primary dark:focus:ring-darkOl-primary/40"
          placeholder="Registre informacoes restritas para lideranca."
        />
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-ol-cardBg p-6 shadow-sm dark:bg-darkOl-cardBg"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
          Erro: {error}
        </div>
      )}

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-ol-primary text-ol-text dark:text-darkOl-text'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="animate-fadeIn space-y-6">
        {activeTab === 'basic' && renderBasicData()}
        {activeTab === 'personal' && renderPersonalData()}
        {activeTab === 'address' && renderAddressData()}
        {activeTab === 'extras' && renderExtraData()}
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
        <OLButton type="submit" loading={saving} disabled={saving || loading}>
          {saving ? 'Salvando...' : employeeId ? 'Salvar alteracoes' : 'Criar colaborador'}
        </OLButton>
      </div>
    </form>
  );
};

export default EmployeeForm;
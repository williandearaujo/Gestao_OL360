'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { getAreas, getSupervisors, createEmployee, updateEmployee } from '@/lib/api';
import { maskCEP, maskCPF, maskPhone } from '@/lib/masks'; // Importando as máscaras

// --- Interfaces ---
interface Area { id: string; nome: string; }
interface Supervisor { id: string; nome_completo: string; }
// ... outras interfaces

// --- Componente Principal ---
export default function EmployeeForm({ employeeId, initialData = {} }: any) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('basic');
  const [areas, setAreas] = useState<Area[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!employeeId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasData, supervisorsData] = await Promise.all([ getAreas(), getSupervisors() ]);
        setAreas(areasData || []);
        setSupervisors(supervisorsData || []);
      } catch (err) {
        setError('Falha ao carregar dados de suporte.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers ---
  const handleValueChange = (field: string) => (value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMaskedInputChange = (mask: (value: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: mask(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Combina o endereço em uma string antes de enviar
      const { cep, logradouro, numero, bairro, cidade, estado, ...rest } = formData;
      const endereco_completo = `${logradouro || ''}, ${numero || ''} - ${bairro || ''}, ${cidade || ''}/${estado || ''} - CEP: ${cep || ''}`;
      
      const dataToSubmit = { ...rest, endereco_completo };

      if (isEditMode) {
        await updateEmployee(employeeId, dataToSubmit);
      } else {
        await createEmployee(dataToSubmit);
      }
      router.push('/dashboard/colaboradores');
    } catch (err: any) {
      setError(err.message || `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'criar'} o colaborador.`);
      setLoading(false);
    }
  };

  // --- Renderização das Abas ---
  const renderBasicData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2"><Label>Nome Completo</Label><Input name="nome_completo" value={formData.nome_completo || ''} onChange={handleInputChange} required /></div>
        <div><Label>E-mail Corporativo</Label><Input name="email_corporativo" type="email" value={formData.email_corporativo || ''} onChange={handleInputChange} required /></div>
        <div><Label>Telefone Corporativo</Label><Input name="telefone_corporativo" value={formData.telefone_corporativo || ''} onChange={handleMaskedInputChange(maskPhone)} /></div>
        <div><Label>Cargo</Label><Input name="cargo" value={formData.cargo || ''} onChange={handleInputChange} required /></div>
        <div><Label>Senioridade</Label><Select onValueChange={handleValueChange('senioridade')} value={formData.senioridade}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="Estagiário">Estagiário</SelectItem><SelectItem value="Trainee">Trainee</SelectItem><SelectItem value="Júnior">Júnior</SelectItem><SelectItem value="Pleno">Pleno</SelectItem><SelectItem value="Sênior">Sênior</SelectItem><SelectItem value="Especialista">Especialista</SelectItem></SelectContent></Select></div>
        <div><Label>Área</Label><Select onValueChange={handleValueChange('area_id')} value={formData.area_id} disabled={loading}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{areas.map(area => (<SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>))}</SelectContent></Select></div>
        <div><Label>Gestor</Label><Select onValueChange={handleValueChange('manager_id')} value={formData.manager_id} disabled={loading}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{supervisors.map(s => (<SelectItem key={s.id} value={s.id}>{s.nome_completo}</SelectItem>))}</SelectContent></Select></div>
    </div>
  );

  const renderPersonalData = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><Label>E-mail Pessoal</Label><Input name="email_pessoal" type="email" value={formData.email_pessoal || ''} onChange={handleInputChange} /></div>
          <div><Label>Telefone Pessoal</Label><Input name="telefone_pessoal" value={formData.telefone_pessoal || ''} onChange={handleMaskedInputChange(maskPhone)} /></div>
          <div><Label>Data de Nascimento</Label><Input name="data_nascimento" type="date" value={formData.data_nascimento?.split('T')[0] || ''} onChange={handleInputChange} /></div>
          <div><Label>CPF</Label><Input name="cpf" value={formData.cpf || ''} onChange={handleMaskedInputChange(maskCPF)} /></div>
          <div><Label>RG</Label><Input name="rg" value={formData.rg || ''} onChange={handleInputChange} /></div>
      </div>
  );

  const renderAddressData = () => (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-2"><Label>CEP</Label><Input name="cep" value={formData.cep || ''} onChange={handleMaskedInputChange(maskCEP)} /></div>
        <div className="md:col-span-4"><Label>Logradouro</Label><Input name="logradouro" value={formData.logradouro || ''} onChange={handleInputChange} /></div>
        <div className="md:col-span-2"><Label>Número</Label><Input name="numero" value={formData.numero || ''} onChange={handleInputChange} /></div>
        <div className="md:col-span-4"><Label>Bairro</Label><Input name="bairro" value={formData.bairro || ''} onChange={handleInputChange} /></div>
        <div className="md:col-span-3"><Label>Cidade</Label><Input name="cidade" value={formData.cidade || ''} onChange={handleInputChange} /></div>
        <div className="md:col-span-3"><Label>Estado</Label><Input name="estado" value={formData.estado || ''} onChange={handleInputChange} /></div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-ol-cardBg dark:bg-darkOl-cardBg p-6 rounded-lg shadow-sm">
      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">Erro: {error}</div>}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button type="button" onClick={() => setActiveTab('basic')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'basic' ? 'border-ol-primary text-ol-text' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Dados Corporativos</button>
            <button type="button" onClick={() => setActiveTab('personal')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personal' ? 'border-ol-primary text-ol-text' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Dados Pessoais</button>
            <button type="button" onClick={() => setActiveTab('address')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'address' ? 'border-ol-primary text-ol-text' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Endereço</button>
        </nav>
      </div>
      <div className="animate-fadeIn">
        {activeTab === 'basic' && renderBasicData()}
        {activeTab === 'personal' && renderPersonalData()}
        {activeTab === 'address' && renderAddressData()}
      </div>
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <OLButton type="submit" loading={loading} disabled={loading}>
          {loading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Colaborador')}
        </OLButton>
      </div>
    </form>
  );
}
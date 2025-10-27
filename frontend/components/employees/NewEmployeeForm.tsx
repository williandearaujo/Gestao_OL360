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
import { getAreas, getSupervisors, createEmployee } from '@/lib/api';

// --- Interfaces e Estado Inicial ---
interface Area { id: string; nome: string; }
interface Supervisor { id: string; nome_completo: string; }
const initialState = {
  nome_completo: '',
  email_corporativo: '',
  cargo: '',
  senioridade: '',
  area_id: '',
  manager_id: '',
};

// --- Componente para NOVO Colaborador ---
export default function NewEmployeeForm() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [areas, setAreas] = useState<Area[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  const handleValueChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createEmployee(formData);
      router.push('/dashboard/colaboradores');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar o colaborador.');
      setLoading(false);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-ol-cardBg dark:bg-darkOl-cardBg p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2"><Label htmlFor="nome_completo">Nome Completo</Label><Input id="nome_completo" name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} required /></div>
        <div><Label htmlFor="email_corporativo">E-mail Corporativo</Label><Input id="email_corporativo" name="email_corporativo" type="email" value={formData.email_corporativo} onChange={handleInputChange} required /></div>
        <div><Label htmlFor="cargo">Cargo</Label><Input id="cargo" name="cargo" value={formData.cargo} onChange={handleInputChange} required /></div>
        <div><Label>Senioridade</Label><Select onValueChange={handleValueChange('senioridade')} value={formData.senioridade} required><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="Estagiário">Estagiário</SelectItem><SelectItem value="Trainee">Trainee</SelectItem><SelectItem value="Júnior">Júnior</SelectItem><SelectItem value="Pleno">Pleno</SelectItem><SelectItem value="Sênior">Sênior</SelectItem><SelectItem value="Especialista">Especialista</SelectItem></SelectContent></Select></div>
        <div><Label>Área</Label><Select onValueChange={handleValueChange('area_id')} value={formData.area_id} disabled={loading}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{areas.map(area => (<SelectItem key={area.id} value={area.id}>{area.nome}</SelectItem>))}</SelectContent></Select></div>
        <div><Label>Gestor</Label><Select onValueChange={handleValueChange('manager_id')} value={formData.manager_id} disabled={loading}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{supervisors.map(s => (<SelectItem key={s.id} value={s.id}>{s.nome_completo}</SelectItem>))}</SelectContent></Select></div>
      </div>
      <div className="flex justify-end pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
        <OLButton type="submit" loading={loading} disabled={loading}>
          {loading ? 'Salvando...' : 'Criar Colaborador'}
        </OLButton>
      </div>
    </form>
  );
}

"""
Model de Colaborador - COMPLETO
Gestão 360 - OL Tecnologia
"""
from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, JSON, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Employee(Base):
    """Model de Colaborador com todos os campos necessários"""
    __tablename__ = "employees"

    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    email = Column(String(320), unique=True, nullable=False, index=True)
    cpf = Column(String(11), unique=True, index=True)

    # Dados Pessoais
    data_nascimento = Column(Date)
    telefone = Column(String(20))
    endereco = Column(String(500))

    # Dados Profissionais
    cargo = Column(String(255), nullable=False)
    data_admissao = Column(Date)
    salario = Column(Numeric(10, 2))

    # Relacionamentos
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"))
    manager_id = Column(Integer, ForeignKey("managers.id", ondelete="SET NULL"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Gestão de RH (JSON para flexibilidade)
    ferias_dados = Column(JSON, default=dict)  # {"dias_disponiveis": 30, "periodos": [...]}
    pdi_dados = Column(JSON, default=dict)     # {"checks": [...], "objetivos": [...]}
    reunioes_1x1 = Column(JSON, default=dict)  # {"historico": [...], "proxima": "..."}

    # Datas importantes
    data_proximo_pdi = Column(Date)
    data_proxima_1x1 = Column(Date)
    data_ultima_avaliacao = Column(Date)
    day_off_aniversario = Column(Date)

    # Status e observações
    status = Column(String(50), nullable=False, default="ATIVO", index=True)
    # Status: ATIVO, FERIAS, AFASTADO, DESLIGADO
    observacoes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos ORM
    team = relationship("Team", back_populates="members", foreign_keys=[team_id])
    manager = relationship("Manager", back_populates="subordinados", foreign_keys=[manager_id])
    user = relationship("User", back_populates="employee", uselist=False)
    conhecimentos = relationship("EmployeeKnowledge", back_populates="employee", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Employee(id={self.id}, nome='{self.nome}', cargo='{self.cargo}')>"

    def to_dict(self):
        """Converte o model para dicionário"""
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "cpf": self.cpf,
            "data_nascimento": self.data_nascimento.isoformat() if self.data_nascimento else None,
            "telefone": self.telefone,
            "endereco": self.endereco,
            "cargo": self.cargo,
            "data_admissao": self.data_admissao.isoformat() if self.data_admissao else None,
            "salario": float(self.salario) if self.salario else None,
            "team_id": self.team_id,
            "manager_id": self.manager_id,
            "ferias_dados": self.ferias_dados,
            "pdi_dados": self.pdi_dados,
            "reunioes_1x1": self.reunioes_1x1,
            "data_proximo_pdi": self.data_proximo_pdi.isoformat() if self.data_proximo_pdi else None,
            "data_proxima_1x1": self.data_proxima_1x1.isoformat() if self.data_proxima_1x1 else None,
            "data_ultima_avaliacao": self.data_ultima_avaliacao.isoformat() if self.data_ultima_avaliacao else None,
            "day_off_aniversario": self.day_off_aniversario.isoformat() if self.day_off_aniversario else None,
            "status": self.status,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
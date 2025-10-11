# ============================================================================
# MODEL: Team (Equipe)
# ============================================================================

class Team(Base):
    """
    Equipes/Times de trabalho
    """
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    nome = Column(String(100), nullable=False, unique=True)
    cor = Column(String(7), nullable=False, default="#3B82F6")  # Hex color
    descricao = Column(Text)

    # Gerente da equipe
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    ativa = Column(Boolean, nullable=False, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    manager = relationship("User", foreign_keys=[manager_id])
    employees = relationship("Employee", back_populates="team")

    def __repr__(self):
        return f"<Team {self.nome}>"
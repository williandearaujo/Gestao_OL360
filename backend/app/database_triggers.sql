-- Função de gatilho de auditoria genérica
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    audit_row audit_logs;
    excluded_cols TEXT[] = ARRAY['updated_at'];
    old_data JSONB;
    new_data JSONB;
BEGIN
    audit_row = ROW(
        uuid_generate_v4(),
        NOW(),
        NULL, -- user_id (será preenchido pela aplicação se possível, ou NULL)
        TG_OP,
        TG_TABLE_NAME,
        NULL,
        NULL,
        NULL
    );

    IF (TG_OP = 'UPDATE') THEN
        audit_row.record_id = OLD.id;
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
        -- Remover colunas excluídas
        old_data = old_data - excluded_cols;
        new_data = new_data - excluded_cols;
        
        -- Salvar apenas o que mudou
        audit_row.old_values = (SELECT jsonb_object_agg(key, value)
                                FROM jsonb_each(old_data)
                                WHERE new_data -> key IS DISTINCT FROM value);
                                
        audit_row.new_values = (SELECT jsonb_object_agg(key, value)
                                FROM jsonb_each(new_data)
                                WHERE old_data -> key IS DISTINCT FROM value);

        -- Se nada mudou (só updated_at), não loga
        IF audit_row.new_values = '{}'::jsonb THEN
            RETURN NEW;
        END IF;
        
    ELSIF (TG_OP = 'DELETE') THEN
        audit_row.record_id = OLD.id;
        old_data = to_jsonb(OLD);
        old_data = old_data - excluded_cols;
        audit_row.old_values = old_data;
        
    ELSIF (TG_OP = 'INSERT') THEN
        audit_row.record_id = NEW.id;
        new_data = to_jsonb(NEW);
        new_data = new_data - excluded_cols;
        audit_row.new_values = new_data;
    END IF;

    INSERT INTO audit_logs VALUES (audit_row.*);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Garantir que a extensão uuid-ossp esteja disponível
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpar gatilhos antigos
DROP TRIGGER IF EXISTS audit_employees_trigger ON employees;

-- Criar novo gatilho para a tabela 'employees'
CREATE TRIGGER audit_employees_trigger
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

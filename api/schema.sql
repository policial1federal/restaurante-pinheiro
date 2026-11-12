-- Configuração do site (preços, telefone, horário, cardápio…) guardada como JSON.
-- Uma linha só, com id = 'site'. O painel do admin lê e grava essa linha.
CREATE TABLE IF NOT EXISTS configuracao (
  id TEXT PRIMARY KEY,
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Configuração do site (preços, telefone, horário, cardápio…) guardada como JSON.
-- Uma linha só, com id = 'site'. O painel do admin lê e grava essa linha.
CREATE TABLE IF NOT EXISTS configuracao (
  id TEXT PRIMARY KEY,
  dados TEXT NOT NULL,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fotos enviadas pelo painel do admin (ex.: foto principal do site).
-- Cada envio ganha um id novo; fotos que a configuração não usa mais são apagadas ao salvar.
CREATE TABLE IF NOT EXISTS imagens (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  dados BLOB NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

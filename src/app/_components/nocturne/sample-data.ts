// Dados de exemplo do layout.md. Não vêm do banco: ainda não há modelos de domínio.

export type Estado = "disponivel" | "emprestado" | "manutencao";
export type Categoria = "Notebooks" | "Monitores" | "Câmeras" | "Cabos e docks" | "Projetores";

export type Equipamento = {
  patrimonio: string;
  nome: string;
  categoria: Categoria;
  estado: Estado;
  local: string;
  descricao: string;
  /** Com quem está, quando emprestado. */
  com?: string;
  /** Devolução prevista, no formato dd/mmm. */
  devolucao?: string;
  /** Situação da assistência, quando em manutenção. */
  assistencia?: string;
  ultimaDevolucao: string;
  historico: { data: string; evento: string; resultado: string }[];
};

export const categorias: Categoria[] = ["Notebooks", "Monitores", "Câmeras", "Cabos e docks", "Projetores"];

export const equipamentos: Equipamento[] = [
  {
    patrimonio: "PAT-1042",
    nome: 'MacBook Pro 14"',
    categoria: "Notebooks",
    estado: "disponivel",
    local: "Balcão de Operações, 2º andar",
    descricao: "Notebook com 16 GB de memória e 512 GB de armazenamento, carregador USB-C incluso.",
    ultimaDevolucao: "30/ago",
    historico: [
      { data: "30/ago", evento: "Devolvido por Bruno Kato", resultado: "No prazo" },
      { data: "16/ago", evento: "Retirado por Bruno Kato", resultado: "Prazo de 14 dias" },
      { data: "02/ago", evento: "Devolvido por Ana Sato", resultado: "No prazo" },
    ],
  },
  {
    patrimonio: "PAT-0871",
    nome: 'Dell UltraSharp 27"',
    categoria: "Monitores",
    estado: "disponivel",
    local: "Balcão de Operações, 2º andar",
    descricao: "Monitor 27 polegadas com resolução 4K, cabo HDMI e USB-C incluso.",
    ultimaDevolucao: "26/ago",
    historico: [
      { data: "26/ago", evento: "Devolvido por Ana Sato", resultado: "No prazo" },
      { data: "12/ago", evento: "Retirado por Ana Sato", resultado: "Prazo de 14 dias" },
    ],
  },
  {
    patrimonio: "PAT-1188",
    nome: "ThinkPad T14",
    categoria: "Notebooks",
    estado: "emprestado",
    local: "Balcão de Operações, 2º andar",
    descricao: "Notebook com 16 GB de memória e 512 GB de armazenamento.",
    com: "Rafael Lima",
    devolucao: "12/set",
    ultimaDevolucao: "20/ago",
    historico: [
      { data: "29/ago", evento: "Retirado por Rafael Lima", resultado: "Prazo de 14 dias" },
      { data: "20/ago", evento: "Devolvido por Tiago Menezes", resultado: "No prazo" },
    ],
  },
  {
    patrimonio: "PAT-0910",
    nome: 'LG UltraFine 24"',
    categoria: "Monitores",
    estado: "emprestado",
    local: "Balcão de Operações, 2º andar",
    descricao: "Monitor 24 polegadas com conexão USB-C.",
    com: "Marina Alves",
    devolucao: "11/set",
    ultimaDevolucao: "14/ago",
    historico: [
      { data: "28/ago", evento: "Retirado por Marina Alves", resultado: "Prazo de 14 dias" },
      { data: "14/ago", evento: "Devolvido por Helena Prado", resultado: "No prazo" },
    ],
  },
  {
    patrimonio: "PAT-1190",
    nome: "ThinkPad T14",
    categoria: "Notebooks",
    estado: "manutencao",
    local: "Assistência técnica",
    descricao: "Notebook com 16 GB de memória e 512 GB de armazenamento.",
    assistencia: "troca de bateria",
    ultimaDevolucao: "02/set",
    historico: [
      { data: "02/set", evento: "Enviado para a assistência", resultado: "Troca de bateria" },
      { data: "02/set", evento: "Devolvido por Camila Duarte", resultado: "Bateria com defeito" },
    ],
  },
  {
    patrimonio: "PAT-0233",
    nome: "Sony A7 III",
    categoria: "Câmeras",
    estado: "emprestado",
    local: "Balcão de Operações, 2º andar",
    descricao: "Câmera mirrorless com lente 28–70 mm, duas baterias e cartão de memória.",
    com: "Bruno Kato",
    devolucao: "17/set",
    ultimaDevolucao: "31/jul",
    historico: [
      { data: "03/set", evento: "Retirado por Bruno Kato", resultado: "Prazo de 14 dias" },
      { data: "31/jul", evento: "Devolvido por Marina Alves", resultado: "Atraso de 2 dias" },
    ],
  },
];

export function buscarEquipamento(patrimonio: string) {
  return equipamentos.find((item) => item.patrimonio === patrimonio);
}

export const estadoRotulo: Record<Estado, string> = {
  disponivel: "Disponível",
  emprestado: "Emprestado",
  manutencao: "Manutenção",
};

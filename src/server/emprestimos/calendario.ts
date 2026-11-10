// Dias úteis no calendário de São Paulo (Spec 006). Todas as datas aqui são dias civis
// no formato "AAAA-MM-DD", sem hora, para o fuso nunca deslocar o dia.

const MS_DIA = 24 * 60 * 60 * 1000;

const doIso = (iso: string) => new Date(`${iso}T00:00:00Z`);
const paraIso = (data: Date) => data.toISOString().slice(0, 10);
const somarDias = (iso: string, dias: number) => paraIso(new Date(doIso(iso).getTime() + dias * MS_DIA));

/** Dia civil de `momento` em America/Sao_Paulo (não em UTC). */
export function dataEmSaoPaulo(momento: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    momento,
  );
}

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
export function pascoa(ano: number): string {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

const FIXOS = [
  "01-01", // Confraternização Universal
  "04-21", // Tiradentes
  "05-01", // Dia do Trabalho
  "09-07", // Independência
  "10-12", // Nossa Senhora Aparecida
  "11-02", // Finados
  "11-15", // Proclamação da República
  "11-20", // Consciência Negra
  "12-25", // Natal
  "07-09", // Revolução Constitucionalista (estadual, SP)
  "01-25", // Aniversário da cidade de São Paulo (municipal)
];

const cache = new Map<number, Set<string>>();

/** Feriados nacionais, do estado e do município de São Paulo. O Carnaval é ponto facultativo e não entra. */
export function feriadosDoAno(ano: number): Set<string> {
  const guardado = cache.get(ano);
  if (guardado) return guardado;
  const pascoaDoAno = pascoa(ano);
  const feriados = new Set([
    ...FIXOS.map((dia) => `${ano}-${dia}`),
    somarDias(pascoaDoAno, -2), // Sexta-feira Santa
    somarDias(pascoaDoAno, 60), // Corpus Christi (feriado municipal em São Paulo)
  ]);
  cache.set(ano, feriados);
  return feriados;
}

export function ehDiaUtil(iso: string): boolean {
  const diaDaSemana = doIso(iso).getUTCDay();
  if (diaDaSemana === 0 || diaDaSemana === 6) return false;
  return !feriadosDoAno(Number(iso.slice(0, 4))).has(iso);
}

/** O dia de partida não conta: o 1º dia útil é o seguinte (mesmo que a partida seja fim de semana ou feriado). */
export function adicionarDiasUteis(inicio: string, dias: number): string {
  let atual = inicio;
  let contados = 0;
  while (contados < dias) {
    atual = somarDias(atual, 1);
    if (ehDiaUtil(atual)) contados += 1;
  }
  return atual;
}

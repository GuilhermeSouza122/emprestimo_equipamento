/** "2026-12-01" -> "01/12/2026". Recebe um dia civil, sem hora, então o fuso não desloca o dia. */
export function formatarDataBr(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

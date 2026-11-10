import { describe, expect, it } from "vitest";

import { adicionarDiasUteis, dataEmSaoPaulo, ehDiaUtil, feriadosDoAno, pascoa } from "./calendario";

describe("calendario de dias uteis (Sao Paulo)", () => {
  it("calcula a Pascoa e os feriados moveis", () => {
    expect(pascoa(2025)).toBe("2025-04-20");
    expect(pascoa(2026)).toBe("2026-04-05");
    expect(pascoa(2027)).toBe("2027-03-28");

    const f2026 = feriadosDoAno(2026);
    expect(f2026.has("2026-04-03")).toBe(true); // Sexta-feira Santa
    expect(f2026.has("2026-06-04")).toBe(true); // Corpus Christi
    expect(feriadosDoAno(2027).has("2027-03-26")).toBe(true);
    expect(feriadosDoAno(2027).has("2027-05-27")).toBe(true);
  });

  it("inclui feriados nacionais, estadual e municipais de SP e nao inclui o Carnaval", () => {
    const f = feriadosDoAno(2026);
    for (const dia of ["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25", "07-09", "01-25"]) {
      expect(f.has(`2026-${dia}`), dia).toBe(true);
    }
    // Carnaval de 2026: 16 e 17 de fevereiro (ponto facultativo, nao feriado)
    expect(f.has("2026-02-16")).toBe(false);
    expect(f.has("2026-02-17")).toBe(false);
  });

  it("ehDiaUtil: fins de semana e feriados nao sao dias uteis", () => {
    expect(ehDiaUtil("2026-11-14")).toBe(false); // sabado
    expect(ehDiaUtil("2026-11-15")).toBe(false); // domingo e feriado
    expect(ehDiaUtil("2026-11-20")).toBe(false); // sexta, Consciencia Negra
    expect(ehDiaUtil("2026-07-09")).toBe(false); // quinta, feriado estadual
    expect(ehDiaUtil("2027-01-25")).toBe(false); // segunda, aniversario de SP
    expect(ehDiaUtil("2026-11-16")).toBe(true); // segunda comum
    expect(ehDiaUtil("2026-02-16")).toBe(true); // segunda de Carnaval
  });

  it("EMP-04: 14 dias uteis depois de 10/11/2026 (terca) e 01/12/2026, pulando 20/11", () => {
    expect(adicionarDiasUteis("2026-11-10", 14)).toBe("2026-12-01");
  });

  it("EMP-04: o dia do emprestimo nao conta, mesmo quando e fim de semana", () => {
    // sabado 14/11: segunda 16/11 e o 1o dia util
    expect(adicionarDiasUteis("2026-11-14", 14)).toBe("2026-12-04");
  });

  it("EMP-04: pedido em feriado conta a partir do proximo dia util", () => {
    // sexta 20/11/2026 (feriado): o 1o dia util e segunda 23/11
    expect(adicionarDiasUteis("2026-11-20", 14)).toBe("2026-12-10");
  });

  it("EMP-04: atravessa a virada de ano pulando 25/12 e 01/01", () => {
    expect(adicionarDiasUteis("2026-12-15", 14)).toBe("2027-01-06");
  });

  it("EMP-04: pula a Sexta-feira Santa", () => {
    // segunda 22/03/2027; sexta 26/03/2027 e Sexta-feira Santa
    expect(adicionarDiasUteis("2027-03-22", 14)).toBe("2027-04-12");
  });

  it("dataEmSaoPaulo usa o dia civil de America/Sao_Paulo, nao o de UTC", () => {
    // 01:30 UTC de 11/11 ainda e 22:30 de 10/11 em Sao Paulo
    expect(dataEmSaoPaulo(new Date("2026-11-11T01:30:00Z"))).toBe("2026-11-10");
    expect(dataEmSaoPaulo(new Date("2026-11-11T12:00:00Z"))).toBe("2026-11-11");
  });
});

import { NextResponse } from "next/server";
import candidatos from "@/data/candidatos.json";

export async function POST(req: Request) {
  const vaga = await req.json();

  const obrigatorios = vaga.conhecimentosObrigatorios
    ?.toLowerCase()
    .split(",")
    .map((x: string) => x.trim())
    .filter(Boolean);

  const desejados = vaga.conhecimentosDesejados
    ?.toLowerCase()
    .split(",")
    .map((x: string) => x.trim())
    .filter(Boolean);

  const observacoes = vaga.observacoes
    ?.toLowerCase()
    .split(",")
    .map((x: string) => x.trim())
    .filter(Boolean);

  const niveis = [
    "Ensino Médio",
    "Graduação",
    "Pós-Graduação",
    "Mestrado",
    "Doutorado",
  ];

  const resultados = candidatos.map((cand: any) => {
    let score = 0;
    const motivos: string[] = [];

    const vagaNivel = niveis.indexOf(vaga.escolaridade);
    const candNivel = niveis.findIndex((n) =>
      cand.escolaridade.toLowerCase().includes(n.toLowerCase())
    );

    // ----------------------
    // 1️⃣ Escolaridade (até 15 pts)
    // ----------------------
    if (candNivel === -1) {
      motivos.push("Escolaridade não informada ou fora do padrão.");
    } else if (candNivel < vagaNivel) {
      motivos.push(
        `Escolaridade inferior à exigida (${cand.escolaridade} < ${vaga.escolaridade}).`
      );
    } else {
      const diff = candNivel - vagaNivel;
      score += Math.min(15, 10 + diff * 2); // Graduação = 10, Mestrado = 12, Doutorado = 14
    }

    // ----------------------
    // 2️⃣ Conhecimentos obrigatórios (até 40 pts)
    // ----------------------
    let obrigCount = 0;
    obrigatorios.forEach((k: string) => {
      if (cand.skills.map((s: string) => s.toLowerCase()).includes(k)) {
        obrigCount++;
      } else {
        motivos.push(`Falta conhecimento obrigatório: ${k}`);
      }
    });
    score += Math.min(40, obrigCount * 10);

    // ----------------------
    // 3️⃣ Conhecimentos desejados (até 20 pts)
    // ----------------------
    let desejCount = 0;
    desejados.forEach((k: string) => {
      if (cand.skills.map((s: string) => s.toLowerCase()).includes(k)) {
        desejCount++;
      }
    });
    score += Math.min(20, desejCount * 5);

    // ----------------------
    // 4️⃣ Experiência (até 20 pts)
    // ----------------------
    const experienciaVaga = parseInt(vaga.experiencia);
    if (cand.experiencia >= experienciaVaga) {
      const ratio = Math.min(cand.experiencia / experienciaVaga, 2);
      score += Math.min(20, 10 + (ratio - 1) * 10); // 10 pts se iguala, até 20 se dobra
    } else {
      motivos.push(
        `Experiência insuficiente (${cand.experiencia} anos < ${experienciaVaga} exigidos).`
      );
      score += Math.max(0, (cand.experiencia / experienciaVaga) * 10);
    }

    // ----------------------
    // 5️⃣ Observações (até 5 pts)
    // ----------------------
    let bonus = 0;
    observacoes?.forEach((obs: string) => {
      if (cand.escolaridade.toLowerCase().includes(obs)) bonus += 1;
      cand.skills.forEach((s: string) => {
        if (s.toLowerCase().includes(obs)) bonus += 1;
      });
    });
    score += Math.min(5, bonus);

    // ----------------------
    // Resultado final
    // ----------------------
    score = Math.min(score, 100);

    return {
      nome: cand.nome,
      perfil: cand.linkedin,
      escolaridade: cand.escolaridade,
      experiencia: cand.experiencia,
      skills: cand.skills,
      score: Math.round(score),
      motivos,
    };
  });

  const top5 = resultados.sort((a, b) => b.score - a.score).slice(0, 5);
  return NextResponse.json(top5);
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function JobForm() {
  const [form, setForm] = useState({
    escolaridade: "",
    conhecimentosObrigatorios: "",
    conhecimentosDesejados: "",
    experiencia: "",
    observacoes: "",
  });

  const [resultados, setResultados] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setResultados(null);

    try {
      const res = await fetch("/api/analyze-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResultados(data);
    } catch (err) {
      console.error("Erro ao analisar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          🧩 Analisador de Vagas e Candidatos
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Seção: Requisitos da vaga */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">
              Requisitos da vaga
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Grau de Escolaridade</Label>
                <Select
                  value={form.escolaridade}
                  onValueChange={(value) =>
                    setForm({ ...form, escolaridade: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                    <SelectItem value="Graduação">Graduação</SelectItem>
                    <SelectItem value="Pós-Graduação">Pós-Graduação</SelectItem>
                    <SelectItem value="Mestrado">Mestrado</SelectItem>
                    <SelectItem value="Doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tempo de Experiência (anos)</Label>
                <Input
                  name="experiencia"
                  type="number"
                  min={0}
                  onChange={handleChange}
                  placeholder="Ex: 3"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção: Conhecimentos */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">
              Conhecimentos técnicos
            </h3>

            <div className="space-y-4">
              <div>
                <Label>Obrigatórios</Label>
                <Textarea
                  name="conhecimentosObrigatorios"
                  onChange={handleChange}
                  placeholder="Ex: React, Node.js, SQL..."
                  className="resize-none"
                />
              </div>

              <div>
                <Label>Desejáveis</Label>
                <Textarea
                  name="conhecimentosDesejados"
                  onChange={handleChange}
                  placeholder="Ex: Docker, AWS, GraphQL..."
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção: Outras observações */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-3">
              Outras informações
            </h3>
            <Textarea
              name="observacoes"
              onChange={handleChange}
              placeholder="Ex: Inglês avançado, disponibilidade para viagens..."
              className="resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Analisando...
                </>
              ) : (
                "Analisar Candidatos"
              )}
            </Button>
          </div>
        </form>

        {/* Resultados */}
        {resultados && (
          <>
            <Separator className="my-8" />
            <h2 className="text-lg font-semibold mb-4 text-center">
              🏆 Top 5 Perfis Mais Aderentes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resultados.map((r, i) => (
                <Card
                  key={r.nome}
                  className="p-5 border border-muted shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>#{i + 1}</strong> — <strong>{r.score}%</strong> de
                      aderência
                    </p>

                    <p className="font-semibold text-base">{r.nome}</p>

                    <a
                      href={r.perfil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-sm mb-1"
                    >
                      Ver perfil no LinkedIn
                    </a>

                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>🎓 {r.escolaridade}</p>
                      <p>💼 {r.experiencia} anos de experiência</p>
                      {r.skills?.length > 0 && <p>🧠 {r.skills.join(", ")}</p>}
                    </div>

                    {r.motivos.length > 0 ? (
                      <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                        {r.motivos.map((m: string, idx: number) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-700 mt-2 text-sm">
                        ✅ Atende a todos os requisitos obrigatórios e
                        desejáveis.
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

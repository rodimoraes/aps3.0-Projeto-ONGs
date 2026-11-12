import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/header.jsx";
import {
  Megaphone,
  CheckCircle2,
  Clock,
  HeartHandshake,
  DollarSign,
  Users,
  ArrowLeft,
  BarChart3,
  BarChart2,
} from "lucide-react";

function DashboardOng() {
  const { id_ong } = useParams();
  const [metrics, setMetrics] = useState(null);
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoading(true);
        const [resDash, resOng] = await Promise.all([
          fetch(`http://127.0.0.1:8000/campanhas/ong/${id_ong}/dashboard`),
          fetch(`http://127.0.0.1:8000/ongs/${id_ong}`),
        ]);
        if (resDash.ok) setMetrics(await resDash.json());
        if (resOng.ok) setOng(await resOng.json());
      } catch (error) {
        console.error("Erro ao carregar métricas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id_ong) carregarDashboard();
  }, [id_ong]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">
          Carregando painel de métricas...
        </p>
      </div>
    );
  }

  const { resumo, campanhas } = metrics || {};

  const totalCampanhas = resumo?.total_campanhas || 0;
  const ativas = resumo?.ativas || 0;
  const encerradas = resumo?.encerradas || 0;
  const pctAtivas =
    totalCampanhas > 0 ? Math.round((ativas / totalCampanhas) * 100) : 0;
  const pctEncerradas =
    totalCampanhas > 0 ? Math.round((encerradas / totalCampanhas) * 100) : 0;
  const percentualFinanceiro =
    resumo?.meta_financeira_total > 0
      ? Math.min(
          100,
          Math.round(
            (resumo.total_arrecadado / resumo.meta_financeira_total) * 100,
          ),
        )
      : 0;
  const percentualVoluntarios =
    resumo?.meta_voluntarios_total > 0
      ? Math.min(
          100,
          Math.round(
            (resumo.total_voluntarios_inscritos /
              resumo.meta_voluntarios_total) *
              100,
          ),
        )
      : 0;

  // Proporção de altura para as colunas do gráfico de status
  const maxStatusCount = Math.max(ativas, encerradas, 1);
  const alturaAtivas = Math.round((ativas / maxStatusCount) * 100);
  const alturaEncerradas = Math.round((encerradas / maxStatusCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-0">
      <Header />
      <div className="max-w-6xl mx-auto space-y-6 py-7">
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/ongs/${id_ong}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel da ONG</span>
          </Link>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            ONG: {ong?.nome || "Minha ONG"}
          </span>
        </div>

        {/* Título Principal */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Dashboard & Indicadores
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhe o desempenho, metas e engajamento das suas campanhas.
          </p>
        </div>

        {/* CARDS DE KPIS GERAIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Total Campanhas
              </span>
              <Megaphone className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-800">
              {totalCampanhas}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Registradas na plataforma
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Em Aberto (Ativas)
              </span>
              <Clock className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{ativas}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {pctAtivas}% do total de ações
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Encerradas
              </span>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-700">{encerradas}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {pctEncerradas}% do total de ações
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Voluntários Totais
              </span>
              <HeartHandshake className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-600">
              {resumo?.total_voluntarios_inscritos || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Pessoas engajadas</p>
          </div>
        </div>

        {/* SEÇÃO DE GRÁFICOS DE BARRAS VERTICAIS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 1. GRÁFICO DE BARRAS: Status das Campanhas (Ativas vs. Encerradas) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Status das Campanhas
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                Em Aberto vs. Encerradas
              </span>
            </div>

            {/* Container das Barras */}
            <div className="pt-6 pb-2 px-4 flex items-end justify-center gap-16 h-48 border-b border-slate-100">
              {/* Barra: Ativas */}
              <div className="flex flex-col items-center gap-2 h-full justify-end w-20 group">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {ativas} ({pctAtivas}%)
                </span>
                <div
                  className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-2xl transition-all duration-500"
                  style={{ height: `${Math.max(alturaAtivas, 8)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600 mt-1">
                  Ativas
                </span>
              </div>

              {/* Barra: Encerradas */}
              <div className="flex flex-col items-center gap-2 h-full justify-end w-20 group">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                  {encerradas} ({pctEncerradas}%)
                </span>
                <div
                  className="w-full bg-slate-400 hover:bg-slate-500 rounded-t-2xl transition-all duration-500"
                  style={{ height: `${Math.max(alturaEncerradas, 8)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600 mt-1">
                  Encerradas
                </span>
              </div>
            </div>

            <div className="flex items-center justify-around text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Campanhas Ativas ({ativas})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                <span>Campanhas Encerradas ({encerradas})</span>
              </div>
            </div>
          </div>

          {/* 2. GRÁFICO DE BARRAS: Desempenho de Metas por Tipo (% Atingido) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Desempenho de Metas por Tipo
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                % da Meta Atingido
              </span>
            </div>

            {/* Container das Barras */}
            <div className="pt-6 pb-2 px-4 flex items-end justify-center gap-16 h-48 border-b border-slate-100">
              {/* Barra: Arrecadação */}
              <div className="flex flex-col items-center gap-2 h-full justify-end w-20 group">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {percentualFinanceiro}%
                </span>
                <div
                  className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-2xl transition-all duration-500"
                  style={{ height: `${Math.max(percentualFinanceiro, 8)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600 mt-1">
                  Arrecadação
                </span>
              </div>

              {/* Barra: Voluntariado */}
              <div className="flex flex-col items-center gap-2 h-full justify-end w-20 group">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  {percentualVoluntarios}%
                </span>
                <div
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-t-2xl transition-all duration-500"
                  style={{ height: `${Math.max(percentualVoluntarios, 8)}%` }}
                />
                <span className="text-xs font-semibold text-slate-600 mt-1">
                  Voluntariado
                </span>
              </div>
            </div>

            <div className="flex items-center justify-around text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Arrecadado: R${" "}
                  {resumo?.total_arrecadado?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  Inscritos: {resumo?.total_voluntarios_inscritos || 0} vgs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABELA DETALHADA DAS CAMPANHAS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Detalhamento por Campanha
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-3">Título</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Meta</th>
                  <th className="py-3 px-3">Alcançado</th>
                  <th className="py-3 px-3">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {campanhas?.map((c) => {
                  const ehVol = c.id_tipo_campanha === 2;
                  const metaVal = Number(c.meta_arrecadacao || 0);
                  const atualVal = ehVol
                    ? Number(c.total_voluntarios || 0)
                    : Number(c.valor_arrecadado || 0);
                  const pct =
                    metaVal > 0
                      ? Math.min(100, Math.round((atualVal / metaVal) * 100))
                      : 0;

                  return (
                    <tr
                      key={c.id_campanha}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {c.titulo}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            ehVol
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {c.tipo_nome ||
                            (ehVol ? "Voluntariado" : "Arrecadação")}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            c.status === "ativa"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {ehVol
                          ? `${metaVal} pessoas`
                          : `R$ ${metaVal.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {ehVol
                          ? `${atualVal} voluntários`
                          : `R$ ${atualVal.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`}
                      </td>
                      <td className="py-3 px-3 w-36">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                ehVol ? "bg-purple-600" : "bg-emerald-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOng;

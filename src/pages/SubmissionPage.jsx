import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, Phone, Mail, Link as LinkIcon, Star } from "lucide-react";

import Layout from "@/components/Layout";
import GradientBackground from "@/components/ui/GradientBackground";
import { saveLead } from "@/lib/supabase";

// ✅ Kiwify links
const KIWIFY = {
  express_monthly: "https://pay.kiwify.com.br/JS51nmm",
  express_annual: "https://pay.kiwify.com.br/vc57F2N",
  standard: "https://pay.kiwify.com.br/5urVOdf",
};

export default function SubmissionPage() {
  const location = useLocation();

  const planFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("plan") || "standard").toLowerCase();
  }, [location.search]);

  // ✅ toggle mensal/anual quando for express
  const [expressBilling, setExpressBilling] = useState(
    planFromUrl === "express_annual" ? "annual" : "monthly"
  );

  useEffect(() => {
    if (planFromUrl === "express_annual") setExpressBilling("annual");
    if (planFromUrl === "express") setExpressBilling("monthly");
  }, [planFromUrl]);

  const effectivePlan = useMemo(() => {
    if (planFromUrl === "express" || planFromUrl === "express_annual") {
      return expressBilling === "annual" ? "express_annual" : "express";
    }
    return planFromUrl;
  }, [planFromUrl, expressBilling]);

  const planInfo = useMemo(() => {
    const plans = {
      express: {
        badge: "Mais popular",
        title: "Plano Investidor (Express)",
        subtitle: "Para acompanhar oportunidades semanais com rapidez e previsibilidade.",
        chipLeft: "R$ 97,00 /mês",
        chipRight: "Plano: express",
        features: [
          "Até 4 análises por mês (1 por semana)",
          "Relatório express em linguagem clara",
          "Prioridade no atendimento",
          "Prazo: até 24h",
        ],
        checkoutUrl: KIWIFY.express_monthly,
        requiresAuctionLink: false,
        requiresEmail: false,
      },
      express_annual: {
        badge: "2 meses grátis",
        title: "Plano Investidor (Anual)",
        subtitle: "Assinatura anual com 2 meses grátis.",
        chipLeft: "R$ 997,00 /ano",
        chipRight: "Plano: express_annual",
        features: [
          "Até 4 análises por mês (48/ano)",
          "Pagamento único anual",
          "2 meses grátis no anual",
          "Prioridade no atendimento",
        ],
        checkoutUrl: KIWIFY.express_annual,
        requiresAuctionLink: false,
        requiresEmail: false,
      },
      standard: {
        badge: null,
        title: "Revisão Profissional",
        subtitle: "IA + revisão humana para uma decisão segura antes do lance.",
        chipLeft: "R$ 497,00 (pagamento único)",
        chipRight: "Plano: standard",
        features: [
          "IA + revisão humana dos pontos críticos",
          "Riscos, ônus e custos destacados",
          "Checklist completo antes do lance",
          "Entrega em até 48h",
        ],
        checkoutUrl: KIWIFY.standard,
        requiresAuctionLink: true, // ✅ obrigatório para revisao profissional
        requiresEmail: true, // ✅ email obrigatório para contato
      },
    };

    return plans[effectivePlan] || plans.standard;
  }, [effectivePlan]);

  const isExpressFamily = planFromUrl === "express" || planFromUrl === "express_annual";

  // form
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [linkLeilao, setLinkLeilao] = useState("");
  const [loading, setLoading] = useState(false);

  function normalizeWhatsapp(v) {
    return (v || "").replace(/\D/g, "");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nomeOk = nome.trim().length >= 2;
    const whatsappOk = normalizeWhatsapp(whatsapp).length >= 10;

    if (!nomeOk || !whatsappOk) return;

    if (planInfo.requiresEmail && (email || "").trim().length < 5) return;
    if (planInfo.requiresAuctionLink && (linkLeilao || "").trim().length < 8) return;

    setLoading(true);

    // ✅ salva lead antes de redirecionar
    const payload = {
      source: "submission",
      plan: effectivePlan,
      nome: nome.trim(),
      whatsapp: normalizeWhatsapp(whatsapp),
      email: (email || "").trim() || null,
      link_leilao: planInfo.requiresAuctionLink ? (linkLeilao || "").trim() : null,
    };

    const res = await saveLead(payload);

    // ❌ Nunca mostrar erro pro cliente
    if (!res?.ok) console.warn("Falha ao salvar lead no Supabase (seguindo checkout):", res);

    // ✅ micro delay ajuda alguns browsers a concluir a request antes do redirect
    await new Promise((r) => setTimeout(r, 250));

    window.location.assign(planInfo.checkoutUrl);
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <Layout>
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541806631522-7a6c17387462"
            alt="Leilão de imóveis"
            className="w-full h-full object-cover"
          />
          <GradientBackground variant="hero" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div {...fadeInUp} className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              ← Voltar
            </Link>
          </motion.div>

          <motion.div {...fadeInUp} className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {planInfo.badge && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#d4af37] text-black">
                  <Star className="w-3 h-3 fill-current" />
                  {planInfo.badge}
                </span>
              )}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-gray-700 text-gray-200 text-sm">
                <Shield className="w-4 h-4 text-[#d4af37]" />
                {planInfo.chipLeft}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-gray-700 text-gray-200 text-sm">
                {planInfo.chipRight}
              </span>
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="mb-10">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="text-white">{planInfo.title.split(" ").slice(0, 1).join(" ")}</span>{" "}
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                {planInfo.title.split(" ").slice(1).join(" ")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mt-3 max-w-3xl">{planInfo.subtitle}</p>
          </motion.div>

          {/* ✅ Toggle igual da home (apenas express) */}
          {isExpressFamily && (
            <motion.div {...fadeInUp} className="mb-10">
              <div className="inline-flex bg-gray-900/50 border border-gray-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setExpressBilling("monthly")}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition ${
                    expressBilling === "monthly"
                      ? "bg-[#d4af37] text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setExpressBilling("annual")}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition ${
                    expressBilling === "annual"
                      ? "bg-[#d4af37] text-black"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Anual
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left */}
            <motion.div {...fadeInUp} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/15 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">O que você recebe</h2>

                <ul className="space-y-4">
                  {planInfo.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-gray-200">
                      <CheckCircle className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-gray-400 mt-6 italic">
                  * A decisão de participação no leilão é de responsabilidade do comprador.
                </p>
              </div>
            </motion.div>

            {/* Right */}
            <motion.div {...fadeInUp} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl blur-xl" />

              <form
                onSubmit={handleSubmit}
                className="relative bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-2">Preencha para continuar</h2>
                <p className="text-gray-300 mb-6">
                  Você será direcionado ao checkout para concluir o pagamento.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2">
                      <Phone className="w-4 h-4" />
                      Nome completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/70"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2">
                      <Phone className="w-4 h-4" />
                      WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(DDD) 00000-0000"
                      className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/70"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2">
                      <Mail className="w-4 h-4" />
                      E-mail{" "}
                      {planInfo.requiresEmail ? (
                        <span className="text-red-400">*</span>
                      ) : (
                        <span className="text-gray-400">(opcional)</span>
                      )}
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/70"
                      autoComplete="email"
                      required={planInfo.requiresEmail}
                    />
                  </div>

                  {planInfo.requiresAuctionLink && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#d4af37] mb-2">
                        <LinkIcon className="w-4 h-4" />
                        Link do leilão <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={linkLeilao}
                        onChange={(e) => setLinkLeilao(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]/70"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-extrabold text-black transition-all ${
                      loading
                        ? "bg-[#d4af37]/70 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:shadow-lg hover:shadow-[#d4af37]/30"
                    }`}
                  >
                    {loading ? "Redirecionando..." : "Ir para pagamento"}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-xs text-gray-400">
                    Ao continuar, você será direcionado para a página segura de pagamento (Kiwify).
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

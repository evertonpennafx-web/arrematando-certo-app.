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
        requiresAuctionLink: true,
        requiresEmail: true,
      },
    };

    return plans[effectivePlan] || plans.standard;
  }, [effectivePlan]);

  const isExpressFamily = planFromUrl === "express" || planFromUrl === "express_annual";

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

    const payload = {
      source: "submission",
      plan: effectivePlan,
      nome: nome.trim(),
      whatsapp: normalizeWhatsapp(whatsapp),
      email: (email || "").trim() || null,
      link_leilao: planInfo.requiresAuctionLink ? (linkLeilao || "").trim() : null,
    };

    const res = await saveLead(payload);

    // ✅ PIXEL EVENTS (ADICIONADO)
    try {
      if (window.fbq) {
        window.fbq("track", "Lead");
        window.fbq("track", "InitiateCheckout", { plan: effectivePlan });
        window.fbq("trackCustom", "SubmitLead", { plan: effectivePlan });
      }
    } catch (e) {}

    if (!res?.ok) console.warn("Falha ao salvar lead no Supabase:", res);

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
            <Link to="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition">
              ← Voltar
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">

            <motion.div {...fadeInUp} className="relative">
              <form onSubmit={handleSubmit}
                className="relative bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-8">

                <h2 className="text-2xl font-bold mb-2">Preencha para continuar</h2>

                <div className="space-y-4">

                  <input value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Nome" required />
                  <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="WhatsApp" required />

                  {planInfo.requiresEmail &&
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
                  }

                  {planInfo.requiresAuctionLink &&
                    <input value={linkLeilao} onChange={(e)=>setLinkLeilao(e.target.value)} placeholder="Link do leilão" required />
                  }

                  <button type="submit" disabled={loading}>
                    {loading ? "Redirecionando..." : "Ir para pagamento"}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                </div>
              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
}

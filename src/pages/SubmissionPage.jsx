import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  User,
  Shield,
  Star,
} from "lucide-react";

import Layout from "@/components/Layout";
import GradientBackground from "@/components/ui/GradientBackground";
import { pricingPlans } from "@/lib/stripe";

// ✅ WhatsApp oficial: 11 98341-1251 (formato wa.me)
const WHATSAPP_NUMBER = "5511983411251";

export default function SubmissionPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const planKey = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("plan") || "standard").toLowerCase();
  }, [location.search]);

  const planInfo = useMemo(() => {
    const p = pricingPlans?.[planKey] || pricingPlans?.standard;

    const title = p?.name || "Plano";
    const description = p?.description || "";
    const features = Array.isArray(p?.features) ? p.features : [];

    // label de preço (bonito)
    let priceLabel = "";
    if (planKey === "standard") {
      priceLabel = p?.price ? `R$ ${p.price}` : "";
      // exibição extra
      priceLabel = priceLabel ? `${priceLabel} (pagamento único)` : "Valor sob consulta";
    } else if (planKey === "express") {
      priceLabel = p?.price ? `R$ ${p.price} /mês` : "Valor sob consulta";
    } else if (planKey === "express_annual") {
      priceLabel = p?.price ? `R$ ${p.price} /ano` : "Valor sob consulta";
    } else {
      priceLabel = p?.price ? `R$ ${p.price}` : "Valor sob consulta";
    }

    // bullets coerentes (evita textos errados)
    const bullets =
      planKey === "standard"
        ? [
            "IA + revisão humana dos pontos críticos",
            "Riscos, ônus e custos destacados",
            "Checklist completo antes do lance",
            "Entrega em até 48h",
          ]
        : planKey === "express"
        ? [
            "Até 4 análises por mês (1 por semana)",
            "Relatório express em linguagem clara",
            "Prioridade no atendimento",
            "Prazo: até 24h",
          ]
        : planKey === "express_annual"
        ? [
            "Até 4 análises por mês (48/ano)",
            "Pagamento único anual",
            "2 meses grátis no anual",
            "Prioridade no atendimento",
          ]
        : features.length
        ? features
        : ["Detalhes do plano serão confirmados no atendimento."];

    const badge =
      p?.badge ||
      (p?.popular ? "Mais Popular" : null);

    return {
      title,
      description,
      priceLabel,
      bullets,
      badge,
    };
  }, [planKey]);

  // Inputs uncontrolled
  const nomeRef = useRef(null);
  const whatsappRef = useRef(null);
  const emailRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();

    const nome = (nomeRef.current?.value || "").trim();
    const whatsapp = (whatsappRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim();

    if (!nome || !whatsapp) {
      alert("Preencha pelo menos Nome e WhatsApp.");
      return;
    }

    setLoading(true);

    const lead = {
      nome,
      whatsapp,
      email,
      plan: planKey,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ac_lead", JSON.stringify(lead));
    } catch (_) {}

    const planSummary =
      planKey === "standard"
        ? "Revisão Profissional (IA + humano)"
        : planKey === "express"
        ? "Plano Investidor (Express) — 4 análises/mês"
        : planKey === "express_annual"
        ? "Plano Investidor (Anual) — 4 análises/mês"
        : planInfo.title;

    const text = encodeURIComponent(
      `Olá! Quero contratar: ${planSummary}.\n` +
        `Preço: ${planInfo.priceLabel}\n\n` +
        `Nome: ${lead.nome}\n` +
        `WhatsApp: ${lead.whatsapp}\n` +
        `E-mail: ${lead.email || "-"}\n\n` +
        `Pode me orientar no próximo passo para liberar o acesso?`
    );

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.location.assign(url);
  }

  return (
    <Layout>
      {/* Hero / Background no estilo do site */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541806631522-7a6c17387462"
            alt="Imóveis em leilão"
            className="w-full h-full object-cover"
          />
          <GradientBackground variant="hero" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between gap-4 mb-8">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition inline-flex items-center gap-2"
              >
                ← Voltar
              </Link>

              {planInfo.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-xs font-bold shadow-lg">
                  <Star className="w-4 h-4 fill-current" />
                  {planInfo.badge}
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {planInfo.title.split(" ").slice(0, 1).join(" ")}{" "}
                <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d87f] bg-clip-text text-transparent">
                  {planInfo.title.split(" ").slice(1).join(" ")}
                </span>
              </h1>

              <p className="text-gray-300 text-lg max-w-3xl mb-4">
                {planInfo.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-gray-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-900/40 border border-gray-800 backdrop-blur-sm">
                  <Shield className="w-4 h-4 text-[#d4af37]" />
                  <span className="font-semibold">{planInfo.priceLabel}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-900/40 border border-gray-800 backdrop-blur-sm">
                  <span className="text-sm opacity-90">
                    Plano: <b className="text-white">{planKey}</b>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mt-10">
              {/* Card: o que recebe */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/15 to-transparent rounded-2xl blur-xl" />
                <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
                  <h3 className="text-2xl font-bold mb-6">O que você recebe</h3>

                  <ul className="space-y-3">
                    {planInfo.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-200">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 text-sm text-gray-400">
                    * A decisão de participação no leilão é de responsabilidade do comprador.
                  </div>
                </div>
              </motion.div>

              {/* Card: formulário */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-2xl blur-xl" />
                <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
                  <h3 className="text-2xl font-bold mb-2">Preencha para continuar</h3>
                  <p className="text-gray-400 mb-6">
                    Você será direcionado ao WhatsApp para confirmar os dados e liberar o acesso.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-[#d4af37] font-semibold inline-flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        Nome completo <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={nomeRef}
                        name="nome"
                        autoComplete="name"
                        placeholder="Seu nome"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-800 focus:border-[#d4af37]/60 outline-none text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#d4af37] font-semibold inline-flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" />
                        WhatsApp <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={whatsappRef}
                        name="whatsapp"
                        autoComplete="tel"
                        placeholder="(DDD) 00000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-800 focus:border-[#d4af37]/60 outline-none text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#d4af37] font-semibold inline-flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        E-mail (opcional)
                      </label>
                      <input
                        ref={emailRef}
                        name="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-800 focus:border-[#d4af37]/60 outline-none text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                        loading
                          ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/40"
                      }`}
                    >
                      {loading ? "Abrindo WhatsApp..." : "Continuar no WhatsApp"}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-xs text-gray-500">
                      Ao continuar, você inicia um atendimento para confirmar dados e liberar o acesso ao plano.
                    </div>
                  </div>
                </div>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

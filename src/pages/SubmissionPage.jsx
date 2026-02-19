import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Mail,
  User,
  Phone,
  Shield,
  Star,
  Link as LinkIcon,
} from "lucide-react";

import Layout from "@/components/Layout";
import GradientBackground from "@/components/ui/GradientBackground";
import { pricingPlans } from "@/lib/stripe";

/**
 * ✅ LINKS KIWIFY (já configurados por você)
 */
const CHECKOUTS = {
  express: "https://pay.kiwify.com.br/JS51nmm",       // mensal 97
  express_annual: "https://pay.kiwify.com.br/vc57F2N", // anual 997
  standard: "https://pay.kiwify.com.br/5urVOdf",      // revisão profissional
};

export default function SubmissionPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Plan vindo da URL
  const urlPlan = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("plan") || "standard").toLowerCase();
  }, [location.search]);

  /**
   * ✅ Toggle interno (igual Home)
   * Se entrar com ?plan=express, o usuário escolhe mensal/anual na própria página.
   */
  const [expressBilling, setExpressBilling] = useState("monthly"); // monthly | annual

  // Plan efetivo: se urlPlan=express usamos o toggle; caso contrário, usa o plan da URL
  const effectivePlanKey = useMemo(() => {
    if (urlPlan === "express") {
      return expressBilling === "monthly" ? "express" : "express_annual";
    }
    return urlPlan;
  }, [urlPlan, expressBilling]);

  const planInfo = useMemo(() => {
    const p = pricingPlans?.[effectivePlanKey] || pricingPlans?.standard;

    const title = p?.name || "Plano";
    const description = p?.description || "";
    const badge = p?.badge || (p?.popular ? "Mais Popular" : null);

    let priceLabel = "";
    if (effectivePlanKey === "standard") priceLabel = `R$ ${p?.price || "497,00"} (pagamento único)`;
    else if (effectivePlanKey === "express") priceLabel = `R$ ${p?.price || "97,00"} /mês`;
    else if (effectivePlanKey === "express_annual") priceLabel = `R$ ${p?.price || "997,00"} /ano`;
    else priceLabel = p?.price ? `R$ ${p.price}` : "Valor sob consulta";

    // bullets padronizados
    const bullets =
      effectivePlanKey === "standard"
        ? [
            "IA + revisão humana dos pontos críticos",
            "Riscos, ônus e custos destacados",
            "Checklist completo antes do lance",
            "Entrega em até 48h",
          ]
        : effectivePlanKey === "express"
        ? [
            "Até 4 análises por mês (ideal: 1 por semana)",
            "Relatório express em linguagem clara",
            "Prioridade no atendimento",
            "Prazo: até 24h",
          ]
        : effectivePlanKey === "express_annual"
        ? [
            "Até 4 análises por mês (48/ano)",
            "Pagamento único anual",
            "2 meses grátis no anual",
            "Prioridade no atendimento",
          ]
        : Array.isArray(p?.features) && p.features.length
        ? p.features
        : ["Detalhes do plano serão confirmados no atendimento."];

    return { title, description, badge, priceLabel, bullets };
  }, [effectivePlanKey]);

  // Inputs uncontrolled
  const nomeRef = useRef(null);
  const whatsappRef = useRef(null);
  const emailRef = useRef(null);
  const linkRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();

    const nome = (nomeRef.current?.value || "").trim();
    const whatsapp = (whatsappRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim();
    const linkLeilao = (linkRef.current?.value || "").trim();

    // ✅ Contato obrigatório em TODOS os planos (como você pediu)
    if (!nome || !whatsapp || !email) {
      alert("Preencha Nome, WhatsApp e E-mail.");
      return;
    }

    // ✅ Standard exige link do leilão obrigatório
    if (effectivePlanKey === "standard" && !linkLeilao) {
      alert("Informe o link do leilão (obrigatório para Revisão Profissional).");
      return;
    }

    setLoading(true);

    const lead = {
      nome,
      whatsapp,
      email,
      linkLeilao: effectivePlanKey === "standard" ? linkLeilao : "",
      plan: effectivePlanKey,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("ac_lead", JSON.stringify(lead));
    } catch (_) {}

    const checkout = CHECKOUTS[effectivePlanKey];

    if (!checkout) {
      alert("Checkout não configurado para esse plano.");
      setLoading(false);
      return;
    }

    // ✅ vai direto pro checkout Kiwify
    window.location.href = checkout;
  }

  return (
    <Layout>
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541806631522-7a6c17387462"
            alt="Imóveis em leilão"
            className="w-full h-full object-cover"
          />
          <GradientBackground variant="hero" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
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
                {planInfo.title}
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
                    Plano: <b className="text-white">{effectivePlanKey}</b>
                  </span>
                </div>
              </div>

              {/* ✅ Toggle igual da Home: só aparece quando entra em ?plan=express */}
              {urlPlan === "express" && (
                <div className="mt-6 inline-flex items-center bg-gray-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setExpressBilling("monthly")}
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
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
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                      expressBilling === "annual"
                        ? "bg-[#d4af37] text-black"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Anual
                  </button>
                </div>
              )}
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mt-10">
              {/* BENEFÍCIOS */}
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

              {/* FORM + CHECKOUT */}
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
                    Seus dados serão usados para confirmar o pedido. Em seguida, você será direcionado ao checkout.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-[#d4af37] font-semibold inline-flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        Nome completo <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={nomeRef}
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
                        placeholder="(DDD) 00000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-800 focus:border-[#d4af37]/60 outline-none text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[#d4af37] font-semibold inline-flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        E-mail <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={emailRef}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-800 focus:border-[#d4af37]/60 outline-none text-white"
                      />
                    </div>

                    {effectivePlanKey === "standard" && (
                      <div>
                        <label className="text-sm text-[#d4af37] font-semibold inline-flex items-center gap-2 mb-2">
                          <LinkIcon className="w-4 h-4" />
                          Link do leilão <span className="text-red-400">*</span>
                        </label>
                        <input
                          ref={linkRef}
                          placeholder="https://..."
                          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-800 focus:border-[#d4af37]/60 outline-none text-white"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
                        loading
                          ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/40"
                      }`}
                    >
                      {loading ? "Abrindo checkout..." : "Ir para pagamento"}
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="text-xs text-gray-500">
                      Ao continuar, você será direcionado ao checkout para concluir a compra.
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

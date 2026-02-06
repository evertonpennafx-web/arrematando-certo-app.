import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import Layout from "@/components/Layout";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function FreeTastingPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome || !email || !file) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Upload do PDF no bucket CORRETO
      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Erro upload:", uploadError);
        throw uploadError;
      }

      // 2️⃣ URL pública do PDF
      const { data: urlData } = supabase.storage
        .from("pdfs")
        .getPublicUrl(fileName);

      const pdfUrl = urlData.publicUrl;

      // 3️⃣ Token de acesso
      const accessToken = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 60 * 60 * 1000
      ).toISOString(); // 1h

      // 4️⃣ Cria registro no preview_gratuito
      const { data, error } = await supabase
        .from("preview_gratuito")
        .insert({
          nome,
          email,
          whatsapp,
          url_pdf: pdfUrl,
          status: "received",
          access_token: accessToken,
          token_expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro insert:", error);
        throw error;
      }

      const id = data.id;

      // 5️⃣ DISPARA PROCESSAMENTO (sem await)
      fetch("/api/analisar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      // 6️⃣ Redireciona para o relatório
      navigate(`/relatorio?id=${id}&t=${accessToken}`);
    } catch (err) {
      console.error(err);
      alert(
        err?.message ||
        "Erro ao enviar edital. Verifique o arquivo e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">
          Degustação Gratuita
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            type="text"
            placeholder="WhatsApp (opcional)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-bold py-3 rounded"
          >
            {loading ? "Enviando..." : "Analisar edital gratuitamente"}
          </button>
        </form>
      </div>
    </Layout>
  );
}


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { submitConsultationRequest, uploadPdfToStorage } from '@/lib/supabase';
import PdfUploadField from '@/components/PdfUploadField';

const ConsultationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    caso_link_descricao: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.nome || !formData.email || !formData.whatsapp || !formData.caso_link_descricao) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      let pdfUrl = null;
      if (pdfFile) {
        toast({
            title: "Enviando arquivo...",
            description: "Aguarde enquanto fazemos o upload do seu PDF.",
        });
        pdfUrl = await uploadPdfToStorage(pdfFile, 'consultation_files');
      }

      // Syncs with consultation_requests table: nome, email, whatsapp, caso_link_descricao, pdf_url
      await submitConsultationRequest({
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.whatsapp,
        caso_link_descricao: formData.caso_link_descricao,
        pdf_url: pdfUrl
      });

      toast({
        title: "Solicitação enviada!",
        description: "Entraremos em contato em breve.",
      });

      navigate('/sucesso-formulario');
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-black p-8 rounded-xl border border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.1)]">
      <h3 className="text-2xl font-bold mb-6 text-white border-b border-[#d4af37]/30 pb-4">Solicitar Avaliação</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#d4af37] mb-2">Nome completo</label>
          <input
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-gray-600 transition-all"
            placeholder="Seu nome"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#d4af37] mb-2">E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-gray-600 transition-all"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#d4af37] mb-2">WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            required
            className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-gray-600 transition-all"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#d4af37] mb-2">Link do leilão ou descrição</label>
          <textarea
            name="caso_link_descricao"
            value={formData.caso_link_descricao}
            onChange={handleChange}
            required
            rows={4}
            className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-gray-600 transition-all"
            placeholder="Cole o link ou descreva seu caso..."
          />
        </div>

        <div className="pt-2">
            <PdfUploadField 
                label="Anexar arquivo (Opcional)"
                onFileSelect={setPdfFile}
            />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#d4af37] hover:bg-[#b8941f] text-black font-bold uppercase tracking-wide rounded-lg transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processando...' : 'Enviar Solicitação'}
        </button>
      </form>
    </div>
  );
};

export default ConsultationForm;

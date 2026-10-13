import React, { useState } from 'react';
import { Building2, User, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { filterSlug } from '../../utils/inputFilters';

export default function CreateCompanyModal({ isOpen, onClose, onSubmit, isSubmitting, errorMsg }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    cnpj: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, name: val };
      if (!slugManuallyEdited) {
        next.slug = filterSlug(val);
      }
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name.trim(),
      slug: formData.slug.toLowerCase().trim().replace(/^-+|-+$/g, ''),
      cnpj: formData.cnpj?.trim() || null,
      phone: formData.phone?.trim() || null,
      adminUser: formData.adminEmail ? {
        name: formData.adminName?.trim() || `Admin ${formData.name.trim()}`,
        email: formData.adminEmail.trim().toLowerCase(),
        password: formData.adminPassword,
      } : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] dark:bg-[#1a1a20] border border-[#e4ded4] dark:border-[#2e2e38] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-[#1c1917] dark:text-[#ececf0]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#e4ded4] dark:border-[#2e2e38]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c1917] dark:text-white">Cadastrar Estabelecimento</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Novo restaurante e conta de acesso do proprietário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-[#26262e] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dados do Restaurante */}
          <div className="space-y-3.5">
            <Input
              label="Nome Fantasia do Estabelecimento *"
              name="name"
              required
              value={formData.name}
              onChange={handleNameChange}
              filter="text"
              placeholder="Ex: Cantina Bella Vista"
            />

            <Input
              label="Slug do Cardápio Público (/cardapio/:slug) *"
              name="slug"
              required
              value={formData.slug}
              onChange={handleSlugChange}
              filter="slug"
              placeholder="cantina-bella-vista"
              helperText="Identificador único para a URL pública do restaurante"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                filter="cnpj"
                placeholder="00.000.000/0001-00"
              />
              <Input
                label="Telefone / WhatsApp"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                filter="phone"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Dados do Dono / Administrador */}
          <div className="pt-3.5 border-t border-[#e4ded4] dark:border-[#2e2e38] space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-orange-500" />
              <span>Acesso do Dono / Administrador</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 -mt-1">
              O proprietário usará este e-mail e senha para gerenciar o cardápio e os pedidos.
            </p>

            <Input
              label="Nome do Dono / Responsável"
              name="adminName"
              value={formData.adminName}
              onChange={(e) => setFormData((prev) => ({ ...prev, adminName: e.target.value }))}
              filter="text"
              placeholder="Ex: Marcos Silva"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="E-mail de Login do Dono *"
                name="adminEmail"
                type="email"
                required
                value={formData.adminEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))}
                filter="email"
                placeholder="dono@restaurante.com"
              />
              <Input
                label="Senha Inicial *"
                name="adminPassword"
                type="password"
                required
                value={formData.adminPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminPassword: e.target.value }))}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#e4ded4] dark:border-[#2e2e38]">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Criar Estabelecimento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

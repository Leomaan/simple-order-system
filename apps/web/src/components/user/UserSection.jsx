import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUser';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { formatErrorMessage } from '../util/errorUtil';
import { Plus, X } from 'lucide-react';

const roleLabel = { ADMIN: 'Admin', WAITER: 'Garçom' };
const emptyForm = { name: '', email: '', password: '', role: 'WAITER' };

export default function UserSection() {
  const { users, loading, createUser, updateUser, deleteUser, totalPages, currentPage, setPage } = useUsers();
  const { user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const data = { name: form.name, role: form.role };
        await updateUser(editing.id, data);
      } else {
        await createUser(form);
      }
      closeForm();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteUser(deleting.id);
      setDeleting(null);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao excluir usuário');
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {deleting && (
        <ConfirmModal
          title={`Excluir usuário ${deleting.name}?`}
          message={`O usuário "${deleting.name}" será removido do sistema. Esta ação pode ser revertida pelo superadmin.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Usuários do Sistema</h2>
          <p className="text-neutral-500 text-sm">Gerencie o acesso de garçons e administradores</p>
        </div>
        <Button
          onClick={showForm ? closeForm : openCreate}
          variant={showForm ? 'secondary' : 'primary'}
          className="w-full sm:w-auto py-3 px-5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'Cancelar' : 'Novo usuário'}</span>
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel border border-neutral-800 rounded-2xl p-6 mb-8 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-white font-bold text-lg">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ex: João Silva"
            />

            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required={!editing}
              disabled={!!editing}
              placeholder="email@exemplo.com"
            />

            {!editing && (
              <Input
                label="Senha de Acesso"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Mínimo 6 caracteres"
              />
            )}

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">Função / Cargo</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-850 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors"
              >
                <option value="WAITER">Garçom</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <ErrorMessage message={error} />

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" onClick={closeForm} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
          <p className="text-neutral-550 font-medium">Nenhum usuário cadastrado no sistema.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all">
              {/* Linha Superior: Nome, Badges e Cargo */}
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-750 flex items-center justify-center text-neutral-300 font-bold text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-extrabold text-base leading-tight break-words">{u.name}</p>
                      {u.isSuperAdmin && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md">SuperAdmin</span>
                      )}
                      {!u.active && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md">Inativo</span>
                      )}
                    </div>
                    <p className="text-neutral-450 text-xs mt-1 truncate">{u.email}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border whitespace-nowrap ${
                  u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}>
                  {roleLabel[u.role]}
                </span>
              </div>

              {/* Linha Inferior: Ações */}
              {!u.isSuperAdmin && u.id !== currentUser?.userId && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-850/60 mt-1">
                  <Button variant="ghost" onClick={() => openEdit(u)} className="text-xs py-1.5 px-3.5 border border-neutral-800 hover:border-neutral-700">
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(u)} className="text-xs py-1.5 px-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20">
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-neutral-850 bg-neutral-900/10 rounded-2xl px-5 py-4 mt-6">
          <p className="text-xs text-neutral-500 font-semibold select-none">
            Mostrando página <span className="text-neutral-350">{currentPage}</span> de <span className="text-neutral-350">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="text-xs py-1.5 px-4"
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="text-xs py-1.5 px-4"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
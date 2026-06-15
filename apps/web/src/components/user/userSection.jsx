import { useState } from 'react';
import { useUsers } from '../../hooks/useUser';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../ui/confirmModal';

const roleLabel = { ADMIN: 'Admin', WAITER: 'Garçom' };
const emptyForm = { name: '', email: '', password: '', role: 'WAITER' };

export default function UsersSection() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
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
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteUser(deleting);
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
    <div className="p-8">
      {deleting && (
        <ConfirmModal
          title="Excluir usuário?"
          message="O usuário será removido do sistema. Esta ação pode ser revertida pelo superadmin."
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Usuários</h2>
        <button
          onClick={showForm ? closeForm : openCreate}
          className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo usuário'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 flex flex-col gap-4">
          <h3 className="text-white font-medium">{editing ? 'Editar usuário' : 'Novo usuário'}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Nome completo"
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required={!editing}
                disabled={!!editing}
                placeholder="email@exemplo.com"
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600 disabled:opacity-50"
              />
            </div>

            {!editing && (
              <div className="flex flex-col gap-1">
                <label className="text-neutral-400 text-sm">Senha</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Função</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
              >
                <option value="WAITER">Garçom</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 self-end">
            <button type="button" onClick={closeForm} className="text-neutral-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : users.length === 0 ? (
        <p className="text-neutral-500 text-sm">Nenhum usuário encontrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{u.name}</p>
                  {u.isSuperAdmin && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md">SuperAdmin</span>
                  )}
                  {!u.active && (
                    <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md">Inativo</span>
                  )}
                </div>
                <p className="text-neutral-500 text-xs mt-0.5">{u.email} · {roleLabel[u.role]}</p>
              </div>
              <div className="flex items-center gap-3">
                {!u.isSuperAdmin && u.id !== currentUser?.userId && (
                  <>
                    <button onClick={() => openEdit(u)} className="text-neutral-400 hover:text-white text-xs transition-colors">
                      Editar
                    </button>
                    <button onClick={() => setDeleting(u.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Produtos', key: 'products' },
  { label: 'Pedidos', key: 'orders' },
];

export default function sidebar({ active, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-white font-bold text-lg tracking-tight">Simple Order</h1>
        <p className="text-neutral-500 text-xs mt-0.5">Painel Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              active === item.key
                ? 'bg-orange-500 text-white font-medium'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-neutral-800">
        <p className="text-neutral-400 text-xs mb-2 truncate">{user?.name}</p>
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-300 text-xs transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
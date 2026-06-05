import { useState } from 'react';
import sidebar from '../components/layout/sidebar';
import productsSection from '../components/product/productSection';
import ordersSection from '../components/order/orderSection';

const sections = {
  products: productsSection,
  orders: ordersSection,
};

export default function admin() {
  const [active, setActive] = useState('products');

  const Section = sections[active];

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {sidebar({ active, onNavigate: setActive })}
      <main className="flex-1 overflow-y-auto">
        <Section />
      </main>
    </div>
  );
}
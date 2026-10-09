/**
 * Configurações personalizáveis do restaurante para exibição no cardápio público.
 * Edite os campos abaixo para alterar o nome, horários, endereço, contato e imagens.
 */
export const restaurantConfig = {
  // Informações principais
  name: 'Simple Order Gastronomia',
  description: 'Culinária artesanal feita com ingredientes selecionados, porções caprichadas, lanches e bebidas geladas.',
  
  // Foto / Logotipo exibido à direita no cabeçalho do restaurante
  photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=320&auto=format&fit=crop&q=80',
  
  // Status de funcionamento
  isOpen: true,
  statusOpenText: 'Aberto agora',
  statusClosedText: 'Fechado no momento',

  // Horários de atendimento
  hours: 'Terça a Domingo: 18:00 às 23:30',
  
  // Endereço (exibido logo abaixo do horário)
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  mapsUrl: 'https://maps.google.com/?q=Av.+Paulista,+1000',

  // Contatos
  phone: '(11) 98765-4321',
  phoneRaw: '11987654321',
  whatsapp: '5511987654321', // Código do país + DDD + número (para link direto do WhatsApp)

  // Compartilhamento
  share: {
    title: 'Cardápio Digital - Simple Order',
    text: 'Acesse nosso cardápio digital completo e faça seus pedidos!',
  },
};

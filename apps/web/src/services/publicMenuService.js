import { publicApi } from '../config/public/publicApi.js';

export async function fetchPublicMenu(category = null, slug = null) {
  const params = {};
  if (category && category !== 'ALL') {
    params.category = category;
  }

  const endpoint = slug ? `/public/menu/${slug}` : '/public/menu';
  const response = await publicApi.get(endpoint, { params });
  return {
    products: response.data?.data || [],
    company: response.data?.company || null,
  };
}

import { publicApi } from '../config/public/publicApi.js';

export async function fetchPublicMenu(category = null) {
  const params = {};
  if (category && category !== 'ALL') {
    params.category = category;
  }

  const response = await publicApi.get('/public/menu', { params });
  return response.data?.data || [];
}

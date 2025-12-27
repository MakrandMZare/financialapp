import axios from "axios";

export const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export cosnt UsersAPI = {
  create: (payload: { username: string; mobile: string; email: string }) => api.post('/users', payload),
  list: () => api.get('/users'),
  update: (id: number, payload: { username?: string; mobile?: string; email?: string }) => api.put(`/users/${id}`, payload),
  delete: (id: number) => api.delete(`/users/${id}`),
};
export const TxnAPI = {
  create: (payload: { user_id: number; txn_type: 'GIVEN' | 'RECEIVED'; amount: number, notes?: string; txn_date: string }) => api.post('/transactions', payload),
  listByUser: (userId: number, params?: {from?: string, to?: string }) => api.get(`/transactions/user/${userId}`, { params }),
  update: (id: number, payload: { txn_type?: 'GIVEN' | 'RECEIVED'; amount?: number; notes?: string; txn_date?: string }) => api.put(`/transactions/${id}`, payload),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};
import { api } from './api';
export async function getUsers(params = {}) {
    const response = await api.get('/users', {
        params: {
            keyword: params.keyword || undefined,
            limit: params.limit ?? 50,
            offset: params.offset ?? 0
        }
    });
    return response.data.data;
}
export async function createUser(input) {
    const response = await api.post('/users', input);
    return response.data.data;
}
export async function updateUser(id, input) {
    const response = await api.put(`/users/${id}`, input);
    return response.data.data;
}

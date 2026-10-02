import { api } from './api';

export const applicationService = {
  getCvPreviewUrl: async (applicationId: number | string) => {
    const response = await api.get<Blob>(`/applications/${applicationId}/cv`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};

import { api } from './api';
import type { BaseResponse } from '../types/api.types';

export interface Province {
  code: string;
  name: string;
}

export const locationService = {
  getProvinces: async () => {
    const response = await api.get<BaseResponse<Province[]>>('/locations/provinces');
    return response.data.data;
  }
};

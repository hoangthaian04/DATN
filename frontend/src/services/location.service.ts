import { api } from './api';
import type { BaseResponse } from '../types/api.types';

export interface LocationOption {
  code: string;
  name: string;
}

export type Province = LocationOption;

export const locationService = {
  getProvinces: async () => {
    const response = await api.get<BaseResponse<LocationOption[]>>('/locations/provinces');
    return response.data.data;
  },

  getWards: async (provinceCode: string) => {
    const response = await api.get<BaseResponse<LocationOption[]>>(
      `/locations/provinces/${encodeURIComponent(provinceCode)}/wards`,
    );
    return response.data.data;
  },
};

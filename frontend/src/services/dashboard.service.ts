import api from "./api";
import type { BaseResponse } from "@/types/api.types";
import type { DashboardOverviewResponse } from "@/types/dashboard.types";

export const dashboardService = {
  getOverview: async (range: string = "30d"): Promise<DashboardOverviewResponse> => {
    const response = await api.get<BaseResponse<DashboardOverviewResponse>>(
      `/dashboards/overview?range=${range}`
    );
    return response.data.data;
  },
};

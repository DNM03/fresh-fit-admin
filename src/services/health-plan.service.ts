import { AxiosResponse } from "axios";
import apiService from "./api.service";
import { AddUpdateHealthPlanData } from "@/types/health-plan.type";

class HealthPlanService {
  generateHealthPlan(): Promise<AxiosResponse> {
    return apiService.get("/users/generate-health-plan");
  }
  createNewHealthPlan(
    healthPlanData: AddUpdateHealthPlanData
  ): Promise<AxiosResponse> {
    return apiService.post("/health-plans", healthPlanData);
  }
  updateHealthPlan(
    id: string,
    healthPlanData: AddUpdateHealthPlanData
  ): Promise<AxiosResponse> {
    return apiService.patch(`/health-plans/${id}`, healthPlanData);
  }
  searchHealthPlan({
    search,
    page = 1,
    limit = 25,
    level,
    sort_by,
    order_by,
    status,
    source,
  }: {
    search?: string;
    page?: number;
    limit?: number;
    level?: string;
    sort_by?: string;
    order_by?: string;
    status?: string;
    source?: string;
  }): Promise<AxiosResponse> {
    return apiService.get(
      `/health-plans?page=${page}${
        search ? `&search=${search}` : ""
      }&limit=${limit}${level ? `&level=${level}` : ""}${
        sort_by ? `&sort_by=${sort_by}` : ""
      }${order_by ? `&order_by=${order_by}` : ""}${
        status ? `&status=${status}` : ""
      }${source ? `&source=${source}` : ""}`
    );
  }
  getHealthPlanById(id: string): Promise<AxiosResponse> {
    return apiService.get(`/health-plans/${id}`);
  }
  deleteHealthPlan(id: string): Promise<AxiosResponse> {
    return apiService.delete(`/health-plans/${id}`);
  }
  getAllHealthPlanDetailsById(
    id: string,
    week?: number
  ): Promise<AxiosResponse> {
    return apiService.get(`/health-plan-details/all/${id}?week=${week}`);
  }
  getHealthPlanDetailsById(id: string): Promise<AxiosResponse> {
    return apiService.get(`/health-plan-details/${id}`);
  }
  addNewHealthPlanDetails(
    healthPlanId: string,
    healthPlanDetailsData: any
  ): Promise<AxiosResponse> {
    return apiService.post(
      `/health-plan-details/${healthPlanId}`,
      healthPlanDetailsData
    );
  }
  deleteHealthPlanDetails(
    healthPlanId: string,
    healthPlanDetailsId: string
  ): Promise<AxiosResponse> {
    return apiService.delete(
      `/health-plan-details/${healthPlanId}/${healthPlanDetailsId}`
    );
  }
}

const healthPlanService = new HealthPlanService();
export default healthPlanService;

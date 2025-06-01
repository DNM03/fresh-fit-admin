import { AxiosResponse } from "axios";
import apiService from "./api.service";

class SpecialistService {
  getSpecialists({
    page,
    limit,
    sort_by,
    order_by,
    search,
  }: {
    page?: number;
    limit?: number;
    sort_by?: string;
    order_by?: string;
    search?: string;
  }): Promise<AxiosResponse<any>> {
    return apiService.get<any>(
      `/experts?page=${page}&limit=${limit}${
        sort_by ? "&sort_by=" + sort_by : ""
      }${order_by ? "&order_by=" + order_by : ""}${
        search ? "&search=" + search : ""
      }`
    );
  }

  getSpecialistById(id: string): Promise<AxiosResponse<any>> {
    return apiService.get<any>(`/experts/${id}`);
  }

  getSkills(): Promise<AxiosResponse<any>> {
    return apiService.get<any>(`/skills`);
  }
  addSpecialist(data: any): Promise<AxiosResponse<any>> {
    return apiService.post<any>(`/users/expert/create`, data);
  }
  banSpecialist(id: string): Promise<AxiosResponse<any>> {
    return apiService.post<any>(`/users/ban/${id}`);
  }
  unbanSpecialist(id: string): Promise<AxiosResponse<any>> {
    return apiService.post<any>(`/users/unban/${id}`);
  }
}
const specialistService = new SpecialistService();
export default specialistService;

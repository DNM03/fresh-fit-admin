import { ReportData } from "@/types/report.type";
import { AxiosResponse } from "axios";
import apiService from "./api.service";

class ReportService {
  reportToAdmin(reportData: ReportData): Promise<AxiosResponse> {
    return apiService.post("/report", reportData);
  }
  searchReports({
    search,
    page = 1,
    limit = 10,
    sort_by = "created_at",
    order_by = "DESC",
  }: {
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    order_by?: string;
  }): Promise<AxiosResponse> {
    return apiService.get(
      `/reports?page=${page}${limit ? `&limit=${limit}` : ""}${
        search ? `&search=${search}` : ""
      }${sort_by ? `&sort_by=${sort_by}` : ""}${
        order_by ? `&order_by=${order_by}` : ""
      }`
    );
  }
  getReportById(id: string): Promise<AxiosResponse> {
    return apiService.get(`/reports/${id}`);
  }
  updateReportStatus(ids: string[], status?: string): Promise<AxiosResponse> {
    return apiService.put(`/reports/status`, {
      reportIds: ids,
      status: status || "Unread",
    });
  }
}

const reportService = new ReportService();

export default reportService;

import { AxiosResponse } from "axios";
import apiService from "./api.service";

class StatisticService {
  getTop(): Promise<AxiosResponse> {
    return apiService.get("/statistics/top");
  }
  getAdminDashboard(): Promise<AxiosResponse> {
    return apiService.get("/statistics/admin/dashboard");
  }
  getChallengesDashboard(): Promise<AxiosResponse> {
    return apiService.get(
      "/challenges?page=1&limit=5&type=All&sort_by=start_date&order_by=ASC&status=Active"
    );
  }
  getOverview(): Promise<AxiosResponse> {
    return apiService.get("/statistics/admin/overview");
  }
  getUserGrowth(year: number = 2025): Promise<AxiosResponse> {
    return apiService.get(
      `/statistics/admin/overview/user-growth?year=${year}`
    );
  }
  getTopChallenges(
    year: number = 2025,
    top: number = 5
  ): Promise<AxiosResponse> {
    return apiService.get(
      `/statistics/admin/overview/top-challenges?year=${year}&top=${top}`
    );
  }
  getAgeDistribution(): Promise<AxiosResponse> {
    return apiService.get(`/statistics/admin/overview/age`);
  }
  getUserStats(): Promise<AxiosResponse> {
    return apiService.get("/statistics/admin/users");
  }
  getWorkoutStats(): Promise<AxiosResponse> {
    return apiService.get("/statistics/admin/workouts");
  }
  getWorkoutWeeklyStats(
    year: number = 2025,
    month: string = "05",
    week: number = 3
  ): Promise<AxiosResponse> {
    return apiService.get(
      `/statistics/admin/workouts/weekly-completion-rates?year=${year}&month=${month}&week=${week}`
    );
  }
  getNutritionStats(): Promise<AxiosResponse> {
    return apiService.get("/statistics/admin/nutrition");
  }
  getAppointmentStats(year: number = 2025): Promise<AxiosResponse> {
    return apiService.get(`/appointments/statistic/year-summary?year=${year}`);
  }
  getAppointmentTop5BookedExperts(): Promise<AxiosResponse> {
    return apiService.get(`/experts/statistic/top-5-most-booked-experts`);
  }
  getAppointmentTop5RatingExperts(): Promise<AxiosResponse> {
    return apiService.get(`/experts/statistic/top-5-highest-rating-experts`);
  }
}

const statisticService = new StatisticService();
export default statisticService;

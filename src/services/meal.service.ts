import { Meal } from "@/types/meal.type";
import apiService from "./api.service";
import { AxiosResponse } from "axios";

class MealService {
  getMeals({
    page,
    limit,
    type,
    sort_by,
    order_by,
    meal_type,
    search,
  }: {
    page?: number;
    limit?: number;
    type?: string;
    sort_by?: string;
    order_by?: string;
    search?: string;
    meal_type?: string;
  }): Promise<AxiosResponse<any>> {
    return apiService.get<any>(
      `/meals?page=${page}&limit=${limit}${type ? `&type=${type}` : ""}${
        sort_by ? `&sort_by=${sort_by}` : ""
      }${order_by ? `&order_by=${order_by}` : ""}${
        meal_type ? `&meal_type=${meal_type}` : ""
      }${search ? `&search=${search}` : ""}`
    );
  }
  getMealById(id: string): Promise<AxiosResponse<any>> {
    return apiService.get<any>(`/meals/${id}`);
  }
  getMealByDate(date: string): Promise<AxiosResponse<Meal[]>> {
    return apiService.get<Meal[]>(`/meals/users?date=${date}`);
  }
  addNewMealPlan(mealData: any): Promise<AxiosResponse<any>> {
    return apiService.post<any>("/meals", mealData);
  }
  updateMealPlan(id: string, mealData: any): Promise<AxiosResponse<Meal>> {
    return apiService.put<Meal>(`/meals/${id}`, mealData);
  }
  deleteMealPlan(id: string): Promise<AxiosResponse> {
    return apiService.delete(`/meals/${id}`);
  }
  cloneMealPlan(
    meal_ids: string[],
    date: string
  ): Promise<AxiosResponse<Meal>> {
    return apiService.post<Meal>(`/meals/clone`, {
      meal_ids,
      date,
    });
  }
}

const mealService = new MealService();
export default mealService;

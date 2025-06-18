import { AxiosResponse } from "axios";
import apiService from "./api.service";
import { AddUpdateIngredientData, Ingredient } from "@/types/ingredient.type";

class IngredientService {
  getIngredients({
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
      `/ingredients?page=${page}&limit=${limit}${
        sort_by ? "&sort_by=" + sort_by : ""
      }${order_by ? "&order_by=" + order_by : ""}${
        search ? "&search=" + search : ""
      }`
    );
  }
  getIngredientById(id: string): Promise<AxiosResponse<any>> {
    return apiService.get<any>(`/ingredients/${id}`);
  }
  addIngredient(
    ingredientData: AddUpdateIngredientData
  ): Promise<AxiosResponse<Ingredient>> {
    return apiService.post<Ingredient>("/ingredients", ingredientData);
  }
  updateIngredient(
    id: string,
    ingredientData: AddUpdateIngredientData
  ): Promise<AxiosResponse<Ingredient>> {
    return apiService.patch<Ingredient>(`/ingredients/${id}`, ingredientData);
  }
  deleteIngredient(id: string): Promise<AxiosResponse> {
    return apiService.delete(`/ingredients/${id}`);
  }
  getIngredientByName(name: string): Promise<AxiosResponse<any>> {
    return apiService.get<any>(`/ingredients/external?search=${name}`);
  }
}

const ingredientService = new IngredientService();
export default ingredientService;

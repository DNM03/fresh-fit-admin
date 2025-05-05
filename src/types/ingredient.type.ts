import { AxiosRequestConfig } from "axios";

export interface AddUpdateIngredientData {
  name: string;
  description?: string;
  calories?: number;
  image?: string;
  cab?: number;
  sodium?: number;
  sugar?: number;
  cholesterol?: number;
  fat?: number;
  protein?: number;
}

export interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

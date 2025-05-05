import { AxiosRequestConfig } from "axios";

export interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

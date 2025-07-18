import apiService from "./api.service";
import { AxiosResponse } from "axios";
import {
  User,
  UserSettings,
  ProfileUpdateData,
  HealthActivityType,
  AddWaterData,
  AddHealthTrackingData,
} from "@/types/user.type";

class UserService {
  getCurrentUser(): Promise<AxiosResponse<User>> {
    return apiService.get<User>("/users/me");
  }

  updateProfile(userData: ProfileUpdateData): Promise<AxiosResponse<User>> {
    return apiService.patch<User>("/users/me", userData);
  }

  changePassword(data: any): Promise<AxiosResponse> {
    return apiService.put("/users/change-password", data);
  }

  getUserSettings(): Promise<AxiosResponse<UserSettings>> {
    return apiService.get<UserSettings>("/users/me/notify-settings");
  }

  updateUserSettings(
    settings: UserSettings
  ): Promise<AxiosResponse<UserSettings>> {
    return apiService.put<UserSettings>("/users/me/notify-settings", settings);
  }

  banUser(userId: string): Promise<AxiosResponse> {
    return apiService.put(`/users/ban/${userId}`);
  }

  unbanUser(userId: string): Promise<AxiosResponse> {
    return apiService.put(`/users/unban/${userId}`);
  }

  getHealthActivity(
    type: HealthActivityType,
    date: string
  ): Promise<AxiosResponse> {
    return apiService.get(
      "/users/me/health-activity?type=" + type + "&date=" + date
    );
  }

  addWaterActivity({ date, goal, step }: AddWaterData): Promise<AxiosResponse> {
    return apiService.post("/users/waters", {
      date,
      goal,
      step,
    });
  }

  addHealthTracking({
    date,
    type,
    value,
    target,
  }: AddHealthTrackingData): Promise<AxiosResponse> {
    return apiService.post("/users/health-tracking", {
      date,
      type,
      value,
      target,
    });
  }
}

const userService = new UserService();

export default userService;

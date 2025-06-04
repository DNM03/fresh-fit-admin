import { AxiosResponse } from "axios";
import apiService from "./api.service";

class SkillService {
  addSkill(skill: string): Promise<AxiosResponse> {
    return apiService.post("/skills", { name: skill });
  }
  updateSkill(id: string, skill: string): Promise<AxiosResponse> {
    return apiService.patch(`/skills/${id}`, { name: skill });
  }
  deleteSkill(id: string[]): Promise<AxiosResponse> {
    return apiService.delete(`/skills`, { data: { skillIds: id } });
  }
  getAllSkills(): Promise<AxiosResponse> {
    return apiService.get("/skills");
  }
}

const skillService = new SkillService();
export default skillService;

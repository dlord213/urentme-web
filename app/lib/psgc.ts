import axios from "axios";

const api = axios.create({
  baseURL: "https://psgc.gitlab.io/api",
});

export interface PSGCLocation {
  code: string;
  name: string;
  regionName?: string;
}

export const psgcApi = {
  getRegions: async (): Promise<PSGCLocation[]> => {
    const { data } = await api.get("/regions/");
    return data;
  },
  
  getProvincesByRegion: async (regionCode: string): Promise<PSGCLocation[]> => {
    const { data } = await api.get(`/regions/${regionCode}/provinces/`);
    return data;
  },
  
  getCitiesByRegion: async (regionCode: string): Promise<PSGCLocation[]> => {
    const { data } = await api.get(`/regions/${regionCode}/cities-municipalities/`);
    return data.map((item: PSGCLocation) => ({
      ...item,
      name: item.name.startsWith("City of ") ? item.name.replace("City of ", "") + " City" : item.name,
    }));
  },

  getCitiesByProvince: async (provinceCode: string): Promise<PSGCLocation[]> => {
    const { data } = await api.get(`/provinces/${provinceCode}/cities-municipalities/`);
    return data.map((item: PSGCLocation) => ({
      ...item,
      name: item.name.startsWith("City of ") ? item.name.replace("City of ", "") + " City" : item.name,
    }));
  },
  
  getBarangaysByCity: async (cityCode: string): Promise<PSGCLocation[]> => {
    const { data } = await api.get(`/cities-municipalities/${cityCode}/barangays/`);
    return data;
  },
};

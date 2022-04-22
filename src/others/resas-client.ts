import { Pref } from "../types";
import { TotalPopulation } from "./../types/index";

// SEE: RESAS API について https://opendata.resas-portal.go.jp/

const API_URL = "https://opendata.resas-portal.go.jp/";
const headers = { "X-API-KEY": import.meta.env.VITE_APP_RESAS_API_KEY };

const appFetch = <T>(endpoint: string): Promise<T> => fetch(API_URL + endpoint, { headers }).then((res) => res.json());

type FetchPrefecturesReturn = {
  message: null;
  result: Pref[];
};

export const fetchPrefectures = () => appFetch<FetchPrefecturesReturn>("api/v1/prefectures");

type FetchPopulationCompositionReturn = {
  message: null;
  result: {
    boundaryYear: number;
    data: [{ label: string; data: TotalPopulation[] }, ...unknown[]];
  };
};

export const fetchPopulationComposition = (prefCode: number) =>
  appFetch<FetchPopulationCompositionReturn>(`api/v1/population/composition/perYear?cityCode=-&prefCode=${prefCode}`);

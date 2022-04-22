import { Pref } from "../types";

const API_URL = "https://opendata.resas-portal.go.jp/";
const headers = { "X-API-KEY": import.meta.env.VITE_APP_RESAS_API_KEY };

const appFetch = <T>(endpoint: string): Promise<T> =>
  fetch(API_URL + endpoint, { headers }).then((res) => res.json());

type FetchPrefecturesReturn = {
  message: null;
  result: Pref[];
};

export const fetchPrefectures = () =>
  appFetch<FetchPrefecturesReturn>("api/v1/prefectures");

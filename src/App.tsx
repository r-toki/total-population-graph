import { FC, useEffect, useState } from "react";

import { fetchPrefectures } from "./others/resas-client";

type Pref = {
  prefCode: number;
  prefName: string;
};

export const App: FC = () => {
  const [prefs, setPrefs] = useState<Pref[]>([]);

  useEffect(() => {
    fetchPrefectures().then((res) => setPrefs(res.result));
  }, []);

  return <div>{prefs.map((v) => v.prefName)}</div>;
};

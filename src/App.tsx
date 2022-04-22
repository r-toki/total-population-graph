import { ChangeEventHandler, FC, useEffect, useState } from "react";

import { entries, fromEntries } from "./others/collection-util";
import { fetchPopulationComposition, fetchPrefectures } from "./others/resas-client";
import { Pref, TotalPopulation } from "./types";

export const App: FC = () => {
  const [loading, setLoading] = useState(false);

  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [totalPopulations, setTotalPopulations] = useState<Record<Pref["prefCode"], TotalPopulation[]>>({});

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getPrefByPrefCode = (prefCode: number) => prefs.find((pref) => pref.prefCode === prefCode)!;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchPrefectures();
      setPrefs(res.result);
      setLoading(false);
    })();
  }, []);

  const check = async (prefCode: number) => {
    setLoading(true);
    const res = await fetchPopulationComposition(prefCode);
    setTotalPopulations((prev) => ({ ...prev, [prefCode]: res.result.data[0].data }));
    setLoading(false);
  };

  const uncheck = (prefCode: number) => {
    setTotalPopulations((prev) => fromEntries(entries(prev).filter(([key]) => key != prefCode.toString())));
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.checked) {
      check(Number(e.target.value));
    } else {
      uncheck(Number(e.target.value));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {prefs.map((pref) => (
          <div key={pref.prefCode} style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id={`total-population-graph__checkbox-${pref.prefCode}`}
              value={pref.prefCode}
              onChange={onChange}
            />
            <label htmlFor={`total-population-graph__checkbox-${pref.prefCode}`}>{pref.prefName}</label>
          </div>
        ))}
      </div>
      <div>{JSON.stringify(totalPopulations)}</div>
    </div>
  );
};

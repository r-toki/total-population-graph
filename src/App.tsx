import randomColor from "randomcolor";
import { ChangeEventHandler, FC, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Label, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { entries, fromEntries, keys } from "./others/collection-util";
import { fetchPopulationComposition, fetchPrefectures } from "./others/resas-client";
import { Pref, TotalPopulation } from "./types";

type DataPoint = {
  year: number;
  [prefName: string]: number;
};

const colors = Array.from({ length: 47 }).map(() => randomColor({ luminosity: "bright" }));

// NOTE: 3桁ごとにカンマつける
const formatNumber = (num: unknown) => {
  if (typeof num !== "number") return "";
  return num
    .toString()
    .split("")
    .reverse()
    .reduce((prev, curr, idx) => (idx !== 0 && idx % 3 === 0 ? curr + "," + prev : curr + prev), "");
};

export const App: FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [totalPopulations, setTotalPopulations] = useState<Record<Pref["prefCode"], TotalPopulation[]>>({});

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getPrefByPrefCode = (prefCode: number) => prefs.find((pref) => pref.prefCode === prefCode)!;

  useEffect(() => {
    (async () => {
      const res = await fetchPrefectures();
      setPrefs(res.result);
      setInitialized(true);
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

  const data = useMemo<DataPoint[]>(() => {
    const res: DataPoint[] = [];

    keys(totalPopulations).forEach((prefCodeStr) => {
      const prefCode = Number(prefCodeStr);
      const prefName = getPrefByPrefCode(prefCode).prefName;

      totalPopulations[prefCode].forEach((prefTotalPopulation) => {
        const { year, value } = prefTotalPopulation;
        const yearIndex = res.findIndex((v) => v.year === year);
        if (yearIndex < 0) {
          res.push({ year, [prefName]: value });
        } else {
          res[yearIndex] = { ...res[yearIndex], [prefName]: value };
        }
      });
    });

    return res;
  }, [totalPopulations]);

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "8px 8px" }}>
      <div style={{ textAlign: "center", marginBottom: "16px", fontSize: "1.25rem", fontWeight: "bold" }}>
        都道府県別の総人口推移グラフ
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px 36px",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "360px",
            marginBottom: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {prefs.map((pref) => (
            <div key={pref.prefCode} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                id={`total-population-graph__checkbox-${pref.prefCode}`}
                value={pref.prefCode}
                onChange={onChange}
                style={{ marginRight: "4px" }}
              />
              <label htmlFor={`total-population-graph__checkbox-${pref.prefCode}`}>{pref.prefName}</label>
            </div>
          ))}
        </div>

        <LineChart data={data} width={360} height={480} margin={{ top: 28, right: 5, bottom: 10, left: 10 }}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="year" fontSize="12px" domain={[""]}>
            <Label value="年度" position="insideBottomRight" dy={10} dx={8} fontSize="12px" />
          </XAxis>
          <YAxis fontSize="12px">
            <Label value="総人口" position="insideTopLeft" dy={-28} fontSize="12px" />
          </YAxis>
          <Legend />
          {keys(totalPopulations).map((prefCodeStr) => (
            <Line
              key={prefCodeStr}
              dataKey={getPrefByPrefCode(Number(prefCodeStr)).prefName}
              stroke={colors[Number(prefCodeStr)]}
            />
          ))}
          <Tooltip
            formatter={(value: number, name: string) => {
              return [`${formatNumber(value)} 人`, `${name}`];
            }}
            labelFormatter={(value) => {
              return `${value} 年`;
            }}
          />
        </LineChart>
      </div>
    </div>
  );
};

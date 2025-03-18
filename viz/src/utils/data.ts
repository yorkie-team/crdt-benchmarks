export interface RawResults {
  [benchmarkName: string]: {
    [framework: string]: string;
  };
}

export interface Framework {
  name: string;
  version: string;
}

export interface ProcessedResult {
  value: number | null;
  unit: string;
}

export interface ProcessedResults {
  frameworks: Framework[];
  benchmarks: string[];
  results: {
    [benchmark: string]: {
      [framework: string]: ProcessedResult;
    };
  };
}

export const METRICS = [
  "time",
  "avgUpdateSize",
  "encodeTime",
  "docSize",
  "memUsed",
  "parseTime",
] as const;

export const processResults = (rawResults: RawResults): ProcessedResults => {
  // Extract frameworks and versions
  const frameworks: Framework[] = Object.entries(rawResults.Version).map(
    ([name, version]) => ({
      name,
      version,
    })
  );

  // Extract benchmark names (excluding Version)
  const benchmarks = Object.keys(rawResults).filter(
    (key) => key !== "Version" && key.includes("[B")
  );

  // Process results
  const results = benchmarks.reduce((acc, benchmark) => {
    acc[benchmark] = {};

    frameworks.forEach((framework) => {
      const rawValue = rawResults[benchmark][framework.name];
      if (!rawValue) {
        acc[benchmark][framework.name] = {
          value: null,
          unit: "",
        };
        return;
      }

      const [valueStr, unit = ""] = rawValue.split(" ");
      const value = parseFloat(valueStr);

      acc[benchmark][framework.name] = {
        value,
        unit,
      };
    });
    return acc;
  }, {} as ProcessedResults["results"]);

  return {
    frameworks,
    benchmarks,
    results,
  };
};

export const calculateFactor = (value: number, minValue: number): number => {
  // Replace 0 with 0.01 for better ratio calculation
  const normalizedValue = value === 0 ? 0.01 : value;
  const normalizedMin = minValue === 0 ? 0.01 : minValue;
  return normalizedValue / normalizedMin;
};

/**
 * Computes background color based on performance factor:
 * - factor < 2.0: interpolates from green (best) to yellow
 * - factor >= 2.0: interpolates from yellow to red (worst)
 *
 * @param factor - Performance ratio (value/minValue)
 * @returns RGB color string
 */
export const computeColor = (factor: number): string => {
  if (factor < 2.0) {
    const a = factor - 1.0;
    const r = (1.0 - a) * 99 + a * 255;
    const g = (1.0 - a) * 191 + a * 236;
    const b = (1.0 - a) * 124 + a * 132;
    return `rgb(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)})`;
  } else {
    const a = Math.min((factor - 2.0) / 2.0, 1.0);
    const r = (1.0 - a) * 255 + a * 249;
    const g = (1.0 - a) * 236 + a * 105;
    const b = (1.0 - a) * 132 + a * 108;
    return `rgb(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)})`;
  }
};

/**
 * Determines text color (black or white) based on background color brightness
 * Uses only the red channel as a simple approximation of brightness
 *
 * @param bgColor - RGB color string (e.g., "rgb(255, 236, 132)")
 * @returns '#000' for dark text or '#fff' for light text
 */
export const getTextColor = (bgColor: string): string => {
  const rgb = bgColor
    .slice(4, -1)
    .split(",")
    .map((x) => parseInt(x))[0];
  return rgb > 128 ? "#000" : "#fff";
};

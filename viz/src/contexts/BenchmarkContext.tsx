import React, { createContext, useContext, useState, useEffect } from "react";
import { METRICS } from "../utils/data";

interface BenchmarkContextType {
  selectedFrameworks: Set<string>;
  toggleFramework: (framework: string) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: (typeof METRICS)[number]) => void;
  sortBenchmark: string;
  setSortBenchmark: (benchmark: string) => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(
  undefined
);

export const BenchmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedFrameworks, setSelectedFrameworks] = useState<Set<string>>(
    new Set()
  );
  const [selectedMetric, setSelectedMetric] =
    useState<(typeof METRICS)[number]>("time");
  const [sortBenchmark, setSortBenchmark] = useState(
    "[B1.1] Append N characters (time)"
  );

  const toggleFramework = (framework: string) => {
    setSelectedFrameworks((prev) => {
      const next = new Set(prev);
      if (next.has(framework)) {
        next.delete(framework);
      } else {
        next.add(framework);
      }
      return next;
    });
  };

  useEffect(() => {
    setSortBenchmark(`[B1.1] Append N characters (${selectedMetric})`);
  }, [selectedMetric]);

  return (
    <BenchmarkContext.Provider
      value={{
        selectedFrameworks,
        toggleFramework,
        selectedMetric,
        setSelectedMetric,
        sortBenchmark,
        setSortBenchmark,
      }}
    >
      {children}
    </BenchmarkContext.Provider>
  );
};

export const useBenchmark = () => {
  const context = useContext(BenchmarkContext);
  if (!context) {
    throw new Error("useBenchmark must be used within a BenchmarkProvider");
  }
  return context;
};

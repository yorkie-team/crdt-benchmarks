import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { useBenchmark } from "../contexts/BenchmarkContext";
import {
  ProcessedResults,
  ProcessedResult,
  Framework,
  computeColor,
  getTextColor,
  calculateFactor,
} from "../utils/data";

interface BenchmarkCellProps {
  benchmark: string;
  framework: Framework;
  result: VisualizedResult;
}

interface VisualizedResult extends ProcessedResult {
  factor: number | null;
  bgColor: string;
  textColor: string;
}

const ResultTable = ({ data }: { data: ProcessedResults }) => {
  const {
    selectedFrameworks,
    selectedMetric,
    sortBenchmark,
    setSortBenchmark,
  } = useBenchmark();

  const filteredFrameworks = useMemo(() => {
    return data.frameworks.filter(
      (framework) =>
        selectedFrameworks.size === 0 || selectedFrameworks.has(framework.name)
    );
  }, [data.frameworks, selectedFrameworks]);

  const filteredBenchmarks = useMemo(() => {
    return data.benchmarks.filter((benchmark) => {
      if (selectedMetric === "avgUpdateSize") {
        return (
          benchmark.includes("(avgUpdateSize)") ||
          benchmark.includes("(updateSize)")
        );
      }
      return benchmark.includes(`(${selectedMetric})`);
    });
  }, [data, selectedMetric]);

  const visualizedResults = useMemo(() => {
    const result: Record<string, Record<string, VisualizedResult>> = {};

    filteredBenchmarks.forEach((benchmark) => {
      result[benchmark] = {};
      const values = filteredFrameworks
        .map((fw) => {
          let value = data.results[benchmark][fw.name].value;
          if (data.results[benchmark][fw.name].unit.toLowerCase() === "kb") {
            value = value! * 1024;
          } else if (
            data.results[benchmark][fw.name].unit.toLowerCase() === "mb"
          ) {
            value = value! * 1024 * 1024;
          }
          return value;
        })
        .filter((v): v is number => v !== null);
      const minValue = Math.min(...values);

      filteredFrameworks.forEach((framework) => {
        const baseResult = data.results[benchmark][framework.name];
        if (baseResult.value === null) {
          result[benchmark][framework.name] = {
            ...baseResult,
            factor: null,
            bgColor: "#fff",
            textColor: "#666",
          };
          return;
        }

        let value = baseResult.value;
        if (baseResult.unit.toLowerCase() === "kb") {
          value = value * 1024;
        } else if (baseResult.unit.toLowerCase() === "mb") {
          value = value * 1024 * 1024;
        }
        const factor = calculateFactor(value, minValue);
        const bgColor = computeColor(factor);
        const textColor = getTextColor(bgColor);

        result[benchmark][framework.name] = {
          ...baseResult,
          factor,
          bgColor,
          textColor,
        };
      });
    });

    return result;
  }, [filteredFrameworks, filteredBenchmarks, data.results]);

  const sortedFrameworks = useMemo(() => {
    if (!sortBenchmark) return filteredFrameworks;

    const a = [...filteredFrameworks].sort((a, b) => {
      const aResult = visualizedResults[sortBenchmark]?.[a.name];
      const bResult = visualizedResults[sortBenchmark]?.[b.name];
      return (aResult?.factor ?? -1) - (bResult?.factor ?? -1);
    });
    return a;
  }, [sortBenchmark, filteredFrameworks, visualizedResults]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Benchmark</TableCell>
            {sortedFrameworks.map((framework) => (
              <TableCell key={framework.name}>
                {framework.name} ({framework.version})
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBenchmarks.map((benchmark) => (
            <TableRow key={benchmark}>
              <TableCell>
                <TableSortLabel
                  active={sortBenchmark === benchmark}
                  direction="asc"
                  onClick={() => setSortBenchmark(benchmark)}
                >
                  {benchmark}
                </TableSortLabel>
              </TableCell>
              {sortedFrameworks.map((framework) => (
                <BenchmarkCell
                  key={`${benchmark}-${framework.name}`}
                  benchmark={benchmark}
                  framework={framework}
                  result={visualizedResults[benchmark][framework.name]}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div
        style={{
          padding: "12px",
          color: "#666",
          fontSize: "0.9em",
          backgroundColor: "#f5f5f5",
        }}
      >
        Click on a benchmark name to sort frameworks based on their performance
        in that test case.
      </div>
    </TableContainer>
  );
};

// Simplified BenchmarkCell that only handles rendering
const BenchmarkCell = ({
  benchmark,
  framework,
  result,
}: BenchmarkCellProps) => {
  if (result.value === null) {
    return (
      <TableCell
        key={`${benchmark}-${framework.name}`}
        style={{ color: "#666" }}
      >
        skip
      </TableCell>
    );
  }

  return (
    <TableCell
      key={`${benchmark}-${framework.name}`}
      style={{ backgroundColor: result.bgColor, color: result.textColor }}
    >
      <div>
        {result.value.toFixed(2)} {result.unit}
        <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
          ({result.factor?.toFixed(2)})
        </div>
      </div>
    </TableCell>
  );
};

export default ResultTable;

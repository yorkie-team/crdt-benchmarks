import { Container } from "@mui/material";
import { BenchmarkProvider } from "./contexts/BenchmarkContext";
import { Filters } from "./components/Filters";
import ResultTable from "./components/ResultTable";
import rawResults from "../../benchmarks/results.json";
import { processResults, METRICS } from "./utils/data";

export const N = 6000;
const data = processResults(rawResults[N]);

function App() {
  return (
    <BenchmarkProvider>
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <h1>CRDT Benchmarks Results</h1>
        <Filters frameworks={data.frameworks} metrics={METRICS} />
        <ResultTable data={data} />
      </Container>
    </BenchmarkProvider>
  );
}

export default App;

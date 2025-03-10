import { YorkieFactory } from "./factory.js";
import {
  runBenchmarks,
  writeBenchmarkResultsToFile,
} from "../../js-lib/index.js";
(async () => {
  await runBenchmarks(
    new YorkieFactory(),
    (testName) => !testName.startsWith("[B4x")
  );
  writeBenchmarkResultsToFile("../results.json", (testName) => true);
})();

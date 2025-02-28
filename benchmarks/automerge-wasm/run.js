import { AutomergeFactory } from './factory.js'
import { runBenchmarks, writeBenchmarkResultsToFile } from '../../js-lib/index.js'

;(async () => {
  await runBenchmarks(new AutomergeFactory(), testName => !testName.startsWith('[B4'))
  writeBenchmarkResultsToFile('../results.json', /** @param {string} _testName */ _testName => true)
})()

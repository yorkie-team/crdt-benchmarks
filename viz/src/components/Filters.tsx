import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { Framework, METRICS } from "../utils/data";
import { useBenchmark } from "../contexts/BenchmarkContext";

interface FiltersProps {
  frameworks: Framework[];
  metrics: typeof METRICS;
}

export const Filters: React.FC<FiltersProps> = ({ frameworks, metrics }) => {
  const {
    selectedFrameworks,
    toggleFramework,
    selectedMetric,
    setSelectedMetric,
  } = useBenchmark();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Frameworks
          </Typography>
          <FormGroup row>
            {frameworks.map((framework) => (
              <FormControlLabel
                key={framework.name}
                control={
                  <Checkbox
                    checked={selectedFrameworks.has(framework.name)}
                    onChange={() => toggleFramework(framework.name)}
                  />
                }
                label={`${framework.name} (${framework.version})`}
              />
            ))}
          </FormGroup>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom>
            Metric
          </Typography>
          <Select
            value={selectedMetric}
            onChange={(e) =>
              setSelectedMetric(e.target.value as (typeof METRICS)[number])
            }
            sx={{ minWidth: 200 }}
          >
            {metrics.map((metric) => (
              <MenuItem key={metric} value={metric}>
                {metric}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </Paper>
  );
};

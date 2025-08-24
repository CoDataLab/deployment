import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from "react";
import { format, parseISO, differenceInHours } from "date-fns";
import {
  Line,
  Area,
  XAxis,
  YAxis,
  Brush,
  Legend,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  ResponsiveContainer,
} from "recharts";

import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import {
  Box,
  Grid,
  Card,
  Chip,
  Paper,
  Alert,
  Stack,
  Divider,
  useTheme,
  Typography,
  CardContent,
  ToggleButton,
  useMediaQuery,
  CircularProgress,
  ToggleButtonGroup,
} from "@mui/material";

import tensionService from "src/services/tensionService";

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const tensionValue = payload[0].value;
    let tensionStatus = "Neutral";
    let tensionColor = "#9e9e9e";

    if (tensionValue > 0) {
      tensionStatus = "Positive";
      tensionColor = "#4caf50";
    } else if (tensionValue < 0) {
      tensionStatus = "Negative";
      tensionColor = "#f44336";
    }

    const hours = differenceInHours(parseISO(data.endDate), parseISO(data.startDate));

    return (
      <Paper elevation={3} sx={{ p: 2, maxWidth: 300 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {format(new Date(label), "PPP p")}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2"><strong>Tension Value:</strong> {tensionValue.toFixed(4)}</Typography>
        <Typography variant="body2"><strong>Status:</strong> <span style={{ color: tensionColor }}>{tensionStatus}</span></Typography>
        <Typography variant="body2"><strong>Time Period:</strong> {hours} hours</Typography>
        <Typography variant="body2"><strong>Start:</strong> {format(parseISO(data.startDate), "p")}</Typography>
        <Typography variant="body2"><strong>End:</strong> {format(parseISO(data.endDate), "p")}</Typography>
      </Paper>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        endDate: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
      }).isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
  label: PropTypes.string,
};

// Statistic card component
const StatCard = ({ title, value, icon, color }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        {icon}
      </Box>
      <Typography variant="h5" sx={{ color, fontWeight: "bold", mt: 1 }}>{value}</Typography>
    </CardContent>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.string,
};

const TensionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("week");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch data based on selected time range
  useEffect(() => {
    const fetchTensionData = async () => {
      setLoading(true);
      try {
        const data = await tensionService.getLastPeriodTensions(timeRange);
        const formattedData = data.map((item) => ({
          ...item,
          date: format(new Date(item.endDate), "MMM dd, HH:mm"),
          formattedDate: format(new Date(item.endDate), "PPP p"),
          movingAvg: null,
        }));

        for (let i = 2; i < formattedData.length; i += 1) {
          const avg = (formattedData[i].value + formattedData[i - 1].value + formattedData[i - 2].value) / 3;
          formattedData[i].movingAvg = Number.parseFloat(avg.toFixed(4));
        }

        setChartData(formattedData);
      } catch (err) {
        setError("Error fetching tension data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTensionData();
  }, [timeRange]);

  // Calculate statistics from the data
  const stats = useMemo(() => {
    if (!chartData.length) return null;

    const values = chartData.map((item) => item.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const latest = values[values.length - 1];
    const previousLatest = values[values.length - 2] || 0;

    let trend = "flat";
    if (latest > previousLatest) {
      trend = "up";
    } else if (latest < previousLatest) {
      trend = "down";
    }

    return {
      average: avg.toFixed(4),
      maximum: max.toFixed(4),
      minimum: min.toFixed(4),
      latest: latest.toFixed(4),
      trend,
    };
  }, [chartData]);

  // Handle time range change
  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Determine icon based on trend
  let icon;
  if (stats?.trend === "up") {
    icon = <TrendingUpIcon color="success" />;
  } else if (stats?.trend === "down") {
    icon = <TrendingDownIcon color="error" />;
  } else {
    icon = <TrendingFlatIcon color="action" />;
  }

  // Determine color based on latest value
  let color;
  if (Number.parseFloat(stats?.latest) > 0) {
    color = theme.palette.success.main;
  } else if (Number.parseFloat(stats?.latest) < 0) {
    color = theme.palette.error.main;
  } else {
    color = theme.palette.text.secondary;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h5" fontWeight="bold">Tension Analysis Dashboard</Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
            size="small"
          >
            <ToggleButton value="day" aria-label="day">Day</ToggleButton>
            <ToggleButton value="week" aria-label="week">Week</ToggleButton>
            <ToggleButton value="month" aria-label="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {stats && (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatCard title="Latest Tension" value={stats.latest} icon={icon} color={color} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard title="Average" value={stats.average} icon={<InfoIcon color="primary" />} color={theme.palette.primary.main} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard title="Maximum" value={stats.maximum} icon={<TrendingUpIcon color="success" />} color={theme.palette.success.main} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard title="Minimum" value={stats.minimum} icon={<TrendingDownIcon color="error" />} color={theme.palette.error.main} />
            </Grid>
          </Grid>
        )}

        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>Tension Trend Analysis</Typography>
          <ResponsiveContainer width="100%" height={isMobile ? 350 : 450}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8138f5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8138f5" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} tickMargin={10} reversed />
              <YAxis domain={["auto", "auto"]} tickFormatter={(value) => value.toFixed(2)} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <ReferenceLine y={0} stroke="grey" strokeWidth={2} strokeDasharray="3 3" />
              <Area type="monotone" dataKey="value" fill="url(#colorValue)" stroke="none" fillOpacity={0.3} />
              <Line type="natural" dataKey="value" stroke="#8138f5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "white" }} activeDot={{ r: 6, strokeWidth: 0, fill: "#8138f5" }} name="Tension Value" />
              <Line type="monotone" dataKey="movingAvg" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" dot={false} name="3-Point Moving Avg" />
              <Brush dataKey="date" height={30} stroke="#8138f5" startIndex={Math.max(0, chartData.length - 10)} />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="textSecondary">Insights:</Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
            {Number.parseFloat(stats?.latest) < -0.03 && <Chip label="High negative tension detected" color="error" size="small" variant="outlined" />}
            {Number.parseFloat(stats?.latest) > 0.03 && <Chip label="High positive tension detected" color="success" size="small" variant="outlined" />}
            {stats?.trend === "up" && <Chip label="Increasing trend" color="warning" size="small" variant="outlined" icon={<TrendingUpIcon />} />}
            {stats?.trend === "down" && <Chip label="Decreasing trend" color="info" size="small" variant="outlined" icon={<TrendingDownIcon />} />}
            {Math.abs(Number.parseFloat(stats?.average)) < 0.01 && <Chip label="Stable average tension" color="success" size="small" variant="outlined" />}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default TensionChart;
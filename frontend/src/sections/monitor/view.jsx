
import PropTypes from 'prop-types';
import { useState, useEffect } from "react"
import { Info, BarChart, PieChart, Download, RefreshCcw, TrendingUp, HelpCircle, TrendingDown } from "lucide-react"
import {
  Line,
  Area,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  LineChart,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"

import { useTheme } from "@mui/material/styles"
import {
  Box,
  Tab,
  Chip,
  Card,
  Grid,
  Tabs,
  Paper,
  Stack,
  Alert,
  alpha,
  Button,
  Divider,
  Skeleton,
  Container,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  useMediaQuery,
  CircularProgress,
} from "@mui/material"

import sourcesService from "src/services/sourcesService"
import articlesService from "src/services/articlesService"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 1,
          boxShadow: (theme) => theme.shadows[3],
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          maxWidth: 300,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Box
              component="span"
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: entry.color,
                mr: 1,
              }}
            />
            <Typography variant="body2" sx={{ mr: 1 }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {entry.value} posts
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

     const getColor = (trend) => {
  if (trend === "up") return "success.main";
  if (trend === "down") return "error.main";
  return "text.secondary";
};

const getTrendText = (trend) => {
  if (trend === "up") return "Increasing";
  if (trend === "down") return "Decreasing";
  return "Stable";
};

const CustomLegend = ({ payload }) => (
  <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1, mt: 2 }}>
    {payload.map((entry, index) => (
      <Chip
        key={index}
        label={entry.value}
        sx={{
          backgroundColor: entry.color,
          color: "white",
          fontWeight: "medium",
          "&:hover": {
            backgroundColor: alpha(entry.color, 0.8),
          },
        }}
      />
    ))}
  </Box>
);

CustomLegend.propTypes = {
  payload: PropTypes.array,
};

export default function MonitorView() {
  const theme = useTheme()
  // eslint-disable-next-line
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [sourceOptions, setSourceOptions] = useState([])
  const [selectedSources, setSelectedSources] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState(null)
  const [chartType, setChartType] = useState("line")
  const [timeRange, setTimeRange] = useState("all")
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [percentageData, setPercentageData] = useState([])

  // Fetch sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      setSourcesLoading(true)
      try {
        const response = await sourcesService.fetchAllSources()
        setSourceOptions(response.map((sourceObj) => sourceObj.source))
        setError(null)
      } catch (errorException) {
        console.error("Error fetching sources:", errorException)
        setError("Failed to load sources. Please try again later.")
      } finally {
        setSourcesLoading(false)
      }
    }

    fetchSources()
  }, [])

useEffect(() => {
  const fetchData = async () => {
    if (selectedSources.length === 0) return;

    setLoading(true);
    setError(null);

    const filterDataByTimeRange = (dataa, range) => {
      if (range === "all" || dataa.length === 0) return dataa;

      const now = new Date();
      let cutoffDate;

      switch (range) {
        case "week":
          cutoffDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "quarter":
          cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        default:
          return dataa;
      }

      return dataa.filter((item) => new Date(item.timestamp) >= cutoffDate);
    };

    try {
      const responses = await Promise.all(
        selectedSources.map(async (source) => {
          try {
            const response = await articlesService.fetchSourcePostingRate(source);
            return response;
          } catch (errorEx) {
            if (errorEx.response && errorEx.response.status === 404) {
              return { 0: 0 };
            }
            console.error("Error fetching data for source:", source, errorEx);
            return {};
          }
        }),
      );

      const formattedData = responses.map((response, index) => {
        const seriesData = Object.entries(response)
          .map(([timestamp, value]) => ({
            date: new Date(Number(timestamp)).toLocaleDateString(),
            rate: value,
            timestamp: Number(timestamp),
            source: selectedSources[index],
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        return seriesData;
      });

      const mergedData = mergeChartData(formattedData);
      const filteredData = filterDataByTimeRange(mergedData, timeRange);

      setData(filteredData);
      const percentages = calculatePercentages(filteredData, selectedSources);
      setPercentageData(percentages);
    } catch (errorEx) {
      console.error("Error fetching data:", errorEx);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [selectedSources, timeRange]);
  // eslint-disable-next-line
  const filterDataByTimeRange = (dataa, range) => {
    if (range === "all" || dataa.length === 0) return dataa

    const now = new Date()
    let cutoffDate

    switch (range) {
      case "week":
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "quarter":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      default:
        return data
    }

    return data.filter((item) => new Date(item.timestamp) >= cutoffDate)
  }

  // Calculate percentages for each source
  const calculatePercentages = (mergedData, selectedSource) => {
    const calculatedPercentageData = mergedData.map((item) => {
      let totalRate = 0
      const sourceRates = {}

      selectedSource.forEach((source, index) => {
        const rateKey = `rate_${index}`
        const rate = item[rateKey] || 0 // Handle null rates
        totalRate += rate
        sourceRates[source] = rate
      })

      const percentages = {}
      selectedSource.forEach((source) => {
        percentages[source] = totalRate > 0 ? (sourceRates[source] / totalRate) * 100 : 0
      })

      return {
        date: item.date,
        timestamp: item.timestamp,
        ...percentages,
      }
    })

    return calculatedPercentageData
  }

  // Merge data from different sources
  const mergeChartData = (seriesData) => {
    const allTimestamps = [...new Set(seriesData.flatMap((series) => series.map((item) => item.timestamp)))].sort(
      (a, b) => a - b,
    ) // Sort chronologically

    return allTimestamps.map((timestamp) => {
      const row = { timestamp, date: new Date(timestamp).toLocaleDateString() }
      seriesData.forEach((series, index) => {
        const dataPoint = series.find((item) => item.timestamp === timestamp)
        row[`rate_${index}`] = dataPoint ? dataPoint.rate : 0 // Set to 0 if no data point found
      })
      return row
    })
  }

  // Get color for a source
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
  ]

  const getColorForSource = (source) => {
    const index = selectedSources.indexOf(source)
    return colors[index % colors.length]
  }

  // Handle refresh button click
  const handleRefresh = () => {
    if (selectedSources.length > 0) {
      setLoading(true)
      // Re-trigger the useEffect by creating a new array reference
      setSelectedSources([...selectedSources])
    }
  }

  // Handle chart type change
  const handleChartTypeChange = (event, newValue) => {
    setChartType(newValue)
  }

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  // Calculate statistics
  const calculateStats = () => {
    if (data.length === 0) return { total: 0, average: 0, trend: "neutral" }

    const totals = selectedSources.map((_, index) => data.reduce((sum, item) => sum + (item[`rate_${index}`] || 0), 0))

    const total = totals.reduce((sum, val) => sum + val, 0)
    const average = total / data.length

    // Calculate trend by comparing first half to second half
    const midpoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midpoint)
    const secondHalf = data.slice(midpoint)

    const firstHalfTotal = selectedSources.reduce((sum, _, sourceIndex) => sum + firstHalf.reduce((sum0, item) => sum0 + (item[`rate_${sourceIndex}`] || 0), 0), 0)

    const secondHalfTotal = selectedSources.reduce((sum, _, sourceIndex) => sum + secondHalf.reduce((sum1, item) => sum1 + (item[`rate_${sourceIndex}`] || 0), 0), 0)

    let trend = "neutral"
    if (secondHalfTotal > firstHalfTotal * 1.1) trend = "up"
    else if (secondHalfTotal < firstHalfTotal * 0.9) trend = "down"

    return { total, average: Math.round(average * 10) / 10, trend }
  }

  const stats = calculateStats()

  // Render the appropriate chart based on selected type
  const renderChart = () => {
    if (data.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
            bgcolor: "background.paper",
            borderRadius: 1,
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Info size={40} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No data to display
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Select one or more sources to view their posting rates
          </Typography>
        </Box>
      )
    }

    if (chartType === "line") {
      return (
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10}
            label={{
              value: "Posts",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <Legend content={<CustomLegend />} />
          {selectedSources.map((source, index) => {
            const color = getColorForSource(source)
            return (
              <Line
                key={source}
                type="monotone"
                dataKey={`rate_${index}`}
                stroke={color}
                name={source}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5, strokeWidth: 1 }}
                strokeWidth={2}
              />
            )
          })}
        </LineChart>
      )
    } if (chartType === "area") {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10}
            label={{
              value: "Posts",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <Legend content={<CustomLegend />} />
          {selectedSources.map((source, index) => {
            const color = getColorForSource(source)
            return (
              <Area
                key={source}
                type="monotone"
                dataKey={`rate_${index}`}
                stroke={color}
                fill={alpha(color, 0.3)}
                name={source}
                activeDot={{ r: 5, strokeWidth: 1 }}
                strokeWidth={2}
              />
            )
          })}
        </AreaChart>
      )
    } if (chartType === "percentage") {
      return (
        <AreaChart data={percentageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} stackOffset="expand">
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
          <YAxis
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            label={{
              value: "Percentage",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value) => [`${Math.round(value)}%`, "Percentage"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <Legend content={<CustomLegend />} />
          {selectedSources.map((source) => {
            const color = getColorForSource(source)
            return (
              <Area
                key={source}
                type="monotone"
                dataKey={source}
                stroke={color}
                fill={alpha(color, 0.6)}
                name={source}
                stackId="1"
                strokeWidth={1}
              />
            )
          })}
        </AreaChart>
      )
    }

    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Source Monitoring Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and analyze posting rates across different sources over time
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Autocomplete
                multiple
                freeSolo
                options={sourceOptions}
                value={selectedSources}
                inputValue={inputValue}
                onChange={(event, newValue) => setSelectedSources(newValue)}
                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Sources"
                    variant="outlined"
                    placeholder={selectedSources.length === 0 ? "Search and select sources..." : ""}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {sourcesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                loading={sourcesLoading}
                loadingText="Loading sources..."
                noOptionsText="No sources found"
                sx={{ flexGrow: 1 }}
              />
              <IconButton
                onClick={handleRefresh}
                disabled={loading || selectedSources.length === 0}
                sx={{ ml: 1 }}
                color="primary"
              >
                <RefreshCcw size={20} />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1">Time Range:</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["week", "month", "quarter", "all"].map((range) => (
                  <Chip
                    key={range}
                    label={range === "all" ? "All Time" : `Last ${range}`}
                    onClick={() => handleTimeRangeChange(range)}
                    color={timeRange === range ? "primary" : "default"}
                    variant={timeRange === range ? "filled" : "outlined"}
                    size="small"
                  />
                ))}
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1">Chart Type:</Typography>
              <Tabs
                value={chartType}
                onChange={handleChartTypeChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: "unset",
                  ".MuiTabs-indicator": { height: 3 },
                  ".MuiTab-root": { minHeight: "unset", py: 1 },
                }}
              >
                <Tab value="line" label="Line" icon={<TrendingUp size={16} />} iconPosition="start" />
                <Tab value="area" label="Area" icon={<BarChart size={16} />} iconPosition="start" />
                <Tab value="percentage" label="%" icon={<PieChart size={16} />} iconPosition="start" />
              </Tabs>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Total Posts</Typography>
              <IconButton size="small" sx={{ ml: "auto" }}>
                <HelpCircle size={16} />
              </IconButton>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              {loading ? <Skeleton width={100} /> : stats.total.toLocaleString()}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {stats.trend === "up" && <TrendingUp size={16} color={theme.palette.success.main} />}
              {stats.trend === "down" && <TrendingDown size={16} color={theme.palette.error.main} />}
 
<Typography
  variant="body2"
  color={getColor(stats.trend)}
  sx={{ ml: 0.5 }}
>
  {getTrendText(stats.trend)}
</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Average Posts</Typography>
              <IconButton size="small" sx={{ ml: "auto" }}>
                <HelpCircle size={16} />
              </IconButton>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              {loading ? <Skeleton width={100} /> : stats.average.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Per day across all sources
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Sources</Typography>
              <IconButton size="small" sx={{ ml: "auto" }}>
                <HelpCircle size={16} />
              </IconButton>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              {selectedSources.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSources.length === 0
                ? "No sources selected"
                : `${selectedSources.length} source${selectedSources.length !== 1 ? "s" : ""} being monitored`}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Posting Rate {chartType === "percentage" ? "Distribution" : "Trends"}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<Download size={16} />} disabled={data.length === 0}>
              Export
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ width: "100%", height: { xs: 300, sm: 500 } }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        ) : (
          <Box sx={{ width: "100%", height: { xs: 300, sm: 500 } }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </Box>
        )}
      </Card>

      {selectedSources.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Sources
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedSources.map((source) => (
              <Chip
                key={source}
                label={source}
                onDelete={() => setSelectedSources(selectedSources.filter((s) => s !== source))}
                sx={{
                  backgroundColor: getColorForSource(source),
                  color: "white",
                  fontWeight: "medium",
                  "&:hover": {
                    backgroundColor: alpha(getColorForSource(source), 0.8),
                  },
                }}
              />
            ))}
          </Box>
        </Card>
      )}
    </Container>
  )
}

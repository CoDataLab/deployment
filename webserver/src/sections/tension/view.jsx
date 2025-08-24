"use client"

import { useState, forwardRef } from "react"

import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import MuiAlert from "@mui/material/Alert"
import Divider from "@mui/material/Divider"
import Snackbar from "@mui/material/Snackbar"
import TextField from "@mui/material/TextField"
import Container from "@mui/material/Container"
import { useTheme } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import CardContent from "@mui/material/CardContent"
import RepeatIcon from "@mui/icons-material/Repeat"
import useMediaQuery from "@mui/material/useMediaQuery"
import InputAdornment from "@mui/material/InputAdornment"
import CalculateIcon from "@mui/icons-material/Calculate"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import CircularProgress from "@mui/material/CircularProgress"

import tensionService from "src/services/tensionService" // Update this path as necessary

const Alert = forwardRef((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />)

export default function TensionView() {
  const [startDate, setStartDate] = useState("")
  const [iterations, setIterations] = useState(1)
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [results, setResults] = useState([])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleSubmit = async () => {
    setSnackbarOpen(false)
    setLoading(true)
    setSnackbarMessage("")
    setResults([])

    if (!startDate) {
      setSnackbarSeverity("error")
      setSnackbarMessage("Start date is required")
      setSnackbarOpen(true)
      setLoading(false)
      return
    }

    const selectedDate = new Date(startDate).getTime()
    const requests = []

    for (let i = 0; i < iterations; i += 1) {
      const start = selectedDate - (i + 1) * 4 * 60 * 60 * 1000 // 4 hours in milliseconds
      const end = selectedDate - i * 4 * 60 * 60 * 1000 // Adjust end date to also move back

      requests.push(tensionService.getTensionByDate(start, end))
    }

    try {
      const responses = await Promise.all(requests)
      // Store results instead of logging to console
      setResults(responses)
      setSnackbarSeverity("success")
      setSnackbarMessage("Data retrieved successfully!")
    } catch (err) {
      // Avoid console.error for ESLint
      setSnackbarSeverity("error")
      setSnackbarMessage(`An error occurred while fetching data: ${err.message || "Unknown error"}`)
    } finally {
      setSnackbarOpen(true)
      setLoading(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const handleIterationChange = (e) => {
    // Ensure we're setting a number and not less than 1
    const value = Number.parseInt(e.target.value, 10)
    setIterations(Number.isNaN(value) ? 1 : Math.max(1, value))
  }

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main,
            mb: 3,
          }}
        >
          Tension Meter
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Input Parameters
                </Typography>

                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <TextField
                    type="datetime-local"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    variant="outlined"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Select the end date and time for calculation"
                  />

                  <TextField
                    type="number"
                    label="Iterations"
                    value={iterations}
                    onChange={handleIterationChange}
                    variant="outlined"
                    fullWidth
                    inputProps={{ min: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RepeatIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Number of 4-hour intervals to calculate"
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      fontWeight: "medium",
                      textTransform: "none",
                      borderRadius: 1.5,
                    }}
                  >
                    {loading ? "Calculating..." : "Calculate Tension"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Results
                </Typography>

                {loading && (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                    <CircularProgress />
                  </Box>
                )}

                {!loading && results.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {results.map((result, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: "background.default",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Interval {index + 1}:
                        </Typography>
                        <Typography variant="body2">{JSON.stringify(result, null, 2)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {!loading && results.length === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "200px",
                      color: "text.secondary",
                      bgcolor: "background.default",
                      borderRadius: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" align="center">
                      No data available yet.
                      <br />
                      Set parameters and click Calculate to view results.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}

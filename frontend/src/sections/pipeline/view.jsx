"use client"

import { useMemo, useState, useCallback } from "react"

import TableContainer from "@mui/material/TableContainer" // Import TableContainer

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Save as SaveIcon,
  Info as InfoIcon,
  Storage as StorageIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material"
import {
  Box,
  Step,
  Card,
  Grid,
  Chip,
  Table,
  Alert,
  Paper,
  Button,
  Slider,
  Dialog,
  Tooltip,
  Stepper,
  Divider,
  TableRow,
  Checkbox,
  Snackbar,
  Skeleton,
  Container,
  TableBody,
  TableCell,
  TableHead,
  StepLabel,
  TextField,
  Typography,
  DialogTitle,
  CardContent,
  DialogContent,
  LinearProgress,
  InputAdornment,
  TablePagination,
  DialogContentText,
} from "@mui/material"

// Services and components
import dataService from "src/services/dataService"

import { useSettingsContext } from "src/components/settings"

// Pipeline steps
const steps = ["Fetch Articles", "Normalize Data", "Save to Database", "Optimize Database"]

export default function PipelineView() {
  const theme = useTheme()
  const settings = useSettingsContext()

  // Step state
  const [activeStep, setActiveStep] = useState(0)
  const [deletedArticlesCount, setDeletedArticlesCount] = useState(0)

  // Fetch state
  const [fetchState, setFetchState] = useState({
    articles: [],
    limit: 100,
    loading: false,
  })

  // Selection state
  const [selectionState, setSelectionState] = useState({
    selected: [],
    selectAll: false,
  })

  // Normalization state
  const [normalizationState, setNormalizationState] = useState({
    data: [],
    isInProgress: false,
    progress: 0,
    totalItems: 0,
    timeElapsed: 0,
  })

  // UI state
  const [uiState, setUiState] = useState({
    page: 0,
    rowsPerPage: 10,
    notification: {
      open: false,
      message: "",
      severity: "info",
    },
  })

  // Date range state
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 17 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16), // 17 hours ago
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16)) // Current time

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // Show notification
  const showNotification = useCallback((message, severity = "info") => {
    setUiState((prev) => ({
      ...prev,
      notification: {
        open: true,
        message,
        severity,
      },
    }))
  }, [])

  // Start normalization timer
  const startNormalizationTimer = useCallback(() => {
    const startTime = Date.now()
    const timer = setInterval(() => {
      setNormalizationState((prev) => ({
        ...prev,
        timeElapsed: Math.floor((Date.now() - startTime) / 1000),
      }))
    }, 1000)
    return timer
  }, [])

  // Handle fetch articles
  const handleFetchArticles = async () => {
    setFetchState((prev) => ({ ...prev, loading: true }))
    try {
      const fetchedArticles = await dataService.fetchLatestScrap(fetchState.limit)

      if (fetchedArticles.length === 0) {
        showNotification("No articles fetched. Please Run The Worker and Try again.", "error")
      } else {
        setFetchState({
          articles: fetchedArticles,
          limit: fetchState.limit,
          loading: false,
        })
        showNotification(`Fetched ${fetchedArticles.length} articles`, "success")
        setActiveStep((prev) => prev + 1)
      }
    } catch (error) {
      showNotification("Failed to fetch articles", "error")
      setFetchState((prev) => ({ ...prev, loading: false }))
    }
  }

  // Handle normalize selected
  const handleNormalizeSelected = async () => {
    const selectedArticles = fetchState.articles.filter((article) => selectionState.selected.includes(article.title))

    setNormalizationState({
      isInProgress: true,
      progress: 0,
      totalItems: selectedArticles.length,
      timeElapsed: 0,
      data: [],
    })

    const timer = startNormalizationTimer()

    try {
      const response = await dataService.normalizeData(selectedArticles, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setNormalizationState((prev) => ({
            ...prev,
            progress: percentCompleted,
          }))
        },
      })

      clearInterval(timer)
      setNormalizationState((prev) => ({
        ...prev,
        data: response || [],
        isInProgress: false,
      }))

      showNotification(`Normalized ${selectedArticles.length} articles`, "success")
      setActiveStep((prev) => prev + 1)
      setSelectionState({ selected: [], selectAll: false })
    } catch (error) {
      clearInterval(timer)
      showNotification("Normalization failed", "error")
      setNormalizationState((prev) => ({ ...prev, isInProgress: false }))
    }
  }

  // Handle save to database
  const handleSaveToDatabase = async () => {
    if (!normalizationState.data.length) {
      showNotification("No normalized data to save", "warning")
      return
    }

    setIsSaving(true)
    try {
      await dataService.saveCleanData(normalizationState.data)
      showNotification(`Saved ${normalizationState.data.length} normalized articles`, "success")
      setNormalizationState({
        data: [],
        isInProgress: false,
        progress: 0,
        totalItems: 0,
        timeElapsed: 0,
      })
      setActiveStep((prev) => prev + 1)
    } catch (error) {
      showNotification("Failed to save normalized data", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle optimize database
  const handleOptimizeDatabase = async () => {
    setNormalizationState((prev) => ({ ...prev, isInProgress: true }))
    try {
      const response = await dataService.deleteDuplicates(startDate, endDate)
      setDeletedArticlesCount(response.duplicatesDeleted)
      showNotification("Database optimization completed successfully", "success")
      setNormalizationState((prev) => ({ ...prev, isInProgress: false }))
      setActiveStep(0)
    } catch (error) {
      showNotification("Failed to optimize database", "error")
      setNormalizationState((prev) => ({ ...prev, isInProgress: false }))
    }
  }

  // Handle select all
  const handleSelectAll = (event) => {
    setSelectionState({
      selected: event.target.checked ? fetchState.articles.map((article) => article.title) : [],
      selectAll: event.target.checked,
    })
  }

  // Handle select one
  const handleSelectOne = (title) => {
    setSelectionState((prev) => {
      const isCurrentlySelected = prev.selected.includes(title)
      const newSelected = isCurrentlySelected ? prev.selected.filter((t) => t !== title) : [...prev.selected, title]

      return {
        selected: newSelected,
        selectAll: newSelected.length === fetchState.articles.length,
      }
    })
  }

  // Paginated articles
  const paginatedArticles = useMemo(() => {
    const { page, rowsPerPage } = uiState
    return fetchState.articles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [fetchState.articles, uiState])

  // Get step icon
  const getStepIcon = (index) => {
    if (index === 0) return <CloudDownloadIcon />
    if (index === 1) return <FilterListIcon />
    if (index === 2) return <SaveIcon />
    if (index === 3) return <StorageIcon />
    return null
  }

  // Get step content
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <CloudDownloadIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Fetch Articles
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Fetch articles from the source based on the set limit. Adjust the slider to set how many articles you
                want to fetch.
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Articles Limit:
                  </Typography>
                  <Slider
                    value={fetchState.limit}
                    onChange={(e, value) => setFetchState((prev) => ({ ...prev, limit: value }))}
                    min={1}
                    max={4000}
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <Chip label={fetchState.limit} color="primary" />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={fetchState.loading ? <Skeleton width={20} height={20} /> : <CloudDownloadIcon />}
                  onClick={handleFetchArticles}
                  disabled={fetchState.limit <= 0 || fetchState.loading}
                >
                  {fetchState.loading ? "Fetching..." : "Fetch Articles"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )

      case 1:
        return (
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 0 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" px={3} py={2}>
                <Box display="flex" alignItems="center">
                  <FilterListIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium">
                    Normalize Data
                  </Typography>
                </Box>

                <Box>
                  <Chip
                    label={`${selectionState.selected.length} selected`}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FilterListIcon />}
                    onClick={handleNormalizeSelected}
                    disabled={selectionState.selected.length === 0}
                    size="small"
                  >
                    Normalize Selected
                  </Button>
                </Box>
              </Box>

              <Divider />

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectionState.selectAll}
                          indeterminate={
                            selectionState.selected.length > 0 &&
                            selectionState.selected.length < fetchState.articles.length
                          }
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Source</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Title</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Description</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">Date</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedArticles.map((article) => (
                      <TableRow
                        key={article.title}
                        hover
                        selected={selectionState.selected.includes(article.title)}
                        onClick={() => handleSelectOne(article.title)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectionState.selected.includes(article.title)} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={article.source || "Unknown"}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: "medium" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 250,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {article.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={article.description || "No description available"} arrow placement="top">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 250,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {article.description?.length > 100
                                ? `${article.description.substring(0, 100)}...`
                                : article.description || "N/A"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <CalendarIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.7 }} />
                            <Typography variant="body2">
                              {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={fetchState.articles.length}
                rowsPerPage={uiState.rowsPerPage}
                page={uiState.page}
                onPageChange={(e, newPage) => setUiState((prev) => ({ ...prev, page: newPage }))}
                onRowsPerPageChange={(e) => {
                  const newRowsPerPage = Number.parseInt(e.target.value, 10)
                  setUiState((prev) => ({
                    ...prev,
                    rowsPerPage: newRowsPerPage,
                    page: 0,
                  }))
                }}
              />
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <SaveIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Save to Database
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Save the normalized data to the database. This step will store all the processed articles for future
                use.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mt: 2,
                  mb: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.neutral,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <InfoIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        Normalized Articles:
                      </Typography>
                      <Chip
                        label={normalizationState.data.length}
                        color="primary"
                        size="small"
                        sx={{ ml: 1, fontWeight: "bold" }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <InfoIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        Time Elapsed:
                      </Typography>
                      <Chip
                        label={`${normalizationState.timeElapsed} seconds`}
                        color="secondary"
                        size="small"
                        sx={{ ml: 1, fontWeight: "bold" }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isSaving ? <Skeleton width={20} height={20} /> : <SaveIcon />}
                  onClick={handleSaveToDatabase}
                  disabled={!normalizationState.data.length || isSaving}
                  size="large"
                >
                  {isSaving ? "Saving..." : "Save to Database"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Optimize Database
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Optimize the database by removing duplicates and cleaning up data within the selected date range.
              </Typography>

              <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {deletedArticlesCount > 0 && (
                <Alert
                  severity="success"
                  variant="outlined"
                  sx={{ mb: 3 }}
                  icon={<CheckCircleIcon fontSize="inherit" />}
                >
                  Successfully deleted {deletedArticlesCount} duplicate articles from the database.
                </Alert>
              )}

              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={normalizationState.isInProgress ? <Skeleton width={20} height={20} /> : <StorageIcon />}
                  onClick={handleOptimizeDatabase}
                  disabled={normalizationState.isInProgress}
                  size="large"
                >
                  {normalizationState.isInProgress ? "Optimizing..." : "Optimize Database"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          Article Processing Pipeline
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Fetch, normalize, save, and optimize article data in a streamlined workflow
        </Typography>
      </Box>

      {/* Stepper */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}`, p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={() => getStepIcon(index)}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Step Content */}
      {getStepContent()}

      {/* Normalization Progress Dialog */}
      <Dialog open={normalizationState.isInProgress} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <FilterListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Normalizing Articles</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Processing {normalizationState.totalItems} articles. Please wait while the normalization is in progress.
          </DialogContentText>

          <Box sx={{ mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {normalizationState.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={normalizationState.progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.neutral,
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Time Elapsed:
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="medium" color="primary.main">
                  {normalizationState.timeElapsed} seconds
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.neutral,
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <FilterListIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Normalized Items:
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="medium" color="primary.main">
                  {normalizationState.data.length} / {normalizationState.totalItems}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={uiState.notification.open}
        autoHideDuration={5000}
        onClose={() =>
          setUiState((prev) => ({
            ...prev,
            notification: { ...prev.notification, open: false },
          }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={uiState.notification.severity}
          variant="filled"
          onClose={() =>
            setUiState((prev) => ({
              ...prev,
              notification: { ...prev.notification, open: false },
            }))
          }
          sx={{ width: "100%" }}
        >
          {uiState.notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

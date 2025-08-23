"use client"

import { useState, useEffect, useCallback } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Save as SaveIcon,
  Link as LinkIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
  DataObject as DataObjectIcon,
  CleaningServices as CleaningServicesIcon,
} from "@mui/icons-material"
import {
  Box,
  Card,
  Grid,
  Chip,
  Alert,
  Stack,
  Table,
  Modal,
  Button,
  Select,
  Tooltip,
  TableRow,
  Checkbox,
  Snackbar,
  MenuItem,
  Skeleton,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  CardContent,
  LinearProgress,
  TableContainer,
  TablePagination,
} from "@mui/material"

// Services and components
import ForbiddenPage from "src/pages/403"
import feedsService from "src/services/feedsService"
import sourcesService from "src/services/sourcesService"

import { useSettingsContext } from "src/components/settings"

export default function WorkerView() {
  const theme = useTheme()
  const settings = useSettingsContext()

  // State variables
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [scrapeHistory, setScrapeHistory] = useState([])
  const [progress, setProgress] = useState({
    completedSources: 0,
    totalSources: 0,
    progressPercentage: 0,
    totalScrapedItems: 0,
  })
  const [status, setStatus] = useState({ type: null, message: "" })
  const [scrapedItems, setScrapedItems] = useState([])
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [modalContent, setModalContent] = useState({ type: "", url: "" })
  const [limit, setLimit] = useState(0)
  const [scrapCount, setScrapCount] = useState(0)
  const [sourceGroups, setSourceGroups] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [forbidden, setForbidden] = useState(false)

  // Define handleForbiddenError
  const handleForbiddenError = useCallback((error) => {
    if (
      (error.response && error.response.status === 403) ||
      (error.message && error.message.includes("Access denied"))
    ) {
      setForbidden(true)
    }
  }, [])

  // Fetch functions with useCallback
  const fetchScrapeHistory = useCallback(async () => {
    try {
      const data = await feedsService.fetchScrapeHistory()
      if (data.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setScrapeHistory(data)
      }
    } catch (error) {
      handleForbiddenError(error)
      console.error("Failed to fetch scrape history:", error)
    }
  }, [handleForbiddenError])

  const fetchScrapCount = useCallback(async () => {
    try {
      const count = await feedsService.getScrapCount()
      if (count.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setScrapCount(count)
      }
    } catch (error) {
      handleForbiddenError(error)
      console.error("Failed to fetch scrap count:", error)
    }
  }, [handleForbiddenError])

  const fetchSourceGroups = useCallback(async () => {
    try {
      const data = await sourcesService.fetchAllSourceGroups()
      if (data.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setSourceGroups(data.groups)
      }
    } catch (error) {
      handleForbiddenError(error)
      console.error("Failed to fetch source groups:", error)
    }
  }, [handleForbiddenError])

  // Format date helper
  const formatDate = (dateString) => new Date(dateString).toLocaleString()

  // Handle start scraping
  const handleStartScraping = async () => {
    if (!selectedGroupId) {
      setStatus({ type: "error", message: "Please select a source group." })
      setSnackbarOpen(true)
      return
    }

    setIsScrapingInProgress(true)
    setStatus({ type: "info", message: "Fetching source group length..." })

    try {
      // Fetch total sources before starting scraping
      const totalSourcesResponse = await sourcesService.fetchGroupLength(selectedGroupId)
      const totalSources = totalSourcesResponse.sourceCount
      // eslint-disable-next-line
      const waitTime = totalSources * 150
      const totalSteps = totalSources
      let completedSteps = 0

      setProgress({
        completedSources: 0,
        totalSources,
        progressPercentage: 0,
        totalScrapedItems: 0,
      })

      const interval = setInterval(() => {
        completedSteps += 1
        const newPercentage = (completedSteps / totalSteps) * 100

        setProgress((prev) => ({
          ...prev,
          completedSources: completedSteps,
          progressPercentage: newPercentage,
        }))

        if (completedSteps >= totalSteps) {
          clearInterval(interval)
        }
      }, 1000)

      // Perform scraping operation
      const scrapeResponse = await feedsService.startScraping(selectedGroupId)
      if (scrapeResponse.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setScrapedItems(scrapeResponse.data)
        setProgress((prev) => ({
          ...prev,
          totalScrapedItems: scrapeResponse.itemCount,
        }))
      }

      // Finish progress when scraping is complete
      clearInterval(interval)
      setProgress((prev) => ({
        ...prev,
        completedSources: totalSources,
        progressPercentage: 100,
      }))

      setStatus({ type: "success", message: `Scraping complete. Total items: ${scrapeResponse.itemCount}` })
      fetchScrapeHistory()
      fetchScrapCount()
    } catch (error) {
      handleForbiddenError(error)
      setStatus({ type: "error", message: `Failed to start scraping: ${error.message}` })
    } finally {
      setIsScrapingInProgress(false)
      setSnackbarOpen(true)
    }
  }

  // Handle save data
  const handleSaveData = async () => {
    if (scrapedItems.length > 0) {
      setIsSaving(true)
      try {
        const data = await feedsService.saveData(scrapedItems)
        if (data.message === "Access denied: Insufficient permissions") {
          setForbidden(true)
        } else {
          setStatus({ type: "success", message: data.message })
        }
      } catch (error) {
        handleForbiddenError(error)
        setStatus({ type: "error", message: `Error saving data: ${error.message}` })
      } finally {
        setSnackbarOpen(true)
        setIsSaving(false)
      }
    }
  }

  // Handle select all click
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = scrapedItems.map((item) => item.title)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  // Handle click on row
  const handleClick = (title) => {
    const selectedIndex = selected.indexOf(title)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, title)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }

    setSelected(newSelected)
  }

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  // Modal style
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  }

  // Handle clean scraps
  const handleCleanScraps = async () => {
    try {
      const response = await feedsService.cleanScraps(limit)
      if (response.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setStatus({ type: "success", message: response.message })
        fetchScrapeHistory()
        fetchScrapCount()
      }
    } catch (error) {
      handleForbiddenError(error)
      setStatus({ type: "error", message: `Error cleaning scraps: ${error.message}` })
    } finally {
      setSnackbarOpen(true)
    }
  }

  // useEffect to fetch data
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true)
      if (!forbidden) {
        try {
          await Promise.all([fetchScrapeHistory(), fetchScrapCount(), fetchSourceGroups()])
        } catch (error) {
          console.error("Error loading initial data:", error)
        } finally {
          setInitialLoading(false)
        }
      }
    }

    fetchInitialData()
  }, [fetchScrapeHistory, fetchScrapCount, fetchSourceGroups, forbidden])

  if (forbidden) {
    return <ForbiddenPage />
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={5}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Data Collection Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Run the worker to gather and manage data from various sources
        </Typography>
      </Box>

      {/* Scraping History Card */}
      <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <HistoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight="medium">
              Recent Scraping History
            </Typography>
          </Box>

          {initialLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                    <TableCell>
                      <Typography variant="subtitle2">Name</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Date</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Total Sources</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Items Scraped</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Wait Time</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scrapeHistory.length > 0 ? (
                    scrapeHistory.map((history) => (
                      <TableRow key={history._id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{history.name}</Typography>
                        </TableCell>
                        <TableCell>{formatDate(history.scrapeTime)}</TableCell>
                        <TableCell>
                          <Chip label={history.totalSources} color="primary" size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip label={history.length} color="success" size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium" color={history.waitTime > 10 ? "error.main" : "success.main"}>
                            {history.waitTime.toFixed(2)}s
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" py={2}>
                          No scraping history available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Worker Control Panel */}
      <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <DataObjectIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight="medium">
              Worker Control Panel
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Source Group Selection */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Select Source Group
                  </Typography>
                </Box>

                {initialLoading ? (
                  <Skeleton variant="rectangular" width="100%" height={56} />
                ) : (
                  <Select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    displayEmpty
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    <MenuItem value="" disabled>
                      Select a group
                    </MenuItem>
                    {sourceGroups.map((group) => (
                      <MenuItem key={group._id} value={group._id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Choose a source group to scrape data from
                </Typography>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PlayArrowIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Actions
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} mb={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartScraping}
                    disabled={isScrapingInProgress || initialLoading}
                    startIcon={<PlayArrowIcon />}
                    fullWidth
                  >
                    {isScrapingInProgress ? "Running..." : "Launch"}
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveData}
                    disabled={scrapedItems.length === 0 || isScrapingInProgress || isSaving || initialLoading}
                    startIcon={<SaveIcon />}
                    fullWidth
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Launch to start scraping or save collected data
                </Typography>
              </Card>
            </Grid>

            {/* Clean Scraps */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CleaningServicesIcon color="primary" sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Clean Scraps
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    variant="outlined"
                    type="number"
                    placeholder="Limit"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    size="small"
                    fullWidth
                  />

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleCleanScraps}
                    disabled={isScrapingInProgress || isSaving || initialLoading}
                    startIcon={<DeleteIcon />}
                  >
                    Clean
                  </Button>
                </Stack>

                <Box display="flex" alignItems="center" mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Current scraps:
                  </Typography>
                  <Chip label={scrapCount} color="error" size="small" sx={{ ml: 1 }} />
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Section */}
          {(isScrapingInProgress || progress.totalSources > 0) && (
            <Box mt={3} p={2} border={`1px solid ${theme.palette.divider}`} borderRadius={1}>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Progress
              </Typography>

              {isScrapingInProgress && (
                <Box display="flex" alignItems="center" mb={1}>
                  <LinearProgress
                    variant="determinate"
                    value={progress.progressPercentage}
                    sx={{ flexGrow: 1, mr: 2, height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(progress.progressPercentage)}%
                  </Typography>
                </Box>
              )}

              {progress.totalSources > 0 && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    Scraped {progress.completedSources}/{progress.totalSources} sources
                  </Typography>
                  <Chip
                    label={`Total Items: ${progress.totalScrapedItems}`}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Scraped Items Table */}
      {scrapedItems.length > 0 && (
        <Card sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <FilterListIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight="medium">
                  Scraped Items
                </Typography>
              </Box>

              <Chip label={`${scrapedItems.length} items`} color="primary" size="small" />
            </Box>

            <TableContainer sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < scrapedItems.length}
                        checked={scrapedItems.length > 0 && selected.length === scrapedItems.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Source</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Title</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Link</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Description</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Image</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Publication Date</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">Creator</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scrapedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                    <TableRow
                      hover
                      onClick={() => handleClick(item.title)}
                      role="checkbox"
                      aria-checked={selected.indexOf(item.title) !== -1}
                      tabIndex={-1}
                      key={item.title}
                      selected={selected.indexOf(item.title) !== -1}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={selected.indexOf(item.title) !== -1} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.source}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {item.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Open Link">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalContent({ type: "link", url: item.link })
                              setOpenModal(true)
                            }}
                          >
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {item.description?.length > 100
                            ? `${item.description.substring(0, 100)}...`
                            : item.description || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.imageUrl ? (
                          <Box
                            component="img"
                            src={item.imageUrl}
                            alt="Article"
                            sx={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 1,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setModalContent({ type: "image", url: item.imageUrl })
                              setOpenModal(true)
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.pubDate || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.creator || "N/A"}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={scrapedItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "none" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={status.type || "info"} variant="filled" sx={{ width: "100%" }}>
          {status.message}
        </Alert>
      </Snackbar>

      {/* Modal for links and images */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          {modalContent.type === "image" ? (
            <Box>
              <Typography variant="h6" mb={2}>
                Image Preview
              </Typography>
              <Box component="img" src={modalContent.url} alt="Modal content" sx={{ width: "100%", borderRadius: 1 }} />
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" mb={2}>
                Link
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.action.hover,
                  borderRadius: 1,
                  wordBreak: "break-all",
                }}
              >
                <a
                  href={modalContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.palette.primary.main }}
                >
                  {modalContent.url}
                </a>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" onClick={() => setOpenModal(false)}>
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  )
}

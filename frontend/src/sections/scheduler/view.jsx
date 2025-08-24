import moment from "moment"
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from "react"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Calendar, momentLocalizer } from "react-big-calendar"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Add as AddIcon,
  List as ListIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material"
import {
  Box,
  Tab,
  Tabs,
  Card,
  Chip,
  Grid,
  Table,
  Paper,
  Alert,
  Button,
  Select,
  Switch,
  Tooltip,
  Divider,
  Snackbar,
  TableRow,
  MenuItem,
  Skeleton,
  TextField,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  CardContent,
  TableContainer,
  TablePagination,
  CircularProgress,
  FormControlLabel,
} from "@mui/material"

// Services and components
import ForbiddenPage from "src/pages/403"
import schedulerService from "src/services/schedulerService"

const localizer = momentLocalizer(moment)

export default function SchedulerView() {
  const theme = useTheme()

  // State variables
  const [taskName, setTaskName] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [sourceGroups, setSourceGroups] = useState([])
  const [events, setEvents] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [forbidden, setForbidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)
  const [tabIndex, setTabIndex] = useState(0)
  const [tooltipData, setTooltipData] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [isMultiple, setIsMultiple] = useState(false)
  const [eventCount, setEventCount] = useState(2)
  const [interval, setInterval] = useState(5)
  const [startTime, setStartTime] = useState("")
  const [error, setError] = useState("")

  // Status colors
  const statusColors = {
    pending: theme.palette.warning.main,
    "in progress": theme.palette.primary.main,
    completed: theme.palette.success.main,
    failed: theme.palette.error.main,
  }

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const data = await schedulerService.fetchEvents()
      if (data.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setEvents(data.events || data)
      }
    } catch (error5) {
      handleError(error5)
    }
  }, [])

  // Fetch source groups
  const fetchSourceGroups = useCallback(async () => {
    try {
      const groupsData = await schedulerService.fetchAllSourceGroups()
      if (groupsData.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setSourceGroups(groupsData.groups)
      }
    } catch (error1) {
      handleError(error1)
    }
  }, [])

  // Handle error
  const handleError = (error4) => {
    if (
      (error4.response && error4.response.status === 403) ||
      (error4.message && error4.message.includes("Access denied"))
    ) {
      setForbidden(true)
    } else {
      console.error("Error:", error4)
      setError("An error occurred. Please try again.")
    }
  }

  // Handle normal submit
  const handleNormalSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const taskData = { taskName, dateTime, sourceGroup: selectedGroupId }
    try {
      const response = await schedulerService.scheduleEvent(taskData)
      if (response.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setSnackbarMessage(response.message || "Task scheduled successfully")
        setSnackbarSeverity("success")
        setSnackbarOpen(true)
        fetchEvents()
        // Reset form
        setTaskName("")
        setDateTime("")
      }
    } catch (error3) {
      setSnackbarMessage("Failed to schedule task.")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
      console.error("Error scheduling event:", error3)
    } finally {
      setLoading(false)
    }
  }

  // Handle multiple submit
  const handleMultipleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const taskData = { eventCount, interval, startTime, taskName, sourceGroup: selectedGroupId }
    try {
      const response = await schedulerService.scheduleMultipleEvents(taskData)
      if (response.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setSnackbarMessage(response.message || "Multiple tasks scheduled successfully")
        setSnackbarSeverity("success")
        setSnackbarOpen(true)
        fetchEvents()
        // Reset form
        setTaskName("")
        setStartTime("")
      }
    } catch (error1) {
      setSnackbarMessage("Failed to schedule multiple tasks.")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
      console.error("Error scheduling events:", error1)
    } finally {
      setLoading(false)
    }
  }

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
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

  // Handle delete event
  const handleDeleteEvent = async (id) => {
    setDeleteLoadingId(id)
    try {
      const response = await schedulerService.deleteEvent(id)
      setSnackbarMessage(response.message || "Event deleted successfully")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
      setEvents(events.filter((event) => event._id !== id))
    } catch (error1) {
      setSnackbarMessage("Failed to delete event.")
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
      console.error("Error deleting event:", error1)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  // Handle event hover
  const handleEventHover = (event, e) => {
    setTooltipData(event)
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top + window.scrollY + 20,
        left: rect.left + window.scrollX,
      })
    }
  }

  // Format time
  const formatElapsedTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "-"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      try {
        await Promise.all([fetchEvents(), fetchSourceGroups()])
      } catch (error1) {
        console.error("Error loading initial data:", error1)
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [fetchEvents, fetchSourceGroups])

  // Format calendar events
  const calendarEvents = events.map((event) => ({
    id: event._id,
    title: event.taskName,
    start: new Date(event.dateTime),
    end: new Date(new Date(event.dateTime).getTime() + 60 * 60 * 1000),
    status: event.status,
    sourceGroup: event.sourceGroup,
    dateTime: new Date(event.dateTime).toLocaleString(),
  }))

  if (forbidden) {
    return <ForbiddenPage />
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Task Scheduler
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Schedule and manage automated tasks for data collection
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": {
              py: 2,
              minHeight: "auto",
            },
          }}
        >
          <Tab
            label="Schedule Task"
            icon={<ScheduleIcon />}
            iconPosition="start"
            sx={{ fontWeight: tabIndex === 0 ? "bold" : "normal" }}
          />
          <Tab
            label="Scheduled Tasks"
            icon={<ListIcon />}
            iconPosition="start"
            sx={{ fontWeight: tabIndex === 1 ? "bold" : "normal" }}
          />
          <Tab
            label="Calendar"
            icon={<CalendarIcon />}
            iconPosition="start"
            sx={{ fontWeight: tabIndex === 2 ? "bold" : "normal" }}
          />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {/* Schedule Task Tab */}
          {tabIndex === 0 && (
            <Box p={3}>
              <form onSubmit={isMultiple ? handleMultipleSubmit : handleNormalSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AddIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="medium">
                        {isMultiple ? "Schedule Multiple Tasks" : "Schedule a Task"}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={<Switch checked={isMultiple} onChange={(e) => setIsMultiple(e.target.checked)} />}
                      label="Schedule Multiple Events"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Task Name"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      required
                      fullWidth
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Source Group</InputLabel>
                      <Select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        startAdornment={<GroupIcon fontSize="small" sx={{ mr: 1, ml: -0.5, opacity: 0.7 }} />}
                      >
                        {sourceGroups.map((group) => (
                          <MenuItem key={group._id} value={group._id}>
                            {group.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {isMultiple ? (
                    <>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Start Time"
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Interval (minutes)"
                          type="number"
                          value={interval}
                          onChange={(e) => setInterval(Math.max(5, e.target.value))}
                          required
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: <AccessTimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Event Count"
                          type="number"
                          value={eventCount}
                          onChange={(e) => setEventCount(Math.max(1, e.target.value))}
                          required
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <TextField
                        label="Date and Time"
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        required
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScheduleIcon />}
                      >
                        {loading ? "Scheduling..." : "Schedule Task"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}

          {/* Scheduled Tasks Tab */}
          {tabIndex === 1 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" p={3} pb={2}>
                <Box display="flex" alignItems="center">
                  <ListIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium">
                    Scheduled Tasks
                  </Typography>
                </Box>
                <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={fetchEvents}>
                  Refresh
                </Button>
              </Box>
      {/* eslint-disable-next-line */}
              {initialLoading ? (
                <Box p={3}>
                  <Skeleton variant="rectangular" height={400} />
                </Box>
              ) : events.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                          <TableCell>
                            <Typography variant="subtitle2">Task Name</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">Date and Time</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">Source Group</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">Status</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">Elapsed Time</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2">Actions</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {events.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event) => (
                          <TableRow key={event._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {event.taskName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{new Date(event.dateTime).toLocaleString()}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={event.sourceGroup}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: "medium" }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={event.status}
                                size="small"
                                sx={{
                                  bgcolor: `${statusColors[event.status]}20`,
                                  color: statusColors[event.status],
                                  fontWeight: "medium",
                                  textTransform: "capitalize",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {formatElapsedTime(event.elapsedTime)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Delete Task">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteEvent(event._id)}
                                  disabled={deleteLoadingId === event._id}
                                  size="small"
                                >
                                  {deleteLoadingId === event._id ? (
                                    <CircularProgress size={20} color="inherit" />
                                  ) : (
                                    <DeleteIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={events.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              ) : (
                <Box p={4} textAlign="center">
                  <ScheduleIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Scheduled Tasks
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You haven&apos;t scheduled any tasks yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setTabIndex(0)}
                    sx={{ mt: 1 }}
                  >
                    Schedule a Task
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Calendar Tab */}
          {tabIndex === 2 && (
            <Box p={3}>
              <Box display="flex" alignItems="center" mb={3}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Task Calendar
                </Typography>
              </Box>

              {initialLoading ? (
                <Skeleton variant="rectangular" height={600} />
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                  }}
                >
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Status Legend:
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {Object.entries(statusColors).map(([status, color]) => (
                        <Chip
                          key={status}
                          label={status}
                          size="small"
                          sx={{
                            bgcolor: `${color}20`,
                            color,
                            fontWeight: "medium",
                            textTransform: "capitalize",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{
                      height: "70vh",
                      width: "100%",
                    }}
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor: statusColors[event.status] || theme.palette.grey[500],
                        borderRadius: "4px",
                        color: "white",
                        border: "none",
                        padding: "2px 4px",
                      },
                    })}
                    onSelectEvent={handleEventHover}
                    components={{
                      toolbar: (props) => (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Button
                              onClick={() => props.onNavigate("TODAY")}
                              variant="outlined"
                              size="small"
                              sx={{ textTransform: "none" }}
                            >
                              Today
                            </Button>
                            <IconButton onClick={() => props.onNavigate("PREV")} size="small">
                              &lt;
                            </IconButton>
                            <IconButton onClick={() => props.onNavigate("NEXT")} size="small">
                              &gt;
                            </IconButton>
                          </Box>
                          <Typography variant="h6" fontWeight="medium">
                            {props.label}
                          </Typography>
                          <Box>
                            <Select
                              value={props.view}
                              onChange={(e) => props.onView(e.target.value)}
                              size="small"
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="month">Month</MenuItem>
                              <MenuItem value="week">Week</MenuItem>
                              <MenuItem value="day">Day</MenuItem>
                              <MenuItem value="agenda">Agenda</MenuItem>
                            </Select>
                          </Box>
                        </Box>
                      ),
                    }}
                  />
                </Paper>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Tooltip for calendar events */}
      {tooltipData && (
        <Tooltip
          title={
            <Box p={1}>
              <Typography variant="subtitle2" gutterBottom>
                {tooltipData.title}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <GroupIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                {tooltipData.sourceGroup}
              </Typography>
              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                {tooltipData.dateTime}
              </Typography>
              <Chip
                label={tooltipData.status}
                size="small"
                sx={{
                  bgcolor: `${statusColors[tooltipData.status]}20`,
                  color: statusColors[tooltipData.status],
                  fontWeight: "medium",
                  textTransform: "capitalize",
                  mt: 1,
                }}
              />
            </Box>
          }
          placement="top"
          arrow
          open={Boolean(tooltipData)}
          onClose={() => setTooltipData(null)}
          PopperProps={{
            style: {
              position: "absolute",
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 9999,
            },
          }}
        >
          <span />
        </Tooltip>
      )}
    </Container>
  )
}
SchedulerView.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
    onView: PropTypes.func.isRequired, // Add this line

};
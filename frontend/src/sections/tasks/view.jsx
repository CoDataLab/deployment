"use client"

import { useState, useEffect } from "react"

// MUI components
import { alpha, useTheme } from "@mui/material/styles"
// MUI icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Task as TaskIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Pending as PendingIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material"
import {
  Box,
  Card,
  Grid,
  Chip,
  Alert,
  Paper,
  Badge,
  Button,
  Dialog,
  Avatar,
  Tooltip,
  Divider,
  Snackbar,
  MenuItem,
  Skeleton,
  Container,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material"

// Services and components
import ForbiddenPage from "src/pages/403"
import { useAuthContext } from "src/auth/hooks"
import tasksService from "src/services/tasksService"

import { useSettingsContext } from "src/components/settings"

// Constants
const STATUS_OPTIONS = ["TO DO", "In Progress", "Done"]

export default function TasksView() {
  const theme = useTheme()
  const settings = useSettingsContext()
  const { user } = useAuthContext()

  // State variables
  const [tasks, setTasks] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    status: "TO DO",
    estimation: "",
    owner: "",
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState(null)
  const [forbidden, setForbidden] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const data = await tasksService.fetchAllTasks()
        if (data.message === "Access denied: Insufficient permissions") {
          setForbidden(true)
        } else {
          setTasks(data.tasks || [])
        }
      } catch (error) {
        if (
          (error.response && error.response.status === 403) ||
          (error.message && error.message.includes("Access denied"))
        ) {
          setForbidden(true)
        } else {
          console.error("Error fetching tasks:", error)
          showNotification("Failed to load tasks", "error")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    const taskData = { ...formData, owner: user?.fullName || "Anonymous" }

    try {
      const data = await tasksService.addTask(taskData)
      if (data.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        setFormData({ name: "", status: "TO DO", estimation: "", owner: "" })
        const updatedTasks = await tasksService.fetchAllTasks()
        setTasks(updatedTasks.tasks || [])
        showNotification("Task added successfully")
      }
    } catch (error) {
      if (
        (error.response && error.response.status === 403) ||
        (error.message && error.message.includes("Access denied"))
      ) {
        setForbidden(true)
      } else {
        console.error("Error adding task:", error)
        showNotification("Failed to add task", "error")
      }
    }
  }

  // Handle delete task
  const handleDelete = async (id) => {
    try {
      const data = await tasksService.deleteTask(id)
      if (data.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        const updatedTasks = await tasksService.fetchAllTasks()
        setTasks(updatedTasks.tasks || [])
        showNotification("Task deleted successfully")
      }
    } catch (error) {
      if (
        (error.response && error.response.status === 403) ||
        (error.message && error.message.includes("Access denied"))
      ) {
        setForbidden(true)
      } else {
        console.error("Error deleting task:", error)
        showNotification("Failed to delete task", "error")
      }
    }
  }

  // Handle open dialog
  const handleOpenDialog = (task) => {
    setCurrentTaskId(task._id)
    setFormData({
      name: task.name,
      status: task.status,
      estimation: task.estimation,
      owner: task.owner,
    })
    setOpenDialog(true)
  }

  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentTaskId(null)
    setFormData({ name: "", status: "TO DO", estimation: "", owner: "" })
  }

  // Handle update task
  const handleUpdateTask = async () => {
    const taskData = { ...formData, owner: user?.fullName || formData.owner }
    try {
      const data = await tasksService.updateTask(currentTaskId, taskData)
      if (data.message === "Access denied: Insufficient permissions") {
        setForbidden(true)
      } else {
        handleCloseDialog()
        const updatedTasks = await tasksService.fetchAllTasks()
        setTasks(updatedTasks.tasks || [])
        showNotification("Task updated successfully")
      }
    } catch (error) {
      if (
        (error.response && error.response.status === 403) ||
        (error.message && error.message.includes("Access denied"))
      ) {
        setForbidden(true)
      } else {
        console.error("Error updating task:", error)
        showNotification("Failed to update task", "error")
      }
    }
  }

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Done":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
      case "In Progress":
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />
      case "TO DO":
      default:
        return <HourglassEmptyIcon sx={{ color: theme.palette.info.main }} />
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return theme.palette.success.main
      case "In Progress":
        return theme.palette.warning.main
      case "TO DO":
      default:
        return theme.palette.info.main
    }
  }

  // Get owner avatar color
  const getOwnerAvatarColor = (owner) => {
    if (!owner) return theme.palette.primary.main

    const firstLetter = owner.charAt(0).toUpperCase()
    const charCode = firstLetter.charCodeAt(0)
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ]

    return colors[charCode % colors.length]
  }

  // Get owner initials
  const getOwnerInitials = (owner) => {
    if (!owner) return "?"

    const names = owner.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  if (forbidden) {
    return <ForbiddenPage />
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Task Management Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, manage, and track your team&apos;s tasks in one place
        </Typography>
      </Box>

      {/* Add Task Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <AddIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" fontWeight="medium">
            Add New Task
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Task Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Enter task name or description"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                required
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Box display="flex" alignItems="center">
                      {getStatusIcon(option)}
                      <Typography sx={{ ml: 1 }}>{option}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                name="estimation"
                label="Estimation"
                value={formData.estimation}
                onChange={handleChange}
                fullWidth
                required
                placeholder="e.g. 2h, 1d"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<AddIcon />}
                sx={{ height: "100%" }}
              >
                Add Task
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Task Statistics */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    To Do
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {loading ? <Skeleton width={40} /> : tasks.filter((task) => task.status === "TO DO").length}
                  </Typography>
                </Box>
                <HourglassEmptyIcon sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {loading ? <Skeleton width={40} /> : tasks.filter((task) => task.status === "In Progress").length}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.7 }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.05),
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {loading ? <Skeleton width={40} /> : tasks.filter((task) => task.status === "Done").length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* eslint-disable-next-line */}
      {loading ? (
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: 200,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={30} width="80%" sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : tasks.length > 0 ? (
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `4px solid ${getStatusColor(task.status)}`,
                  borderRadius: 2,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ position: "relative", p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <Tooltip title={task.status}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: getStatusColor(task.status),
                              border: `2px solid ${theme.palette.background.paper}`,
                            }}
                          />
                        </Tooltip>
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: getOwnerAvatarColor(task.owner),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getOwnerInitials(task.owner)}
                      </Avatar>
                    </Badge>

                    <Chip
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={task.estimation}
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom fontWeight="medium">
                    {task.name}
                  </Typography>

                  <Box display="flex" alignItems="center" mt={1}>
                    <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2" color="text.secondary">
                      {task.owner || "Unassigned"}
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />

                <Box sx={{ p: 1, display: "flex", justifyContent: "space-around" }}>
                  <Tooltip title="Edit Task">
                    <IconButton onClick={() => handleOpenDialog(task)} color="primary" size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Task">
                    <IconButton onClick={() => handleDelete(task._id)} color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <TaskIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Tasks Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Get started by adding your first task using the form above
          </Typography>
        </Card>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <EditIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Edit Task</Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Task Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Box display="flex" alignItems="center">
                      {getStatusIcon(option)}
                      <Typography sx={{ ml: 1 }}>{option}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="estimation"
                label="Estimation"
                value={formData.estimation}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g. 2h, 1d"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdateTask} variant="contained" startIcon={<EditIcon />}>
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

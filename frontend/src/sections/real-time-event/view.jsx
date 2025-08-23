
import PropTypes from 'prop-types';
import { io } from "socket.io-client"
import { useRef, useState, useEffect } from "react"
import {
  X,
  Zap,
  Play,
  Info,
  Code,
  Wifi,
  Menu,
  Pause,
  Clock,
  Trash2,
  Server,
  Filter,
  WifiOff,
  Download,
  Activity,
  BarChart3,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"

import {
  Box,
  Card,
  Chip,
  Fade,
  Grid,
  Stack,
  Paper,
  Slide,
  Badge,
  Button,
  Switch,
  Avatar,
  Drawer,
  AppBar,
  Tooltip,
  Divider,
  Toolbar,
  useTheme,
  Collapse,
  Container,
  Typography,
  IconButton,
  CardContent,
  useMediaQuery,
  LinearProgress,
  FormControlLabel,
} from "@mui/material"

import { HOST_API } from "src/config-global"

const MobileHeader = ({ isConnected, setMobileDrawerOpen }) => (
  <AppBar
    position="sticky"
    elevation={0}
    sx={{
      bgcolor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #e2e8f0",
      color: "#1e293b",
    }}
  >
    <Toolbar sx={{ px: 2 }}>
      <Avatar
        sx={{
          bgcolor: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          width: 40,
          height: 40,
          mr: 2,
        }}
      >
        <Zap size={20} />
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
          Pipeline Console
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Badge
            variant="dot"
            color={isConnected ? "success" : "error"}
            sx={{
              "& .MuiBadge-dot": {
                animation: isConnected ? "pulse 2s infinite" : "none",
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
              {isConnected ? "Connected" : "Disconnected"}
            </Typography>
          </Badge>
        </Stack>
      </Box>
      <IconButton
        onClick={() => setMobileDrawerOpen(true)}
        sx={{
          bgcolor: "#f1f5f9",
          color: "#475569",
          "&:hover": { bgcolor: "#e2e8f0" },
        }}
      >
        <Menu size={20} />
      </IconButton>
    </Toolbar>
  </AppBar>
)
MobileHeader.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  setMobileDrawerOpen: PropTypes.func.isRequired,
};
const ControlsDrawer = ({
  mobileDrawerOpen,
  setMobileDrawerOpen,
  autoScroll,
  setAutoScroll,
  isPaused,
  setIsPaused,
  logs,
  downloadLogs,
  clearLogs,
  scrollToTop,
  scrollToBottom,
}) => (
  <Drawer
    anchor="right"
    open={mobileDrawerOpen}
    onClose={() => setMobileDrawerOpen(false)}
    PaperProps={{
      sx: {
        width: 320,
        bgcolor: "#ffffff",
        borderLeft: "1px solid #e2e8f0",
      },
    }}
  >
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Controls
        </Typography>
        <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
          <X size={20} />
        </IconButton>
      </Stack>

      <Stack spacing={3}>
        <FormControlLabel
          control={
            <Switch
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#3b82f6",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#3b82f6",
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Auto-scroll to latest
            </Typography>
          }
        />

        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
            Actions
          </Typography>
          <Button
            fullWidth
            variant={isPaused ? "contained" : "outlined"}
            onClick={() => setIsPaused(!isPaused)}
            startIcon={isPaused ? <Play size={18} /> : <Pause size={18} />}
            sx={{
              py: 1.5,
              bgcolor: isPaused ? "#d97706" : "transparent",
              borderColor: isPaused ? "#d97706" : "#3b82f6",
              color: isPaused ? "#ffffff" : "#3b82f6",
              "&:hover": {
                bgcolor: isPaused ? "#b45309" : "#eff6ff",
              },
            }}
          >
            {isPaused ? "Resume Monitoring" : "Pause Monitoring"}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={downloadLogs}
            disabled={logs.length === 0}
            startIcon={<Download size={18} />}
            sx={{
              py: 1.5,
              borderColor: "#059669",
              color: "#059669",
              "&:hover": {
                bgcolor: "#ecfdf5",
              },
              "&:disabled": {
                borderColor: "#d1d5db",
                color: "#9ca3af",
              },
            }}
          >
            Download Logs
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={clearLogs}
            disabled={logs.length === 0}
            startIcon={<Trash2 size={18} />}
            sx={{
              py: 1.5,
              borderColor: "#dc2626",
              color: "#dc2626",
              "&:hover": {
                bgcolor: "#fef2f2",
              },
              "&:disabled": {
                borderColor: "#d1d5db",
                color: "#9ca3af",
              },
            }}
          >
            Clear Console
          </Button>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
            Navigation
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={scrollToTop}
              startIcon={<ChevronUp size={16} />}
              sx={{
                flex: 1,
                py: 1,
                borderColor: "#d1d5db",
                color: "#6b7280",
                "&:hover": {
                  bgcolor: "#f9fafb",
                },
              }}
            >
              Top
            </Button>
            <Button
              variant="outlined"
              onClick={scrollToBottom}
              startIcon={<ChevronDown size={16} />}
              sx={{
                flex: 1,
                py: 1,
                borderColor: "#d1d5db",
                color: "#6b7280",
                "&:hover": {
                  bgcolor: "#f9fafb",
                },
              }}
            >
              Bottom
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  </Drawer>
)
ControlsDrawer.propTypes = {
  mobileDrawerOpen: PropTypes.bool.isRequired,
  setMobileDrawerOpen: PropTypes.func.isRequired,
  autoScroll: PropTypes.bool.isRequired,
  setAutoScroll: PropTypes.func.isRequired,
  isPaused: PropTypes.bool.isRequired,
  setIsPaused: PropTypes.func.isRequired,
  logs: PropTypes.array.isRequired,
  downloadLogs: PropTypes.func.isRequired,
  clearLogs: PropTypes.func.isRequired,
  scrollToTop: PropTypes.func.isRequired,
  scrollToBottom: PropTypes.func.isRequired,
};

const RealTimeEventsExecution = () => {
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState("all")
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
    processing: 0,
  })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const socketRef = useRef(null)
  const logsEndRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(HOST_API, {
      transports: ["websocket"],
      withCredentials: true,
    })

    socketRef.current.on("connect", () => {
      setIsConnected(true)
      console.log("Connected to pipeline logs")
    })

    socketRef.current.on("disconnect", () => {
      setIsConnected(false)
      console.log("Disconnected from pipeline logs")
    })

    // Receive historical logs
    socketRef.current.on("pipeline-logs-history", (historicalLogs) => {
      setLogs(historicalLogs)
      updateStats(historicalLogs)
    })

    // Receive new log entries
    socketRef.current.on("pipeline-log", (logEntry) => {
      if (!isPaused) {
        setLogs((prev) => {
          const newLogs = [...prev, logEntry]
          updateStats(newLogs)
          return newLogs
        })
      }
    })

    // Handle logs cleared
    socketRef.current.on("pipeline-logs-cleared", () => {
      setLogs([])
      setStats({
        total: 0,
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
        processing: 0,
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [isPaused])

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const scrollToBottom = () => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const updateStats = (logsList) => {
    const newStats = {
      total: logsList.length,
      info: logsList.filter((log) => log.level === "info").length,
      success: logsList.filter((log) => log.level === "success").length,
      warning: logsList.filter((log) => log.level === "warning").length,
      error: logsList.filter((log) => log.level === "error").length,
      processing: logsList.filter((log) => log.level === "processing").length,
    }
    setStats(newStats)
  }

  const getLogIcon = (level) => {
    const iconProps = { size: isMobile ? 14 : 16 }
    switch (level) {
      case "success":
        return <CheckCircle {...iconProps} style={{ color: "#059669" }} />
      case "error":
        return <AlertCircle {...iconProps} style={{ color: "#dc2626" }} />
      case "warning":
        return <AlertTriangle {...iconProps} style={{ color: "#d97706" }} />
      case "processing":
        return <Clock {...iconProps} style={{ color: "#2563eb" }} />
      default:
        return <Info {...iconProps} style={{ color: "#6b7280" }} />
    }
  }

  const getLogColor = (level) => {
    switch (level) {
      case "success":
        return "#059669"
      case "error":
        return "#dc2626"
      case "warning":
        return "#d97706"
      case "processing":
        return "#2563eb"
      default:
        return "#6b7280"
    }
  }

  const clearLogs = () => {
    socketRef.current?.emit("clear-logs")
  }

  const downloadLogs = () => {
    const logData = logs.map((log) => ({
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      taskId: log.taskId,
      data: log.data,
    }))

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pipeline-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true
    return log.level === filter
  })

  const formatTimestamp = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

  const statsData = [
    { key: "all", label: "Total", count: stats.total, color: "#64748b", bgColor: "#f8fafc", icon: BarChart3 },
    { key: "info", label: "Info", count: stats.info, color: "#64748b", bgColor: "#f8fafc", icon: Info },
    { key: "success", label: "Success", count: stats.success, color: "#059669", bgColor: "#ecfdf5", icon: CheckCircle },
    {
      key: "processing",
      label: "Processing",
      count: stats.processing,
      color: "#2563eb",
      bgColor: "#eff6ff",
      icon: Clock,
    },
    {
      key: "warning",
      label: "Warning",
      count: stats.warning,
      color: "#d97706",
      bgColor: "#fffbeb",
      icon: AlertTriangle,
    },
    { key: "error", label: "Error", count: stats.error, color: "#dc2626", bgColor: "#fef2f2", icon: AlertCircle },
  ]

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        "@keyframes pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.5 },
          "100%": { opacity: 1 },
        },
      }}
    >
      {isMobile && <MobileHeader isConnected={isConnected} setMobileDrawerOpen={setMobileDrawerOpen} />}
      <ControlsDrawer
        mobileDrawerOpen={mobileDrawerOpen}
        setMobileDrawerOpen={setMobileDrawerOpen}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        logs={logs}
        downloadLogs={downloadLogs}
        clearLogs={clearLogs}
        scrollToTop={scrollToTop}
        scrollToBottom={scrollToBottom}
      />

      <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
        {/* Desktop Header */}
        {!isMobile && (
          <Card
            elevation={0}
            sx={{
              mb: 3,
              background: theme.palette.background.default,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                spacing={3}
                sx={{ mb: 3 }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar
                    sx={{
                      bgcolor: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      width: { xs: 48, md: 56 },
                      height: { xs: 48, md: 56 },
                      boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <Zap size={isMobile ? 24 : 28} />
                  </Avatar>

                  <Box>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 1,
                      }}
                    >
                      Pipeline Console
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge
                        variant="dot"
                        color={isConnected ? "success" : "error"}
                        sx={{
                          "& .MuiBadge-dot": {
                            animation: isConnected ? "pulse 2s infinite" : "none",
                          },
                        }}
                      >
                        <Chip
                          icon={isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                          label={isConnected ? "Connected" : "Disconnected"}
                          color={isConnected ? "success" : "error"}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontWeight: 500,
                            "& .MuiChip-icon": {
                              color: "inherit",
                            },
                          }}
                        />
                      </Badge>
                      <Typography variant="body2" color="text.secondary">
                        Real-time event monitoring
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#3b82f6",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#3b82f6",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Auto-scroll
                      </Typography>
                    }
                  />

                  <Tooltip title={isPaused ? "Resume monitoring" : "Pause monitoring"}>
                    <IconButton
                      onClick={() => setIsPaused(!isPaused)}
                      sx={{
                        bgcolor: isPaused ? "#fef3c7" : "#dbeafe",
                        color: isPaused ? "#d97706" : "#2563eb",
                        "&:hover": {
                          bgcolor: isPaused ? "#fde68a" : "#bfdbfe",
                        },
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {isPaused ? <Play size={20} /> : <Pause size={20} />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download logs">
                    <IconButton
                      onClick={downloadLogs}
                      disabled={logs.length === 0}
                      sx={{
                        bgcolor: "#ecfdf5",
                        color: "#059669",
                        "&:hover": {
                          bgcolor: "#d1fae5",
                        },
                        "&:disabled": {
                          bgcolor: "#f8fafc",
                          color: "#cbd5e1",
                        },
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <Download size={20} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Clear console">
                    <IconButton
                      onClick={clearLogs}
                      disabled={logs.length === 0}
                      sx={{
                        bgcolor: "#fef2f2",
                        color: "#dc2626",
                        "&:hover": {
                          bgcolor: "#fee2e2",
                        },
                        "&:disabled": {
                          bgcolor: "#f8fafc",
                          color: "#cbd5e1",
                        },
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {/* Stats Section */}
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2, cursor: isMobile ? "pointer" : "default" }}
                  onClick={isMobile ? () => setStatsExpanded(!statsExpanded) : undefined}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Activity size={20} color="#6b7280" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
                      Event Statistics
                    </Typography>
                  </Stack>
                  {isMobile && (
                    <IconButton size="small">
                      {statsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </IconButton>
                  )}
                </Stack>

                <Collapse in={!isMobile || statsExpanded}>
                  <Grid container spacing={2}>
                    {statsData.map(({ key, label, count, color, bgColor, icon: IconComponent }) => (
                      <Grid item xs={6} sm={4} md={2} key={key}>
                        <Card
                          elevation={0}
                          onClick={() => setFilter(key)}
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            borderRadius: 2,
                            border: "2px solid",
                            borderColor: filter === key ? color : "transparent",
                            bgcolor: filter === key ? `${color}10` : bgColor,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: color,
                              bgcolor: `${color}15`,
                              transform: "translateY(-2px)",
                              boxShadow: `0 4px 12px ${color}30`,
                            },
                          }}
                        >
                          <Stack spacing={1} alignItems="center">
                            <IconComponent size={24} color={color} />
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color,
                                fontSize: { xs: "1.1rem", md: "1.25rem" },
                              }}
                            >
                              {count}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: "#6b7280",
                                textAlign: "center",
                                fontSize: { xs: "0.7rem", md: "0.75rem" },
                              }}
                            >
                              {label}
                            </Typography>
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Mobile Stats */}
        {isMobile && (
          <Card
            elevation={0}
            sx={{
              mb: 2,
              background:theme.palette.background.default,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 2,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2, cursor: "pointer" }}
                onClick={() => setStatsExpanded(!statsExpanded)}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Filter size={18} color="#6b7280" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#374151" }}>
                    Event Statistics
                  </Typography>
                </Stack>
                <IconButton size="small">
                  {statsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </IconButton>
              </Stack>

              <Collapse in={statsExpanded}>
                <Grid container spacing={1.5}>
                  {statsData.map(({ key, label, count, color, bgColor, icon: IconComponent }) => (
                    <Grid item xs={6} key={key}>
                      <Card
                        elevation={0}
                        onClick={() => setFilter(key)}
                        sx={{
                          p: 1.5,
                          cursor: "pointer",
                          borderRadius: 2,
                          border: "2px solid",
                          borderColor: filter === key ? color : "transparent",
                          bgcolor: filter === key ? `${color}10` : bgColor,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: color,
                            bgcolor: `${color}15`,
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <IconComponent size={20} color={color} />
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color,
                                fontSize: "1rem",
                                lineHeight: 1,
                              }}
                            >
                              {count}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: "#6b7280",
                                fontSize: "0.7rem",
                              }}
                            >
                              {label}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Collapse>
            </CardContent>
          </Card>
        )}

        {/* Console */}
        <Card
          sx={{
            height: { xs: "calc(100vh - 280px)", md: "70vh" },
            display: "flex",
            flexDirection: "column",
            background: theme.palette.background.default,
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Console Header */}
          <Box
            sx={{
              background: theme.palette.background.default,
              p: { xs: 1.5, md: 2 },
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Code size={isMobile ? 18 : 20} color="#3b82f6" />
                <Typography
                  variant={isMobile ? "subtitle2" : "subtitle1"}
                  sx={{
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Live Event Stream
                </Typography>
                {filter !== "all" && (
                  <Chip
                    label={`${filter}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      fontSize: "0.7rem",
                      height: 24,
                    }}
                  />
                )}
              </Stack>

              {!isMobile && (
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Scroll to top">
                    <IconButton
                      onClick={scrollToTop}
                      size="small"
                      sx={{
                        color: "#6b7280",
                        "&:hover": {
                          bgcolor: "#f3f4f6",
                        },
                      }}
                    >
                      <ChevronUp size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Scroll to bottom">
                    <IconButton
                      onClick={scrollToBottom}
                      size="small"
                      sx={{
                        color: "#6b7280",
                        "&:hover": {
                          bgcolor: "#f3f4f6",
                        },
                      }}
                    >
                      <ChevronDown size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}

              {stats.processing > 0 && (
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="caption" color="text.secondary">
                    Processing {stats.processing}
                  </Typography>
                  <LinearProgress
                    sx={{
                      width: { xs: 60, md: 100 },
                      height: 4,
                      borderRadius: 2,
                      bgcolor: "#e2e8f0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#3b82f6",
                        borderRadius: 2,
                      },
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Box>

          <CardContent sx={{ flexGrow: 1, p: 0 }}>
            <Box
              ref={containerRef}
              sx={{
                height: "100%",
                overflow: "auto",
                backgroundColor: theme.palette.background.default,
                p: { xs: 1, md: 2 },
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: theme.palette.background.default,
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: theme.palette.background.default,
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: theme.palette.background.default,
                },
              }}
            >
              {filteredLogs.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#9ca3af",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <Server size={isMobile ? 48 : 64} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{
                      fontWeight: 500,
                      mb: 1,
                      color: "#6b7280",
                    }}
                  >
                    {logs.length === 0 ? "Waiting for events..." : "No events match filter"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#9ca3af",
                      maxWidth: 400,
                      fontSize: { xs: "0.875rem", md: "0.875rem" },
                    }}
                  >
                    {logs.length === 0
                      ? "Your pipeline events will appear here in real-time once they start flowing."
                      : "Try adjusting your filter settings to see more events."}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={isMobile ? 0.5 : 1}>
                  {filteredLogs.map((log, index) => (
                    <Fade key={log.id} in timeout={300}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.5, md: 2 },
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.default,
                          border: "1px solid #f0f0f0",
                          borderLeft: `4px solid ${getLogColor(log.level)}`,
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Stack
                          direction={isMobile ? "column" : "row"}
                          alignItems={isMobile ? "flex-start" : "flex-start"}
                          spacing={isMobile ? 1 : 2}
                        >
                          {!isMobile && (
                            <Box sx={{ display: "flex", alignItems: "center", pt: 0.5 }}>{getLogIcon(log.level)}</Box>
                          )}

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Stack
                              direction={isMobile ? "column" : "row"}
                              alignItems={isMobile ? "flex-start" : "center"}
                              spacing={isMobile ? 0.5 : 2}
                              sx={{ mb: 1 }}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {isMobile && getLogIcon(log.level)}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                    bgcolor: "#f1f5f9",
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: { xs: "0.7rem", md: "0.75rem" },
                                  }}
                                >
                                  {formatTimestamp(log.timestamp)}
                                </Typography>
                              </Stack>

                              <Chip
                                label={log.level.toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: getLogColor(log.level),
                                  color: "#ffffff",
                                  fontWeight: 600,
                                  fontSize: { xs: "0.65rem", md: "0.75rem" },
                                  height: { xs: 20, md: 24 },
                                }}
                              />

                              {log.taskId && (
                                <Chip
                                  label={`Task ${log.taskId.slice(-8)}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: "#d1d5db",
                                    color: "#6b7280",
                                    fontSize: { xs: "0.65rem", md: "0.75rem" },
                                    height: { xs: 20, md: 24 },
                                  }}
                                />
                              )}
                            </Stack>

                            <Typography
                              variant="body2"
                              sx={{
                                color: "#374151",
                                lineHeight: 1.6,
                                wordBreak: "break-word",
                                fontSize: { xs: "0.875rem", md: "0.875rem" },
                              }}
                            >
                              {log.message}
                            </Typography>

                            {log.data && Object.keys(log.data).length > 0 && (
                              <Paper
                                elevation={0}
                                sx={{
                                  mt: 1.5,
                                  p: { xs: 1, md: 1.5 },
                                  backgroundColor: theme.palette.background.default,
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 2,
                                  borderLeft: "3px solid #3b82f6",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                    color: "#4b5563",
                                    whiteSpace: "pre-wrap",
                                    fontSize: { xs: "0.7rem", md: "0.75rem" },
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {JSON.stringify(log.data, null, 2)}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    </Fade>
                  ))}
                  <div ref={logsEndRef} />
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Pause Notification */}
      {isPaused && (
        <Slide direction="up" in={isPaused} mountOnEnter unmountOnExit>
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              bottom: { xs: 16, md: 32 },
              left: "50%",
              transform: "translateX(-50%)",
              p: { xs: 2, md: 3 },
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              color: "#ffffff",
              zIndex: 1000,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(245, 158, 11, 0.4)",
              backdropFilter: "blur(20px)",
              maxWidth: { xs: "calc(100vw - 32px)", md: "auto" },
            }}
          >
            <Stack direction={isMobile ? "column" : "row"} alignItems="center" spacing={isMobile ? 2 : 3}>
              <Pause size={isMobile ? 20 : 24} />
              <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
                <Typography variant={isMobile ? "body1" : "subtitle1"} sx={{ fontWeight: 600, mb: 0.5 }}>
                  Monitoring Paused
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    fontSize: { xs: "0.8rem", md: "0.875rem" },
                  }}
                >
                  New events are being buffered
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setIsPaused(false)}
                startIcon={<Play size={16} />}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#f59e0b",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#f9fafb",
                  },
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  minWidth: { xs: "100%", md: "auto" },
                }}
              >
                Resume
              </Button>
            </Stack>
          </Paper>
        </Slide>
      )}
    </Box>
  )
}

export default RealTimeEventsExecution

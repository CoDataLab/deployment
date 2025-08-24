"use client"

import PropTypes from "prop-types"
import { useState, useEffect } from "react"

import { useTheme } from "@mui/material/styles"
import {
  Box,
  Chip,
  Card,
  Grid,
  Fade,
  Zoom,
  Stack,
  Alert,
  alpha,
  Button,
  Dialog,
  Skeleton,
  Container,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  useMediaQuery,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material"
// MUI Icons
import {
  Event as EventIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Launch as LaunchIcon,
  PersonOff as DeathIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  Remove as NeutralTrendIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  SentimentNeutral as NeutralIcon,
  TrendingDown as TrendingDownIcon,
  SentimentVerySatisfied as PositiveIcon,
  SentimentVeryDissatisfied as NegativeIcon,
} from "@mui/icons-material"

import historicalEventService from "src/services/historicalEventsService"

// Wikipedia popup component
const WikipediaPopup = ({ open, onClose, url, title }) => {
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWikipediaContent = async (wikipediaUrl) => {
    setLoading(true)
    setError(null)
    setImage(null)

    try {
      // Extract the article title from Wikipedia URL
      const urlParts = wikipediaUrl.split("/")
      const articleTitle = urlParts[urlParts.length - 1]

      // Use Wikipedia API to get page content with images
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error("Failed to fetch Wikipedia content")
      }

      const data = await response.json()
      setContent(data.extract || "No content available")

      // Set image if available
      if (data.thumbnail && data.thumbnail.source) {
        setImage({
          url: data.thumbnail.source,
          width: data.thumbnail.width,
          height: data.thumbnail.height,
        })
      }
    } catch (err) {
      setError("Failed to load Wikipedia content")
      console.error("Error fetching Wikipedia content:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && url) {
      fetchWikipediaContent(url)
    }
  }, [open, url])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 200 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (content || image) && (
          <Box>
            {/* Image Section */}
            {image && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none"
                  }}
                />
              </Box>
            )}

            {/* Content Section */}
            {content && (
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {content}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={() => window.open(url, "_blank")} startIcon={<LaunchIcon />}>
          View Full Article
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

WikipediaPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string,
  title: PropTypes.string,
}

const EventCard = ({ event, eventType, index }) => {
  const theme = useTheme()
  const [popupOpen, setPopupOpen] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState(null)

  const handleInfoClick = (info) => {
    setSelectedInfo(info)
    setPopupOpen(true)
  }

  const handlePopupClose = () => {
    setPopupOpen(false)
    setSelectedInfo(null)
  }

  const getEventConfig = (type) => {
    switch (type) {
      case "event":
        return {
          icon: <EventIcon />,
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, 0.1),
          title: "Historical Event",
        }
      case "birth":
        return {
          icon: <PersonIcon />,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1),
          title: "Birth",
        }
      case "death":
        return {
          icon: <DeathIcon />,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          title: "Death",
        }
      default:
        return {
          icon: <EventIcon />,
          color: theme.palette.grey[500],
          bgColor: alpha(theme.palette.grey[500], 0.1),
          title: "Event",
        }
    }
  }

  const getSentimentConfig = (label) => {
    switch (label) {
      case "positive":
        return {
          icon: <PositiveIcon />,
          color: theme.palette.success.main,
          trendIcon: <TrendingUpIcon />,
        }
      case "negative":
        return {
          icon: <NegativeIcon />,
          color: theme.palette.error.main,
          trendIcon: <TrendingDownIcon />,
        }
      default:
        return {
          icon: <NeutralIcon />,
          color: theme.palette.warning.main,
          trendIcon: <NeutralTrendIcon />,
        }
    }
  }

  const config = getEventConfig(eventType)
  const sentimentConfig = getSentimentConfig(event.label)

  return (
    <>
      <Zoom in style={{ transitionDelay: `${index * 200}ms` }}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "visible",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: theme.shadows[12],
              "& .event-icon": {
                transform: "scale(1.1) rotate(5deg)",
              },
            },
          }}
        >
          {/* Header with Icon and Type */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.7)} 100%)`,
              p: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              }}
            />
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                className="event-icon"
                sx={{
                  p: 1,
                  borderRadius: "50%",
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                  color: "white",
                  transition: "transform 0.3s ease",
                  zIndex: 1,
                }}
              >
                {config.icon}
              </Box>
              <Box sx={{ flex: 1, zIndex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "white", opacity: 0.9 }}>
                  {config.title}
                </Typography>
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                  {event.date}
                </Typography>
              </Box>
              {/* Only show sentiment chip for main events, not births/deaths */}
              {eventType === "event" && (
                <Chip
                  icon={sentimentConfig.trendIcon}
                  label={event.label}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    color: "white",
                    fontWeight: "bold",
                    "& .MuiChip-icon": {
                      color: "white",
                    },
                  }}
                />
              )}
            </Stack>
          </Box>

          <CardContent sx={{ flex: 1, p: 3 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                lineHeight: 1.6,
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {event.title}
            </Typography>

            {/* Sentiment Score - Only for main events */}
            {eventType === "event" && (
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ color: sentimentConfig.color }}>{sentimentConfig.icon}</Box>


                </Stack>
              </Box>
            )}

            {/* Info Links */}
            {event.info && event.info.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  Related Information:
                </Typography>
                <Stack spacing={1}>
                  {event.info.map((info, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      endIcon={<LaunchIcon />}
                      onClick={() => handleInfoClick(info)}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderColor: alpha(config.color, 0.3),
                        color: config.color,
                        "&:hover": {
                          borderColor: config.color,
                          backgroundColor: alpha(config.color, 0.05),
                        },
                      }}
                    >
                      {info.name}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      </Zoom>

      {/* Wikipedia Popup */}
      <WikipediaPopup open={popupOpen} onClose={handlePopupClose} url={selectedInfo?.url} title={selectedInfo?.name} />
    </>
  )
}

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  eventType: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
}

const LoadingSkeleton = ({ index }) => {
  const theme = useTheme()

  return (
    <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
      <Card sx={{ height: 400 }}>
        {/* Header Skeleton */}
        <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.grey[300], 0.3) }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={24} />
            </Box>
            <Skeleton variant="rounded" width={60} height={24} />
          </Stack>
        </Box>

        {/* Content Skeleton */}
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width="30%" height={20} />
            <Skeleton variant="rounded" width={50} height={20} />
          </Stack>

          <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="100%" height={36} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="80%" height={36} />
        </CardContent>
      </Card>
    </Zoom>
  )
}

LoadingSkeleton.propTypes = {
  index: PropTypes.number.isRequired,
}

export default function HistoricalEventsView() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate] = useState(() => {
    const today = new Date()
    return `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  })

  const fetchData = async (date) => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await historicalEventService.getTopEventsByDate(date)
      setData(response)
    } catch (err) {
      setError("Failed to fetch historical events. Please try again.")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate])

  const handleRefresh = () => {
    fetchData(selectedDate)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <HistoryIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              This Day in History
            </Typography>
          </Box>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover significant events that happened on {selectedDate}
          </Typography>

          {/* Date and Refresh Controls */}
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Chip
              icon={<CalendarIcon />}
              label={`Date: ${selectedDate}`}
              variant="outlined"
              sx={{
                fontSize: "1rem",
                height: 40,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
              }}
            />
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  transform: "rotate(180deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <RefreshIcon sx={{ color: theme.palette.primary.main }} />
            </IconButton>
          </Stack>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{
              mb: 4,
              borderRadius: 2,
              "& .MuiAlert-message": {
                display: "flex",
                alignItems: "center",
              },
            }}
            action={
              <Button color="inherit" size="small" onClick={() => setError(null)}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading State */}
      {loading && (
        <Grid container spacing={4}>
          {[0, 1, 2].map((index) => (
            <Grid item xs={12} md={4} key={index}>
              <LoadingSkeleton index={index} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Events Grid */}
      {!loading && data && data.success && (
        <Grid container spacing={4}>
          {Object.entries(data.data).map(([eventType, event], index) => (
            <Grid item xs={12} md={4} key={eventType}>
              <EventCard event={event} eventType={eventType} index={index} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Data State */}
      {!loading && (!data || !data.success) && !error && (
        <Fade in>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 4,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.grey[100], 0.5),
            }}
          >
            <HistoryIcon sx={{ fontSize: 80, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No historical events were found for {selectedDate}
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Timeline Decoration */}
      <Box
        sx={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: -1,
          opacity: 0.1,
        }}
      >
        <TimelineIcon sx={{ fontSize: 200, color: theme.palette.primary.main }} />
      </Box>
    </Container>
  )
}

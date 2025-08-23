
import PropTypes from "prop-types"
import { useState, useEffect, useCallback } from "react"

import {
  Add as AddIcon,
  Edit as EditIcon,
  Label as LabelIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import {
  Box,
  Tab,
  Card,
  Grid,
  Chip,
  Tabs,
  Fade,
  Zoom,
  Paper,
  Stack,
  Alert,
  Button,
  Dialog,
  Select,
  Divider,
  Tooltip,
  Skeleton,
  MenuItem,
  Container,
  TextField,
  Typography,
  CardHeader,
  IconButton,
  InputLabel,
  CardContent,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
} from "@mui/material"

import topicService from "src/services/topicService"

// Shimmer Loading Component
const ShimmerCard = () => (
  <Card sx={{ mb: 2, overflow: "hidden", position: "relative" }}>
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        animation: "shimmer 1.5s infinite",
        "@keyframes shimmer": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
      }}
    />
    <CardContent>
      <Skeleton variant="text" width="60%" height={32} />
      <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={100} height={24} />
        <Skeleton variant="rounded" width={90} height={24} />
      </Box>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    </CardContent>
  </Card>
)

// Keyword Selection Dialog
const KeywordSelectionDialog = ({ open, onClose, onSelect, selectedKeywords }) => {
  const [keywords, setKeywords] = useState([])
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(7)
  const [limit, setLimit] = useState(50)
  const [searchTerm, setSearchTerm] = useState("")
  const [tempSelected, setTempSelected] = useState([...selectedKeywords])

  const fetchKeywords = useCallback(async () => {
    setLoading(true)
    try {
      const response = await topicService.getAllKeywords(days, limit)
      if (response.success) {
        setKeywords(response.data.keywords || [])
      }
    } catch (error) {
      console.error("Error fetching keywords:", error)
    } finally {
      setLoading(false)
    }
  }, [days, limit])

  useEffect(() => {
    if (open) {
      fetchKeywords()
      setTempSelected([...selectedKeywords])
    }
  }, [open, fetchKeywords, selectedKeywords])

  const filteredKeywords = keywords.filter((kw) => kw.keyword.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleKeywordToggle = (keyword) => {
    setTempSelected((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
  }

  const handleConfirm = () => {
    onSelect(tempSelected)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LabelIcon color="primary" />
          <Typography variant="h6">Select Keywords</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Filters */}
          <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Days</InputLabel>
                  <Select value={days} label="Days" onChange={(e) => setDays(e.target.value)}>
                    <MenuItem value={1}>1 Day</MenuItem>
                    <MenuItem value={3}>3 Days</MenuItem>
                    <MenuItem value={7}>7 Days</MenuItem>
                    <MenuItem value={14}>14 Days</MenuItem>
                    <MenuItem value={30}>30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Limit</InputLabel>
                  <Select value={limit} label="Limit" onChange={(e) => setLimit(e.target.value)}>
                    <MenuItem value={10}>10</MenuItem>                  
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  onClick={fetchKeywords}
                  startIcon={<FilterListIcon />}
                  fullWidth
                  disabled={loading}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
            size="small"
          />

          {/* Selected Keywords Summary */}
          {tempSelected.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                Selected Keywords ({tempSelected.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {tempSelected.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    size="small"
                    color="primary"
                    onDelete={() => handleKeywordToggle(keyword)}
                    deleteIcon={<CloseIcon />}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Loading */}
          {loading && <LinearProgress />}

          {/* Keywords Grid */}
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {loading ? (
              <Grid container spacing={1}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <Grid item key={index}>
                    <Skeleton variant="rounded" width={120} height={32} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={1}>
                {filteredKeywords.map((kw) => (
                  <Grid item key={kw.keyword}>
                    <Tooltip title={`Count: ${kw.count.toLocaleString()}`}>
                      <Chip
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <span>{kw.keyword}</span>
                           
                          </Box>
                        }
                        onClick={() => handleKeywordToggle(kw.keyword)}
                        color={tempSelected.includes(kw.keyword) ? "primary" : "default"}
                        variant={tempSelected.includes(kw.keyword) ? "filled" : "outlined"}
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: 2,
                          },
                        }}
                      />
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={tempSelected.length === 0}>
          Confirm Selection ({tempSelected.length})
        </Button>
      </DialogActions>
    </Dialog>
  )
}

KeywordSelectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedKeywords: PropTypes.arrayOf(PropTypes.string).isRequired,
}

// Topic Form Component
const TopicForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    keywords: [],
    startDate: "",
    endDate: "",
  })
  const [keywordDialogOpen, setKeywordDialogOpen] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (formData.keywords.length === 0) newErrors.keywords = "At least one keyword is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        title: formData.title,
        keywords: formData.keywords,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })
      setFormData({ title: "", keywords: [], startDate: "", endDate: "" })
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon color="primary" />
            <Typography variant="h6">Create New Topic</Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Topic Title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="e.g., Israel - Iran"
            />

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle2" color={errors.keywords ? "error" : "text.primary"}>
                  Keywords ({formData.keywords.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setKeywordDialogOpen(true)}
                  startIcon={<SearchIcon />}
                >
                  Select Keywords
                </Button>
              </Box>

              {formData.keywords.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.keywords.map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      onDelete={() =>
                        setFormData((prev) => ({
                          ...prev,
                          keywords: prev.keywords.filter((k) => k !== keyword),
                        }))
                      }
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Paper sx={{ p: 2, bgcolor: "grey.50", textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No keywords selected. Click &apos;Select Keywords&apos; to add some.
                  </Typography>
                </Paper>
              )}

              {errors.keywords && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  {errors.keywords}
                </Typography>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0], // Prevent past dates
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  error={!!errors.endDate}
                  helperText={errors.endDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: formData.startDate || new Date().toISOString().split("T")[0], // Minimum is start date
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              {loading ? "Creating..." : "Create Topic"}
            </Button>
          </Stack>
        </form>
      </CardContent>

      <KeywordSelectionDialog
        open={keywordDialogOpen}
        onClose={() => setKeywordDialogOpen(false)}
        onSelect={(keywords) => setFormData((prev) => ({ ...prev, keywords }))}
        selectedKeywords={formData.keywords}
      />
    </Card>
  )
}

TopicForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

// Topic Card Component
const TopicCard = ({ topic, index }) => (
  <Zoom in timeout={300 + index * 100}>
    <Card
      sx={{
        mb: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {topic.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" color="primary">
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <LabelIcon fontSize="small" />
            Keywords ({topic.keywords.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {topic.keywords.map((keyword) => (
              <Chip key={keyword} label={keyword} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body2">{new Date(topic.startDate).toLocaleDateString()}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  End Date
                </Typography>
                <Typography variant="body2">{new Date(topic.endDate).toLocaleDateString()}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(topic.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Zoom>
)

TopicCard.propTypes = {
  topic: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
}

// Main Component
export default function TopicsView() {
  const [activeTab, setActiveTab] = useState(0)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTopics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await topicService.getAllTopics()
      if (response.success) {
        setTopics(response.data || [])
      }
    } catch (err) {
      setError("Failed to fetch topics. Please try again.")
      console.error("Error fetching topics:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const handleCreateTopic = async (topicData) => {
    setCreateLoading(true)
    try {
      const response = await topicService.createTopic(topicData)
      if (response.success) {
        await fetchTopics() // Refresh the list
        setActiveTab(1) // Switch to topics list
      }
    } catch (err) {
      setError("Failed to create topic. Please try again.")
      console.error("Error creating topic:", err)
    } finally {
      setCreateLoading(false)
    }
  }

  // Helper function to render empty state
  const renderEmptyState = () => (
    <Paper sx={{ p: 6, textAlign: "center", bgcolor: "grey.50" }}>
      <TrendingUpIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No Topics Yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create your first topic to get started with topic management.
      </Typography>
      <Button variant="contained" onClick={() => setActiveTab(0)} startIcon={<AddIcon />}>
        Create First Topic
      </Button>
    </Paper>
  )

  // Helper function to render loading state
  const renderLoadingState = () => (
    <Box>
      {Array.from({ length: 3 }).map((_, index) => (
        <ShimmerCard key={index} />
      ))}
    </Box>
  )

  // Helper function to render topics list
  const renderTopicsList = () => (
    <Box>
      {topics.map((topic, index) => (
        <TopicCard key={topic._id} topic={topic} index={index} />
      ))}
    </Box>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Topic Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create and manage your topics with intelligent keyword selection
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AddIcon />
                Create Topic
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon />
                All Topics ({topics.length})
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Fade in>
            <Box>
              <TopicForm onSubmit={handleCreateTopic} loading={createLoading} />
            </Box>
          </Fade>
        )}

        {activeTab === 1 && (
          <Fade in>
            <Box>
              {loading && renderLoadingState()}
              {!loading && topics.length === 0 && renderEmptyState()}
              {!loading && topics.length > 0 && renderTopicsList()}
            </Box>
          </Fade>
        )}
      </Box>
    </Container>
  )
}

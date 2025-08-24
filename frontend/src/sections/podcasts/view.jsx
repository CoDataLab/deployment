import PropTypes from "prop-types"
import { useState, useEffect, useCallback } from "react"

// MUI components
import { alpha, useTheme } from "@mui/material/styles"
// MUI icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  VolumeUp as VolumeUpIcon,
  PlayArrow as PlayArrowIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material"
import {
  Box,
  Grid,
  Card,
  Menu,
  Paper,
  Alert,
  Button,
  Dialog,
  Skeleton,
  Snackbar,
  MenuItem,
  Container,
  CardMedia,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  CardActions,
  ListItemIcon,
  ListItemText,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
} from "@mui/material"

import podcastService from "src/services/podcastService"

const PodcastCard = ({ podcast, deleteLoading, handleMenuClick, formatDate, theme }) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows[8],
      },
    }}
  >
    <CardMedia
      component="img"
      height="200"
      image={podcast.coverArtUrl || "/placeholder.svg?height=200&width=300"}
      alt={podcast.title}
      sx={{
        objectFit: "cover",
      }}
    />
    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
      <Typography variant="h6" component="h2" gutterBottom noWrap>
        {podcast.title}
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary" noWrap>
          {podcast.author}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {podcast.description}
      </Typography>
      <Box display="flex" alignItems="center" mt={2}>
        <CalendarIcon sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          {formatDate(podcast.createdAt)}
        </Typography>
      </Box>
    </CardContent>
    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
      <Button
        size="small"
        startIcon={<PlayArrowIcon />}
        onClick={() => window.open(podcast.audioUrl, "_blank")}
        sx={{ textTransform: "none" }}
      >
        Play
      </Button>
      <IconButton size="small" onClick={(e) => handleMenuClick(e, podcast)} disabled={deleteLoading === podcast._id}>
        {deleteLoading === podcast._id ? <CircularProgress size={20} /> : <MoreVertIcon />}
      </IconButton>
    </CardActions>
  </Card>
)

PodcastCard.propTypes = {
  podcast: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    audioUrl: PropTypes.string.isRequired,
    coverArtUrl: PropTypes.string,
    description: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  deleteLoading: PropTypes.string,
  handleMenuClick: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
}

const LoadingSkeleton = () => (
  <Card sx={{ height: "100%" }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} />
      <Skeleton variant="text" height={20} width="60%" />
      <Skeleton variant="text" height={60} />
      <Skeleton variant="text" height={16} width="40%" />
    </CardContent>
  </Card>
)

const PodcastsView = () => {
  const theme = useTheme()

  // State management
  const [podcasts, setPodcasts] = useState([])
  const [filteredPodcasts, setFilteredPodcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPodcast, setEditingPodcast] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    audioUrl: "",
    coverArtUrl: "",
    description: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedPodcast, setSelectedPodcast] = useState(null)

  const fetchPodcasts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await podcastService.fetchAllPodcasts()
      setPodcasts(data)
      setFilteredPodcasts(data)
    } catch (err) {
      setError(err.message)
      showSnackbar("Failed to fetch podcasts", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch podcasts on component mount
  useEffect(() => {
    fetchPodcasts()
  }, [fetchPodcasts])

  // Filter podcasts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPodcasts(podcasts)
    } else {
      const filtered = podcasts.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcast.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          podcast.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredPodcasts(filtered)
    }
  }, [searchQuery, podcasts])

  const handleAddPodcast = () => {
    setEditingPodcast(null)
    setFormData({
      title: "",
      author: "",
      audioUrl: "",
      coverArtUrl: "",
      description: "",
    })
    setOpenDialog(true)
  }

  const handleEditPodcast = (podcast) => {
    setEditingPodcast(podcast)
    setFormData({
      title: podcast.title,
      author: podcast.author,
      audioUrl: podcast.audioUrl,
      coverArtUrl: podcast.coverArtUrl,
      description: podcast.description,
    })
    setOpenDialog(true)
    setAnchorEl(null)
  }

  const handleDeletePodcast = async (podcastId) => {
    try {
      setDeleteLoading(podcastId)
      await podcastService.deletePodcast(podcastId)
      setPodcasts(podcasts.filter((p) => p._id !== podcastId))
      showSnackbar("Podcast deleted successfully", "success")
    } catch (err) {
      showSnackbar(err.message, "error")
    } finally {
      setDeleteLoading(null)
      setAnchorEl(null)
    }
  }

  const handleSubmitForm = async () => {
    try {
      setFormLoading(true)

      if (editingPodcast) {
        const updatedPodcast = await podcastService.updatePodcast(editingPodcast._id, formData)
        setPodcasts(podcasts.map((p) => (p._id === editingPodcast._id ? updatedPodcast : p)))
        showSnackbar("Podcast updated successfully", "success")
      } else {
        const newPodcast = await podcastService.addPodcast(formData)
        setPodcasts([newPodcast, ...podcasts])
        showSnackbar("Podcast added successfully", "success")
      }

      setOpenDialog(false)
    } catch (err) {
      showSnackbar(err.message, "error")
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleMenuClick = (event, podcast) => {
    setAnchorEl(event.currentTarget)
    setSelectedPodcast(podcast)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPodcast(null)
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Podcast Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPodcast}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
          }}
        >
          Add Podcast
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <TextField
          fullWidth
          placeholder="Search podcasts by title, author, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
            },
          }}
        />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button color="inherit" size="small" onClick={fetchPodcasts}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Podcasts Grid */}
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <LoadingSkeleton />
              </Grid>
            ))
          : filteredPodcasts.map((podcast) => (
              <Grid item xs={12} sm={6} md={4} key={podcast._id}>
                <PodcastCard
                  podcast={podcast}
                  deleteLoading={deleteLoading}
                  handleMenuClick={handleMenuClick}
                  formatDate={formatDate}
                  theme={theme}
                />
              </Grid>
            ))}
      </Grid>

      {/* Empty State */}
      {!loading && filteredPodcasts.length === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
          <VolumeUpIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? "No podcasts found" : "No podcasts available"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchQuery ? "Try adjusting your search terms" : "Get started by adding your first podcast"}
          </Typography>
          {!searchQuery && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPodcast}>
              Add Your First Podcast
            </Button>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{editingPodcast ? "Edit Podcast" : "Add New Podcast"}</Typography>
            <IconButton onClick={() => setOpenDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author"
                value={formData.author}
                onChange={(e) => handleFormChange("author", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cover Art URL"
                value={formData.coverArtUrl}
                onChange={(e) => handleFormChange("coverArtUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audio URL"
                value={formData.audioUrl}
                onChange={(e) => handleFormChange("audioUrl", e.target.value)}
                required
                placeholder="https://example.com/audio.mp3"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                multiline
                rows={4}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitForm}
            disabled={formLoading || !formData.title || !formData.author || !formData.audioUrl || !formData.description}
            startIcon={formLoading ? <CircularProgress size={16} /> : null}
          >
            {(() => {
              if (formLoading) return "Saving..."
              if (editingPodcast) return "Update"
              return "Add"
            })()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 160 },
        }}
      >
        <MenuItem onClick={() => handleEditPodcast(selectedPodcast)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeletePodcast(selectedPodcast?._id)} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default PodcastsView

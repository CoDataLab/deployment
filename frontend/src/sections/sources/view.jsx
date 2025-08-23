"use client"

import { useState, useEffect } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Link as LinkIcon,
  GetApp as FetchIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Public as PublicIcon,
  Source as SourceIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material"
import {
  Box,
  Grid,
  Card,
  Chip,
  Table,
  Alert,
  Avatar,
  Dialog,
  Button,
  Select,
  Tooltip,
  Divider,
  TableRow,
  MenuItem,
  Skeleton,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  CardContent,
  DialogContent,
  DialogActions,
  TableContainer,
  InputAdornment,
  FormHelperText,
  TablePagination,
  CircularProgress,
} from "@mui/material"

// Services
import sourcesService from "src/services/sourcesService"

const SourcesView = () => {
  const theme = useTheme()

  // State variables
  const [sources, setSources] = useState([])
  const [filteredSources, setFilteredSources] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [currentSource, setCurrentSource] = useState({
    source: "",
    url: "",
    mediaBias: "center",
    relatedCountry: "",
    type: "Website",
    category: "Politics",
    language: "",
    logoUrl: "", // Added logo URL field
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState(null)
  const [fetchingLogo, setFetchingLogo] = useState(false) // Added logo fetching state

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // Options for select fields
  const mediaBiasOptions = ['center','Unknown','lean left', 'left',  'lean right', 'right']
  const typeOptions =[
            'Website','Youtube','Telegram','Blog','Podcast','Television','Radio'
          ]
  const categoryOptions = [
    "Animals",
    "Business",
    "CryptoCurrencies",
    "Culture",
    "Education",
    "Entertainment",
    "Environment",
    "Health",
    "Lifestyle",
    "Politics",
    "Science",
    "Sports",
    "Technology",
    "World",
    "Gaming",
  ]

  // Fetch sources
  const loadSources = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await sourcesService.fetchAllSources()
      setSources(data)
      setFilteredSources(data)
    } catch (error1) {
      console.error("Error fetching sources:", error1)
      setError("Failed to load sources. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSources()
  }, [])

  // Search and filter functionality
  useEffect(() => {
    const results = sources.filter(
      (source) =>
        source.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.mediaBias.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.relatedCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (source.language && source.language.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredSources(results)
    setPage(0) // Reset to first page when search changes
  }, [searchTerm, sources])

  // Validation functions
  const validateUrl = (url) => {
    const urlRegex = /^https?:\/\/.+/
    return urlRegex.test(url)
  }

  // Logo fetching function
  const handleFetchLogo = async () => {
    if (!currentSource.url || !validateUrl(currentSource.url)) {
      alert("Please enter a valid URL first")
      return
    }

    setFetchingLogo(true)
    try {
      const response = await sourcesService.fetchLogo(currentSource.url)
      setCurrentSource({ ...currentSource, logoUrl: response.logoUrl })
    } catch (errorr) {
      console.error("Error fetching logo:", errorr)
      alert("Failed to fetch logo. Please try again.")
    } finally {
      setFetchingLogo(false)
    }
  }

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Dialog handling
  const handleOpenDialog = (source = null) => {
    if (source) {
      setCurrentSource(source)
      setIsEditing(true)
    } else {
      setCurrentSource({
        source: "",
        url: "",
        mediaBias: "center",
        relatedCountry: "",
        type: "Website",
        category: "Politics",
        language: "",
        logoUrl: "", // Reset logo URL
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentSource({
      source: "",
      url: "",
      mediaBias: "center",
      relatedCountry: "",
      type: "Website",
      category: "Politics",
      language: "",
      logoUrl: "", // Reset logo URL
    })
  }

  // CRUD operations
  const handleAddSource = async () => {
    if (!validateUrl(currentSource.url)) {
      alert("Please enter a valid URL starting with http or https")
      return
    }
    try {
      await sourcesService.addSource(currentSource)
      loadSources()
      handleCloseDialog()
    } catch (errorr) {
      console.errorr("Errorr adding source:", errorr)
      if (errorr.response && errorr.response.data && errorr.response.data.errors) {
        alert(`Error adding source: ${errorr.response.data.message}. ${errorr.response.data.errors.join(", ")}`)
      }
    }
  }

  const handleUpdateSource = async () => {
    if (!validateUrl(currentSource.url)) {
      alert("Please enter a valid URL starting with http or https")
      return
    }
    try {
      await sourcesService.updateSource(currentSource._id, currentSource)
      loadSources()
      handleCloseDialog()
    } catch (error1) {
      console.error("Error updating source:", error1)
      if (error1.response && error1.response.data && error1.response.data.errors) {
        alert(`Error updating source: ${error1.response.data.message}. ${error1.response.data.errors.join(", ")}`)
      }
    }
  }

  const handleDeleteConfirm = (id) => {
    setSourceToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSource = async () => {
    try {
      await sourcesService.deleteSource(sourceToDelete)
      loadSources()
      setDeleteConfirmOpen(false)
    } catch (errorr) {
      console.error("Error deleting source:", errorr)
    }
  }

  // Get bias color
  const getBiasColor = (bias) => {
    switch (bias.toLowerCase()) {
      case "left":
        return theme.palette.error.main
      case "lean left":
        return theme.palette.error.light
      case "center":
        return theme.palette.grey[500]
      case "lean right":
        return theme.palette.primary.light
      case "right":
        return theme.palette.primary.main
      default:
        return theme.palette.grey[500]
    }
  }

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "blog":
        return <SourceIcon fontSize="small" />
      case "podcast":
        return <SourceIcon fontSize="small" />
      case "telegram":
        return <SourceIcon fontSize="small" />
      case "website":
        return <LanguageIcon fontSize="small" />
      case "youtube":
        return <SourceIcon fontSize="small" />
      default:
        return <SourceIcon fontSize="small" />
    }
  }

  // Render loading skeletons
  const renderSkeletons = () => (
    <TableBody>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="text" width={150} />
          </TableCell>
          <TableCell>
            <Skeleton variant="circular" width={20} height={20} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={40} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell align="right">
            <Skeleton variant="text" width={80} />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Source Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your news sources, their bias ratings, and categories
        </Typography>
      </Box>

      {/* Controls Section */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                placeholder="Search sources..."
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mr: 1 }}>
                Add New Source
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadSources}>
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sources Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="center" px={3} py={2}>
            <FilterListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Sources
            </Typography>
            <Chip
              label={`${filteredSources.length} sources`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          </Box>

          <Divider />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell>
                    <Typography variant="subtitle2">Source</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Logo</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">URL</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Media Bias</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Country</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Type</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Category</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Language</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              {loading ? (
                renderSkeletons()
              ) : (
                <TableBody>
                  {filteredSources.length > 0 ? (
                    (rowsPerPage > 0
                      ? filteredSources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : filteredSources
                    ).map((source) => (
                      <TableRow key={source._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {source.source}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Avatar src={source.logoUrl} alt="Source Logo" sx={{ width: 20, height: 20 }} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={source.url} arrow>
                            <IconButton onClick={() => window.open(source.url, "_blank")} size="small" color="primary">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={source.mediaBias}
                            size="small"
                            sx={{
                              bgcolor: `${getBiasColor(source.mediaBias)}20`,
                              color: getBiasColor(source.mediaBias),
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <PublicIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.7 }} />
                            <Typography variant="body2">{source.relatedCountry || "N/A"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getTypeIcon(source.type)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {source.type}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={source.category} size="small" variant="outlined" sx={{ fontWeight: "medium" }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{source.language || "N/A"}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenDialog(source)} color="primary" size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteConfirm(source._id)}
                              color="error"
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No sources found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredSources.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Source Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="medium">
            {isEditing ? "Edit Source" : "Add New Source"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source Name"
                variant="outlined"
                value={currentSource.source}
                onChange={(e) => setCurrentSource({ ...currentSource, source: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SourceIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL"
                variant="outlined"
                value={currentSource.url}
                onChange={(e) => setCurrentSource({ ...currentSource, url: e.target.value })}
                error={Boolean(currentSource.url && !validateUrl(currentSource.url))}
                helperText={
                  currentSource.url && !validateUrl(currentSource.url) ? "URL must start with http or https" : ""
                }
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Logo Section */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Logo
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    {currentSource.logoUrl && (
                      <Avatar src={currentSource.logoUrl} alt="Source Logo" sx={{ width: 32, height: 32 }} />
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleFetchLogo}
                      disabled={!currentSource.url || !validateUrl(currentSource.url) || fetchingLogo}
                      startIcon={fetchingLogo ? <CircularProgress size={16} /> : <FetchIcon />}
                      sx={{
                        borderRadius: "50%",
                        minWidth: 40,
                        width: 40,
                        height: 40,
                        p: 0,
                        "& .MuiButton-startIcon": {
                          margin: 0,
                        },
                      }}
                    >
                      {!fetchingLogo && <span style={{ display: "none" }}>Fetch</span>}
                    </Button>
                  </Box>
                  <FormHelperText>
                    {!currentSource.url || !validateUrl(currentSource.url)
                      ? "Enter a valid URL to fetch logo"
                      : "Click the button to fetch logo from URL"}
                  </FormHelperText>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="media-bias-label">Media Bias</InputLabel>
                <Select
                  labelId="media-bias-label"
                  id="media-bias"
                  label="Media Bias"
                  value={currentSource.mediaBias}
                  onChange={(e) => setCurrentSource({ ...currentSource, mediaBias: e.target.value })}
                >
                  {mediaBiasOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Political leaning of the source</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Related Country"
                variant="outlined"
                value={currentSource.relatedCountry}
                onChange={(e) => setCurrentSource({ ...currentSource, relatedCountry: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="source-type-label">Source Type</InputLabel>
                <Select
                  labelId="source-type-label"
                  id="source-type"
                  label="Source Type"
                  value={currentSource.type}
                  onChange={(e) => setCurrentSource({ ...currentSource, type: e.target.value })}
                >
                  {typeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="source-category-label">Category</InputLabel>
                <Select
                  labelId="source-category-label"
                  id="source-category"
                  label="Category"
                  value={currentSource.category}
                  onChange={(e) => setCurrentSource({ ...currentSource, category: e.target.value })}
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Language"
                variant="outlined"
                value={currentSource.language || ""}
                onChange={(e) => setCurrentSource({ ...currentSource, language: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={isEditing ? handleUpdateSource : handleAddSource}
            variant="contained"
            disabled={!currentSource.source || !currentSource.url || !validateUrl(currentSource.url)}
            startIcon={isEditing ? <EditIcon /> : <AddIcon />}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this source? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteSource} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SourcesView

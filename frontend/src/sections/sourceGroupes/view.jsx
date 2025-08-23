"use client"

import { useState, useEffect } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
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
  Button,
  Select,
  Dialog,
  Tooltip,
  Divider,
  TableRow,
  MenuItem,
  Checkbox,
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
  CardContent,
  FormControl,
  ListItemText,
  DialogContent,
  DialogActions,
  OutlinedInput,
  TableContainer,
  FormHelperText,
  InputAdornment,
  TablePagination,
} from "@mui/material"

// Services and components
import sourcesService from "src/services/sourcesService"

import { useSettingsContext } from "src/components/settings"

const SourceGroupsView = () => {
  const theme = useTheme()
  const settings = useSettingsContext()

  // State variables
  const [sourceGroups, setSourceGroups] = useState([])
  const [sources, setSources] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [currentGroup, setCurrentGroup] = useState({ name: "", sourceIds: [] })
  const [isEditing, setIsEditing] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch source groups
  const loadSourceGroups = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await sourcesService.fetchAllSourceGroups()
      if (Array.isArray(data.groups)) {
        setSourceGroups(data.groups)
      } else {
        console.error("Fetched data.groups is not an array:", data.groups)
        setError("Invalid data format received. Please try again.")
      }
    } catch (errorEx) {
      console.error("Error fetching source groups:", errorEx)
      setError("Failed to load source groups. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch sources
  const loadSources = async () => {
    try {
      const data = await sourcesService.fetchAllSources()
      setSources(data)
    } catch (errorEx) {
      console.error("Error fetching sources:", errorEx)
      setError("Failed to load sources. Please try again.")
    }
  }

  // Initial data fetch
  useEffect(() => {
    loadSourceGroups()
    loadSources()
  }, [])

  // Filter source groups based on search query
  const filteredSourceGroups = sourceGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle open dialog
  const handleOpenDialog = (group = null) => {
    if (group) {
      const sourceIds = Array.isArray(group.sourceIds)
        ? group.sourceIds.map((source) => (typeof source === "object" ? source._id : source))
        : []
      setCurrentGroup({ ...group, sourceIds })
      setIsEditing(true)
    } else {
      setCurrentGroup({ name: "", sourceIds: [] })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentGroup({ name: "", sourceIds: [] })
  }

  // Handle add or update group
  const handleAddOrUpdateGroup = async () => {
    try {
      if (isEditing) {
        await sourcesService.updateSourceGroup(currentGroup._id, currentGroup)
      } else {
        await sourcesService.addSourceGroup(currentGroup)
      }
      loadSourceGroups()
      handleCloseDialog()
    } catch (errorEx) {
      console.error("Error saving source group:", errorEx)
      setError("Failed to save source group. Please try again.")
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = (id) => {
    setGroupToDelete(id)
    setDeleteConfirmOpen(true)
  }

  // Handle delete group
  const handleDeleteGroup = async () => {
    try {
      await sourcesService.deleteSourceGroup(groupToDelete)
      loadSourceGroups()
      setDeleteConfirmOpen(false)
    } catch (errorEx) {
      console.error("Error deleting source group:", errorEx)
      setError("Failed to delete source group. Please try again.")
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

  // Get source names
  const getSourceNames = (sourceIds) => {
    if (!Array.isArray(sourceIds)) return []
    return sourceIds.map((source) => (typeof source === "object" ? source.source : "Unknown"))
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
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell align="right">
            <Box display="flex" justifyContent="flex-end">
              <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Source Group Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage groups of news sources for easier data collection
        </Typography>
      </Box>

      {/* Controls Section */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                placeholder="Search source groups..."
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                Add New Group
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadSourceGroups}>
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

      {/* Source Groups Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="center" px={3} py={2}>
            <FilterListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Source Groups
            </Typography>
            <Chip
              label={`${filteredSourceGroups.length} groups`}
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
                    <Typography variant="subtitle2">Group Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Sources</Typography>
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
                  {filteredSourceGroups.length > 0 ? (
                    (rowsPerPage > 0
                      ? filteredSourceGroups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : filteredSourceGroups
                    ).map((group) => {
                      const sourceNames = getSourceNames(group.sourceIds)
                      const sourceCount = sourceNames.length

                      return (
                        <TableRow key={group._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <GroupIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />
                              <Typography variant="body2" fontWeight="medium">
                                {group.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                <Box>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Sources in this group:
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />
                                  {sourceNames.map((name, index) => (
                                    <Typography key={index} variant="body2" sx={{ py: 0.5 }}>
                                      • {name}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                              arrow
                            >
                              <Chip
                                icon={<LanguageIcon />}
                                label={`${sourceCount} Sources`}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: "medium" }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Group">
                              <IconButton onClick={() => handleOpenDialog(group)} color="primary" size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Group">
                              <IconButton
                                onClick={() => handleDeleteConfirm(group._id)}
                                color="error"
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <Box textAlign="center" py={3}>
                          <GroupIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Source Groups Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {searchQuery
                              ? "Try adjusting your search criteria"
                              : "Create your first source group to get started"}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ mt: 1 }}
                          >
                            Add New Group
                          </Button>
                        </Box>
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
            count={filteredSourceGroups.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="medium">
            {isEditing ? "Edit Source Group" : "Add New Source Group"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Group Name"
                variant="outlined"
                value={currentGroup.name}
                onChange={(e) => setCurrentGroup({ ...currentGroup, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="sources-select-label">Select Sources</InputLabel>
                <Select
                  labelId="sources-select-label"
                  multiple
                  value={currentGroup.sourceIds}
                  onChange={(e) => setCurrentGroup({ ...currentGroup, sourceIds: e.target.value })}
                  input={<OutlinedInput label="Select Sources" />}
                  renderValue={(selected) => {
                    const selectedCount = selected.length
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        <Chip
                          icon={<LanguageIcon />}
                          label={`${selectedCount} Sources Selected`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {sources.map((source) => (
                    <MenuItem key={source._id} value={source._id}>
                      <Checkbox checked={currentGroup.sourceIds.indexOf(source._id) > -1} />
                      <ListItemText
                        primary={source.source}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {source.mediaBias} • {source.type}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {currentGroup.sourceIds.length > 0
                    ? `${currentGroup.sourceIds.length} sources selected`
                    : "Select at least one source"}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAddOrUpdateGroup}
            variant="contained"
            disabled={!currentGroup.name || currentGroup.sourceIds.length === 0}
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
            Are you sure you want to delete this source group? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteGroup} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SourceGroupsView

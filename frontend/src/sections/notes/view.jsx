"use client"

import { useState, useEffect } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Add as AddIcon,
  Link as LinkIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  NoteAdd as NoteAddIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material"
import {
  Box,
  Grid,
  Card,
  Chip,
  Alert,
  Paper,
  Button,
  Dialog,
  Divider,
  Tooltip,
  MenuItem,
  Skeleton,
  Container,
  TextField,
  Typography,
  IconButton,
  CardHeader,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"

// Services and components
import ForbiddenPage from "src/pages/403"
import noteService from "src/services/noteService"

export default function NotesView() {
  const theme = useTheme()

  // State variables
  const [noteTitle, setNoteTitle] = useState("")
  const [noteType, setNoteType] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [forbidden, setForbidden] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [formExpanded, setFormExpanded] = useState(false)

  const noteTypes = ["Urgent", "Hint", "Idea", "Event", "Useful Link"]

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await noteService.getAllNotes()
        setNotes(data)
      } catch (error1) {
        if (
          (error1.response && error1.response.status === 403) ||
          (error1.message && error1.message.includes("Access denied"))
        ) {
          setForbidden(true)
        } else {
          console.error("Error fetching notes:", error1)
          setError("Failed to load notes. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  // Handle form submission
  const handleSubmit = async () => {
    const newErrors = {}
    if (!noteTitle) newErrors.noteTitle = "Note title is required"
    if (!noteType) newErrors.noteType = "Note type is required"
    if (!description || description.length > 500)
      newErrors.description = "Description is required and must be 500 characters or less"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const newNote = { title: noteTitle, type: noteType, description }
    try {
      const createdNote = await noteService.addNote(newNote)
      setNotes((prevNotes) => [createdNote, ...prevNotes])
      setNoteTitle("")
      setNoteType("")
      setDescription("")
      setErrors({})
      setFormExpanded(false)
    } catch (errorNote) {
      if (
        (errorNote.response && errorNote.response.status === 403) ||
        (errorNote.message && errorNote.message.includes("Access denied"))
      ) {
        setForbidden(true)
      } else {
        console.error("Error adding note:", errorNote)
        setError("Failed to add note. Please try again.")
      }
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = (id) => {
    setNoteToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    try {
      await noteService.deleteNote(noteToDelete)
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteToDelete))
      setDeleteConfirmOpen(false)
    } catch (errorExcption) {
      if (
        (errorExcption.response && errorExcption.response.status === 403) ||
        (errorExcption.message && errorExcption.message.includes("Access denied"))
      ) {
        setForbidden(true)
      } else {
        console.error("Error deleting note:", errorExcption)
        setError("Failed to delete note. Please try again.")
      }
    }
  }

  const noteTypeColors = {
    Urgent: theme.palette.error.main,
    Hint: theme.palette.warning.main,
    Idea: theme.palette.success.main,
    Event: theme.palette.primary.main,
    "Useful Link": theme.palette.secondary.main,
  }

  const getNoteTypeIcon = (type) => {
    switch (type) {
      case "Urgent":
        return <WarningIcon />
      case "Hint":
        return <InfoIcon />
      case "Idea":
        return <LightbulbIcon />
      case "Event":
        return <EventIcon />
      case "Useful Link":
        return <LinkIcon />
      default:
        return <NoteAddIcon />
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Render loading skeletons
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card elevation={0} sx={{ height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <Skeleton variant="rectangular" height={20} width={40} sx={{ ml: 2, mt: 2 }} />
            <CardContent>
              <Skeleton variant="text" height={40} width="80%" sx={{ mx: "auto" }} />
              <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={80} sx={{ mt: 2 }} />
              <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  if (forbidden) {
    return <ForbiddenPage />
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Notes Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage your notes, ideas, and reminders
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Add Note Button (when form is collapsed) */}
      {!formExpanded && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormExpanded(true)}
          sx={{ mb: 3 }}
          size="large"
        >
          Create New Note
        </Button>
      )}

      {/* Form Container */}
      {formExpanded && (
        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardHeader
            title="Create a New Note"
            titleTypographyProps={{ variant: "h6", fontWeight: "medium" }}
            action={
              <IconButton onClick={() => setFormExpanded(false)}>
                <CloseIcon />
              </IconButton>
            }
            sx={{ pb: 0 }}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Note Title"
                  variant="outlined"
                  fullWidth
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  error={!!errors.noteTitle}
                  helperText={errors.noteTitle}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Type"
                  variant="outlined"
                  select
                  fullWidth
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  error={!!errors.noteType}
                  helperText={errors.noteType}
                  size="small"
                >
                  {noteTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: noteTypeColors[type],
                            mr: 1,
                          }}
                        />
                        {type}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setDescription(e.target.value)
                    }
                  }}
                  error={!!errors.description}
                  helperText={
                    errors.description ||
                    `${description.length}/500 characters${description.length >= 450 ? " (limit approaching)" : ""}`
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={() => setFormExpanded(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSubmit} startIcon={<NoteAddIcon />}>
                    Create Note
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* eslint-disable-next-line */}
      {loading ? (
        renderSkeletons()
      ) : notes.length > 0 ? (
        <Grid container spacing={3}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note._id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  position: "relative",
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    icon={getNoteTypeIcon(note.type)}
                    label={note.type}
                    size="small"
                    sx={{
                      bgcolor: `${noteTypeColors[note.type]}20`,
                      color: noteTypeColors[note.type],
                      fontWeight: "medium",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
                <CardContent sx={{ pt: 5 }}>
                  <Typography variant="h6" align="center" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
                    {note.title}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      minHeight: 80,
                      maxHeight: 120,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {note.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                      pt: 2,
                      borderTop: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(note.createdAt)}
                    </Typography>
                    <Tooltip title="Delete Note">
                      <IconButton
                        onClick={() => handleDeleteConfirm(note._id)}
                        size="small"
                        color="error"
                        sx={{
                          "&:hover": {
                            bgcolor: `${theme.palette.error.main}10`,
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <NoteAddIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Notes Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first note to get started
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormExpanded(true)}>
            Create New Note
          </Button>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="medium">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

"use client"

import { useState } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Info as InfoIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material"
import {
  Box,
  Card,
  Chip,
  Table,
  Alert,
  Button,
  Dialog,
  Divider,
  Tooltip,
  TableRow,
  Snackbar,
  Skeleton,
  Container,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  DialogTitle,
  CardContent,
  DialogContent,
  DialogActions,
  TableContainer,
  InputAdornment,
  CircularProgress,
} from "@mui/material"

// Services and components
import pdfGathererService from "src/services/pdfGathererService"

import { useSettingsContext } from "src/components/settings"

export default function PdfGathererView() {
  const theme = useTheme()
  const settings = useSettingsContext()

  // State variables
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [pdfDocuments, setPdfDocuments] = useState([])
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [error, setError] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query")
      setOpenSnackbar(true)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      console.log("Searching for PDFs with query:", query) // Log query
      const data = await pdfGathererService.getPdfDocuments(query)
      setPdfDocuments(data)
    } catch (errors) {
      if (errors.response) {
        if (errors.response.status === 404) {
          setError("No PDF documents found for your search.")
        } else {
          setError(`An error occurred: ${errors.message}`)
        }
      } else {
        setError(errors.message)
      }
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  // Handle open PDF
  const handleOpenPdf = (url) => {
    setSelectedPdf(url)
  }

  // Handle close PDF
  const handleClosePdf = () => {
    setSelectedPdf(null)
  }

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          Academic PDF Gatherer
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Search and access academic PDF documents from various sources
        </Typography>
      </Box>

      {/* Search Card */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <SearchIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight="medium">
              Search Academic PDFs
            </Typography>
          </Box>

          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
            <TextField
              label="Search Query"
              variant="outlined"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. Node.js performance analysis, climate change research, quantum computing"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{ minWidth: 120, height: { xs: 40, sm: "auto" } }}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Box>

          <Box mt={2} display="flex" alignItems="center">
            <InfoIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Enter a description of the academic article or topic you&apos;re looking for
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="center" px={3} py={2}>
            <PdfIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Search Results
            </Typography>
            {pdfDocuments.length > 0 && (
              <Chip
                label={`${pdfDocuments.length} documents found`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Divider />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell>
                    <Typography variant="subtitle2">Document Title</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* eslint-disable-next-line */}
                {loading ? (
                  // Loading skeletons
                  [...Array(3)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="text" width="80%" height={30} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="circular" width={40} height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pdfDocuments.length > 0 ? (
                  // Results
                  pdfDocuments.map((doc, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <PdfIcon color="error" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {doc.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View PDF">
                          <IconButton
                            onClick={() => handleOpenPdf(doc.pdf_url)}
                            color="primary"
                            sx={{ border: `1px solid ${theme.palette.divider}` }}
                          >
                            <OpenInNewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                      <Box textAlign="center" py={3}>
                        {hasSearched ? (
                          <>
                            <ArticleIcon
                              sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }}
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No PDF documents found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              Try adjusting your search query or try a different topic
                            </Typography>
                          </>
                        ) : (
                          <>
                            <SearchIcon
                              sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }}
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              Search for academic PDFs
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              Enter a description of the academic article to search
                            </Typography>
                            <Box mt={1}>
                              <Chip
                                label="Example: Node.js performance analysis"
                                color="primary"
                                variant="outlined"
                                onClick={() => {
                                  setQuery("Node.js performance analysis")
                                }}
                                sx={{ mr: 1, mb: 1 }}
                              />
                              <Chip
                                label="Example: Climate change research"
                                color="primary"
                                variant="outlined"
                                onClick={() => {
                                  setQuery("Climate change research")
                                }}
                                sx={{ mr: 1, mb: 1 }}
                              />
                              <Chip
                                label="Example: Quantum computing advances"
                                color="primary"
                                variant="outlined"
                                onClick={() => {
                                  setQuery("Quantum computing advances")
                                }}
                                sx={{ mb: 1 }}
                              />
                            </Box>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* PDF Viewer Dialog */}
      <Dialog open={Boolean(selectedPdf)} onClose={handleClosePdf} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <PdfIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">PDF Document Viewer</Typography>
            </Box>
            <IconButton onClick={handleClosePdf} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: "80vh" }}>
          {selectedPdf && (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <iframe
                src={selectedPdf}
                width="100%"
                height="100%"
                title="PDF Viewer"
                frameBorder="0"
                style={{ flexGrow: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            component="a"
            href={selectedPdf}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in New Tab
          </Button>
          <Button variant="contained" onClick={handleClosePdf}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}

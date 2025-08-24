"use client"

import React, { useState ,useEffect} from "react"

import {
  Book as BookIcon,
  ZoomIn as ZoomInIcon,
  Refresh as RefreshIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
} from "@mui/icons-material"
import {
  Box,
  Fade,
  Paper,
  Alert,
  Button,
  Divider,
  Tooltip,
  useTheme,
  Container,
  Typography,
  AlertTitle,
  IconButton,
  useMediaQuery,
  CircularProgress,
} from "@mui/material"

import ejournalService from "src/services/ejournalService"

const EjournalView = () => {
  const [pdfUrl, setPdfUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [zoomLevel, setZoomLevel] = useState(100)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
 
  const fetchPdf = async () => {
    setLoading(true)
    setError("")
    try {
      const pdfBlob = await ejournalService.getLatestPdfRapport()
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (fetchError) {
      // Using setError instead of console.error for better error handling
      setError("Failed to load PDF. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 70))
  }
// eslint-disable-next-line arrow-body-style
useEffect(() => {
  return () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
}, [pdfUrl]);

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={3}
        sx={{
          my: { xs: 2, sm: 4 },
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 3,
            }}
          >
            <BookIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            E-journal Viewer
          </Typography>

          <Divider sx={{ width: "100%", mb: 3 }} />

          {!pdfUrl && !loading && !error && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                maxWidth: "sm",
                mx: "auto",
              }}
            >
              <Typography variant="body1" sx={{ mb: 3 }}>
                Click the button below to load the latest e-journal report.
              </Typography>
              <Button
                variant="contained"
                onClick={fetchPdf}
                startIcon={<BookIcon />}
                size={isMobile ? "medium" : "large"}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Load E-Journal
              </Button>
            </Box>
          )}

          {loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 8,
              }}
            >
              <CircularProgress size={isMobile ? 40 : 60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading your document...
              </Typography>
            </Box>
          )}

          {error && (
            <Fade in={!!error}>
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  mb: 3,
                  borderRadius: 1,
                }}
              >
                <AlertTitle>Error</AlertTitle>
                {error}
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={fetchPdf}
                  startIcon={<RefreshIcon />}
                  sx={{ mt: 1 }}
                >
                  Try Again
                </Button>
              </Alert>
            </Fade>
          )}

          {pdfUrl && !loading && (
            <Fade in={!!pdfUrl}>
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    Document Viewer
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        mr: 1,
                      }}
                    >
                      <Tooltip title="Zoom out">
                        <IconButton onClick={handleZoomOut} size="small" disabled={zoomLevel <= 70}>
                          <ZoomOutIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" sx={{ px: 1 }}>
                        {zoomLevel}%
                      </Typography>
                      <Tooltip title="Zoom in">
                        <IconButton onClick={handleZoomIn} size="small" disabled={zoomLevel >= 150}>
                          <ZoomInIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Button
                      variant="contained"
                      href={pdfUrl}
                      download
                      startIcon={<DownloadIcon />}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1,
                      }}
                    >
                      {isMobile ? "Download" : "Download PDF"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={fetchPdf}
                      startIcon={<RefreshIcon />}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1,
                      }}
                    >
                      {isMobile ? "Refresh" : "Refresh Document"}
                    </Button>
                  </Box>
                </Box>

                <Paper
                  elevation={2}
                  sx={{
                    width: "100%",
                    borderRadius: 1,
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    component="iframe"
                    src={pdfUrl}
                    sx={{
                      width: "100%",
                      height: {
                        xs: "500px",
                        sm: "700px",
                        md: "800px",
                        lg: "900px",
                      },
                      border: "none",
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "top center",
                      transition: "transform 0.2s ease",
                    }}
                    title="PDF Viewer"
                    aria-label="PDF Document Viewer"
                  />
                </Paper>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>
    </Container>
  )
}

export default EjournalView

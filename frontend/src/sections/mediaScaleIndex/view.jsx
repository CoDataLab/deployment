
import { useState } from "react"

import { useTheme } from "@mui/material/styles"
import {
  Close as CloseIcon,
  Timeline as TimelineIcon,
  Category as CategoryIcon,
  BarChart as BarChartIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material"
import {
  Box,
  Grid,
  Card,
  Alert,
  Paper,
  Button,
  Dialog,
  Select,
  MenuItem,
  Skeleton,
  Container,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  CardContent,
  DialogTitle,
  FormControl,
  DialogContent,
  CircularProgress,
} from "@mui/material"

import mediaScaleIndexService from "src/services/mediaScaleIndexService"

import PodiumTable from "src/components/podium-table/view"

const ForbiddenPage = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      p: 4,
    }}
  >
    <Typography variant="h4" fontWeight="bold" mb={2}>
      403 - Access Denied
    </Typography>
    <Typography variant="body1" color="text.secondary">
      You do not have permission to view this page.
    </Typography>
  </Box>
)

export default function MediaScaleIndexView() {
  const theme = useTheme()
  // eslint-disable-next-line no-unused-vars
  const [forbidden, setForbidden] = useState(false)
  const categories = ["World", "Entertainment", "Sports", "Technology", "Politics", "Business", "Health", "Science"]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogContent, setDialogContent] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  const handleOpenDialog = (title, data) => {
    setDialogTitle(title)
    setDialogContent(data)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setDialogTitle("")
    setDialogContent([])
  }

  const fetchData = async (type, category = null, start = null, end = null) => {
    setLoading(true)
    setError(null)
    try {
      let response
      if (type === "latest") {
        response = await mediaScaleIndexService.getLatest()
        if (response.success && response.scales && response.scales.length > 0) {
          handleOpenDialog("Latest MediaScale Rankings", response.scales[0]?.results || [])
        } else {
          setError("No latest data found.")
        }
      } else if (type === "category" && category) {
        response = await mediaScaleIndexService.getByCategory(category)
        if (response.success && response.scales && response.scales.length > 0) {
          handleOpenDialog(`MediaScale Rankings for ${category}`, response.scales[0]?.results || [])
        } else {
          setError(`No data found for category: ${category}.`)
        }
      } else if (type === "calculate" && category && start && end) {
        const startTimestamp = new Date(start).getTime()
        const endTimestamp = new Date(end).getTime()
        response = await mediaScaleIndexService.calculateScoresByCategory(category, startTimestamp, endTimestamp)
        if (response.success && response.results) {
          handleOpenDialog(`Calculated Rankings for ${category} (${start} to ${end})`, response.results)
        } else {
          setError(`No calculated data found for ${category} in the specified range.`)
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch data. Please ensure the service is running and accessible.")
    } finally {
      setLoading(false)
    }
  }

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(3)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card elevation={0} sx={{ height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Skeleton variant="rectangular" height={20} width="80%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={30} width="60%" />
              <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  if (forbidden) {
    return <ForbiddenPage />
  }

  // Refactor the dialog content rendering logic to avoid nested ternaries
  let dialogContentToRender
  if (loading && openDialog) {
    dialogContentToRender = (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    )
  } else if (dialogContent.length > 0) {
    dialogContentToRender = <PodiumTable rankings={dialogContent} />
  } else {
    dialogContentToRender = (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
        No data to display. Please fetch data using the buttons above.
      </Typography>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <BarChartIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Media-Scale-Index Rankings Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
          Explore and analyze media source performance across various categories and timeframes.
        </Typography>
      </Box>
      {/* Main Content Area - Wrapped in Paper for a professional look */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
        {/* Action Buttons and Filters */}
        <Grid container spacing={3} alignItems="flex-end">
          {/* Latest Rankings Button */}
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<TimelineIcon />}
              onClick={() => fetchData("latest")}
              disabled={loading}
              fullWidth
              sx={{ height: "56px", fontSize: "1.1rem" }}
            >
              {loading && dialogTitle === "Latest MediaScale Rankings" ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Display Latest Rankings"
              )}
            </Button>
          </Grid>
          {/* Category and Date Filters */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={loading}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CategoryIcon />}
                  onClick={() => fetchData("category", selectedCategory)}
                  disabled={loading}
                  fullWidth
                  sx={{ height: "56px" }}
                >
                  {loading && dialogTitle.includes("MediaScale Rankings for") ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `View ${selectedCategory} Rankings`
                  )}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CalculateIcon />}
                  onClick={() => fetchData("calculate", selectedCategory, startDate, endDate)}
                  disabled={loading}
                  fullWidth
                  sx={{ height: "56px" }}
                >
                  {loading && dialogTitle.includes("Calculated Rankings for") ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Calculate ${selectedCategory} Rankings`
                  )}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {/* Placeholder for main content or loading skeletons */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading && !openDialog ? (
          renderSkeletons()
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Use the buttons above to fetch and display MediaScale rankings.
          </Typography>
        )}
      </Paper>
      {/* Data Display Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            {dialogTitle}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              color: (themes) => themes.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {dialogContentToRender}
        </DialogContent>
      </Dialog>
    </Container>
  )
}

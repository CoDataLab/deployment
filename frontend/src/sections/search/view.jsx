"use client"

import { useState, useEffect } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
import {
  Box,
  Grid,
  Card,
  Chip,
  Alert,
  Button,
  Divider,
  MenuItem,
  Container,
  TextField,
  Typography,
  CardContent,
  InputAdornment,
  CircularProgress,
} from "@mui/material"
// MUI icons
import {
  Label as LabelIcon,
  Search as SearchIcon,
  Public as PublicIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  FilterList as FilterListIcon,
  FormatListNumbered as FormatListNumberedIcon,
} from "@mui/icons-material"

// Services and components
import articlesService from "src/services/articlesService"

import { useSettingsContext } from "src/components/settings"
import SearchResults from "src/components/search-results/view"

// Constants
const mediaBiasOptions = ["lean left", "left", "center", "lean right", "right"]
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
const typeOptions = ["Blog", "Podcast", "Telegram", "Website", "Youtube"]

export default function SearchSection() {
  const theme = useTheme()
  const settings = useSettingsContext()

  // State variables
  const [searchParams, setSearchParams] = useState({
    source: "",
    relatedCountry: "",
    mediaBias: "",
    category: "",
    type: "",
    limit: 10,
  })
  const [articles, setArticles] = useState([])
  const [countries, setCountries] = useState([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  // Handle input changes
  const handleChange = (event) => {
    setSearchParams({
      ...searchParams,
      [event.target.name]: event.target.value,
    })
  }

  // Handle search
  const handleSearch = async () => {
    setLoadingSearch(true)
    setError("")
    try {
      const results = await articlesService.searchArticles(searchParams)
      setArticles(results.articles || [])
      setHasSearched(true)
    } catch (errorSearch) {
      console.error("Search error:", errorSearch)
      setError("An error occurred while searching. Please try again.")
    } finally {
      setLoadingSearch(false)
    }
  }

  // Reset search form
  const handleReset = () => {
    setSearchParams({
      source: "",
      relatedCountry: "",
      mediaBias: "",
      category: "",
      type: "",
      limit: 10,
    })
    setArticles([])
    setHasSearched(false)
  }

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryList = await articlesService.fetchAllCountrySources()
        setCountries(countryList || [])
      } catch (errorE) {
        console.error("Error fetching countries:", errorE)
        setError("Failed to load country options. Please try again.")
      } finally {
        setLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  // Render content based on loading and search state
  const renderContent = () => {
    if (loadingSearch) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={40} />
          <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
            Searching...
          </Typography>
        </Box>
      )
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )
    }

    if (articles.length > 0) {
      return <SearchResults articles={articles} />
    }

    if (hasSearched) {
      return (
        <Card elevation={0} sx={{ mt: 3, p: 4, textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
          <SearchIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Results Found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your search criteria to find more articles.
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            Reset Search
          </Button>
        </Card>
      )
    }

    return (
      <Card elevation={0} sx={{ mt: 3, p: 4, textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
        <SearchIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Advanced Search
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Use the filters above to search for articles.
        </Typography>
      </Card>
    )
  }

  // Get bias color
  const getBiasColor = (bias) => {
    if (!bias) return theme.palette.grey[500]

    if (bias.includes("left")) {
      return bias === "left" ? theme.palette.error.main : theme.palette.error.light
    }

    if (bias.includes("right")) {
      return bias === "right" ? theme.palette.primary.main : theme.palette.primary.light
    }

    return theme.palette.grey[500]
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Advanced Article Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find articles by source, country, bias, category, and more
        </Typography>
      </Box>

      {/* Search Form */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FilterListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight="medium">
              Search Filters
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={searchParams.source}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Related Country"
                name="relatedCountry"
                value={searchParams.relatedCountry}
                onChange={handleChange}
                variant="outlined"
                size="small"
                disabled={loadingCountries}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">All Countries</MenuItem>
                {loadingCountries ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Media Bias"
                name="mediaBias"
                value={searchParams.mediaBias}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LabelIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">All Biases</MenuItem>
                {mediaBiasOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: getBiasColor(option),
                          mr: 1,
                        }}
                      />
                      {option}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={searchParams.category}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoryOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={searchParams.type}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                {typeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Limit"
                name="limit"
                type="number"
                value={searchParams.limit}
                onChange={handleChange}
                variant="outlined"
                size="small"
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FormatListNumberedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="center" gap={2}>
            <Button variant="outlined" onClick={handleReset} disabled={loadingSearch} sx={{ minWidth: 120 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={loadingSearch ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={loadingSearch}
              sx={{ minWidth: 120 }}
            >
              {loadingSearch ? "Searching..." : "Search"}
            </Button>
          </Box>

          {/* Active Filters */}
          {(searchParams.source ||
            searchParams.relatedCountry ||
            searchParams.mediaBias ||
            searchParams.category ||
            searchParams.type) && (
            <Box mt={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Filters:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {searchParams.source && (
                  <Chip
                    label={`Source: ${searchParams.source}`}
                    size="small"
                    onDelete={() => setSearchParams({ ...searchParams, source: "" })}
                  />
                )}
                {searchParams.relatedCountry && (
                  <Chip
                    label={`Country: ${searchParams.relatedCountry}`}
                    size="small"
                    onDelete={() => setSearchParams({ ...searchParams, relatedCountry: "" })}
                  />
                )}
                {searchParams.mediaBias && (
                  <Chip
                    label={`Bias: ${searchParams.mediaBias}`}
                    size="small"
                    onDelete={() => setSearchParams({ ...searchParams, mediaBias: "" })}
                    sx={{
                      bgcolor: `${getBiasColor(searchParams.mediaBias)}20`,
                      color: getBiasColor(searchParams.mediaBias),
                    }}
                  />
                )}
                {searchParams.category && (
                  <Chip
                    label={`Category: ${searchParams.category}`}
                    size="small"
                    onDelete={() => setSearchParams({ ...searchParams, category: "" })}
                  />
                )}
                {searchParams.type && (
                  <Chip
                    label={`Type: ${searchParams.type}`}
                    size="small"
                    onDelete={() => setSearchParams({ ...searchParams, type: "" })}
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {renderContent()}
    </Container>
  )
}

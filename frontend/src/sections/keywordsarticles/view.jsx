"use client"

import { enUS } from "date-fns/locale"
import { format, formatDistance } from "date-fns"
import { useState, useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useTheme } from "@mui/material/styles"
import {
  Box,
  Grid,
  Link,
  Card,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  Container,
  CardMedia,
  TextField,
  Typography,
  IconButton,
  Pagination,
  CardContent,
  InputAdornment,
} from "@mui/material"
import {
  Label as LabelIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"

import reportingService from "src/services/reportingService"

import { useSettingsContext } from "src/components/settings"

// Search form configuration
const SEARCH_CONFIG = {
  FORM: {
    KEYWORD_MIN_LENGTH: 2,
    KEYWORD_MAX_LENGTH: 100,
    DEFAULT_DATE_RANGE_DAYS: 30,
  },
  UI: {
    FORM_SPACING: 2,
    BUTTON_HEIGHT: 56,
    INPUT_HEIGHT: 56,
  },
  VALIDATION: {
    REQUIRED_FIELDS: ["keyword", "startDate", "endDate"],
    DATE_FORMAT: "yyyy-MM-dd",
  },
  // NEW: Pagination configuration
  PAGINATION: {
    ITEMS_PER_PAGE: 15,
    SHOW_FIRST_LAST: true,
    SHOW_PREVIOUS_NEXT: true,
    BOUNDARY_COUNT: 1,
    SIBLING_COUNT: 1,
  },
}

export default function KeywordsArticlesView() {
  const theme = useTheme()
  const navigate = useNavigate()
  const settings = useSettingsContext()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const keyword = queryParams.get("keyword")
  const start = queryParams.get("start")
  const end = queryParams.get("end")
  // FIX: Added radix parameter to parseInt
  const pageParam = Number.parseInt(queryParams.get("page") || "1", 10)

  // Existing state
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(pageParam)
  const [totalPages, setTotalPages] = useState(0)
  const [paginatedArticles, setPaginatedArticles] = useState([])

  // New search form state
  const [searchForm, setSearchForm] = useState({
    keyword: keyword || "",
    startDate: start ? format(new Date(Number(start)), "yyyy-MM-dd") : "",
    endDate: end ? format(new Date(Number(end)), "yyyy-MM-dd") : "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSearching, setIsSearching] = useState(false)

  // Helper function to format date for input
  const formatDateForInput = (date) => {
    if (!date) return ""
    return format(new Date(date), "yyyy-MM-dd")
  }

  // Helper function to get date from input
  const getDateFromInput = (dateString) => {
    if (!dateString) return null
    return new Date(`${dateString}T00:00:00`)
  }

  // NEW: Handle page change - moved before useEffect to fix dependency issue
  const handlePageChange = useCallback(
    (event, newPage) => {
      setCurrentPage(newPage)

      // Update URL with new page parameter
      const searchParams = new URLSearchParams(location.search)
      if (newPage === 1) {
        searchParams.delete("page")
      } else {
        searchParams.set("page", newPage.toString())
      }

      const newUrl = searchParams.toString() ? `${location.pathname}?${searchParams.toString()}` : location.pathname
      navigate(newUrl, { replace: true })

      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [location.pathname, location.search, navigate],
  )

  // NEW: Pagination helper functions
  // FIX: Renamed parameter to avoid shadowing
  const calculatePagination = (articlesArray, pageNumber) => {
    const totalItems = articlesArray.length
    // FIX: Renamed variable to avoid shadowing
    const calculatedTotalPages = Math.ceil(totalItems / SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE)
    const startIndex = (pageNumber - 1) * SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE
    const endIndex = startIndex + SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE
    const paginatedItems = articlesArray.slice(startIndex, endIndex)

    return {
      totalPages: calculatedTotalPages,
      paginatedItems,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
      totalItems,
    }
  }

  // NEW: Update pagination when articles or page changes
  // FIX: Added handlePageChange to dependency array
  useEffect(() => {
    if (articles.length > 0) {
      const paginationData = calculatePagination(articles, currentPage)
      setTotalPages(paginationData.totalPages)
      setPaginatedArticles(paginationData.paginatedItems)

      // If current page is greater than total pages, reset to page 1
      if (currentPage > paginationData.totalPages && paginationData.totalPages > 0) {
        handlePageChange(null, 1)
      }
    } else {
      setTotalPages(0)
      setPaginatedArticles([])
    }
  }, [articles, currentPage, handlePageChange])

  // Initialize form with URL parameters or defaults
  useEffect(() => {
    if (keyword || start || end) {
      setSearchForm({
        keyword: keyword || "",
        startDate: start ? formatDateForInput(Number(start)) : "",
        endDate: end ? formatDateForInput(Number(end)) : "",
      })
      setCurrentPage(pageParam) // Set current page from URL
    } else {
      // Set default date range (last 30 days)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - SEARCH_CONFIG.FORM.DEFAULT_DATE_RANGE_DAYS)

      setSearchForm((prev) => ({
        ...prev,
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
      }))
      setCurrentPage(1) // Reset to page 1 for new searches
    }
  }, [keyword, start, end, pageParam])

  // Fetch articles when URL parameters change
  useEffect(() => {
    const fetchArticles = async () => {
      if (!keyword || !start || !end) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")
        const response = await reportingService.getArticlesByKeyword(keyword, start, end)
        if (response && response.length > 0) {
          setArticles(response)
        } else {
          setArticles([])
          setError("No articles found")
        }
      } catch (err) {
        console.error("Error fetching articles:", err)
        setError("Error fetching articles")
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [keyword, start, end])

  // Form validation
  const validateForm = () => {
    const errors = {}

    // Validate keyword
    if (!searchForm.keyword.trim()) {
      errors.keyword = "Keyword is required"
    } else if (searchForm.keyword.trim().length < SEARCH_CONFIG.FORM.KEYWORD_MIN_LENGTH) {
      errors.keyword = `Keyword must be at least ${SEARCH_CONFIG.FORM.KEYWORD_MIN_LENGTH} characters`
    } else if (searchForm.keyword.trim().length > SEARCH_CONFIG.FORM.KEYWORD_MAX_LENGTH) {
      errors.keyword = `Keyword must be less than ${SEARCH_CONFIG.FORM.KEYWORD_MAX_LENGTH} characters`
    }

    // Validate dates
    if (!searchForm.startDate) {
      errors.startDate = "Start date is required"
    }
    if (!searchForm.endDate) {
      errors.endDate = "End date is required"
    }

    // Validate date range
    if (searchForm.startDate && searchForm.endDate) {
      const startDate = getDateFromInput(searchForm.startDate)
      const endDate = getDateFromInput(searchForm.endDate)

      if (startDate && endDate && startDate > endDate) {
        errors.endDate = "End date must be after start date"
      }

      // Validate date range (not in future)
      const now = new Date()
      if (startDate && startDate > now) {
        errors.startDate = "Start date cannot be in the future"
      }
      if (endDate && endDate > now) {
        errors.endDate = "End date cannot be in the future"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // Handle form submission
  const handleSearch = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSearching(true)

    try {
      // Convert dates to timestamps
      const startDate = getDateFromInput(searchForm.startDate)
      const endDate = getDateFromInput(searchForm.endDate)

      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999)

      const startTimestamp = startDate.getTime()
      const endTimestamp = endDate.getTime()

      // Update URL with search parameters (reset page to 1 for new searches)
      const searchParams = new URLSearchParams({
        keyword: searchForm.keyword.trim(),
        start: startTimestamp.toString(),
        end: endTimestamp.toString(),
      })

      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true })
    } catch (err) {
      console.error("Search error:", err)
      setError("Error performing search")
    } finally {
      setIsSearching(false)
    }
  }

  // Clear search form
  const handleClearSearch = () => {
    setSearchForm({
      keyword: "",
      startDate: "",
      endDate: "",
    })
    setFormErrors({})
    setArticles([])
    setError("")
    setCurrentPage(1)
    navigate(location.pathname, { replace: true })
  }

  // Quick date range presets
  const handleQuickDateRange = (days) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    setSearchForm((prev) => ({
      ...prev,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
    }))
  }

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp)
    return formatDistance(date, new Date(), { addSuffix: true, locale: enUS })
  }

  const getLabelColor = (label) => {
    if (label <= -0.15) return theme.palette.error.main // Red for negative
    if (label > 0.15) return theme.palette.success.main // Green for positive
    return theme.palette.grey[500] // Neutral Gray for -0.15 to 0.15
  }

  const getSentimentText = (label) => {
    if (label <= -0.15) return "Negative"
    if (label > 0.15) return "Positive"
    return "Neutral"
  }

  const validateLabel = (label) => (typeof label === "string" ? label : "N/A")

  const handleToggleDescription = (index) => {
    // NEW: Update index calculation for paginated articles
    const actualIndex = (currentPage - 1) * SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE + index
    setArticles((prevArticles) =>
      prevArticles.map((article, idx) =>
        idx === actualIndex ? { ...article, showFullDescription: !article.showFullDescription } : article,
      ),
    )
  }

  const formatDateRange = () => {
    if (!start || !end) return ""
    const startDate = format(new Date(Number(start)), "PPP", { locale: enUS })
    const endDate = format(new Date(Number(end)), "PPP", { locale: enUS })
    return `${startDate} to ${endDate}`
  }

  // NEW: Get pagination info for display
  const getPaginationInfo = () => {
    if (articles.length === 0) return ""

    const startItem = (currentPage - 1) * SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE + 1
    const endItem = Math.min(currentPage * SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE, articles.length)

    return `Showing ${startItem}-${endItem} of ${articles.length} articles`
  }

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(SEARCH_CONFIG.PAGINATION.ITEMS_PER_PAGE)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card elevation={0} sx={{ height: "100%", border: `1px solid ${theme.palette.divider}` }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" height={100} />
              <Skeleton variant="text" width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  // NEW: Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
        mb={2}
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ order: { xs: 2, sm: 1 } }}>
          {getPaginationInfo()}
        </Typography>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
          showFirstButton={SEARCH_CONFIG.PAGINATION.SHOW_FIRST_LAST}
          showLastButton={SEARCH_CONFIG.PAGINATION.SHOW_FIRST_LAST}
          boundaryCount={SEARCH_CONFIG.PAGINATION.BOUNDARY_COUNT}
          siblingCount={SEARCH_CONFIG.PAGINATION.SIBLING_COUNT}
          sx={{
            order: { xs: 1, sm: 2 },
            "& .MuiPaginationItem-root": {
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: theme.shadows[2],
              },
            },
          }}
        />
      </Box>
    )
  }

  // Render search form
  const renderSearchForm = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <FilterListIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          Search Articles
        </Typography>
      </Box>

      <form onSubmit={handleSearch}>
        <Stack spacing={SEARCH_CONFIG.UI.FORM_SPACING}>
          {/* Keyword Input */}
          <TextField
            fullWidth
            label="Search Keyword"
            placeholder="Enter keyword to search for..."
            value={searchForm.keyword}
            onChange={(e) => handleFormChange("keyword", e.target.value)}
            error={!!formErrors.keyword}
            helperText={formErrors.keyword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchForm.keyword && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleFormChange("keyword", "")} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Date Range */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={searchForm.startDate}
                onChange={(e) => handleFormChange("startDate", e.target.value)}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: formatDateForInput(new Date()),
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={searchForm.endDate}
                onChange={(e) => handleFormChange("endDate", e.target.value)}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: formatDateForInput(new Date()),
                  min: searchForm.startDate,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Quick Date Range Buttons */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick date ranges:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {[
                { label: "Last 7 days", days: 7 },
                { label: "Last 30 days", days: 30 },
                { label: "Last 90 days", days: 90 },
                { label: "Last 6 months", days: 180 },
              ].map((preset) => (
                <Button
                  key={preset.days}
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuickDateRange(preset.days)}
                  sx={{
                    mb: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: theme.shadows[2],
                    },
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              disabled={isSearching}
              startIcon={<ClearIcon />}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSearching || !searchForm.keyword.trim()}
              startIcon={<SearchIcon />}
              sx={{
                minWidth: 120,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: theme.shadows[4],
                },
                "&:disabled": {
                  transform: "none",
                },
              }}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/reports")}
          sx={{
            mb: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          }}
          variant="outlined"
        >
          Back to Reports
        </Button>

        {/* Search Form */}
        {renderSearchForm()}

        {/* Results Header */}
        {keyword && (
          <Box>
            <Box display="flex" alignItems="center" mb={1}>
              <SearchIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                Articles about &quot;{keyword}&quot;
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" color="text.secondary" mb={2}>
              <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body1">{formatDateRange()}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
          </Box>
        )}
      </Box>

      {loading && renderSkeleton()}

      {error && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1">
            {keyword ? (
              <>
                No articles were found for &quot;{keyword}&quot; in the selected date range. Try adjusting your search
                criteria.
              </>
            ) : (
              "Use the search form above to find articles by keyword and date range."
            )}
          </Typography>
        </Card>
      )}

      {!loading && !error && keyword && articles.length === 0 && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, p: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            No articles found
          </Alert>
          <Typography variant="body1">
            No articles were found for &quot;{keyword}&quot; in the selected date range. Try adjusting your search
            criteria.
          </Typography>
        </Card>
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          {/* NEW: Results summary with pagination info */}
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h6" color="text.secondary">
              Found {articles.length} article{articles.length !== 1 ? "s" : ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getPaginationInfo()}
            </Typography>
          </Box>

          {/* NEW: Display paginated articles instead of all articles */}
          <Grid container spacing={3}>
            {paginatedArticles.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => navigate(`/dashboard/read/${article._id}`)}
                >
                  <Box sx={{ position: "relative" }}>
                    {article.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={article.imageUrl}
                        alt={article.headline}
                        sx={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: theme.palette.action.hover,
                        }}
                      >
                        <ArticleIcon sx={{ fontSize: 64, color: theme.palette.text.secondary }} />
                      </Box>
                    )}
                    <Chip
                      label={validateLabel(article.source)}
                      color="primary"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ mb: 1 }}>
                      {article.headline}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(article.date)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flexGrow: 1 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {article.description && article.description.length > 150 ? (
                        <>
                          {article.showFullDescription
                            ? article.description
                            : `${article.description.slice(0, 150)}...`}
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleDescription(index)
                            }}
                            endIcon={article.showFullDescription ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ ml: 1, mt: 0.5 }}
                          >
                            {article.showFullDescription ? "Show Less" : "Read More"}
                          </Button>
                        </>
                      ) : (
                        article.description || "No description available."
                      )}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                          <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {validateLabel(article.author)}
                          </Typography>
                        </Box>
                        <Tooltip title="Read original article">
                          <IconButton
                            size="small"
                            color="primary"
                            component={Link}
                            href={article.articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {article.label !== undefined && (
                        <Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LabelIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Sentiment:
                            </Typography>
                            <Chip
                              label={getSentimentText(article.label)}
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: getLabelColor(article.label),
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              height: 8,
                              width: "100%",
                              bgcolor: theme.palette.grey[200],
                              borderRadius: 1,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                height: "100%",
                                width: "50%",
                                bgcolor: getLabelColor(article.label),
                                borderRadius: 1,
                                transform: `translateX(${(article.label + 1) * 50}%)`,
                              }}
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between" mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Negative
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {article.label.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Positive
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* NEW: Pagination component */}
          {renderPagination()}
        </>
      )}
    </Container>
  )
}

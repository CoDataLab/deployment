
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect, useCallback } from "react"

// MUI components
import { useTheme } from "@mui/material/styles"
// MUI icons
import {
  Tune as TuneIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Language as LanguageIcon,
  OpenInNew as OpenInNewIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material"
import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Alert,
  Button,
  Slider,
  Tooltip,
  Divider,
  TableRow,
  Skeleton,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  CardContent,
  Autocomplete,
  TableContainer,
  InputAdornment,
  TablePagination,
} from "@mui/material"

// Services
import sourcesService from "src/services/sourcesService"
import articlesService from "src/services/articlesService"

import { useSettingsContext } from "src/components/settings"

const ArticleView = () => {
  const theme = useTheme()
  const settings = useSettingsContext()

  // State variables
  const [articles, setArticles] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceQuery, setSourceQuery] = useState("")
  const [articleLimit, setArticleLimit] = useState([0, 50])
  const [availableSources, setAvailableSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch sources
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const sources = await sourcesService.fetchAllSources()
        setAvailableSources(sources)
      } catch (errorEx) {
        console.error("Error fetching sources:", errorEx)
        setError("Failed to load sources. Please try again.")
      }
    }

    fetchSources()
  }, [])

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await articlesService.fetchAllArticles(articleLimit[1], sourceQuery)
      const fetchedArticles = response.articles

      if (Array.isArray(fetchedArticles)) {
        const formattedArticles = fetchedArticles.map((article) => ({
          ...article,
          date: article.date ? formatDistanceToNow(new Date(article.date), { addSuffix: true }) : null,
        }))
        setArticles(formattedArticles)
      } else {
        console.error("Fetched articles is not an array:", fetchedArticles)
        setError("Invalid data format received. Please try again.")
      }
    } catch (errorEx) {
      console.error("Error fetching articles:", errorEx)
      setError("Failed to load articles. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [articleLimit, sourceQuery])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  // Filter articles based on search query
  const filteredArticles = articles.filter(
    (article) =>
      (typeof article.headline === "string" && article.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof article.source === "string" && article.source.toLowerCase().includes(sourceQuery.toLowerCase())) ||
      (article.keywords &&
        typeof article.keywords === "string" &&
        article.keywords.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const limitedArticles = filteredArticles.slice(0, articleLimit[1])

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Helper function to handle string values
  const isString = (value) => (typeof value === "string" ? value : "N/A")

  // Get sentiment color
  const getSentimentColor = (label) => {
    if (label === undefined || label === null) return theme.palette.grey[500]
    if (label <= -0.15) return theme.palette.error.main
    if (label > 0.15) return theme.palette.success.main
    return theme.palette.grey[500]
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setSourceQuery("")
    setArticleLimit([0, 50])
    setPage(0)
  }

  // Render loading skeletons
  const renderSkeletons = () => (
    <TableBody>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="text" width={100} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={150} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={70} height={36} sx={{ borderRadius: 1 }} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={200} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={100} height={60} sx={{ borderRadius: 1 }} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width={120} />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4 }} />
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
          Production Articles
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and search through all production articles
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FilterListIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight="medium">
              Filters
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Article Limit Slider */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TuneIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="medium">
                    Article Limit: {articleLimit[1]}
                  </Typography>
                </Box>
                <Slider
                  value={articleLimit}
                  onChange={(e, newValue) => setArticleLimit([0, newValue[1]])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500}
                  step={10}
                  sx={{
                    mx: "auto",
                    width: "100%",
                    "& .MuiSlider-thumb": {
                      height: 20,
                      width: 20,
                      backgroundColor: theme.palette.primary.main,
                    },
                    "& .MuiSlider-track": {
                      height: 6,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Search Field */}
            <Grid item xs={12} md={6}>
              <TextField
                variant="outlined"
                placeholder="Search articles by headline or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Source Autocomplete */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={availableSources
                  .filter(
                    (sourceObj) => sourceQuery && sourceObj.source.toLowerCase().includes(sourceQuery.toLowerCase()),
                  )
                  .map((sourceObj) => sourceObj.source)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Filter by source..."
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanguageIcon color="action" fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                onInputChange={(event, newValue) => {
                  setSourceQuery(newValue)
                }}
                disableClearable
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Showing {limitedArticles.length} of {articles.length} articles
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleResetFilters}>
                Reset Filters
              </Button>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchArticles}>
                Apply Filters
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Articles Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="center" px={3} py={2}>
            <ArticleIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Articles
            </Typography>
            <Chip
              label={`${limitedArticles.length} articles`}
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
                    <Typography variant="subtitle2">Headline</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">URL</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Description</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Date</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Image</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Author</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Keywords</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">Sentiment</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              {loading ? (
                renderSkeletons()
              ) : (
                <TableBody>
                  {limitedArticles.length > 0 ? (
                    (rowsPerPage > 0
                      ? limitedArticles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : limitedArticles
                    ).map((article) => (
                      <TableRow key={article._id} hover>
                        <TableCell>
                          <Chip
                            label={isString(article.source)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: "medium" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={isString(article.headline)}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isString(article.headline)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {isString(article.articleUrl) !== "N/A" ? (
                            <Tooltip title="Visit article">
                              <IconButton
                                size="small"
                                color="primary"
                                component="a"
                                href={article.articleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ border: `1px solid ${theme.palette.divider}` }}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              typeof article.description === "string" ? article.description : "No description available"
                            }
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {typeof article.description === "string" && article.description.length > 100
                                ? `${article.description.substring(0, 100)}...`
                                : isString(article.description)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <CalendarIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.7 }} />
                            <Typography variant="body2">{isString(article.date)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {isString(article.imageUrl) !== "N/A" ? (
                            <Box
                              component="img"
                              src={article.imageUrl}
                              alt="Article"
                              sx={{
                                width: 100,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 100,
                                height: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: theme.palette.action.hover,
                                borderRadius: 1,
                              }}
                            >
                              <ArticleIcon color="action" />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <PersonIcon fontSize="small" color="action" sx={{ mr: 1, opacity: 0.7 }} />
                            <Typography variant="body2">{isString(article.author)}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={isString(article.keywords)}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 150,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isString(article.keywords)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {article.label !== undefined && article.label !== null ? (
                            <Chip
                              label={article.label.toFixed(2)}
                              size="small"
                              sx={{
                                bgcolor: `${getSentimentColor(article.label)}20`,
                                color: getSentimentColor(article.label),
                                fontWeight: "medium",
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Box textAlign="center" py={3}>
                          <SearchIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Articles Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Try adjusting your search criteria or filters
                          </Typography>
                          <Button variant="outlined" onClick={handleResetFilters}>
                            Reset Filters
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
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={limitedArticles.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Container>
  )
}

export default ArticleView

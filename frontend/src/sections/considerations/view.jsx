"use client"

import Cookies from "js-cookie"
import PropTypes from "prop-types"
import { enUS } from "date-fns/locale"
import { formatDistance } from "date-fns"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

// MUI components
import { useTheme } from "@mui/material/styles"
import {
  Box,
  Link,
  Grid,
  Card,
  Chip,
  Alert,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  Container,
  CardMedia,
  Typography,
  IconButton,
  CardContent,
} from "@mui/material"
// MUI icons
import {
  Public as PublicIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material"

// Services and components
import articlesService from "src/services/articlesService"

import VideoPlayer from "src/components/video-player/view"
import HotHeadlines from "src/components/headlines-section"
import { useSettingsContext } from "src/components/settings"

// Constants
const CACHE_KEY = "news_data_cache"
const CACHE_COOKIE_KEY = "news_data_timestamp"
const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes in milliseconds

// Shimmer Effect Component
const ShimmerEffect = ({ variant = "card" }) => {
  const theme = useTheme()

  if (variant === "headline") {
    return (
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={7}>
              <Skeleton variant="text" height={40} width="80%" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={30} width="40%" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={120} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={30} width="60%" sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Skeleton variant="text" width={100} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card elevation={0} sx={{ height: "100%", border: `1px solid ${theme.palette.divider}` }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" height={30} width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="40%" sx={{ mb: 2 }} />
          <Skeleton variant="text" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={20} width="70%" />
        </CardContent>
      </Card>
    </Grid>
  )
}

ShimmerEffect.propTypes = {
  variant: PropTypes.string,
}

export default function NewsExplorerView() {
  const theme = useTheme()
  const settings = useSettingsContext()
  const navigate = useNavigate()
  const location = useLocation()

  // State variables
  const [articles, setArticles] = useState([])
  const [mainHeadline, setMainHeadline] = useState(null)
  const [biasArticles, setBiasArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch data with caching
  const fetchData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError("")

    try {
      // Try to get data from localStorage first if not forcing refresh
      if (!forceRefresh) {
        const cachedTimeString = Cookies.get(CACHE_COOKIE_KEY)
        const cachedTime = cachedTimeString ? Number.parseInt(cachedTimeString, 10) : null
        const now = Date.now()

        // Check if we have a valid cache
        if (cachedTime && now - cachedTime < CACHE_DURATION) {
          const cachedDataString = localStorage.getItem(CACHE_KEY)
          if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString)
            setMainHeadline(cachedData.mainHeadline)
            setArticles(cachedData.articles)
            setBiasArticles(cachedData.biasArticles)
            setLoading(false)
            setRefreshing(false)
            return
          }
        }
      }

      // If no valid cache or forcing refresh, fetch new data
      const [headline, latest, biases] = await Promise.all([
        articlesService.fetchMainHeadlineArticle(),
        articlesService.fetchLatestArticles(),
        articlesService.fetchArticlessDifferentBias(),
      ])

      // Store data in localStorage and cookies
      const dataToCache = {
        mainHeadline: headline,
        articles: latest.articles || [],
        biasArticles: biases || [],
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache))
      Cookies.set(CACHE_COOKIE_KEY, Date.now().toString(), { expires: 1 }) // Expires in 1 day

      setMainHeadline(headline)
      setArticles(latest.articles || [])
      setBiasArticles(biases || [])
    } catch (errorException) {
      console.error("Error fetching news data:", errorException)
      setError("Failed to load news data. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [location.pathname])

  // Helper functions
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp)
    return formatDistance(date, new Date(), { addSuffix: true, locale: enUS })
  }

  const validateLabel = (label) => (typeof label === "string" ? label : "N/A")

  // Get label color based on sentiment
  const getLabelColor = (label) => {
    if (label <= -0.15) return theme.palette.error.main
    if (label > 0.15) return theme.palette.success.main
    return theme.palette.grey[500]
  }
  // eslint-disable-next-line
  const getSentimentText = (label) => {
    if (label <= -0.15) return "Negative"
    if (label > 0.15) return "Positive"
    return "Neutral"
  }

  // Get bias color
  const getBiasColor = (mediaBias) => {
    if (!mediaBias) return theme.palette.grey[500]

    const bias = mediaBias.toLowerCase()
    if (bias.includes("left")) {
      return bias === "left" ? theme.palette.error.main : theme.palette.error.light
    }

    if (bias.includes("right")) {
      return bias === "right" ? theme.palette.primary.main : theme.palette.primary.light
    }

    return theme.palette.grey[500]
  }

  // Get bias background color (lighter version)
  const getBiasBackgroundColor = (mediaBias) => {
    if (!mediaBias) return "transparent"

    const bias = mediaBias.toLowerCase()
    if (bias.includes("left")) {
      return `${theme.palette.error.main}10`
    }

    if (bias.includes("right")) {
      return `${theme.palette.primary.main}10`
    }

    return "transparent"
  }

  // Render article card
  const renderArticleCard = (article) => (
    <Grid item xs={12} sm={6} md={4} key={article._id}>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${theme.palette.divider}`,
          borderLeft: article.sourceInfo?.mediaBias
            ? `4px solid ${getBiasColor(article.sourceInfo.mediaBias)}`
            : `4px solid ${theme.palette.grey[300]}`,
          borderRadius: 2,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: theme.shadows[8],
            cursor: "pointer",
          },
          bgcolor: getBiasBackgroundColor(article.sourceInfo?.mediaBias),
        }}
        onClick={() => navigate(`/dashboard/read/${article._id}`)}
      >
        <Box sx={{ position: "relative" }}>
          {article.imageUrl?.match(/\.(mp4|mov|avi)$/i) ? (
            <VideoPlayer src={article.imageUrl} height={200} />
          ) : (
            <CardMedia
              component="img"
              height={200}
              image={article.imageUrl || "/assets/icons/components/ic_imgnotfound.svg"}
              alt={article.headline}
              sx={{ objectFit: "cover" }}
            />
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

        <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center">
              <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(article.date)}
              </Typography>
            </Box>

            {article.sourceInfo?.mediaBias && (
              <Chip
                label={article.sourceInfo.mediaBias}
                size="small"
                sx={{
                  bgcolor: `${getBiasColor(article.sourceInfo.mediaBias)}20`,
                  color: getBiasColor(article.sourceInfo.mediaBias),
                  fontWeight: "medium",
                }}
              />
            )}
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            fontWeight="medium"
            sx={{
              height: 60,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 2,
            }}
          >
            {article.headline}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              height: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              mb: 2,
              flexGrow: 1,
            }}
          >
            {article.description || "No description available."}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" fontWeight="medium">
                {validateLabel(article.author)}
              </Typography>
            </Box>

            <Tooltip title="Read original article">
              <IconButton
                component={Link}
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                size="small"
                color="primary"
                sx={{ border: `1px solid ${theme.palette.divider}` }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {article.label !== undefined && (
            <Box mt={2}>
              <Box
                sx={{
                  height: 8,
                  width: "100%",
                  bgcolor: theme.palette.grey[200],
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: "50%",
                    bgcolor: getLabelColor(article.label),
                    borderRadius: 1,
                    position: "absolute",
                    left: `${(article.label + 1) * 50}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </Box>
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Negative-Tension
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {article.label.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Positive-Tension
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
          News Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Discover news from diverse perspectives and sources
        </Typography>
      </Box>

      {/* Refresh Button */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="outlined"
          startIcon={refreshing ? <Skeleton width={24} height={24} /> : <RefreshIcon />}
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh News"}
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {loading ? (
          <>
            {/* Loading Skeletons */}
            <Grid item xs={12}>
              <ShimmerEffect variant="headline" />
            </Grid>
            {[...Array(6)].map((_, index) => (
              <ShimmerEffect key={index} />
            ))}
          </>
        ) : (
          <>
            {/* Main Headline Section */}
            {mainHeadline && (
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: mainHeadline.sourceInfo?.mediaBias
                      ? `6px solid ${getBiasColor(mainHeadline.sourceInfo.mediaBias)}`
                      : `6px solid ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: theme.shadows[8],
                      cursor: "pointer",
                    },
                    bgcolor: getBiasBackgroundColor(mainHeadline.sourceInfo?.mediaBias),
                    overflow: "hidden",
                  }}
                  onClick={() => navigate(`/dashboard/read/${mainHeadline._id}`)}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Grid container>
                      {/* Image/Video Section */}
                      <Grid item xs={12} md={5}>
                        <Box sx={{ position: "relative", height: "100%" }}>
                          {mainHeadline.imageUrl?.match(/\.(mp4|mov|avi)$/i) ? (
                            <VideoPlayer src={mainHeadline.imageUrl} height={340} />
                          ) : (
                            <Box
                              component="img"
                              src={mainHeadline.imageUrl || "/assets/icons/components/ic_imgnotfound.svg"}
                              alt={mainHeadline.headline}
                              sx={{
                                height: { xs: 250, md: 340 },
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <Chip
                            label={validateLabel(mainHeadline.source)}
                            color="primary"
                            sx={{
                              position: "absolute",
                              top: 16,
                              left: 16,
                              fontWeight: "bold",
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Text Content Section */}
                      <Grid item xs={12} md={7}>
                        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Box display="flex" alignItems="center">
                              <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatTimeAgo(mainHeadline.date)}
                              </Typography>
                            </Box>

                            {mainHeadline.sourceInfo?.mediaBias && (
                              <Chip
                                label={mainHeadline.sourceInfo.mediaBias}
                                size="small"
                                sx={{
                                  bgcolor: `${getBiasColor(mainHeadline.sourceInfo.mediaBias)}20`,
                                  color: getBiasColor(mainHeadline.sourceInfo.mediaBias),
                                  fontWeight: "medium",
                                }}
                              />
                            )}
                          </Box>

                          <Typography variant="h4" gutterBottom fontWeight="bold">
                            {mainHeadline.headline}
                          </Typography>

                          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 3 }}>
                            {mainHeadline.description || "No description available."}
                          </Typography>

                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mt="auto"
                            flexWrap={{ xs: "wrap", sm: "nowrap" }}
                            gap={2}
                          >
                            <Box display="flex" alignItems="center">
                              <PersonIcon color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" fontWeight="medium">
                                By: {validateLabel(mainHeadline.author)}
                              </Typography>
                            </Box>

                            <Button
                              component={Link}
                              href={mainHeadline.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="contained"
                              onClick={(e) => e.stopPropagation()}
                              endIcon={<OpenInNewIcon />}
                            >
                              Read Full Article
                            </Button>
                          </Box>

                          {mainHeadline.label !== undefined && (
                            <Box mt={3}>
                              <Box
                                sx={{
                                  height: 10,
                                  width: "100%",
                                  bgcolor: theme.palette.grey[200],
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  position: "relative",
                                }}
                              >
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: "50%",
                                    bgcolor: getLabelColor(mainHeadline.label),
                                    borderRadius: 1,
                                    position: "absolute",
                                    left: `${(mainHeadline.label + 1) * 50}%`,
                                    transform: "translateX(-50%)",
                                  }}
                                />
                              </Box>
                              <Box display="flex" justifyContent="space-between" mt={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  Negative-Tension
                                </Typography>
                                <Typography variant="caption" fontWeight="bold">
                                  {mainHeadline.label.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Positive-Tension
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Different Perspectives Section */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <PublicIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="medium">
                      Articles from Different Perspectives
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {biasArticles.length > 0 ? (
                      biasArticles.map((article) => renderArticleCard(article))
                    ) : (
                      <Grid item xs={12}>
                        <Alert severity="info">No perspective articles available at the moment.</Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Hot Headlines Section */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="medium">
                      Hot Headlines
                    </Typography>
                  </Box>

                  <HotHeadlines />
                </CardContent>
              </Card>
            </Grid>

            {/* Latest Articles Section */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <ArticleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="medium">
                      Latest Articles
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {articles.length > 0 ? (
                      articles.slice(1).map((article) => renderArticleCard(article))
                    ) : (
                      <Grid item xs={12}>
                        <Alert severity="info">No latest articles available at the moment.</Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

// MUI components
import { alpha, useTheme } from "@mui/material/styles"
import {
  Box,
  Grid,
  Chip,
  Card,
  Alert,
  Badge,
  Avatar,
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
  Info as InfoIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  Article as ArticleIcon,
  Language as LanguageIcon,
  Bookmark as BookmarkIcon,
  Category as CategoryIcon,
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material"

import sourcesService from "src/services/sourcesService"
import articlesService from "src/services/articlesService"
import mediaScaleIndexService from "src/services/mediaScaleIndexService"

// Components
import SourceNotFoundView from "src/components/source-not-found/view"
import BiasVisualization from "src/components/bias-visualization/view"

const SourceAnalysis = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sourceName = searchParams.get("source")

  // State variables
  const [sourceData, setSourceData] = useState(null)
  const [rankingData, setRankingData] = useState(null) // New state for ranking data
  const [postingRate, setPostingRate] = useState(null)
  const [recentArticles, setRecentArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notFound, setNotFound] = useState(false)

  // Helper functions
  const getBiasColor = (mediaBias) => {
    const bias = mediaBias?.toLowerCase()
    if (bias?.includes("far left") || bias?.includes("extreme left")) return theme.palette.error.dark
    if (bias?.includes("lean left")) return theme.palette.error.main
    if (bias?.includes("left") && !bias?.includes("lean")) return theme.palette.error.light
    if (bias?.includes("far right") || bias?.includes("extreme right")) return theme.palette.primary.dark
    if (bias?.includes("lean right")) return theme.palette.primary.main
    if (bias?.includes("right") && !bias?.includes("lean")) return theme.palette.primary.light
    if (bias?.includes("center")) return theme.palette.success.main
    return theme.palette.grey[500]
  }
  const getBiasBackgroundColor = (mediaBias) => {
    const bias = mediaBias?.toLowerCase()
    if (bias?.includes("far left") || bias?.includes("extreme left")) return alpha(theme.palette.error.dark, 0.1)
    if (bias?.includes("lean left")) return alpha(theme.palette.error.main, 0.1)
    if (bias?.includes("left") && !bias?.includes("lean")) return alpha(theme.palette.error.light, 0.1)
    if (bias?.includes("far right") || bias?.includes("extreme right")) return alpha(theme.palette.primary.dark, 0.1)
    if (bias?.includes("lean right")) return alpha(theme.palette.primary.main, 0.1)
    if (bias?.includes("right") && !bias?.includes("lean")) return alpha(theme.palette.primary.light, 0.1)
    if (bias?.includes("center")) return alpha(theme.palette.success.main, 0.1)
    return alpha(theme.palette.grey[200], 0.3)
  }
  const getBiasScore = (mediaBias) => {
    const bias = mediaBias?.toLowerCase()
    if (bias?.includes("far left") || bias?.includes("extreme left")) return -2
    if (bias?.includes("lean left")) return -1
    if (bias?.includes("left") && !bias?.includes("lean")) return -0.5
    if (bias?.includes("center")) return 0
    if (bias?.includes("lean right")) return 1
    if (bias?.includes("right") && !bias?.includes("lean")) return 0.5
    if (bias?.includes("far right") || bias?.includes("extreme right")) return 2
    return 0
  }
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (err) {
      return "N/A"
    }
  }
  const formatTimeAgo = (date) => {
    if (!date) return "N/A"
    try {
      const now = new Date()
      const articleDate = new Date(date)
      if (Number.isNaN(articleDate.getTime())) return "N/A"
      const diffTime = Math.abs(now - articleDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays === 1) return "1 day ago"
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 30)} months ago`
    } catch (err) {
      return "N/A"
    }
  }
  const getLanguageFlag = (language) => {
    const flags = {
      english: "🇺🇸",
      french: "🇫🇷",
      spanish: "🇪🇸",
      german: "🇩🇪",
      italian: "🇮🇹",
      arabic: "🇸🇦",
    }
    return flags[language?.toLowerCase()] || "🌐"
  }
  const getActivityDescription = (activityRate) => {
    if (activityRate >= 80) return "exceptional"
    if (activityRate >= 60) return "strong"
    if (activityRate >= 40) return "moderate"
    return "limited"
  }
  const getPublishingInsight = (avgDailyRate) => {
    if (avgDailyRate >= 5) {
      return " This high-frequency publishing schedule indicates an active newsroom with robust content production capabilities."
    }
    if (avgDailyRate >= 2) {
      return " This steady publishing pace reflects consistent editorial operations and regular content updates."
    }
    if (avgDailyRate >= 1) {
      return " This moderate publishing frequency suggests selective content curation with focus on quality over quantity."
    }
    return " This conservative publishing approach indicates careful editorial selection and in-depth content development."
  }

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!sourceName) {
        setError("No source specified")
        setLoading(false)
        return
      }
      // Check if services are available
      if (!sourcesService || !articlesService) {
        console.error("Services not available:", { sourcesService, articlesService })
        setError("Services not initialized. Please refresh the page.")
        setLoading(false)
        return
      }
      setLoading(true)
      setError("")
      try {
        // Fetch source data using the provided service method
        console.log("Fetching source data for:", sourceName)
        const sourceResponse = await sourcesService.fetchSourceByName(sourceName)
        console.log("Source response:", sourceResponse)
        // Check if we got valid data
        if (!sourceResponse || !sourceResponse.source) {
          console.warn("Invalid source response:", sourceResponse)
          setNotFound(true)
          setError("")
          return
        }
        setSourceData(sourceResponse)
        setNotFound(false) // Reset not found state on successful fetch

        // Fetch ranking data
        if (sourceResponse.category && sourceResponse._id) {
          try {
            const rankingResponse = await mediaScaleIndexService.getSourceRanking(sourceResponse.category, sourceResponse._id)
            if (rankingResponse && rankingResponse.success) {
              setRankingData(rankingResponse.result)
            } else {
              console.warn("Failed to fetch ranking data:", rankingResponse)
              setRankingData(null) // Ensure it's null if fetch fails or is unsuccessful
            }
          } catch (rankingError) {
            console.error("Error fetching ranking data:", rankingError)
            setRankingData(null) // Ensure it's null on error
          }
        }

        // Fetch additional data
        console.log("Fetching additional data...")
        const [postingRateData, articlesData] = await Promise.all([
          articlesService.fetchSourcePostingRateBySource(sourceName).catch((err) => {
            console.warn("Failed to fetch posting rate:", err)
            return null
          }),
          articlesService.fetchAllArticlesBySource(sourceName).catch((err) => {
            console.warn("Failed to fetch articles:", err)
            return { articles: [] }
          }),
        ])
        console.log("Posting rate data:", postingRateData)
        console.log("Articles data:", articlesData)
        // Process posting rate data
        let processedPostingRate = null
        if (postingRateData) {
          const counts = Object.values(postingRateData)
          const totalArticles = counts.reduce((sum, count) => sum + count, 0)
          // Calculate date range (past 2 months)
          const now = new Date()
          const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 days
          // Filter data for past 2 months
          const recentData = Object.entries(postingRateData)
            .filter(([timestamp]) => Number.parseInt(timestamp, 10) >= twoMonthsAgo.getTime())
            .map(([timestamp, count]) => ({ timestamp: Number.parseInt(timestamp, 10), count }))
          const recentTotal = recentData.reduce((sum, item) => sum + item.count, 0)
          const activeDays = recentData.filter((item) => item.count > 0).length
          const maxDailyCount = Math.max(...counts)
          const avgDailyRate = recentTotal / Math.max(recentData.length, 1)
          // Find most active day
          const mostActiveDay = recentData.reduce((max, current) => (current.count > max.count ? current : max), {
            timestamp: 0,
            count: 0,
          })
          processedPostingRate = {
            totalArticles,
            recentTotal,
            activeDays,
            maxDailyCount,
            avgDailyRate: Math.round(avgDailyRate * 10) / 10,
            mostActiveDay:
              mostActiveDay.count > 0
                ? {
                    date: new Date(mostActiveDay.timestamp).toLocaleDateString(),
                    count: mostActiveDay.count,
                  }
                : null,
            totalDays: recentData.length,
            activityRate: Math.round((activeDays / Math.max(recentData.length, 1)) * 100),
          }
        }
        setPostingRate(processedPostingRate)
        setRecentArticles(articlesData.articles || [])
      } catch (errorEx) {
        console.error("Error fetching source data:", errorEx)
        console.error("Error details:", {
          message: errorEx.message,
          status: errorEx.status,
          response: errorEx.response,
          stack: errorEx.stack,
        })
        // Check if it's a 404 error - be more flexible with error detection
        const is404 =
          errorEx.response?.status === 404 ||
          errorEx.status === 404 ||
          errorEx.message?.includes("404") ||
          errorEx.message?.toLowerCase().includes("not found")
        if (is404) {
          console.log("Detected 404 error, showing not found view")
          setNotFound(true)
          setError("")
        } else {
          console.log("Detected non-404 error, showing error message")
          setError(`Failed to load source data: ${errorEx.message || "Please try again."}`)
          setNotFound(false)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sourceName])
  // Update page title
  useEffect(() => {
    if (sourceData) {
      document.title = `${sourceData.source} - Source Analysis`
    }
  }, [sourceData])
  // Article card renderer
  const renderArticleCard = (article) => (
    <Grid item xs={12} sm={6} md={4} key={article._id}>
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
            cursor: "pointer",
            borderColor: theme.palette.primary.main,
          },
          bgcolor: sourceData ? getBiasBackgroundColor(sourceData.mediaBias) : "background.paper",
        }}
        onClick={() => navigate(`/dashboard/read/${article._id}`)}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height={180}
            image={article.imageUrl || "/assets/icons/components/ic_imgnotfound.svg"}
            alt={article.headline}
            sx={{ objectFit: "cover" }}
          />
          <Chip
            label={article.source}
            size="small"
            color="primary"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              fontWeight: "bold",
              backdropFilter: "blur(4px)",
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
            {formatTimeAgo(article.date)}
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            sx={{
              height: 72,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.2,
            }}
          >
            {article.headline}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
            }}
          >
            {article.description || "No description available."}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Back
          </Button>
          <Skeleton variant="rectangular" height={250} sx={{ mb: 2, borderRadius: 2 }} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    )
  }
  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }}>
          Back
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }
  // 404 Not Found state
  if (notFound) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }}>
          Back
        </Button>
        <SourceNotFoundView
          sourceName={sourceName}
          onNavigateBack={() => navigate(-1)}
          onNavigateToDashboard={() => navigate("/dashboard")}
          onNavigateToSources={() => navigate("/dashboard/sources")}
        />
      </Container>
    )
  }
  if (!sourceData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }}>
          Back
        </Button>
        <SourceNotFoundView
          sourceName={sourceName}
          onNavigateBack={() => navigate(-1)}
          onNavigateToDashboard={() => navigate("/dashboard")}
          onNavigateToSources={() => navigate("/dashboard/sources")}
        />
      </Container>
    )
  }
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Navigation */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mb: 2 }}
          size="large"
        >
          Back to Sources
        </Button>
      </Box>
      {/* Header Section */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "center", md: "flex-start" }}
            gap={{ xs: 3, md: 0 }}
            mb={4}
          >
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" gap={3}>
              {rankingData && (
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" color="inherit" mb={1}>
                        Source Ranking Details
                      </Typography>
                      <Typography variant="body2">Overall Score: {rankingData.overall_score?.toFixed(1)}</Typography>
                      <Typography variant="body2">
                        Neutrality Score: {rankingData.neutrality_score?.toFixed(1)}
                      </Typography>
                      <Typography variant="body2">Bias Score: {rankingData.bias_score?.toFixed(1)}</Typography>
                      <Typography variant="body2">Type Score: {rankingData.type_score?.toFixed(1)}</Typography>
                      <Typography variant="body2">Rate Score: {rankingData.rate_score?.toFixed(1)}</Typography>
                      <Typography variant="body2">Category Score: {rankingData.category_score?.toFixed(1)}</Typography>
                      <Typography variant="body2">Language Score: {rankingData.language_score?.toFixed(1)}</Typography>
                    </Box>
                  }
                  arrow
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: "50%",
                      bgcolor: theme.palette.primary.main, // Modern, professional color
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      flexShrink: 0,
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                        zIndex: 1,
                      },
                      "&:hover": {
                        boxShadow: theme.shadows[6],
                        transform: "scale(1.05)",
                        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                      },
                    }}
                  >
                    <Typography variant="h4" component="span" sx={{ zIndex: 2 }}>
                      #{rankingData.rank}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              <Avatar
                src={sourceData.logoUrl}
                alt={sourceData.source}
                sx={{
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  border: `2px solid ${theme.palette.divider}`,
                  bgcolor: "background.paper",
                }}
              >
                <LanguageIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />
              </Avatar>
              <Box textAlign={{ xs: "center", sm: "left" }}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" } }}
                >
                  {sourceData.source}
                </Typography>
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" gap={2} mb={2}>
                  <Chip
                    icon={<PublicIcon fontSize="small" />}
                    label={sourceData.relatedCountry}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<CategoryIcon fontSize="small" />}
                    label={sourceData.type}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`${getLanguageFlag(sourceData.language)} ${sourceData.language}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                {sourceData.category && (
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    Primary Focus: {sourceData.category}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection={{ xs: "row", sm: "row" }}
              gap={1}
              flexWrap="wrap"
              justifyContent="center"
            >
              <Tooltip title="Share Source">
                <IconButton color="primary" size="large">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bookmark Source">
                <IconButton color="primary" size="large">
                  <BookmarkIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                size="large"
                href={sourceData.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Visit RSS Feed
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  RSS
                </Box>
              </Button>
            </Box>
          </Box>
          {/* Enhanced Publishing Rate Analysis */}
          {postingRate && (
            <Box
              p={3}
              bgcolor={alpha(theme.palette.primary.main, 0.05)}
              borderRadius={2}
              border={`1px solid ${alpha(theme.palette.primary.main, 0.2)}`}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <ArticleIcon color="primary" />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Publishing Activity Analysis
                </Typography>
              </Box>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, mb: 2 }}>
                Over the past two months, <strong>{sourceData.source}</strong> has published{" "}
                <strong>{postingRate.recentTotal} articles</strong> across <strong>{postingRate.totalDays} days</strong>
                , maintaining an average publishing rate of <strong>{postingRate.avgDailyRate} articles per day</strong>
                .
                {postingRate.activeDays > 0 && (
                  <>
                    {" "}
                    The source was active on <strong>{postingRate.activeDays} days</strong>({postingRate.activityRate}%
                    activity rate), demonstrating <strong>{getActivityDescription(postingRate.activityRate)}</strong>{" "}
                    consistency in content delivery.
                  </>
                )}
                {postingRate.mostActiveDay && (
                  <>
                    {" "}
                    Their most productive day was <strong>{postingRate.mostActiveDay.date}</strong>
                    with <strong>{postingRate.mostActiveDay.count} articles</strong> published.
                  </>
                )}
                {getPublishingInsight(postingRate.avgDailyRate)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={1.5} bgcolor={alpha(theme.palette.success.main, 0.1)} borderRadius={1}>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {postingRate.recentTotal}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Articles
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={1.5} bgcolor={alpha(theme.palette.info.main, 0.1)} borderRadius={1}>
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      {postingRate.avgDailyRate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg/Day
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={1.5} bgcolor={alpha(theme.palette.warning.main, 0.1)} borderRadius={1}>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {postingRate.activeDays}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={1.5} bgcolor={alpha(theme.palette.secondary.main, 0.1)} borderRadius={1}>
                    <Typography variant="h6" fontWeight="bold" color="secondary.main">
                      {postingRate.activityRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Activity Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Source Details */}
          <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
            {/* Media Bias Analysis */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{ border: `1px solid ${theme.palette.divider}`, height: "100%", borderRadius: 2 }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <AssessmentIcon color="primary" sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      Media Bias Classification
                    </Typography>
                    <Tooltip title="Political bias classification based on content analysis">
                      <InfoIcon sx={{ ml: 1, fontSize: 16, color: theme.palette.text.secondary }} />
                    </Tooltip>
                  </Box>
                  <BiasVisualization
                    sourceData={sourceData}
                    getBiasColor={getBiasColor}
                    getBiasBackgroundColor={getBiasBackgroundColor}
                    getBiasScore={getBiasScore}
                  />
                </CardContent>
              </Card>
            </Grid>
            {/* Source Information */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{ border: `1px solid ${theme.palette.divider}`, height: "100%", borderRadius: 2 }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <InfoIcon color="primary" sx={{ mr: 1, fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                      Source Details
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <LinkIcon color="action" fontSize="small" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        RSS Feed URL
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: "break-all",
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        p: 1,
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      }}
                    >
                      {sourceData.url}
                    </Typography>
                    <Divider />
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Source ID
                      </Typography>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                      >
                        {sourceData._id}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Recent Articles */}
          {recentArticles.length > 0 && (
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                  <Box display="flex" alignItems="center">
                    <ArticleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Recent Articles
                    </Typography>
                    <Badge badgeContent={recentArticles.length} color="primary" sx={{ ml: 2 }} />
                  </Box>
                </Box>
                <Grid container spacing={3}>
                  {recentArticles.slice(0, 6).map(renderArticleCard)}
                </Grid>
                {recentArticles.length > 6 && (
                  <Box textAlign="center" mt={3}>
                    <Button variant="outlined" size="large">
                      View All {recentArticles.length} Articles
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
          {recentArticles.length === 0 && (
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <ArticleIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Recent Articles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No articles have been indexed from this source recently.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Stats */}
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Source Overview
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Geographic Focus
                  </Typography>
                  <Chip
                    icon={<PublicIcon fontSize="small" />}
                    label={sourceData.relatedCountry}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Content Language
                  </Typography>
                  <Chip
                    label={`${getLanguageFlag(sourceData.language)} ${sourceData.language}`}
                    color="info"
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Source Type
                  </Typography>
                  <Chip
                    icon={<CategoryIcon fontSize="small" />}
                    label={sourceData.type}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                {sourceData.category && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Primary Category
                    </Typography>
                    <Chip label={sourceData.category} color="success" variant="outlined" />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
          {/* Source Timeline */}
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Source Timeline
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: theme.palette.success.main,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Source Added
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(sourceData.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Last Updated
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(sourceData.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
export default SourceAnalysis

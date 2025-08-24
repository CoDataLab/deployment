

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// MUI components
import { useTheme } from "@mui/material/styles"
import {
  Box,
  Chip,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Tooltip,
  Divider,
  Skeleton,
  Typography,
  IconButton,
  CardContent,
  useMediaQuery,
} from "@mui/material"
// MUI icons
import {
  Link as LinkIcon,
  Label as LabelIcon,
  Source as SourceIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material"

// Services
import articlesService from "src/services/articlesService"

const HotHeadlines = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  const fetchHeadlines = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await articlesService.getHotHeadlinesArticles()
      if (Array.isArray(data?.articles)) {
        setArticles(data.articles)
      } else {
        console.error("Expected an array of articles but got:", data)
        setError("Failed to load headlines. Invalid data format.")
      }
    } catch (error2) {
      console.error("Error fetching articles:", error2)
      setError("Failed to load headlines. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeadlines()
  }, [])

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getLabelColor = (label) => {
    if (label <= -0.15) return theme.palette.error.main
    if (label > 0.15) return theme.palette.success.main
    return theme.palette.grey[500]
  }

  const getSentimentText = (label) => {
    if (label <= -0.15) return "Negative"
    if (label > 0.15) return "Positive"
    return "Neutral"
  }

  const renderSkeletons = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <Card key={index} elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Skeleton variant="text" width="70%" height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Divider sx={{ my: 2 }} />
            <Box display="flex" gap={1} flexWrap="wrap">
              <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 16 }} />
              <Skeleton variant="rectangular" width={150} height={32} sx={{ borderRadius: 16 }} />
              <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  )

  const renderArticles = () => (
    <Grid container spacing={3}>
      {articles.map((article) => (
        <Grid item xs={12} key={article._id}>
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (article._id) {
                      navigate(`/dashboard/read/${article._id}`)
                    }
                  }}
                >
                  <ArticleIcon color="primary" />
                  <Typography
                    variant="h6"
                    fontWeight="medium"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    {article.headline}
                  </Typography>
                </Box>

                <Tooltip title="Open original article" arrow>
                  <IconButton
                    component="a"
                    href={article.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                    size="small"
                    sx={{ border: `1px solid ${theme.palette.divider}` }}
                  >
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {article.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {article.description}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  icon={<SourceIcon fontSize="small" />}
                  label={article.source || "Unknown"}
                  size="small"
                  color="primary"
                  variant="outlined"
                />

                {article.author && (
                  <Chip
                    icon={<PersonIcon fontSize="small" />}
                    label={article.author}
                    size="small"
                    variant="outlined"
                  />
                )}

                {article.date && (
                  <Chip
                    icon={<CalendarMonthIcon fontSize="small" />}
                    label={formatDate(article.date)}
                    size="small"
                    variant="outlined"
                  />
                )}

                {typeof article.label === "number" && (
                  <Chip
                    icon={<LabelIcon fontSize="small" />}
                    label={getSentimentText(article.label)}
                    size="small"
                    sx={{
                      bgcolor: `${getLabelColor(article.label)}20`,
                      color: getLabelColor(article.label),
                      fontWeight: "medium",
                      border: `1px solid ${getLabelColor(article.label)}40`,
                    }}
                  />
                )}
              </Stack>

              {typeof article.label === "number" && (
                <Box mb={1}>
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

              {article.keywords && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    Keywords:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                    {article.keywords.split(" - ").map((keyword, index) => (
                      <Chip key={index} label={keyword} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )

  const renderNoArticles = () => (
    <Card elevation={0} sx={{ p: 4, textAlign: "center", border: `1px solid ${theme.palette.divider}` }}>
      <ArticleIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No Headlines Available
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        There are no hot headlines to display at the moment.
      </Typography>
      <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchHeadlines}>
        Refresh Headlines
      </Button>
    </Card>
  )

 return (
  <Box sx={{ width: "100%" }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
      <Box display="flex" alignItems="center">
        <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" fontWeight="medium">
          Hot Headlines
        </Typography>
      </Box>
      <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={fetchHeadlines} disabled={loading}>
        Refresh
      </Button>
    </Box>

    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}

    {loading && renderSkeletons()}

    {!loading && articles.length > 0 && renderArticles()}

    {!loading && articles.length === 0 && renderNoArticles()}
  </Box>
)
}

export default HotHeadlines
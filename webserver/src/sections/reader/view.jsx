"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// MUI components
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Chip,
  Card,
  Paper,
  Alert,
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
} from "@mui/material";
// MUI icons
import {
  Share as ShareIcon,
  Label as LabelIcon,
  Public as PublicIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  Bookmark as BookmarkIcon,
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon ,
  ArrowBack as ArrowBackIcon,
  Copyright as CopyrightIcon,
  Visibility as VisibilityIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";

// Services and components
import articlesService from "src/services/articlesService";

import HotHeadlines from "src/components/headlines-section";

import ArticleComments from "../article-comments/view";

const ReaderView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  // State variables
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [differentSourceArticles, setDifferentSourceArticles] = useState([]);
  const [sourceDetails, setSourceDetails] = useState({});
  const [error, setError] = useState("");

  // Function to update the document title
  const updatePageTitle = (title) => {
    document.title = title;
  };

  // Get label color based on sentiment
  const getLabelColor = (label) => {
    if (label <= -0.15) return theme.palette.error.main;
    if (label > 0.15) return theme.palette.primary.main;
    return theme.palette.grey[400];
  };

  // Get bias color
  const getBiasColor = (mediaBias) => {
    const bias = mediaBias?.toLowerCase();
    if (bias?.includes("left")) return alpha(theme.palette.error.main, 0.1);
    if (bias?.includes("right")) return alpha(theme.palette.primary.main, 0.1);
    return alpha(theme.palette.grey[200], 0.3);
  };

  // Helper functions
  const validateLabel = (label) => label || "N/A";
  const formatTimeAgo = (date) => new Date(date).toLocaleDateString();
  const getAuthorName = (author) => {
    if (typeof author === "object" && author !== null) {
      return author.name || "Unknown Author";
    }
    return author || "Unknown Author";
  };

  // Fetch article data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [articleData, sourceDetailsData, differentSourceData] = await Promise.all([
          articlesService.fetchArticleById(id),
          articlesService.fetchArticleDetails(id),
          articlesService.fetchDifferentSourceArticles(),
        ]);

        setArticle(articleData);
        setSourceDetails(sourceDetailsData);
        setDifferentSourceArticles(differentSourceData);

        if (sourceDetailsData.recentArticles) {
          const relatedData = await Promise.all(
            sourceDetailsData.recentArticles
              .slice(0, 4)
              .map(({ id: articleId }) => articlesService.fetchArticleById(articleId)),
          );
          setRelatedArticles(relatedData);
        }
      } catch (errorEx) {
        console.error("Error fetching data:", errorEx);
        setError("Failed to load article. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Update page title when article data is available
  useEffect(() => {
    if (article) {
      updatePageTitle(article.headline);
    } else {
      updatePageTitle("Reading Article...");
    }
  }, [article]);

  // Render article card
  const renderArticleCard = (relatedArticle) => (
    <Grid item xs={12} sm={6} md={3} key={relatedArticle._id}>
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
          bgcolor: getBiasColor(relatedArticle.sourceInfo?.mediaBias),
        }}
        onClick={() => navigate(`/dashboard/read/${relatedArticle._id}`)}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height={160}
            image={relatedArticle.imageUrl || "/assets/icons/components/ic_imgnotfound.svg"}
            alt={relatedArticle.headline}
            sx={{ objectFit: "cover" }}
          />
          <Chip
            label={validateLabel(relatedArticle.source)}
            size="small"
            color="primary"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              fontWeight: "bold",
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(relatedArticle.date)}
            </Typography>
            {relatedArticle.sourceInfo?.mediaBias && (
              <Chip
                label={relatedArticle.sourceInfo.mediaBias}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Box>

          <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="medium"
            sx={{
              height: 60,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {relatedArticle.headline}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flexGrow: 1,
              height: 60,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              mb: 2,
            }}
          >
            {relatedArticle.description || "No description available."}
          </Typography>

          {relatedArticle.label !== undefined && (
            <Box>
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
                    bgcolor: getLabelColor(relatedArticle.label),
                    borderRadius: 1,
                    transform: `translateX(${(relatedArticle.label + 1) * 50}%)`,
                  }}
                />
              </Box>
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Negative
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {relatedArticle.label.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Positive
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={4}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Back
          </Button>
          <Skeleton variant="rectangular" height={60} width="70%" sx={{ mb: 2 }} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} width="60%" sx={{ mb: 1 }} />
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={100} height={32} sx={{ borderRadius: 4 }} />
              ))}
            </Box>
            <Skeleton variant="text" height={30} width="40%" />
          </Grid>
        </Grid>
      </Container>
    );
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
    );
  }

  // Not found state
  if (!article) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }}>
          Back
        </Button>
        <Paper sx={{ p: 4, textAlign: "center", border: `1px solid ${theme.palette.divider}` }} elevation={0}>
          <ArticleIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, opacity: 0.3, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Article not found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/dashboard")} startIcon={<ArrowBackIcon />}>
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const { headline, description, date, imageUrl, source, keywords, author, credit, publisher, label, articleUrl,viewCount } =
    article;

  const isYoutubeUrl = articleUrl && articleUrl.includes("https://www.youtube.com");

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Navigation */}
      <Box mb={4}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2 }}>
          Back
        </Button>
      </Box>

      {/* Main Article Card */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Media Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* eslint-disable-next-line */}
                {isYoutubeUrl ? (
                  <Box sx={{ position: "relative", width: "100%", paddingTop: "56.25%" /* 16:9 aspect ratio */ }}>
                    <iframe
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                      src={articleUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                ) : imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={headline}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/icons/components/ic_imgnotfound.svg";
                    }}
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                      maxHeight: "400px",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "300px",
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    <ArticleIcon sx={{ fontSize: 80, color: theme.palette.text.secondary, opacity: 0.3 }} />
                  </Box>
                )}

                <Chip
                  label={source || "Unknown Source"}
                  color="primary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontWeight: "bold",
                  }}
                />
              </Box>
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                {headline}
              </Typography>

              <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                {description || "No description available."}
              </Typography>

              <Box display="flex" alignItems="center" mb={3}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Published:
                </Typography>
                <Chip
                  label={new Date(date).toLocaleDateString()}
                  size="small"
                  variant="outlined"
                  icon={<CalendarIcon fontSize="small" />}
                />
              </Box>

              {/* Source Details */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Source Information:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                    <Chip
                      avatar={
                        <Avatar
                          alt={sourceDetails.source || 'S'}
                          src={sourceDetails.logo}
                         
                        >
                          <LanguageIcon fontSize="small" />
                        </Avatar>
                      }
                      label={sourceDetails.source || "Unknown"}
                      size="small"
                      variant="outlined"
                       onClick={() => navigate(`/dashboard/thinkboard?source=${encodeURIComponent(sourceDetails.source || source)}`)}
                    />

                  <Chip
                    icon={<LabelIcon fontSize="small" />}
                    label={`Bias: ${sourceDetails.bias || "Unknown"}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: (() => {
                        const bias = sourceDetails.bias?.toLowerCase();
                        if (bias?.includes("left")) return theme.palette.error.main;
                        if (bias?.includes("right")) return theme.palette.primary.main;
                        return theme.palette.grey[500];
                      })(),
                    }}
                  />
                  <Chip
                    icon={<PublicIcon fontSize="small" />}
                    label={`Country: ${sourceDetails.relatedCountry || "Unknown"}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<CategoryIcon fontSize="small" />}
                    label={`Category: ${sourceDetails.category || "Unknown"}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<ArticleIcon fontSize="small" />}
                    label={`Type: ${sourceDetails.type || "Unknown"}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={2} mb={3}>
                {articleUrl && !isYoutubeUrl && (
                  <Button
                    variant="contained"
                    startIcon={<OpenInNewIcon />}
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read Original
                  </Button>
                )}
                <Tooltip title="Bookmark Article">
                  <IconButton color="primary" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                    <BookmarkIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share Article">
                  <IconButton color="primary" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Keywords */}
              {keywords && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Keywords:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {keywords.split(" - ").map((keyword) => (
                      <Chip key={keyword} label={keyword} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Sentiment Meter */}
              {label !== undefined && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sentiment Analysis:
                  </Typography>
                  <Box
                    sx={{
                      height: 10,
                      width: "100%",
                      bgcolor: theme.palette.grey[200],
                      borderRadius: 1,
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: "50%",
                        bgcolor: getLabelColor(label),
                        borderRadius: 1,
                        transform: `translateX(${(label + 1) * 50}%)`,
                      }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Negative
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {label.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Positive
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
   <Box display="flex" alignItems="center" gap={1}>
  <PersonIcon color="action" />
  <Typography variant="subtitle2">Author:</Typography>
  <Typography variant="body2">{getAuthorName(author) || "Unknown"}</Typography>
</Box>
            </Grid>

            {credit && (
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CopyrightIcon color="action" />
                  <Typography variant="subtitle2">Credit:</Typography>
                  <Typography variant="body2">{credit}</Typography>
                </Box>
              </Grid>
            )}

            {publisher && (
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BusinessIcon color="action" />
                  <Typography variant="subtitle2">Publisher:</Typography>
                  <Typography variant="body2">{publisher}</Typography>
                </Box>
              </Grid>
            )}
             {viewCount && (
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <VisibilityIcon color="action" />
                  <Typography variant="subtitle2">Views:</Typography>
                  <Typography variant="body2">{viewCount}</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
            <ArticleComments articleId={article._id} initialCollapsed={false} />
      {/* Different Source Articles Section */}
      {differentSourceArticles.length > 0 && (
        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <PublicIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" fontWeight="medium">
                Different Perspectives
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {differentSourceArticles.map(renderArticleCard)}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Hot Headlines Section */}
      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto",
            }}
          >
            <HotHeadlines />
          </Box>
        </CardContent>
      </Card>

      {/* More From Same Source Section */}
      {relatedArticles.length > 0 && (
        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <ArticleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" fontWeight="medium" sx={{ mr: 1 }}>
                More From
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {sourceDetails.source}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {relatedArticles.map(renderArticleCard)}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ReaderView;
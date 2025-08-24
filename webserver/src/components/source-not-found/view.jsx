
import PropTypes from "prop-types"

import { alpha, useTheme } from "@mui/material/styles"
import { Box, Paper, Button, Divider, Typography } from "@mui/material"
import { Article as ArticleIcon, Language as LanguageIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material"

const SourceNotFoundView = ({ sourceName, onNavigateBack, onNavigateToDashboard, onNavigateToSources }) => {
  const theme = useTheme()

  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 6 },
        textAlign: "center",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.error.main, 0.02),
      }}
      elevation={0}
    >
      <Box
        sx={{
          width: { xs: 80, sm: 120 },
          height: { xs: 80, sm: 120 },
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.error.main, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          mb: 3,
        }}
      >
        <ArticleIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: theme.palette.error.main }} />
      </Box>
      <Typography
        variant="h3"
        gutterBottom
        fontWeight="bold"
        color="error.main"
        sx={{ fontSize: { xs: "2rem", sm: "3rem" } }}
      >
        404
      </Typography>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
        Source Not Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{
          maxWidth: 500,
          mx: "auto",
          mb: 4,
          fontSize: { xs: "0.9rem", sm: "1rem" },
          px: { xs: 2, sm: 0 },
        }}
      >
        The news source &quot;{sourceName}&quot; could not be found in our database. It may have been removed, renamed,
        or never existed.
      </Typography>
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} justifyContent="center" mb={4}>
        <Button
          variant="contained"
          onClick={onNavigateToDashboard}
          startIcon={<ArrowBackIcon />}
          size="large"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Return to Dashboard
        </Button>
        <Button
          variant="outlined"
          onClick={onNavigateToSources}
          startIcon={<LanguageIcon />}
          size="large"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Browse All Sources
        </Button>
      </Box>
      <Divider sx={{ my: 4 }} />
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
        If you believe this is an error, please contact support or try searching for the source again.
      </Typography>
    </Paper>
  )
}

SourceNotFoundView.propTypes = {
  sourceName: PropTypes.string.isRequired,
  onNavigateBack: PropTypes.func,
  onNavigateToDashboard: PropTypes.func.isRequired,
  onNavigateToSources: PropTypes.func.isRequired,
}

export default SourceNotFoundView

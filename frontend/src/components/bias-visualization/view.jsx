
import PropTypes from "prop-types"

import { useTheme } from "@mui/material/styles"
import { Box, Chip, Typography } from "@mui/material"

const BiasVisualization = ({ sourceData, getBiasColor, getBiasBackgroundColor, getBiasScore }) => {
  const theme = useTheme()

  if (!sourceData?.mediaBias) return null

  const biasScore = getBiasScore(sourceData.mediaBias)
  const biasPosition = ((biasScore + 2) / 4) * 100

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Political Bias Classification
      </Typography>
      <Box sx={{ position: "relative", height: 40, mb: 2 }}>
        <Box
          sx={{
            height: 8,
            width: "100%",
            background: `linear-gradient(to right,
            ${theme.palette.error.dark} 0%,
            ${theme.palette.error.main} 25%,
            ${theme.palette.success.main} 50%,
            ${theme.palette.primary.main} 75%,
            ${theme.palette.primary.dark} 100%)`,
            borderRadius: 1,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -6,
              left: `${biasPosition}%`,
              transform: "translateX(-50%)",
              width: 20,
              height: 20,
              bgcolor: theme.palette.background.paper,
              border: `3px solid ${getBiasColor(sourceData.mediaBias)}`,
              borderRadius: "50%",
              boxShadow: theme.shadows[2],
            }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
            Far Left
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
            Center
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
            Far Right
          </Typography>
        </Box>
      </Box>
      <Chip
        label={sourceData.mediaBias}
        sx={{
          bgcolor: getBiasBackgroundColor(sourceData.mediaBias),
          color: getBiasColor(sourceData.mediaBias),
          fontWeight: "bold",
          fontSize: { xs: "0.7rem", sm: "0.8rem" },
        }}
      />
    </Box>
  )
}

BiasVisualization.propTypes = {
  sourceData: PropTypes.shape({
    mediaBias: PropTypes.string,
  }),
  getBiasColor: PropTypes.func.isRequired,
  getBiasBackgroundColor: PropTypes.func.isRequired,
  getBiasScore: PropTypes.func.isRequired,
}

export default BiasVisualization

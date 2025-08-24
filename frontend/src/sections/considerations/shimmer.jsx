import PropTypes from "prop-types"

import { Box, Skeleton } from "@mui/material"

const ShimmerEffect = ({ variant = "card" }) => {
  if (variant === "headline") {
    return (
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
      <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="80%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" />
    </Box>
  )
}

ShimmerEffect.propTypes = {
  variant: PropTypes.string,
}

export default ShimmerEffect

import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { InfoIcon, TrendingUp } from "lucide-react";

import { Box, Card, Chip, alpha, Tooltip, Skeleton, useTheme, Typography } from "@mui/material";

const BiasBar = ({ data }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay or loading state for fetching data
    if (data.length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800); // Short delay for better UX

      return () => clearTimeout(timer); // Cleanup on unmount or data change
    }
    return () => {};
  }, [data]);

  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="h6" gutterBottom>
          Media Bias Distribution
        </Typography>
        <Skeleton variant="rounded" height={45} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const leanLeft = data.find((item) => item.label === "lean left") || { count: 0 };
  const left = data.find((item) => item.label === "left") || { count: 0 };
  const center = data.find((item) => item.label === "center") || { count: 0 };
  const leanRight = data.find((item) => item.label === "lean right") || { count: 0 };
  const right = data.find((item) => item.label === "right") || { count: 0 };

  const leanLeftPercent = (leanLeft.count / total) * 100;
  const leftPercent = (left.count / total) * 100;
  const centerPercent = (center.count / total) * 100;
  const leanRightPercent = (leanRight.count / total) * 100;
  const rightPercent = (right.count / total) * 100;

  // Modern color palette
  const colors = {
    "lean left": theme.palette.primary.light,
    left: theme.palette.primary.dark,
    center: theme.palette.grey[500],
    "lean right": theme.palette.secondary.light,
    right: theme.palette.secondary.dark,
  };

  const formatPercentage = (percentage) => percentage.toFixed(1);

 

  const getLongLabel = (label) => {
    switch (label) {
      case "lean left":
        return "Lean Left";
      case "left":
        return "Left";
      case "center":
        return "Center";
      case "lean right":
        return "Lean Right";
      case "right":
        return "Right";
      default:
        return "";
    }
  };
// eslint-disable-next-line   
const CustomTooltip = ({ label, percentage, color }) => (
    <Box sx={{ p: 1, maxWidth: 200 }}>
      <Typography variant="subtitle2" sx={{ color: "inherit", mb: 0.5 }}>
        {getLongLabel(label)}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
        <Typography variant="body2">{formatPercentage(percentage)}% of articles</Typography>
      </Box>
    </Box>
  );
  
  // Prop validation for CustomTooltip
  CustomTooltip.propTypes = {
    label: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
  };
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mr: 1 }}>
          Media Bias Distribution
        </Typography>
        <Tooltip title="Shows the distribution of media bias in articles from the past 24 hours" placement="top">
          <InfoIcon size={16} style={{ opacity: 0.7, cursor: "help" }} />
        </Tooltip>
      </Box>

      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          color: theme.palette.text.secondary,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        Past 24 Hours
        <TrendingUp size={16} style={{ color: theme.palette.success.main }} />
      </Typography>

      {/* Main bias bar */}
      <Box
        sx={{
          height: "45px",
          borderRadius: "8px",
          display: "flex",
          overflow: "hidden",
          width: "100%",
          mb: 2,
          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        <Tooltip title={<CustomTooltip label="left" percentage={leftPercent} color={colors.left} />} arrow>
          <Box
            sx={{
              width: `${leftPercent}%`,
              backgroundColor: colors.left,
              height: "100%",
              transition: "width 0.5s ease, opacity 0.3s ease",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                opacity: 0.9,
                transform: "scale(1.02)",
                zIndex: 1,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            {leftPercent > 5 && "L"}
          </Box>
        </Tooltip>

        <Tooltip
          title={<CustomTooltip label="lean left" percentage={leanLeftPercent} color={colors["lean left"]} />}
          arrow
        >
          <Box
            sx={{
              width: `${leanLeftPercent}%`,
              backgroundColor: colors["lean left"],
              height: "100%",
              transition: "width 0.5s ease, opacity 0.3s ease",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                opacity: 0.9,
                transform: "scale(1.02)",
                zIndex: 1,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            {leanLeftPercent > 5 && "L-L"}
          </Box>
        </Tooltip>

        <Tooltip title={<CustomTooltip label="center" percentage={centerPercent} color={colors.center} />} arrow>
          <Box
            sx={{
              width: `${centerPercent}%`,
              backgroundColor: colors.center,
              height: "100%",
              transition: "width 0.5s ease, opacity 0.3s ease",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                opacity: 0.9,
                transform: "scale(1.02)",
                zIndex: 1,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            {centerPercent > 5 && "C"}
          </Box>
        </Tooltip>

        <Tooltip
          title={<CustomTooltip label="lean right" percentage={leanRightPercent} color={colors["lean right"]} />}
          arrow
        >
          <Box
            sx={{
              width: `${leanRightPercent}%`,
              backgroundColor: colors["lean right"],
              height: "100%",
              transition: "width 0.5s ease, opacity 0.3s ease",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                opacity: 0.9,
                transform: "scale(1.02)",
                zIndex: 1,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            {leanRightPercent > 5 && "L-R"}
          </Box>
        </Tooltip>

        <Tooltip title={<CustomTooltip label="right" percentage={rightPercent} color={colors.right} />} arrow>
          <Box
            sx={{
              width: `${rightPercent}%`,
              backgroundColor: colors.right,
              height: "100%",
              transition: "width 0.5s ease, opacity 0.3s ease",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                opacity: 0.9,
                transform: "scale(1.02)",
                zIndex: 1,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            {rightPercent > 5 && "R"}
          </Box>
        </Tooltip>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {[
          { label: "left", percent: leftPercent },
          { label: "lean left", percent: leanLeftPercent },
          { label: "center", percent: centerPercent },
          { label: "lean right", percent: leanRightPercent },
          { label: "right", percent: rightPercent },
        ].map((item) => (
          <Chip
            key={item.label}
            label={`${getLongLabel(item.label)} ${formatPercentage(item.percent)}%`}
            size="small"
            sx={{
              backgroundColor: alpha(colors[item.label], 0.1),
              color: colors[item.label],
              fontWeight: 500,
              border: `1px solid ${alpha(colors[item.label], 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(colors[item.label], 0.2),
              },
            }}
          />
        ))}
      </Box>
    </Card>
  );
};

// Prop validation
BiasBar.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOf(["lean left", "left", "center", "lean right", "right"]).isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default BiasBar;
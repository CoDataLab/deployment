"use client"

import PropTypes from "prop-types"

import { alpha, useTheme } from "@mui/material/styles"
import {
  Box,
  Paper,
  Table,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from "@mui/material"

export default function PodiumTable({ rankings }) {
  const theme = useTheme()

  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank)
  const top5Rankings = sortedRankings.slice(0, 5)
  const otherRankings = sortedRankings.slice(5) // Rankings from 6th onwards

  const getRowStyle = (rank) => {
    let backgroundColor = "transparent"
    let textColor = theme.palette.text.primary // Default text color

    if (rank === 1) {
      backgroundColor = alpha(theme.palette.warning.main, 0.9) // Gold-like with 90% opacity
    } else if (rank === 2) {
      backgroundColor = alpha(theme.palette.grey[400], 0.8) // Silver-like with 80% opacity
    } else if (rank === 3) {
      backgroundColor = alpha(theme.palette.error.main, 0.7) // Bronze-like with 70% opacity
    } else if (rank === 4) {
      backgroundColor = alpha(theme.palette.primary.light, 0.6) // Primary light with 60% opacity
    } else if (rank === 5) {
      backgroundColor = alpha(theme.palette.primary.light, 0.5) // Primary light with 50% opacity
    }

    // Ensure text color contrasts with the background
    textColor = theme.palette.getContrastText(backgroundColor)

    return {
      backgroundColor,
      color: textColor,
      fontWeight: rank <= 3 ? "bold" : "normal", // Make top 3 bold
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {top5Rankings.length > 0 && (
        <TableContainer component={Paper} elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: "bold" }}>
            Top 5 Rankings
          </Typography>
          <Table stickyHeader aria-label="top 5 rankings table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Source Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Overall Score
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {top5Rankings.map((row) => (
                <Tooltip
                  key={row.source}
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2">Neutrality: {row.neutrality_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Bias: {row.bias_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Type: {row.type_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Rate: {row.rate_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Category: {row.category_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Language: {row.language_score?.toFixed(2)}</Typography>
                    </Box>
                  }
                  arrow
                  placement="right"
                >
                  <TableRow
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      cursor: "pointer",
                      ...getRowStyle(row.rank),
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.rank}
                    </TableCell>
                    <TableCell>{row.source_name}</TableCell>
                    <TableCell align="right">{row.overall_score?.toFixed(2)}</TableCell>
                  </TableRow>
                </Tooltip>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {otherRankings.length > 0 && (
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: "bold" }}>
            Other Rankings
          </Typography>
          <Table size="small" aria-label="other rankings table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Source Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Overall Score
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {otherRankings.map((row) => (
                <Tooltip
                  key={row.source}
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2">Neutrality: {row.neutrality_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Bias: {row.bias_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Type: {row.type_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Rate: {row.rate_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Category: {row.category_score?.toFixed(2)}</Typography>
                      <Typography variant="body2">Language: {row.language_score?.toFixed(2)}</Typography>
                    </Box>
                  }
                  arrow
                  placement="right"
                >
                  <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 }, cursor: "pointer" }}>
                    <TableCell component="th" scope="row">
                      {row.rank}
                    </TableCell>
                    <TableCell>{row.source_name}</TableCell>
                    <TableCell align="right">{row.overall_score?.toFixed(2)}</TableCell>
                  </TableRow>
                </Tooltip>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {top5Rankings.length === 0 && otherRankings.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No rankings to display.
        </Typography>
      )}
    </Box>
  )
}

PodiumTable.propTypes = {
  rankings: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.number.isRequired,
      source_name: PropTypes.string.isRequired,
      overall_score: PropTypes.number,
      source: PropTypes.string.isRequired,
      neutrality_score: PropTypes.number,
      bias_score: PropTypes.number,
      type_score: PropTypes.number,
      rate_score: PropTypes.number,
      category_score: PropTypes.number,
      language_score: PropTypes.number,
    }),
  ).isRequired,
}

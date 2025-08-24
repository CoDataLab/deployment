import React from 'react';
import PropTypes from 'prop-types';

import { Box, Typography } from '@mui/material';

const ValueBar = ({ value }) => {
  if (typeof value !== 'number') {
    return <Typography align="center" color="error">Invalid value</Typography>;
  }

  const clampedValue = Math.max(-1, Math.min(1, value));
  
  const getColor = (val) => {
    if (val < -0.1) {
      return `rgba(255, 0, 0, ${1 + val})`; // Light red to dark red
    } 
    if (val >= -0.1 && val <= 0.1) {
      return 'grey'; // Neutral grey
    } 
    return `rgba(0, 128, 0, ${val})`; // Light green to dark green
  };

  const barStyle = {
    width: '100%',
    height: '20px',
    backgroundColor: getColor(clampedValue),
    borderRadius: '4px',
  };

  return (
    <Box>
      <div style={barStyle} />
      <Typography align="center">{value.toFixed(2)}</Typography>
    </Box>
  );
};

// Prop validation
ValueBar.propTypes = {
  value: PropTypes.number.isRequired,
};

export default ValueBar;
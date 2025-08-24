import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const VideoPlayer = ({ src }) => (
  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
    <video controls style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}>
      <source src={src} type="video/mp4" />
      <source src={src} type="video/avi" />
      <source src={src} type="video/mov" />
      <track kind="captions" srcLang="en" src="" label="English"/>
      Your browser does not support the video tag.
    </video>
    <Typography variant="body2" sx={{ position: 'absolute', bottom: 8, left: 8, color: 'white' }}>
      Video
    </Typography>
  </Box>
);

// Prop Types validation
VideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
};

export default VideoPlayer;
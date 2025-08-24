import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Link, TextField, Typography } from '@mui/material';

const formatTimeAgo = (timestamp) => new Date(timestamp).toLocaleDateString();
const validateLabel = (label) => label || 'Unknown';
const getLabelColor = (label) => (label > 0.5 ? 'red' : 'green');

export default function SearchResults({ articles }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article =>
    article.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAuthorName = (author) => {
    if (typeof author === 'object' && author !== null) {
      return author.name || 'Unknown Author';
    }
    return author || 'Unknown Author';
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Search by Headline"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={2}>
        {filteredArticles.map((article) => (
          <Grid item xs={12} sm={6} md={3} key={article._id}>  {/* Adjusted to 3 for 4 items per row */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 5,
                },
              }}
              onClick={() => navigate(`/dashboard/read/${article._id}`)}
            >
              <Box
                sx={{
                  mb: 1,
                  height: { xs: '200px', md: '250px' },
                  bgcolor: '#D3D3D3',
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  component="img"
                  src={article.imageUrl || '/assets/icons/components/ic_imgnotfound.svg'}
                  alt={article.headline}
                  sx={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{validateLabel(article.source)}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatTimeAgo(article.date)}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', height: '50px', overflow: 'hidden' }}>
                {article.headline}
              </Typography>
              <Typography
                variant="body2"
                paragraph
                sx={{
                  height: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {article.description || 'No description available.'}
              </Typography>
              <Typography variant="body2">
                <strong>Author:</strong> {getAuthorName(article.author)}
              </Typography>
              <Link href={article.articleUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  Read more
                </Typography>
              </Link>
              {article.label !== undefined && (
                <Box mt={2}>
                  <Box
                    sx={{
                      height: '10px',
                      width: '100%',
                      backgroundColor: getLabelColor(article.label),
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="body2" color="white" sx={{ textAlign: 'center', lineHeight: '10px' }}>
                      {article.label.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Prop validation
SearchResults.propTypes = {
  articles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      headline: PropTypes.string.isRequired,
      articleUrl: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.number.isRequired,
      imageUrl: PropTypes.string,
      source: PropTypes.string,
      author: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          uri: PropTypes.string,
        }),
      ]),
      label: PropTypes.number,
    })
  ).isRequired,
};
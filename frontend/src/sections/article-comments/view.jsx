import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

import { alpha } from '@mui/material/styles';
import { ChatBubbleOutline } from '@mui/icons-material';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Avatar,
  Divider,
  Collapse,
  TextField,
  Typography,
  CardContent,
  CircularProgress
} from '@mui/material';

import commentsService from 'src/services/commentService';

// Helper function to convert a two-letter country code to a flag emoji
const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) {
    return null; 
  }
  // Formula to convert ISO 3166-1 alpha-2 code to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const ArticleComments = ({ articleId, initialCollapsed = false }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentData, setCommentData] = useState({
    author: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [remainingComments, setRemainingComments] = useState(3);
  const [expanded, setExpanded] = useState(!initialCollapsed);

  const fetchComments = useCallback(async () => {
    try {
      const data = await commentsService.getArticleComments(articleId);
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const checkCommentLimit = useCallback(async () => {
    try {
      const data = await commentsService.checkLimit();
      if (data.success) {
        setRemainingComments(data.remainingComments);
      }
    } catch (error) {
      console.error('Error checking comment limit:', error);
    }
  }, []);

  useEffect(() => {
    if (articleId) {
      fetchComments();
      checkCommentLimit();
    }
  }, [articleId, fetchComments, checkCommentLimit]);

  const handleInputChange = (e) => {
    setCommentData({
      ...commentData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentData.author.trim() || !commentData.content.trim()) {
      setAlert({
        show: true,
        message: 'Please fill in both name and comment fields',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = await commentsService.saveComment(articleId, commentData);
      
      if (data.success) {
        setAlert({
          show: true,
          message: 'Comment added successfully!',
          severity: 'success'
        });
        setCommentData({ author: '', content: '' });
        setRemainingComments(data.remainingComments);
        fetchComments(); // Refetch comments to show the new one with its flag
      } else {
        setAlert({
          show: true,
          message: data.message || 'Error adding comment',
          severity: 'error'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: 'Error submitting comment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!articleId) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Article ID is required for comments
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Button
        onClick={() => setExpanded(!expanded)}
        startIcon={<ChatBubbleOutline />}
        sx={{ 
          mb: 2,
          bgcolor: expanded ? alpha('#000', 0.04) : 'transparent',
          '&:hover': {
            bgcolor: alpha('#000', 0.08)
          }
        }}
      >
        {expanded ? 'Hide People Voices' : `Show People Voices (${comments.length})`}
      </Button>
      
      <Collapse in={expanded}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave a Comment
            </Typography>
            
            {remainingComments > 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have {remainingComments} voice{remainingComments !== 1 ? 's' : ''} remaining today
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have reached your daily voices limit. Please try again tomorrow.
              </Alert>
            )}
            
            {alert.show && (
              <Alert 
                severity={alert.severity} 
                onClose={() => setAlert({ ...alert, show: false })}
                sx={{ mb: 2 }}
              >
                {alert.message}
              </Alert>
            )}
            
            <form onSubmit={handleSubmitComment}>
              <Stack spacing={2}>
                <TextField
                  name="author"
                  label="Your Name"
                  value={commentData.author}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={remainingComments === 0}
                  inputProps={{ maxLength: 50 }}
                  size="small"
                />
                
                <TextField
                  name="content"
                  label="Your Comment"
                  value={commentData.content}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  disabled={remainingComments === 0}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${commentData.content.length}/500 characters`}
                  size="small"
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || remainingComments === 0}
                  sx={{ alignSelf: 'flex-start' }}
                  size="small"
                >
                  {submitting ? <CircularProgress size={16} /> : 'Post Comment'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comments ({comments.length})
            </Typography>
            
            {(() => {
              if (loading) {
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                );
              }
              if (comments.length === 0) {
                return (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                );
              }
              return (
                <Stack spacing={2}>
                  {comments.map((comment, index) => (
                    <Box key={comment._id || index}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 32, 
                            height: 32,
                            fontSize: '0.875rem'
                          }}
                        >
                          {comment.author.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            alignItems="center" 
                            sx={{ mb: 0.5 }}
                          >
                            <Typography variant="subtitle2" component="span">
                              {comment.author}
                            </Typography>
                            
                            {/* Display the country flag */}
                            {comment.countryCode && getFlagEmoji(comment.countryCode) && (
                              <Box
                                component="span"
                                title={comment.country || comment.countryCode} // Show full country name on hover
                                sx={{ 
                                  ml: 0.5, 
                                  lineHeight: 1, 
                                  fontSize: '1rem',
                                  display: 'inline-block'
                                }}
                              >
                                {getFlagEmoji(comment.countryCode)}
                              </Box>
                            )}
                            
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(comment.createdAt)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                            {comment.content}
                          </Typography>
                        </Box>
                      </Stack>
                      {index < comments.length - 1 && (
                        <Divider sx={{ mt: 1.5 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              );
            })()}
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};

ArticleComments.propTypes = {
  articleId: PropTypes.string.isRequired,
  initialCollapsed: PropTypes.bool,
};

export default ArticleComments;
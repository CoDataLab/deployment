import { useNavigate } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';

import SearchIcon from '@mui/icons-material/Search';
// MUI icons
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import LanguageIcon from '@mui/icons-material/Language';
import DateRangeIcon from '@mui/icons-material/DateRange';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
// MUI components
import {
  Box,
  Grid,
  Card,
  Chip,
  Paper,
  Table,
  alpha,
  Alert,
  Button,
  Divider,
  Tooltip,
  TableRow,
  Snackbar,
  Skeleton,
  useTheme,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
} from '@mui/material';

// Services
import articlesService from 'src/services/articlesService';
import reportingService from 'src/services/reportingService';

// Components
import BiasBar from 'src/components/bias-bar';
import { useSettingsContext } from 'src/components/settings';
import TensionChart from 'src/components/line-chart/lineChart';

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

export default function ReportsView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const navigate = useNavigate();

  const [keywords, setKeywords] = useState([]);
  const [latestKeywords, setLatestKeywords] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [biasLoading, setBiasLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [keywordsLoading, setKeywordsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [articleData, setArticleData] = useState({
    days: 0,
    totalCount: 0,
    count: 0,
    distinctSourceCount: 0,
  });
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [biasData, setBiasData] = useState([]);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const cachedData = useRef(null);
  const cachedTime = useRef(null);

  const fetchArticlesCounts = async () => {
    try {
      const data = await articlesService.fetchArticlesCounts();
      setArticleData(data);
    } catch (err) {
      console.error(err);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to load article statistics');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchBiasDistribution = async () => {
    setBiasLoading(true);
    try {
      const data = await reportingService.getArticlesBiasDistribution();
      const { distribution } = data;

      // Filter out 'Unknown' and convert to the required format
      const filteredBiasData = Object.entries(distribution)
        .filter(([label]) => label !== 'Unknown')
        .map(([label, count]) => ({ label, count }));

      setBiasData(filteredBiasData);
    } catch (err) {
      console.error('Error fetching bias distribution:', err);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to load bias distribution data');
      setSnackbarOpen(true);
    } finally {
      setBiasLoading(false);
    }
  };

  useEffect(() => {
    setChartLoading(true);
    fetchLatestKeywords();
    fetchArticlesCounts();
    fetchBiasDistribution();
    
    // Simulate chart loading
    setTimeout(() => {
      setChartLoading(false);
    }, 1500);
  }, []);

  const handleKeywordClick = (keyword) => {
    if (startDate && endDate) {
      const startMillis = new Date(startDate).getTime();
      const endMillis = new Date(endDate).getTime();
      navigate(`/dashboard/related-articles?keyword=${keyword}&start=${startMillis}&end=${endMillis}`);
    } else {
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please select start and end dates first');
      setSnackbarOpen(true);
    }
  };

  const fetchLatestKeywords = async () => {
    setKeywordsLoading(true);
    try {
      const data = await reportingService.getLatestTopKeywords();
      setLatestKeywords(data.topKeywords || []);
      setKeywords(data.topKeywords || []);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
    } catch (fetchError) {
      console.error('Error fetching latest keywords:', fetchError);
      setSnackbarSeverity('error');
      setSnackbarMessage('Error fetching trending keywords');
      setSnackbarOpen(true);
    } finally {
      setKeywordsLoading(false);
    }
  };

  const handleFetch = async () => {
    if (startDate && endDate) {
      const startMillis = new Date(startDate).getTime();
      const endMillis = new Date(endDate).getTime();

      if (startMillis >= endMillis) {
        setSnackbarSeverity('warning');
        setSnackbarMessage('Start date must be earlier than end date');
        setSnackbarOpen(true);
        return;
      }

      const cacheKey = `${startMillis}-${endMillis}`;
      const now = Date.now();

      if (
        cachedData.current &&
        cachedData.current[cacheKey] &&
        cachedTime.current &&
        cachedTime.current[cacheKey] &&
        now - cachedTime.current[cacheKey] < CACHE_DURATION
      ) {
        console.log('Using cached data');
        setKeywords(cachedData.current[cacheKey]);
        setLatestKeywords(cachedData.current[cacheKey]);
        
        setSnackbarSeverity('info');
        setSnackbarMessage('Using cached keyword data');
        setSnackbarOpen(true);
        return;
      }

      setKeywordsLoading(true);
      try {
        const data = await reportingService.getTopKeywords(startMillis, endMillis);
        cachedData.current = {
          ...cachedData.current,
          [cacheKey]: data,
        };
        cachedTime.current = {
          ...cachedTime.current,
          [cacheKey]: now,
        };

        setKeywords(data || []);
        setLatestKeywords(data || []);
        
        setSnackbarSeverity('success');
        setSnackbarMessage('Keywords updated successfully');
        setSnackbarOpen(true);
      } catch (fetchError) {
        console.error('Error fetching keywords:', fetchError);
        setSnackbarSeverity('error');
        setSnackbarMessage(`Failed to fetch keywords: ${fetchError.message || 'Unknown error'}`);
        setSnackbarOpen(true);
      } finally {
        setKeywordsLoading(false);
      }
    } else {
      setSnackbarSeverity('warning');
      setSnackbarMessage('Please enter both start and end dates');
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setBiasLoading(true);
    setChartLoading(true);
    setKeywordsLoading(true);
    
    fetchArticlesCounts();
    fetchBiasDistribution();
    fetchLatestKeywords();
    
    setTimeout(() => {
      setChartLoading(false);
    }, 1500);
    
    setSnackbarSeverity('info');
    setSnackbarMessage('Refreshing all data...');
    setSnackbarOpen(true);
  };

  const maxCount = latestKeywords.length > 0 ? Math.max(...latestKeywords.map((item) => item.count)) : 0;

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const { days, count, distinctSourceCount } = articleData;

  const getHeatmapColor = (count1, max1Param) => {
    const intensity = (count1 / max1Param) * 100;
    // Use theme primary color with varying opacity
    return alpha(theme.palette.primary.main, 0.2 + (intensity * 0.8) / 100);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ py: 3 }}>
      {/* Header with refresh button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          News Analytics Dashboard
        </Typography>
        <Tooltip title="Refresh all data">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton variant="text" width="50%" height={30} />
                  <Skeleton variant="text" width="70%" height={60} />
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <NewspaperIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Articles Analyzed
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="primary.main">
                    {count.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Over the past {days} days
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton variant="text" width="50%" height={30} />
                  <Skeleton variant="text" width="70%" height={60} />
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LanguageIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Diverse Sources
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="primary.main">
                    {distinctSourceCount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Global news outlets and platforms
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton variant="text" width="50%" height={30} />
                  <Skeleton variant="text" width="70%" height={60} />
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Top Keyword Count
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="primary.main">
                    {maxCount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Mentions of the leading trend
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5">Balanced News Analysis</Typography>
            </Box>
            <Tooltip title="Our methodology ensures comprehensive global coverage across the political spectrum">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={80} />
          ) : (
            <Typography variant="body2" sx={{ mb: 3 }}>
              Using a carefully balanced methodology, we aggregated <strong><Box component="span" sx={{ color: 'primary.main' }}>{count.toLocaleString()}</Box></strong> articles 
              over the past <strong><Box component="span" sx={{ color: 'primary.main' }}>{days}</Box></strong> days from 
              <strong><Box component="span" sx={{ color: 'primary.main' }}> {distinctSourceCount.toLocaleString()}</Box></strong> diverse sources worldwide. 
              Our analysis considers perspectives across the spectrum—neutral, left-leaning, and right-leaning—ensuring 
              a comprehensive and unbiased overview from global news websites, Telegram, YouTube, independent blogs, and more.
            </Typography>
          )}
          
          <Typography variant="h6" mb={2}>Political Bias Distribution</Typography>
          
          {biasLoading ? (
            <Skeleton variant="rectangular" width="100%" height={120} />
          ) : (
            <BiasBar data={biasData} />
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary">
            We evaluate news sentiment using advanced AI features to provide insights.
            Our approach aims to remain unbiased and clear, ensuring that you receive accurate
            and informative analyses. We continuously strive to improve our methods and
            present data in a transparent manner.
          </Typography>
        </CardContent>
      </Card>

      {/* Tension Chart Card */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5">News Tension Index</Typography>
            </Box>
            <Chip 
              label={`${formatDate(startDate)} - ${formatDate(endDate)}`} 
              size="small" 
              icon={<DateRangeIcon />} 
              variant="outlined" 
            />
          </Box>
          
          {chartLoading ? (
            <Box sx={{ width: '100%' }}>
              <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="15%" />
              </Box>
            </Box>
          ) : (
            <TensionChart />
          )}
        </CardContent>
      </Card>

      {/* Keywords Card */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <SearchIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5">Trending Keywords</Typography>
            </Box>
            
            <Box>
              <TextField
                type="datetime-local"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ mr: 1 }}
              />
              <TextField
                type="datetime-local"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleFetch} 
                disabled={keywordsLoading}
                startIcon={<SearchIcon />}
              >
                {keywordsLoading ? 'Loading...' : 'Analyze'}
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Click on any keyword to view related articles
          </Typography>

          {keywordsLoading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
              {[...Array(15)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={60} animation="wave" />
              ))}
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: 2 
              }}
            >
              {latestKeywords.map((item) => (
                <Card
                  key={item.keyword}
                  onClick={() => handleKeywordClick(item.keyword)}
                  sx={{
                    backgroundColor: getHeatmapColor(item.count, maxCount),
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      backgroundColor: alpha(theme.palette.primary.main, 0.3 + (item.count / maxCount) * 0.7),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body1" fontWeight="medium">
                      {item.keyword}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.count} mentions
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Keyword Table */}
          <Typography variant="h6" gutterBottom>
            Top Keywords Ranking
          </Typography>
          
          <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell><Typography variant="subtitle2">Rank</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Keyword</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Mentions</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keywordsLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  keywords.slice(0, 5).map((item, index) => (
                    <TableRow key={item.keyword} hover>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          color={index === 0 ? 'primary' : 'default'} 
                          variant={index === 0 ? 'filled' : 'outlined'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          fontWeight={600 - (index * 100)} 
                          fontSize={18 - index}
                          color={index === 0 ? 'primary.main' : 'text.primary'}
                        >
                          {item.keyword}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.count.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          endIcon={<NavigateNextIcon />}
                          onClick={() => handleKeywordClick(item.keyword)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box textAlign="center">
            <Button 
              variant="outlined" 
              endIcon={<KeyboardArrowRightIcon />}
              onClick={() => navigate('/dashboard/keyword-analysis')}
            >
              View Full Analysis
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

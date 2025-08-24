import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';

import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import { NAV, FOOTER } from '../config-layout';

// ----------------------------------------------------------------------

export default function Footer({ 
  showLinks = true, 
  showNewsletter = false,
  customContent 
}) {
  const theme = useTheme();
  const settings = useSettingsContext();
  
  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const isNavMini = settings.themeLayout === 'mini';
  const lgUp = useResponsive('up', 'lg');
  const mdUp = useResponsive('up', 'md');



  const footerLinks = [
    { title: 'Schedule', url: '/dashboard/scheduler' },
    { title: 'Explore News', url: '/dashboard/considerations' },
    { title: 'Search', url: '/dashboard/search' },
    { title: 'Historical Events', url: '/dashboard/historicalEvents' },
    { title: 'E-journal', url: '/dashboard/ejournal' },
  ];



  const renderLinks = showLinks && (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 3 }}
      alignItems={{ xs: 'center', sm: 'flex-start' }}
    >
      {footerLinks.map((link) => (
        <Link
          key={link.title}
          href={link.url}
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            '&:hover': {
              color: theme.palette.primary.main,
              textDecoration: 'underline',
            },
          }}
        >
          {link.title}
        </Link>
      ))}
    </Stack>
  );

  const renderNewsletter = showNewsletter && (
    <Box sx={{ maxWidth: 300 }}>
      <Typography variant="subtitle2" gutterBottom>
        Subscribe to our newsletter
      </Typography>
      <Stack direction="row" spacing={1}>
        <Box
          component="input"
          placeholder="Enter your email"
          sx={{
            flex: 1,
            px: 2,
            py: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            fontSize: theme.typography.body2.fontSize,
            '&:focus': {
              outline: 'none',
              borderColor: theme.palette.primary.main,
            },
          }}
        />
        <IconButton
          size="small"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          <SvgColor src="/assets/icons/common/ic_send.svg" sx={{ width: 16, height: 16 }} />
        </IconButton>
      </Stack>
    </Box>
  );

  const renderContent = (
    <Container maxWidth="lg">
      <Stack spacing={2} >
        {/* Main Footer Content */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={3}
        >
          {/* Logo Section */}
          <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Logo />

          </Stack>

          {/* Links Section */}
          {mdUp && renderLinks}

          {/* Newsletter Section */}
          {renderNewsletter}

          {/* Custom Content */}
          {customContent}
        </Stack>

        {/* Mobile Links */}
        {!mdUp && (
          <>
            <Divider />
            {renderLinks}
          </>
        )}

        {/* Copyright Section */}
        <Divider />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Codatalab Inc. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Powered By Badis 
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );

  return (
    <AppBar
      position="static"
      component="footer"
      sx={{
        top: 'auto',
        bottom: 0,
        minHeight: FOOTER?.H_MOBILE || 200,
        mt: 'auto',
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          minHeight: FOOTER?.H_DESKTOP || 240,
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            borderTop: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          minHeight: 1,
          px: { lg: 5 },
          py: { xs: 3, lg: 4 },
          alignItems: 'flex-start',
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Footer.propTypes = {
  showLinks: PropTypes.bool,
  showNewsletter: PropTypes.bool,
  customContent: PropTypes.node,
};
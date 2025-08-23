import PropTypes from 'prop-types';

import { Stack, Typography, ListItemButton } from '@mui/material';

// ----------------------------------------------------------------------

export default function NotificationItem({ notification }) {
  return (
    <ListItemButton
      disableRipple
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      <Stack sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1">{notification.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          Estimation: {notification.estimation}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Created at: {new Date(notification.createdAt).toLocaleString()}
        </Typography>
      </Stack>
    </ListItemButton>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimation: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    isUnRead: PropTypes.bool,
  }),
};
import { useState, useEffect, useCallback } from 'react';

import tasksService from 'src/services/tasksService'; // Adjust the import path as needed
import { m } from 'framer-motion';

import {
  Tab,
  List,
  Tabs,
  Badge,
  Stack,
  Drawer,
  Divider,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import NotificationItem from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
];

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const drawer = useBoolean();
  const smUp = useResponsive('up', 'sm');
  const [currentTab, setCurrentTab] = useState('todo');
  const [notifications, setNotifications] = useState([]);

  const loadTasks = async () => {
    try {
      const data = await tasksService.fetchAllTasks();
      const formattedTasks = data.tasks.map(task => ({
        id: task._id,
        title: task.name,
        estimation: task.estimation,
        createdAt: task.createdAt,
        status: task.status,
        isUnRead: true, // Set initial read status
      }));
      setNotifications(formattedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
    loadTasks(); // Fetch tasks again when changing tabs
  }, []);

  const totalUnRead = notifications.filter((item) => item.isUnRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isUnRead: false })));
  };

  const renderList = (status) => (
    <Scrollbar>
      <List disablePadding>
        {notifications
          .filter(notification => {
            if (status === 'todo') return notification.status === 'TO DO';
            if (status === 'in-progress') return notification.status === 'In Progress';
            if (status === 'done') return notification.status === 'DONE'; 
            return false;
          })
          .map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
      </List>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        color={drawer.value ? 'success' : 'default'}
        onClick={drawer.onTrue}
      >
<Badge badgeContent={totalUnRead} color="error">
  <Iconify icon="mdi:note-text-outline" width={24} />
</Badge>

      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        PaperProps={{ sx: { width: 1, maxWidth: 650 } }}
      >
        <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Tasks
          </Typography>
          {!!totalUnRead && (
            <Tooltip title="Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
          {!smUp && (
            <IconButton onClick={drawer.onFalse}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          )}
        </Stack>

        <Divider />

        <Tabs value={currentTab} onChange={handleChangeTab}>
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              sx={{ mr: 3 }}
            />
          ))}
        </Tabs>

        <Divider />

        {renderList(currentTab)}

   
      </Drawer>
    </>
  );
}
"use client"

import PropTypes from "prop-types"
// FIX: Imported useCallback to memoize functions
import { useRef, useState, useEffect, useCallback } from "react"

import Box from "@mui/material/Box"
import Menu from "@mui/material/Menu"
import Stack from "@mui/material/Stack"
import AppBar from "@mui/material/AppBar"
import Slider from "@mui/material/Slider"
import Avatar from "@mui/material/Avatar"
import Toolbar from "@mui/material/Toolbar"
import MenuItem from "@mui/material/MenuItem"
import { useTheme } from "@mui/material/styles"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import PauseIcon from "@mui/icons-material/Pause"
import ListItemText from "@mui/material/ListItemText"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import SkipNextIcon from "@mui/icons-material/SkipNext"
import Replay10Icon from "@mui/icons-material/Replay10"
import Replay30Icon from "@mui/icons-material/Replay30"
import LinearProgress from "@mui/material/LinearProgress"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import Forward10Icon from "@mui/icons-material/Forward10"
import Forward30Icon from "@mui/icons-material/Forward30"
import QueueMusicIcon from "@mui/icons-material/QueueMusic"
import VisibilityIcon from "@mui/icons-material/Visibility"
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious"
// NEW: Added hide/show icons
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"

import { useResponsive } from "src/hooks/use-responsive"

import { bgBlur } from "src/theme/css"
import { NAV } from "src/layouts/config-layout"
import podcastService from "src/services/podcastService"

import { useSettingsContext } from "src/components/settings"

export const PLAYER_CONFIG = {
  // Layout dimensions
  FOOTER: {
    H_MOBILE: 80,
    H_DESKTOP: 90,
    H_DESKTOP_OFFSET: 90 - 16,
    // NEW: Hidden state height
    H_HIDDEN: 40,
  },

  // Player behavior
  BEHAVIOR: {
    AUTO_PLAY: false,
    VOLUME_DEFAULT: 1,
    SEEK_STEP: 10, // seconds
    SEEK_STEP_SMALL: 10, // seconds for small skip
    SEEK_STEP_LARGE: 30, // seconds for large skip
    VOLUME_STEP: 0.1,
    PRELOAD: "metadata", // 'none', 'metadata', 'auto'
    CROSSFADE_DURATION: 300, // milliseconds
    SKIP_SENSITIVITY: 0.5, // Mouse wheel sensitivity for skipping
    // NEW: Hide behavior
    HIDE_ANIMATION_DURATION: 300,
    REMEMBER_HIDE_STATE: true, // Remember hide state in localStorage
  },

  // UI sizing
  UI: {
    AVATAR_SIZE: {
      MOBILE: 32,
      DESKTOP: 40,
    },
    PLAY_BUTTON_SIZE: {
      MOBILE: 32,
      DESKTOP: 40,
    },
    SKIP_BUTTON_SIZE: {
      MOBILE: 28,
      DESKTOP: 32,
    },
    // NEW: Hide button size
    HIDE_BUTTON_SIZE: {
      MOBILE: 28,
      DESKTOP: 32,
    },
    SLIDER_HEIGHT: 6,
    PLAYLIST_MAX_HEIGHT: 300,
    PLAYLIST_WIDTH: 400,
    VOLUME_SLIDER_WIDTH: 80,
    PROGRESS_BAR_HEIGHT: 8,
  },

  // Typography
  TYPOGRAPHY: {
    TITLE_SIZE: {
      MOBILE: "0.8rem",
      DESKTOP: "0.9rem",
    },
    SUBTITLE_SIZE: {
      MOBILE: "0.7rem",
      DESKTOP: "0.75rem",
    },
    TIME_SIZE: {
      MOBILE: "0.65rem",
      DESKTOP: "0.7rem",
    },
  },

  // Animation
  ANIMATION: {
    TRANSITION_DURATION: 300,
    HOVER_SCALE: 1.05,
    BUTTON_PRESS_SCALE: 0.95,
  },

  // Responsive breakpoints
  BREAKPOINTS: {
    MOBILE_CONTROLS: "md", // Show mobile controls below this breakpoint
    FULL_CONTROLS: "lg", // Show full controls above this breakpoint
  },

  // Error handling
  ERROR: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // milliseconds
  },

  // Accessibility
  A11Y: {
    SKIP_DURATION: 30, // seconds
    ANNOUNCEMENT_DELAY: 500, // milliseconds
  },

  // Audio formats supported
  SUPPORTED_FORMATS: [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"],
}

// ----------------------------------------------------------------------

export default function PodcastPlayerFooter({
  showPlayer = true,
  autoPlay = PLAYER_CONFIG.BEHAVIOR.AUTO_PLAY,
  customContent,
  config = PLAYER_CONFIG, // Allow config override
}) {
  const theme = useTheme()
  const settings = useSettingsContext()
  const audioRef = useRef(null)
  const progressBarRef = useRef(null)
  const isNavHorizontal = settings.themeLayout === "horizontal"
  const isNavMini = settings.themeLayout === "mini"
  const lgUp = useResponsive("up", "lg")
  const mdUp = useResponsive("up", config.BREAKPOINTS.MOBILE_CONTROLS)

  // State management
  const [podcasts, setPodcasts] = useState([])
  const [currentPodcast, setCurrentPodcast] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(config.BEHAVIOR.VOLUME_DEFAULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playlistAnchor, setPlaylistAnchor] = useState(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [bufferedRanges, setBufferedRanges] = useState([])

  // NEW: Hide state management
  const [isPlayerHidden, setIsPlayerHidden] = useState(() => {
    if (config.BEHAVIOR.REMEMBER_HIDE_STATE && typeof window !== "undefined") {
      const saved = localStorage.getItem("podcast-player-hidden")
      return saved === "true"
    }
    return false
  })

  // NEW: Save hide state to localStorage
  useEffect(() => {
    if (config.BEHAVIOR.REMEMBER_HIDE_STATE && typeof window !== "undefined") {
      localStorage.setItem("podcast-player-hidden", isPlayerHidden.toString())
    }
  }, [isPlayerHidden, config.BEHAVIOR.REMEMBER_HIDE_STATE])

  // Fetch podcasts on component mount
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true)
        const data = await podcastService.fetchAllPodcasts()
        setPodcasts(data)
        if (data.length > 0) {
          setCurrentPodcast(data[0])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPodcasts()
  }, [])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return undefined
    }

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
    }

    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)

    const updateBuffered = () => {
      const { buffered } = audio
      const ranges = []
      for (let i = 0; i < buffered.length; i += 1) {
        ranges.push({
          start: buffered.start(i),
          end: buffered.end(i),
        })
      }
      setBufferedRanges(ranges)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setIsBuffering(false)
      const currentIndex = podcasts.findIndex((p) => p._id === currentPodcast._id)
      if (currentIndex < podcasts.length - 1) {
        setCurrentPodcast(podcasts[currentIndex + 1])
        setIsPlaying(autoPlay)
      }
    }

    audio.volume = volume
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("playing", handlePlaying)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("progress", updateBuffered)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("playing", handlePlaying)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("progress", updateBuffered)
    }
  }, [currentPodcast, podcasts, autoPlay, volume, isDragging])

  // FIX: Wrapped control functions in useCallback to prevent re-creation on every render.
  // This stabilizes them for the keyboard shortcut useEffect dependency array.
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentPodcast) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [currentPodcast, isPlaying])

  // NEW: Toggle hide function with same pattern as other controls
  const togglePlayerVisibility = useCallback(() => {
    setIsPlayerHidden((prev) => !prev)
  }, [])

  const handleSeek = (event, newValue) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = newValue
      setCurrentTime(newValue)
    }
  }

  const handleSeekStart = () => {
    setIsDragging(true)
  }

  const handleSeekEnd = () => {
    setIsDragging(false)
  }

  const handleVolumeChange = useCallback((event, newValue) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = newValue
      setVolume(newValue)
    }
  }, []) // No dependencies needed as audioRef and setVolume are stable

  const skipForward = useCallback(
    (seconds = config.BEHAVIOR.SEEK_STEP) => {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = Math.min(audio.currentTime + seconds, duration)
      }
    },
    [duration, config.BEHAVIOR.SEEK_STEP],
  )

  const skipBackward = useCallback(
    (seconds = config.BEHAVIOR.SEEK_STEP) => {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = Math.max(audio.currentTime - seconds, 0)
      }
    },
    [config.BEHAVIOR.SEEK_STEP],
  )

useEffect(() => {
  const handleKeyDown = (event) => {
    if (!currentPodcast) return

    // Check for Ctrl + Space combination
    if (event.code === "Space" && event.ctrlKey) {
      event.preventDefault()
      togglePlayPause()
      return
    }

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault()
        skipBackward()
        break
      case "ArrowRight":
        event.preventDefault()
        skipForward()
        break
      case "ArrowUp":
        event.preventDefault()
        handleVolumeChange(null, Math.min(volume + config.BEHAVIOR.VOLUME_STEP, 1))
        break
      case "ArrowDown":
        event.preventDefault()
        handleVolumeChange(null, Math.max(volume - config.BEHAVIOR.VOLUME_STEP, 0))
        break
      case "h":
      case "H":
        event.preventDefault()
        togglePlayerVisibility()
        break
      default:
        break
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [
  currentPodcast,
  volume,
  togglePlayPause,
  skipBackward,
  skipForward,
  handleVolumeChange,
  togglePlayerVisibility,
  config.BEHAVIOR.VOLUME_STEP,
])


  const skipToNext = () => {
    const currentIndex = podcasts.findIndex((p) => p._id === currentPodcast._id)
    if (currentIndex < podcasts.length - 1) {
      setCurrentPodcast(podcasts[currentIndex + 1])
      setIsPlaying(false)
    }
  }

  const skipToPrevious = () => {
    const currentIndex = podcasts.findIndex((p) => p._id === currentPodcast._id)
    if (currentIndex > 0) {
      setCurrentPodcast(podcasts[currentIndex - 1])
      setIsPlaying(false)
    }
  }

  const selectPodcast = (podcast) => {
    setCurrentPodcast(podcast)
    setIsPlaying(false)
    setPlaylistAnchor(null)
  }

  const formatTime = (time) => {
    if (Number.isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const renderPlayButtonIcon = (styleProps, linearProgressSize) => {
    if (isBuffering) {
      return <LinearProgress size={linearProgressSize} />
    }
    if (isPlaying) {
      return <PauseIcon sx={styleProps} />
    }
    return <PlayArrowIcon sx={styleProps} />
  }

  const renderProgressBar = () => (
    <Box sx={{ position: "relative", width: "100%" }}>
      {bufferedRanges.map((range, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: `${(range.start / duration) * 100}%`,
            width: `${((range.end - range.start) / duration) * 100}%`,
            height: config.UI.PROGRESS_BAR_HEIGHT,
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            zIndex: 1,
          }}
        />
      ))}
      <Slider
        ref={progressBarRef}
        value={currentTime}
        max={duration || 100}
        onChange={handleSeek}
        onChangeCommitted={handleSeekEnd}
        onMouseDown={handleSeekStart}
        onTouchStart={handleSeekStart}
        sx={{
          position: "relative",
          zIndex: 2,
          height: config.UI.PROGRESS_BAR_HEIGHT,
          "& .MuiSlider-thumb": {
            width: 16,
            height: 16,
            transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
            "&:hover": {
              transform: `scale(${config.ANIMATION.HOVER_SCALE})`,
              boxShadow: `0 0 0 8px ${theme.palette.primary.main}20`,
            },
            "&.Mui-active": {
              transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})`,
            },
          },
          "& .MuiSlider-track": {
            height: config.UI.PROGRESS_BAR_HEIGHT,
            borderRadius: config.UI.PROGRESS_BAR_HEIGHT / 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          },
          "& .MuiSlider-rail": {
            height: config.UI.PROGRESS_BAR_HEIGHT,
            borderRadius: config.UI.PROGRESS_BAR_HEIGHT / 2,
            backgroundColor: theme.palette.divider,
          },
        }}
        size="small"
      />
    </Box>
  )

  const renderPlaylistMenu = (
    <Menu
      anchorEl={playlistAnchor}
      open={Boolean(playlistAnchor)}
      onClose={() => setPlaylistAnchor(null)}
      PaperProps={{
        sx: {
          maxHeight: config.UI.PLAYLIST_MAX_HEIGHT,
          width: config.UI.PLAYLIST_WIDTH,
          transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
        },
      }}
    >
      {podcasts.map((podcast) => (
        <MenuItem
          key={podcast._id}
          onClick={() => selectPodcast(podcast)}
          selected={currentPodcast?._id === podcast._id}
          sx={{
            "&:hover": {
              transform: `scale(${config.ANIMATION.HOVER_SCALE})`,
              transition: `transform ${config.ANIMATION.TRANSITION_DURATION}ms`,
            },
          }}
        >
          <ListItemAvatar>
            <Avatar
              src={podcast.coverArtUrl}
              alt={podcast.title}
              sx={{
                width: config.UI.AVATAR_SIZE.MOBILE,
                height: config.UI.AVATAR_SIZE.MOBILE,
              }}
            >
              {podcast.title.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={podcast.title}
            secondary={podcast.author}
            primaryTypographyProps={{
              noWrap: true,
              fontSize: config.TYPOGRAPHY.TITLE_SIZE.MOBILE,
            }}
            secondaryTypographyProps={{
              noWrap: true,
              fontSize: config.TYPOGRAPHY.SUBTITLE_SIZE.MOBILE,
            }}
          />
        </MenuItem>
      ))}
    </Menu>
  )

  // NEW: Render hide button with consistent styling
  const renderHideButton = (
    <IconButton
      onClick={togglePlayerVisibility}
      size="small"
      sx={{
        width: mdUp ? config.UI.HIDE_BUTTON_SIZE.DESKTOP : config.UI.HIDE_BUTTON_SIZE.MOBILE,
        height: mdUp ? config.UI.HIDE_BUTTON_SIZE.DESKTOP : config.UI.HIDE_BUTTON_SIZE.MOBILE,
        transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
        "&:hover": {
          transform: `scale(${config.ANIMATION.HOVER_SCALE})`,
          backgroundColor: theme.palette.action.hover,
        },
        "&:active": {
          transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})`,
        },
      }}
      title={isPlayerHidden ? "Show player controls" : "Hide player controls"}
    >
      {isPlayerHidden ? (
        <VisibilityIcon sx={{ fontSize: mdUp ? 18 : 16 }} />
      ) : (
        <VisibilityOffIcon sx={{ fontSize: mdUp ? 18 : 16 }} />
      )}
    </IconButton>
  )

  // NEW: Render minimal hidden state
  const renderHiddenState = showPlayer && currentPodcast && (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        flex: 1,
        transition: `all ${config.BEHAVIOR.HIDE_ANIMATION_DURATION}ms`,
      }}
    >
      <Avatar
        src={currentPodcast.coverArtUrl}
        alt={currentPodcast.title}
        sx={{
          width: config.UI.AVATAR_SIZE.MOBILE,
          height: config.UI.AVATAR_SIZE.MOBILE,
        }}
      >
        {currentPodcast.title.charAt(0)}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontSize: config.TYPOGRAPHY.TITLE_SIZE.MOBILE,
            fontWeight: 500,
          }}
        >
          {currentPodcast.title}
        </Typography>
      </Box>

      <IconButton
        onClick={togglePlayPause}
        disabled={loading || isBuffering}
        size="small"
        sx={{
          width: config.UI.PLAY_BUTTON_SIZE.MOBILE,
          height: config.UI.PLAY_BUTTON_SIZE.MOBILE,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        }}
      >
        {renderPlayButtonIcon({ fontSize: 16 }, 16)}
      </IconButton>

      {renderHideButton}
    </Stack>
  )

  const renderPlayerControls = showPlayer && currentPodcast && !isPlayerHidden && (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          minWidth: 0,
          flex: mdUp ? "0 0 250px" : 1,
          transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
        }}
      >
        <Avatar
          src={currentPodcast.coverArtUrl}
          alt={currentPodcast.title}
          sx={{
            width: mdUp ? config.UI.AVATAR_SIZE.DESKTOP : config.UI.AVATAR_SIZE.MOBILE,
            height: mdUp ? config.UI.AVATAR_SIZE.DESKTOP : config.UI.AVATAR_SIZE.MOBILE,
            transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
          }}
        >
          {currentPodcast.title.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontSize: mdUp ? config.TYPOGRAPHY.TITLE_SIZE.DESKTOP : config.TYPOGRAPHY.TITLE_SIZE.MOBILE,
              fontWeight: 500,
            }}
          >
            {currentPodcast.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{
              fontSize: mdUp ? config.TYPOGRAPHY.SUBTITLE_SIZE.DESKTOP : config.TYPOGRAPHY.SUBTITLE_SIZE.MOBILE,
            }}
          >
            {currentPodcast.author}
          </Typography>
        </Box>
      </Stack>

      {mdUp && (
        <Stack alignItems="center" spacing={0.5} sx={{ flex: 1, maxWidth: 500 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={skipToPrevious}
              disabled={loading || podcasts.findIndex((p) => p._id === currentPodcast._id) === 0}
              size="small"
              sx={{
                width: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                height: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
              }}
            >
              <SkipPreviousIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              onClick={() => skipBackward(config.BEHAVIOR.SEEK_STEP_LARGE)}
              disabled={loading}
              size="small"
              sx={{
                width: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                height: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
              }}
            >
              <Replay30Icon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              onClick={() => skipBackward(config.BEHAVIOR.SEEK_STEP_SMALL)}
              disabled={loading}
              size="small"
              sx={{
                width: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                height: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
              }}
            >
              <Replay10Icon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              onClick={togglePlayPause}
              disabled={loading || isBuffering}
              size="small"
              sx={{
                width: config.UI.PLAY_BUTTON_SIZE.DESKTOP,
                height: config.UI.PLAY_BUTTON_SIZE.DESKTOP,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { bgcolor: theme.palette.primary.dark, transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
                "&:disabled": { bgcolor: theme.palette.action.disabled },
              }}
            >
              {renderPlayButtonIcon({ fontSize: 20 }, 20)}
            </IconButton>
            <IconButton
              onClick={() => skipForward(config.BEHAVIOR.SEEK_STEP_SMALL)}
              disabled={loading}
              size="small"
              sx={{
                width: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                height: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
              }}
            >
              <Forward10Icon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              onClick={() => skipForward(config.BEHAVIOR.SEEK_STEP_LARGE)}
              disabled={loading}
              size="small"
              sx={{
                width: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                height: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
              }}
            >
              <Forward30Icon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              onClick={skipToNext}
              disabled={loading || podcasts.findIndex((p) => p._id === currentPodcast._id) === podcasts.length - 1}
              size="small"
              sx={{
                width: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                height: config.UI.SKIP_BUTTON_SIZE.DESKTOP,
                transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
                "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
                "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
              }}
            >
              <SkipNextIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{ minWidth: 40, fontSize: config.TYPOGRAPHY.TIME_SIZE.DESKTOP, fontFamily: "monospace" }}
            >
              {formatTime(currentTime)}
            </Typography>
            {renderProgressBar()}
            <Typography
              variant="caption"
              sx={{ minWidth: 40, fontSize: config.TYPOGRAPHY.TIME_SIZE.DESKTOP, fontFamily: "monospace" }}
            >
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Stack>
      )}

      <Stack direction="row" alignItems="center" spacing={1}>
        {mdUp && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <VolumeUpIcon sx={{ width: 16, height: 16, color: "text.secondary" }} />
            <Slider
              value={volume}
              max={1}
              step={config.BEHAVIOR.VOLUME_STEP}
              onChange={handleVolumeChange}
              sx={{ width: config.UI.VOLUME_SLIDER_WIDTH, height: config.UI.SLIDER_HEIGHT }}
              size="small"
            />
          </Stack>
        )}
        <IconButton
          onClick={(e) => setPlaylistAnchor(e.currentTarget)}
          size="small"
          sx={{
            width: config.UI.PLAY_BUTTON_SIZE.MOBILE,
            height: config.UI.PLAY_BUTTON_SIZE.MOBILE,
            transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms`,
            "&:hover": { transform: `scale(${config.ANIMATION.HOVER_SCALE})` },
            "&:active": { transform: `scale(${config.ANIMATION.BUTTON_PRESS_SCALE})` },
          }}
        >
          <QueueMusicIcon sx={{ fontSize: 18 }} />
        </IconButton>
        {/* NEW: Hide button added to controls */}
        {renderHideButton}
      </Stack>
    </Stack>
  )

  const renderMobileControls = !mdUp && showPlayer && currentPodcast && !isPlayerHidden && (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
        <IconButton
          onClick={skipToPrevious}
          disabled={loading || podcasts.findIndex((p) => p._id === currentPodcast._id) === 0}
          size="small"
          sx={{ width: config.UI.SKIP_BUTTON_SIZE.MOBILE, height: config.UI.SKIP_BUTTON_SIZE.MOBILE }}
        >
          <SkipPreviousIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          onClick={() => skipBackward(config.BEHAVIOR.SEEK_STEP_SMALL)}
          disabled={loading}
          size="small"
          sx={{ width: config.UI.SKIP_BUTTON_SIZE.MOBILE, height: config.UI.SKIP_BUTTON_SIZE.MOBILE }}
        >
          <Replay10Icon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          onClick={togglePlayPause}
          disabled={loading || isBuffering}
          size="small"
          sx={{
            width: config.UI.PLAY_BUTTON_SIZE.MOBILE,
            height: config.UI.PLAY_BUTTON_SIZE.MOBILE,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": { bgcolor: theme.palette.primary.dark },
          }}
        >
          {renderPlayButtonIcon({ width: 16, height: 16 }, 16)}
        </IconButton>
        <IconButton
          onClick={() => skipForward(config.BEHAVIOR.SEEK_STEP_SMALL)}
          disabled={loading}
          size="small"
          sx={{ width: config.UI.SKIP_BUTTON_SIZE.MOBILE, height: config.UI.SKIP_BUTTON_SIZE.MOBILE }}
        >
          <Forward10Icon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          onClick={skipToNext}
          disabled={loading || podcasts.findIndex((p) => p._id === currentPodcast._id) === podcasts.length - 1}
          size="small"
          sx={{ width: config.UI.SKIP_BUTTON_SIZE.MOBILE, height: config.UI.SKIP_BUTTON_SIZE.MOBILE }}
        >
          <SkipNextIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="caption"
          sx={{ minWidth: 35, fontSize: config.TYPOGRAPHY.TIME_SIZE.MOBILE, fontFamily: "monospace" }}
        >
          {formatTime(currentTime)}
        </Typography>
        {renderProgressBar()}
        <Typography
          variant="caption"
          sx={{ minWidth: 35, fontSize: config.TYPOGRAPHY.TIME_SIZE.MOBILE, fontFamily: "monospace" }}
        >
          {formatTime(duration)}
        </Typography>
      </Stack>
    </Stack>
  )

  const renderContent = (
    <Container maxWidth="lg">
      <Stack spacing={0.5}>
        {(loading || isBuffering) && (
          <LinearProgress sx={{ height: 2, transition: `all ${config.ANIMATION.TRANSITION_DURATION}ms` }} />
        )}
        {error && (
          <Typography
            variant="caption"
            color="error"
            align="center"
            sx={{ fontSize: config.TYPOGRAPHY.SUBTITLE_SIZE.MOBILE }}
          >
            {error}
          </Typography>
        )}
        <Stack direction={{ xs: "column", md: "row" }} alignItems="center" spacing={1}>
          {/* NEW: Conditional rendering based on hide state */}
          {isPlayerHidden ? renderHiddenState : renderPlayerControls}
          {customContent}
        </Stack>
        {renderMobileControls}
        {currentPodcast && (
          <audio ref={audioRef} src={currentPodcast.audioUrl} preload={config.BEHAVIOR.PRELOAD} crossOrigin="anonymous">
            <track kind="captions" srcLang="en" label="English captions" default />
            Your browser does not support the audio element.
          </audio>
        )}
      </Stack>
    </Container>
  )

  return (
    <>
      <AppBar
        position="fixed"
        component="footer"
        sx={{
          top: "auto",
          bottom: 0,
          // NEW: Dynamic height based on hide state
          minHeight: isPlayerHidden ? config.FOOTER.H_HIDDEN : config.FOOTER.H_MOBILE,
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          transition: theme.transitions.create(["height", "min-height"], {
            duration: config.BEHAVIOR.HIDE_ANIMATION_DURATION,
          }),
          ...(lgUp && {
            width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
            minHeight: isPlayerHidden ? config.FOOTER.H_HIDDEN : config.FOOTER.H_DESKTOP,
            ...(isNavHorizontal && {
              width: 1,
              bgcolor: "background.default",
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
            px: { lg: 3 },
            py: { xs: 0.5, lg: 0.5 },
            alignItems: "center",
            transition: `all ${config.BEHAVIOR.HIDE_ANIMATION_DURATION}ms`,
          }}
        >
          {renderContent}
        </Toolbar>
      </AppBar>
      {renderPlaylistMenu}
    </>
  )
}

PodcastPlayerFooter.propTypes = {
  showPlayer: PropTypes.bool,
  autoPlay: PropTypes.bool,
  customContent: PropTypes.node,
  config: PropTypes.object,
}

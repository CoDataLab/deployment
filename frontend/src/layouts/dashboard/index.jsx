import PropTypes from "prop-types"

import Box from "@mui/material/Box"

import { useBoolean } from "src/hooks/use-boolean"
import { useResponsive } from "src/hooks/use-responsive"

import { useSettingsContext } from "src/components/settings"
import PodcastPlayerFooter from "src/components/podcast-player/view"

import Main from "./main"
import Header from "./header"
import Footer from "./footer"
import NavMini from "./nav-mini"
import NavVertical from "./nav-vertical"
import NavHorizontal from "./nav-horizontal"

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext()
  const lgUp = useResponsive("up", "lg")
  const nav = useBoolean()

  const isHorizontal = settings.themeLayout === "horizontal"
  const isMini = settings.themeLayout === "mini"

  const renderNavMini = <NavMini />
  const renderHorizontal = <NavHorizontal />
  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />

    const renderFooter = <Footer showSocial showLinks />;

  // Render podcast player footer with original footer content as custom content
  const renderPodcastFooter = (
    <PodcastPlayerFooter showPlayer autoPlay={false}  />
  )


  if (isHorizontal) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />
        {lgUp ? renderHorizontal : renderNavVertical}
        <Main>{children}</Main>
        {renderPodcastFooter}
        {renderFooter}
      </>
    )
  }

  if (isMini) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />
        <Box
          sx={{
            minHeight: 1,
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 1,
            }}
          >
            <Main>{children}</Main>
            {renderPodcastFooter}
            {renderFooter}
          </Box>
        </Box>
      </>
    )
  }

  return (
    <>
      <Header onOpenNav={nav.onTrue} />
      <Box
        sx={{
          minHeight: 1,
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {renderNavVertical}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 1,
          }}
        >
          <Main>{children}</Main>
          {renderPodcastFooter}
          {renderFooter}
        </Box>
      </Box>
    </>
  )
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
}

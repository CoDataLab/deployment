import { Helmet } from 'react-helmet-async';

import PodcastsView from 'src/sections/podcasts/view';

// ----------------------------------------------------------------------

export default function PodcastsPage() {
  return (
    <>
      <Helmet>
        <title>Podcasts</title>
      </Helmet>

      <PodcastsView />
    </>
  );
}

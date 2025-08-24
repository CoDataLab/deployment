import { Helmet } from 'react-helmet-async';

import SourcesView from 'src/sections/sources/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Feed Sources Management</title>
      </Helmet>

      <SourcesView />
    </>
  );
}

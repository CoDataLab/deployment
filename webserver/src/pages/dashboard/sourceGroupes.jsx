import { Helmet } from 'react-helmet-async';

import SourceGroupsView from 'src/sections/sourceGroupes/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Sources Group Management</title>
      </Helmet>

      <SourceGroupsView />
    </>
  );
}

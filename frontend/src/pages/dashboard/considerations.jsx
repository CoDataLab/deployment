import { Helmet } from 'react-helmet-async';

import ConsiderationsView from 'src/sections/considerations/view';
// ----------------------------------------------------------------------

export default function ConsiderationsPage() {
  return (
    <>
      <Helmet>
        <title> Considerations Page</title>
      </Helmet>

      <ConsiderationsView />
    </>
  );
}

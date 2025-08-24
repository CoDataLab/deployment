import { Helmet } from 'react-helmet-async';

import SourceAnalysis from 'src/sections/source-analysis/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Feed Sources Management</title>
      </Helmet>

      <SourceAnalysis />
    </>
  );
}

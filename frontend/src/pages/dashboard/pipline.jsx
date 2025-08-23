import { Helmet } from 'react-helmet-async';

import PipelineView from 'src/sections/pipeline/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Pipeline</title>
      </Helmet>

      <PipelineView />
    </>
  );
}

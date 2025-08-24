import { Helmet } from 'react-helmet-async';

import WorkerView from 'src/sections/worker/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Worker</title>
      </Helmet>

      <WorkerView />
    </>
  );
}

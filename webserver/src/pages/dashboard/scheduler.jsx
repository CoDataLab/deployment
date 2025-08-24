import { Helmet } from 'react-helmet-async';

import SchedulerView from 'src/sections/scheduler/view';
// ----------------------------------------------------------------------

export default function SchedulerPage() {
  return (
    <>
      <Helmet>
        <title>Scheduler</title>
      </Helmet>

      <SchedulerView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import RealTimeEventsExecution from 'src/sections/real-time-event/view';
// ----------------------------------------------------------------------

export default function RealTimeEventsPage() {
  return (
    <>
      <Helmet>
        <title>Live Events</title>
      </Helmet>

      < RealTimeEventsExecution/>
    </>
  );
}

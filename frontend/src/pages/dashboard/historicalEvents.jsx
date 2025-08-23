import { Helmet } from 'react-helmet-async';

import HistoricalEventsView from 'src/sections/historicalEvents/view';
// ----------------------------------------------------------------------

export default function HistoricalEventsPage() {
  return (
    <>
      <Helmet>
        <title> Historical Events</title>
      </Helmet>

      <HistoricalEventsView />
    </>
  );
}

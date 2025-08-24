import { Helmet } from 'react-helmet-async';

import MonitorView from 'src/sections/monitor/view';
// ----------------------------------------------------------------------

export default function MonitorPage() {
  return (
    <>
      <Helmet>
        <title> Monitor </title>
      </Helmet>

      <MonitorView />
    </>
  );

}

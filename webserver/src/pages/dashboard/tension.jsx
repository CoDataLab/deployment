import { Helmet } from 'react-helmet-async';

import TensionView from 'src/sections/tension/view';
// ----------------------------------------------------------------------

export default function TasksPage() {
  return (
    <>
      <Helmet>
        <title> Tension </title>
      </Helmet>

      <TensionView />
    </>
  );
}

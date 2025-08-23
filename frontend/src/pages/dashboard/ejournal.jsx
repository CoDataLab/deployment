import { Helmet } from 'react-helmet-async';

import EjournalView from 'src/sections/ejournal/view';
// ----------------------------------------------------------------------

export default function TasksPage() {
  return (
    <>
      <Helmet>
        <title> E-Journal </title>
      </Helmet>

      <EjournalView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import ReaderView from 'src/sections/reader/view';
// ----------------------------------------------------------------------

export default function TasksPage() {
  return (
    <>
      <Helmet>
        <title> Read Article </title>
      </Helmet>

      <ReaderView />
    </>
  );
}

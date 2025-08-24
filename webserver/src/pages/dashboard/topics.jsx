import { Helmet } from 'react-helmet-async';

import TopicsView from 'src/sections/topics/view';

// ----------------------------------------------------------------------

export default function TopicsPage() {
  return (
    <>
      <Helmet>
        <title> Topics </title>
      </Helmet>

      <TopicsView />
    </>
  );
}

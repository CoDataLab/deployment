import { Helmet } from 'react-helmet-async';

import SearchSection from 'src/sections/search/view';
// ----------------------------------------------------------------------

export default function TasksPage() {
  return (
    <>
      <Helmet>
        <title> Custom Search </title>
      </Helmet>

      <SearchSection />
    </>
  );
}

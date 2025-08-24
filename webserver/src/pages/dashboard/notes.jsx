import { Helmet } from 'react-helmet-async';

import NotesView from 'src/sections/notes/view';

// ----------------------------------------------------------------------

export default function NotesPage() {
  return (
    <>
      <Helmet>
        <title>Notes</title>
      </Helmet>

      <NotesView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import PdfGathererView from 'src/sections/pdfGather/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Pdf Gatherer</title>
      </Helmet>

      <PdfGathererView />
    </>
  );
}

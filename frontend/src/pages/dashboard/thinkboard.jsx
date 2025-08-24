import { Helmet } from 'react-helmet-async';

import SourceAnalysis from 'src/sections/source-analysis/view';

// ----------------------------------------------------------------------

export default function ThinkBoardPage() {
  return (
    <>
      <Helmet>
        <title> ThinkBoard </title>
      </Helmet>

      <SourceAnalysis />
    </>
  );
}

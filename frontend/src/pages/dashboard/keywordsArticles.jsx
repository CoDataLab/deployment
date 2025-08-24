import { Helmet } from 'react-helmet-async';

import KeywordsArticlesView from 'src/sections/keywordsarticles/view';

// ----------------------------------------------------------------------

export default function KeywordsArticlesPage() {
  return (
    <>
      <Helmet>
        <title>Keywords Articles</title>
      </Helmet>

      <KeywordsArticlesView />
    </>
  );
}

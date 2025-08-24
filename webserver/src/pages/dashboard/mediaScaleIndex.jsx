import { Helmet } from 'react-helmet-async';

import MediaScaleIndexView from 'src/sections/mediaScaleIndex/view';
// ----------------------------------------------------------------------

export default function MediaScaleIndexPage() {
  return (
    <>
      <Helmet>
        <title> Media Bias Index</title>
      </Helmet>

      <MediaScaleIndexView />
    </>
  );
}

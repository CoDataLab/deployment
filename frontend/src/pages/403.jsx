import { Helmet } from 'react-helmet-async';

import { View403 } from 'src/sections/error';

// ----------------------------------------------------------------------

export default function ForbiddenPage() {
  return (
    <>
      <Helmet>
        <title> 403 : Forbidden Access </title>
      </Helmet>

      <View403 />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import WarehouseView from 'src/sections/datawarehouse/view';

// ----------------------------------------------------------------------

export default function WarehousePage() {
  return (
    <>
      <Helmet>
        <title> Data WareHouse</title>
      </Helmet>

      <WarehouseView />
    </>
  );
}

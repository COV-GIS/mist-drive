import esriConfig from '@arcgis/core/config';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

import Basemap from '@arcgis/core/Basemap';

import FullMap from 'cov/layouts/FullView';
import MadeWith from 'cov/widgets/MadeWith';

import Print from './widgets/Print';

esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

const view = new MapView({
  map: new Map({
    basemap: new Basemap({
      portalItem: {
        id: 'f36cd213cc934d2391f58f389fc9eaec',
      },
    }),
    layers: [],
  }),
  zoom: 15,
  center: [-123.185, 45.859],
  constraints: {
    rotationEnabled: false,
  },
});

view.when((): void => {
  view.ui.add(
    new MadeWith({
      color: '#323232',
      size: '14px',
    }),
    'bottom-left',
  );
  view.ui.add(
    new Print({
      view,
      printServiceUrl:
        'https://gisportal.vernonia-or.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
    }),
    'top-right',
  );
});

const app = new FullMap({
  view,
  title: 'Mist Drive',
  container: document.createElement('div'),
});

document.body.append(app.container);

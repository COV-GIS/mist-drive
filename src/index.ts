import esriConfig from '@arcgis/core/config';
// import Portal from '@arcgis/core/portal/Portal';
// import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
// import OAuthViewModel from 'cov/viewModels/OAuthViewModel';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Legend from '@arcgis/core/widgets/Legend';

esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

// const oAuthViewModel = new OAuthViewModel({
//   portal: new Portal(),
//   oAuthInfo: new OAuthInfo({
//     portalUrl: esriConfig.portalUrl,
//     appId: 'L8fvJsX7U6RlN1Pt',
//     popup: true,
//   }),
// });

// oAuthViewModel.portal.load()
//   .then(() => {
//     oAuthViewModel.load();
//   });

const view = new MapView({
  container: document.createElement('div'),
  center: [-123.183, 45.862],
  zoom: 15,
  map: new Map({
    basemap: {
      portalItem: {
        id: 'b6130a13beb74026b89960fbd424021f',
      },
    },
    layers: [
      new FeatureLayer({
        portalItem: {
          id: '856881c08fd0486b891be75baa9d2bfd',
        },
        title: 'Tax Lots',
        definitionExpression: 'VERNONIA <> 0',
      }),
      new GroupLayer({
        portalItem: {
          id: '027c75b51e1048eaa0cdf760218ccdfc',
        },
      }),
    ],
  }),
});

document.body.append(view.container);

view.when(() => {
  view.ui.add(
    new Legend({
      view,
    }),
    'top-right',
  );
});

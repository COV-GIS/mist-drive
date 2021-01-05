import esriConfig from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Legend from '@arcgis/core/widgets/Legend';

esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

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

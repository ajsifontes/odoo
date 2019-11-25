// var ol2d = new ol.Map({
//     layers: [
//         new ol.layer.Tile({
//         source: new ol.source.OSM()
//         })
//     ],
//     controls: ol.control.defaults({
//         attributionOptions: {
//         collapsible: false
//         }
//     }),
//     target: document.getElementById('map3d'),
//     view: new ol.View({
//         center: ol.proj.transform([25, 20], 'EPSG:4326', 'EPSG:3857'),
//         zoom: 3
//     })
// });
//
// var ol3d = new olcs.OLCesium({
//     map: ol2d,
// });
//
// ol3d.setEnabled(true);


const iconFeature = new ol.Feature({
  geometry: new ol.geom.Point([700000, 200000, 100000])
});

const textFeature = new ol.Feature({
  geometry: new ol.geom.Point([1000000, 3000000, 500000])
});

const cervinFeature = new ol.Feature({
  geometry: new ol.geom.Point([852541, 5776649])
});
cervinFeature.getGeometry().set('altitudeMode', 'clampToGround');


const modelFeatures = [-1, -1 / 2, 0, 1 / 2, 1, 3 / 2].map(
    factor => new ol.Feature({
      geometry: new ol.geom.Point([852641, 5776749, 4500]),
      'rotation': factor * Math.PI
    })
);


const iconStyle = new ol.style.Style({
  image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'smart_city/static/data/icon.png'
  })),
  text: new ol.style.Text({
    text: 'Some text',
    textAlign: 'center',
    textBaseline: 'middle',
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 155, 0.3)'
    })
  })
});

const textStyle = [new ol.style.Style({
  text: new ol.style.Text({
    text: 'Only text',
    textAlign: 'center',
    textBaseline: 'middle',
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 155, 0.3)'
    })
  })
}), new ol.style.Style({
  geometry: new ol.geom.Circle([1000000, 3000000, 10000], 2e6),
  stroke: new ol.style.Stroke({
    color: 'blue',
    width: 2
  }),
  fill: new ol.style.Fill({
    color: 'rgba(0, 0, 255, 0.2)'
  })
})];

iconFeature.setStyle(iconStyle);

textFeature.setStyle(textStyle);

cervinFeature.setStyle(iconStyle);
let iCase = 0;
modelFeatures.forEach((feature) => {
  ++iCase;
  const modelStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 0.75,
      src: 'smart_city/static/data/icon.png'
    }))
  });
  const olcsModelFunction = () => {
    const coordinates = feature.getGeometry().getCoordinates();
    const center = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    const rotation = /** @type {number} */ (feature.get('rotation'));
    return {
      cesiumOptions: {
        url: 'smart_city/static/data/arrow5.glb',
        modelMatrix: olcs.core.createMatrixAtCoordinates(center, rotation),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        minimumPixelSize: 64
      }
    };
  };
  let host = feature;
  switch (iCase % 3) {
    case 0:
      host = feature.getGeometry();
      break;
    case 1:
      modelStyle.setGeometry(feature.getGeometry().clone());
      host = modelStyle.getGeometry();
      break;
    default:
      host = feature;
  }
  host.set('olcs_model', olcsModelFunction);
  feature.setStyle(modelStyle);
});


const image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({color: 'red', width: 1})
});

const styles = {
  'Point': [new ol.style.Style({
    image
  })],
  'LineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      lineDash: [12],
      width: 10
    })
  })],
  'MultiLineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 10
    })
  })],
  'MultiPoint': [new ol.style.Style({
    image,
    text: new ol.style.Text({
      text: 'MP',
      stroke: new ol.style.Stroke({
        color: 'purple'
      })
    })
  })],
  'MultiPolygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'yellow',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  })],
  'Polygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  })],
  'GeometryCollection': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'magenta'
    }),
    image: new ol.style.Circle({
      radius: 10, // pixels
      fill: null,
      stroke: new ol.style.Stroke({
        color: 'magenta'
      })
    })
  })],
  'Circle': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0.2)'
    })
  })]
};

const styleFunction = function(feature, resolution) {
  const geo = feature.getGeometry();
  // always assign a style to prevent feature skipping
  return geo ? styles[geo.getType()] : styles['Point'];
};

const vectorSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: 'smart_city/static/data/geojson/vector_data.geojson'
});

const theCircle = new ol.Feature(new ol.geom.Circle([5e6, 7e6, 5e5], 1e6));

// Add a Cesium rectangle, via setting the property olcs.polygon_kind
const cartographicRectangleStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 69, 0, 0.7)'
  }),
  stroke: new ol.style.Stroke({
    color: 'rgba(255, 69, 0, 0.9)',
    width: 1
  })
});
const cartographicRectangleGeometry = new ol.geom.Polygon([[[-5e6, 11e6],
  [4e6, 11e6], [4e6, 10.5e6], [-5e6, 10.5e6], [-5e6, 11e6]]]);
cartographicRectangleGeometry.set('olcs.polygon_kind', 'rectangle');
const cartographicRectangle = new ol.Feature({
  geometry: cartographicRectangleGeometry
});
cartographicRectangle.setStyle(cartographicRectangleStyle);

// Add two Cesium rectangles with height and the property olcs.polygon_kind
const cartographicRectangleGeometry2 = new ol.geom.MultiPolygon([
  [[
    [-5e6, 12e6, 0], [4e6, 12e6, 0], [4e6, 11.5e6, 0], [-5e6, 11.5e6, 0],
    [-5e6, 12e6, 0]
  ]],
  [[
    [-5e6, 11.5e6, 1e6], [4e6, 11.5e6, 1e6], [4e6, 11e6, 1e6],
    [-5e6, 11e6, 1e6], [-5e6, 11.5e6, 1e6]
  ]]
]);
cartographicRectangleGeometry2.set('olcs.polygon_kind', 'rectangle');
const cartographicRectangle2 = new ol.Feature({
  geometry: cartographicRectangleGeometry2
});
cartographicRectangle2.setStyle(cartographicRectangleStyle);

const vectorLayer = new ol.layer.Vector({
  style: styleFunction,
  source: vectorSource
});

const vectorSource2 = new ol.source.Vector({
  features: [iconFeature, textFeature, cervinFeature, ...modelFeatures, cartographicRectangle,
    cartographicRectangle2]
});
const vectorLayer2 = new ol.layer.Vector({
  source: vectorSource2
});

const dragAndDropInteraction = new ol.interaction.DragAndDrop({
  formatConstructors: [
    ol.format.GPX,
    ol.format.GeoJSON,
    ol.format.IGC,
    ol.format.KML,
    ol.format.TopoJSON
  ]
});

const map = new ol.Map({
  interactions: ol.interaction.defaults().extend([dragAndDropInteraction]),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    vectorLayer,
    vectorLayer2
  ],
  target: 'map2d',
  controls: ol.control.defaults({
    attributionOptions: {
      collapsible: false
    }
  }),
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  })
});

dragAndDropInteraction.on('addfeatures', (event) => {
  const vectorSource = new ol.source.Vector({
    features: event.features,
    projection: event.projection
  });
  map.getLayers().push(new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction
  }));
  const view = map.getView();
  view.fitExtent(
      vectorSource.getExtent(), /** @type {ol.Size} */ (map.getSize()));
});


Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MzAyNzUyYi0zY2QxLTQxZDItODRkOS1hNTA3MDU3ZTBiMDUiLCJpZCI6MjU0MSwiaWF0IjoxNTMzNjI1MTYwfQ.oHn1SUWJa12esu7XUUtEoc1BbEbuZpRocLetw6M6_AA';
const ol3d = new olcs.OLCesium({map, target: 'map3d'});
const scene = ol3d.getCesiumScene();
scene.terrainProvider = Cesium.createWorldTerrain();
ol3d.setEnabled(true);

const csLabels = new Cesium.LabelCollection();
csLabels.add({
  position: Cesium.Cartesian3.fromRadians(20, 20, 0),
  text: 'Pre-existing primitive'
});
scene.primitives.add(csLabels);

// Adding a feature after the layer has been synchronized.
vectorSource.addFeature(theCircle);

let hasTheVectorLayer = true;
window['addOrRemoveOneVectorLayer'] = function() {
  if (hasTheVectorLayer) {
    map.getLayers().remove(vectorLayer);
  } else {
    map.getLayers().insertAt(1, vectorLayer);
  }
  hasTheVectorLayer = !hasTheVectorLayer;
};

window['addOrRemoveOneFeature'] = function() {
  const found = vectorSource2.getFeatures().indexOf(iconFeature);
  if (found === -1) {
    vectorSource2.addFeature(iconFeature);
  } else {
    vectorSource2.removeFeature(iconFeature);
  }
};

let oldStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: 'blue',
    width: 2
  }),
  fill: new ol.style.Fill({
    color: 'green'
  })
});

window['toggleStyle'] = function() {
  const swap = theCircle.getStyle();
  theCircle.setStyle(oldStyle);
  oldStyle = swap;
};

window['toggleClampToGround'] = function() {
  let altitudeMode;
  if (!vectorLayer.get('altitudeMode')) {
    altitudeMode = 'clampToGround';
  }
  vectorLayer.set('altitudeMode', altitudeMode);
  vectorLayer2.set('altitudeMode', altitudeMode);
  map.removeLayer(vectorLayer);
  map.removeLayer(vectorLayer2);
  map.addLayer(vectorLayer);
  map.addLayer(vectorLayer2);
};

window['setTargetFrameRate'] = function() {
  let fps;
  const fpsEl = document.querySelector('#framerate');
  if (fpsEl) {
    fps = Number(fpsEl.value);
    ol3d.setTargetFrameRate(fps);
  }
};

window['ol3d'] = ol3d;
window['scene'] = scene;
// document.getElementById('enable').addEventListener('click', () => ol3d.setEnabled(!ol3d.getEnabled()));

ol3d.enableAutoRenderLoop();

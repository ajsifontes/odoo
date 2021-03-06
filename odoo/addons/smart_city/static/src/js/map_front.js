odoo.define('smart_city.map_front', function (require) {

  require('web.dom_ready');
  var olMap = require('smart_city.olMap');

  (function(){

    var Mapa = new olMap();
    var map = Mapa.getOlMap();

    var ctrl = new ol.control.Cloud({
			opacity:'0.4',
			density:'0.9',
			windSpeed:3,
			windAngle:4
    });
    map.addControl(ctrl);

  })();

});

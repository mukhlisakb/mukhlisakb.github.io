var map, featureList, Banjir_GenanganSearch = [], Kepadatan_BangunanSearch = [], SungaiSearch = [], Batas_DesaSearch = [], Point_OSMSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

/* Button */
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(Sawah.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#downloaddata-btn").click(function() {
  $("#downloaddataModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Basemap Layers */
var basemap0 = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
	attribution: '&copy;Google Streets'
});
var basemap1 = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
	attribution: '&copy;Google Satellite'
});
var basemap2 = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
	attribution: '&copy;Google Terrain'
});
var basemap3 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy;Open Street Map'
});

/* Overlay Layers Highlight */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

/* Marker cluster layer to hold all clusters */
var pointOSMClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 15
});

/* Lokasi Bangunan */
var pointOSM = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/bubble_pink32.png",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>No. No OSM Id</th><td>" + feature.properties.osm_id + "</td></tr>" + "<tr><th>Building</th><td>" + feature.properties.building + "</td></tr>" + "<tr><th>Nama</th><td>" + feature.properties.name + "</td></tr>" + "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
    }
  }
});
$.getJSON("data/Data2/Point_Geojson.geojson", function (data) {
  pointOSM.addData(data);
  pointOSMClusters.addLayer(pointOSM);
});

/*Batas Administrasi */
var AdminKotaColors = {"Jalan Arteri":"3", "Jalan Kolektor":"1"};
var AdminKota = L.geoJson(null, {
  style: function (feature) {
      return {
        color: "grey",
        weight: AdminKotaColors[feature.properties.DESA],
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Nama Kelurahan</th><td>" + feature.properties.DESA + "</td></tr>" + "<tr><th>Luas Kelurahan</th><td>" + feature.properties.HA + "</td></tr>" + "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.DESA);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
        weight: 3,
        color: "#00FFFF",
        opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        jalanutama.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Data2/Batas_Desa.geojson", function (data) {
  AdminKota.addData(data);
  map.addLayer(AdminKota);
});


/* Jalan Utama */
var jalanutamaColors = {"Jalan Arteri":"3", "Jalan Kolektor":"1"};
var jalanutama = L.geoJson(null, {
  style: function (feature) {
      return {
        color: "black",
        weight: jalanutamaColors[feature.properties.Jenis_JL],
        opacity: 1
      };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Jenis Jalan</th><td>" + feature.properties.FungsiJala + "</td></tr>" + "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.FungsiJala);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
    }
    layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
        weight: 3,
        color: "#00FFFF",
        opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        jalanutama.resetStyle(e.target);
      }
    });
  }
});
$.getJSON("data/Data2/Jaringan_Jalan.geojson", function (data) {
  jalanutama.addData(data);
});

/* Layer Sungai */
var sungaibesarColors = {"Sungai":"lightblue", "Gosong Sungai":"gray"};
var sungaibesar = L.geoJson(null, {
  style: function (feature) {
    return {
    fillColor: sungaibesarColors[feature.properties.KETERANGAN],
	  fillOpacity: 0.7,
	  color: "blue",
	  weight: 0.5,
    opacity: 1,
	  smoothFactor: 0,
    clickable: false
    };
  }
});
$.getJSON("data/Data2/Sungai.geojson", function (data) {
  sungaibesar.addData(data);
  map.addLayer(sungaibesar);
});

/* Layer Genangan Banjir */
var GenanganColors = {"Berpotensi Banjir / Genangan":"#a1caf0", "Berpotensi Tinggi Banjir / Genangan":"#0c5293"};
var Genangan = L.geoJson(null, {
  style: function (feature) {
    return {
    fillColor: GenanganColors[feature.properties.Ket],
	  fillOpacity: 0.7,
	  color: "gray",
	  weight: 1,
    opacity: 1,
	  smoothFactor: 0,
    clickable: true
    };
  },
  onEachFeature: function (feature, layer) {
	layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
        weight: 2,
        fillColor: "#00FFFF",
        opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        Genangan.resetStyle(e.target);
      }
    });
	if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Kode Risiko</th><td>" + feature.properties.Ket + "<tr><th>Luas Banjir</th><td>" + feature.properties.LuasHa + " Ha</td></tr>" + "</td></tr>"+ "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html("Risiko Banjir " + feature.properties.Ket);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
	}
  }
});
$.getJSON("data/Data2/Banjir.geojson", function (data) {
  Genangan.addData(data);
  map.addLayer(Genangan);
});

/* Layer Banjir */
var Banjir_RiskColors = {"2":"#0ee1f1", "2":"#00b8ff", "3":"#0083ff", "4":"#4b6eb2", "5":"#2c15ae"};
var Banjir_Risk = L.geoJson(null, {
  style: function (feature) {
    return {
    fillColor: Banjir_RiskColors[feature.properties.Risk_Banjir],
	  fillOpacity: 0.7,
	  color: "gray",
	  weight: 1,
    opacity: 1,
	  smoothFactor: 0,
    clickable: true
    };
  },
  onEachFeature: function (feature, layer) {
	layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
        weight: 2,
        fillColor: "#00FFFF",
        opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        Banjir_Risk.resetStyle(e.target);
      }
    });
	if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Kode Risiko</th><td>" + feature.properties.Risk_Banjir + "</td></tr>" + "<tr><th>Keterangan Risiko</th><td>" + feature.properties.Keterangan_Ban + "<tr><th>Luas Banjir</th><td>" + feature.properties.LuasHa + " Ha</td></tr>" +"<tr><th>Kepadatan Bangunan</th><td>" + feature.properties.Kategori + "</td></tr>"+ "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html("Risiko Banjir " + feature.properties.Keterangan_Ban);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
	}
  }
});
$.getJSON("data/Data2/Risiko_Banjir.geojson", function (data) {
  Banjir_Risk.addData(data);
});

/* Layer Kepadatan Bangunan */
var Kepadatan_BangunanColors = {"Tidak Padat":"#fe8181", "Cukup Padat":"#fe5757", "Sangat Padat":"#b62020"};
var Kepadatan_Bangunan = L.geoJson(null, {
  style: function (feature) {
    return {
    fillColor: Kepadatan_BangunanColors[feature.properties.Keterangan],
	  fillOpacity: 0.7,
	  color: "grey",
	  weight: 1,
    opacity: 1,
	  smoothFactor: 0,
    clickable: true
    };
  },
  onEachFeature: function (feature, layer) {
	layer.on({
      mouseover: function (e) {
        var layer = e.target;
        layer.setStyle({
        weight: 2,
        fillColor: "#00FFFF",
        opacity: 1
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
      },
      mouseout: function (e) {
        Kepadatan_Bangunan.resetStyle(e.target);
      }
    });
	if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Kepadatan Bangunan</th><td>" + feature.properties.Keterangan + "</td></tr>" + "<tr><th>Keterangan Jumlah Bangunan  dalam Grid</th><td>" + feature.properties.NUMPOINTS + "</td></tr>"+ "</table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html("Kepadatan Bangunan Kota Pontianak " + feature.properties.Keterangan);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");

        }
      });
	}
  }
});
$.getJSON("data/Data2/Kepadatan_Bangunan.geojson", function (data) {
  Kepadatan_Bangunan.addData(data);
});

/* Map Center */
var map = L.map('map', {
  zoom: 12,
  center: [-0.02,109.34],
  layers: [basemap3, pointOSMClusters, highlight],
  zoomControl: false,
  attributionControl: true
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

const newLocal = '<a href="https://www.linkedin.com/in/mukhlisakb/" target="_blank">Mukhlis Akbar</a>';
/* Attribution control */
map.attributionControl.addAttribution(newLocal);

/* Zoom control position */
var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "Lokasi saya",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Google Streets": basemap0,
  "Google Satellite": basemap1,
  "Google Terrain": basemap2,
  "Open Street Map": basemap3
};

var groupedOverlays = {
  "Data Point": {
  "Lokasi Bangunan": pointOSMClusters
  },
  
  "Data Kota Pontianak (Area)": {
  "Jalan Utama": jalanutama,
	"Sungai Besar": sungaibesar,
  "Genangan Banjir" : Genangan,
	"Risiko Banjir": Banjir_Risk,
  "Kepadatan Bangunan" : Kepadatan_Bangunan,
  "Batas Administrasi" : AdminKota
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Progress Bar */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to layer bounds */
  map.fitBounds(Banjir_Risk.getBounds());
});

/* Leaflet patch to make layer control scrollable on touch browsers */
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}

/* ScaleBar */
L.control.betterscale({
	metric: true,
	imperial: false
}).addTo(map);

/* Logo watermark */
L.Control.Watermark = L.Control.extend({
	onAdd: function(map) {
		var img = L.DomUtil.create('img');
		img.src = 'assets/img/mata_angin.png';
		img.style.width = '100px';
			return img;
	},
	onRemove: function(map) {
		// Nothing to do here
	}
});

L.control.watermark = function(opts) {
	return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map);
var data = [];
const width = 550, height = 550;

function createMap() {

  const path = d3.geoPath();

  const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2600)
    .translate([width / 2, height / 2]);

  path.projection(projection);

  const svg = d3.select('#map').append("svg")
      .attr("id", "svg")
      .attr("width", width)
      .attr("height", height);

  const deps = svg.append("g");

  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  d3.json('../json/departements.json').then(function(geojson) {
    deps.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr('class', 'department')
        .attr("d", path)
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Département : " + d.properties.NOM_DEPT + "<br/>"
                  +  "Région : " + d.properties.NOM_REGION)
                .style("left", (d3.event.pageX + 30) + "px")
                .style("top", (d3.event.pageY - 30) + "px")
        })
        .on("mouseout", function(d) {
            div.style("opacity", 0);
            div.html("")
                .style("left", "-500px")
                .style("top", "-500px");
        });
    });
}

var request = d3.json("../json/meteo.json")
    .then(loadJson).catch(console.error);

function loadJson(d){
	data = d;
  // Load la carte par défaut sans filtres
  createMap();
  loadVilles();
}

function loadVilles() {

  // On retraite les données pour ne récupérer que les villes
  var stations = [];
  var stationsName = [];

    for(var i = 0; i < data.length; i++)
    {
      for(var j = 0; j < data[i]['station'].length; j++)
      {
        if(!stationsName.includes(data[i]['station'][j]['n']))
        {
          stationsName.push(data[i]['station'][j]['n']);

          var nom = data[i]['station'][j]['n'];
          var latitude = data[i]['station'][j]['lat'];
          var longitude = data[i]['station'][j]['lng'];

          var infoStation = {
    					nom: nom,
              latitude: latitude,
              longitude : longitude
    				};

          stations.push(infoStation);
        }
      }
    }

    stationsName.sort();

    for(var i = 0; i < stationsName.length; i++)
    {
      var o = new Option(stationsName[i], i);
      $(o).html(stationsName[i]);
      $("#select_ville").append(o);
    }

    d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .selectAll("circle")
  	.data(stations)
  	.join("circle")
  	.attr("cy", (data, idx) => {
      return data.latitude * 2.454071;
  	})
  	.attr("cx", (data, idx) => {
      return data.longitude * 46.279229;
  	})
  	.attr("r", data => {
  		return Math.sqrt(25);
  	})
  	.attr("fill", "magenta");
}

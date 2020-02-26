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
    var maxVilles = 0;
    var idMaxVilles = 0;

    for(var i = 0; i < data.length; i++)
    {
      if(data[i]['station'].length > maxVilles){
        maxVilles = data[i]['station'].length;
        idMaxVilles = i;
      }
    }

    for(var i = 0; i < data[idMaxVilles]['station'].length; i ++)
    {
      console.log(data[idMaxVilles]['station'][i]['n']);
    }

    d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .selectAll("villes")
  	.data(data)
  	.join("villes")
  	.attr("cy", 60)
  	.attr("cx", (data, idx) => {
      //console.log(data.station.length);
  	})
  	.attr("r", data => {
  		return Math.sqrt(1);
  	})
  	.attr("id", (data, idx) => idx)
  	.attr("fill", "magenta");
}

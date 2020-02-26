var data = [];
var stations = [];
var stationsName = [];
const width = 550, height = 550;

const projection = d3.geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(2600)
  .translate([width / 2, height / 2]);

function getDay(){
  var selectPays = document.getElementById('select_ville');
  var day = 1;
  var jsDate = $('#datepicker').datepicker('getDate');
  if (jsDate !== null) { // if any date selected in datepicker
      jsDate instanceof Date; // -> true
      day = jsDate.getDate();
      jsDate.getMonth();
      jsDate.getFullYear();
  }
  return day;
}

function createMap() {

  const path = d3.geoPath();

  path.projection(projection);

  const svg = d3.select('#map').append("svg")
      .attr("id", "svg")
      .attr("viewBox", "0 0 " + width*2 + " " + height*2);
      // UTILISER LES VIEWBOW !!!!

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
  createStation();
  loadSelect();
  createVilles();
}

function createStation(){

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

        var detailJour = [];
        for(var l = 0; l < data.length; l++)
        {
          for(var m = 0; m < data[l]['station'].length; m++)
          {
            if(data[l]['station'][m]['n'] == nom){
              var temp = data[l]['station'][m]['t'];
              var tempMoye = parseFloat(temp/100).toFixed(0);
              var preMoye = parseFloat(data[l]['station'][m]['p']).toFixed(2);

              var infoMeteo = {
                tempMoye : tempMoye,
                preMoye : preMoye,
                detailHoraire : data[l]['station'][m]['hours']
              }
              detailJour.push(infoMeteo);
            }
          }
        }

        var infoStation = {
            nom: nom,
            latitude: latitude,
            longitude : longitude,
            detailJour : detailJour
          };

        stations.push(infoStation);
      }
    }
  }
}

function loadSelect() {
    stationsName.sort();

    for(var i = 0; i < stationsName.length; i++)
    {
      var o = new Option(stationsName[i], i);
      $(o).html(stationsName[i]);
      $("#select_ville").append(o);
    }
}

function updateVilles()
{
  day = getDay();
  d3.selectAll("svg text").text(function(d){if(d.detailJour.length > day - 1) { return d.detailJour[day - 1]['tempMoye']; }});
  d3.selectAll("svg image").attr("xlink:href", function (d) { if(1 == 1) return "../img/tet.png"; })
}

function createVilles() {

    day = getDay();

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("#map").select("svg");

    var elem = svg.selectAll("g")
           .data(stations);

    var elemEnter = elem.enter()
           .append("g");

   var circle = elemEnter.append("image")
       .attr("xlink:href", function (d) { if(1 == 1) return "../img/nuageux.png"; })
       .attr("x", function (d) { return projection([d.longitude, d.latitude])[0] - 15; })
       .attr("y", function (d) { return projection([d.longitude, d.latitude])[1] - 5; })
       .attr("width", "35px")
       .on("mouseover", function(d) {
           div.transition()
               .duration(200)
               .style("opacity", .9);
           div.html(d.nom+"<br/>")
               .style("left", (d3.event.pageX - 10) + "px")
               .style("top", (d3.event.pageY - 10) + "px");
       })
       .on("mouseout", function(d) {
           div.style("opacity", 0);
           div.html("")
               .style("left", "-500px")
               .style("top", "-500px");
       });

   /* Create the text for each block */
   elemEnter.append("text")
       .attr("x", function (d) { return projection([d.longitude, d.latitude])[0]; })
       .attr("y", function (d) { return projection([d.longitude, d.latitude])[1]; })
       .attr("text-anchor", "middle")
       .attr("font-size", "12px")
       .text(function(d){if(d.detailJour.length > day - 1) { return d.detailJour[day - 1]['tempMoye']; }});


}

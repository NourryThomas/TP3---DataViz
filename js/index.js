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
  createLineChart(data);
}

function createStation(){
  stations.push("FakeData");
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
              var min = 0;
              var max = 0;

              for(var z = 0; z < data[l]['station'][m]['hours'].length; z++)
              {
                if(z == 0)
                {
                  max = data[l]['station'][m]['hours'][z]['t']/100;
                  min = data[l]['station'][m]['hours'][z]['t']/100;
                }
                if(data[l]['station'][m]['hours'][z]['t']/100 > max)
                {
                  max = data[l]['station'][m]['hours'][z]['t']/100;
                }
                if(data[l]['station'][m]['hours'][z]['t']/100 < min) {
                  min = data[l]['station'][m]['hours'][z]['t']/100;
                }
              }

              var infoMeteo = {
                tempMoye : tempMoye,
                preMoye : preMoye,
                min : min,
                max : max,
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
      var o = new Option(stationsName[i], "ville_" + i);
      $(o).html(stationsName[i]);
      $("#select_ville").append(o);
    }
}

function updateVilles()
{
  day = getDay();
  d3.selectAll("svg image") .attr("xlink:href", function (d) {
     if(d.detailJour[day - 1]['tempMoye'] <= 1 && d.detailJour[day - 1]['preMoye'] >= 0.75 && d.detailJour[day - 1]['tempMoye'] >= -1)
      return "../img/neige.png";
     else if( d.detailJour[day - 1]['tempMoye'] >= 25 && d.detailJour[day - 1]['preMoye'] <= 0.15)
       return "../img/soleil.png";
     else if(d.detailJour[day - 1]['preMoye'] >= 1.00)
        return "../img/fortes_pluies.png";
     else if(d.detailJour[day - 1]['preMoye'] >= 0.50)
       return "../img/pluies.png";
     else if(d.detailJour[day - 1]['preMoye'] >= 0.25 )
       return "../img/averses.png";
     else if(d.detailJour[day - 1]['preMoye'] >= 0.15)
         return "../img/risque_averse.png";
     else if(d.detailJour[day - 1]['preMoye'] > 0.00 && d.detailJour[day - 1]['tempMoye'] <= 15)
         return "../img/éclaircits.png";
     else if(d.detailJour[day - 1]['preMoye'] == 0.00)
       return "../img/soleil.png";
   })

  d3.selectAll("svg text").text(function(d){
    try {
      if(d.detailJour.length > day - 1)
      {
        return d.detailJour[day - 1]['tempMoye'];
      }
    }
    catch(error) {
    }
  });
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
       .attr("xlink:href", function (d) {
         if( -1 <= d.detailJour[day - 1]['tempMoye'] <= 1 && d.detailJour[day - 1]['preMoye'] >= 0.75)
          return "../img/neige.png";
         else if( d.detailJour[day - 1]['tempMoye'] >= 25 && d.detailJour[day - 1]['preMoye'] <= 0.15)
           return "../img/soleil.png";
         else if(d.detailJour[day - 1]['preMoye'] >= 1.00)
            return "../img/fortes_pluies.png";
         else if(d.detailJour[day - 1]['preMoye'] >= 0.50)
           return "../img/pluies.png";
         else if(d.detailJour[day - 1]['preMoye'] >= 0.25 )
           return "../img/averses.png";
         else if(d.detailJour[day - 1]['preMoye'] >= 0.15)
             return "../img/risque_averse.png";
         else if(d.detailJour[day - 1]['preMoye'] > 0.00 && d.detailJour[day - 1]['tempMoye'] <= 15)
             return "../img/éclaircits.png";
         else if(d.detailJour[day - 1]['preMoye'] == 0.00)
           return "../img/soleil.png";
       })
       .attr("x", function (d) { return projection([d.longitude, d.latitude])[0] - 15; })
       .attr("y", function (d) { return projection([d.longitude, d.latitude])[1] - 15; })
       .attr("width", "35px")
       .on("mouseover", function(d) {
           div.transition()
               .duration(200)
               .style("opacity", .9);
           div.html(d.nom+"<br/>"
           + "Précipitations : " + d.detailJour[day - 1]['preMoye'] + "mm</br>"
           + "Minimum : " + d.detailJour[day - 1]['min'] + "°</br>"
           + "Maximum : " + d.detailJour[day - 1]['max'] + "°</br>")
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
       .attr("x", function (d) { return projection([d.longitude, d.latitude])[0] + 1; })
       .attr("y", function (d) { return projection([d.longitude, d.latitude])[1] - 15; })
       .attr("text-anchor", "middle")
       .attr("font-size", "12px")
       .text(function(d){
           if(d.detailJour.length > day - 1)
           {
             return d.detailJour[day - 1]['tempMoye'];
           }
       });

}

function createLineChart(data) {

    // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 720 - margin.left - margin.right,
      height = 375 - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%d-%b-%y");

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var y1 = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x).ticks(5);

  var yAxisLeft = d3.axisLeft(y).ticks(5);

  var yAxisRight = d3.axisRight(y1).ticks(5);

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(d.d); })
      .y(function(d) { return y(d.p); });
  // define the line
  var valueline2 = d3.line()
      .x(function(d) { return x(d.d); })
      .y(function(d) { return y1(d.t); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#line_chart").append("svg")
      .attr("width", width + margin.left + margin.right + 20)
      .attr("height", height + margin.top + margin.bottom + 15)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  data.forEach(function(d) {
    d.d = parseTime(d.d + "-Feb-99");
    d.t = +(d.t / 100);
    d.p = +(Math.round( d.p * 10 ) / 10);
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.d; }));
  y.domain([0, d3.max(data, function(d) {
    return Math.max(d.p); })]);
  y1.domain([0, d3.max(data, function(d) {
    return Math.max(d.t); })]);

  svg.append("path")        // Add the valueline path.
        .attr("d", valueline(data));

  svg.append("path")        // Add the valueline2 path.
      .style("stroke", "red")
      .attr("d", valueline2(data));

  svg.append("g")            // Add the X Axis
      .attr("class", "x axis")
      .attr("id", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // text label for the x axis
  svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

  svg.append("g")
      .attr("class", "y axis")
      .attr("id", "y_axis")
      .style("fill", "steelblue")
      .call(yAxisLeft);

    // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Pluviométrie");

  svg.append("g")
      .attr("class", "y axis")
      .attr("id", "y1_axis")
      .attr("transform", "translate(" + width + " ,0)")
      .style("fill", "red")
      .call(yAxisRight);

    // text label for the y1 axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 + width + margin.right)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Température");

  $('#x_axis > g > text').each(function() {
    var x_axis_label = $(this).text();
    $(this).text(x_axis_label.replace('Feb', 'Fev'));
  });
}

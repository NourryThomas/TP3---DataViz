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
  createLineChart(data);
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
      var o = new Option(stationsName[i], "ville_" + i);
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

function createLineChart(data) {

    // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

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
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  data.forEach(function(d) {
    d.d = parseTime(d.d + "-Feb-99");
    d.t = +(d.t / 100);
    d.p = +(Math.round( d.p * 10 ) / 10);
  });

  console.log(data);

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
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .style("fill", "steelblue")
      .call(yAxisLeft);

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + " ,0)")
      .style("fill", "red")
      .call(yAxisRight);
}

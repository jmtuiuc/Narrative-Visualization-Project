//setting visual dimensions
const width = 1000;
const height = 500;

//svg to display map
const svg2023 = d3.select("#map-2023")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//svg to display map
const svg2024 = d3.select("#map-2024")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//svg to display map
const svgGrowth = d3.select("#map-growth")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//svg to display map
const svgDensity = d3.select("#map-density")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//svg to display map
 const svgPercent = d3.select("#map-percent")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//using topojson map for map graphics
const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

//load data files and initialize structures that will hold the data
Promise.all([
  d3.json("usa.json"),
  d3.csv("data.csv")
]).then(([usData, populationData]) => {
  const populationById2023 = {};
  const populationById2024 = {};
  const growthRateById = {};
  const populationDensityById = {};
  const percentofPopulationById = {};
  const growthData = [];
  const data2023 = [];
  const data2024 = [];
  const percentageData = [];
  const densityData = [];

  //iterate through each column and store the data needed & create vectors to store data for later use
  populationData.forEach(d => {
    const stateName = d["US State"];
    populationById2023[stateName] = +d["Population 2023"];
    data2023.push({ state: stateName, pop2023: +d["Population 2023"] });

    populationById2024[stateName] = +d["Population 2024"];
    data2024.push({ state: stateName, pop2024: +d["Population 2024"] });

    growthRateById[stateName] = +d["Growth Rate"];
    growthData.push({ state: stateName, growth: +d["Growth Rate"] });

    populationDensityById[stateName] = +d["Density (/mile2)"];
    densityData.push({ state: stateName, density: +d["Density (/mile2)"] }); 

    percentofPopulationById[stateName] = +d["% of US"];
    percentageData.push({ state: stateName, percentage: +d["% of US"] });
    
  });

  //draw maps
  drawMap(svg2023, usData, populationById2023, "Population 2023");
  drawMap(svg2024, usData, populationById2024, "Population 2024");
  drawMap(svgGrowth, usData, growthRateById, "Growth Rate");
  drawMap(svgDensity, usData, populationDensityById, "Density (/mile2)");+
  drawMap(svgPercent, usData, percentofPopulationById, "% of US");

  //used to display top 10 lists
  displayTopBottomStatesGrowth(growthData);
  displayTopBottomStates2023(data2023);
  displayTopBottomStates2024(data2024);
  displayTopBottomStatesPercentage(percentageData);
  displayTopBottomStatesDensity(densityData);
});

//function to draw map using topojson map
function drawMap(svg, usData, data, label) {
  const color = d3.scaleSequential()
    .domain([d3.min(Object.values(data)), d3.max(Object.values(data))])
    .interpolator(d3.interpolateBlues);

  const states = topojson.feature(usData, usData.objects.states).features;

  //build the graphic
  svg.selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "state")
    .attr("fill", d => {
      const stateName = d.properties.name;
      const value = data[stateName];
      console.log(`State: ${stateName}, Value: ${value}`);
      return value ? color(value) : "#ccc"; 
    })
    .on("mouseover", function(event, d) {//provide hover feature
      d3.select(this).attr("fill", "plum");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`State: ${d.properties.name}<br>${label}: ${data[d.properties.name]}`)//tooltip display
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {//defualt map view
      d3.select(this).attr("fill", color(data[d.properties.name]));
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
  
    //set tool tip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
}

//function that provides top 10s lists
function displayTopBottomStates2023(data2023) {
  //sort based on values
  data2023.sort((a, b) => b.pop2023 - a.pop2023);
  
  //store the respective top and bottom 10 results
  const top10 = data2023.slice(0, 10);
  const bottom10 = data2023.slice(-10).reverse();
  
  const top10List = d3.select("#top-10-population-2023-list");
  const bottom10List = d3.select("#bottom-10-population-2023-list");

  //appending
  top10.forEach(d => {
    top10List.append("li").text(`${d.state}: ${d.pop2023}`);
  });

  bottom10.forEach(d => {
    bottom10List.append("li").text(`${d.state}: ${d.pop2023}`);
  });
}

//function that provides top 10s lists
function displayTopBottomStates2024(data2024) {
  //sort based on values
  data2024.sort((a, b) => b.pop2024 - a.pop2024);
  
  //store the respective top and bottom 10 results
  const top10 = data2024.slice(0, 10);
  const bottom10 = data2024.slice(-10).reverse();
  
  const top10List = d3.select("#top-10-population-2024-list");
  const bottom10List = d3.select("#bottom-10-population-2024-list");

  //appending
  top10.forEach(d => {
    top10List.append("li").text(`${d.state}: ${d.pop2024}`);
  });

  bottom10.forEach(d => {
    bottom10List.append("li").text(`${d.state}: ${d.pop2024}`);
  });
}

//function that provides top 10s lists
function displayTopBottomStatesGrowth(growthData) {
  //sort based on values
  growthData.sort((a, b) => b.growth - a.growth);
 
  //store the respective top and bottom 10 results
  const top10 = growthData.slice(0, 10);
  const bottom10 = growthData.slice(-10).reverse();
  
  const top10List = d3.select("#top-10-population-growth-list");
  const bottom10List = d3.select("#bottom-10-population-growth-list");

  //appending
  top10.forEach(d => {
    top10List.append("li").text(`${d.state}: ${d.growth}`);
  });

  bottom10.forEach(d => {
    bottom10List.append("li").text(`${d.state}: ${d.growth}`);
  });
}

//function that provides top 10s lists
function displayTopBottomStatesPercentage(percentageData) {
  //sort based on values
  percentageData.sort((a, b) => b.percentage - a.percentage);
  
  //store the respective top and bottom 10 results
  const top10 = percentageData.slice(0, 10);
  const bottom10 = percentageData.slice(-10).reverse();
 
  const top10List = d3.select("#top-10-population-percent-list");
  const bottom10List = d3.select("#bottom-10-population-percent-list");

  //appending
  top10.forEach(d => {
    top10List.append("li").text(`${d.state}: ${d.percentage}`);
  });

  bottom10.forEach(d => {
    bottom10List.append("li").text(`${d.state}: ${d.percentage}`);
  });
}

//function that provides top 10s lists
function displayTopBottomStatesDensity(densityData) {
  //sort based on values
  densityData.sort((a, b) => b.density - a.density);
  
  //store the respective top and bottom 10 results
  const top10 = densityData.slice(0, 10);
  const bottom10 = densityData.slice(-10).reverse();
  
  const top10List = d3.select("#top-10-population-density-list");
  const bottom10List = d3.select("#bottom-10-population-density-list");

  //appending
  top10.forEach(d => {
    top10List.append("li").text(`${d.state}: ${d.density}`);
   });

  bottom10.forEach(d => {
    bottom10List.append("li").text(`${d.state}: ${d.density}`);
  });
}
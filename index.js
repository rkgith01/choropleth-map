const EDUCATION_DATA_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const COUNTY_DATA_URL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(EDUCATION_DATA_URL), d3.json(COUNTY_DATA_URL)]).then(
  ([educationData, countyData]) => {
    const svg = d3.select("#map");

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(educationData, (d) => d.bachelorsOrHigher)]);

    svg
      .selectAll(".county")
      .data(
        topojson.feature(countyData, countyData.objects.counties).features
      )
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        const county = educationData.find((c) => c.fips === d.id);
        return county ? county.bachelorsOrHigher : 0;
      })
      .attr("d", d3.geoPath())
      .style("fill", (d) => {
        const county = educationData.find((c) => c.fips === d.id);
        return county ? colorScale(county.bachelorsOrHigher) : colorScale(0);
      })
      .on("mouseover", (event, d) => {
        const county = educationData.find((c) => c.fips === d.id);
        const tooltip = d3.select("#tooltip");
        tooltip
          .html(
            `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`
          )
          .attr("data-education", county.bachelorsOrHigher)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`)
          .classed("hidden", false);
      })
      .on("mouseout", () => {
        d3.select("#tooltip").classed("hidden", true);
      });

    // Append the legend element to the document
    const legend = d3.select("body").append("svg")
      .attr("id", "legend")
      .attr("width", 100)
      .attr("height", 200);

    // Define the legend scale
    const legendScale = d3
      .scaleQuantize()
      .domain([0, d3.max(educationData, (d) => d.bachelorsOrHigher)])
      .range(d3.schemeBlues[6]); // Use a range of 6 colors, adjust if needed

    // Generate legend colors ensuring at least 4 different colors
    const legendColors = legendScale.range().slice(0, 4); // Ensure at least 4 colors

    legend
      .selectAll("rect") // Using <rect> elements for the legend
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("class", "legend-box")
      .attr("width", 30)
      .attr("height", 20)
      .attr("x", 10) // Adjust the x position as needed
      .attr("y", (d, i) => 10 + i * 25) // Adjust the y position as needed
      .attr("fill", (d) => d);
  }
);

import "./App.css";
import * as d3 from "d3";
import React, { useState, useEffect, useRef } from "react";

const Treemap = () => {
  const [data, setData] = useState(null);
  const [dataset, setDataset] = useState("video-games"); // Default dataset
  const svgRef = useRef(); // Reference for the SVG
  const width = 900;
  const height = 600;

  const dataUrls = {
    kickstarter:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    movies:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
    "video-games":
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
  };

  // Fetch all datasets once

  useEffect(() => {
    Promise.all([
      fetch(dataUrls["kickstarter"]).then((res) => res.json()),
      fetch(dataUrls["movies"]).then((res) => res.json()),
      fetch(dataUrls["video-games"]).then((res) => res.json()),
    ])
      .then(([kickstarter, movies, videoGames]) => {
        setData({
          kickstarter: kickstarter,
          movies: movies,
          "video-games": videoGames,
        });
      })
      .catch((err) => console.error("Error fetching data:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create treemap when data changes

  useEffect(() => {
    if (!data || !data[dataset]) return; // Ensure we have the right data

    // Clear previous treemap before creating a new one
    d3.select(svgRef.current).selectAll("*").remove();
    d3.select("#tree-map").selectAll("*").remove();

    // Create root hierarchy for new dataset
    const root = d3
      .hierarchy(data[dataset]) // Use the selected dataset
      .eachBefore(
        (d) =>
          (d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
      )
      .sum((d) => +d.value)
      .sort((a, b) => b.value - a.value);

    // Define treemap layout
    const treemapLayout = d3
      .treemap()
      .size([width, height])
      .padding(1)
      .round(true);

    treemapLayout(root);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Append tiles for the new dataset
    const tiles = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    d3.select("#tooltip").remove();

    // Tooltip creation
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "#222831")
      .style("border-radius", "5px")
      .style("padding", "5px 10px")
      .style("font-size", "10px")
      .style("color", "#EEEEEE")
      .style("z-index", "10")
      .style("max-width", "200px") // Limiting the width of the tooltip
      .style("max-height", "150px") // Limit height if the content becomes long
      .style("overflow", "auto"); // Allow scrolling if content overflows

    const platformColors = {
      2600: "#3366CC",
      Wii: "#54A354",
      DS: "#FF4D61",
      X360: "#808080",
      GB: "#00B3B3",
      PS3: "#9B3B9B",
      NES: "#FFDB73",
      PS2: "#66FF66",
      SNES: "#FF8C4D",
      GBA: "#FF7F80",
      PS4: "#9A66B3",
      "3DS": "#FF66B3",
      N64: "#4C914C",
      PS: "#3333CC",
      XB: "#C47A47",
      PC: "#B3B3B3",
      PSP: "#3366FF",
      XOne: "#E57373",
      Other: "#F2F2F2",
      // Movie categories
      Comedy: "#3366CC",
      Action: "#54A354",
      Drama: "#FF4D61",
      Adventure: "#808080",
      Family: "#00B3B3",
      Animation: "#9B3B9B",
      Biography: "#FFDB73",
      // Kickstarter categories
      "Product Design": "#3366CC",
      "Tabletop Games": "#54A354",
      "Gaming Hardware": "#FF4D61",
      "Video Games": "#808080",
      Sound: "#00B3B3",
      Television: "#9B3B9B",
      Narrative_film: "#FFDB73",
      Web: "#66FF66",
      Hardware: "#FF8C4D",
      Games: "#FF7F80",
      "3D Printing": "#9A66B3",
      Technology: "#FF66B3",
      Wearables: "#4C914C",
      Sculpture: "#3333CC",
      Apparel: "#C47A47",
      Food: "#B3B3B3",
      Art: "#3366FF",
      Gadgets: "#E57373",
      Drinks: "#c8c804",
      "Narrative Film": "#606002",
    };

    tiles
      .append("rect")
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr(
        "fill",
        (d) => platformColors[d.data.category] || platformColors["Other"]
      )
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .attr("data-name", d.data.name)
          .attr("data-category", d.data.category)
          .attr("data-value", d.data.value).html(`
          <strong>Name:</strong> ${d.data.name}<br>
          <strong>Category:</strong> ${d.data.category}<br>
          <strong>Value:</strong> ${d.data.value}
        `);

        // Position the tooltip near the mouse cursor
        tooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    tiles
      .append("foreignObject")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr(
        "style",
        "font-size: 10px; color: white; word-wrap: break-word; white-space: normal; padding: 1px;"
      )
      .append("xhtml:div")
      .style("width", "100%")
      .style("height", "100%")
      .style("overflow", "hidden")
      .style("text-align", "center")
      .style("white-space", "normal") // Allows text wrapping
      .style("word-wrap", "break-word") // Breaks long words if necessary
      .html((d) => `<div>${d.data.name}</div>`) // Insert text content here
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .attr("data-name", d.data.name)
          .attr("data-category", d.data.category)
          .attr("data-value", d.data.value).html(`
          <strong>Name:</strong> ${d.data.name}<br>
          <strong>Category:</strong> ${d.data.category}<br>
          <strong>Value:</strong> ${d.data.value}
        `);

        // Position the tooltip near the mouse cursor
        tooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    updateLegend(dataset);
  }, [data, dataset]); // Dependency array ensures re-run when data or dataset changes

  // Function to create and update the legend
  function updateLegend(dataset) {
    let legendContainer = d3.select("#legend");

    // If #legend is not an SVG, create one
    if (legendContainer.empty()) {
      d3.select("body").append("svg").attr("id", "legend");
      legendContainer = d3.select("#legend");
    }

    legendContainer.selectAll("*").remove(); // Clear previous legends

    const platformColors = {
      2600: "#3366CC",
      Wii: "#54A354",
      DS: "#FF4D61",
      X360: "#808080",
      GB: "#00B3B3",
      PS3: "#9B3B9B",
      NES: "#FFDB73",
      PS2: "#66FF66",
      SNES: "#FF8C4D",
      GBA: "#FF7F80",
      PS4: "#9A66B3",
      "3DS": "#FF66B3",
      N64: "#4C914C",
      PS: "#3333CC",
      XB: "#C47A47",
      PC: "#B3B3B3",
      PSP: "#3366FF",
      XOne: "#E57373",
    };

    const movieColors = {
      Comedy: "#3366CC",
      Action: "#54A354",
      Drama: "#FF4D61",
      Adventure: "#808080",
      Family: "#00B3B3",
      Animation: "#9B3B9B",
      Biography: "#FFDB73",
    };

    const kickstarterColors = {
      "Product Design": "#3366CC",
      "Tabletop Games": "#54A354",
      "Gaming Hardware": "#FF4D61",
      "Video Games": "#808080",
      Sound: "#00B3B3",
      Television: "#9B3B9B",
      Narrative_film: "#FFDB73",
      Web: "#66FF66",
      Hardware: "#FF8C4D",
      Games: "#FF7F80",
      "3D Printing": "#9A66B3",
      Technology: "#FF66B3",
      Wearables: "#4C914C",
      Sculpture: "#3333CC",
      Apparel: "#C47A47",
      Food: "#B3B3B3",
      Art: "#3366FF",
      Gadgets: "#E57373",
      Drinks: "#c8c804",
      "Narrative Film": "#606002",
    };

    let legendData = [];

    if (dataset === "video-games") {
      legendData = Object.entries(platformColors).map(([category, color]) => ({
        category,
        color,
      }));
    } else if (dataset === "movies") {
      legendData = Object.entries(movieColors).map(([category, color]) => ({
        category,
        color,
      }));
    } else if (dataset === "kickstarter") {
      legendData = Object.entries(kickstarterColors).map(
        ([category, color]) => ({ category, color })
      );
    }

    console.log("Legend Data:", legendData); // Debugging

    // Set the size of the SVG legend container
    legendContainer
    .attr("width", 250)
    .attr("height", legendData.length * 31)
    .attr("transform", "translate(250, 220)"); // Adjust the x and y values as needed
;


    // Append legend items
    const legendItems = legendContainer
      .selectAll("g")
      .data(legendData)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`); // Adjust vertical spacing

    // Append color boxes
    legendItems
      .append("rect")
      .attr("class", "legend-item")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => d.color)
      .attr("x", 0);

    // Append category text
    legendItems
      .append("text")
      .attr("x", 30) // Position text to the right of the box
      .attr("y", 15) // Align text with the box
      .style("font-size", "14px")
      .attr("text-anchor", "start")
      .text((d) => d.category);
  }
  

  const descriptions = {
    "video-games": "Top 100 Most Sold Video Games Grouped by Platform",
    "movies": "Top 100 Highest Grossing Movies Grouped By Genre",
    "kickstarter": "Top 100 Most Funded Kickstarter Projects Grouped by Category"
  };

  return (
    <div>
      <h1 id="title">TOP 100</h1>
      {/* Dynamic description based on selected dataset */}
    <p id="description">
      {descriptions[dataset]}
    </p>

      {/* Navigation for switching datasets */}
      <nav>
        {Object.keys(dataUrls).map((key) => (
          <button
            key={key}
            onClick={() => {
              setDataset(key);
            }}
          >
            {key.replace("-", " ")}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alightItems: "flex-start" }}>
        {/* Treemap SVG */}
        <svg ref={svgRef} id="treemap"></svg>
        <svg id="legend" class="legend-item"></svg>{" "}
        {/* This is where your legend will be rendered */}
      </div>
    </div>
  );
};

export default Treemap;

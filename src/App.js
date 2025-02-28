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
    if (!data) return;

    console.log(data[dataset]); // Log the dataset you're working with

    // Clear previous treemap
    d3.select(svgRef.current).selectAll("*").remove();

    // Create root hierarchy
    const root = d3
      .hierarchy(data[dataset]) // Use selected dataset
      .eachBefore(
        (d) =>
          (d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
      )
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

      console.log(root);  // Log the entire hierarchical data structure

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

    // Append tiles (rect elements)
    const tiles = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      const platformColors = {
        2600: "#3366CC", // Lighter blue for 2600
        Wii: "#54A354", // Lighter green for Wii
        DS: "#FF4D61", // Lighter red for DS
        X360: "#808080", // Lighter gray for X360
        GB: "#00B3B3", // Lighter teal for GB
        PS3: "#9B3B9B", // Lighter purple for PS3
        NES: "#FFDB73", // Lighter gold for NES
        PS2: "#66FF66", // Lighter bright green for PS2
        SNES: "#FF8C4D", // Lighter orange for SNES
        GBA: "#FF7F80", // Lighter tomato red for GBA
        PS4: "#9A66B3", // Lighter purple for PS4
        "3DS": "#FF66B3", // Lighter deep pink for 3DS
        N64: "#4C914C", // Lighter dark green for N64
        PS: "#3333CC", // Lighter navy blue for PS
        XB: "#C47A47", // Lighter brown for XB
        PC: "#B3B3B3", // Lighter silver for PC
        PSP: "#3366FF", // Lighter blue for PSP
        XOne: "#E57373", // Lighter firebrick red for XOne
        Other: "#F2F2F2", // Lighter gray for Other
      };
      

    tiles
      .append("rect")
      .attr("class", "tile")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => {
        const categoryName = d.data.category; // Access platform name (change if necessary)
        // Map the platform name to a color, defaulting to "Other" if not found
        const platformColor =
          platformColors[categoryName] || platformColors["Other"];
        return platformColor;
      })
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value);

    tiles
      .append("text")
      .attr("x", 5)
      .attr("y", 15)
      .text((d) => d.data.name)
      .attr("font-size", "10px")
      .attr("fill", "white");
  }, [data, dataset]);

  return (
    <div>
      <h1 id="title">Treemap Diagram</h1>
      <p id="description">Visualization of {dataset.replace("-", " ")} data.</p>

      {/* Navigation for switching datasets */}
      <nav>
        {Object.keys(dataUrls).map((key) => (
          <button key={key} onClick={() => setDataset(key)}>
            {key.replace("-", " ")}
          </button>
        ))}
      </nav>

      {/* Treemap SVG */}
      <svg ref={svgRef} id="treemap"></svg>
    </div>
  );
};

export default Treemap;

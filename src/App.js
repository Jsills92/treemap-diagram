import './App.css';
import * as d3 from "d3";
import React, { useState, useEffect } from "react";


const Treemap = () => {
  const [data, setData] = useState(null);
  const [dataset, setDataset] = useState("video-games"); // Default dataset
  const dataUrls = {
    "kickstarter": "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    "movies": "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
    "video-games": "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
  };

  useEffect(() => {
    Promise.all([
      fetch(dataUrls["kickstarter"]).then(res => res.json()),
      fetch(dataUrls["movies"]).then(res => res.json()),
      fetch(dataUrls["video-games"]).then(res => res.json())
    ])
    .then(([kickstarter, movies, videoGames]) => {
      setData({
        "kickstarter": kickstarter,
        "movies": movies,
        "video-games": videoGames
      });
    })
    .catch(err => console.error("Error fetching data:", err));
  }, []);

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
      {/* Treemap SVG will go here */}
      <svg id="treemap"></svg>
    </div>
  );
};


export default Treemap;

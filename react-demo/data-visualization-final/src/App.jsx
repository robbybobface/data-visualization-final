import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "./style/d3.slider.css";
import "./style/style.css";
import * as d3 from "d3";
import { Box, Button, IconButton, Typography } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { styled, useTheme } from "@mui/material/styles";

const radius = 4;
const padding = 1;
const cluster_padding = 10;

const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 900 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
// Group coordinates and meta info.
const groups2021 = {
  Religion: {
    x: (496 / width) * width,
    y: (141 / height) * height,
    color: "#005F73",
    cnt: 0,
    fullname: "Religion",
  },
  Volunteering: {
    x: (581 / width) * width,
    y: (173 / height) * height,
    color: "#036C7C",
    cnt: 0,
    fullname: "Volunteering",
  },
  "Phone Calls": {
    x: (651 / width) * width,
    y: (231 / height) * height,
    color: "#057985",
    cnt: 0,
    fullname: "Phone Calls",
  },
  Miscellaneous: {
    x: (697 / width) * width,
    y: (310 / height) * height,
    color: "#2A9698",
    cnt: 0,
    fullname: "Misc.",
  },
  Sleeping: {
    x: (713 / width) * width,
    y: height / 2,
    color: "#0A9396",
    cnt: 0,
    fullname: "Sleeping",
  },
  "Personal Care": {
    x: (697 / width) * width,
    y: (490 / height) * height,
    color: "#4FB3AA",
    cnt: 0,
    fullname: "Personal Care",
  },
  "Eating and Drinking": {
    x: (651 / width) * width,
    y: (569 / height) * height,
    color: "#94D2BD",
    cnt: 0,
    fullname: "Eating & Drinking",
  },
  Education: {
    x: (581 / width) * width,
    y: (627 / height) * height,
    color: "#BFD5B2",
    cnt: 0,
    fullname: "Education",
  },
  Work: {
    x: (496 / width) * width,
    y: (659 / height) * height,
    color: "#E9D8A6",
    cnt: 0,
    fullname: "Work",
  },
  Housework: {
    x: (404 / width) * width,
    y: (659 / height) * height,
    color: "#ECBA53",
    cnt: 0,
    fullname: "Housework",
  },
  "Household Care": {
    x: (319 / width) * width,
    y: (627 / height) * height,
    color: "#EE9B00",
    cnt: 0,
    fullname: "Household Care",
  },
  "Household Services": {
    x: (249 / width) * width,
    y: (569 / height) * height,
    color: "#DC8101",
    cnt: 0,
    fullname: "Household Services",
  },
  "Non-Household Care": {
    x: (203 / width) * width,
    y: (490 / height) * height,
    color: "#C35303",
    cnt: 0,
    fullname: "Non-Household Care",
  },
  "Government Services": {
    x: (187 / width) * width,
    y: height / 2,
    color: "#CA6702",
    cnt: 0,
    fullname: "Government Services",
  },
  Shopping: {
    x: (203 / width) * width,
    y: (310 / height) * height,
    color: "#BB3E03",
    cnt: 0,
    fullname: "Shopping",
  },
  "Pro. Care Services": {
    x: (249 / width) * width,
    y: (231 / height) * height,
    color: "#AE2012",
    cnt: 0,
    fullname: "Pro. Care Services",
  },
  Leisure: {
    x: (319 / width) * width,
    y: (173 / height) * height,
    color: "#9B2226",
    cnt: 0,
    fullname: "Leisure",
  },
  Sports: {
    x: (404 / width) * width,
    y: (141 / height) * height,
    color: "#A4363A",
    cnt: 0,
    fullname: "Sports",
  },
  Traveling: {
    x: width / 2,
    y: height / 2,
    color: "#C78284",
    cnt: 0,
    fullname: "Traveling",
  },
};

// Force to increment nodes to groups.

function App() {
  const [people, setPeople] = useState({});
  // const [time, setTime] = useState(0);
  const [groups, setGroups] = useState(groups2021);
  const [nodes, setNodes] = useState([]);
  const [started, setStarted] = useState({ started: false, lastTime: 0 });

  const theme = useTheme();

  const groupLabelOffsets = (label) => {
    switch (label.fullname) {
      case "Religion":
        return { x: 10, y: -70 };
      case "Volunteering":
        return { x: 60, y: -70 };
      case "Phone Calls":
        return { x: 90, y: -40 };
      case "Misc.":
        return { x: 100, y: -20 };
      case "Sleeping":
        return { x: 105, y: 0 };
      case "Personal Care":
        return { x: 100, y: 20 };
      case "Eating & Drinking":
        return { x: 100, y: 40 };
      case "Education":
        return { x: 50, y: 50 };
      case "Work":
        return { x: 10, y: 70 };
      case "Housework":
        return { x: 10, y: 70 };
      case "Household Care":
        return { x: -60, y: 50 };
      case "Household Services":
        return { x: -100, y: 40 };
      case "Non-Household Care":
        return { x: -120, y: 20 };
      case "Government Services":
        return { x: -105, y: 0 };
      case "Shopping":
        return { x: -100, y: -20 };
      case "Pro. Care Services":
        return { x: -90, y: -40 };
      case "Leisure":
        return { x: -60, y: -70 };
      case "Sports":
        return { x: -10, y: -70 };
      case "Traveling":
        return { x: 0, y: 35 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const getCountPercentage = (count) => {
    const percentage = (count / 1000) * 100;
    if (percentage === 0) {
      return "0%";
    } else if (percentage > 0 && percentage < 1) {
      return "<1%";
    } else {
      return percentage.toFixed(0) + "%";
    }
  };

  const time = useRef(null);

  const timerLoop = useRef(null);

  function timer() {
    // console.log("time has started");
    console.log(started);
    console.log(time.current);
    if (!started.started) {
      return;
    }
    if (started.lastTime > time.current && started.lastTime !== null) {
      // console.log("this should not be running");
      time.current = started.lastTime;
    }

    if (started.lastTime === 0 && started.lastTime !== null) {
      time.current = 0;
      setStarted({ started: true, lastTime: null });
    }

    const tempGroups = groups;
    // console.log("time: " + time.current);
    // console.log("lastTime: " + started.lastTime);
    nodes.forEach(function (o, i) {
      // Increment time.
      let tempTime = time.current + 1;

      if (tempTime >= 1439) {
        // tempTime = time.current - 1;
      } else {
        // console.log(time + 1);

        const nextGroup = o.stages[tempTime];
        // console.log(nextGroup);

        if (nextGroup !== o.group) {
          groups[o.group].cnt -= 1;

          // Update current node to new group.
          o.group = nextGroup;

          // Increment counter for new group.
          groups[o.group].cnt += 1;
        }
      }
    });

    if (time.current < 1439) {
      time.current += 1;
    }

    // Update Time Visual
    d3.select("#timecount .cnt").text(time.current);

    // Update counters.
    d3.select("#chart1")
      .selectAll(".group-count")
      .text((d) => getCountPercentage(tempGroups[d].cnt));

    setGroups(tempGroups);
    // timerLoop = d3.timeout(timer, 500);
  } // @end timer()

  useEffect(() => {
    const svg1 = d3
      .select("#chart1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", [0, 0, width * 1.2, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", "translate(" + (margin.left + 40) + "," + 0 + ")");

    d3.select("#chart1").style(
      "width",
      width + margin.left + margin.right + "px"
    );
    // const svg2 = d3
    // 	.select("#chart2")
    // 	.append("svg")
    // 	.attr("width", width + margin.left + margin.right)
    // 	.attr("height", height + margin.top + margin.bottom)
    // 	.attr("viewBox", [0, 0, width * 1.1, height])
    // 	.append("g")
    // 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // d3.select("#chart2").style("width", width + margin.left + margin.right + "px");

    // const svg3 = d3
    // 	.select("#chart3")
    // 	.append("svg")
    // 	.attr("width", width + margin.left + margin.right)
    // 	.attr("height", height + margin.top + margin.bottom)
    // 	.append("g")
    // 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // d3.select("#chart3").style("width", width + margin.left + margin.right + "px");
    // // Load data.

    const stages = d3.csv("data/test-file.csv", d3.autoType);

    // Once the data is loaded...
    stages.then((data) => {
      const tempPeople = people;
      const tempGroups = groups2021;
      // Group data by pid.
      // The data file is one row per person
      data.forEach((d) => {
        if (Object.keys(tempPeople).includes(d.pid + "")) {
          tempPeople[d.pid].push(d);
        } else {
          // console.log(d.pid);
          tempPeople[d.pid] = [d];
        }
      });
      console.log(tempPeople);

      const nodes = Object.keys(tempPeople).map((pid) => {
        tempGroups[tempPeople[pid][0][0]].cnt += 1;
        return {
          id: "node" + pid,
          x: tempGroups[tempPeople[pid][0][0]].x + Math.random(),
          y: tempGroups[tempPeople[pid][0][0]].y + Math.random(),
          r: radius,
          color: tempGroups[tempPeople[pid][0][0]].color,
          group: tempPeople[pid][0][0],
          stages: tempPeople[pid][0],
        };
      });
      console.log(nodes);
      // console.log(tempGroups);

      // Circle for each node
      const circle1 = svg1
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("fill", (d) => d.color);

      // const circle2 = svg2
      // 	.append("g")
      // 	.selectAll("circle")
      // 	.data(nodes)
      // 	.join("circle")
      // 	.attr("cx", (d) => d.x)
      // 	.attr("cy", (d) => d.y)
      // 	.attr("fill", (d) => d.color);

      // const circle3 = svg3
      // 	.append("g")
      // 	.selectAll("circle")
      // 	.data(nodes)
      // 	.join("circle")
      // 	.attr("cx", (d) => d.x)
      // 	.attr("cy", (d) => d.y)
      // 	.attr("fill", (d) => d.color);

      // Ease in the circles.
      circle1
        .transition()
        .delay((d, i) => i * 5)
        .duration(800)
        .attrTween("r", (d) => {
          const i = d3.interpolate(0, d.r);
          return (t) => (d.r = i(t));
        });

      // circle2
      // 	.transition()
      // 	.delay((d, i) => i * 5)
      // 	.duration(800)
      // 	.attrTween("r", (d) => {
      // 		const i = d3.interpolate(0, d.r);
      // 		return (t) => (d.r = i(t));
      // 	});

      // circle3
      // 	.transition()
      // 	.delay((d, i) => i * 5)
      // 	.duration(800)
      // 	.attrTween("r", (d) => {
      // 		const i = d3.interpolate(0, d.r);
      // 		return (t) => (d.r = i(t));
      // 	});

      // Group Name Lables
      svg1
        .selectAll(".group-label")
        .data(Object.keys(tempGroups))
        .join("text")
        .attr("class", "group-label")
        .attr("text-anchor", "middle")
        .attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
        .attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y)
        .text((d) => tempGroups[d].fullname);

      // svg2.selectAll(".group-label")
      // 	.data(Object.keys(tempGroups))
      // 	.join("text")
      // 	.attr("class", "group-label")
      // 	.attr("text-anchor", "middle")
      // 	.attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
      // 	.attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y)
      // 	.text((d) => tempGroups[d].fullname);

      // svg3.selectAll(".group-label")
      // 	.data(Object.keys(tempGroups))
      // 	.join("text")
      // 	.attr("class", "group-label")
      // 	.attr("text-anchor", "middle")
      // 	.attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
      // 	.attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y)
      // 	.text((d) => tempGroups[d].fullname);

      // Group Count Lables
      svg1
        .selectAll(".group-count")
        .data(Object.keys(tempGroups))
        .join("text")
        .attr("class", "group-count")
        .attr("text-anchor", "middle")
        .attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
        .attr(
          "y",
          (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y + 20
        )
        .text((d) => getCountPercentage(tempGroups[d].cnt));

      // svg2.selectAll(".group-count")
      // 	.data(Object.keys(tempGroups))
      // 	.join("text")
      // 	.attr("class", "group-count")
      // 	.attr("text-anchor", "middle")
      // 	.attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
      // 	.attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y + 20)
      // 	.text((d) => getCountPercentage(tempGroups[d].cnt));

      // svg3.selectAll(".group-count")
      // 	.data(Object.keys(tempGroups))
      // 	.join("text")
      // 	.attr("class", "group-count")
      // 	.attr("text-anchor", "middle")
      // 	.attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
      // 	.attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y + 20)
      // 	.text((d) => getCountPercentage(tempGroups[d].cnt));

      // Forces
      const simulation = d3
        .forceSimulation(nodes)
        .force("x", (d) => d3.forceX(d.x))
        .force("y", (d) => d3.forceY(d.y))
        .force("cluster", forceCluster())
        .force("collide", forceCollide())
        .alpha(0.09)
        .alphaDecay(0);

      // Adjust position of circles
      simulation.on("tick", () => {
        circle1
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("fill", (d) => tempGroups[d.group].color);
        // circle2
        // 	.attr("cx", (d) => d.x)
        // 	.attr("cy", (d) => d.y)
        // 	.attr("fill", (d) => tempGroups[d.group].color);
        // circle3
        // 	.attr("cx", (d) => d.x)
        // 	.attr("cy", (d) => d.y)
        // 	.attr("fill", (d) => tempGroups[d.group].color);
      });

      function forceCluster() {
        const strength = 0.35;
        let nodes;

        function force(alpha) {
          const l = alpha * strength;
          for (const d of nodes) {
            d.vx -= (d.x - tempGroups[d.group].x) * l;
            d.vy -= (d.y - tempGroups[d.group].y) * l;
          }
        }
        force.initialize = (_) => (nodes = _);

        return force;
      }

      // Force for collision detection.
      function forceCollide() {
        const alpha = 0.2; // fixed for greater rigidity!
        const padding1 = padding; // separation between same-color nodes
        const padding2 = cluster_padding; // separation between different-color nodes
        let nodes;
        let maxRadius;

        function force() {
          const quadtree = d3.quadtree(
            nodes,
            (d) => d.x,
            (d) => d.y
          );
          for (const d of nodes) {
            const r = d.r + maxRadius;
            const nx1 = d.x - r,
              ny1 = d.y - r;
            const nx2 = d.x + r,
              ny2 = d.y + r;
            quadtree.visit((q, x1, y1, x2, y2) => {
              if (!q.length)
                do {
                  if (q.data !== d) {
                    const r =
                      d.r +
                      q.data.r +
                      (d.group === q.data.group ? padding1 : padding2);
                    let x = d.x - q.data.x,
                      y = d.y - q.data.y,
                      l = Math.hypot(x, y);
                    if (l < r) {
                      l = ((l - r) / l) * alpha;
                      (d.x -= x *= l), (d.y -= y *= l);
                      (q.data.x += x), (q.data.y += y);
                    }
                  }
                } while ((q = q.next));
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          }
        }

        force.initialize = (_) =>
          (maxRadius =
            d3.max((nodes = _), (d) => d.r) + Math.max(padding1, padding2));
        return force;
      }

      setPeople(tempPeople);
      setGroups(tempGroups);
      setNodes(nodes);
      // Start things off after a few seconds.
      // d3.timeout(timer, 5000);
    });
  }, []);

  useEffect(() => {
    // console.log("changed");
    if (!started.started) {
      // console.log("clear the damn interval");
      console.log("time on button: " + started.lastTime);
      if (started.lastTime === 0) {
        console.log("last time is 0");
      } else {
        clearInterval(timerLoop.current);
      }
    } else {
      // console.log("time on button: " + started.lastTime);
      if (started.lastTime === 0 || started.lastTime === null) {
        clearInterval(timerLoop.current);
        timerLoop.current = setInterval(timer, 500);
      } else {
        timerLoop.current = setInterval(timer, 500);
      }
    }
  }, [started]);

  return (
    <div className="App">
      <Typography sx={{ fontFamily: "Kulim Park", fontSize: "3.5rem" }}>
        <Typography
          component="span"
          sx={{
            color: "#C78284",
            fontFamily: "Kulim Park",
            fontSize: "3.5rem",
          }}
        >
          VISUALIZING
        </Typography>{" "}
        <Typography
          component="span"
          sx={{
            color: "#E2B0A6",
            fontFamily: "Kulim Park",
            fontSize: "3.5rem",
          }}
        >
          OUR
        </Typography>{" "}
        <Typography
          component="span"
          sx={{
            color: "#E8C9C3",
            fontFamily: "Kulim Park",
            fontSize: "3.5rem",
          }}
        >
          LIVES
        </Typography>{" "}
        <Typography
          component="span"
          sx={{
            color: "#EEE2DF",
            fontFamily: "Kulim Park",
            fontSize: "3.5rem",
          }}
        >
          IN
        </Typography>{" "}
        <Typography
          component="span"
          sx={{
            color: "#EAE1DC",
            fontFamily: "Kulim Park",
            fontSize: "3.5rem",
          }}
        >
          MOTION
        </Typography>
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          id="timecount"
          sx={{ fontSize: "2rem", textAlign: "center", ml: -2, mb: 2 }}
        >
          Time so far: <span className="cnt">{time.current}</span>
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" mb={-4}>
          <Button
            onClick={() => {
              setStarted((prevValue) => {
                return {
                  started: !prevValue.started,
                  lastTime: time.current,
                };
              });
            }}
            variant="contained"
            color={"seashell"}
            sx={{
              color: "black",
              textTransform: "none",
              fontFamily: "new-order",
              borderColor: "white",
              mr: 2,
            }}
          >
            <Typography sx={{ pt: 0.5, fontFamily: "new-order" }}>
              {!started.started ? "Start Simulation" : "Pause Simulation"}
            </Typography>
          </Button>
          {started.started && (
            <IconButton
              color="seashell"
              onClick={() => {
                setStarted({
                  ...started,
                  lastTime: 0,
                });
              }}
            >
              <RestartAltIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <div className="simulation-container">
        <div id="chart1" />
        {/* <div id='chart2' /> */}
        {/* <div id='chart3' /> */}
      </div>
    </div>
  );
}

export default App;

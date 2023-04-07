import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "./style/style.css";
import { select, csv, autoType, interpolate, forceSimulation, forceX, forceY, quadtree, max } from "d3";
import { Box, Button, ButtonGroup, IconButton, Typography } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTheme } from "@mui/material/styles";

const radius = 4;
const padding = 1.75;
const cluster_padding = 6;
const numOfDataPoints = 1250;

const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 900 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Group coordinates and meta info.
const defaultGroups = {
	Religion: {
		x: (496 / width) * width,
		y: (141 / height) * height,
		color: "#77373F",
		cnt: 0,
		fullname: "Religion",
	},
	Volunteering: {
		x: (581 / width) * width,
		y: (173 / height) * height,
		color: "#65414B",
		cnt: 0,
		fullname: "Volunteering",
	},
	"Phone Calls": {
		x: (651 / width) * width,
		y: (231 / height) * height,
		color: "#524B57",
		cnt: 0,
		fullname: "Phone Calls",
	},
	Miscellaneous: {
		x: (697 / width) * width,
		y: (310 / height) * height,
		color: "#405D67",
		cnt: 0,
		fullname: "Misc.",
	},
	Sleeping: {
		x: (713 / width) * width,
		y: height / 2,
		color: "#2E6F77",
		cnt: 0,
		fullname: "Sleeping",
	},
	"Personal Care": {
		x: (697 / width) * width,
		y: (490 / height) * height,
		color: "#0A9396",
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
		color: "#BF4903",
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
		color: "#892D33",
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
	const [people2021, setPeople2021] = useState({});
	const [speed, setSpeed] = useState("slow");
	const [showMore, setShowMore] = useState(false);
	// const [time, setTime] = useState(0);
	const [groups2021, setGroups2021] = useState({ ...defaultGroups });
	const [nodes2021, setNodes2021] = useState([]);
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
				return { x: 120, y: 0 };
			case "Personal Care":
				return { x: 100, y: 10 };
			case "Eating & Drinking":
				return { x: 100, y: 40 };
			case "Education":
				return { x: 50, y: 50 };
			case "Work":
				return { x: 10, y: 70 };
			case "Housework":
				return { x: -10, y: 70 };
			case "Household Care":
				return { x: -60, y: 50 };
			case "Household Services":
				return { x: -100, y: 40 };
			case "Non-Household Care":
				return { x: -130, y: 10 };
			case "Government Services":
				return { x: -130, y: 0 };
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
		const percentage = (count / numOfDataPoints) * 100;
		if (percentage === 0) {
			return "0%";
		} else if (percentage > 0 && percentage < 1) {
			return "<1%";
		} else {
			return percentage.toFixed(0) + "%";
		}
	};

	const getDelaySpeed = (speed) => {
		switch (speed) {
			case "slow":
				return 1000;
			case "medium":
				return 250;
			case "fast":
				return 50;
			default:
				return 500;
		}
	};

	const time = useRef(null);

	const timerLoop = useRef(null);

	function timer() {
		// console.log("time has started");
		// console.log(started);
		// console.log(time.current);
		if (!started.started) {
			return;
		}
		// for pause/resume
		if (started.lastTime > time.current && started.lastTime !== null) {
			// console.log("this should not be running");
			time.current = started.lastTime;
		}

		// for restart
		if (started.lastTime === 0 && started.lastTime !== null) {
			// console.log("is this hit");
			time.current = 0;
			setStarted({ started: true, lastTime: null });
			// return;
		}

		if (started.lastTime === 1439) {
			// console.log("should be exiting");
			return;
		}

		if (time.current === 1439) {
			time.current = null;
			setStarted({ started: false, lastTime: 0 });
			return;
		}
		// console.log("time: " + time.current);
		// console.log("lastTime: " + started.lastTime);
		nodes2021.forEach(function (o, i) {
			// Increment time.
			let tempTime = time.current + 1;

			if (tempTime >= 1439) {
				// time.current = 0;
				// setStarted({ started: true, lastTime: 1439 });
				return;
			} else {
				// console.log(time + 1);
				const nextGroup = o.stages[tempTime];
				// console.log(nextGroup);

				if (nextGroup !== o.group) {
					groups2021[o.group] = { ...groups2021[o.group], cnt: groups2021[o.group].cnt - 1 };

					// Update current node to new group.
					o.group = nextGroup;

					// Increment counter for new group.
					groups2021[o.group] = { ...groups2021[o.group], cnt: groups2021[o.group].cnt + 1 };
				}
			}
		});

		if (time.current < 1439) {
			time.current += 1;
		}

		// Update Time Visual
		select("#timecount .cnt").text(formatTime(time.current));

		// Update counters.
		select("#chart2021")
			.selectAll(".group-count")
			.text((d) => getCountPercentage(groups2021[d].cnt));

		// setGroups(tempGroups);
		// timerLoop = d3.timeout(timer, 500);
	} // @end timer()

	const formatTime = (localTime) => {
		let hours = Math.floor((localTime + 240) / 60);
		const minutes = localTime % 60;
		const ampm = hours < 12 ? "am" : hours >= 24 ? "am" : "pm";
		return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes < 10 ? "0" : ""}${minutes}${ampm}`;
	};

	useEffect(() => {
		const svg1 = select("#chart2021")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("viewBox", [0, 0, width * 1.2, height])
			.attr("preserveAspectRatio", "xMidYMid meet")
			.append("g")
			.attr("transform", "translate(" + (margin.left + 40) + "," + 0 + ")");

		select("#chart1").style("width", width + margin.left + margin.right + "px");

		// // Load data.
		const stages2021 = csv("data/processed_data_2021_v2.csv", autoType);

		// Once the data is loaded...
		stages2021.then((data) => {
			const tempPeople = {};
			const tempGroups = { ...groups2021 };
			// console.log(tempGroups);
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
			console.log(Object.keys(tempPeople).length);

			const nodes = Object.keys(tempPeople).map((pid) => {
				tempGroups[tempPeople[pid][0][0]] = {
					...tempGroups[tempPeople[pid][0][0]],
					cnt: tempGroups[tempPeople[pid][0][0]].cnt + 1,
				};
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
			console.log(Object.keys(nodes).length);
			console.log(tempGroups);

			// Circle for each node
			const circle1 = svg1
				.append("g")
				.selectAll("circle")
				.data(nodes)
				.join("circle")
				.attr("cx", (d) => d.x)
				.attr("cy", (d) => d.y)
				.attr("fill", (d) => d.color);

			// Ease in the circles.
			circle1
				.transition()
				.delay((d, i) => i * 5)
				.duration(800)
				.attrTween("r", (d) => {
					const i = interpolate(0, d.r);
					return (t) => (d.r = i(t));
				});

			// Group Name Lables
			svg1.selectAll(".group-label")
				.data(Object.keys(tempGroups))
				.join("text")
				.attr("class", "group-label")
				.attr("text-anchor", "middle")
				.attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
				.attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y)
				.text((d) => tempGroups[d].fullname);

			// Group Count Lables
			svg1.selectAll(".group-count")
				.data(Object.keys(tempGroups))
				.join("text")
				.attr("class", "group-count")
				.attr("text-anchor", "middle")
				.attr("x", (d) => tempGroups[d].x + groupLabelOffsets(tempGroups[d]).x)
				.attr("y", (d) => tempGroups[d].y + groupLabelOffsets(tempGroups[d]).y + 35)
				.text((d) => getCountPercentage(tempGroups[d].cnt));

			// Forces
			const simulation = forceSimulation(nodes)
				.force("x", (d) => forceX(d.x))
				.force("y", (d) => forceY(d.y))
				.force("cluster", forceCluster())
				.force("collide", forceCollide())
				.alpha(0.45)
				.alphaDecay(0);

			// Adjust position of circles
			simulation.on("tick", () => {
				circle1
					.attr("cx", (d) => d.x)
					.attr("cy", (d) => d.y)
					.attr("fill", (d) => tempGroups[d.group].color);
			});

			function forceCluster() {
				const strength = 0.07;
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
					const quadTree = quadtree(
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
						quadTree.visit((q, x1, y1, x2, y2) => {
							if (!q.length)
								do {
									if (q.data !== d) {
										const r = d.r + q.data.r + (d.group === q.data.group ? padding1 : padding2);
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

				force.initialize = (_) => (maxRadius = max((nodes = _), (d) => d.r) + Math.max(padding1, padding2));
				return force;
			}

			setPeople2021(tempPeople);
			setGroups2021(tempGroups);
			setNodes2021(nodes);
			// Start things off after a few seconds.
			// d3.timeout(timer, 5000);
		});
	}, []);

	useEffect(() => {
		// console.log("changed");
		if (!started.started) {
			// console.log("clear the damn interval");
			// console.log("time on button not started: " + started.lastTime);
			if (started.lastTime === 0) {
				// console.log("last time is 0");
				// setStarted({ started: true, lastTime: null });
				clearInterval(timerLoop.current);
			} else {
				clearInterval(timerLoop.current);
			}
		} else {
			// console.log("time on button started: " + started.lastTime);
			if (started.lastTime === 0 || started.lastTime === null) {
				// console.log("we got here");
				clearInterval(timerLoop.current);
				timerLoop.current = setInterval(timer, getDelaySpeed(speed));
			} else {
				timerLoop.current = setInterval(timer, getDelaySpeed(speed));
			}
		}
	}, [started]);

	useEffect(() => {
		clearInterval(timerLoop.current);
		timerLoop.current = setInterval(timer, getDelaySpeed(speed));
	}, [speed]);

	return (
		<div className='App'>
			<Typography sx={{ fontFamily: "Kulim Park", fontSize: "3.5rem" }}>
				<Typography
					component='span'
					sx={{
						color: "#C78284",
						fontFamily: "Kulim Park",
						fontSize: "4rem",
					}}>
					VISUALIZING
				</Typography>{" "}
				<Typography
					component='span'
					sx={{
						color: "#E2B0A6",
						fontFamily: "Kulim Park",
						fontSize: "4rem",
					}}>
					OUR
				</Typography>{" "}
				<Typography
					component='span'
					sx={{
						color: "#E8C9C3",
						fontFamily: "Kulim Park",
						fontSize: "4rem",
					}}>
					LIVES
				</Typography>{" "}
				<Typography
					component='span'
					sx={{
						color: "#EEE2DF",
						fontFamily: "Kulim Park",
						fontSize: "4rem",
					}}>
					IN
				</Typography>{" "}
				<Typography
					component='span'
					sx={{
						color: "#EAE1DC",
						fontFamily: "Kulim Park",
						fontSize: "4rem",
					}}>
					MOTION
				</Typography>
			</Typography>
			<Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' sx={{ mb: -10 }}>
				<Typography id='timecount' sx={{ fontSize: "2.5rem", textAlign: "center", mb: 2 }}>
					Time of day: <span className='cnt'>{time.current ? formatTime(time.current) : "4:00am"}</span>
				</Typography>
				{showMore && (
					<Box display='flex' justifyContent='center' alignItems='center' mb={-8}>
						<Button
							onClick={() => {
								if (started.lastTime === 1439) {
									// console.log("we are here");
									setStarted({
										...started,
										lastTime: 0,
									});
								} else {
									// console.log("flip the started value");
									setStarted((prevValue) => {
										return {
											started: !prevValue.started,
											lastTime: time.current,
										};
									});
								}
							}}
							variant='contained'
							color={"seashell"}
							sx={{
								color: "black",
								textTransform: "none",
								fontFamily: "new-order",
								borderColor: "white",
							}}>
							<Typography sx={{ pt: 1, fontFamily: "new-order", fontSize: "1.2rem", fontWeight: 500 }}>
								{!started.started
									? "Start Simulation"
									: started.lastTime === 1439
									? "Restart Simulation"
									: "Pause Simulation"}
							</Typography>
						</Button>
						{started.started && started.lastTime !== 1439 && (
							<IconButton
								color='seashell'
								onClick={() => {
									setStarted({
										...started,
										lastTime: 0,
									});
								}}>
								<RestartAltIcon />
							</IconButton>
						)}
					</Box>
				)}
			</Box>

			<div className='simulation-container'>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						ml: 5,
					}}>
					<div id='chart2021' />
					<Typography
						sx={{
							color: "#C78284",
							fontFamily: "Kulim Park",
							fontSize: "3.5rem",
							mt: -7,
						}}>
						2021
					</Typography>
				</Box>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-end",
						alignItems: "flex-end",
						mx: showMore ? -17 : -18,
					}}>
					{!showMore && (
						<Box display='flex' justifyContent='center' alignItems='center' mb={3}>
							<Button
								onClick={() => {
									if (started.lastTime === 1439) {
										// console.log("we are here");
										setStarted({
											...started,
											lastTime: 0,
										});
									} else {
										// console.log("flip the started value");
										setStarted((prevValue) => {
											return {
												started: !prevValue.started,
												lastTime: time.current,
											};
										});
									}
								}}
								variant='contained'
								color={"seashell"}
								sx={{
									color: "black",
									textTransform: "none",
									fontFamily: "new-order",
									borderColor: "white",
								}}>
								<Typography
									sx={{ pt: 1, fontFamily: "new-order", fontSize: "1.2rem", fontWeight: 500 }}>
									{!started.started
										? "Start Simulation"
										: started.lastTime === 1439
										? "Restart Simulation"
										: "Pause Simulation"}
								</Typography>
							</Button>
							{started.started && started.lastTime !== 1439 && (
								<IconButton
									color='seashell'
									onClick={() => {
										setStarted({
											...started,
											lastTime: 0,
										});
									}}>
									<RestartAltIcon />
								</IconButton>
							)}
						</Box>
					)}
					<ButtonGroup
						variant='text'
						size='small'
						aria-label='text button group'
						sx={{ pb: showMore ? 10 : 2.5, ml: -6 }}
						color='pinkToggle'>
						<Button
							variant={speed === "slow" ? "contained" : null}
							color='pinkToggle'
							onClick={() => setSpeed("slow")}
							sx={{ width: "115px" }}>
							<Typography
								sx={{
									color: speed === "slow" ? "white" : "#E2B0A6",
									fontFamily: "Kulim Park",
									fontSize: "1.7rem",
								}}>
								SLOW
							</Typography>
						</Button>
						<Button
							variant={speed === "medium" ? "contained" : null}
							color='pinkToggle'
							onClick={() => setSpeed("medium")}
							sx={{ width: "140px" }}>
							<Typography
								sx={{
									color: speed === "medium" ? "white" : "#E2B0A6",
									fontFamily: "Kulim Park",
									fontSize: "1.7rem",
								}}>
								MEDIUM
							</Typography>
						</Button>
						<Button
							variant={speed === "fast" ? "contained" : null}
							color='pinkToggle'
							onClick={() => setSpeed("fast")}
							sx={{ width: "115px" }}>
							<Typography
								sx={{
									color: speed === "fast" ? "white" : "#E2B0A6",
									fontFamily: "Kulim Park",
									fontSize: "1.7rem",
								}}>
								FAST
							</Typography>
						</Button>
					</ButtonGroup>
				</Box>
			</div>
		</div>
	);
}

export default App;

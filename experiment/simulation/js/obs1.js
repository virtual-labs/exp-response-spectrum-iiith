'use strict';

document.addEventListener('DOMContentLoaded', function(){

	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});

	function init()
	{
		rod = [[[startx - gap, endy - height[1]], [endx - gap, endy - height[1]], [endx - gap, endy], [startx - gap, endy]],
			[[startx + gap, endy - height[0]], [endx + gap, endy - height[0]], [endx + gap, endy], [startx + gap, endy]]];

		ground = [
			[startx - margin, starty + height[0] + 40],
			[startx - margin, starty + height[0]],
			[endx + margin, starty + height[0]],
			[endx + margin, starty + height[0] + 40],
		];

		radius = [mass[0] / 10000, mass[1] / 10000];
		ind = 0;
		const len = data.length;
		disp = [];
		vel = [];
		accl = [];
		disp.push(new Array(len).fill(0));
		vel.push(new Array(len).fill(0));
		accl.push(new Array(len).fill(0));
		disp.push(new Array(len).fill(0));
		vel.push(new Array(len).fill(0));
		accl.push(new Array(len).fill(0));

		time = new Array(len).fill(0);

		time.forEach(function(t, ind){
			time[ind] += ind * dt;
		});
	}

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 
		init();
		main();
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const sliders = ["mass1", "mass2", "stiff1", "stiff2", "groundMot"];
	sliders.forEach(function(elem, ind) {
		const slider = document.getElementById(elem);
		const output = document.getElementById("demo_" + elem);
		output.innerHTML = slider.value; // Display the default slider value

		slider.oninput = function() {
			output.innerHTML = this.value;

			if(ind < 2)
			{
				mass[ind] = Number(document.getElementById(elem).value);
			}

			else if(ind < 4)
			{
				stiff[ind - 2] = Number(document.getElementById(elem).value);
			}

			else
			{
				dataNum = Number(document.getElementById(elem).value);
				data = dataSets[dataNum - 1];
			}

			restart();
		};
	});

	function logic(obj)
	{
		const p = [...data];
		let temp = [];
		p.forEach(val => {
			temp.push(Math.abs(val));
		});

		const maxp = Math.max(...temp);
		const Wn = Math.sqrt(obj.stiffness / obj.mass);
		const Tn = 2 * Math.PI / Wn;

		p.forEach(function(val, ind){
			if(ind)
			{
				const num = ((-0.25 * g * p[ind]) + ((1 / (dt * dt)) + (1 / dt) * etta * Wn) * obj.disp[ind - 1] + ((1 / dt) + 0.5 * etta * Wn) * obj.vel[ind - 1] + 0.25 * obj.accl[ind - 1]);
				const denom = ((1 / (dt * dt)) + (1 / dt) * etta * Wn + 0.25 * Wn * Wn);
				obj.disp[ind] = num / denom;
				obj.accl[ind] = (4 / (dt * dt)) * (obj.disp[ind] - obj.disp[ind - 1] - (obj.vel[ind - 1] * dt) - (0.25 * dt * dt * obj.accl[ind - 1]));
				obj.vel[ind] = obj.vel[ind - 1] + (0.5 * dt * (obj.accl[ind - 1] + obj.accl[ind]));
			}
		});

		return Tn;
	}

	function drawGraph(Xaxis, Yaxis, title, id) {
		try {
			// render the plot using plotly
			const trace1 = {
				x: Xaxis,
				y: Yaxis,
				type: 'scatter'
			};

			const layout = {
				title: {
					text: title,
					font: {
						family: 'Courier New, monospace',
						size: 24
					},
				},
				width: 450,
				height: 450,
				xaxis: {
					title: {
						text: 'Time',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: 'Displacement',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					}
				}
			};

			const config = {responsive: true};
			const data = [trace1];
			Plotly.newPlot(id, data, layout, config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	const canvas = document.getElementById("main");
	canvas.width = 1200;
	canvas.height = 600;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5;
	const fps = 15;

	const dataSets = [data1, data2, data3, data4, data5, data6];
	const g = 9.81, dt = 0.02, etta = 0.05, scale = 100, grscale = 0.5; 

	let height = [180, 200];

	const startx = 596, endx = 600, margin = 150, starty = 220, gap = 100, endy = starty + height[0];
	
	let rod, ground, curr_displacement = 0; 

	// Input Parameters 
	let dataNum = 1, mass = [100000, 100000], stiff = [30000000, 30000000], data = dataSets[dataNum - 1];
	let disp, vel, accl, time, radius, ind;
	init();

	function drawGround(ctx, ground)
	{
		ctx.save();
		ctx.fillStyle = "pink";
		ctx.beginPath();
		ctx.moveTo(ground[0][0], ground[0][1]);

		ground.forEach(function(g, index){
			const next = (index + 1) % ground.length;
			ctx.lineTo(ground[next][0], ground[next][1]);
		});

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = fill;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		const gdisp = data[ind] * time[ind] * time[ind] * grscale / 2;
		ground.forEach(function(g, i){
			ground[i][0] += gdisp; 
		});
		drawGround(ctx, ground);
		ground.forEach(function(g, i){
			ground[i][0] -= gdisp;
		});

		rod.forEach(function(v, k){
			curr_displacement = disp[k][ind] * scale;
			const new_up_L = v[0][0] + curr_displacement;
			const new_up_R = v[1][0] + curr_displacement;

			ctx.beginPath();
			ctx.moveTo(new_up_L, v[0][1]);
			ctx.lineTo(new_up_R, v[1][1]);
			ctx.lineTo(v[2][0] + gdisp, v[2][1]);
			ctx.lineTo(v[3][0] + gdisp, v[3][1]);
			ctx.lineTo(new_up_L, v[0][1]);

			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(new_up_L - radius[k], v[0][1]);
			ctx.bezierCurveTo(new_up_L - radius[k], v[0][1] - radius[k], new_up_R + radius[k], v[0][1] - radius[k], new_up_R + radius[k], v[1][1]);
			ctx.bezierCurveTo(new_up_R + radius[k], v[1][1] + radius[k], new_up_L - radius[k], v[1][1] + radius[k], new_up_L - radius[k], v[0][1]);

			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		});

		ind = (ind + 1) % disp[0].length;
		tmHandle = window.setTimeout(draw, 1000 / fps);
	}

	function main()
	{
		mass.forEach(function(val, index) {
			let obj = {
				'stiffness': stiff[index],
				'mass': mass[index],
				'disp': [...disp[index]],
				'vel': [...vel[index]],
				'accl': [...accl[index]],
			};

			const Tn = logic(obj);

			disp[index] = [...obj.disp];
			vel[index] = [...obj.vel];
			accl[index] = [...obj.accl];
			const plotTitle = 'Time Period = ' + Tn.toFixed(3).toString();
			drawGraph(time, obj.disp, plotTitle, 'disB' + (index + 1).toString() + 'Plot');
		});
	}

	main();
	let tmHandle = window.setTimeout(draw, 1000 / fps);
})

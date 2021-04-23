'use strict';

document.addEventListener('DOMContentLoaded', function(){

	function init()
	{
		dataNum = 1;
		data = dataSets[dataNum - 1];

		etta = 0.05;
		timePeriod = 0.1;

		const len = data.length;
		disp = new Array(len).fill(0);
		vel = new Array(len).fill(0);;
		accl = new Array(len).fill(0);
		periods = [];

		for(let i = 0.1; i <= 4; i += 0.1)
		{
			periods.push(i);
		}
	}

	const sliders = ["etta", "groundMot", "timePeriod"];
	sliders.forEach(function(elem, ind) {
		const slider = document.getElementById(elem);
		const output = document.getElementById("demo_" + elem);
		output.innerHTML = slider.value; // Display the default slider value

		slider.oninput = function() {
			output.innerHTML = this.value;
			if(ind === 0)
			{
				etta = Number(document.getElementById(elem).value) / 100;
			}

			else if(ind === 1)
			{
				dataNum = Number(document.getElementById(elem).value);
				data = dataSets[dataNum - 1];
			}

			else
			{
				timePeriod = Number(document.getElementById(elem).value) / 1000;
			}

			main();
		};
	});

	function logic(obj)
	{
		let maxDisp = [], maxVel = [], maxAccl = [];
		const p = [...data];
		obj.periods.forEach(function(Tn, index){
			const Wn = 2 * Math.PI / Tn;
			maxDisp.push(0);
			maxVel.push(0);
			maxAccl.push(0);

			p.forEach(function(val, ind){
				if(ind)
				{
					obj.disp[ind] = ((-0.25 * g * p[ind]) + ((1 / (dt * dt)) + (1 / dt) * etta * Wn) * disp[ind - 1] + ((1 / dt) + 0.5 * etta * Wn) * obj.vel[ind - 1] + 0.25 * obj.accl[ind - 1]) / ((1 / (dt * dt)) + (1 / dt) * etta * Wn + 0.25 *Wn * Wn);
					obj.accl[ind] = (4 / (dt * dt)) * (disp[ind] - disp[ind - 1] - (obj.vel[ind - 1] * dt) - (0.25 * dt * dt * obj.accl[ind - 1]));
					obj.vel[ind] = obj.vel[ind - 1] + (0.5 * dt * (obj.accl[ind - 1] + obj.accl[ind]));

					maxDisp[index] = math.max(math.abs(obj.disp[ind]), maxDisp[index]);
					maxVel[index] = math.max(math.abs(obj.vel[ind]), maxVel[index]);
					maxAccl[index] = math.max(math.abs(obj.accl[ind]), maxAccl[index]);
				}
			});
		})

		const ret = {
			'maxDisp': maxDisp,
			'maxVel': maxVel,
			'maxAccl': maxAccl,
		};
		return ret;
	}

	function drawGraph(Xaxis, Yaxis, Ytext, id, point) {
		try {
			// render the plot using plotly
			let col = []
			Xaxis.forEach(function(val, ind){
				col.push("blue")
				if(ind === point)
				{
					col[ind] = "red";
				}
			});

			const trace1 = {
				x: Xaxis,
				y: Yaxis,
				type: 'scatter',
				mode: 'lines+markers',
				marker: {
					color: col
				}
			};
			
			const layout = {
				width: 450,
				height: 450,
				xaxis: {
					title: {
						text: 'Time Period',
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
				},
				yaxis: {
					title: {
						text: Ytext,
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

	const fps = 15;
	const dataSets = [data1, data2, data3, data4, data5, data6];
	const g = 9.81, dt = 0.02;

	// Input Parameters 
	let dataNum, etta, timePeriod, data;
	let disp, vel, accl, time, periods;
	init();

	function main()
	{
		let obj = {
			'periods': periods,
			'disp': disp,
			'vel': vel,
			'accl': accl,
		};

		obj = {...logic(obj)};
		drawGraph(periods, obj.maxDisp, 'Max Displacement', 'disPlot', timePeriod * 10 - 1);
		drawGraph(periods, obj.maxVel, 'Max Velocity', 'velPlot', timePeriod * 10 - 1);
		drawGraph(periods, obj.maxAccl, 'Max Acceleration', 'acclPlot', timePeriod * 10 - 1);
	}

	main(); 
})

const { BAM } = require('../NeuralNetwork.js');
const fs = require('file-system');
const PNG = require('pngjs').PNG;

const math = require('mathjs');

function png_to_text(path) {
	return new Promise(resolve => {
		let arr = [];
		fs.createReadStream(path)
		.pipe(
			new PNG({
			  filterType: 4,
			}) 
		)
		.on("parsed", function () {
			for (var y = 0; y < this.height; y++) {
			  for (var x = 0; x < this.width; x++) {
			    var idx = ((this.width * y + x) << 2) + 3;
			    if (this.data[idx] === 255) arr.push(1);
			    else arr.push(0);
			  }
			}
			if (arr.length === 25) resolve(arr);
		});
	});
}

function tests(net, dir) {
	const png = fs.readdirSync(dir);
	const ANSWER = {'1.png': 0, '2.png': 0, '3.png': 0, '4.png': 0, 'nothing': 0};
	Promise.all(png.map( (path) => {
		return new Promise(resolve => {
			const outp = {
				name: path,
				bin: null
			};

			png_to_text(dir + '/' + path)
			.then(val => {
				outp.bin = val;
				resolve(outp);
			});
		});
	}))
	.then(values => {
		// values.forEach(val => {
		// 	const outp = {'1.png': false, '2.png': false, '3.png': false, '4.png': false, 'nothing': false};
		// 	const { bin, name } = val;
		// 	let res = net.run(bin);
		// 	if (res[0] > 0.8) outp['1.png'] = true;
		// 	else if (res[1] > 0.8) outp['2.png'] = true;
		// 	else if (res[2] > 0.8) outp['3.png'] = true;
		// 	else if (res[3] > 0.8) outp['4.png'] = true;
		// 	else if (res[4] > 0.8) outp['nothing'] = true;
		// 	console.log(name, outp);
		// });

		values.forEach(val => {
			//const outp = {'1.png': 0, '2.png': 0, '3.png': 0, '4.png': 0, 'nothing': 0};
			const { bin } = val;
			let res = net.run(bin);
			if (res[0] > 0.8) ANSWER['1.png'] += 1;
			else if (res[1] > 0.8) ANSWER['2.png'] += 1;
			else if (res[2] > 0.8) ANSWER['3.png'] += 1;
			else if (res[3] > 0.8) ANSWER['4.png'] += 1;
			else if (res[4] > 0.8) ANSWER['nothing'] += 1;
		});

		console.log(ANSWER);
	});

}

const db = JSON.parse(fs.readFileSync('./db.json'));
const A = [[1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,-1,-1,1,-1,-1]];
const A_d = [[1,-1,-1,-1,1,1,1,-1,-1,1,1,-1,1,-1,1,1,-1,-1,1,1,1,-1,-1,-1,1]];

const net = new BAM();
net.init({
	input_cnt: 25,
	output_cnt: 20
});

net.train(db);
net.run(A);
net.run(A_d);


 
// fs.writeFileSync('./chart.json', JSON.stringify(chart));
// fs.writeFileSync('./chartLength.json', JSON.stringify(chartLength));




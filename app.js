const tnef = require('node-tnef');
const express = require('express');
const multer = require('multer');
const jszip = require('jszip');

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * (1024 * 1024 * 8) } });

app.use(express.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
	tnef.parse(req.file.path, (err, files) => {
		if(err) {
			res.send({ status: 'error', message: 'Parsing of TNEF file failed!' });
			return;
		}
		let zip = new jszip();
		files.forEach((file) => zip.file(file.Title, new Buffer(file.Data)));
		res.writeHead(200, {
			'Content-disposition': 'attachment;filename=winmail.zip',
			//'Content-Length': data.length
		})
		zip.generateNodeStream({type:'nodebuffer',streamFiles:true}).pipe(res);
	});
});

app.listen(8080, () => console.log('App running on port 8080'));

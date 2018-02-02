const tnef = require('node-tnef');
const express = require('express');
const multer = require('multer');
const jszip = require('jszip');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * (1024 * 1024 * 8) } });

app.use(express.static('public'));
app.post('/upload', upload.single('file'), (req, res) => {
	tnef.parse(req.file.path, (err, files) => {
		if(err) {
			res.send({ status: 'error', message: 'Parsing of TNEF file failed!' });
			removeUpload(req.file.path);
			return;
		}
		let zip = new jszip();
		files.forEach((file) => zip.file(file.Title, new Buffer(file.Data)));
		zip.generateAsync({type: "nodebuffer"}).then((buffer) => {
			res.writeHead(200, {
				'Content-disposition': 'attachment;filename=winmail.zip',
				'Content-Length': buffer.length
			})
			res.end(buffer);
			removeUpload(req.file.path);
		});
	});
});

function removeUpload(file) {
	fs.access(file, fs.constants.W_OK, (err) => {
		if(err) {
			return console.warn('Attempted to remove inaccessible file!', file);
		}
		fs.unlink(file, (err) => { if(err) console.warn('Unexpected error removing file:', err) });
	});
}

app.listen(8080, () => console.log('App running on port 8080'));

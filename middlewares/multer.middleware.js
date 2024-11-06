const multer = require('multer');

exports.upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => cb(null, 'path'),
		filename: async (req, file, cb) => {
			cb(
				null,
				`${new Date().getTime()}-${file.fieldname}.${
					file.mimetype.split('/')[1]
				}`
			);
		},
	}),
});

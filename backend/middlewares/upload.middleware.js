const multer = require('multer');
const path = require('path');

const fileFilter = (req,file,cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.png','.jpg','.jpeg','.jfif','.webp','.gif'];
    if(!allowed.includes(ext)){
        return cb(new Error('Only Images Allowed'), false);
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null, 'uploads');
    },
    filename:(req,file,cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const MB = 1024 * 1024;

const upload = multer({
    storage,
    fileFilter,
    limits:{fileSize: MB * 2}
});

module.exports = {upload};

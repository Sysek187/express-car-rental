const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(path.join(__dirname, '../public/cars'));
        cb(null, path.join(__dirname, '../public/cars'));
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({storage:storage});

const uploadFile = async (req, res, next) => {
    upload(req,res,function(err) {
        if(err) {
            console.log(err);
        }
        console.log(req.file);
        next();
    });
    
}

module.exports = {
    uploadFile
}
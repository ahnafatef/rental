const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const uploadsPath = path.join(process.cwd(), 'uploads');
const upload = multer({dest: uploadsPath});
const fs = require('fs');
const im = require('imagemagick');

// const resize = require('./resize.js');
// const identify = require('./identify.js');
const Car = require('./car.js').default;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/rentalapp", {useNewUrlParser:true, useUnifiedTopology: true});

app.get('/', (req, res) => {
    res.send('hello');
});

app.post('/addcar', upload.single('carimage'), (req, res) => {
    
    let imgFilePath;
    try {
        imgFilePath = path.join(uploadsPath, req.file.filename);
    } catch(Error) {
        imgFilePath = '';
        console.log(Error);
    }
    
    if (req.file && req.file.mimetype.includes('image')) {


        const {width, height} = im.identify(imgFilePath, (err, features) => {
            if (err) throw err
            const {width, height} = features;

            if(width !== 1280 && height !== 800) {
                
                let newFilename = imgFilePath + '_resized';
                sharp(imgFilePath)
                .resize(1280, 800)
                .toFile(newFilename)
                .then( data => {
                    let car = new Car(req.body);
                    let updatedImgFilePath = path.join(uploadsPath, String(car._id));
                    let imageExt = path.extname(req.file.originalname);
                    
                    let newFileName2 = updatedImgFilePath + imageExt;
                    fs.rename(newFilename, newFileName2, err => {
                        if (err) console.log(err);
                        fs.unlink(imgFilePath, (err) => {
                            if (err) console.log(err);
                        })
                    });
                    car.save((err, data) => {
                        if(err){
                            return res.status(400).json({msg: 'something wrong'});
                        } else {
                            return res.status(200).json({msg: 'all good'});
                        }
                    });
                }).catch( err => {console.log(err);});
            }
            else {
                let car = new Car(req.body);
                let updatedImgFilePath = path.join(uploadsPath, String(car._id));
                let imageExt = path.extname(req.file.originalname);
                
                let newFileName2 = updatedImgFilePath + imageExt;
                fs.rename(imgFilePath, newFileName2, err => {
                    if (err) console.log(err);
                });
                car.save((err, data) => {
                    if(err){
                        return res.status(400).json({msg: 'something wrong'});
                    } else {
                        return res.status(200).json({msg: 'all good'});
                    }
                });
            }
        });
    }
    else{
        fs.access(imgFilePath, (err) => {
            if (err) {
                console.log(err);
                return res.status(400).json({msg: 'file missing'});
            }
            fs.unlink(imgFilePath, (err)=>{
                if(err) console.log(err);
                return res.status(400).json({msg: 'Invalid file'});
            });
        });
    }
});

app.listen(3000, 'localhost', () => {
    console.log('server started...');
});
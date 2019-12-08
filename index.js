const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const sharp = require('sharp');
const uploadsPath = path.join(process.cwd(), 'uploads');
const upload = multer({dest: uploadsPath});
const fs = require('fs');
const im = require('imagemagick');
const _ = require("lodash");
const flash = require("connect-flash");


// const resize = require('./resize.js');
// const identify = require('./identify.js');
const userRoutes = require('./routes/user.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const Car = require('./models/car.js');
const User = require('./models/user.js');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));
// app.use(cookieParser('secret'));
app.use(compress());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// app.use(require("express-session")({
//     secret: "this is a secret, thank you",
//     resave: false,
//     saveUninitialized: false
// }));

// app.use(flash());

mongoose.connect("mongodb://localhost:27017/rentalapp", {useNewUrlParser:true, useUnifiedTopology: true});


// app.use(function(req,res,next){
//     res.locals.error = req.flash("error");
//     res.locals.success = req.flash("success");
//     res.locals.path = req.path;
//     res.locals.user = '';
//     next();
// });

// app.use('/', userRoutes);
// app.use('/', authRoutes);


//==========================
// home start
app.get('/', function(req, res){
    res.render("home");
});
//==========================
// home end


//==========================
// about start
app.get('/about', function(req,res){
    res.render('about');
});
//==========================
// about end


//==========================
// signup start
app.get('/signup', function(req,res){
    res.render('register');
});
//==========================
// signup end


//==========================
// login start
app.get('/login', function(req,res){
    // console.log(error);
    res.status('200').render('login');
});
//==========================
// login end


//==========================
// contact start
app.get('/contact', function(req,res){
    res.render('contact');
});
//==========================
// contact end


app.get('/user', function(req, res){
    User.find({}).populate('cars').exec(function(err, users){
        if(err) return res.status('400').json({msg:'could not get data'})
        // console.log(users);
        return res.status('200').json({data: users})
    })
})


app.post('/user/create', function(req, res){
    let user = new User(req.body);
    User.find({'email': user.email}, function(err, users){
        if(err) return res.status('400').json({msg: 'something wrong'})
        if(users.length)
            return res.status('400').json({msg: 'email already being used'});
        user.save(function(err, user){
            if(err) return res.status('400').json({msg: 'all fields required'});
            
            return res.status('200').json({msg: 'user saved'});
        })
    })
})


app.get('/user/:userId/cars', function(req, res){
    userid = req.params.userId;
    User.findOne({'_id': userid}).populate('cars').exec(function(err, user){
        if (err) return res.status('400').json({msg: "error"});
        
        console.log(user.cars);
        return res.status('200').json({data: user.cars})
    })
})



// addcar route start
//=================================
app.post('/user/:userId/addcar', upload.single('carimage'), (req, res) => {
    let userid = req.params.userId;
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
                    car.owner.push(userid);
                    User.findOne({'_id': userid}, function(err, user){
                        if(err) return res.status('400').json({msg: "error"});

                        user.cars.push(car._id);
                        user.save();
                        let updatedImgFilePath = path.join(uploadsPath, String(car._id));
                        let imageExt = path.extname(req.file.originalname);
                        
                        let newFileName2 = updatedImgFilePath + imageExt;
                        fs.rename(newFilename, newFileName2, err => {
                            if (err) console.log(err);
                            fs.unlink(imgFilePath, (err) => {
                                if (err) console.log(err);
                            });
                        });
                        car.save((err, data) => {
                            if(err){
                                return res.status(400).json({msg: 'something wrong'});
                            } else {
                                return res.status(200).json({data: data});
                            }
                        });
                    });

                }).catch( err => {console.log(err);});
            }
            else {
                let car = new Car(req.body);
                car.owner.push(userid)
                let updatedImgFilePath = path.join(uploadsPath, String(car._id));
                let imageExt = path.extname(req.file.originalname);
                
                let newFileName2 = updatedImgFilePath + imageExt;
                fs.rename(imgFilePath, newFileName2, err => {
                    if (err) console.log(err);
                });

                User.findOne({'_id': userid}, function(err, user){
                    if(err) return res.status('400').json({msg: "error"})
                    
                    user.cars.push(car._id);
                    user.save();
                    car.save((err, data) => {
                        if(err){
                            return res.status(400).json({msg: 'something wrong'});
                        } else {
                            return res.status(200).json({data: data});
                        }
                    });
                })
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
// addcar route end
//=================================


app.get('/car/:carId', function(req, res){
    Car.findOne({'_id': req.params.carId}, function(err, car){
        if(err) return res.status('400').json({msg: "car not found"});

        return res.status('200').json({data: car});
    })
})

app.get('/cars', function(req, res){
    Car.find({}, function(err, cars){
        if(err) return res.status('400').json({msg: "cars not found"})

        console.log(cars);
        // return res.status(200).json({cars: cars})
        return res.render('cars', {cars: cars});
    })
})

// catch all route start
//=====================
app.get('*', function(req, res){
    res.render('404');
});

app.post('*', function(req, res){
    res.render('404');
});
// catch all end
//=====================


// Catch unauthorised errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({"error" : err.name + ": " + err.message})
    }
  })

// app.use(function(req,res,next){
//     res.locals.error = req.flash("error");
//     res.locals.success = req.flash("success");
//     res.locals.path = req.path;
//     next();
// });


app.listen(3000, 'localhost', () => {
    console.log('server started...');
});
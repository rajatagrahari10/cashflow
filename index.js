var express = require('express');
var multer=require('multer');
var path=require('path');
var jwt=require('jsonwebtoken');

var empModel=require('../module/employee');
var uploadModel=require('../module/upload');
var router = express.Router();

var employee=empModel.find({});
var imagedata=uploadModel.find({});

router.use(express.static(__dirname+"./public/"));

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
 


var storage=multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});
var upload=multer({
  storage:storage
}).single('file');



router.post('/upload',upload, function(req, res, next) {

  var imageFile=req.file.filename;
  var success=req.file.filename+" uploaded successfully !";

  var imageDetails=new uploadModel({

    imagename:imageFile,
  });
  imageDetails.save(function(err,doc){
    if(err) throw err;

    imagedata.exec(function(err,data){

      if(err) throw err;
      res.render('upload-file', { title: 'Upload File',records:data,success:success});

    }); 
    

  });
});

  router.get('/upload',function(req, res, next) {

  
  
    imagedata.exec(function(err,data){
      if(err) throw err;
  res.render('upload-file', { title: 'Upload File', records:data, success:'' });
    });
  
  
  
  });

  function checkLogin(req,res,next){
    var myToken= localStorage.getItem('myToken');
    try {
     jwt.verify(myToken, 'loginToken');
    } catch(err) {
      res.send ("you need login to access this page");
    }
    next();
  }



/* GET home page. */
router.get('/',checkLogin, function(req, res, next) {

   employee.exec(function(err,data){
     if(err) throw err;
     res.render('index', { title: 'Employee Records', records:data,success:''});

   })
  
});

router.get('/login',function(req, res, next) {

  var token = jwt.sign({ foo: 'bar' }, 'loginToken');
  localStorage.setItem('myToken', token);
  res.send("Login Successfully");
});

router.get('/logout',function(req, res, next) {

  localStorage.removeItem('myToken');
  res.send("Logout Successfully");
  
});

router.post('/', function(req, res, next) {

  var empDetails=new empModel({

    name:req.body.uname,
    email:req.body.email,
    etype:req.body.emptype,
    hourlyrate:req.body.hrlyrate,
    totalHour:req.body.ttlhr,
   //total:parseInt(req.body.hourlyrate)* parseInt(req.body.ttlhr),
  });
  empDetails.save(function(err,res1){
    if(err) throw err;
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data,success:'Record Inserted Successfully !'});
  
    });
  });

 
 
});

router.post('/search/', function(req, res, next) {

  var flrtName = req.body.fltrname;
  var flrtEmail = req.body.fltremail;
  var fltremptype = req.body.fltremptype;
  
  if(flrtName !='' && flrtEmail !='' && fltremptype !='' ){

   var flterParameter={ $and:[{ name:flrtName},
  {$and:[{email:flrtEmail},{etype:fltremptype}]}
  ]
   }
  }else if(flrtName !='' && flrtEmail =='' && fltremptype !=''){
    var flterParameter={ $and:[{ name:flrtName},{etype:fltremptype}]
       }
  }else if(flrtName =='' && flrtEmail !='' && fltremptype !=''){

    var flterParameter={ $and:[{ email:flrtEmail},{etype:fltremptype}]
       }
  }else if(flrtName =='' && flrtEmail =='' && fltremptype !=''){

    var flterParameter={etype:fltremptype
       }
  }else{
    var flterParameter={}
  }
  var employeeFilter =empModel.find(flterParameter);
  employeeFilter.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data });
        });
  
  
});

router.get('/delete/:id', function(req, res, next) {
    
    var id=req.params.id;
    var del=empModel.findByIdAndDelete(id);
    
  del.exec(function(err){
    if(err) throw err;
   
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data,success:'Record Deleted  Successfully !'});
  
    });
  });
 
});

router.get('/edit/:id', function(req, res, next) {
    
  var id=req.params.id;
  var edit=empModel.findById(id);
  
edit.exec(function(err,data){
  if(err) throw err;
  res.render('edit',{ title: 'Update Employee Records', records:data })

});

router.post('/update/', function(req, res, next) {
    
 
  var update=empModel.findByIdAndUpdate(req.body.id,{name:req.body.uname,
    email:req.body.email,
    etype:req.body.emptype,
    hourlyrate:req.body.hrlyrate,
    totalHour:req.body.ttlhr,
  });
  
update.exec(function(err,data){
  if(err) throw err;
  
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data,success:'Record updated  Successfully !'});
  
    });

  });
  });
});





module.exports = router;

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');

const base_path = path.resolve();
var current_path = base_path;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, current_path)
  },
  filename: (req, file, cb) =>{
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
  current_path = base_path;
  let list = FilesAndFolders(current_path);
  res.json(list);
});

router.get('/delete', function(req,res,next){
  if (req.query.is_file == true ) {
    fs.unlink(`${current_path}\\${req.query.name}`, (err) => {
      if (err) throw err;
    });
  } else {
    fs.rmdirSync(`${current_path}\\${req.query.name}`);
  }
  let list = FilesAndFolders(current_path);
  res.json(list);
});

router.post('/upload', upload.single('filedata') ,function(req,res,next){
  let filedata = req.file;
  if(!filedata){
    res.send('Ошибка загрузки файла!');
  } else {
    let list = FilesAndFolders(current_path);
    res.json(list);
  }
});

router.get('/back', function(req, res, next) {
   let check_path = current_path.slice(0, current_path.lastIndexOf('\\'));
   if(check_path.length >= base_path.length){
     current_path = check_path;
   } else {
     current_path = base_path;
   }
   let list = FilesAndFolders(current_path);
   res.json(list);
});

router.get('/forward', function(req,res,next){
  if(req.query.is_file == 'false'){
    current_path = `${current_path}\\${req.query.name}`;
  } 
  let list = FilesAndFolders(current_path);
  res.json(list);
});

function FilesAndFolders(current_path){
   let ListFilesAndFolders = [];
   fs.readdirSync(current_path).forEach(function(item){
     let absolut_path = path.join(current_path,item);
     let stats = fs.lstatSync(absolut_path)
     ListFilesAndFolders.push({ 
        name: item ,
        is_file:  stats.isFile(),
        size: stats.size ,
        modification_date : stats.mtime 
     })
   }) 
   return ListFilesAndFolders;
}

module.exports = router;

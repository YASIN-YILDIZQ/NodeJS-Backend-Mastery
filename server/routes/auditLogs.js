var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    body:req.body,
    query:req.query,
    params:req.params,
    headers:req.headers,
    url:req.url,
    method:req.method
    
  });
});

module.exports = router;

const express = require('express');
const Response = require('../lib/Response');
const Categories = require('../db/models/Categories');
const ErrorCostumer = require('../lib/ErrorCostumer');
const router = express.Router();
const AuditLogsLib = require('../lib/AuditLogs');
const Enum=require('../config/Enum')
const  logger = require('../lib/logger/LoggerClass');

// GET categories
router.get('/', async (req, res) => {
    try {
        const categories = await Categories.find({});
        res.json(Response.successRespose(categories));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response.errorRespose(error));
    }
});

// POST add category
router.post("/add", async (req, res) => {
    try {
      if(!req.body.category_name){
        throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,"Kategori adı boş bırakılamaz")
      }
      const categoryCheck = await Categories.findOne({ category_name: req.body.category_name });
      
      if(categoryCheck){
        throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,"Kategori adı zaten mevcut")
      
      }
        const category = await Categories.create(req.body);
        AuditLogsLib.info(req.user?.email,"Categories","Kategori eklendi",category)
        logger.info(req.user?.email,"Categories","Kategori eklendi",category)

       
        res.json(Response.successRespose(category));
    } catch (error) {
      logger.error(req.user?.email,"Categories","Kategori eklendi",error)
        console.error(error);
        res.status(500).json(Response.errorRespose(error));
    }
});

// PUT update category
router.put("/update", async (req, res) => {

  if(!req.body.category_name||!req.body._id){
    throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,"Kategori adı veya  Id alanı boş bırakılamaz")
  }
    try {
        const category = await Categories.findByIdAndUpdate(req.body._id, req.body, { new: true });
        if (!category) {
            return res.status(404).json(Response.errorRespose({ message: "Kategori bulunamadı" }));
        }
        AuditLogsLib.info(req.user?.email,"Categories","Kategori güncellendi",{_id:req.body._id, ...category})

        res.json(Response.successRespose(category));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response.errorRespose(error));
    }
});

// DELETE delete category
router.delete("/delete", async (req, res) => {
  if(!req.body._id){
    throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,"Id alanı boş bırakılamaz")
  }
    try {
        const category = await Categories.findByIdAndDelete(req.body._id);
        if (!category) {
            return res.status(404).json(Response.errorRespose({ message: "Kategori bulunamadı" }));
        }
        AuditLogsLib.info(req.user?.email,"Categories","Kategori silindi",{_id:req.body._id})

        res.json(Response.successRespose(category));
    } catch (error) {
        console.error(error);
        res.status(500).json(Response.errorRespose(error));
    }
});

module.exports = router;

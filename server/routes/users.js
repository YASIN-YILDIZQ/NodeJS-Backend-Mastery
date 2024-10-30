var express = require('express');
var router = express.Router();
const Enum = require('../config/Enum');
const bcrypt = require('bcrypt');
const ErrorCostumer = require('../lib/ErrorCostumer');  
const Users = require('../db/models/Users');
const Role = require('../db/models/Roles'); // Eksik import edilen model eklendi
const UserRoles = require('../db/models/UserRoles'); // Eksik import edilen model eklendi
const is = require('is_js');
const Response = require('../lib/Response');

/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(Response.successRespose(users));
  } catch (error) {
    const errorRespose = Response.errorRespose(error);
    res.status(errorRespose.code).json(errorRespose);
  }
});

/* POST add user */
router.post('/add', async (req, res) => {
  try {
    const { first_name, email, password } = req.body;
    if (!first_name || !password) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Kullanıcı adı veya şifre boş bırakılamaz");
    }
    if (is.not.email(email)) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Geçerli bir email adresi giriniz");
    }
    if (password.length < Enum.PASS_LENGTH) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Şifre en az 8 karakter olmalıdır");
    }

    const userExists = await Users.findOne({ email });
    if (userExists) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Kullanıcı adı zaten mevcut");
    }
if(!req.body.roles||!Array.isArray(req.body.roles)||req.body.roles.length===0){
  throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Rol alanı boş bırakılamaz");
}
let  roles= await Role.find({_id:{$in:req.body.roles}})
if(roles.length==0) {
 throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Rol alanı boş bırakılamaz");
}
if(!roles||roles.length===0){
  throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Rol alanı bos�� bırakılamaz");
}
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const user = await Users.create({ ...req.body, password: hashedPassword });

 for(let  i = 0; i < roles.length; i++) {
   await UserRoles.create({
     user_id: user._id,
     role_id: roles[i]._id
   })
 }

    res.status(201).json(Response.successRespose(user, Enum.HTTP_CODES.CREATED));
  } catch (error) {
    const errorRespose = Response.errorRespose(error);
    res.status(errorRespose.code).json(errorRespose);
  }
});

/* PUT update user */
router.put('/update', async (req, res) => {
  try {
    if (!req.body || !req.body._id) {
      return res.status(400).json(Response.errorRespose({ message: "Id alanı boş bırakılamaz" }));
    }
    
    const { _id, password } = req.body;

    const updateData = { ...req.body };
    if (password) {
      updateData.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }

    if (Array.isArray(req.body.roles) && req.body.roles.length > 0) {
      let userRoles = await UserRoles.find({ user_id: req.body._id });
      let removeRoles = userRoles.filter(x => !req.body.roles.includes(x.role_id.toString()));
      let newRoles = req.body.roles.filter(x => !userRoles.map(y => y.role_id.toString()).includes(x));

      if (removeRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removeRoles.map(x => x._id) } });
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          await UserRoles.create({
            user_id: req.body._id,
            role_id: newRoles[i]
          });
        }
      }
    }

    const user = await Users.findByIdAndUpdate(_id, updateData, { new: true });
    if (!user) {
      return res.status(404).json(Response.errorRespose({ message: "Kullanıcı bulunamadı" }));
    }

    res.json(Response.successRespose(user));
  } catch (error) {
    console.error(error);
    res.status(500).json(Response.errorRespose({ message: error.message }));
  }
});


/* DELETE delete user */
router.delete('/delete', async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Id alanı boş bırakılamaz");
    }

    const user = await Users.findByIdAndDelete(_id);
    await UserRoles.deleteMany({ user_id: _id });
    if (!user) {
      return res.status(404).json(Response.errorRespose({ message: "Kullanıcı bulunamadı" }));
    }

    res.json(Response.successRespose({ message: "Kullanıcı başarıyla silindi" }));
  } catch (error) {
    console.error(error);
    res.status(500).json(Response.errorRespose(error));
  }
});

/* GET register user with SUPER_ADMIN role */
router.post('/register', async (req, res) => {
  try {
    const body = req.body;

    let  user=await Users.findOne({})
    if(user){
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND)
    }
    // Kullanıcı adı ve şifre kontrolü
    if (!body.first_name || !body.password) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Kullanıcı adı veya şifre boş bırakılamaz");
    }
    
    // Email doğrulama
    if (is.not.email(body.email)) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Geçerli bir email adresi giriniz");
    }
    
    // Şifre uzunluk kontrolü
    if (body.password.length < Enum.PASS_LENGTH) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, `Şifre en az ${Enum.PASS_LENGTH} karakter olmalıdır`);
    }

    // Kullanıcı mevcut mu?
    const userExists = await Users.findOne({ email: body.email });
    if (userExists) {
      throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST, "Bu email ile kayıtlı kullanıcı zaten mevcut");
    }

    // Şifre hashleme
    const hashedPassword = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10));
    const newUser = await Users.create({ ...body, password: hashedPassword });

    // Role atanması
    const role = await Role.create({ role_name: Enum.SUPER_ADMIN,created_by:newUser._id ,is_active:true }); 
    if (!role) {
      throw new ErrorCostumer(Enum.HTTP_CODES.INTERNAL_ERROR, "rolü bulunamadı");
    }
    await UserRoles.create({ user_id: newUser._id, role_id: role._id });

    res.status(201).json(Response.successRespose(newUser, Enum.HTTP_CODES.CREATED));
  } catch (error) {
    const errorRespose = Response.errorRespose(error);
    res.status(errorRespose.code||500).json(errorRespose);
  }
});

module.exports = router;

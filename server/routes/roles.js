const express = require('express');
const Response = require('../lib/Response');  
const Role = require('../db/models/Roles'); 
const ErrorCustomer = require('../lib/ErrorCostumer');
const RolePrivilege = require('../db/models/RolePrivileges');
const Enum = require('../config/Enum');
const rolePrivileges = require('../config/role_privileges');

const router = express.Router();

/**
 * GET - Tüm Rolleri Getir
 */
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json(Response.successRespose(roles));
  } catch (error) {
    res.status(500).json(Response.errorRespose(error));
  }
});

/**
 * POST - Yeni Rol Ekle
 */
router.post('/add', async (req, res) => {
  try {
    const { role_name, permission } = req.body;
    
    if (!role_name) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, "Invalid role name");
    }

    if (!permission || !Array.isArray(permission) || permission.length === 0) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, "Invalid permission");
    }

    const roleExists = await Role.findOne({ role_name });
    if (roleExists) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, "Role name already exists");
    }

    const role = await Role.create(req.body);
    await Promise.all(permission.map(perm => RolePrivilege.create({ role_id: role._id, permission: perm })));

    res.json(Response.successRespose(role));
  } catch (error) {
    res.status(error.code || 500).json(Response.errorRespose(error));
  }
});

/**
 * PUT - Rol Güncelle
 */
router.put('/update', async (req, res) => {
  try {
    const { _id, role_name, permission } = req.body;

    if (!role_name) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, "Invalid role name");
    }

    const existingPermissions = await RolePrivilege.find({ role_id: _id });
    
    const permissionsToRemove = existingPermissions.filter(
      item => !permission.includes(item.permission)
    );

    const newPermissions = permission.filter(
      perm => !existingPermissions.map(item => item.permission).includes(perm)
    );

    await Promise.all(permissionsToRemove.map(item => RolePrivilege.findByIdAndDelete(item._id)));
    await Promise.all(newPermissions.map(perm => RolePrivilege.create({ role_id: _id, permission: perm })));

    const roleExists = await Role.findOne({ role_name });
    if (roleExists && roleExists._id.toString() !== _id) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, "Role name already exists");
    }

    const updatedRole = await Role.findByIdAndUpdate(_id, req.body, { new: true });
    if (!updatedRole) {
      throw new ErrorCustomer(Enum.HTTP_CODES.NOT_FOUND, "Role not found");
    }

    res.json(Response.successRespose(updatedRole));
  } catch (error) {
    res.status(error.code || 500).json(Response.errorRespose(error));
  }
});

/**
 * DELETE - Rol Sil
 */
router.delete('/delete', async (req, res) => {
  try {
    const { _id } = req.body;
    const role = await Role.findByIdAndDelete(_id);

    if (!role) {
      throw new ErrorCustomer(Enum.HTTP_CODES.NOT_FOUND, "Role not found");
    }

    await RolePrivilege.deleteMany({ role_id: _id });
    res.json(Response.successRespose({ success: true }));
  } catch (error) {
    res.status(error.code || 500).json(Response.errorRespose(error));
  }
});

/**
 * GET - Tüm Role Privileges Getir
 */
router.get("/role_privileges", (req, res) => {
  res.json({ rolePrivileges });
});

module.exports = router;

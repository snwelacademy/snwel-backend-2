"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRouter = void 0;
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
const permissionMiddleware_1 = require("../../../middleware/permissionMiddleware");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
exports.RoleRouter = router;
router.use(passport_1.default.authenticate('jwt', { session: false }));
router.post('/', (0, permissionMiddleware_1.checkPermission)('ROLE_CREATE'), roleController_1.RoleController.createRole);
router.get('/', (0, permissionMiddleware_1.checkPermission)('ROLE_VIEW'), roleController_1.RoleController.getAllRoles);
router.get('/:id', (0, permissionMiddleware_1.checkPermission)('ROLE_VIEW'), roleController_1.RoleController.getRoleById);
router.put('/:id', (0, permissionMiddleware_1.checkPermission)('ROLE_UPDATE'), roleController_1.RoleController.updateRole);
router.delete('/:id', (0, permissionMiddleware_1.checkPermission)('ROLE_DELETE'), roleController_1.RoleController.deleteRole);
router.patch('/:id/permissions', (0, permissionMiddleware_1.checkPermission)('ROLE_UPDATE'), roleController_1.RoleController.assignPermissions);

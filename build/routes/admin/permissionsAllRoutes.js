"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPermissionsAllRouter = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../../middleware/permissionMiddleware");
const permissionsController_1 = require("../../controllers/admin/permissionsController");
const router = (0, express_1.Router)();
exports.AdminPermissionsAllRouter = router;
router.get('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('ROLE_VIEW'), permissionsController_1.listAllPermissionsFlat);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterRouter = void 0;
const express_1 = require("express");
const masterController_1 = require("../controllers/masterController");
const validateSchema_1 = require("../middleware/validateSchema");
const master_1 = require("../entity-schema/master");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.MasterRouter = router;
router.get('/', masterController_1.getAllMasterItemsController);
router.get('/:idOrCode', masterController_1.getMasterItemController);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('MASTER_CREATE'), (0, validateSchema_1.validateSchema)(master_1.createMasterItemSchema), masterController_1.createMasterItemController);
router.put('/:idOrCode', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('MASTER_UPDATE'), (0, validateSchema_1.validateSchema)(master_1.updateMasterItemSchema), masterController_1.updateMasterItemByCodeController);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('MASTER_DELETE'), masterController_1.deleteMasterItemByCodeController);

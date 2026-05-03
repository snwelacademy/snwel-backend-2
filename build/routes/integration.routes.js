"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationRouter = void 0;
const express_1 = require("express");
const integrationController_1 = require("../controllers/integrationController");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.IntegrationRouter = router;
router.get('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('INTEGRATION_VIEW'), integrationController_1.getAllIntegrationsController);
router.get('/types', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('INTEGRATION_VIEW'), integrationController_1.getIntegrationTypesController);
router.get('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('INTEGRATION_VIEW'), integrationController_1.getIntegrationByIdController);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('INTEGRATION_UPDATE'), integrationController_1.createIntegrationController);
router.put('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('INTEGRATION_UPDATE'), integrationController_1.updateIntegrationByIdController);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('INTEGRATION_UPDATE'), integrationController_1.deleteIntegrationByIdController);

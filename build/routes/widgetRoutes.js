"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetRouter = void 0;
const express_1 = require("express");
const widgetController_1 = require("../controllers/widgetController");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.WidgetRouter = router;
router.get('/', widgetController_1.getAllWidgetsController);
router.get('/types', widgetController_1.getWidgetTypesController);
router.get('/:id', widgetController_1.getWidgetByIdController);
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('WIDGET_CREATE'), widgetController_1.createWidgetController);
router.put('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('WIDGET_UPDATE'), widgetController_1.updateWidgetByIdController);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('WIDGET_DELETE'), widgetController_1.deleteWidgetByIdController);

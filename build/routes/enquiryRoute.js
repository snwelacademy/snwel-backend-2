"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryRouter = void 0;
const express_1 = require("express");
const enquiryController_1 = require("../controllers/enquiryController");
const validateSchema_1 = require("../middleware/validateSchema");
const enquiry_1 = require("../entity-schema/enquiry");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
exports.EnquiryRouter = router;
router.post('/', (0, validateSchema_1.validateSchema)(enquiry_1.createEnquiry), enquiryController_1.createEnquiryController);
router.get('/', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('ENQUIRY_VIEW'), enquiryController_1.getAllEnquiriesController);
router.get('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('ENQUIRY_VIEW'), enquiryController_1.getEnquiryByIdController);
router.put('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('ENQUIRY_UPDATE'), (0, validateSchema_1.validateSchema)(enquiry_1.updateEnquiry), enquiryController_1.updateEnquiryByIdController);
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('ENQUIRY_DELETE'), enquiryController_1.deleteEnquiryByIdController);

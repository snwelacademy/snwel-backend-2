"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../middleware/upload"));
const uploadV2_1 = __importDefault(require("../middleware/uploadV2"));
const fileController_1 = require("../controllers/fileController");
const passport_1 = __importDefault(require("passport"));
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = express_1.default.Router();
exports.FileRouter = router;
router.post('/upload-multi', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('FILE_UPLOAD'), uploadV2_1.default, fileController_1.uploadFileV2Controller);
router.post('/upload', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('FILE_UPLOAD'), upload_1.default.single('file'), fileController_1.uploadFile);
router.get('/files', passport_1.default.authenticate('jwt', { session: false }), (0, permissionMiddleware_1.checkPermission)('FILE_VIEW'), fileController_1.listFiles);

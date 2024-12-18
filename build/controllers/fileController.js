"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFileById = exports.listFiles = exports.uploadFileV2Controller = exports.uploadFile = void 0;
const FileModal_1 = require("../models/FileModal");
const mime_types_1 = __importDefault(require("mime-types"));
const helpers_1 = require("../utils/helpers");
const appResponse_1 = require("../utils/helpers/appResponse");
const fs_1 = __importDefault(require("fs"));
const upload_1 = require("../middleware/upload");
const uploadV2_1 = require("../middleware/uploadV2");
const uploadFile = async (req, res) => {
    try {
        let file;
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const cldRes = await (0, upload_1.handleUpload)(dataURI);
            const mimeType = mime_types_1.default.lookup(cldRes.url) || 'application/octet-stream';
            file = new FileModal_1.FileModel({ fileName: cldRes.public_id, filePath: cldRes.url, mimeType });
            await file.save();
        }
        else if (req.body.externalUrl) {
            const { externalUrl } = req.body;
            file = new FileModal_1.FileModel({ fileName: externalUrl, filePath: externalUrl });
            await file.save();
        }
        else {
            throw new Error('No file uploaded or external URL provided.');
        }
        (0, appResponse_1.successResponse)(file, res, { message: 'File uploaded successfully' });
    }
    catch (error) {
        res.status(500).send(error.message);
    }
};
exports.uploadFile = uploadFile;
const uploadFileV2Controller = async (req, res) => {
    try {
        const files = req.files;
        const { externalUrl } = req.body;
        let uploadedFiles = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const cldRes = await (0, uploadV2_1.handleUploadV2)(file.buffer, file.mimetype);
                if (!cldRes)
                    return;
                const mimeType = cldRes ? mime_types_1.default.lookup(cldRes === null || cldRes === void 0 ? void 0 : cldRes.url) : 'application/octet-stream';
                const uploadedFile = new FileModal_1.FileModel({
                    fileName: cldRes.public_id,
                    filePath: cldRes.url,
                    mimeType
                });
                await uploadedFile.save();
                uploadedFiles.push(uploadedFile);
            }
        }
        if (externalUrl) {
            const file = new FileModal_1.FileModel({ fileName: externalUrl, filePath: externalUrl });
            await file.save();
            uploadedFiles.push(file);
        }
        if (uploadedFiles.length === 0) {
            throw new Error('No file uploaded or external URL provided.');
        }
        return res.status(200).json({
            message: 'Files uploaded successfully',
            data: uploadedFiles,
        });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.uploadFileV2Controller = uploadFileV2Controller;
const listFiles = async (req, res) => {
    try {
        const { limit = 10, page = 1, search = '' } = Object.assign({}, req.query);
        const paginationData = (0, helpers_1.getPaginationParams)(limit, page);
        const query = (0, helpers_1.getFilterQuery)({ filter: { search: String(search) } });
        const files = await FileModal_1.FileModel.find().sort({ uploadDate: -1 }).skip(paginationData.offset).limit(paginationData.limit);
        const count = await FileModal_1.FileModel.countDocuments(query);
        return (0, appResponse_1.successResponse)((0, helpers_1.convertToPagination)(files, count, paginationData.limit, paginationData.offset), res);
        res.json(files);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
};
exports.listFiles = listFiles;
const removeFileById = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await FileModal_1.FileModel.findByIdAndDelete(fileId);
        if (!file) {
            return res.status(404).send('File not found');
        }
        fs_1.default.unlinkSync(file.filePath);
        res.status(200).send('File deleted successfully');
    }
    catch (error) {
        res.status(500).send(error.message);
    }
};
exports.removeFileById = removeFileById;

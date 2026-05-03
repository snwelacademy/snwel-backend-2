"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMasterItemByCodeController = exports.updateMasterItemByCodeController = exports.getMasterItemController = exports.getAllMasterItemsController = exports.createMasterItemController = void 0;
const master_1 = require("../service/master");
const appResponse_1 = require("../utils/helpers/appResponse");
const catchAsync_1 = require("../utils/helpers/catchAsync");
const helpers_1 = require("../utils/helpers");
const createMasterItemController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const masterData = req.body;
    const newMasterItem = await (0, master_1.createMasterItem)(masterData);
    (0, appResponse_1.successResponse)(newMasterItem, res, { message: 'Master item created successfully!' });
});
exports.createMasterItemController = createMasterItemController;
const getAllMasterItemsController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = Object.assign({}, req.query);
    console.log({ options });
    const masterItems = await (0, master_1.getAllMasterItems)((0, helpers_1.extractListOptions)(req));
    console.log({ masterItems: JSON.stringify(masterItems) });
    (0, appResponse_1.successResponse)(masterItems, res, { message: 'Master items fetched successfully!' });
});
exports.getAllMasterItemsController = getAllMasterItemsController;
const getMasterItemController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { idOrCode } = req.params;
    const masterItem = await (0, master_1.getMasterItem)(idOrCode);
    if (!masterItem) {
        return (0, appResponse_1.errorResponse)('Master item not found', res);
    }
    (0, appResponse_1.successResponse)(masterItem, res, { message: 'Master item fetched successfully!' });
});
exports.getMasterItemController = getMasterItemController;
const updateMasterItemByCodeController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { idOrCode } = req.params;
    const updateData = req.body;
    const updatedMasterItem = await (0, master_1.updateMasterItemByCode)(idOrCode, updateData);
    if (!updatedMasterItem) {
        return (0, appResponse_1.errorResponse)('Master item not found', res);
    }
    (0, appResponse_1.successResponse)(updatedMasterItem, res, { message: 'Master item updated successfully!' });
});
exports.updateMasterItemByCodeController = updateMasterItemByCodeController;
const deleteMasterItemByCodeController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await (0, master_1.deleteMasterItemByCode)(id);
    (0, appResponse_1.successResponse)(null, res, { message: 'Master item deleted successfully!' });
});
exports.deleteMasterItemByCodeController = deleteMasterItemByCodeController;

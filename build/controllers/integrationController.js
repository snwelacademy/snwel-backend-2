"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntegrationTypesController = exports.deleteIntegrationByIdController = exports.updateIntegrationByIdController = exports.getIntegrationByIdController = exports.getAllIntegrationsController = exports.createIntegrationController = void 0;
const IntegrationService_1 = require("../service/IntegrationService");
const appResponse_1 = require("../utils/helpers/appResponse");
const catchAsync_1 = require("../utils/helpers/catchAsync");
const notificationService_1 = require("../service/notificationService");
const createIntegrationController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const integrationData = req.body;
    const newIntegration = await (0, IntegrationService_1.createIntegration)(integrationData);
    const ns = await notificationService_1.NotificationService.getInstance();
    await ns.refreshSettings();
    (0, appResponse_1.successResponse)(newIntegration, res, { message: 'Integration created successfully!' });
});
exports.createIntegrationController = createIntegrationController;
const getAllIntegrationsController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const options = Object.assign({}, req.query);
    const integrations = await (0, IntegrationService_1.getAllIntegrations)(options);
    (0, appResponse_1.successResponse)(integrations, res, { message: 'Integrations fetched successfully!' });
});
exports.getAllIntegrationsController = getAllIntegrationsController;
const getIntegrationByIdController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const integration = await (0, IntegrationService_1.getIntegrationById)(id);
    if (!integration) {
        return (0, appResponse_1.errorResponse)('Integration not found', res);
    }
    (0, appResponse_1.successResponse)(integration, res, { message: 'Integration fetched successfully!' });
});
exports.getIntegrationByIdController = getIntegrationByIdController;
const updateIntegrationByIdController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedIntegration = await (0, IntegrationService_1.updateIntegrationById)(id, updateData);
    if (!updatedIntegration) {
        return (0, appResponse_1.errorResponse)('Integration not found', res);
    }
    const ns = await notificationService_1.NotificationService.getInstance();
    await ns.refreshSettings();
    (0, appResponse_1.successResponse)(updatedIntegration, res, { message: 'Integration updated successfully!' });
});
exports.updateIntegrationByIdController = updateIntegrationByIdController;
const deleteIntegrationByIdController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await (0, IntegrationService_1.deleteIntegrationById)(id);
    const ns = await notificationService_1.NotificationService.getInstance();
    await ns.refreshSettings();
    (0, appResponse_1.successResponse)(null, res, { message: 'Integration deleted successfully!' });
});
exports.deleteIntegrationByIdController = deleteIntegrationByIdController;
const getIntegrationTypesController = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const integrationTypes = await (0, IntegrationService_1.getIntegrationTypes)();
    (0, appResponse_1.successResponse)(integrationTypes, res, { message: 'Integration types fetched successfully!' });
});
exports.getIntegrationTypesController = getIntegrationTypesController;

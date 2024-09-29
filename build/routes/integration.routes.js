"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationRouter = void 0;
// routes/integrationRoutes.ts
const express_1 = require("express");
const integrationController_1 = require("../controllers/integrationController");
const router = (0, express_1.Router)();
exports.IntegrationRouter = router;
router.post('/', integrationController_1.createIntegrationController);
router.get('/', integrationController_1.getAllIntegrationsController);
router.get('/types', integrationController_1.getIntegrationTypesController); // Fetch distinct supported actions
router.get('/:id', integrationController_1.getIntegrationByIdController);
router.put('/:id', integrationController_1.updateIntegrationByIdController);
router.delete('/:id', integrationController_1.deleteIntegrationByIdController);
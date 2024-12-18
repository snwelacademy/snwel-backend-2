"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const common_1 = require("../config/common");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
mongoose_paginate_v2_1.default.paginate.options = common_1.paginateOptions;
const IntegrationSchema = new mongoose_1.Schema({
    serviceName: { type: String, required: true },
    config: { type: mongoose_1.Schema.Types.Mixed, required: true },
    enabled: { type: Boolean, default: true },
    supportedActions: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
IntegrationSchema.plugin(mongoose_paginate_v2_1.default);
IntegrationSchema.index({ serviceName: 1 }, { unique: true });
IntegrationSchema.index({ enabled: 1 });
const IntegrationModel = (0, mongoose_1.model)('Integration', IntegrationSchema);
exports.default = IntegrationModel;

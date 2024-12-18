"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = void 0;
const index_1 = require("./../utils/helpers/index");
const setting_schema_1 = require("../entity-schema/setting-schema");
const Setting_1 = require("../models/Setting");
const helpers_1 = require("../utils/helpers");
const notificationService_1 = require("./notificationService");
class SettingsService {
    async createSetting(input) {
        const nfs = await notificationService_1.NotificationService.getInstance();
        const exist = await Setting_1.SettingModel.findOne({ code: input.code });
        if (exist)
            throw new Error("Setting already exists");
        let validatedInput;
        switch (input.code) {
            case setting_schema_1.SETTINGS.INTEGRATION:
                validatedInput = setting_schema_1.IntegrationSettingTypeSchema.parse(input);
                break;
            case setting_schema_1.SETTINGS.EMAIL:
                validatedInput = setting_schema_1.EmailSettingTypeSchema.parse(input);
                break;
            case setting_schema_1.SETTINGS.GENERAL:
                validatedInput = setting_schema_1.GeneralSettingSchema.parse(input);
                break;
            case setting_schema_1.SETTINGS.MENUBUILDER:
                validatedInput = setting_schema_1.MenuSettingSchema.parse(input);
                break;
            default:
                throw new Error('Invalid setting code');
        }
        const setting = new Setting_1.SettingModel(validatedInput);
        await setting.save();
        await nfs.refreshSettings();
        return setting;
    }
    async getSetting(code) {
        const setting = await Setting_1.SettingModel.findOne({ code });
        if (!setting) {
            throw new Error(`Setting with code ${code} not found`);
        }
        return setting;
    }
    async updateSetting(code, input) {
        let validatedInput;
        const nfs = await notificationService_1.NotificationService.getInstance();
        switch (code) {
            case setting_schema_1.SETTINGS.INTEGRATION:
                validatedInput = setting_schema_1.IntegrationSettingTypeSchema.pick({ data: true, isChangable: true }).parse(input);
                break;
            case setting_schema_1.SETTINGS.EMAIL:
                validatedInput = setting_schema_1.EmailSettingTypeSchema.pick({ data: true, isChangable: true }).parse(input);
                break;
            case setting_schema_1.SETTINGS.GENERAL:
                validatedInput = setting_schema_1.GeneralSettingSchema.pick({ data: true, isChangable: true }).parse(input);
                break;
            case setting_schema_1.SETTINGS.MENUBUILDER:
                validatedInput = setting_schema_1.MenuSettingSchema.parse(input);
                break;
            default:
                throw new Error('Invalid setting code');
        }
        const updatedSetting = await Setting_1.SettingModel.findOneAndUpdate({ code }, validatedInput, { new: true, upsert: true });
        await nfs.refreshSettings();
        if (!updatedSetting) {
            throw new Error(`Setting with code ${code} not found`);
        }
        return updatedSetting;
    }
    async partialUpdateSetting(code, input) {
        var _a;
        const existingSetting = await Setting_1.SettingModel.findOne({ code });
        if (!existingSetting) {
            throw new Error(`Setting with code ${code} not found`);
        }
        const newData = Object.assign(Object.assign({}, existingSetting.data), input.data);
        const updatedSetting = await Setting_1.SettingModel.findOneAndUpdate({ code }, { data: newData, isChangable: (_a = input.isChangable) !== null && _a !== void 0 ? _a : existingSetting.isChangable }, { new: true });
        if (!updatedSetting) {
            throw new Error(`Setting with code ${code} not found`);
        }
        return updatedSetting;
    }
    async deleteSetting(code) {
        const result = await Setting_1.SettingModel.deleteOne({ code });
        if (result.deletedCount === 0) {
            throw new Error(`Setting with code ${code} not found`);
        }
        return { message: `Setting with code ${code} deleted successfully` };
    }
    async listSettings(options) {
        try {
            const { limit = 10, page = 1, filter } = options;
            const query = {};
            const paginationData = (0, helpers_1.getPaginationParams)(limit, page);
            if (filter && filter.search) {
                const searchRegex = new RegExp(filter.search, 'i');
                query.$or = [{ name: searchRegex }, { email: searchRegex }];
            }
            const skip = (page - 1) * limit;
            const users = await Setting_1.SettingModel.find(query).skip(skip).limit(limit);
            const count = await Setting_1.SettingModel.countDocuments(query);
            return (0, index_1.convertToPagination)(users, count, paginationData.limit, paginationData.offset);
        }
        catch (error) {
            throw new Error(`Error: retrieving settings: ${error.message}`);
        }
    }
}
exports.settingsService = new SettingsService();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpViaWhatsApp = exports.loadSetting = void 0;
const setting_schema_1 = require("../entity-schema/setting-schema");
const Setting_1 = require("../models/Setting");
const axios_1 = __importDefault(require("axios"));
const loadSetting = async (code) => {
    try {
        const setting = await Setting_1.SettingModel.findOne({ code });
        if (!setting) {
            throw new Error(`Setting with code ${code} not found`);
        }
        return setting.data;
    }
    catch (error) {
        console.error(`Error loading setting with code ${code}:`, error);
        throw error;
    }
};
exports.loadSetting = loadSetting;
const sendWhatsAppMessage = async (phoneNumber, message) => {
    const settings = await (0, exports.loadSetting)(setting_schema_1.SETTINGS.INTEGRATION);
    const whatsappSettings = settings.data.whatsapp;
    if (!whatsappSettings) {
        throw new Error('WhatsApp settings not found');
    }
    try {
        const url = new URL(whatsappSettings.url);
        url.searchParams.append("api_key", whatsappSettings.appKey);
        const sanitizedNumber = phoneNumber.replace(/\D/g, '');
        url.searchParams.append("number", sanitizedNumber);
        url.searchParams.append("msg", message);
        const response = await axios_1.default.get(url.toString());
        return response.data;
    }
    catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};
const sendOtpViaWhatsApp = async (phoneNumber, otp, setting) => {
    const message = `
    ${setting.siteName} - Your Verification Code

Your one-time password (OTP) is ${otp}. Please enter this code on the verification page to proceed.

This OTP is valid for the next 10 minutes. Do not share this code with anyone. If you did not request this, please contact our support team immediately at [support contact].

Thank you for choosing ${setting.siteName}!

Best regards,
The ${setting.siteName} Team
https://snwelacademy.in
    `;
    return await sendWhatsAppMessage(phoneNumber, message);
};
exports.sendOtpViaWhatsApp = sendOtpViaWhatsApp;

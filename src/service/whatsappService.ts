// services/whatsappService.ts
import { GeneralSettingData, IntegrationSetting, SETTINGS } from '@/entity-schema/setting-schema';
import { SettingModel } from '@/models/Setting';
import axios from 'axios';


export const loadSetting = async (code: string) => {
    try {
        const setting = await SettingModel.findOne({ code });
        if (!setting) {
            throw new Error(`Setting with code ${code} not found`);
        }
        return setting.data;
    } catch (error) {
        console.error(`Error loading setting with code ${code}:`, error);
        throw error;
    }
};

const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
    const settings = await loadSetting(SETTINGS.INTEGRATION) as IntegrationSetting;

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

        const response = await axios.get(url.toString());
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

export const sendOtpViaWhatsApp = async (phoneNumber: string, otp: string, setting: GeneralSettingData) => {
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

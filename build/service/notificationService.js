"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSnwelOTPNotification = exports.sendJobApplyConfirmation = exports.sendCourseEnquiryNotification = exports.sendOTPWhatsapp = exports.sendOTPNotification = exports.NotificationService = void 0;
const templateFactory_1 = require("../email-templates/templateFactory");
const email_apps_schema_1 = require("../entity-schema/email-apps-schema");
const setting_schema_1 = require("../entity-schema/setting-schema");
const whatsapp_schema_1 = require("../entity-schema/whatsapp-schema");
const IntegrationModel_1 = __importDefault(require("../models/IntegrationModel"));
const Setting_1 = require("../models/Setting");
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
var AppIds;
(function (AppIds) {
    AppIds["WHATSAPP"] = "whatsapp";
    AppIds["SMTP"] = "smtp";
    AppIds["RENDER_EMAIL"] = "render";
    AppIds["TELEGRAM"] = "telegram";
    AppIds["SMS"] = "sms";
    AppIds["PUSH"] = "push";
    AppIds["SNWEL_SMTP"] = "snwel";
})(AppIds || (AppIds = {}));
class NotificationService {
    constructor() {
        this.ingerations = [];
    }
    static async getInstance() {
        if (!NotificationService.instance) {
            const instance = new NotificationService();
            await instance.loadSettings();
            NotificationService.instance = instance;
            console.log("Load setting successfully");
        }
        return NotificationService.instance;
    }
    async loadSettings() {
        await this.loadIntegrations();
        this.emailSetting = await this.loadEmailSettingsFromDB();
        this.integrationSetting = await this.loadIntegrationSettingsFromDB();
        this.generalSetting = await this.loadGeneralSettingsFromDB();
    }
    async loadEmailSettingsFromDB() {
        const emailSetting = await Setting_1.SettingModel.findOne({ code: setting_schema_1.SETTINGS.EMAIL });
        return emailSetting;
    }
    async loadIntegrationSettingsFromDB() {
        const emailSetting = await Setting_1.SettingModel.findOne({ code: setting_schema_1.SETTINGS.INTEGRATION });
        return emailSetting;
    }
    async loadGeneralSettingsFromDB() {
        const emailSetting = await Setting_1.SettingModel.findOne({ code: setting_schema_1.SETTINGS.GENERAL });
        return emailSetting === null || emailSetting === void 0 ? void 0 : emailSetting.data;
    }
    async loadIntegrations() {
        const res = await IntegrationModel_1.default.find({}).lean();
        this.ingerations = res;
        console.log("Integration: ", this.ingerations);
    }
    async refreshSettings() {
        await this.loadSettings();
        console.log('Settings refreshed');
    }
    async sendEmail(to, subject, message) {
        var _a;
        try {
            const smtp = this.ingerations.find(it => it.serviceName === AppIds.SMTP);
            if (!smtp || !smtp.enabled)
                return;
            const smtpConfig = email_apps_schema_1.SMTPSchema.parse(smtp === null || smtp === void 0 ? void 0 : smtp.config);
            console.log("Start sending mail to", to);
            const transporter = nodemailer_1.default.createTransport({
                host: smtpConfig.host,
                port: parseInt(smtpConfig.port),
                secure: false,
                auth: {
                    user: smtpConfig.auth.username,
                    pass: smtpConfig.auth.password
                },
                tls: {
                    rejectUnauthorized: false,
                }
            });
            await transporter.sendMail({
                from: ((_a = this.generalSetting) === null || _a === void 0 ? void 0 : _a.senderEmail) || `"No Reply" <${smtpConfig.auth.username}>`,
                to,
                subject,
                html: `<b>${message}</b>`
            });
        }
        catch (error) {
            console.error("sendEmail", error);
            throw error;
        }
    }
    async sendSnwelEmail(to, subject, message) {
        var _a;
        try {
            const smtp = this.ingerations.find(it => it.serviceName === AppIds.SNWEL_SMTP);
            if (!smtp || !smtp.enabled)
                return;
            const smtpConfig = email_apps_schema_1.SMTPSchema.parse(smtp === null || smtp === void 0 ? void 0 : smtp.config);
            console.log("Start sending mail to", to);
            const transporter = nodemailer_1.default.createTransport({
                host: smtpConfig.host,
                port: parseInt(smtpConfig.port),
                secure: false,
                auth: {
                    user: smtpConfig.auth.username,
                    pass: smtpConfig.auth.password
                },
                tls: {
                    rejectUnauthorized: false,
                }
            });
            await transporter.sendMail({
                from: smtpConfig.sender || ((_a = this.generalSetting) === null || _a === void 0 ? void 0 : _a.senderEmail) || `"No Reply" <${smtpConfig.auth.username}>`,
                to,
                subject,
                html: `<b>${message}</b>`
            });
        }
        catch (error) {
            console.error("sendEmail", error);
            throw error;
        }
    }
    async sendWhatsApp(number, message) {
        const whatsapp = this.ingerations.find(it => it.serviceName === AppIds.WHATSAPP);
        if (!whatsapp || !whatsapp.enabled)
            return console.log("Whatsapp otp is not enabled");
        const whatsappConfig = whatsapp_schema_1.WhatsappConfig.safeParse(whatsapp === null || whatsapp === void 0 ? void 0 : whatsapp.config);
        if (!whatsappConfig.success) {
            throw new Error("WhatsApp integration settings not configured");
        }
        const url = `${whatsappConfig.data.url}?api_key=${whatsappConfig.data.apiKey}&sender=${whatsappConfig.data.phoneNumber}&number=${number}&message=${message}`;
        try {
            const response = await axios_1.default.get(url);
            console.log(`WhatsApp message sent: ${response.data}`);
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw new Error("Failed to send WhatsApp message");
        }
    }
}
exports.NotificationService = NotificationService;
(async () => {
    await NotificationService.getInstance();
})();
const sendOTPNotification = async (otp, to) => {
    const template = await (0, templateFactory_1.otpEmailTemplate)(otp);
    const ns = await NotificationService.getInstance();
    await ns.sendEmail(to, template.subject, template.template);
};
exports.sendOTPNotification = sendOTPNotification;
const sendOTPWhatsapp = async (otp, number) => {
    const ns = await NotificationService.getInstance();
    await ns.sendWhatsApp(number, `Your OTP is ${otp}`);
};
exports.sendOTPWhatsapp = sendOTPWhatsapp;
const sendCourseEnquiryNotification = async (course, to) => {
    const ns = await NotificationService.getInstance();
    if (to.email) {
        const template = await (0, templateFactory_1.courseEnquiryTemplate)(course, to.userName || "");
        await ns.sendEmail(to.email, template.subject, template.template);
    }
};
exports.sendCourseEnquiryNotification = sendCourseEnquiryNotification;
const sendJobApplyConfirmation = async (jobApp, to) => {
    const ns = await NotificationService.getInstance();
    if (to.email) {
        const template = await (0, templateFactory_1.jobApplyConfirmTemplate)(jobApp);
        await ns.sendEmail(to.email, template.subject, template.template);
    }
};
exports.sendJobApplyConfirmation = sendJobApplyConfirmation;
const sendSnwelOTPNotification = async (otp, to) => {
    const template = await (0, templateFactory_1.otpEmailTemplate)(otp);
    const ns = await NotificationService.getInstance();
    await ns.sendSnwelEmail(to, template.subject, template.template);
};
exports.sendSnwelOTPNotification = sendSnwelOTPNotification;

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
const JobVacancy_1 = __importDefault(require("../models/JobVacancy"));
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
    getSupportInfo() {
        var _a, _b, _c, _d, _e;
        const siteName = (_a = this.generalSetting) === null || _a === void 0 ? void 0 : _a.siteName;
        const email = (_c = (_b = this.generalSetting) === null || _b === void 0 ? void 0 : _b.contacts) === null || _c === void 0 ? void 0 : _c.email;
        const phone = (_e = (_d = this.generalSetting) === null || _d === void 0 ? void 0 : _d.contacts) === null || _e === void 0 ? void 0 : _e.phone;
        return { siteName, email, phone };
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
        const sanitizedNumber = number.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        const url = `${whatsappConfig.data.url}?api_key=${whatsappConfig.data.apiKey}&number=${sanitizedNumber}&msg=${encodedMessage}`;
        try {
            const response = await axios_1.default.get(url);
            console.log(`WhatsApp message sent: ${JSON.stringify(response.data)}`);
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw new Error("Failed to send WhatsApp message");
        }
    }
}
exports.NotificationService = NotificationService;
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
    const template = await (0, templateFactory_1.courseEnquiryTemplate)(course, to.userName || "");
    if (to.email) {
        await ns.sendEmail(to.email, template.subject, template.template);
    }
    if (to.phone) {
        const support = ns.getSupportInfo();
        const parts = [
            `Dear ${to.userName || 'Learner'}, thank you for your interest in "${(course === null || course === void 0 ? void 0 : course.title) || 'the course'}". Your enrollment is almost complete. Our team will contact you shortly.`,
        ];
        if ((course === null || course === void 0 ? void 0 : course.courseDuration) || (course === null || course === void 0 ? void 0 : course.price)) {
            const duration = (course === null || course === void 0 ? void 0 : course.courseDuration) ? `Duration: ${course.courseDuration}` : '';
            const price = (course === null || course === void 0 ? void 0 : course.price) ? `Price: ${course.price} ${(course === null || course === void 0 ? void 0 : course.currency) || ''}` : '';
            const details = [duration, price].filter(Boolean).join(' | ');
            if (details)
                parts.push(details);
        }
        if (support.email || support.phone) {
            const contact = [support.email, support.phone].filter(Boolean).join(' | ');
            parts.push(`Support: ${contact}`);
        }
        if (support.siteName) {
            parts.push(`- ${support.siteName}`);
        }
        const whatsappMessage = parts.join('\n');
        console.log("Send whatsapp to", to.phone, whatsappMessage);
        await ns.sendWhatsApp(to.phone, whatsappMessage);
    }
};
exports.sendCourseEnquiryNotification = sendCourseEnquiryNotification;
const sendJobApplyConfirmation = async (jobApp, to) => {
    const ns = await NotificationService.getInstance();
    if (to.email) {
        const template = await (0, templateFactory_1.jobApplyConfirmTemplate)(jobApp);
        await ns.sendEmail(to.email, template.subject, template.template);
    }
    if (to.phone) {
        const support = ns.getSupportInfo();
        const job = await JobVacancy_1.default.findById(jobApp.jobId).lean();
        const applicant = jobApp.applicantName || 'Applicant';
        const jobTitle = (job === null || job === void 0 ? void 0 : job.title) || 'the position';
        const company = (job === null || job === void 0 ? void 0 : job.companyName) || support.siteName || 'our company';
        const email = support.email || 'hello@snwelacademy.in';
        const parts = [
            `*Application Received*`,
            `Dear ${applicant},`,
            `Thank you for submitting your application for the ${jobTitle} position at ${company}. We appreciate your interest in joining our team!`,
            `Our hiring team is currently reviewing your application and qualifications. If your profile matches our requirements, we will be in touch to schedule the next steps in the hiring process, such as an interview.`,
            `Please note, due to the high volume of applications, it may take some time to process all submissions. Rest assured, we will keep you updated on the status of your application.`,
            `If you have any questions in the meantime, feel free to reach out to us at ${email} or visit our careers page for more information.`,
            `Thank you once again for considering ${company} as your next career move. We look forward to reviewing your application.`,
            `Best regards,`,
            `${support.siteName || 'snwel Academy'}`,
            `${support.phone || 'N/A'}`,
            `${company}`
        ];
        const whatsappMessage = parts.join('\n');
        await ns.sendWhatsApp(to.phone, whatsappMessage);
    }
};
exports.sendJobApplyConfirmation = sendJobApplyConfirmation;
const sendSnwelOTPNotification = async (otp, to) => {
    const template = await (0, templateFactory_1.otpEmailTemplate)(otp);
    const ns = await NotificationService.getInstance();
    await ns.sendSnwelEmail(to, template.subject, template.template);
};
exports.sendSnwelOTPNotification = sendSnwelOTPNotification;

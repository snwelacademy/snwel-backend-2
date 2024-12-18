"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplyConfirmTemplate = exports.courseEnquiryTemplate = exports.otpEmailTemplate = void 0;
const setting_schema_1 = require("../entity-schema/setting-schema");
const Setting_1 = require("../models/Setting");
const render_1 = require("@react-email/render");
const otpEmail_1 = __importDefault(require("./otpEmail"));
const react_1 = __importDefault(require("react"));
const course_inquiry_1 = __importDefault(require("./course-email-template/course-inquiry"));
const job_apply_confirm_1 = __importDefault(require("./job/job-apply-confirm"));
const common_1 = require("../config/common");
const template = async () => {
    const setting = await Setting_1.SettingModel.findOne({ type: setting_schema_1.SETTINGS.GENERAL });
    const settingData = setting === null || setting === void 0 ? void 0 : setting.data;
};
const otpEmailTemplate = async (otp) => {
    const setting = await Setting_1.SettingModel.findOne({ code: setting_schema_1.SETTINGS.GENERAL });
    const settingData = setting === null || setting === void 0 ? void 0 : setting.data;
    const footerText = `© 2023 ${settingData === null || settingData === void 0 ? void 0 : settingData.siteName}. All rights reserved.`;
    return {
        template: (0, render_1.render)(react_1.default.createElement(otpEmail_1.default, { otpCode: otp, logoUrl: (settingData === null || settingData === void 0 ? void 0 : settingData.logoUrl) || '', footerText: footerText })),
        subject: `Your OTP Code: ${otp} - Complete Your Verification`
    };
};
exports.otpEmailTemplate = otpEmailTemplate;
const courseEnquiryTemplate = async (course, userName) => {
    var _a, _b;
    const setting = await Setting_1.SettingModel.findOne({ code: setting_schema_1.SETTINGS.GENERAL });
    const settingData = setting === null || setting === void 0 ? void 0 : setting.data;
    const footerText = `© 2023 ${settingData === null || settingData === void 0 ? void 0 : settingData.siteName}. All rights reserved.`;
    const data = {
        userName: userName,
        courseTitle: course.title,
        courseDuration: course.courseDuration,
        difficulty: course.difficulty,
        languages: course.language.join(", "),
        price: course.price.toString(),
        currency: course.currency,
        discount: ((_a = course.discount) === null || _a === void 0 ? void 0 : _a.toString()) || "",
        certificateAvailable: course.certificate ? 'Yes' : 'No',
        trainingModes: course.trainingModes.join(", "),
        supportEmail: (settingData === null || settingData === void 0 ? void 0 : settingData.senderEmail) || "",
        phoneNumber: ((_b = settingData === null || settingData === void 0 ? void 0 : settingData.contacts) === null || _b === void 0 ? void 0 : _b.phone) || "",
        companyName: (settingData === null || settingData === void 0 ? void 0 : settingData.siteName) || "",
        websiteUrl: common_1.CommonConfig.FRONT_URL || "",
        logoUrl: (settingData === null || settingData === void 0 ? void 0 : settingData.logoUrl) || ""
    };
    return {
        template: (0, render_1.render)(react_1.default.createElement(course_inquiry_1.default, { courseTitle: data.courseTitle, courseDuration: data.courseDuration, difficulty: data.difficulty, languages: data.languages, price: data.price, currency: data.currency, discount: data.discount, certificateAvailable: data.certificateAvailable, trainingModes: data.trainingModes, supportEmail: data.supportEmail, phoneNumber: data.phoneNumber, companyName: data.companyName, websiteUrl: data.websiteUrl, logoUrl: data.logoUrl, userName: data.userName })),
        subject: `Your Enrollment for ${data.courseTitle} is Almost Complete – Our Team Will Reach Out Soon`,
        footer: footerText
    };
};
exports.courseEnquiryTemplate = courseEnquiryTemplate;
const jobApplyConfirmTemplate = async (jobApplication) => {
    var _a;
    const setting = await Setting_1.SettingModel.findOne({ code: setting_schema_1.SETTINGS.GENERAL });
    const settingData = setting === null || setting === void 0 ? void 0 : setting.data;
    const footerText = `© 2023 ${settingData === null || settingData === void 0 ? void 0 : settingData.siteName}. All rights reserved.`;
    const job = jobApplication.jobId;
    const data = {
        applicantName: jobApplication.applicantName,
        jobTitle: job.title,
        companyName: job.companyName || settingData.siteName,
        contactEmail: ((_a = settingData.contacts) === null || _a === void 0 ? void 0 : _a.email) || 'N/A',
        careersPageUrl: common_1.CommonConfig.FRONT_URL + "/job-vacancies",
        senderName: settingData.siteName,
        senderJobTitle: "N/A",
        companyContactInfo: job.contactInfo,
        companyWebsite: job.applicationLink || common_1.CommonConfig.FRONT_URL,
        companyLogo: settingData.logoUrl || ""
    };
    return {
        template: (0, render_1.render)(react_1.default.createElement(job_apply_confirm_1.default, Object.assign({}, data))),
        subject: `Thank You for Applying to ${data.jobTitle} at ${data.companyName}!`,
        footer: footerText
    };
};
exports.jobApplyConfirmTemplate = jobApplyConfirmTemplate;

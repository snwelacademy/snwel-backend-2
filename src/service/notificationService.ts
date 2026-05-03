import { courseEnquiryTemplate, jobApplyConfirmTemplate, otpEmailTemplate } from "@/email-templates/templateFactory";
import { SMTPSchema } from "@/entity-schema/email-apps-schema";
import { EMAIL_TRANSPORTER, EmailSetting, GeneralSettingData, IntegrationSetting, SETTINGS } from "@/entity-schema/setting-schema";
import { WhatsappConfig } from "@/entity-schema/whatsapp-schema";
import { Course } from "@/models/CourseModel";
import IntegrationModel, { IIntegration } from "@/models/IntegrationModel";
import { IJobApplication } from "@/models/JobApplicationModel";
import JobVacancyModel from "@/models/JobVacancy";
import { SettingModel } from "@/models/Setting";
import axios from "axios";
import nodemailer from 'nodemailer'

enum AppIds {
    WHATSAPP = "whatsapp",
    SMTP = "smtp",
    RENDER_EMAIL = "render",
    TELEGRAM = "telegram",
    SMS = "sms",
    PUSH = "push",
    SNWEL_SMTP="snwel"
}

export class NotificationService {
    private static instance: NotificationService;
    private emailSetting: EmailSetting | undefined;
    private integrationSetting: IntegrationSetting | undefined;
    private generalSetting: GeneralSettingData | undefined;
    private ingerations: IIntegration[] = [];


    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Get the singleton instance
    public static async getInstance(): Promise<NotificationService> {
        if (!NotificationService.instance) {
            const instance = new NotificationService();
            await instance.loadSettings();  // Load settings when instance is first created
            NotificationService.instance = instance;
            console.log("Load setting successfully")
        }
        return NotificationService.instance;
    }

    // Load settings from the database (this would typically call your database or config service)
    private async loadSettings(): Promise<void> {
        // Simulate loading settings from the database
        await this.loadIntegrations();
        this.emailSetting = await this.loadEmailSettingsFromDB();
        this.integrationSetting = await this.loadIntegrationSettingsFromDB();
        this.generalSetting = await this.loadGeneralSettingsFromDB()
    }

    // Load email settings from DB (replace this with actual DB call)
    private async loadEmailSettingsFromDB(): Promise<EmailSetting | undefined> {
        const emailSetting = await SettingModel.findOne({ code: SETTINGS.EMAIL });
        return emailSetting as EmailSetting;
    }

    // Load integration (WhatsApp) settings from DB (replace this with actual DB call)
    private async loadIntegrationSettingsFromDB(): Promise<IntegrationSetting | undefined> {
        const emailSetting = await SettingModel.findOne({ code: SETTINGS.INTEGRATION });
        return emailSetting as IntegrationSetting;
    }
    private async loadGeneralSettingsFromDB(): Promise<GeneralSettingData | undefined> {
        const emailSetting = await SettingModel.findOne({ code: SETTINGS.GENERAL });
        return emailSetting?.data as GeneralSettingData;
    }

    private async loadIntegrations() {
        const res = await IntegrationModel.find({}).lean();
        this.ingerations = res;
        console.log("Integration: ", this.ingerations)
    }

    // Refresh settings manually
    public async refreshSettings(): Promise<void> {
        await this.loadSettings();
        console.log('Settings refreshed');
    }

    public getSupportInfo() {
        const siteName = this.generalSetting?.siteName;
        const email = this.generalSetting?.contacts?.email;
        const phone = this.generalSetting?.contacts?.phone;
        return { siteName, email, phone };
    }

    // Send Email Notification
    async sendEmail(to: string, subject: string, message: string): Promise<void> {
        try {
            const smtp = this.ingerations.find(it => it.serviceName === AppIds.SMTP);
            if(!smtp || !smtp.enabled) return;
            const smtpConfig = SMTPSchema.parse(smtp?.config);
            console.log("Start sending mail to", to)
            const transporter = nodemailer.createTransport({
                host: smtpConfig.host,
                port: parseInt(smtpConfig.port),
                secure: false,
                auth: {
                    user: smtpConfig.auth.username,
                    pass: smtpConfig.auth.password
                },
                tls: {
                    rejectUnauthorized: false, // Add this only for testing environments; avoid using it in production
                }
            });

            await transporter.sendMail({
                from: smtpConfig.sender || this.generalSetting?.senderEmail || `"No Reply" <${smtpConfig.auth.username}>`,
                to,
                subject,
                html: `<b>${message}</b>`
            });
        } catch (error) {
            console.error("sendEmail",error);
            throw error;
        }
    }

    async sendSnwelEmail(to: string, subject: string, message: string): Promise<void> {
        try {
            const smtp = this.ingerations.find(it => it.serviceName === AppIds.SNWEL_SMTP);
            if(!smtp || !smtp.enabled) return;
            const smtpConfig = SMTPSchema.parse(smtp?.config);
            console.log("Start sending mail to", to)
            const transporter = nodemailer.createTransport({
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
                from: smtpConfig.sender || this.generalSetting?.senderEmail || `"No Reply" <${smtpConfig.auth.username}>`,
                to,
                subject,
                html: `<b>${message}</b>`
            });
        } catch (error) {
            console.error("sendEmail",error);
            throw error;
        }
    }

    async sendWhatsApp(number: string, message: string): Promise<void> {

        const whatsapp = this.ingerations.find(it => it.serviceName === AppIds.WHATSAPP);
        if(!whatsapp || !whatsapp.enabled) return console.log("Whatsapp otp is not enabled");
        const whatsappConfig = WhatsappConfig.safeParse(whatsapp?.config);
        if(!whatsappConfig.success){
            throw new Error("WhatsApp integration settings not configured");
        }
       
        const encodedMessage = encodeURIComponent(message);
        const url = `${whatsappConfig.data.url}?api_key=${whatsappConfig.data.apiKey}&number=${number}&msg=${encodedMessage}`;
        try {
            const response = await axios.get(url);
            console.log(`WhatsApp message sent: ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw new Error("Failed to send WhatsApp message");
        }
    }
}



export const sendOTPNotification = async (otp: string, to: string) => {
    const template = await otpEmailTemplate(otp);
    const ns = await NotificationService.getInstance();
    await ns.sendEmail(
        to,
        template.subject,
        template.template
    )
}
export const sendOTPWhatsapp = async (otp: string, number: string) => {
    const ns = await NotificationService.getInstance();
    await ns.sendWhatsApp(
        number,
        `Your OTP is ${otp}`
    )
}


export const sendCourseEnquiryNotification = async (course: Course, to: {email?: string, phone?: string, userName?: string}) => {
    const ns = await NotificationService.getInstance();
    const template = await courseEnquiryTemplate(course, to.userName||"");
    if(to.email){
        await ns.sendEmail(
            to.email,
            template.subject,
            template.template
        )
    }
    if(to.phone){
        const support = ns.getSupportInfo();
        const parts = [
            `Dear ${to.userName || 'Learner'}, thank you for your interest in "${(course as any)?.title || 'the course'}". Your enrollment is almost complete. Our team will contact you shortly.`,
        ];
        if ((course as any)?.courseDuration || (course as any)?.price) {
            const duration = (course as any)?.courseDuration ? `Duration: ${(course as any).courseDuration}` : '';
            const price = (course as any)?.price ? `Price: ${(course as any).price} ${(course as any)?.currency || ''}` : '';
            const details = [duration, price].filter(Boolean).join(' | ');
            if (details) parts.push(details);
        }
        if (support.email || support.phone) {
            const contact = [support.email, support.phone].filter(Boolean).join(' | ');
            parts.push(`Support: ${contact}`);
        }
        if (support.siteName) {
            parts.push(`- ${support.siteName}`);
        }
        const whatsappMessage = parts.join('\n');
        console.log("Send whatsapp to", to.phone, whatsappMessage)
        await ns.sendWhatsApp(
            to.phone,
            whatsappMessage
        )
    }
}
export const sendJobApplyConfirmation = async (jobApp: IJobApplication, to: {email?: string, phone?: string}) => {
    const ns = await NotificationService.getInstance();
    if(to.email){
        const template = await jobApplyConfirmTemplate(jobApp);
        await ns.sendEmail(
            to.email,
            template.subject,
            template.template
        )
    }
    if(to.phone){
        const support = ns.getSupportInfo();
        const job = await JobVacancyModel.findById(jobApp.jobId).lean();
        const applicant = jobApp.applicantName || 'Applicant';
        const jobTitle = (job as any)?.title || 'the position';
        const company = (job as any)?.companyName || support.siteName || 'our company';
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
        await ns.sendWhatsApp(
            to.phone,
            whatsappMessage
        )
    }
}

export const sendSnwelOTPNotification = async (otp: string, to: string) => {
    const template = await otpEmailTemplate(otp);
    const ns = await NotificationService.getInstance();
    await ns.sendSnwelEmail(
        to,
        template.subject,
        template.template
    )
}







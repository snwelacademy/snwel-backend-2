"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WhatsAppService {
    constructor(config) {
        this.config = config;
    }
    async sendMessage(recipient, message) {
        try {
            console.log(`Sending WhatsApp message to ${recipient}: ${message}`);
            return { success: true, message: 'Message sent successfully via WhatsApp' };
        }
        catch (error) {
            console.error('WhatsApp service error:', error);
            return { success: false, message: error.message };
        }
    }
}
exports.default = WhatsAppService;

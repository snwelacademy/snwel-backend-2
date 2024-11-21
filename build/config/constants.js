"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
exports.Constants = {
    ROLES: {
        SUPER_ADMIN: 'Super Admin',
        ADMIN: 'Admin',
        USER: 'User'
    },
    PERMISSIONS: {
        USER_CREATE: 'USER_CREATE',
        USER_VIEW: 'USER_VIEW',
        USER_UPDATE: 'USER_UPDATE',
        USER_DELETE: 'USER_DELETE',
        ROLE_CREATE: 'ROLE_CREATE',
        ROLE_VIEW: 'ROLE_VIEW',
        ROLE_UPDATE: 'ROLE_UPDATE',
        ROLE_DELETE: 'ROLE_DELETE',
    },
    OTP: {
        EXPIRATION_DAYS: 2,
        DELIVERY_METHOD: {
            whatsapp: true,
            email: true
        },
        MASTER_OTP: 796239
    },
    TOKEN_SECRET: 'snwellacademy',
    FROM_EMAIL: "snwellacademy@gmail.com",
    MASTER_TYPES: {
        MASTER: 'MASTER',
        SUB_MASTER: 'SUB_MASTER'
    }
};

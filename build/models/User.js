"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: String,
    phone: String,
    location: {
        addr: String,
        state: String,
        city: String,
        country: String
    },
    roles: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' }],
    isActive: { type: Boolean, default: true },
    lastLogin: Date
}, { timestamps: true });
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt_1.default.hash(this.password, 10);
    }
    next();
});
UserSchema.methods.isValidPassword = async function (password) {
    const user = this;
    const compare = await bcrypt_1.default.compare(password, user.password);
    return compare;
};
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ isActive: 1, createdAt: -1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ createdAt: -1 });
exports.UserModel = mongoose_1.default.model('User', UserSchema);

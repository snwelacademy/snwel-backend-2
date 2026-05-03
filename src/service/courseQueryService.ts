import jwt from 'jsonwebtoken';

import { convertSortOrder, convertToPagination, generateJwtToken, generateOTPObject, getPaginationParams, queryHandler } from '@/utils/helpers';
import { ObjectId } from 'mongodb';
import { ListOptions, PaginatedList } from '@/types/custom'
import { CreateCourseQuery } from '@/entity-schema/course-enrollment';
import CourseEnrollmentModel, { CourseEnrollment, EnrollmentPerson } from '@/models/CourseEnrollment';
import { Constants } from '@/config/constants';
import { logger } from '@/utils/logger';
import { User, UserModel } from '@/models/User';
import { sendCourseEnquiryNotification } from './notificationService';
import { sendOtp } from './otpService';
import { Course } from '@/models/CourseModel';

const buildApplicantFromUser = (user?: User | null): EnrollmentPerson | undefined => {
    if (!user || !user.email) return undefined;
    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
    };
};

const isSameApplicant = (existing?: EnrollmentPerson | null, incoming?: EnrollmentPerson): boolean => {
    if (!existing || !incoming) return false;
    if (!existing.email || !incoming.email) return false;
    if (existing.email !== incoming.email) return false;
    const existingPhone = (existing.phone || '').trim();
    const incomingPhone = (incoming.phone || '').trim();
    if (!existingPhone && !incomingPhone) return true;
    return existingPhone === incomingPhone;
};

// Helper to derive applicant from request (preferred) or legacy userId
const resolveApplicant = async (queryData: CreateCourseQuery): Promise<EnrollmentPerson> => {
    let applicant = queryData.applicant as EnrollmentPerson | undefined;

    // Legacy fallback: build from userId if applicant not provided
    if (!applicant && (queryData as any).userId) {
        const user = await UserModel.findById((queryData as any).userId);
        applicant = buildApplicantFromUser(user);
    }

    if (!applicant || !applicant.email) {
        throw new Error('Error: 400: Applicant email is required for enrollment');
    }

    // Normalize phone
    applicant.phone = applicant.phone?.trim() || undefined;
    return applicant;
};

// Function to create a new course enrollment
const create = async (queryData: CreateCourseQuery): Promise<{ token?: string, isVerified: boolean, enrollmentId?: string }> => {
    try {
        const applicant = await resolveApplicant(queryData);

        // Find existing enrollment for same course + applicant (email + phone rules)
        const candidates = await CourseEnrollmentModel.find({
            courseId: queryData.courseId,
            'applicant.email': applicant.email,
        });
        const exists = candidates.find((enrollment: any) =>
            isSameApplicant(enrollment.applicant as EnrollmentPerson, applicant)
        ) as CourseEnrollment | undefined;

        if (exists && exists.otp?.verified && isSameApplicant((exists as any).applicant, applicant)) {
            throw new Error('Error: 400: Course Enrollment already found.');
        }

        const otpObject = generateOTPObject({})
        const sessionExpiresAt = new Date(Date.now() + Constants.OTP.SESSION_TTL_MINUTES * 60 * 1000);
        if (exists) {
            await exists.updateOne({ 
                otp: otpObject,
                applicant,
                extra: {
                    ...(exists.extra || {}),
                    otpSession: {
                        resendCount: 0,
                        lastSentAt: new Date(),
                        sessionExpiresAt,
                    }
                }
            });
            await sendOtp(otpObject.otp, applicant?.phone, applicant?.email)
            return {
                isVerified: false,
                token: generateJwtToken({
                    courseId: queryData.courseId,
                    // userId is kept only for legacy consumers of the token payload
                    userId: (queryData as any).userId,
                    enrollmentId: exists._id
                })
            }
        } else {
            const { userId, ...rest } = queryData as any;
            let newCourseQuery = new CourseEnrollmentModel({ 
                ...rest,
                applicant,
                otp: otpObject,
                extra: {
                    otpSession: {
                        resendCount: 0,
                        lastSentAt: new Date(),
                        sessionExpiresAt,
                    }
                }
            });
            await newCourseQuery.save()
            await sendOtp(otpObject.otp, applicant?.phone, applicant?.email)
            return {
                isVerified: false,
                token: generateJwtToken({
                    courseId: queryData.courseId,
                    userId,
                    enrollmentId: newCourseQuery._id
                })
            }
        }
    } catch (error: any) {
        throw new Error(`Error: creating course query: ${error.message}`);
    }
};

const createByClient = async (queryData: CreateCourseQuery): Promise<CourseEnrollment> => {
    try {
        const applicant = await resolveApplicant(queryData);

        const candidates = await CourseEnrollmentModel.find({
            courseId: queryData.courseId,
            'applicant.email': applicant.email,
        });
        const exists = candidates.find((enrollment: any) =>
            isSameApplicant(enrollment.applicant as EnrollmentPerson, applicant)
        ) as CourseEnrollment | undefined;

        if (exists) throw new Error('Error: 400: Course Enrollment already found.');

        const { userId, ...rest } = queryData as any;
        const newCourseQuery = new CourseEnrollmentModel({
            ...rest,
            applicant,
        });
        return await newCourseQuery.save();
    } catch (error: any) {
        throw new Error(`Error: creating course query: ${error.message}`);
    }
};

const checkApplied = async (userId: string, courseId: string) => {
    try {
        return await CourseEnrollmentModel.findOne({ userId: new ObjectId(userId), courseId: new ObjectId(courseId) }).populate("userId", ["email", "name", "profilePic"]).populate("courseId", "title slug");
    } catch (error: any) {
        throw new Error(`Error: validating course query: ${error.message}`);
    }
}
const getAllByUserId = async (userId: string) => {
    try {
        return await CourseEnrollmentModel.find({ userId }).populate("userId", ["email", "name", "profilePic"]).populate("courseId", "title slug");
    } catch (error: any) {
        throw new Error(`Error: feching course query by userId: ${error.message}`);
    }
}
const getAllByCourseId = async (userId: string) => {
    try {
        return await CourseEnrollmentModel.find({ userId }).populate("userId", ["email", "name", "profilePic"]).populate("courseId", "title slug");
    } catch (error: any) {
        throw new Error(`Error: feching course query by courseId: ${error.message}`);
    }
}

// Function to retrieve all courses
const getAll = async (options: ListOptions) => {
    try {
        const { limit = 10, page = 1, search, filter, sort, startDate, endDate } = options;
        const query: any = {};

        // Handle search
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [{ "userId.name": searchRegex }, { "courseId.title": searchRegex }];
        }

        // Handle filtering
        if (filter) {
            if (filter.status) {
                query.status = filter.status;
            }
            // Add more filters if necessary
        }

        // Handle date filtering
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Fetch and paginate the results
        const courseEnrollments = await CourseEnrollmentModel.paginate(
            query,
            {
                populate: [
                    { path: "userId", select: ["email", "name", "profilePic"] },
                    { path: "courseId", select: ["title", "slug"] },
                    { path: "qualification" },   // Use object for path
                    { path: "mode" },            // Use object for path
                    { path: "occupation" },      // Use object for path
                    { path: "widget" }           // Use object for path
                ],
                page,
                limit,
                sort: sort ? convertSortOrder(sort) : { createdAt: -1 }
            }
        );

        return courseEnrollments;
    } catch (error: any) {
        throw new Error(`Error retrieving course enrollments: ${error.message}`);
    }
};


// Function to retrieve a course by ID
const getById = async (id: string): Promise<CourseEnrollment | null> => {
    try {
        return await CourseEnrollmentModel.findById(id)
            .populate("userId", "email name profilePic")
            .populate(["courseId", 'qualification', 'mode', 'occupation', 'widget']);
    } catch (error: any) {
        throw new Error(`Error: retrieving course query: ${error.message}`);
    }
};

// Function to update a course by ID
const updateById = async (id: string, updateData: Partial<CourseEnrollment>): Promise<CourseEnrollment | null> => {
    try {
        await CourseEnrollmentModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        return CourseEnrollmentModel.findOne({ _id: new ObjectId(id) }).populate("userId", "email name profilePic").populate("courseId", "title slug");
    } catch (error: any) {
        throw new Error(`Error: updating course query: ${error.message}`);
    }
};

// Function to delete a course by ID
const deleteById = async (id: string): Promise<void> => {
    try {
        console.log("Deleting course query with ID:", id);
        await CourseEnrollmentModel.findByIdAndDelete(id).exec();
    } catch (error: any) {
        throw new Error(`Error: deleting course query: ${error.message}`);
    }
};
async function verifyOtpAndUpdate(token: string, otp: string) {
    try {
        const decoded = jwt.verify(token, Constants.TOKEN_SECRET) as any;
        const { enrollmentId, courseId, userId } = decoded;
        const enrollment = await CourseEnrollmentModel.findById(enrollmentId).populate(["courseId", "userId"]);
        if (!enrollment || !enrollment.otp) {
            return {
                isVerified: false,
                enrollmentId: null,
                invalidToken: true,
            }; // Document not found
        }

        if (enrollment.otp.verified) {
            return {
                isVerified: true,
                enrollmentId: enrollment._id
            }; // OTP already verified
        }

        const now = new Date();

        if (now > (enrollment.otp.expirationTime as Date)) {
            const session = (enrollment.extra as any)?.otpSession || {};
            const sessionExpiresAt: Date | undefined = session.sessionExpiresAt ? new Date(session.sessionExpiresAt) : undefined;
            const lastSentAt: Date | undefined = session.lastSentAt ? new Date(session.lastSentAt) : undefined;
            const resendCount: number = typeof session.resendCount === 'number' ? session.resendCount : 0;
            const withinSession = sessionExpiresAt ? now < sessionExpiresAt : true;
            const cooldown = Constants.OTP.RESEND_COOLDOWN_SEC;
            const sinceLast = lastSentAt ? Math.floor((now.getTime() - lastSentAt.getTime()) / 1000) : cooldown;
            const retryAfter = Math.max(0, cooldown - sinceLast);
            const resendAllowed = withinSession && resendCount < Constants.OTP.MAX_RESENDS;
            return {
                isVerified: false,
                enrollmentId: null,
                invalidOtp: true,
                otpExpired: true,
                verificationId: enrollment._id.toString(),
                resend_allowed: resendAllowed,
                retry_after: retryAfter,
                session_expires_at: sessionExpiresAt ? sessionExpiresAt.toISOString() : undefined,
            } as any; // OTP expired
        }

        if (enrollment.otp.otp !== otp && Number(otp) !== Constants.OTP.MASTER_OTP) {
            return {
                isVerified: false,
                enrollmentId: null,
                invalidOtp: true,
                otpExpired: false
            };
        }

        // Update the verified field to true
        enrollment.otp.verified = true;
        await enrollment.save();
        const user = enrollment.userId as unknown as User
        try {
            await sendCourseEnquiryNotification(enrollment.courseId as unknown as Course, {email: user?.email, phone: user?.phone, userName: user?.name})
        } catch (error) {
            logger.error('Error sending course enquiry notification', error)
        }
        return {
            isVerified: true,
            enrollmentId: enrollment._id
        }; // OTP verified and updated successfully
    } catch (error) {
        console.error(error);
        logger.error("Error: verifyOtpAndUpdate: ", error)
        throw new Error("Error: 500: OTP Verification failed")
    }
}

async function resendOtp(params: { token?: string; verificationId?: string }) {
    try {
        const now = new Date();
        let enrollmentId: string | undefined = undefined;
        if (params?.verificationId) {
            enrollmentId = params.verificationId;
        } else if (params?.token) {
            try {
                const decoded = jwt.verify(params.token, Constants.TOKEN_SECRET) as any;
                enrollmentId = decoded.enrollmentId;
            } catch (err) {
                // Token invalid or expired
                return {
                    invalidToken: true
                } as any;
            }
        }
        if (!enrollmentId) {
            return {
                invalidToken: true
            } as any;
        }

        // Find the document by enrollmentId
        const enrollment = await CourseEnrollmentModel.findById(enrollmentId);
        if (!enrollment) {
            return {
                isVerified: false,
                enrollmentId: null,
                invalidToken: true,
            };
        }

        const session = (enrollment.extra as any)?.otpSession || {};
        const sessionExpiresAt: Date = session.sessionExpiresAt ? new Date(session.sessionExpiresAt) : new Date(Date.now() + Constants.OTP.SESSION_TTL_MINUTES * 60 * 1000);
        const lastSentAt: Date | undefined = session.lastSentAt ? new Date(session.lastSentAt) : undefined;
        const resendCount: number = typeof session.resendCount === 'number' ? session.resendCount : 0;

        const withinSession = now < sessionExpiresAt;
        const cooldown = Constants.OTP.RESEND_COOLDOWN_SEC;
        const sinceLast = lastSentAt ? Math.floor((now.getTime() - lastSentAt.getTime()) / 1000) : cooldown;
        const retryAfter = Math.max(0, cooldown - sinceLast);
        const canResend = withinSession && resendCount < Constants.OTP.MAX_RESENDS && retryAfter === 0;

        if (!withinSession) {
            return {
                resend_allowed: false,
                reason: 'SESSION_EXPIRED',
                retry_after: 0,
                session_expires_at: sessionExpiresAt.toISOString(),
            } as any;
        }
        if (resendCount >= Constants.OTP.MAX_RESENDS) {
            return {
                resend_allowed: false,
                reason: 'RESEND_LIMIT_REACHED',
                retry_after: retryAfter,
                session_expires_at: sessionExpiresAt.toISOString(),
            } as any;
        }
        if (retryAfter > 0) {
            return {
                resend_allowed: false,
                reason: 'COOLDOWN',
                retry_after: retryAfter,
                session_expires_at: sessionExpiresAt.toISOString(),
            } as any;
        }

        // Generate a new OTP and expiration time
        const newOtp = generateOTPObject({})

        enrollment.otp = newOtp;
        (enrollment as any).extra = {
            ...(enrollment.extra || {}),
            otpSession: {
                resendCount: resendCount + 1,
                lastSentAt: now,
                sessionExpiresAt,
            }
        };
        await enrollment.save();

        const user = enrollment.userId ? await UserModel.findById(enrollment.userId as any) : null;
        const phone = enrollment.applicant?.phone || user?.phone;
        const email = enrollment.applicant?.email || user?.email;
        
        await sendOtp(newOtp.otp, phone, email);

        const newToken = generateJwtToken({
            enrollmentId: enrollment._id.toString(),
            courseId: enrollment.courseId,
            userId: enrollment.userId
        })

        return {
            token: newToken,
            otp_expires_at: newOtp.expirationTime?.toISOString?.() || undefined,
            session_expires_at: sessionExpiresAt.toISOString(),
            resend_allowed: true,
            retry_after: Constants.OTP.RESEND_COOLDOWN_SEC,
        } as any;
    } catch (error) {
        console.error(error);
        return { success: false, message: 'An error occurred' };
    }
}

export { create, getAll, getById, updateById, deleteById, checkApplied, getAllByUserId, getAllByCourseId, verifyOtpAndUpdate, resendOtp };

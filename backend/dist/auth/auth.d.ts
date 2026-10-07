/**
 * Better Auth is the ONLY auth system: phone + email OTP, sessions,
 * device tracking. Email codes go through Resend. Phone codes go through
 * the configured SMS sender; until SMS_API_KEY exists they are logged
 * for development and never accepted as verified without a matching code.
 */
export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    secret: string;
    emailAndPassword: {
        enabled: false;
    };
    session: {
        expiresIn: number;
        updateAge: number;
    };
    plugins: [{
        id: "email-otp";
        version: string;
        init(ctx: import("better-auth").AuthContext): {
            options: {
                emailVerification: {
                    sendVerificationEmail(data: {
                        user: import("better-auth").User;
                        url: string;
                        token: string;
                    }, request: Request | undefined): Promise<void>;
                };
            };
        } | undefined;
        endpoints: {
            sendVerificationOTP: import("better-auth").StrictEndpoint<"/email-otp/send-verification-otp", {
                method: "POST";
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>[];
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    type: import("better-auth").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            createVerificationOTP: import("better-auth").StrictEndpoint<string, {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    type: import("better-auth").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, string>;
            getVerificationOTP: import("better-auth").StrictEndpoint<string, {
                method: "GET";
                query: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    type: import("better-auth").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                otp: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                otp: null;
            } | {
                otp: string;
            }>;
            checkVerificationOTP: import("better-auth").StrictEndpoint<"/email-otp/check-verification-otp", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    type: import("better-auth").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                    otp: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            verifyEmailOTP: import("better-auth").StrictEndpoint<"/email-otp/verify-email", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    otp: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                                token: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            } | {
                status: boolean;
                token: null;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            }>;
            signInEmailOTP: import("better-auth").StrictEndpoint<"/sign-in/email-otp", {
                method: "POST";
                body: import("better-auth").ZodIntersection<import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    otp: import("better-auth").ZodString;
                    name: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                    image: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>, import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                };
            }>;
            requestPasswordResetEmailOTP: import("better-auth").StrictEndpoint<"/email-otp/request-password-reset", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            forgetPasswordEmailOTP: import("better-auth").StrictEndpoint<"/forget-password/email-otp", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            resetPasswordEmailOTP: import("better-auth").StrictEndpoint<"/email-otp/reset-password", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    email: import("better-auth").ZodString;
                    otp: import("better-auth").ZodString;
                    password: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            requestEmailChangeEmailOTP: import("better-auth").StrictEndpoint<"/email-otp/request-email-change", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    newEmail: import("better-auth").ZodString;
                    otp: import("better-auth").ZodOptional<import("better-auth").ZodString>;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            changeEmailEmailOTP: import("better-auth").StrictEndpoint<"/email-otp/change-email", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    newEmail: import("better-auth").ZodString;
                    otp: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                use: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>>[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
        };
        hooks: {
            after: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>>;
            }[];
        };
        rateLimit: ({
            pathMatcher(path: string): path is "/email-otp/send-verification-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/check-verification-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/verify-email";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/sign-in/email-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/request-password-reset";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/reset-password";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/forget-password/email-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/request-email-change";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/change-email";
            window: number;
            max: number;
        })[];
        options: import("better-auth/plugins").EmailOTPOptions;
        $ERROR_CODES: {
            OTP_EXPIRED: import("better-auth").RawError<"OTP_EXPIRED">;
            INVALID_OTP: import("better-auth").RawError<"INVALID_OTP">;
            TOO_MANY_ATTEMPTS: import("better-auth").RawError<"TOO_MANY_ATTEMPTS">;
        };
    }, {
        id: "phone-number";
        version: string;
        init(): {
            options: {
                databaseHooks: {
                    user: {
                        update: {
                            before(data: Partial<{
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                email: string;
                                emailVerified: boolean;
                                name: string;
                                image?: string | null | undefined;
                            }> & Record<string, unknown>): Promise<{
                                data: {
                                    [x: string]: unknown;
                                    id?: string | undefined;
                                    createdAt?: Date | undefined;
                                    updatedAt?: Date | undefined;
                                    email?: string | undefined;
                                    emailVerified?: boolean | undefined;
                                    name?: string | undefined;
                                    image?: string | null | undefined;
                                };
                            } | undefined>;
                        };
                    };
                };
            };
        };
        hooks: {
            before: {
                matcher: (ctx: import("better-auth").HookEndpointContext) => boolean;
                handler: import("better-auth").Middleware<import("better-auth").MiddlewareOptions, (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<never>>;
            }[];
        };
        endpoints: {
            signInPhoneNumber: import("better-auth").StrictEndpoint<"/sign-in/phone-number", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                    password: import("better-auth").ZodString;
                    rememberMe: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                user: {
                                                    $ref: string;
                                                };
                                                session: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                            400: {
                                description: string;
                            };
                        };
                    };
                };
            }, {
                token: string;
                user: import("better-auth/plugins").UserWithPhoneNumber;
            }>;
            sendPhoneNumberOTP: import("better-auth").StrictEndpoint<"/phone-number/send-otp", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                message: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                message: string;
            }>;
            consumePhoneNumberOTP: import("better-auth").StrictEndpoint<string, {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                    code: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    readonly scope: "server";
                };
            }, {
                status: boolean;
            }>;
            verifyPhoneNumber: import("better-auth").StrictEndpoint<"/phone-number/verify", {
                method: "POST";
                body: import("better-auth").ZodIntersection<import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                    code: import("better-auth").ZodString;
                    disableSession: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                    updatePhoneNumber: import("better-auth").ZodOptional<import("better-auth").ZodBoolean>;
                }, import("zod/v4/core").$strip>, import("better-auth").ZodRecord<import("better-auth").ZodString, import("better-auth").ZodAny>>;
                metadata: {
                    openapi: {
                        summary: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                                token: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                user: {
                                                    type: string;
                                                    nullable: boolean;
                                                    properties: {
                                                        id: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        email: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        emailVerified: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        name: {
                                                            type: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        image: {
                                                            type: string;
                                                            format: string;
                                                            nullable: boolean;
                                                            description: string;
                                                        };
                                                        phoneNumber: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        phoneNumberVerified: {
                                                            type: string;
                                                            description: string;
                                                        };
                                                        createdAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                        updatedAt: {
                                                            type: string;
                                                            format: string;
                                                            description: string;
                                                        };
                                                    };
                                                    required: string[];
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                            400: {
                                description: string;
                            };
                        };
                    };
                };
            }, {
                status: boolean;
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & import("better-auth/plugins").UserWithPhoneNumber;
            } | {
                status: boolean;
                token: null;
                user: import("better-auth/plugins").UserWithPhoneNumber;
            }>;
            requestPasswordResetPhoneNumber: import("better-auth").StrictEndpoint<"/phone-number/request-password-reset", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    phoneNumber: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
            }>;
            resetPasswordPhoneNumber: import("better-auth").StrictEndpoint<"/phone-number/reset-password", {
                method: "POST";
                body: import("better-auth").ZodObject<{
                    otp: import("better-auth").ZodString;
                    phoneNumber: import("better-auth").ZodString;
                    newPassword: import("better-auth").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
            }>;
        };
        schema: {
            user: {
                fields: {
                    phoneNumber: {
                        type: "string";
                        required: false;
                        unique: true;
                        sortable: true;
                        returned: true;
                    };
                    phoneNumberVerified: {
                        type: "boolean";
                        required: false;
                        returned: true;
                        input: false;
                    };
                };
            };
        };
        rateLimit: {
            pathMatcher(path: string): boolean;
            window: number;
            max: number;
        }[];
        options: import("better-auth/plugins").PhoneNumberOptions | undefined;
        $ERROR_CODES: {
            OTP_EXPIRED: import("better-auth").RawError<"OTP_EXPIRED">;
            INVALID_OTP: import("better-auth").RawError<"INVALID_OTP">;
            TOO_MANY_ATTEMPTS: import("better-auth").RawError<"TOO_MANY_ATTEMPTS">;
            INVALID_PHONE_NUMBER: import("better-auth").RawError<"INVALID_PHONE_NUMBER">;
            PHONE_NUMBER_EXIST: import("better-auth").RawError<"PHONE_NUMBER_EXIST">;
            PHONE_NUMBER_NOT_EXIST: import("better-auth").RawError<"PHONE_NUMBER_NOT_EXIST">;
            INVALID_PHONE_NUMBER_OR_PASSWORD: import("better-auth").RawError<"INVALID_PHONE_NUMBER_OR_PASSWORD">;
            UNEXPECTED_ERROR: import("better-auth").RawError<"UNEXPECTED_ERROR">;
            OTP_NOT_FOUND: import("better-auth").RawError<"OTP_NOT_FOUND">;
            PHONE_NUMBER_NOT_VERIFIED: import("better-auth").RawError<"PHONE_NUMBER_NOT_VERIFIED">;
            PHONE_NUMBER_CANNOT_BE_UPDATED: import("better-auth").RawError<"PHONE_NUMBER_CANNOT_BE_UPDATED">;
            SEND_OTP_NOT_IMPLEMENTED: import("better-auth").RawError<"SEND_OTP_NOT_IMPLEMENTED">;
        };
    }];
}>;

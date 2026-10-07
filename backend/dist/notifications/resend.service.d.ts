/** Transactional email for trade events, receipts and security alerts. */
export declare class ResendService {
    private resend;
    private from;
    private send;
    tradeUpdate(to: string, pair: string, state: string): Promise<{
        data: import("resend").CreateEmailResponseSuccess;
        error: null;
    } | {
        data: null;
        error: import("resend").ErrorResponse;
    } | {
        preview: boolean;
    }>;
    receipt(to: string, ref: string, summary: string): Promise<{
        data: import("resend").CreateEmailResponseSuccess;
        error: null;
    } | {
        data: null;
        error: import("resend").ErrorResponse;
    } | {
        preview: boolean;
    }>;
    securityAlert(to: string, what: string): Promise<{
        data: import("resend").CreateEmailResponseSuccess;
        error: null;
    } | {
        data: null;
        error: import("resend").ErrorResponse;
    } | {
        preview: boolean;
    }>;
}

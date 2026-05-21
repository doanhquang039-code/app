export declare class ErrorLog {
    id: string;
    user_id: number;
    error_type: string;
    error_message: string;
    stack_trace: string;
    endpoint: string;
    request_data: string;
    severity: string;
    is_resolved: boolean;
    resolved_at: Date;
    resolved_by: number;
    created_at: Date;
}

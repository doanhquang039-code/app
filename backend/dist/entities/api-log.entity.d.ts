export declare class ApiLog {
    id: string;
    user_id: number;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms: number;
    request_body: string;
    response_body: string;
    ip_address: string;
    user_agent: string;
    created_at: Date;
}

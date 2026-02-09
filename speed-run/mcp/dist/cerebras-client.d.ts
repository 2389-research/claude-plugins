export interface GenerateResult {
    status: "ok" | "error";
    response?: string;
    model?: string;
    total_duration_ms?: number;
    usage?: Record<string, number>;
    error?: string;
    setup_hint?: string;
}
export interface StatusResult {
    status: "ok" | "error";
    url: string;
    model?: string;
    available_models?: string[];
    error?: string;
    setup_hint?: string;
}
export declare class CerebrasClient {
    private apiKey;
    private baseUrl;
    private model;
    private timeoutMs;
    constructor();
    get isConfigured(): boolean;
    get modelName(): string;
    get url(): string;
    generate(prompt: string, systemPrompt?: string, maxTokens?: number): Promise<GenerateResult>;
    checkStatus(): Promise<StatusResult>;
}

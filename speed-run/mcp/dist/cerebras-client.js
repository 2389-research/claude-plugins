export class CerebrasClient {
    apiKey;
    baseUrl;
    model;
    timeoutMs;
    constructor() {
        this.apiKey = process.env.CEREBRAS_API_KEY;
        this.baseUrl = process.env.CEREBRAS_URL || "https://api.cerebras.ai/v1";
        this.model = process.env.CEREBRAS_MODEL || "gpt-oss-120b";
        this.timeoutMs = parseFloat(process.env.GENERATION_TIMEOUT || "120") * 1000;
    }
    get isConfigured() {
        return !!this.apiKey;
    }
    get modelName() {
        return this.model;
    }
    get url() {
        return this.baseUrl;
    }
    async generate(prompt, systemPrompt, maxTokens = 4096) {
        if (!this.apiKey) {
            return {
                status: "error",
                error: "CEREBRAS_API_KEY not set",
                setup_hint: 'Set CEREBRAS_API_KEY either in ~/.claude/settings.json under "env" or export in ~/.zshrc - get free key at https://cloud.cerebras.ai',
            };
        }
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
        }
        messages.push({ role: "user", content: prompt });
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    max_tokens: maxTokens,
                    temperature: 0.1,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const text = await response.text();
                return { status: "error", error: `HTTP ${response.status}: ${text}` };
            }
            const data = await response.json();
            const choices = data.choices;
            if (!choices || !Array.isArray(choices) || choices.length === 0) {
                return {
                    status: "error",
                    error: `Unexpected API response: no choices returned. Raw: ${JSON.stringify(data).slice(0, 500)}`,
                };
            }
            const message = choices[0]?.message;
            // Some models (e.g. reasoning models) may return reasoning instead of content
            const content = message?.content ?? message?.reasoning;
            if (content == null) {
                return {
                    status: "error",
                    error: `Unexpected API response: no content in message. Raw: ${JSON.stringify(data).slice(0, 500)}`,
                };
            }
            return {
                status: "ok",
                response: content,
                model: this.model,
                total_duration_ms: Date.now() - startTime,
                usage: data.usage || {},
            };
        }
        catch (error) {
            if (error.name === "AbortError") {
                return {
                    status: "error",
                    error: `Request timed out after ${this.timeoutMs}ms`,
                };
            }
            return { status: "error", error: error.message || String(error) };
        }
    }
    async checkStatus() {
        if (!this.apiKey) {
            return {
                status: "error",
                error: "CEREBRAS_API_KEY not set",
                url: this.baseUrl,
                model: this.model,
                setup_hint: 'Set CEREBRAS_API_KEY either in ~/.claude/settings.json under "env" or export in ~/.zshrc - get free key at https://cloud.cerebras.ai',
            };
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                const models = (data.data || [])
                    .map((m) => m.id)
                    .filter(Boolean);
                return {
                    status: "ok",
                    url: this.baseUrl,
                    model: this.model,
                    available_models: models,
                };
            }
            return {
                status: "error",
                error: `HTTP ${response.status}`,
                url: this.baseUrl,
            };
        }
        catch (error) {
            return {
                status: "error",
                error: error.message || String(error),
                url: this.baseUrl,
            };
        }
    }
}

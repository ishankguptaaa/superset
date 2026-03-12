type CspDirectives = Partial<Record<string, string[]>>;

interface SecurityHeadersOptions {
	/** Additional CSP directives to merge with defaults */
	csp?: CspDirectives;
}

const DEFAULT_CSP: CspDirectives = {
	"default-src": ["'self'"],
	"script-src": ["'self'", "'unsafe-inline'"],
	"style-src": ["'self'", "'unsafe-inline'"],
	"img-src": ["'self'", "data:", "https://*.public.blob.vercel-storage.com"],
	"font-src": ["'self'"],
	"connect-src": ["'self'", "https://*.ingest.sentry.io"],
	"frame-src": ["'none'"],
	"object-src": ["'none'"],
	"base-uri": ["'self'"],
	"form-action": ["'self'"],
	"frame-ancestors": ["'none'"],
	"media-src": ["'self'"],
	"worker-src": ["'self'", "blob:"],
};

function buildCsp(overrides: CspDirectives = {}): string {
	const merged: CspDirectives = { ...DEFAULT_CSP };
	for (const [key, values] of Object.entries(overrides)) {
		if (!values) continue;
		const existing = merged[key] ?? [];
		merged[key] = [...new Set([...existing, ...values])];
	}
	return Object.entries(merged)
		.map(([key, values]) => `${key} ${(values ?? []).join(" ")}`)
		.join("; ");
}

/**
 * Returns Next.js `headers()` config with security headers.
 * CSP directives are merged with sensible defaults — pass overrides to extend.
 */
export function securityHeaders(options: SecurityHeadersOptions = {}) {
	const csp = buildCsp(options.csp);

	return [
		{
			source: "/(.*)",
			headers: [
				{ key: "Content-Security-Policy", value: csp },
				{ key: "X-Content-Type-Options", value: "nosniff" },
				{ key: "X-Frame-Options", value: "SAMEORIGIN" },
				{
					key: "Referrer-Policy",
					value: "strict-origin-when-cross-origin",
				},
				{
					key: "Strict-Transport-Security",
					value: "max-age=63072000; includeSubDomains",
				},
				{
					key: "Permissions-Policy",
					value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
				},
			],
		},
	];
}

/**
 * Frontend OpenTelemetry initialization.
 *
 * Sets up W3C Trace Context propagation and fetch instrumentation so that
 * browser spans are connected to the corresponding backend spans in Jaeger.
 *
 * Call initWebTracing() once at app startup (renderer.tsx), before any API calls.
 * In test environments, this is a no-op.
 */

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { propagation, trace, context } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';

let provider: WebTracerProvider | null = null;

/**
 * Initialize OpenTelemetry web tracing.
 * Must be called once at app startup, before any instrumented API calls.
 */
export function initWebTracing(): void {
  // No-op in test environments
  if (typeof window === 'undefined') return;
  if (provider) return;

  // Determine Jaeger endpoint (defaults to same host as app for proxied access)
  const jaegerEndpoint = import.meta.env['VITE_OTEL_ENDPOINT'] ?? 'http://localhost:4318/v1/traces';

  const otelEnabled = import.meta.env['VITE_OTEL_ENABLED'] !== 'false';

  if (!otelEnabled) return;

  const isDev = import.meta.env.DEV ?? true;

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: 'automaker-ui',
    'deployment.environment': isDev ? 'development' : 'production',
  });

  provider = new WebTracerProvider({ resource });

  // Register OTLP exporter pointing to Jaeger
  try {
    const exporter = new OTLPTraceExporter({ url: jaegerEndpoint });
    const processor = isDev ? new SimpleSpanProcessor(exporter) : new BatchSpanProcessor(exporter);
    provider.addSpanProcessor(processor);
  } catch {
    // Network unavailable — continue without Jaeger export
  }

  // Register W3C Trace Context propagator for distributed tracing
  propagation.setGlobalPropagator(new W3CTraceContextPropagator());

  // Register the provider globally
  provider.register();

  // Register fetch instrumentation to auto-inject traceparent headers
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        // Propagate trace context on all API requests
        propagateTraceHeaderCorsUrls: [/.*/],
        // Don't create spans for non-API requests (e.g. CDN assets)
        ignoreUrls: [/\.(js|css|png|jpg|svg|ico|woff|woff2)(\?.*)?$/],
      }),
    ],
  });
}

/**
 * Get the currently active web tracer.
 */
export function getWebTracer(name: string): ReturnType<WebTracerProvider['getTracer']> {
  const p = provider ?? new WebTracerProvider();
  return p.getTracer(name);
}

/**
 * Create a span for a UI action and execute the callback within it.
 */
export async function withUiSpan<T>(
  spanName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const tracer = trace.getTracer('automaker-ui');
  return tracer.startActiveSpan(spanName, { attributes }, async (span: Span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.setStatus({
        code: 2, // ERROR
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Get current trace context (for attaching to WebSocket events).
 */
export function getWebTraceContext(): { traceId: string; spanId: string } | undefined {
  const span = trace.getActiveSpan();
  if (!span) return undefined;
  const ctx = span.spanContext();
  if (!ctx.traceId || ctx.traceId === '00000000000000000000000000000000') return undefined;
  return { traceId: ctx.traceId, spanId: ctx.spanId };
}

export { context, trace };

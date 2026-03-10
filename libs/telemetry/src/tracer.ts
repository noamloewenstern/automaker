/**
 * Helper functions to get named tracers, loggers, and meters.
 */

import { trace, type Tracer, context, type Span } from '@opentelemetry/api';

/**
 * Returns a named tracer for instrumenting code.
 *
 * @param name - Tracer name, typically the module or service name
 */
export function getTracer(name: string): Tracer {
  return trace.getTracer(name);
}

/**
 * Get the currently active span from context, if any.
 */
export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

/**
 * Add a log event to the currently active span (if one exists).
 * Useful for attaching log messages to traces.
 */
export function addSpanEvent(
  message: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(message, attributes);
  }
}

/**
 * Wrap an async operation in a span.
 *
 * @param tracer - The tracer to use
 * @param spanName - Name for the span
 * @param fn - Async function to execute within the span
 * @param attributes - Optional span attributes to set at start
 */
export async function withSpan<T>(
  tracer: Tracer,
  spanName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
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
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Get the current trace context as { traceId, spanId } strings.
 * Returns undefined if no active span.
 */
export function getCurrentTraceContext(): { traceId: string; spanId: string } | undefined {
  const span = trace.getActiveSpan();
  if (!span) return undefined;
  const ctx = span.spanContext();
  if (!ctx.traceId || ctx.traceId === '00000000000000000000000000000000') return undefined;
  return { traceId: ctx.traceId, spanId: ctx.spanId };
}

export { context };

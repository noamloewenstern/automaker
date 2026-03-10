/**
 * Human-readable log exporter for OpenTelemetry spans.
 *
 * Writes formatted span summaries to a log file, suitable for
 * human inspection and debugging.
 */

import fs from 'fs';
import path from 'path';
import type { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-node';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode, hrTimeToMilliseconds } from '@opentelemetry/core';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_BACKUPS = 3;

function rotateLogs(filePath: string): void {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_FILE_SIZE_BYTES) return;
  } catch {
    return;
  }

  for (let i = MAX_BACKUPS; i >= 1; i--) {
    const backup = `${filePath}.${i}`;
    try {
      if (i === MAX_BACKUPS) {
        fs.unlinkSync(backup);
      } else {
        fs.renameSync(backup, `${filePath}.${i + 1}`);
      }
    } catch {
      // Ignore
    }
  }

  try {
    fs.renameSync(filePath, `${filePath}.1`);
  } catch {
    // Ignore
  }
}

function hrTimeToIso(hrTime: [number, number]): string {
  const ms = hrTime[0] * 1000 + hrTime[1] / 1e6;
  return new Date(ms).toISOString();
}

function formatAttributes(attrs: Record<string, unknown>): string {
  if (!attrs || Object.keys(attrs).length === 0) return '';
  const entries = Object.entries(attrs)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');
  return `{ ${entries} }`;
}

function spanToHumanLog(span: ReadableSpan): string {
  const ctx = span.spanContext();
  const serviceName = (span.resource.attributes['service.name'] as string) ?? 'unknown';
  const durationMs = hrTimeToMilliseconds(span.duration);
  const startIso = hrTimeToIso(span.startTime);
  const statusStr = span.status.code === 2 ? 'ERROR' : 'OK';

  const attrs = formatAttributes(span.attributes as Record<string, unknown>);
  const attrsLine = attrs ? `  attrs: ${attrs}` : '';

  let logsSection = '';
  if (span.events.length > 0) {
    const eventLines = span.events
      .map((e) => {
        const eventTime = hrTimeToIso(e.time).split('T')[1].replace('Z', '');
        const level = (e.attributes?.['level'] as string) ?? 'INFO';
        return `    ${eventTime}  ${level.padEnd(5)}  ${e.name}`;
      })
      .join('\n');
    logsSection = `\n  logs:\n${eventLines}`;
  }

  return [
    `[${startIso}] [SPAN] service=${serviceName} traceId=${ctx.traceId} spanId=${ctx.spanId}${span.parentSpanId ? ` parent=${span.parentSpanId}` : ''}`,
    `  operation: ${span.name}`,
    `  duration: ${durationMs.toFixed(0)}ms  status: ${statusStr}`,
    attrsLine,
    logsSection,
    '',
  ]
    .filter((line) => line !== undefined)
    .join('\n');
}

/**
 * SpanExporter that writes human-readable span summaries to a log file.
 */
export class HumanReadableFileExporter implements SpanExporter {
  private readonly filePath: string;
  private closed = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    } catch {
      // Ignore
    }
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    if (this.closed) {
      resultCallback({ code: ExportResultCode.FAILED, error: new Error('Exporter is shut down') });
      return;
    }

    try {
      rotateLogs(this.filePath);
      const content = spans.map(spanToHumanLog).join('');
      if (content) {
        fs.appendFileSync(this.filePath, content, 'utf-8');
      }
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      resultCallback({ code: ExportResultCode.FAILED, error: error as Error });
    }
  }

  shutdown(): Promise<void> {
    this.closed = true;
    return Promise.resolve();
  }
}

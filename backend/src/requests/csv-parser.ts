import { parse } from 'csv-parse/sync';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type ValidRequestInput = {
  externalId: string;
  receivedAt: Date;
  requester: string;
  subject: string;
  description: string | null;
  priority: Priority;
};

export type ParsedImport = {
  candidates: Array<{
    row: number;
    data: ValidRequestInput;
  }>;
  rejected: Array<{
    row: number;
    reason: string;
  }>;
};

type CsvRecord = {
  record: string[];
  raw: string;
  info: { bytes: number };
};

const REQUIRED_HEADERS = [
  'external_id',
  'received_at',
  'requester',
  'subject',
  'description',
  'priority',
];

const PRIORITIES: Priority[] = ['low', 'normal', 'high', 'urgent'];

function parseTimestamp(value: string): Date | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/i,
  );

  if (!match) return null;

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    zone,
  ] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }

  if (zone.toUpperCase() !== 'Z') {
    const offsetHour = Number(zone.slice(1, 3));
    const offsetMinute = Number(zone.slice(4, 6));

    if (offsetHour > 23 || offsetMinute > 59) {
      return null;
    }
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseCsv(buffer: Buffer): ParsedImport {
  let rows: CsvRecord[];

  try {
    rows = parse(buffer, {
      bom: true,
      skip_empty_lines: true,
      relax_column_count: true,
      info: true,
      raw: true,
    }) as unknown as CsvRecord[];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    throw new Error(`Invalid CSV structure: ${message}`);
  }

  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = rows[0].record.map((value) => value.trim());

  if (new Set(headers).size !== headers.length) {
    throw new Error('CSV contains duplicate headers');
  }

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const result: ParsedImport = {
    candidates: [],
    rejected: [],
  };

  // Track physical CSV lines, not just record numbers.
  let scanOffset = 0;
  let physicalLine = 1;

  function lineAt(bytePosition: number): number {
    while (scanOffset < bytePosition) {
      const byte = buffer[scanOffset];

      if (byte === 10 || (byte === 13 && buffer[scanOffset + 1] !== 10)) {
        physicalLine++;
      }

      scanOffset++;
    }

    return physicalLine;
  }

  for (const item of rows.slice(1)) {
    const fields = item.record;

    const startByte = item.info.bytes - Buffer.byteLength(item.raw);

    const rowNumber = lineAt(Math.max(0, startByte));

    if (fields.every((value) => value.trim() === '')) {
      continue;
    }

    if (fields.length !== headers.length) {
      result.rejected.push({
        row: rowNumber,
        reason: `Expected ${headers.length} columns, received ${fields.length}`,
      });
      continue;
    }

    const get = (name: string): string =>
      (fields[headers.indexOf(name)] ?? '').trim();

    const externalId = get('external_id');
    const requester = get('requester');
    const subject = get('subject');
    const priority = get('priority').toLowerCase();
    const receivedAt = parseTimestamp(get('received_at'));

    let reason: string | null = null;

    if (!externalId) {
      reason = 'Missing external_id';
    } else if (!requester) {
      reason = 'Missing requester';
    } else if (!subject) {
      reason = 'Missing subject';
    } else if (!receivedAt) {
      reason = 'Invalid or missing received_at';
    } else if (!PRIORITIES.includes(priority as Priority)) {
      reason = 'Invalid or missing priority';
    }

    if (reason) {
      result.rejected.push({
        row: rowNumber,
        reason,
      });
      continue;
    }

    result.candidates.push({
      row: rowNumber,
      data: {
        externalId,
        receivedAt: receivedAt!,
        requester,
        subject,
        description: get('description') || null,
        priority: priority as Priority,
      },
    });
  }

  return result;
}

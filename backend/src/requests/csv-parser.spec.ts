import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseCsv } from './csv-parser';

describe('parseCsv', () => {
  it('parses quoted commas and empty descriptions', () => {
    const csv = [
      'external_id,received_at,requester,subject,description,priority',
      'REQ-9001,2026-10-14T09:00:00Z,Ada,"Payment, refund",,HIGH',
    ].join('\n');

    const result = parseCsv(Buffer.from(csv));

    expect(result.candidates).toHaveLength(1);
    expect(result.rejected).toHaveLength(0);

    expect(result.candidates[0].row).toBe(2);
    expect(result.candidates[0].data.subject).toBe('Payment, refund');
    expect(result.candidates[0].data.description).toBeNull();
    expect(result.candidates[0].data.priority).toBe('high');
  });

  it('rejects a whitespace-only requester', () => {
    const csv = [
      'external_id,received_at,requester,subject,description,priority',
      'REQ-9002,2026-10-14T09:00:00Z,   ,Access issue,,normal',
    ].join('\n');

    const result = parseCsv(Buffer.from(csv));

    expect(result.candidates).toHaveLength(0);
    expect(result.rejected).toEqual([
      {
        row: 2,
        reason: expect.stringMatching(/requester/i),
      },
    ]);
  });

  it('validates the original assignment fixture', () => {
    const fixturePath = resolve(process.cwd(), '../fixtures/requests.csv');

    const buffer = readFileSync(fixturePath);

    const result = parseCsv(buffer);

    expect(result.candidates).toHaveLength(11);

    expect(result.rejected).toHaveLength(3);

    expect(result.rejected.map((error) => error.row)).toEqual([12, 13, 15]);
  });

  it('reports physical lines after multiline fields', () => {
    const csv = [
      'external_id,received_at,requester,subject,description,priority',
      'REQ-9001,2026-10-14T09:00:00Z,Ada,Access issue,"First line',
      'Second line",normal',
      'REQ-9002,2026-10-14T10:00:00Z,   ,Account issue,,high',
    ].join('\n');

    const result = parseCsv(Buffer.from(csv));

    expect(result.candidates).toHaveLength(1);

    expect(result.candidates[0].data.description).toBe(
      'First line\nSecond line',
    );

    expect(result.rejected).toEqual([
      {
        row: 4,
        reason: expect.stringMatching(/requester/i),
      },
    ]);
  });
});

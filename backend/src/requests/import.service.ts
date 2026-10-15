import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseCsv } from './csv-parser.js';

export type ImportSummary = {
  imported: number;
  rejected: number;
  errors: Array<{
    row: number;
    reason: string;
  }>;
};

const MAX_FILE_SIZE = 1024 * 1024;

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importCsv(buffer: Buffer): Promise<ImportSummary> {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException('CSV file must not exceed 1 MiB');
    }

    let parsed: ReturnType<typeof parseCsv>;

    try {
      parsed = parseCsv(buffer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid CSV file';

      throw new BadRequestException(message);
    }

    return this.prisma.$transaction(async (tx) => {
      const externalIds = parsed.candidates.map(({ data }) => data.externalId);

      const existing = await tx.request.findMany({
        where: {
          externalId: { in: externalIds },
        },
        select: {
          externalId: true,
        },
      });

      const seenIds = new Set(existing.map((request) => request.externalId));

      const accepted: Array<(typeof parsed.candidates)[number]['data']> = [];

      const errors = [...parsed.rejected];

      for (const candidate of parsed.candidates) {
        const { row, data } = candidate;

        if (seenIds.has(data.externalId)) {
          errors.push({
            row,
            reason: `Duplicate external_id: ${data.externalId}`,
          });
          continue;
        }

        seenIds.add(data.externalId);
        accepted.push(data);
      }

      let imported = 0;

      if (accepted.length > 0) {
        const result = await tx.request.createMany({
          data: accepted.map((data) => ({
            ...data,
            status: 'NEW',
            owner: null,
          })),
        });

        imported = result.count;
      }

      errors.sort((a, b) => a.row - b.row);

      return {
        imported,
        rejected: errors.length,
        errors,
      };
    });
  }
}

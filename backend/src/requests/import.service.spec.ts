import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { ImportService } from './import.service';

describe('ImportService - SQLite integration', () => {
  let testDirectory: string;
  let prisma: PrismaService;
  let importService: ImportService;

  const fixture = readFileSync(
    resolve(process.cwd(), '../fixtures/requests.csv'),
  );

  beforeEach(async () => {
    // Give each test its own isolated database.
    testDirectory = mkdtempSync(join(tmpdir(), 'request-triage-test-'));

    const databasePath = join(testDirectory, 'test.db');

    // Apply our actual database migrations.
    const sqlite = new Database(databasePath);
    const migrationsDirectory = resolve(process.cwd(), 'prisma/migrations');

    const migrations = readdirSync(migrationsDirectory)
      .filter((name) => name.endsWith('_init'))
      .sort();

    if (migrations.length !== 1) {
      throw new Error('Expected one initial migration');
    }

    const migrationSql = readFileSync(
      join(migrationsDirectory, migrations[0], 'migration.sql'),
      'utf8',
    );

    sqlite.exec(migrationSql);
    sqlite.close();

    // Connect Prisma to the temporary database.
    const url = `file:${databasePath.replace(/\\/g, '/')}`;

    prisma = new PrismaService(new ConfigService({ DATABASE_URL: url }));

    await prisma.$connect();

    importService = new ImportService(prisma);
  });

  afterEach(async () => {
    await prisma?.$disconnect();

    if (testDirectory) {
      rmSync(testDirectory, {
        recursive: true,
        force: true,
      });
    }
  });

  it('imports 10 requests and rejects 4 fixture rows', async () => {
    const summary = await importService.importCsv(fixture);

    expect(summary.imported).toBe(10);
    expect(summary.rejected).toBe(4);

    expect(summary.errors.map((error) => error.row)).toEqual([11, 12, 13, 15]);

    expect(await prisma.request.count()).toBe(10);
  });

  it('rejects re-imports without overwriting team edits', async () => {
    await importService.importCsv(fixture);

    await prisma.request.update({
      where: { externalId: 'REQ-1004' },
      data: {
        status: 'IN_PROGRESS',
        owner: 'Grace',
      },
    });

    const summary = await importService.importCsv(fixture);

    expect(summary.imported).toBe(0);
    expect(summary.rejected).toBe(14);

    expect(await prisma.request.count()).toBe(10);

    const request = await prisma.request.findUniqueOrThrow({
      where: { externalId: 'REQ-1004' },
    });

    expect(request.status).toBe('IN_PROGRESS');
    expect(request.owner).toBe('Grace');
  });
});

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  isRequestStatus,
  type UpdateRequestDto,
} from './dto/update-request.dto.js';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    if (status !== undefined && !isRequestStatus(status)) {
      throw new BadRequestException(
        'Status must be NEW, IN_PROGRESS, or RESOLVED',
      );
    }

    return this.prisma.request.findMany({
      where: status ? { status } : {},
      orderBy: [{ receivedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Request ${id} was not found`);
    }

    return request;
  }

  async update(id: number, changes: UpdateRequestDto) {
    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('Provide a status or owner to update');
    }

    // Check that the request exists.
    await this.findOne(id);

    const data: {
      status?: UpdateRequestDto['status'];
      owner?: string | null;
    } = {};

    if (changes.status !== undefined) {
      data.status = changes.status;
    }

    if ('owner' in changes) {
      data.owner = changes.owner?.trim() || null;
    }

    return this.prisma.request.update({
      where: { id },
      data,
    });
  }
}

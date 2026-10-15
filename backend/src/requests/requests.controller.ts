import type {} from 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService, ImportSummary } from './import.service';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestService: RequestsService,
    private readonly importService: ImportService,
  ) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.requestService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateRequestDto,
  ) {
    return this.requestService.update(id, changes);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024,
      },
    }),
  )
  async importRequests(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ImportSummary> {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.importService.importCsv(file.buffer);
  }
}

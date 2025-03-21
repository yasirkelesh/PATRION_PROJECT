import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard} from '../auth/auth.guard';



@Controller('company')
export class CompanyController {
    constructor(private companyService: CompanyService) {}

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('system_admin')
    @Get()
    findAll() {
        return this.companyService.findAll();
    }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('system_admin')
    @Get(':id')
    findOne(@Param('id') id: string): Promise<Company| null> {
        return this.companyService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('system_admin')
    @Post()
    create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
        return this.companyService.create(createCompanyDto);
    }

    async update(id: number, updateCompanyDto: CreateCompanyDto): Promise<Company> {
    await this.companyService.update(id, updateCompanyDto);
    const updatedCompany = await this.companyService.findOne(id);
    if (!updatedCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return updatedCompany;
  }
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('system_admin')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
      return this.companyService.remove(+id);
  }

}

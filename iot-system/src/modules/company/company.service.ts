import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { LoggerService } from '../logging/logger.service';


@Injectable()
export class CompanyService {
    constructor(
         @InjectRepository(Company)
         private companyRepository: Repository<Company>,
         private loggerService: LoggerService,
    ) {}

    findAll() {
        this.loggerService.logUserActivity('system', 'company_listed', {});
        return this.companyRepository.find();

    }
    
    findOne(id: number) {
        this.loggerService.logUserActivity('system', 'company_viewed', { company_id: id });
        return this.companyRepository.findOne({ where: { id } });
    }

    findOneByCompanyName(name: string) {
        this.loggerService.logUserActivity('system', 'company_viewed', { company_name: name });
        return this.companyRepository.findOne({ where: { name } });
    }

    create(createCompanyDto: CreateCompanyDto) {
        const company = new Company();
        company.name = createCompanyDto.name;
        this.loggerService.logUserActivity('system', 'company_created', { company_name: company.name });
        return this.companyRepository.save(company);
    }

    update(id: number, updateCompanyDto: CreateCompanyDto) {
        this.loggerService.logUserActivity('system', 'company_updated', { company_id: id });
        return this.companyRepository.update(id, updateCompanyDto);
    }

    remove(id: number) {
        this.loggerService.logUserActivity('system', 'company_deleted', { company_id: id });
        return this.companyRepository.delete(id);
    }

    /*addUsersToCompany(companyId: number, userIds: number[]) {
        return this.companyRepository
            .createQueryBuilder()
            .relation(Company, 'users')
            .of(companyId)
            .add(userIds);
    }*/
}

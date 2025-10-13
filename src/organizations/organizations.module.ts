import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization } from './organizations.model';
import { OrganizationUser } from './organization-user.model';
import { User } from '../users/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Organization, OrganizationUser, User])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}

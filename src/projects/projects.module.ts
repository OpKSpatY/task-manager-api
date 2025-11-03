import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectSprintsController } from './project-sprints.controller';
import { ProjectSprintsService } from './project-sprints.service';
import { Project } from './project.model';
import { ProjectSprint } from './project-sprint.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser } from '../organizations/organization-user.model';
import { Team } from '../teams/team.model';
import { User } from '../users/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Project,
      ProjectSprint,
      Organization,
      OrganizationUser,
      Team,
      User,
    ]),
  ],
  controllers: [ProjectsController, ProjectSprintsController],
  providers: [ProjectsService, ProjectSprintsService],
  exports: [ProjectsService, ProjectSprintsService],
})
export class ProjectsModule {}

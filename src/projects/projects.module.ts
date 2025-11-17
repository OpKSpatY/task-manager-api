import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectSprintsController } from './project-sprints.controller';
import { ProjectSprintsService } from './project-sprints.service';
import { ProjectTasksController } from './project-tasks.controller';
import { ProjectTasksService } from './project-tasks.service';
import { TaskChecklistsController } from './task-checklists.controller';
import { TaskChecklistsService } from './task-checklists.service';
import { TaskChecklistItemsController } from './task-checklist-items.controller';
import { TaskChecklistItemsService } from './task-checklist-items.service';
import { Project } from './project.model';
import { ProjectSprint } from './project-sprint.model';
import { ProjectTask } from './project-task.model';
import { TaskChecklist } from './task-checklist.model';
import { TaskChecklistItem } from './task-checklist-item.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser } from '../organizations/organization-user.model';
import { Team } from '../teams/team.model';
import { User } from '../users/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Project,
      ProjectSprint,
      ProjectTask,
      TaskChecklist,
      TaskChecklistItem,
      Organization,
      OrganizationUser,
      Team,
      User,
    ]),
  ],
  controllers: [
    ProjectsController,
    ProjectSprintsController,
    ProjectTasksController,
    TaskChecklistsController,
    TaskChecklistItemsController,
  ],
  providers: [
    ProjectsService,
    ProjectSprintsService,
    ProjectTasksService,
    TaskChecklistsService,
    TaskChecklistItemsService,
  ],
  exports: [
    ProjectsService,
    ProjectSprintsService,
    ProjectTasksService,
    TaskChecklistsService,
    TaskChecklistItemsService,
  ],
})
export class ProjectsModule {}

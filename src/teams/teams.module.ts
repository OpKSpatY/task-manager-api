import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './team.model';
import { TeamUser } from './team-user.model';
import { User } from '../users/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Team, TeamUser, User])],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}


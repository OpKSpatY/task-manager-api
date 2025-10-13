import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserToTeamDto {
  @ApiProperty({
    description: 'ID do usuário a ser adicionado ao time',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @IsUUID('4', { message: 'O ID do usuário deve ser um UUID válido' })
  userId: string;
}

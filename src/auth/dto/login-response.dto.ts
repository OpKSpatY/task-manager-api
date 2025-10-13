import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Mensagem de resposta',
    example: 'Login realizado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Dados do usuário logado',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Token JWT para autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tempo de expiração do token',
    example: '24h',
  })
  expiresIn: string;
}

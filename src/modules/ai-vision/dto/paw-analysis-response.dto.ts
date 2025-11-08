import { ApiExtraModels } from '@nestjs/swagger';
import { SkinAnalysisResponseDto } from './skin-analysis-response.dto';

@ApiExtraModels(SkinAnalysisResponseDto)
export class PawAnalysisResponseDto extends SkinAnalysisResponseDto {}



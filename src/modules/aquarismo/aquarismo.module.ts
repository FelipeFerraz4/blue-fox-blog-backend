import { Module } from '@nestjs/common';
import { BiomesController } from './biomes/biomes.controller';
import { BiomesService } from './biomes/biomes.service';
import { CompatibilityController } from './compatibility/compatibility.controller';
import { CompatibilityService } from './compatibility/compatibility.service';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';
import { FamiliesController } from './families/families.controller';
import { FamiliesService } from './families/families.service';
import { SpeciesController } from './species/species.controller';
import { SpeciesService } from './species/species.service';

/**
 * Domínio Aquarismo (catálogo de espécies, famílias, biomas, equipamentos e compatibilidade).
 * Isolado para poder virar microserviço: não importa módulos de posts/comments, e a ligação com
 * artigos é só por slug (ex.: `guideSlug` dos equipamentos). Rotas em `v1/aquarismo/*`.
 */
@Module({
  controllers: [SpeciesController, FamiliesController, BiomesController, EquipmentController, CompatibilityController],
  providers: [SpeciesService, FamiliesService, BiomesService, EquipmentService, CompatibilityService],
})
export class AquarismoModule {}

export const REQUIREMENTS_FOR_PART: Record<Mechanic.PartType, { items: string[]; amount: number }> = {
  repair: { items: ['material_iron', 'material_steel', 'material_aluminum'], amount: 1 },
  tune: { items: ['material_iron', 'material_steel', 'material_aluminum'], amount: 5 },
};

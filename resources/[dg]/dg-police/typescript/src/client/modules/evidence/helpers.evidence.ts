export const getEvidenceLabel = (type: Police.Evidence.Type) => {
  switch (type) {
    case 'blood':
      return 'Bloed';
    case 'bullet':
      return 'Kogelhuls';
    case 'vehicleDamage':
      return 'Voertuigschade';
  }
};

export const ARENA_COORDS: Vec3 = { x: -324.2203, y: -1968.493, z: 20.60336 };

export const ARENA_IPL = 'gabz_mba_milo_';

export const ARENA_TYPES: Record<string, Arena.Type> = {
  BASKETBALL: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_basketball', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_basketball'],
  },
  DERBY: {
    entitySets: ['mba_cover', 'mba_terrain', 'mba_derby', 'mba_ring_of_fire'],
    exteriorIpls: ['gabz_ipl_mba_sign_derby'],
  },
  PAINTBALL: {
    entitySets: ['mba_tribune', 'mba_chairs', 'mba_paintball', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_paintball'],
  },
  CONCERT: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_backstage', 'mba_concert', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_concert'],
  },
  FASHION: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_backstage', 'mba_fashion', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_fashion'],
  },
  FAME_OR_SHAME: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_backstage', 'mba_fameorshame', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_fameorshame'],
  },
  WRESTLING: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_fighting', 'mba_wrestling', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_wrestling'],
  },
  MMA: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_fighting', 'mba_mma', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_mma'],
  },
  BOXING: {
    entitySets: ['mba_tribune', 'mba_tarps', 'mba_fighting', 'mba_boxing', 'mba_jumbotron'],
    exteriorIpls: ['gabz_ipl_mba_sign_boxing'],
  },
  CURLING: {
    entitySets: ['mba_tribune', 'mba_chairs', 'mba_curling'],
    exteriorIpls: ['gabz_ipl_mba_sign_curling'],
  },
  ROCKET_LEAGUE: {
    entitySets: ['mba_tribune', 'mba_chairs', 'mba_rocketleague'],
    exteriorIpls: ['gabz_ipl_mba_sign_banditoleague'],
  },
  SOCCER: {
    entitySets: ['mba_tribune', 'mba_chairs', 'mba_field', 'mba_soccer'],
    exteriorIpls: ['gabz_ipl_mba_sign_soccer'],
  },
  ICE_HOCKEY: {
    entitySets: ['mba_tribune', 'mba_chairs', 'mba_field', 'mba_hockey'],
    exteriorIpls: ['gabz_ipl_mba_sign_icehockey'],
  },
  GOKART_1: {
    entitySets: ['mba_cover', 'mba_gokart_01'],
    exteriorIpls: ['gabz_ipl_mba_sign_gokart'],
  },
  GOKART_2: {
    entitySets: ['mba_cover', 'mba_gokart_02'],
    exteriorIpls: ['gabz_ipl_mba_sign_gokart'],
  },
  TRACKMANIA_1: {
    entitySets: ['mba_cover', 'mba_trackmania_01'],
    exteriorIpls: ['gabz_ipl_mba_sign_banditomania'],
  },
  TRACKMANIA_2: {
    entitySets: ['mba_cover', 'mba_trackmania_02'],
    exteriorIpls: ['gabz_ipl_mba_sign_banditomania'],
  },
  TRACKMANIA_3: {
    entitySets: ['mba_cover', 'mba_trackmania_03'],
    exteriorIpls: ['gabz_ipl_mba_sign_banditomania'],
  },
  TRACKMANIA_4: {
    entitySets: ['mba_cover', 'mba_trackmania_04'],
    exteriorIpls: ['gabz_ipl_mba_sign_banditomania'],
  },
};

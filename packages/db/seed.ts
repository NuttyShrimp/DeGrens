import { PrismaClient } from '@prisma/client';

import mainConfig from '../../resources/[dg]/dg-config/configs/main.json';

const prisma = new PrismaClient();

async function main() {
  await prisma.users.create({
    data: {
      name: 'NuttyShrimp',
      steamid: 'steam:110000137164c7d',
      license: 'license:ea3021d1c62a5a3e3738dfefaed6de1137117a1e',
      discord: 'discord:214294598766297088',
      created_at: new Date('2022-08-30 10:09:41'),
      last_updated: new Date('2022-08-30 10:09:41'),
    },
  });
  await prisma.characters.create({
    data: {
      citizenid: 1000,
      steamid: 'steam:110000137164c7d',
    },
  });
  await prisma.character_data.create({
    data: {
      citizenid: 1000,
      metadata:
        '{"downState":"alive","dna":"VS188j77ZZe1093","needs":{"hunger":91,"thirst":91},"stress":0,"callsign":"NO CALLSIGN","inside":{"apartment":[]},"licences":{"driver":true},"jailMonths":-1,"armor":0}',
      position: '{"x":105.639,"y":-776.808,"z":31.436}',
    },
  });
  await prisma.character_info.create({
    data: {
      citizenid: 1000,
      firstname: 'Nico',
      lastname: 'Svensen',
      birthdate: '2000/08/29',
      gender: 0,
      nationality: 'Belg',
      phone: '0473626283',
      cash: 500,
    },
  });
  await prisma.permissions.createMany({
    data: [
      {
        name: 'NuttyShrimp',
        steamid: 'steam:110000137164c7d',
        role: 'developer',
      },
      {
        name: 'Jens',
        steamid: 'steam:11000011bf78d6c',
        role: 'developer',
      },
      {
        name: 'pieter',
        steamid: 'steam:11000010119ac2a',
        role: 'developer',
      },
    ],
  });
  await prisma.playerskins.create({
    data: {
      citizenid: 1000,
      skin: '{"nose_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"lips_thickness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"vest":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"t-shirt":{"defaultTexture":0,"defaultItem":1,"item":176,"texture":1},"chimp_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"torso2":{"defaultTexture":0,"defaultItem":0,"item":390,"texture":6},"nose_5":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_high":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"neck_thikness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"blush":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"glass":{"defaultTexture":0,"defaultItem":0,"item":5,"texture":5},"decals":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_opening":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_color":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"arms":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"hair":{"defaultTexture":0,"defaultItem":0,"item":21,"texture":3},"makeup":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"lipstick":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"watch":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"face":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"shoes":{"defaultTexture":0,"defaultItem":1,"item":7,"texture":0},"cheek_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"beard":{"defaultTexture":1,"defaultItem":-1,"item":10,"texture":3},"nose_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lowering":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_back_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"mask":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"cheek_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_4":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_forward":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_0":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrows":{"defaultTexture":1,"defaultItem":-1,"item":1,"texture":1},"moles":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"hat":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bag":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ageing":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"accessory":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ear":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bracelet":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"cheek_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"pants":{"defaultTexture":0,"defaultItem":0,"item":143,"texture":0},"chimp_hole":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0}}',
      model: '1885233650',
      active: 1,
    },
  });
  await prisma.whitelist_jobs.createMany({
    data: [
      { cid: 1000, job: 'police', rank: 6, speciality: 7 },
      { cid: 1000, job: 'ambulance', rank: 2, speciality: 1 },
      { cid: 1000, job: 'lawyer', rank: 0, speciality: 1 },
    ],
  });
  await prisma.queue_priority.createMany({
    data: [
      {
        steamid: 'steam:110000137164c7d',
        priority: 999,
      },
      {
        steamid: 'steam:11000011bf78d6c',
        priority: 999,
      },
      {
        steamid: 'steam:11000010119ac2a',
        priority: 999,
      },
    ],
  });
  await prisma.tax_logs.create({
    data: {
      date: new Date(),
    },
  });
}

async function devEnv() {
  if (mainConfig.production) return;
  await prisma.users.create({
    data: {
      name: 'Jens',
      steamid: 'steam:11000011bf78d6c',
      license: 'license:8bc761e0e627c998c5578b7eb902385e19f01860',
      discord: 'discord:265448399921348608',
      created_at: new Date('2022-08-30 10:09:41'),
      last_updated: new Date('2022-08-30 10:09:41'),
    },
  });
  await prisma.characters.create({
    data: {
      citizenid: 1001,
      steamid: 'steam:11000011bf78d6c',
    },
  });
  await prisma.character_data.create({
    data: {
      citizenid: 1001,
      metadata:
        '{"downState":"alive","dna":"VS188j77ZZe1093","needs":{"hunger":91,"thirst":91},"stress":0,"callsign":"NO CALLSIGN","inside":{"apartment":[]},"licences":{"driver":true},"jailMonths":-1,"armor":0}',
      position: '{"x":105.639,"y":-776.808,"z":31.436}',
    },
  });
  await prisma.character_info.create({
    data: {
      citizenid: 1001,
      firstname: 'Benny',
      lastname: 'Van Der Meer',
      birthdate: '2000/08/29',
      gender: 0,
      nationality: 'Belg',
      phone: '0474640132',
      cash: 500,
    },
  });
  await prisma.bank_accounts.createMany({
    data: [
      {
        account_id: 'BE49834957',
        name: 'DFF Business',
        type: 'business',
        balance: 5000,
      },
      {
        account_id: 'BE58084424',
        name: 'PDM',
        type: 'business',
        balance: 5000,
      },
    ],
  });
  await prisma.bank_accounts_access.createMany({
    data: [
      {
        account_id: 'BE49834957',
        cid: 1000,
        access_level: 31,
      },
      {
        account_id: 'BE49834957',
        cid: 1001,
        access_level: 31,
      },
      {
        account_id: 'BE58084424',
        cid: 1000,
        access_level: 31,
      },
      {
        account_id: 'BE58084424',
        cid: 1001,
        access_level: 31,
      },
    ],
  });
  await prisma.playerskins.create({
    data: {
      citizenid: 1001,
      skin: '{"nose_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"lips_thickness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"vest":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"t-shirt":{"defaultTexture":0,"defaultItem":1,"item":176,"texture":1},"chimp_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"torso2":{"defaultTexture":0,"defaultItem":0,"item":390,"texture":6},"nose_5":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_high":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"neck_thikness":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"blush":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"glass":{"defaultTexture":0,"defaultItem":0,"item":5,"texture":5},"decals":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_opening":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eye_color":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"arms":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"hair":{"defaultTexture":0,"defaultItem":0,"item":21,"texture":3},"makeup":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"lipstick":{"defaultTexture":1,"defaultItem":-1,"item":-1,"texture":1},"watch":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"face":{"defaultTexture":0,"defaultItem":0,"item":4,"texture":0},"shoes":{"defaultTexture":0,"defaultItem":1,"item":7,"texture":0},"cheek_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"beard":{"defaultTexture":1,"defaultItem":-1,"item":10,"texture":3},"nose_1":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lowering":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_back_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"chimp_bone_lenght":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"jaw_bone_width":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"mask":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"cheek_2":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_4":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrown_forward":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"nose_0":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"eyebrows":{"defaultTexture":1,"defaultItem":-1,"item":1,"texture":1},"moles":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"hat":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bag":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ageing":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"accessory":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"ear":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"bracelet":{"defaultTexture":0,"defaultItem":-1,"item":-1,"texture":0},"cheek_3":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0},"pants":{"defaultTexture":0,"defaultItem":0,"item":143,"texture":0},"chimp_hole":{"defaultTexture":0,"defaultItem":0,"item":0,"texture":0}}',
      model: '1885233650',
      active: 1,
    },
  });
  await prisma.business_type.createMany({
    data: [
      {
        name: 'mechanic',
        id: 1,
      },
      {
        name: 'showroom',
        id: 2,
      },
    ],
  });
  await prisma.business.createMany({
    data: [
      {
        name: 'dff',
        label: 'De FliereFluiters',
        business_type: 1,
        bank_account_id: 'BE49834957',
      },
      {
        name: 'pdm',
        label: 'PDM',
        business_type: 2,
        bank_account_id: 'BE58084424',
      },
    ],
  });
  await prisma.business_role.createMany({
    data: [
      {
        id: 1,
        business_id: 1,
        name: 'CEO',
        permissions: 63,
      },
      {
        id: 2,
        business_id: 2,
        name: 'CEO',
        permissions: 127,
      },
    ],
  });
  await prisma.business_employee.createMany({
    data: [
      {
        is_owner: true,
        citizenid: 1000,
        role_id: 1,
        business_id: 1,
      },
      {
        is_owner: false,
        citizenid: 1001,
        role_id: 1,
        business_id: 1,
      },
      {
        is_owner: false,
        citizenid: 1000,
        role_id: 2,
        business_id: 2,
      },
      {
        is_owner: true,
        citizenid: 1001,
        role_id: 2,
        business_id: 2,
      },
    ],
  });
  await prisma.whitelist_jobs.create({
    data: { cid: 1001, job: 'police', rank: 6, speciality: 7 },
  });
}

async function doMigr() {
  await main();
  await devEnv();
}

doMigr()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async e => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });

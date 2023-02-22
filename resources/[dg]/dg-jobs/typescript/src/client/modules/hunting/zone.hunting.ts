import { PolyZone } from '@dgx/client';
import { isDoingHuntingJob } from './service.hunting';

const ZONE = [
  { x: -897.06719970703, y: 5739.1015625 },
  { x: -830.1708984375, y: 5879.673828125 },
  { x: -934.00115966797, y: 6064.2568359375 },
  { x: -869.52874755859, y: 6111.998046875 },
  { x: -797.94439697266, y: 6008.2456054688 },
  { x: -717.26354980469, y: 6089.1586914062 },
  { x: -654.99237060547, y: 6177.6279296875 },
  { x: -601.69329833984, y: 6282.7436523438 },
  { x: -443.20330810547, y: 6424.5649414062 },
  { x: -89.813438415527, y: 6698.3095703125 },
  { x: 56.617469787598, y: 7224.705078125 },
  { x: 215.89053344727, y: 7043.2177734375 },
  { x: 393.13671875, y: 6894.7436523438 },
  { x: 702.03802490234, y: 6672.8491210938 },
  { x: 1171.1220703125, y: 6595.1557617188 },
  { x: 1522.1624755859, y: 6638.4516601562 },
  { x: 2018.1124267578, y: 6718.7583007812 },
  { x: 2254.0778808594, y: 6742.3217773438 },
  { x: 2432.5856933594, y: 6636.5454101562 },
  { x: 2570.8891601562, y: 6621.5327148438 },
  { x: 2733.65234375, y: 6522.9775390625 },
  { x: 2957.7153320312, y: 6383.3647460938 },
  { x: 3159.1201171875, y: 6346.3271484375 },
  { x: 3247.18359375, y: 6160.1435546875 },
  { x: 3426.3059082031, y: 6123.7534179688 },
  { x: 3430.5588378906, y: 5910.4311523438 },
  { x: 3393.5759277344, y: 5614.9443359375 },
  { x: 3451.2126464844, y: 5497.00390625 },
  { x: 3250.3583984375, y: 5344.7641601562 },
  { x: 3362.5549316406, y: 5104.5751953125 },
  { x: 3451.8920898438, y: 4990.3530273438 },
  { x: 3538.609375, y: 4841.7177734375 },
  { x: 3713.9008789062, y: 4679.638671875 },
  { x: 3822.2736816406, y: 4488.9580078125 },
  { x: 3882.7866210938, y: 4222.4799804688 },
  { x: 3984.1994628906, y: 4099.4243164062 },
  { x: 3777.4360351562, y: 3803.8498535156 },
  { x: 3977.2153320312, y: 3587.5861816406 },
  { x: 3894.2841796875, y: 3314.3588867188 },
  { x: 3783.5920410156, y: 3166.736328125 },
  { x: 3665.5915527344, y: 2970.0434570312 },
  { x: 3497.8342285156, y: 2767.1530761719 },
  { x: 3268.9919433594, y: 2419.2138671875 },
  { x: 3277.7824707031, y: 2189.2734375 },
  { x: 3156.65234375, y: 1952.3780517578 },
  { x: 2992.8410644531, y: 1811.7919921875 },
  { x: 2964.8508300781, y: 1533.7634277344 },
  { x: 2800.1477050781, y: 1263.1701660156 },
  { x: 3023.2734375, y: 525.02398681641 },
  { x: 2894.2724609375, y: 213.26702880859 },
  { x: 2947.1433105469, y: -328.70809936523 },
  { x: 2833.6931152344, y: -771.78814697266 },
  { x: 2630.7229003906, y: -1192.7132568359 },
  { x: 2698.2487792969, y: -1635.7756347656 },
  { x: 2609.8327636719, y: -2114.77734375 },
  { x: 2297.3608398438, y: -2152.5478515625 },
  { x: 1996.6896972656, y: -2593.5310058594 },
  { x: 1574.0289306641, y: -2757.8012695312 },
  { x: 1229.3699951172, y: -2628.845703125 },
  { x: 1658.1588134766, y: -2532.2263183594 },
  { x: 1716.1644287109, y: -2368.3837890625 },
  { x: 1673.3752441406, y: -2174.8718261719 },
  { x: 1722.0227050781, y: -2013.0637207031 },
  { x: 1743.8754882812, y: -1796.58203125 },
  { x: 1827.3133544922, y: -1644.4884033203 },
  { x: 1831.2624511719, y: -1456.5604248047 },
  { x: 1906.990234375, y: -1358.9168701172 },
  { x: 1914.4937744141, y: -1211.5843505859 },
  { x: 1971.3448486328, y: -1061.958984375 },
  { x: 1975.1831054688, y: -918.50390625 },
  { x: 1821.4730224609, y: -1046.1368408203 },
  { x: 1757.8319091797, y: -1242.1500244141 },
  { x: 1620.21484375, y: -1347.4168701172 },
  { x: 1449.0952148438, y: -1508.7438964844 },
  { x: 1290.8493652344, y: -1465.3939208984 },
  { x: 1260.9887695312, y: -1334.8470458984 },
  { x: 1217.6220703125, y: -1100.7495117188 },
  { x: 1171.37890625, y: -920.09790039062 },
  { x: 1267.76171875, y: -764.92114257812 },
  { x: 1407.0294189453, y: -557.79077148438 },
  { x: 1281.7744140625, y: -297.93701171875 },
  { x: 1218.0477294922, y: 82.968505859375 },
  { x: 1312.982421875, y: 323.15216064453 },
  { x: 1182.1610107422, y: 417.86465454102 },
  { x: 1497.6959228516, y: 785.66162109375 },
  { x: 1623.3897705078, y: 1055.3435058594 },
  { x: 1695.7557373047, y: 1298.0806884766 },
  { x: 1769.1584472656, y: 1559.7873535156 },
  { x: 1916.5966796875, y: 2164.0451660156 },
  { x: 1986.7946777344, y: 2450.4953613281 },
  { x: 2232.6374511719, y: 2725.1169433594 },
  { x: 2512.5637207031, y: 2966.0771484375 },
  { x: 2712.3796386719, y: 3185.6706542969 },
  { x: 2834.482421875, y: 3434.9631347656 },
  { x: 2936.5029296875, y: 3740.7182617188 },
  { x: 2931.2319335938, y: 4063.1513671875 },
  { x: 2859.8635253906, y: 4301.6044921875 },
  { x: 2744.2221679688, y: 4690.1625976562 },
  { x: 2636.83203125, y: 5186.71484375 },
  { x: 2497.326171875, y: 5108.7514648438 },
  { x: 2362.8747558594, y: 5252.9951171875 },
  { x: 2033.4006347656, y: 5163.1435546875 },
  { x: 1734.4156494141, y: 4999.9985351562 },
  { x: 1675.6687011719, y: 4596.1884765625 },
  { x: 1403.3204345703, y: 4326.4038085938 },
  { x: 1182.1771240234, y: 4298.6088867188 },
  { x: 878.37567138672, y: 4177.5053710938 },
  { x: 496.86019897461, y: 4167.0502929688 },
  { x: 218.48432922363, y: 4281.1293945312 },
  { x: -140.04125976562, y: 4238.8315429688 },
  { x: -133.48745727539, y: 3847.765625 },
  { x: 128.88549804688, y: 3758.3537597656 },
  { x: 133.54620361328, y: 3454.291015625 },
  { x: 158.59669494629, y: 3141.5554199219 },
  { x: -111.11811065674, y: 2928.775390625 },
  { x: -465.99185180664, y: 2874.8654785156 },
  { x: -783.24353027344, y: 2797.6552734375 },
  { x: -1313.9320068359, y: 2529.1511230469 },
  { x: -1657.2053222656, y: 2457.8342285156 },
  { x: -2075.701171875, y: 2345.1042480469 },
  { x: -2385.4741210938, y: 2285.9055175781 },
  { x: -2705.3696289062, y: 2300.0441894531 },
  { x: -2765.7456054688, y: 2986.5583496094 },
  { x: -3077.8676757812, y: 3312.880859375 },
  { x: -2906.3195800781, y: 3562.9418945312 },
  { x: -2624.0571289062, y: 3618.92578125 },
  { x: -2509.0673828125, y: 4065.4990234375 },
  { x: -2331.0544433594, y: 4428.8583984375 },
  { x: -1761.1796875, y: 5077.0717773438 },
  { x: -1481.5866699219, y: 5414.9736328125 },
];

setImmediate(() => {
  PolyZone.addPolyZone('hunting_reduce_pedspawns', ZONE, {
    minZ: 0,
    maxZ: 200,
    data: {},
  });
});

export const overrideDensitySettings = () => {
  global.exports['dg-misc'].overrideDensitySettings({
    scenario: 0.3,
    peds: 0.3,
  });
};

export const resetDensitySettings = () => {
  global.exports['dg-misc'].resetDensitySettings();
};

PolyZone.onEnter('hunting_reduce_pedspawns', () => {
  if (!isDoingHuntingJob()) return;
  overrideDensitySettings();
});

PolyZone.onLeave('hunting_reduce_pedspawns', () => {
  global.exports['dg-misc'].resetDensitySettings();
});

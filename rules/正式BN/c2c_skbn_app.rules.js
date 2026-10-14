/* C2C SKBN APP template rules – independent C2C text splitter. */
(function () {
  'use strict';

  const FAMILY = 'c2c_skbn_app';
  const TEMPLATE_ID = '05_C2C SKBN APP';
  const TEMPLATE_FILE = '05_C2C SKBN APP.json';
  const VIP_ICON_ASSET = 'VIP_icon.svg';
  const EVENT_ICON_ASSET = '18號_icon.svg';

  const PRODUCT_ASSETS = Object.freeze({
    '全站_單券_左': '全站_單券_左.png',
    '全站_單券_右': '全站_單券_右.png',
    '商城_單券': '商城_單券.png',
    'VIP_單券_短版': 'VIP_單券_短版.png',
    '免運車': '免運車.png',
  });

  const PRODUCT_ASSET_ALIASES = Object.freeze({
    '全站_單券_左': ['全站_單券_左.png', 'C2C SKBN APP_全站_單券_左.png'],
    '全站_單券_右': ['全站_單券_右.png', 'C2C SKBN APP_全站_單券_右.png'],
    '商城_單券': ['商城_單券.png', 'C2C SKBN APP_商城_單券.png'],
    'VIP_單券_短版': ['VIP_單券_短版.png', 'C2C SKBN APP_VIP_單券_短版.png'],
    '免運車': ['免運車.png', 'C2C SKBN APP_免運車.png'],
  });

  const PRODUCT_PRICE_COLORS = Object.freeze({
    '全站_單券_左': '#EE4D2D',
    '全站_單券_右': '#EE4D2D',
    '商城_單券': '#D0011B',
    'VIP_單券_短版': '#FF7701',
    '免運車': '#EE4D2D',
  });

  const PRODUCT_ROTATIONS = Object.freeze({
    'VIP_單券_短版': 6.5,
  });



  const TEMPLATE_PRESETS = Object.freeze({"01":{"layers":{"18號_icon":{"x":558,"y":59,"width":86,"height":50,"centerX":601,"centerY":84,"targetWidth":86,"targetHeight":50,"maxTargetHeight":50,"assetFilename":"18號_icon.svg","assetCandidates":["18號_icon.svg","05_C2C SKBN APP/18號_icon.svg"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"免運車":{"x":720,"y":237,"width":173,"height":114,"centerX":806.5,"centerY":294,"targetWidth":173,"targetHeight":114,"maxTargetHeight":114,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN APP_免運車.png","05_C2C SKBN APP/免運車.png","05_C2C SKBN APP/C2C SKBN APP_免運車.png"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"VIP_單券_短版":{"x":762,"y":231,"width":180,"height":114,"centerX":852,"centerY":288,"targetWidth":180,"rotation":6.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN APP_VIP_單券_短版.png","05_C2C SKBN APP/VIP_單券_短版.png","05_C2C SKBN APP/C2C SKBN APP_VIP_單券_短版.png"],"keepAspectRatio":true},"全站_單券_左":{"x":243.8,"y":239.8,"width":206,"height":116.1,"centerX":346.8,"centerY":297.9,"targetWidth":206,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN APP_全站_單券_左.png","05_C2C SKBN APP/全站_單券_左.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_左.png"],"keepAspectRatio":true},"全站_單券_右":{"x":757,"y":232,"width":207,"height":122,"centerX":860.5,"centerY":293,"assetFilename":"全站_單券_右.png","assetCandidates":["全站_單券_右.png","C2C SKBN APP_全站_單券_右.png","05_C2C SKBN APP/全站_單券_右.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_右.png"],"keepAspectRatio":true},"商城_單券":{"x":230,"y":238,"width":203,"height":110,"centerX":331.5,"centerY":293,"assetFilename":"商城_單券.png","assetCandidates":["商城_單券.png","C2C SKBN APP_商城_單券.png","05_C2C SKBN APP/商城_單券.png","05_C2C SKBN APP/C2C SKBN APP_商城_單券.png"],"keepAspectRatio":true},"文案_右上":{"x":891,"y":98,"width":300,"height":57,"centerX":1041,"centerY":126.5,"fontSizePx":60,"fontSizePt":60,"lineHeight":72,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"VIP_icon":{"x":1047,"y":72,"width":117,"height":85,"centerX":1105.5,"centerY":114.5,"assetFilename":"VIP_icon.svg","assetCandidates":["VIP_icon.svg","05_C2C SKBN APP/VIP_icon.svg"],"keepAspectRatio":true},"文案_右上左":{"x":920,"y":99,"width":120,"height":58,"centerX":980,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_右下":{"x":913,"y":164,"width":260,"height":95,"centerX":1043,"centerY":211.5,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"文案_中上":{"x":435,"y":119,"width":329,"height":63,"centerX":599.5,"centerY":150.5,"fontSizePx":66,"fontSizePt":66,"lineHeight":79.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_中下":{"x":450,"y":194,"width":303,"height":101,"centerX":601.5,"centerY":244.5,"fontSizePx":106,"fontSizePt":106,"lineHeight":127.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815"},"文案_左上":{"x":73,"y":99,"width":181,"height":58,"centerX":163.5,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_左下":{"x":48,"y":164,"width":228,"height":94,"centerX":162,"centerY":211,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"kv_bg":{"x":0,"y":0,"width":1200,"height":360,"centerX":600,"centerY":180,"assetFilename":"C2C SKBN APP_KV_BG.png"},"__c2c_price_left":{"x":284.9,"y":263.7,"width":168.9,"height":62.6,"centerX":340,"centerY":293,"rotation":-11,"fontSizePx":55,"fontSizePt":55,"lineHeight":59.4,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d"},"__c2c_price_right":{"x":796,"y":274,"width":171,"height":66,"centerX":843.5,"centerY":286,"rotation":9,"fontSizePx":60,"fontSizePt":60,"lineHeight":64.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ff7701"}},"renderOrder":["kv_bg","文案_左下","文案_左上","文案_中下","文案_中上","文案_右下","文案_右上左","VIP_icon","文案_右上","商城_單券","全站_單券_右","全站_單券_左","__c2c_price_left","VIP_單券_短版","__c2c_price_right","免運車","18號_icon"]},"02":{"layers":{"18號_icon":{"x":558,"y":59,"width":86,"height":50,"centerX":601,"centerY":84,"targetWidth":86,"targetHeight":50,"maxTargetHeight":50,"assetFilename":"18號_icon.svg","assetCandidates":["18號_icon.svg","05_C2C SKBN APP/18號_icon.svg"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"免運車":{"x":720,"y":237,"width":173,"height":114,"centerX":806.5,"centerY":294,"targetWidth":173,"targetHeight":114,"maxTargetHeight":114,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN APP_免運車.png","05_C2C SKBN APP/免運車.png","05_C2C SKBN APP/C2C SKBN APP_免運車.png"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"VIP_單券_短版":{"x":762,"y":231,"width":180,"height":114,"centerX":852,"centerY":288,"targetWidth":180,"rotation":6.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN APP_VIP_單券_短版.png","05_C2C SKBN APP/VIP_單券_短版.png","05_C2C SKBN APP/C2C SKBN APP_VIP_單券_短版.png"],"keepAspectRatio":true},"全站_單券_左":{"x":243.8,"y":239.5,"width":206,"height":116.1,"centerX":346.8,"centerY":297.6,"targetWidth":206,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN APP_全站_單券_左.png","05_C2C SKBN APP/全站_單券_左.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_左.png"],"keepAspectRatio":true},"全站_單券_右":{"x":757,"y":232,"width":207,"height":122,"centerX":860.5,"centerY":293,"assetFilename":"全站_單券_右.png","assetCandidates":["全站_單券_右.png","C2C SKBN APP_全站_單券_右.png","05_C2C SKBN APP/全站_單券_右.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_右.png"],"keepAspectRatio":true},"商城_單券":{"x":230,"y":238,"width":203,"height":110,"centerX":331.5,"centerY":293,"assetFilename":"商城_單券.png","assetCandidates":["商城_單券.png","C2C SKBN APP_商城_單券.png","05_C2C SKBN APP/商城_單券.png","05_C2C SKBN APP/C2C SKBN APP_商城_單券.png"],"keepAspectRatio":true},"文案_右上":{"x":891,"y":98,"width":300,"height":57,"centerX":1041,"centerY":126.5,"fontSizePx":60,"fontSizePt":60,"lineHeight":72,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"VIP_icon":{"x":1047,"y":72,"width":117,"height":85,"centerX":1105.5,"centerY":114.5,"assetFilename":"VIP_icon.svg","assetCandidates":["VIP_icon.svg","05_C2C SKBN APP/VIP_icon.svg"],"keepAspectRatio":true},"文案_右上左":{"x":920,"y":99,"width":120,"height":58,"centerX":980,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_右下":{"x":913,"y":164,"width":260,"height":95,"centerX":1043,"centerY":211.5,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"文案_中上":{"x":435,"y":119,"width":329,"height":63,"centerX":599.5,"centerY":150.5,"fontSizePx":66,"fontSizePt":66,"lineHeight":79.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_中下":{"x":450,"y":194,"width":303,"height":101,"centerX":601.5,"centerY":244.5,"fontSizePx":106,"fontSizePt":106,"lineHeight":127.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815"},"文案_左上":{"x":73,"y":99,"width":181,"height":58,"centerX":163.5,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_左下":{"x":48,"y":164,"width":228,"height":94,"centerX":162,"centerY":211,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"kv_bg":{"x":0,"y":0,"width":1200,"height":360,"centerX":600,"centerY":180,"assetFilename":"C2C SKBN APP_KV_BG.png"},"__c2c_price_left":{"x":285.5,"y":263.1,"width":168.9,"height":62.6,"centerX":340,"centerY":293,"rotation":-11,"fontSizePx":55,"fontSizePt":55,"lineHeight":59.4,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d"},"__c2c_price_right":{"x":796,"y":274,"width":171,"height":66,"centerX":843.5,"centerY":286,"rotation":9,"fontSizePx":60,"fontSizePt":60,"lineHeight":64.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ff7701"}},"renderOrder":["kv_bg","文案_左下","文案_左上","文案_中下","文案_中上","文案_右下","文案_右上左","VIP_icon","文案_右上","商城_單券","全站_單券_右","全站_單券_左","__c2c_price_left","VIP_單券_短版","__c2c_price_right","免運車","18號_icon"]},"03":{"layers":{"18號_icon":{"x":558,"y":59,"width":86,"height":50,"centerX":601,"centerY":84,"targetWidth":86,"targetHeight":50,"maxTargetHeight":50,"assetFilename":"18號_icon.svg","assetCandidates":["18號_icon.svg","05_C2C SKBN APP/18號_icon.svg"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"免運車":{"x":720,"y":237,"width":173,"height":114,"centerX":806.5,"centerY":294,"targetWidth":173,"targetHeight":114,"maxTargetHeight":114,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN APP_免運車.png","05_C2C SKBN APP/免運車.png","05_C2C SKBN APP/C2C SKBN APP_免運車.png"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"VIP_單券_短版":{"x":762,"y":231,"width":180,"height":114,"centerX":852,"centerY":288,"targetWidth":180,"rotation":6.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN APP_VIP_單券_短版.png","05_C2C SKBN APP/VIP_單券_短版.png","05_C2C SKBN APP/C2C SKBN APP_VIP_單券_短版.png"],"keepAspectRatio":true},"全站_單券_左":{"x":240.4,"y":237,"width":206,"height":116.1,"centerX":343.4,"centerY":295.1,"targetWidth":206,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN APP_全站_單券_左.png","05_C2C SKBN APP/全站_單券_左.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_左.png"],"keepAspectRatio":true},"全站_單券_右":{"x":757,"y":232,"width":207,"height":122,"centerX":860.5,"centerY":293,"assetFilename":"全站_單券_右.png","assetCandidates":["全站_單券_右.png","C2C SKBN APP_全站_單券_右.png","05_C2C SKBN APP/全站_單券_右.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_右.png"],"keepAspectRatio":true},"商城_單券":{"x":230,"y":238,"width":203,"height":110,"centerX":331.5,"centerY":293,"assetFilename":"商城_單券.png","assetCandidates":["商城_單券.png","C2C SKBN APP_商城_單券.png","05_C2C SKBN APP/商城_單券.png","05_C2C SKBN APP/C2C SKBN APP_商城_單券.png"],"keepAspectRatio":true},"文案_右上":{"x":891,"y":98,"width":300,"height":57,"centerX":1041,"centerY":126.5,"fontSizePx":60,"fontSizePt":60,"lineHeight":72,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"VIP_icon":{"x":1047,"y":72,"width":117,"height":85,"centerX":1105.5,"centerY":114.5,"assetFilename":"VIP_icon.svg","assetCandidates":["VIP_icon.svg","05_C2C SKBN APP/VIP_icon.svg"],"keepAspectRatio":true},"文案_右上左":{"x":920,"y":99,"width":120,"height":58,"centerX":980,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_右下":{"x":913,"y":164,"width":260,"height":95,"centerX":1043,"centerY":211.5,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"文案_中上":{"x":435,"y":119,"width":329,"height":63,"centerX":599.5,"centerY":150.5,"fontSizePx":66,"fontSizePt":66,"lineHeight":79.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_中下":{"x":450,"y":194,"width":303,"height":101,"centerX":601.5,"centerY":244.5,"fontSizePx":106,"fontSizePt":106,"lineHeight":127.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815"},"文案_左上":{"x":73,"y":99,"width":181,"height":58,"centerX":163.5,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_左下":{"x":48,"y":164,"width":228,"height":94,"centerX":162,"centerY":211,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"kv_bg":{"x":0,"y":0,"width":1200,"height":360,"centerX":600,"centerY":180,"assetFilename":"C2C SKBN APP_KV_BG.png"},"__c2c_price_left":{"x":280.7,"y":260.9,"width":168.9,"height":62.6,"centerX":340,"centerY":293,"rotation":-11,"fontSizePx":53,"fontSizePt":53,"lineHeight":57.24,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d"},"__c2c_price_right":{"x":796,"y":274,"width":171,"height":66,"centerX":843.5,"centerY":286,"rotation":9,"fontSizePx":60,"fontSizePt":60,"lineHeight":64.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ff7701"}},"renderOrder":["kv_bg","文案_左下","文案_左上","文案_中下","文案_中上","文案_右下","文案_右上左","VIP_icon","文案_右上","商城_單券","全站_單券_右","全站_單券_左","__c2c_price_left","VIP_單券_短版","__c2c_price_right","免運車","18號_icon"]},"04":{"layers":{"18號_icon":{"x":558,"y":59,"width":86,"height":50,"centerX":601,"centerY":84,"targetWidth":86,"targetHeight":50,"maxTargetHeight":50,"assetFilename":"18號_icon.svg","assetCandidates":["18號_icon.svg","05_C2C SKBN APP/18號_icon.svg"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"免運車":{"x":740.5,"y":235.9,"width":169.3,"height":114,"centerX":825.1,"centerY":292.9,"targetWidth":169.3,"targetHeight":114,"maxTargetHeight":114,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN APP_免運車.png","05_C2C SKBN APP/免運車.png","05_C2C SKBN APP/C2C SKBN APP_免運車.png"],"keepAspectRatio":true,"sizingMode":"containByPBox"},"VIP_單券_短版":{"x":745,"y":215,"width":197,"height":142,"centerX":843.5,"centerY":286,"rotation":6.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN APP_VIP_單券_短版.png","05_C2C SKBN APP/VIP_單券_短版.png","05_C2C SKBN APP/C2C SKBN APP_VIP_單券_短版.png"],"keepAspectRatio":true},"全站_單券_左":{"x":246.1,"y":239.5,"width":206,"height":116.1,"centerX":349.1,"centerY":297.6,"targetWidth":206,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN APP_全站_單券_左.png","05_C2C SKBN APP/全站_單券_左.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_左.png"],"keepAspectRatio":true},"全站_單券_右":{"x":757,"y":232,"width":207,"height":122,"centerX":860.5,"centerY":293,"assetFilename":"全站_單券_右.png","assetCandidates":["全站_單券_右.png","C2C SKBN APP_全站_單券_右.png","05_C2C SKBN APP/全站_單券_右.png","05_C2C SKBN APP/C2C SKBN APP_全站_單券_右.png"],"keepAspectRatio":true},"商城_單券":{"x":230,"y":238,"width":203,"height":110,"centerX":331.5,"centerY":293,"assetFilename":"商城_單券.png","assetCandidates":["商城_單券.png","C2C SKBN APP_商城_單券.png","05_C2C SKBN APP/商城_單券.png","05_C2C SKBN APP/C2C SKBN APP_商城_單券.png"],"keepAspectRatio":true},"文案_右上":{"x":891,"y":98,"width":300,"height":57,"centerX":1041,"centerY":126.5,"fontSizePx":60,"fontSizePt":60,"lineHeight":72,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"VIP_icon":{"x":1047,"y":72,"width":117,"height":85,"centerX":1105.5,"centerY":114.5,"assetFilename":"C2C SKBN APP_VIP_icon.png"},"文案_右上左":{"x":920,"y":99,"width":120,"height":58,"centerX":980,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#FFFFFF"},"文案_右下":{"x":913,"y":164,"width":260,"height":95,"centerX":1043,"centerY":211.5,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"文案_中上":{"x":435,"y":119,"width":329,"height":63,"centerX":599.5,"centerY":150.5,"fontSizePx":66,"fontSizePt":66,"lineHeight":79.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_中下":{"x":450,"y":194,"width":303,"height":101,"centerX":601.5,"centerY":244.5,"fontSizePx":106,"fontSizePt":106,"lineHeight":127.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815"},"文案_左上":{"x":73,"y":99,"width":181,"height":58,"centerX":163.5,"centerY":128,"fontSizePx":61,"fontSizePt":61,"lineHeight":73.2,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFFFFF"},"文案_左下":{"x":48,"y":164,"width":228,"height":94,"centerX":162,"centerY":211,"fontSizePx":100,"fontSizePt":100,"lineHeight":120,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","textAlign":"center","color":"#FFE815","shadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8},"dropShadow":{"enabled":true,"color":"#F13E00","opacity":0.42,"offsetX":0,"offsetY":4,"blur":8}},"kv_bg":{"x":0,"y":0,"width":1200,"height":360,"centerX":600,"centerY":180,"assetFilename":"C2C SKBN APP_KV_BG.png"},"__c2c_price_left":{"x":299.9,"y":268.2,"width":141.8,"height":52.6,"centerX":340,"centerY":293,"rotation":-11,"fontSizePx":49,"fontSizePt":49,"lineHeight":52.92,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d"}},"renderOrder":["kv_bg","文案_左下","文案_左上","文案_中下","文案_中上","文案_右下","文案_右上左","VIP_icon","文案_右上","商城_單券","全站_單券_右","全站_單券_左","__c2c_price_left","VIP_單券_短版","免運車","18號_icon"]}});
  const BOTTOM_COPY_SHADOW = Object.freeze({
    enabled: true,
    color: '#F13E00',
    opacity: 0.42,
    offsetX: 0,
    offsetY: 4,
    blur: 8,
  });

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));

  function findRecordValue(record = {}, acceptedHeaders = []) {
    const wanted = acceptedHeaders.map(normalize).filter(Boolean);
    const entry = Object.entries(record || {}).find(([key]) => {
      const normalizedKey = normalize(key);
      return wanted.some((header) => normalizedKey === header || normalizedKey.startsWith(header));
    });
    return toText(entry?.[1]);
  }

  function syncTextRange(layer, text) {
    if (!layer || !Array.isArray(layer.textStyleRanges)) return;
    const length = String(text || '').length;
    layer.textStyleRanges.forEach((range) => {
      range.from = 0;
      range.to = length;
    });
  }

  function setTextLayer(layer, text, align) {
    if (!layer) return;
    const nextText = toText(text);
    layer.text = nextText;
    layer.hidden = !nextText;
    layer.visible = Boolean(nextText);
    if (align) {
      layer.align = align;
      layer.textAlign = align;
    }
    syncTextRange(layer, nextText);
  }

  function setHidden(layer, hidden, options = {}) {
    if (!layer) return;
    const shouldHide = Boolean(hidden);
    layer.hidden = shouldHide;
    layer.visible = !shouldHide;
    if (shouldHide && options.clearText === true && layer.type === 'text') {
      layer.text = '';
      syncTextRange(layer, '');
    }
  }

  function applyBottomCopyShadow(template) {
    ['文案_左下', '文案_右下'].forEach((layerKey) => {
      const layer = template.layers?.[layerKey];
      if (!layer || layer.type !== 'text') return;
      layer.shadow = { ...BOTTOM_COPY_SHADOW };
      layer.dropShadow = { ...BOTTOM_COPY_SHADOW };
    });
  }

  function resolveProductRotation(layer, assetFilename) {
    const assetKey = String(assetFilename || '').replace(/\.png$/i, '');
    const layerKey = layer?.psdName || assetKey;
    const matchedKey = Object.keys(PRODUCT_ROTATIONS).find((name) => normalize(name) === normalize(layerKey) || normalize(name) === normalize(assetKey));
    return matchedKey ? PRODUCT_ROTATIONS[matchedKey] : null;
  }

  function setImageLayer(layer, assetFilename, visible = true) {
    if (!layer) return;
    layer.type = 'image';
    if (assetFilename) {
      layer.assetFilename = assetFilename;
      const aliases = PRODUCT_ASSET_ALIASES[layer.psdName] || PRODUCT_ASSET_ALIASES[assetFilename?.replace(/\.png$/i, '')] || [assetFilename];
      layer.assetCandidates = [...new Set([
        assetFilename,
        ...aliases,
        ...aliases.map((name) => `05_C2C SKBN APP/${name}`),
      ].filter(Boolean))];
      const rotation = resolveProductRotation(layer, assetFilename);
      if (rotation !== null) layer.rotation = rotation;
    }
    layer.keepAspectRatio = true;
    setHidden(layer, !visible);
  }

  function setVipIcon(layer) {
    if (!layer) return;
    setImageLayer(layer, VIP_ICON_ASSET, true);
  }

  function splitC2cSkbnAppText(value) {
    const raw = toText(value).replace(/\s+/g, '');
    if (!raw) return { top: '', bottom: '', hasVip: false, vipLeftText: '' };

    const vipIndex = raw.toUpperCase().indexOf('VIP');
    if (vipIndex >= 0) {
      const top = raw.slice(0, vipIndex + 3);
      const bottom = raw.slice(vipIndex + 3);
      return {
        top,
        bottom,
        hasVip: true,
        vipLeftText: top.replace(/VIP/ig, ''),
      };
    }

    const datePrefix = raw.match(/^(?:\d{1,2}|[０-９]{1,2})[\/.／](?:\d{1,2}|[０-９]{1,2})/);
    const searchFrom = datePrefix ? datePrefix[0].length : 0;
    const tailSplitIndex = raw.slice(searchFrom).search(/[0-9０-９$＄%％+＋\-－]/);
    const splitIndex = tailSplitIndex >= 0 ? searchFrom + tailSplitIndex : -1;
    if (splitIndex > 0) {
      return {
        top: raw.slice(0, splitIndex),
        bottom: raw.slice(splitIndex),
        hasVip: false,
        vipLeftText: '',
      };
    }

    return { top: raw, bottom: '', hasVip: false, vipLeftText: '' };
  }

  function applySlot(template, record, slotName, diagnostics) {
    const sourceText = findRecordValue(record, [`文案_${slotName}`]);
    if (!sourceText) return;

    const parts = splitC2cSkbnAppText(sourceText);
    const topLayer = template.layers?.[`文案_${slotName}上`];
    const bottomLayer = template.layers?.[`文案_${slotName}下`];

    setTextLayer(topLayer, parts.top, 'center');
    setTextLayer(bottomLayer, parts.bottom, 'center');

    diagnostics?.push?.({
      field: `文案_${slotName}`,
      status: 'ok',
      value: sourceText,
      target: `文案_${slotName}上：${parts.top || '空'} / 文案_${slotName}下：${parts.bottom || '空'}`,
    });

    if (slotName !== '右') return;

    const plainRightTopLayer = template.layers?.['文案_右上'];
    const vipLeftLayer = template.layers?.['文案_右上左'];
    const vipLogoLayer = template.layers?.['VIP_LOGO'] || template.layers?.['VIP_icon'];

    if (parts.hasVip && parts.top.includes('VIP')) {
      setHidden(plainRightTopLayer, true, { clearText: true });
      setTextLayer(vipLeftLayer, parts.vipLeftText, 'center');
      setVipIcon(vipLogoLayer);
      diagnostics?.push?.({
        field: '文案_右',
        status: 'ok',
        value: sourceText,
        target: `加入文字 → 文案_右上左；VIP → ${VIP_ICON_ASSET}`,
      });
    } else {
      setHidden(vipLeftLayer, true, { clearText: true });
      setHidden(vipLogoLayer, true);
      setTextLayer(plainRightTopLayer, parts.top, 'center');
    }
  }


  function resolveTemplatePreset(template) {
    const labels = [template?.templateId, template?.batchSourceName, template?.source?.psdName].filter(Boolean);
    for (const label of labels) {
      const match = String(label || '').match(/C2C[_\s-]*SKBN[_\s-]*APP[_\s-]*(\d+)/i);
      if (match) {
        const key = String(Number(match[1])).padStart(2, '0');
        if (TEMPLATE_PRESETS[key]) return TEMPLATE_PRESETS[key];
      }
    }
    return null;
  }

  function applyPresetLayer(template, layerKey, options = {}) {
    const layer = template?.layers?.[layerKey];
    const presetLayer = resolveTemplatePreset(template)?.layers?.[layerKey];
    if (!layer || !presetLayer) return;
    const keepText = options.keepText !== false;
    const keepVisibility = options.keepVisibility !== false;
    const currentText = layer.text;
    const currentHidden = layer.hidden;
    const currentVisible = layer.visible;
    Object.assign(layer, JSON.parse(JSON.stringify(presetLayer)));
    if (keepText && layer.type === 'text') layer.text = currentText;
    if (keepVisibility) {
      layer.hidden = currentHidden;
      layer.visible = currentVisible;
    }
    if (layer.type === 'text') syncTextRange(layer, layer.text || '');
  }

  function applyPresetTextLayers(template) {
    const preset = resolveTemplatePreset(template);
    if (!preset?.layers) return;
    Object.keys(preset.layers)
      .filter((layerKey) => template.layers?.[layerKey]?.type === 'text' && !layerKey.startsWith('__c2c_price_'))
      .forEach((layerKey) => applyPresetLayer(template, layerKey, { keepText: true, keepVisibility: true }));
  }

  function applyPresetRenderOrder(template) {
    const presetOrder = resolveTemplatePreset(template)?.renderOrder;
    if (!Array.isArray(presetOrder) || !template?.layers) return;
    const cleanPresetOrder = presetOrder.filter((layerKey) => template.layers[layerKey] && template.layers[layerKey]?.source !== 'auto_price_v2');
    const rest = (template.renderOrder || []).filter((layerKey) => !cleanPresetOrder.includes(layerKey) && template.layers[layerKey] && template.layers[layerKey]?.source !== 'auto_price_v2');
    template.renderOrder = [...cleanPresetOrder, ...rest];
  }

  function applyStaticIcon(template) {
    setImageLayer(template.layers?.['18號_icon'], EVENT_ICON_ASSET, true);
  }

  function applyProductVisibility(template, record, diagnostics) {
    const leftProduct = findRecordValue(record, ['商品圖_左', '商品圖左', '商品圖1']);
    const rightProduct = findRecordValue(record, ['商品圖_右', '商品圖右', '商品圖2']);
    const selectedBySide = { left: normalize(leftProduct), right: normalize(rightProduct) };

    Object.entries(PRODUCT_ASSETS).forEach(([layerKey, assetFilename]) => {
      const layer = template.layers?.[layerKey];
      if (!layer) return;
      setImageLayer(layer, assetFilename, false);
    });

    const showProduct = (productName) => {
      const normalizedName = normalize(productName);
      if (!normalizedName) return '';
      const layerKey = Object.keys(PRODUCT_ASSETS).find((name) => normalize(name) === normalizedName);
      if (!layerKey) return '';
      setImageLayer(template.layers?.[layerKey], PRODUCT_ASSETS[layerKey], true);
      applyPresetLayer(template, layerKey, { keepText: true, keepVisibility: true });
      return layerKey;
    };

    const leftLayerKey = showProduct(leftProduct);
    const rightLayerKey = showProduct(rightProduct);

    diagnostics?.push?.({
      field: 'C2C_SKBN_APP_商品圖顯示',
      status: 'ok',
      value: `左：${leftProduct || '空'} / 右：${rightProduct || '空'}`,
      target: [leftLayerKey, rightLayerKey].filter(Boolean).join('、') || '未指定',
    });

    return { leftProduct, rightProduct, leftLayerKey, rightLayerKey, selectedBySide };
  }

  function removeAutoPriceLayers(template) {
    if (!template?.layers) return;
    Object.keys(template.layers)
      .filter((key) => key.startsWith('__auto_price_v2_') || key.startsWith('__c2c_price_') || template.layers[key]?.source === 'auto_price_v2' || template.layers[key]?.source === 'auto_price' || template.layers[key]?.source === 'c2c_skbn_app_price')
      .forEach((key) => delete template.layers[key]);
    template.renderOrder = (template.renderOrder || []).filter((key) => !key.startsWith('__auto_price_v2_') && !key.startsWith('__c2c_price_') && template.layers?.[key]?.source !== 'auto_price_v2' && template.layers?.[key]?.source !== 'auto_price' && template.layers?.[key]?.source !== 'c2c_skbn_app_price');
  }

  function getLayerBox(layer) {
    if (!layer) return null;
    const width = Number(layer.width || layer.targetWidth || 0);
    const height = Number(layer.height || layer.targetHeight || layer.maxTargetHeight || 0);
    const x = Number.isFinite(Number(layer.x)) ? Number(layer.x) : Number(layer.centerX || 0) - width / 2;
    const y = Number.isFinite(Number(layer.y)) ? Number(layer.y) : Number(layer.centerY || 0) - height / 2;
    return {
      x,
      y,
      width,
      height,
      centerX: Number.isFinite(Number(layer.centerX)) ? Number(layer.centerX) : x + width / 2,
      centerY: Number.isFinite(Number(layer.centerY)) ? Number(layer.centerY) : y + height / 2,
    };
  }

  function ensurePriceRenderOrder(template, anchorKey, priceKey) {
    template.renderOrder = (template.renderOrder || []).filter((key) => key !== priceKey);
    const anchorIndex = template.renderOrder.indexOf(anchorKey);
    template.renderOrder.splice(anchorIndex >= 0 ? anchorIndex + 1 : template.renderOrder.length, 0, priceKey);
  }

  function resolvePriceColor(productLayerKey) {
    return PRODUCT_PRICE_COLORS[productLayerKey] || '#EE4D2D';
  }

  function resolvePriceRotation(field) {
    if (field === '價格_左') return -11;
    if (field === '價格_右') return 9;
    return 0;
  }

  function createPriceLayer(template, { key, priceText, productLayerKey, diagnostics, field }) {
    const text = toText(priceText).replace(/\s+/g, '');
    const productLayer = template.layers?.[productLayerKey];
    const box = getLayerBox(productLayer);
    if (!text || !productLayer || !box) return '';

    const fontSize = productLayerKey === '免運車' ? 50 : 58;
    const width = Math.max(120, Math.min(180, box.width * 0.82));
    const height = Math.max(50, fontSize * 1.08);
    const centerX = box.centerX;
    const centerY = box.y + box.height * 0.5;

    template.layers[key] = {
      type: 'text',
      source: 'c2c_skbn_app_price',
      psdName: field,
      text,
      x: Number((centerX - width / 2).toFixed(2)),
      y: Number((centerY - height / 2).toFixed(2)),
      width: Number(width.toFixed(2)),
      height: Number(height.toFixed(2)),
      centerX: Number(centerX.toFixed(2)),
      centerY: Number(centerY.toFixed(2)),
      rotation: resolvePriceRotation(field),
      fontSizePx: fontSize,
      fontSizePt: fontSize,
      lineHeight: Number((fontSize * 1.08).toFixed(2)),
      letterSpacing: 0,
      fontFamily: 'ShopeeNotoSans Content',
      fontStyle: 'Bold',
      fontWeight: '700',
      align: 'center',
      color: resolvePriceColor(productLayerKey),
      hidden: false,
      locked: false,
      priceProductName: productLayerKey,
      priceField: field,
    };
    applyPresetLayer(template, key, { keepText: true, keepVisibility: true });
    ensurePriceRenderOrder(template, productLayerKey, key);
    diagnostics?.push?.({ field, status: 'ok', value: text, target: `${productLayerKey} → ${key}` });
    return key;
  }

  function applyProductPrices(template, record, productState, diagnostics) {
    removeAutoPriceLayers(template);
    const leftPrice = findRecordValue(record, ['價格_左', '價格左']);
    const rightPrice = findRecordValue(record, ['價格_右', '價格右']);
    const created = [];
    const leftKey = productState?.leftLayerKey;
    const rightKey = productState?.rightLayerKey;

    const leftCreated = createPriceLayer(template, {
      key: '__c2c_price_left',
      priceText: leftPrice,
      productLayerKey: leftKey,
      diagnostics,
      field: '價格_左',
    });
    if (leftCreated) created.push(leftCreated);

    const rightCreated = createPriceLayer(template, {
      key: '__c2c_price_right',
      priceText: rightPrice,
      productLayerKey: rightKey,
      diagnostics,
      field: '價格_右',
    });
    if (rightCreated) created.push(rightCreated);

    template.pricePresetMeta = {
      productName: [productState?.leftProduct, productState?.rightProduct].filter(Boolean).join(' + '),
      rawPrice: [leftPrice, rightPrice].filter(Boolean).join(' + '),
      layoutKey: 'c2cAppPairPrice',
      templateId: template.templateId || '',
      batchSourceName: template.batchSourceName || '',
    };
    return created;
  }

  function normalizeC2cRecord(record = {}) {
    const normalized = { ...record };
    const leftProduct = findRecordValue(record, ['商品圖_左', '商品圖左', '商品圖1']);
    const rightProduct = findRecordValue(record, ['商品圖_右', '商品圖右', '商品圖2']);
    const leftPrice = findRecordValue(record, ['價格_左', '價格左']);
    const rightPrice = findRecordValue(record, ['價格_右', '價格右']);
    if (leftProduct) normalized['商品圖1'] = leftProduct;
    if (rightProduct) normalized['商品圖2'] = rightProduct;
    if (leftPrice) normalized['價格_左'] = leftPrice;
    if (rightPrice) normalized['價格_右'] = rightPrice;
    return normalized;
  }

  function applyProgrammaticLayout(template, record, diagnostics) {
    if (!template?.layers) return;
    applyBottomCopyShadow(template);
    const normalizedRecord = normalizeC2cRecord(record || {});
    applyStaticIcon(template);
    applyPresetLayer(template, '18號_icon', { keepText: true, keepVisibility: true });
    const productState = applyProductVisibility(template, normalizedRecord, diagnostics);
    applyPresetTextLayers(template);
    applySlot(template, normalizedRecord, '左', diagnostics);
    applySlot(template, normalizedRecord, '中', diagnostics);
    applySlot(template, normalizedRecord, '右', diagnostics);
    applyProductPrices(template, normalizedRecord, productState, diagnostics);
    applyPresetRenderOrder(template);
  }

  function isC2cSkbnAppBlock(blockName) {
    const key = normalize(blockName);
    return key === 'c2cskbnapp' || key === '05c2cskbnapp';
  }

  const C2CSkbnAppRules = {
    resolveRecordTemplateRoute({ block }) {
      if (!isC2cSkbnAppBlock(block?.name)) return null;
      return {
        key: FAMILY,
        family: FAMILY,
        label: 'C2C SKBN APP',
        templateId: TEMPLATE_ID,
        templateFile: TEMPLATE_FILE,
        outputPrefix: 'C2C_SKBN_APP',
      };
    },

    beforeApplyRecordToTemplate({ template, record, diagnostics }) {
      applyProgrammaticLayout(template, record || {}, diagnostics);
    },

    afterApplyRecordToTemplate({ template, record, diagnostics }) {
      applyProgrammaticLayout(template, record || {}, diagnostics);
    },
  };

  window.TemplateRuleRegistry?.register?.(FAMILY, {
    family: FAMILY,
    label: 'C2C SKBN APP',
    priority: 86,
    tokens: ['c2c skbn app', 'c2c_skbn_app', '05_c2c skbn app', '05_c2c_skbn_app'],
    targets: ['05_c2c skbn app', '05_c2c_skbn_app', 'c2c skbn app', 'c2c_skbn_app'],
    rules: {
      ...C2CSkbnAppRules,
      priceRules: {
        enabled: false,
        customPairPrice: true,
      },
    },
  });
})();

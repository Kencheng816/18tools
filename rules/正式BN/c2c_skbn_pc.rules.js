/* C2C SKBN PC template rules – independent C2C text mapper. */
(function () {
  'use strict';

  const FAMILY = 'c2c_skbn_pc';
  const TEMPLATE_ID = '05_C2C SKBN PC';
  const TEMPLATE_FILE = '05_C2C SKBN PC.json';
  const VIP_ICON_ASSET = 'VIP_icon.svg';
  const HIGHLIGHT_COLOR = '#FFE815';
  const DEFAULT_COPY_COLOR = '#FFFFFF';

  const PRODUCT_ASSETS = Object.freeze({
    '全站_單券_左': '全站_單券_左.png',
    '全站_單券_右': '全站_單券_右.png',
    '商城_單券': '商城_單券.png',
    'VIP_單券_短版': 'VIP_單券_短版.png',
    '免運車': '免運車.png',
  });

  const PRODUCT_ASSET_ALIASES = Object.freeze({
    '全站_單券_左': ['全站_單券_左.png', 'C2C SKBN PC_全站_單券_左.png'],
    '全站_單券_右': ['全站_單券_右.png', 'C2C SKBN PC_全站_單券_右.png'],
    '商城_單券': ['商城_單券.png', 'C2C SKBN PC_商城_單券.png'],
    'VIP_單券_短版': ['VIP_單券_短版.png', 'C2C SKBN PC_VIP_單券_短版.png'],
    '免運車': ['免運車.png', 'C2C SKBN PC_免運車.png'],
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

  const PRICE_ROTATIONS = Object.freeze({
    '價格_左': -11,
    '價格_右': 9,
  });

  const TEMPLATE_PRESETS = Object.freeze({"01":{"layers":{"免運車":{"type":"image","psdName":"免運車","x":773,"y":18,"width":101,"height":67,"centerX":823.5,"centerY":51.5,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN PC_免運車.png","05_C2C SKBN PC/免運車.png","05_C2C SKBN PC/C2C SKBN PC_免運車.png"],"keepAspectRatio":true,"hidden":true,"visible":false,"sizingMode":"containByPBox","targetWidth":101,"targetHeight":67,"maxTargetHeight":67},"VIP_單券_短版":{"type":"image","psdName":"VIP_單券_短版","x":769,"y":1,"width":106,"height":79,"centerX":822,"centerY":40.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN PC_VIP_單券_短版.png","05_C2C SKBN PC/VIP_單券_短版.png","05_C2C SKBN PC/C2C SKBN PC_VIP_單券_短版.png"],"rotation":6.5,"keepAspectRatio":true,"hidden":false,"visible":true,"sizingMode":"containByPBox","targetWidth":106,"targetHeight":79,"maxTargetHeight":79},"全站_單券_左":{"type":"image","psdName":"全站_單券_左","x":308,"y":36,"width":127,"height":71,"centerX":371.5,"centerY":71.5,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN PC_全站_單券_左.png","05_C2C SKBN PC/全站_單券_左.png","05_C2C SKBN PC/C2C SKBN PC_全站_單券_左.png"],"keepAspectRatio":true,"hidden":false,"visible":true},"18號_icon":{"type":"image","psdName":"18號_icon","x":570,"y":24,"width":60,"height":34,"centerX":600,"centerY":41,"assetFilename":"C2C SKBN PC_18號_icon.png"},"VIP_LOGO":{"type":"image","psdName":"VIP_LOGO","x":958,"y":32,"width":79,"height":57,"centerX":997.5,"centerY":60.5,"assetFilename":"VIP_icon.svg","assetCandidates":["VIP_icon.svg","05_C2C SKBN PC/VIP_icon.svg"],"keepAspectRatio":true,"hidden":false,"visible":true},"文案_右_右":{"type":"text","psdName":"文案_右_右","x":1043,"y":52,"width":99,"height":37,"centerX":1092.5,"centerY":70.5,"text":"送8折","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"left","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":1,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":1,"to":3,"color":"#FFE815","fill":"#FFE815"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"left"},"文案_右_左":{"type":"text","psdName":"文案_右_左","x":881,"y":53,"width":74,"height":36,"centerX":918,"centerY":71,"text":"加入","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"right","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":2,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"right"},"文案_中下":{"type":"text","psdName":"文案_中下","x":451,"y":66,"width":299,"height":37,"centerX":600.5,"centerY":84.5,"text":"全站大免運$99起","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":5,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":5,"to":9,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"},{"from":5,"to":9,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"文案_左":{"type":"text","psdName":"文案_左","x":45,"y":51,"width":200,"height":37,"centerX":145,"centerY":69.5,"text":"灑全站93折","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":3,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":3,"to":6,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"kv_bg":{"type":"image","psdName":"KV_BG","x":0,"y":0,"width":1200,"height":110,"centerX":600,"centerY":55,"assetFilename":"C2C SKBN PC_KV_BG.png"},"__c2c_pc_price_left":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_左","text":"93折","x":350.1,"y":51.4,"width":71,"height":37.1,"centerX":371.5,"centerY":71.5,"rotation":-11,"fontSizePx":35,"fontSizePt":35,"lineHeight":37.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d","hidden":false,"locked":false,"priceProductName":"全站_單券_左","priceField":"價格_左"},"__c2c_pc_price_right":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_右","text":"8折","x":803.5,"y":33.4,"width":71,"height":37.1,"centerX":822,"centerY":40.5,"rotation":9,"fontSizePx":35,"fontSizePt":35,"lineHeight":37.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ff7701","hidden":false,"locked":false,"priceProductName":"VIP_單券_短版","priceField":"價格_右"}},"renderOrder":["kv_bg","文案_左","文案_中下","文案_右_左","文案_右_右","VIP_LOGO","18號_icon","全站_單券_左","__c2c_pc_price_left","VIP_單券_短版","__c2c_pc_price_right","免運車"]},"02":{"layers":{"免運車":{"type":"image","psdName":"免運車","x":773,"y":18,"width":101,"height":67,"centerX":823.5,"centerY":51.5,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN PC_免運車.png","05_C2C SKBN PC/免運車.png","05_C2C SKBN PC/C2C SKBN PC_免運車.png"],"keepAspectRatio":true,"hidden":true,"visible":false,"sizingMode":"containByPBox","targetWidth":101,"targetHeight":67,"maxTargetHeight":67},"VIP_單券_短版":{"type":"image","psdName":"VIP_單券_短版","x":769,"y":1,"width":106,"height":79,"centerX":822,"centerY":40.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN PC_VIP_單券_短版.png","05_C2C SKBN PC/VIP_單券_短版.png","05_C2C SKBN PC/C2C SKBN PC_VIP_單券_短版.png"],"rotation":6.5,"keepAspectRatio":true,"hidden":false,"visible":true,"sizingMode":"containByPBox","targetWidth":106,"targetHeight":79,"maxTargetHeight":79},"全站_單券_左":{"type":"image","psdName":"全站_單券_左","x":308,"y":36,"width":127,"height":71,"centerX":371.5,"centerY":71.5,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN PC_全站_單券_左.png","05_C2C SKBN PC/全站_單券_左.png","05_C2C SKBN PC/C2C SKBN PC_全站_單券_左.png"],"keepAspectRatio":true,"hidden":false,"visible":true},"18號_icon":{"type":"image","psdName":"18號_icon","x":570,"y":24,"width":60,"height":34,"centerX":600,"centerY":41,"assetFilename":"C2C SKBN PC_18號_icon.png"},"VIP_LOGO":{"type":"image","psdName":"VIP_LOGO","x":958,"y":32,"width":79,"height":57,"centerX":997.5,"centerY":60.5,"assetFilename":"VIP_icon.svg","assetCandidates":["VIP_icon.svg","05_C2C SKBN PC/VIP_icon.svg"],"keepAspectRatio":true,"hidden":false,"visible":true},"文案_右_右":{"type":"text","psdName":"文案_右_右","x":1043,"y":52,"width":99,"height":37,"centerX":1092.5,"centerY":70.5,"text":"送8折","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"left","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":1,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":1,"to":3,"color":"#FFE815","fill":"#FFE815"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"left"},"文案_右_左":{"type":"text","psdName":"文案_右_左","x":881,"y":53,"width":74,"height":36,"centerX":918,"centerY":71,"text":"加入","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"right","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":2,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"right"},"文案_中下":{"type":"text","psdName":"文案_中下","x":451,"y":66,"width":299,"height":37,"centerX":600.5,"centerY":84.5,"text":"全站大免運$99起","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":5,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":5,"to":9,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"},{"from":5,"to":9,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"文案_左":{"type":"text","psdName":"文案_左","x":45,"y":51,"width":200,"height":37,"centerX":145,"centerY":69.5,"text":"灑全站94折","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":3,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":3,"to":6,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"kv_bg":{"type":"image","psdName":"KV_BG","x":0,"y":0,"width":1200,"height":110,"centerX":600,"centerY":55,"assetFilename":"C2C SKBN PC_KV_BG.png"},"__c2c_pc_price_left":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_左","text":"94折","x":326.2,"y":38.5,"width":120,"height":62.6,"centerX":371.5,"centerY":71.5,"rotation":-11,"fontSizePx":35,"fontSizePt":35,"lineHeight":37.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d","hidden":false,"locked":false,"priceProductName":"全站_單券_左","priceField":"價格_左"},"__c2c_pc_price_right":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_右","text":"8折","x":803.5,"y":33.4,"width":71,"height":37.1,"centerX":822,"centerY":40.5,"rotation":9,"fontSizePx":35,"fontSizePt":35,"lineHeight":37.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ff7701","hidden":false,"locked":false,"priceProductName":"VIP_單券_短版","priceField":"價格_右"}},"renderOrder":["kv_bg","文案_左","文案_中下","文案_右_左","文案_右_右","VIP_LOGO","18號_icon","全站_單券_左","__c2c_pc_price_left","VIP_單券_短版","__c2c_pc_price_right","免運車"]},"03":{"layers":{"免運車":{"type":"image","psdName":"免運車","x":773,"y":18,"width":101,"height":67,"centerX":823.5,"centerY":51.5,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN PC_免運車.png","05_C2C SKBN PC/免運車.png","05_C2C SKBN PC/C2C SKBN PC_免運車.png"],"keepAspectRatio":true,"hidden":true,"visible":false,"sizingMode":"containByPBox","targetWidth":101,"targetHeight":67,"maxTargetHeight":67},"VIP_單券_短版":{"type":"image","psdName":"VIP_單券_短版","x":769,"y":1,"width":106,"height":79,"centerX":822,"centerY":40.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN PC_VIP_單券_短版.png","05_C2C SKBN PC/VIP_單券_短版.png","05_C2C SKBN PC/C2C SKBN PC_VIP_單券_短版.png"],"rotation":6.5,"keepAspectRatio":true,"hidden":false,"visible":true,"sizingMode":"containByPBox","targetWidth":106,"targetHeight":79,"maxTargetHeight":79},"全站_單券_左":{"type":"image","psdName":"全站_單券_左","x":308,"y":36,"width":127,"height":71,"centerX":371.5,"centerY":71.5,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN PC_全站_單券_左.png","05_C2C SKBN PC/全站_單券_左.png","05_C2C SKBN PC/C2C SKBN PC_全站_單券_左.png"],"keepAspectRatio":true,"hidden":false,"visible":true},"18號_icon":{"type":"image","psdName":"18號_icon","x":570,"y":24,"width":60,"height":34,"centerX":600,"centerY":41,"assetFilename":"C2C SKBN PC_18號_icon.png"},"VIP_LOGO":{"type":"image","psdName":"VIP_LOGO","x":958,"y":32,"width":79,"height":57,"centerX":997.5,"centerY":60.5,"assetFilename":"VIP_icon.svg","assetCandidates":["VIP_icon.svg","05_C2C SKBN PC/VIP_icon.svg"],"keepAspectRatio":true,"hidden":false,"visible":true},"文案_右_右":{"type":"text","psdName":"文案_右_右","x":1043,"y":52,"width":99,"height":37,"centerX":1092.5,"centerY":70.5,"text":"送8折","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"left","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":1,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":1,"to":3,"color":"#FFE815","fill":"#FFE815"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"left"},"文案_右_左":{"type":"text","psdName":"文案_右_左","x":881,"y":53,"width":74,"height":36,"centerX":918,"centerY":71,"text":"加入","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"right","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":2,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"right"},"文案_中下":{"type":"text","psdName":"文案_中下","x":451,"y":66,"width":299,"height":37,"centerX":600.5,"centerY":84.5,"text":"全站大免運$99起","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":5,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":5,"to":9,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"},{"from":5,"to":9,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"文案_左":{"type":"text","psdName":"文案_左","x":45,"y":51,"width":200,"height":37,"centerX":145,"centerY":69.5,"text":"滿千折$100","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":3,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":3,"to":7,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"kv_bg":{"type":"image","psdName":"KV_BG","x":0,"y":0,"width":1200,"height":110,"centerX":600,"centerY":55,"assetFilename":"C2C SKBN PC_KV_BG.png"},"__c2c_pc_price_left":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_左","text":"$100","x":325.1,"y":37.9,"width":120,"height":62.6,"centerX":371.5,"centerY":71.5,"rotation":-11,"fontSizePx":33,"fontSizePt":33,"lineHeight":35.64,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d","hidden":false,"locked":false,"priceProductName":"全站_單券_左","priceField":"價格_左"},"__c2c_pc_price_right":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_右","text":"8折","x":803.5,"y":33.4,"width":71,"height":37.1,"centerX":822,"centerY":40.5,"rotation":9,"fontSizePx":35,"fontSizePt":35,"lineHeight":37.8,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ff7701","hidden":false,"locked":false,"priceProductName":"VIP_單券_短版","priceField":"價格_右"}},"renderOrder":["kv_bg","文案_左","文案_中下","文案_右_左","文案_右_右","VIP_LOGO","18號_icon","全站_單券_左","__c2c_pc_price_left","VIP_單券_短版","__c2c_pc_price_right","免運車"]},"04":{"layers":{"免運車":{"type":"image","psdName":"免運車","x":787.3,"y":13.3,"width":99.5,"height":67,"centerX":837,"centerY":46.8,"assetFilename":"免運車.png","assetCandidates":["免運車.png","C2C SKBN PC_免運車.png","05_C2C SKBN PC/免運車.png","05_C2C SKBN PC/C2C SKBN PC_免運車.png"],"keepAspectRatio":true,"hidden":false,"visible":true,"sizingMode":"containByPBox","targetWidth":99.5,"targetHeight":67,"maxTargetHeight":67},"VIP_單券_短版":{"type":"image","psdName":"VIP_單券_短版","x":769,"y":1,"width":106,"height":79,"centerX":822,"centerY":40.5,"assetFilename":"VIP_單券_短版.png","assetCandidates":["VIP_單券_短版.png","C2C SKBN PC_VIP_單券_短版.png","05_C2C SKBN PC/VIP_單券_短版.png","05_C2C SKBN PC/C2C SKBN PC_VIP_單券_短版.png"],"rotation":6.5,"keepAspectRatio":true,"hidden":true,"visible":false,"sizingMode":"containByPBox","targetWidth":106,"targetHeight":79,"maxTargetHeight":79},"全站_單券_左":{"type":"image","psdName":"全站_單券_左","x":308,"y":36,"width":127,"height":71,"centerX":371.5,"centerY":71.5,"assetFilename":"全站_單券_左.png","assetCandidates":["全站_單券_左.png","C2C SKBN PC_全站_單券_左.png","05_C2C SKBN PC/全站_單券_左.png","05_C2C SKBN PC/C2C SKBN PC_全站_單券_左.png"],"keepAspectRatio":true,"hidden":false,"visible":true},"18號_icon":{"type":"image","psdName":"18號_icon","x":570,"y":24,"width":60,"height":34,"centerX":600,"centerY":41,"assetFilename":"C2C SKBN PC_18號_icon.png"},"VIP_LOGO":{"type":"image","psdName":"VIP_LOGO","x":958,"y":32,"width":79,"height":57,"centerX":997.5,"centerY":60.5,"assetFilename":"C2C SKBN PC_VIP_LOGO.png","hidden":true,"visible":false},"文案_右_右":{"type":"text","psdName":"文案_右_右","x":970,"y":52,"width":99,"height":37,"centerX":1092.5,"centerY":70.5,"text":"全站大免運$99起","fontSizePt":32,"fontSizePx":32,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#ffe815","lineHeight":34.56,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":5,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":5,"to":9,"color":"#FFE815","fill":"#FFE815"}],"dominantStyleSource":"textStyleRange","hidden":false,"visible":true,"textAlign":"center"},"文案_右_左":{"type":"text","psdName":"文案_右_左","x":881,"y":53,"width":74,"height":36,"centerX":918,"centerY":71,"text":"","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"right","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":0,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"}],"dominantStyleSource":"textStyleRange","hidden":true,"visible":false},"文案_中下":{"type":"text","psdName":"文案_中下","x":451,"y":66,"width":299,"height":37,"centerX":600.5,"centerY":84.5,"text":"4/17用夜貓18%","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":7,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":7,"to":10,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"},{"from":7,"to":10,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"文案_左":{"type":"text","psdName":"文案_左","x":45,"y":51,"width":200,"height":37,"centerX":145,"centerY":69.5,"text":"直播折$500","fontSizePt":38,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","italic":false,"align":"center","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"textTransform":{"scaleX":0.3512388183345636,"scaleY":0.35123881833456605},"textStyleRanges":[{"from":0,"to":3,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFFFFF","lineHeight":45.6,"letterSpacing":0,"fill":"#FFFFFF"},{"from":3,"to":7,"fontSizePx":38,"fontSizePtRaw":108.1884994506836,"fontFamily":"ShopeeNotoSans Content","fontWeight":"700","fontStyleName":"Bold","fontPostScriptName":"ShopeeNotoSanscontent-Bold","color":"#FFE815","lineHeight":45.6,"letterSpacing":0,"fill":"#FFE815"}],"dominantStyleSource":"textStyleRange-dominant","hidden":false,"visible":true,"textAlign":"center"},"kv_bg":{"type":"image","psdName":"KV_BG","x":0,"y":0,"width":1200,"height":110,"centerX":600,"centerY":55,"assetFilename":"C2C SKBN PC_KV_BG.png"},"__c2c_pc_price_left":{"type":"text","source":"c2c_skbn_pc_price","psdName":"價格_左","text":"$500","x":325.6,"y":37.9,"width":120,"height":62.6,"centerX":371.5,"centerY":71.5,"rotation":-11,"fontSizePx":30,"fontSizePt":30,"lineHeight":32.4,"letterSpacing":0,"fontFamily":"ShopeeNotoSans Content","fontStyle":"Bold","fontWeight":"700","align":"center","color":"#ee4d2d","hidden":false,"locked":false,"priceProductName":"全站_單券_左","priceField":"價格_左"}},"renderOrder":["kv_bg","文案_左","文案_中下","文案_右_左","文案_右_右","VIP_LOGO","18號_icon","全站_單券_左","__c2c_pc_price_left","VIP_單券_短版","免運車"]}});

  const U = window.TemplateRuleUtils || {};
  const toText = U.toText || ((value) => String(value ?? '').replace(/_x000d_/gi, '\n').trim());
  const normalize = U.normalize || ((value) => toText(value).toLowerCase().replace(/\.[a-z0-9]+$/i, '').replace(/[\s\u00a0\u3000\t\r\n_\-+()（）\[\]【】.]+/g, ''));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function findRecordValue(record = {}, acceptedHeaders = []) {
    const wanted = acceptedHeaders.map(normalize).filter(Boolean);
    const entry = Object.entries(record || {}).find(([key]) => {
      const normalizedKey = normalize(key);
      return wanted.some((header) => normalizedKey === header || normalizedKey.startsWith(header));
    });
    return toText(entry?.[1]);
  }

  function findSplitIndexForTone(text) {
    const raw = toText(text).replace(/\s+/g, '');
    if (!raw) return 0;

    const vipIndex = raw.toUpperCase().indexOf('VIP');
    const searchText = vipIndex >= 0 ? raw.replace(/VIP/ig, '') : raw;
    const datePrefix = searchText.match(/^(?:\d{1,2}|[０-９]{1,2})[\/.／](?:\d{1,2}|[０-９]{1,2})/);
    const searchFrom = datePrefix ? datePrefix[0].length : 0;
    const tailSplitIndex = searchText.slice(searchFrom).search(/[0-9０-９$＄%％+＋\-－]/);
    const splitIndex = tailSplitIndex >= 0 ? searchFrom + tailSplitIndex : -1;
    return splitIndex > 0 ? splitIndex : searchText.length;
  }

  function syncTextRange(layer, text) {
    if (!layer || !Array.isArray(layer.textStyleRanges)) return;
    const length = String(text || '').length;
    layer.textStyleRanges.forEach((range) => {
      range.from = 0;
      range.to = length;
      range.color = layer.color || DEFAULT_COPY_COLOR;
      range.fill = layer.color || DEFAULT_COPY_COLOR;
    });
  }

  function ensureTwoToneRanges(layer) {
    if (!layer) return [];
    if (!Array.isArray(layer.textStyleRanges)) layer.textStyleRanges = [];
    while (layer.textStyleRanges.length < 2) layer.textStyleRanges.push({ from: 0, to: 0 });
    return layer.textStyleRanges;
  }

  function syncTwoToneRange(layer, text) {
    if (!layer) return;
    const ranges = ensureTwoToneRanges(layer);
    const length = String(text || '').length;
    const splitIndex = Math.min(Math.max(0, findSplitIndexForTone(text)), length);

    ranges[0] = {
      ...ranges[0],
      from: 0,
      to: splitIndex,
      color: DEFAULT_COPY_COLOR,
      fill: DEFAULT_COPY_COLOR,
    };
    ranges[1] = {
      ...ranges[1],
      from: splitIndex,
      to: length,
      color: HIGHLIGHT_COLOR,
      fill: HIGHLIGHT_COLOR,
    };
    for (let i = 2; i < ranges.length; i += 1) {
      ranges[i].from = splitIndex;
      ranges[i].to = length;
      ranges[i].color = HIGHLIGHT_COLOR;
      ranges[i].fill = HIGHLIGHT_COLOR;
    }
    layer.textStyleRanges = ranges;
  }

  function setTextLayer(layer, text, align, twoTone = false) {
    if (!layer) return;
    const nextText = toText(text).replace(/\s+/g, '');
    layer.text = nextText;
    layer.hidden = !nextText;
    layer.visible = Boolean(nextText);
    layer.color = layer.color || DEFAULT_COPY_COLOR;
    if (align) {
      layer.align = align;
      layer.textAlign = align;
    }
    if (twoTone) syncTwoToneRange(layer, nextText);
    else syncTextRange(layer, nextText);
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
      const assetKey = assetFilename.replace(/\.png$/i, '');
      const aliases = PRODUCT_ASSET_ALIASES[layer.psdName] || PRODUCT_ASSET_ALIASES[assetKey] || [assetFilename];
      layer.assetFilename = assetFilename;
      layer.assetCandidates = [...new Set([
        assetFilename,
        ...aliases,
        ...aliases.map((name) => `05_C2C SKBN PC/${name}`),
      ].filter(Boolean))];
      const rotation = resolveProductRotation(layer, assetFilename);
      if (rotation !== null) layer.rotation = rotation;
    }
    layer.keepAspectRatio = true;
    setHidden(layer, !visible);
  }

  function setVipIcon(layer) {
    if (!layer) return;
    layer.type = 'image';
    layer.assetFilename = VIP_ICON_ASSET;
    layer.assetCandidates = [VIP_ICON_ASSET, `05_C2C SKBN PC/${VIP_ICON_ASSET}`];
    layer.keepAspectRatio = true;
    setHidden(layer, false);
  }

  function splitVipRightText(value) {
    const raw = toText(value).replace(/\s+/g, '');
    const vipIndex = raw.toUpperCase().indexOf('VIP');
    if (vipIndex < 0) return { hasVip: false, left: '', right: raw };
    return {
      hasVip: true,
      left: raw.slice(0, vipIndex),
      right: raw.slice(vipIndex + 3),
    };
  }

  function resolveTemplatePreset(template) {
    const labels = [
      template?.templateId,
      template?.batchSourceName,
      template?.source?.psdName,
      template?.canvas?.templateId,
      template?.sheetTemplateRoute?.sourceTemplateId,
    ].filter(Boolean);

    for (const label of labels) {
      const match = String(label || '').match(/C2C[_\s-]*SKBN[_\s-]*PC[_\s-]*(\d+)/i);
      if (!match) continue;
      const key = String(Number(match[1])).padStart(2, '0');
      if (TEMPLATE_PRESETS[key]) return TEMPLATE_PRESETS[key];
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

    Object.assign(layer, clone(presetLayer));

    if (keepText && layer.type === 'text') layer.text = currentText;
    if (keepVisibility) {
      layer.hidden = currentHidden;
      layer.visible = currentVisible;
    }
    if (layer.type === 'text') syncTextRange(layer, layer.text || '');
  }

  function applyPresetBaseLayers(template) {
    const preset = resolveTemplatePreset(template);
    if (!preset?.layers || !template?.layers) return;

    Object.keys(preset.layers)
      .filter((layerKey) => !layerKey.startsWith('__c2c_pc_price_'))
      .forEach((layerKey) => {
        if (!template.layers[layerKey]) template.layers[layerKey] = clone(preset.layers[layerKey]);
        else applyPresetLayer(template, layerKey, { keepText: true, keepVisibility: false });
      });
  }

  function applyPresetRenderOrder(template) {
    const presetOrder = resolveTemplatePreset(template)?.renderOrder;
    if (!Array.isArray(presetOrder) || !template?.layers) return;
    const cleanPresetOrder = presetOrder.filter((layerKey) => template.layers[layerKey]);
    const rest = (template.renderOrder || []).filter((layerKey) => (
      !cleanPresetOrder.includes(layerKey) &&
      template.layers[layerKey] &&
      !layerKey.startsWith('__auto_price_v2_') &&
      template.layers[layerKey]?.source !== 'auto_price_v2' &&
      template.layers[layerKey]?.source !== 'auto_price'
    ));
    template.renderOrder = [...cleanPresetOrder, ...rest];
  }

  function applyCopy(template, record, diagnostics) {
    const leftText = findRecordValue(record, ['文案_左']);
    if (leftText) {
      setTextLayer(template.layers['文案_左'], leftText, 'center', true);
      diagnostics?.push?.({ field: '文案_左', status: 'ok', value: leftText, target: '文案_左：後段改色' });
    }

    const middleText = findRecordValue(record, ['文案_中']);
    if (middleText) {
      const middleLayer = template.layers['文案_中下'] || template.layers['文案_中'];
      setTextLayer(middleLayer, middleText, 'center', true);
      diagnostics?.push?.({ field: '文案_中', status: 'ok', value: middleText, target: `${middleLayer?.psdName || '文案_中'}：後段改色` });
    }

    const rightText = findRecordValue(record, ['文案_右']);
    if (!rightText) return;

    const parts = splitVipRightText(rightText);
    const rightLeftLayer = template.layers['文案_右_左'];
    const rightRightLayer = template.layers['文案_右_右'] || template.layers['文案_右'];
    const vipLogoLayer = template.layers['VIP_LOGO'] || template.layers['VIP_icon'];

    if (parts.hasVip) {
      setTextLayer(rightLeftLayer, parts.left, 'right');
      setVipIcon(vipLogoLayer);
      setTextLayer(rightRightLayer, parts.right, 'left', true);
      diagnostics?.push?.({ field: '文案_右', status: 'ok', value: rightText, target: `文案_右_左 + ${VIP_ICON_ASSET} + 文案_右_右：後段改色` });
      return;
    }

    setHidden(rightLeftLayer, true, { clearText: true });
    setHidden(vipLogoLayer, true);
    setTextLayer(rightRightLayer, rightText, 'center', true);
    diagnostics?.push?.({ field: '文案_右', status: 'ok', value: rightText, target: '文案_右_右：後段改色' });
  }

  function applyProductVisibility(template, record, diagnostics) {
    const leftProduct = findRecordValue(record, ['商品圖_左', '商品圖左', '商品圖1']);
    const rightProduct = findRecordValue(record, ['商品圖_右', '商品圖右', '商品圖2']);

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
      setHidden(template.layers?.[layerKey], false);
      return layerKey;
    };

    const leftLayerKey = showProduct(leftProduct);
    const rightLayerKey = showProduct(rightProduct);

    diagnostics?.push?.({
      field: 'C2C_SKBN_PC_商品圖顯示',
      status: 'ok',
      value: `左：${leftProduct || '空'} / 右：${rightProduct || '空'}`,
      target: [leftLayerKey, rightLayerKey].filter(Boolean).join('、') || '未指定',
    });

    return { leftProduct, rightProduct, leftLayerKey, rightLayerKey };
  }

  function removeAutoPriceLayers(template) {
    if (!template?.layers) return;
    Object.keys(template.layers)
      .filter((key) => key.startsWith('__auto_price_v2_') || key.startsWith('__c2c_pc_price_') || template.layers[key]?.source === 'auto_price_v2' || template.layers[key]?.source === 'auto_price' || template.layers[key]?.source === 'c2c_skbn_pc_price')
      .forEach((key) => delete template.layers[key]);
    template.renderOrder = (template.renderOrder || []).filter((key) => !key.startsWith('__auto_price_v2_') && !key.startsWith('__c2c_pc_price_') && template.layers?.[key]?.source !== 'auto_price_v2' && template.layers?.[key]?.source !== 'auto_price' && template.layers?.[key]?.source !== 'c2c_skbn_pc_price');
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
    return PRICE_ROTATIONS[field] || 0;
  }

  function createPriceLayer(template, { key, priceText, productLayerKey, diagnostics, field }) {
    const text = toText(priceText).replace(/\s+/g, '');
    const productLayer = template.layers?.[productLayerKey];
    const box = getLayerBox(productLayer);
    if (!text || !productLayer || !box) return '';

    const presetLayer = resolveTemplatePreset(template)?.layers?.[key];
    if (presetLayer) {
      template.layers[key] = {
        ...clone(presetLayer),
        type: 'text',
        source: 'c2c_skbn_pc_price',
        psdName: field,
        text,
        color: resolvePriceColor(productLayerKey),
        rotation: Number.isFinite(Number(presetLayer.rotation)) ? Number(presetLayer.rotation) : resolvePriceRotation(field),
        hidden: false,
        visible: true,
        locked: false,
        priceProductName: productLayerKey,
        priceField: field,
      };
      syncTextRange(template.layers[key], text);
      ensurePriceRenderOrder(template, productLayerKey, key);
      diagnostics?.push?.({ field, status: 'ok', value: text, target: `${productLayerKey} → ${key}（edited JSON）` });
      return key;
    }

    const fontSize = productLayerKey === '免運車' ? 50 : 58;
    const width = Math.max(120, Math.min(180, box.width * 0.82));
    const height = Math.max(50, fontSize * 1.08);
    const centerX = box.centerX;
    const centerY = box.y + box.height * 0.5;

    template.layers[key] = {
      type: 'text',
      source: 'c2c_skbn_pc_price',
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
      visible: true,
      locked: false,
      priceProductName: productLayerKey,
      priceField: field,
    };
    ensurePriceRenderOrder(template, productLayerKey, key);
    diagnostics?.push?.({ field, status: 'ok', value: text, target: `${productLayerKey} → ${key}` });
    return key;
  }

  function applyProductPrices(template, record, productState, diagnostics) {
    removeAutoPriceLayers(template);
    const leftPrice = findRecordValue(record, ['價格_左', '價格左']);
    const rightPrice = findRecordValue(record, ['價格_右', '價格右']);
    const created = [];

    const leftCreated = createPriceLayer(template, {
      key: '__c2c_pc_price_left',
      priceText: leftPrice,
      productLayerKey: productState?.leftLayerKey,
      diagnostics,
      field: '價格_左',
    });
    if (leftCreated) created.push(leftCreated);

    const rightCreated = createPriceLayer(template, {
      key: '__c2c_pc_price_right',
      priceText: rightPrice,
      productLayerKey: productState?.rightLayerKey,
      diagnostics,
      field: '價格_右',
    });
    if (rightCreated) created.push(rightCreated);

    template.pricePresetMeta = {
      productName: [productState?.leftProduct, productState?.rightProduct].filter(Boolean).join(' + '),
      rawPrice: [leftPrice, rightPrice].filter(Boolean).join(' + '),
      layoutKey: 'c2cPcPairPrice',
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
    applyPresetBaseLayers(template);
    removeAutoPriceLayers(template);
    const normalizedRecord = normalizeC2cRecord(record || {});
    const productState = applyProductVisibility(template, normalizedRecord, diagnostics);
    applyCopy(template, normalizedRecord, diagnostics);
    applyProductPrices(template, normalizedRecord, productState, diagnostics);
    applyPresetRenderOrder(template);
  }

  function isC2cSkbnPcBlock(blockName) {
    const key = normalize(blockName);
    return key === 'c2cskbnpc' || key === '05c2cskbnpc';
  }

  const C2CSkbnPcRules = {
    resolveRecordTemplateRoute({ block }) {
      if (!isC2cSkbnPcBlock(block?.name)) return null;
      return {
        key: FAMILY,
        family: FAMILY,
        label: 'C2C SKBN PC',
        templateId: TEMPLATE_ID,
        templateFile: TEMPLATE_FILE,
        outputPrefix: 'C2C_SKBN_PC',
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
    label: 'C2C SKBN PC',
    priority: 85,
    tokens: ['c2c skbn pc', 'c2c_skbn_pc', '05_c2c skbn pc', '05_c2c_skbn_pc'],
    targets: ['05_c2c skbn pc', '05_c2c_skbn_pc', 'c2c skbn pc', 'c2c_skbn_pc'],
    rules: {
      ...C2CSkbnPcRules,
      priceRules: {
        enabled: false,
        customPairPrice: true,
      },
    },
  });
})();

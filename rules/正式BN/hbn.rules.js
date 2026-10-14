/* HBN template rules – V4.20.9-json-writeback */
(function () {
  'use strict';

const RULES = {
  "titleLogoRules": {
    "enabled": true,
    "scope": "hbn-only",
    "vipKeyword": "VIP",
    "logoAssetFilename": "蝦皮VIP_LOGO.svg",
    "gapPx": 3,
    "targets": {
      "title": {
        "groupName": "主標題",
        "baseLayerKey": "title",
        "basePsdName": "主標題",
        "logoLayerKey": "主標題_蝦皮VIP_LOGO",
        "logoPsdName": "主標題_蝦皮VIP_LOGO",
        "textLayerKey": "主標題_文字",
        "textPsdName": "主標題_文字",
        "layout": {
          "logo": { "x": 51, "y": 69, "width": 316, "height": 111 },
          "text": { "x": 370, "y": 107, "width": 289, "height": 73 }
        }
      },
      "subtitle": {
        "groupName": "副標題",
        "baseLayerKey": "subtitle",
        "basePsdName": "副標題",
        "logoLayerKey": "副標題_蝦皮VIP_LOGO",
        "logoPsdName": "副標題_蝦皮VIP_LOGO",
        "textLayerKey": "副標題_文字",
        "textPsdName": "副標題_文字",
        "layout": {
          "logo": { "x": 119, "y": 198, "width": 182, "height": 63 },
          "text": { "x": 304, "y": 218, "width": 253, "height": 43 }
        }
      }
    }
  },
  "capsuleRules": {
    "horizontalPaddingPx": 25,
    "subtitleWiderPaddingPx": 25,
    "subtitleWiderPaddingMaxDiffPx": null,
    "titleWiderPaddingPx": 25,
    "titleWiderPaddingMaxDiffPx": 70,
    "verticalGapPx": 13,
    "verticalPaddingPx": 13,
    "legalGapPx": 11,
    "groupedSubtitleHeightPx": 80,
    "preserveSubtitleBox": true,
    "fill": "#0053d1",
    "radius": "capsule",
    "minWidthPx": 1
  },
  "priceRules": {
    "enabled": true,
    "coordinateMode": "absolute",
    "positioningMode": "absolute",
    "lockToEditedJson": true,
    "followProduct": true,
    "anchorLayerName": "商品圖1",
    "anchorLayerNames": [
      "商品圖1",
      "P",
      "曝品",
      "product",
      "product_1",
      "P1"
    ],
    "disableAnchorSync": false,
    "disableContentScale": true,
    "defaultColor": "#D0011B",
    "productFirst": true,
    "resolvePriority": "productFirst",
    "priceRuleSource": "hbn-independent-ddcard-logic-copy",
    "colorRules": [
      {
        "name": "VIP",
        "regex": "vip",
        "flags": "i",
        "color": "#FF770F"
      },
      {
        "name": "SCS",
        "keyword": "scs",
        "color": "#D0011B"
      },
      {
        "name": "商城券",
        "keyword": "商城券",
        "color": "#D0011B"
      },
      {
        "name": "全站券",
        "keyword": "全站券",
        "color": "#EE4D2D"
      }
    ],
    "templateLayouts": {
      "HBN_01": {
            "templateId": "HBN_01",
            "productName": "VIP_單券_蝦幣",
            "productKey": "vip單券蝦幣",
            "layoutKey": "vip",
            "rawPriceExample": "18%蝦幣",
            "isDoubleCoupon": false,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 736,
                  "y": 50,
                  "width": 375,
                  "height": 238,
                  "centerX": 923.5,
                  "centerY": 169,
                  "targetWidth": 375,
                  "targetHeight": 238,
                  "maxTargetHeight": 238,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 790,
                        "y": 145,
                        "width": 350,
                        "height": 100,
                        "centerX": 965,
                        "centerY": 195,
                        "rotation": 12,
                        "baseHeight": 100.2,
                        "baseWidth": 350.71,
                        "baseFontSizePx": 62.12,
                        "rotationOffset": 12,
                        "offsetY": 26.05,
                        "offsetX": 41.58,
                        "fontSizePx": 62,
                        "fontSizePt": 62,
                        "lineHeight": 66.96,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#ff770f",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 736,
                  "y": 50,
                  "width": 375,
                  "height": 238,
                  "centerX": 923.5,
                  "centerY": 169,
                  "targetWidth": 375,
                  "targetHeight": 238,
                  "maxTargetHeight": 238,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_02": {
            "templateId": "HBN_02",
            "productName": "全站券_雙券",
            "productKey": "全站券雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "$100",
            "isDoubleCoupon": true,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 855,
                        "y": 162,
                        "width": 200,
                        "height": 119.4,
                        "centerX": 955,
                        "centerY": 221.7,
                        "rotation": 2,
                        "baseHeight": 119.53,
                        "baseWidth": 200.21,
                        "baseFontSizePx": 90.09,
                        "rotationOffset": 2,
                        "offsetY": 55.76,
                        "offsetX": 42.04,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#ee4d2d",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  },
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 838,
                        "y": 51,
                        "width": 220,
                        "height": 119.4,
                        "centerX": 948,
                        "centerY": 110.7,
                        "rotation": -6,
                        "baseHeight": 119.53,
                        "baseWidth": 220.23,
                        "baseFontSizePx": 90.09,
                        "rotationOffset": -6,
                        "offsetY": -55.36,
                        "offsetX": 35.04,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#ee4d2d",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_03": {
            "templateId": "HBN_03",
            "productName": "全站券_雙券",
            "productKey": "全站券雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "93折",
            "isDoubleCoupon": true,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 855,
                        "y": 162,
                        "width": 200,
                        "height": 119.4,
                        "centerX": 955,
                        "centerY": 221.7,
                        "rotation": 2,
                        "baseHeight": 119.4,
                        "baseWidth": 200,
                        "baseFontSizePx": 90,
                        "rotationOffset": 2,
                        "offsetY": 55.7,
                        "offsetX": 42,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#ee4d2d",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  },
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 838,
                        "y": 51,
                        "width": 220,
                        "height": 119.4,
                        "centerX": 948,
                        "centerY": 110.7,
                        "rotation": -6,
                        "baseHeight": 119.4,
                        "baseWidth": 220,
                        "baseFontSizePx": 90,
                        "rotationOffset": -6,
                        "offsetY": -55.3,
                        "offsetX": 35,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#ee4d2d",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_04": {
            "templateId": "HBN_04",
            "productName": "VIP_單券_蝦幣",
            "productKey": "vip單券蝦幣",
            "layoutKey": "vip",
            "rawPriceExample": "18%蝦幣",
            "isDoubleCoupon": false,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 736,
                  "y": 50,
                  "width": 375,
                  "height": 238,
                  "centerX": 923.5,
                  "centerY": 169,
                  "targetWidth": 375,
                  "targetHeight": 238,
                  "maxTargetHeight": 238,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 790,
                        "y": 145,
                        "width": 350,
                        "height": 100,
                        "centerX": 965,
                        "centerY": 195,
                        "rotation": 12,
                        "baseHeight": 94.56,
                        "baseWidth": 330.98,
                        "baseFontSizePx": 58.63,
                        "rotationOffset": 12,
                        "offsetY": 24.59,
                        "offsetX": 39.24,
                        "fontSizePx": 62,
                        "fontSizePt": 62,
                        "lineHeight": 66.96,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#ff770f",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 736,
                  "y": 50,
                  "width": 375,
                  "height": 238,
                  "centerX": 923.5,
                  "centerY": 169,
                  "targetWidth": 375,
                  "targetHeight": 238,
                  "maxTargetHeight": 238,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_05": {
            "templateId": "HBN_05",
            "productName": "商城券_雙券",
            "productKey": "商城券雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "$200",
            "isDoubleCoupon": true,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 849,
                        "y": 162,
                        "width": 200,
                        "height": 115.5,
                        "centerX": 949,
                        "centerY": 219.75,
                        "rotation": 2,
                        "baseHeight": 115.5,
                        "baseWidth": 200,
                        "baseFontSizePx": 82,
                        "rotationOffset": 2,
                        "offsetY": 53.75,
                        "offsetX": 36,
                        "fontSizePx": 82,
                        "fontSizePt": 82,
                        "lineHeight": 88.56,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  },
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 832.5,
                        "y": 53.5,
                        "width": 220,
                        "height": 115.5,
                        "centerX": 942.5,
                        "centerY": 111.25,
                        "rotation": -6,
                        "baseHeight": 115.5,
                        "baseWidth": 220,
                        "baseFontSizePx": 82,
                        "rotationOffset": -6,
                        "offsetY": -54.75,
                        "offsetX": 29.5,
                        "fontSizePx": 82,
                        "fontSizePt": 82,
                        "lineHeight": 88.56,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_06": {
            "templateId": "HBN_06",
            "productName": "商城券_雙券",
            "productKey": "商城券雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "92折",
            "isDoubleCoupon": true,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 855,
                        "y": 162,
                        "width": 200,
                        "height": 113.7,
                        "centerX": 955,
                        "centerY": 218.85,
                        "rotation": 2,
                        "baseHeight": 113.7,
                        "baseWidth": 200,
                        "baseFontSizePx": 90,
                        "rotationOffset": 2,
                        "offsetY": 52.85,
                        "offsetX": 42,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  },
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 838,
                        "y": 51,
                        "width": 220,
                        "height": 113.7,
                        "centerX": 948,
                        "centerY": 107.85,
                        "rotation": -6,
                        "baseHeight": 113.7,
                        "baseWidth": 220,
                        "baseFontSizePx": 90,
                        "rotationOffset": -6,
                        "offsetY": -58.15,
                        "offsetX": 35,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_07": {
            "templateId": "HBN_07",
            "productName": "商城券_雙券",
            "productKey": "商城券雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "93折",
            "isDoubleCoupon": true,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 855,
                        "y": 162,
                        "width": 200,
                        "height": 113.7,
                        "centerX": 955,
                        "centerY": 218.85,
                        "rotation": 2,
                        "baseHeight": 113.7,
                        "baseWidth": 200,
                        "baseFontSizePx": 90,
                        "rotationOffset": 2,
                        "offsetY": 52.85,
                        "offsetX": 42,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  },
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 838,
                        "y": 51,
                        "width": 220,
                        "height": 113.7,
                        "centerX": 948,
                        "centerY": 107.85,
                        "rotation": -6,
                        "baseHeight": 113.7,
                        "baseWidth": 220,
                        "baseFontSizePx": 90,
                        "rotationOffset": -6,
                        "offsetY": -58.15,
                        "offsetX": 35,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_08": {
            "templateId": "HBN_08",
            "productName": "免運車加商城券",
            "productKey": "免運車加商城券",
            "layoutKey": "freeShippingCoupon",
            "rawPriceExample": "92折",
            "isDoubleCoupon": false,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 868,
                        "y": 190,
                        "width": 258.4,
                        "height": 78.8,
                        "centerX": 997.2,
                        "centerY": 229.4,
                        "rotation": -8,
                        "baseHeight": 78.8,
                        "baseWidth": 258.4,
                        "baseFontSizePx": 70,
                        "rotationOffset": -8,
                        "offsetY": 62.9,
                        "offsetX": 61.7,
                        "fontSizePx": 70,
                        "fontSizePt": 70,
                        "lineHeight": 75.6,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_09": {
            "templateId": "HBN_09",
            "productName": "免運車加商城券",
            "productKey": "免運車加商城券",
            "layoutKey": "freeShippingCoupon",
            "rawPriceExample": "$200",
            "isDoubleCoupon": false,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 869,
                        "y": 190,
                        "width": 258.4,
                        "height": 78.8,
                        "centerX": 998.2,
                        "centerY": 229.4,
                        "rotation": -8,
                        "baseHeight": 78.8,
                        "baseWidth": 258.4,
                        "baseFontSizePx": 66,
                        "rotationOffset": -8,
                        "offsetY": 62.9,
                        "offsetX": 62.7,
                        "fontSizePx": 66,
                        "fontSizePt": 66,
                        "lineHeight": 71.28,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_10": {
            "templateId": "HBN_10",
            "productName": "免運車加商城券",
            "productKey": "免運車加商城券",
            "layoutKey": "freeShippingCoupon",
            "rawPriceExample": "95折",
            "isDoubleCoupon": false,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 869,
                        "y": 190,
                        "width": 258.4,
                        "height": 78.8,
                        "centerX": 998.2,
                        "centerY": 229.4,
                        "rotation": -8,
                        "baseHeight": 78.8,
                        "baseWidth": 258.4,
                        "baseFontSizePx": 70,
                        "rotationOffset": -8,
                        "offsetY": 62.9,
                        "offsetX": 62.7,
                        "fontSizePx": 70,
                        "fontSizePt": 70,
                        "lineHeight": 75.6,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_11": {
            "templateId": "HBN_11",
            "productName": "商城券加蝦幣",
            "productKey": "商城券加蝦幣",
            "layoutKey": "couponCoin",
            "rawPriceExample": "20%",
            "isDoubleCoupon": false,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "single",
                        "psdName": "價格",
                        "positioningMode": "absolute",
                        "x": 910,
                        "y": 189,
                        "width": 175,
                        "height": 64.8,
                        "centerX": 997.5,
                        "centerY": 221.4,
                        "rotation": -6,
                        "baseHeight": 64.8,
                        "baseWidth": 175,
                        "baseFontSizePx": 62,
                        "rotationOffset": -6,
                        "offsetY": 54.9,
                        "offsetX": 62,
                        "fontSizePx": 62,
                        "fontSizePt": 62,
                        "lineHeight": 66.96,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 767,
                  "y": 33,
                  "width": 337,
                  "height": 267,
                  "centerX": 935.5,
                  "centerY": 166.5,
                  "targetWidth": 337,
                  "targetHeight": 267,
                  "maxTargetHeight": 267,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      },
      "HBN_12": {
            "templateId": "HBN_12",
            "productName": "商城券_雙券",
            "productKey": "商城券雙券",
            "layoutKey": "doubleCoupon",
            "rawPriceExample": "9折",
            "isDoubleCoupon": true,
            "coordinateMode": "absolute",
            "positioningMode": "absolute",
            "lockToEditedJson": true,
            "disableAnchorSync": false,
            "disableContentScale": true,
            "productImageBox": {
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            },
            "layouts": [
                  {
                        "slot": "bottom",
                        "psdName": "價格1（下券）",
                        "positioningMode": "absolute",
                        "x": 855,
                        "y": 162,
                        "width": 200,
                        "height": 113.7,
                        "centerX": 955,
                        "centerY": 218.85,
                        "rotation": 2,
                        "baseHeight": 113.7,
                        "baseWidth": 200,
                        "baseFontSizePx": 90,
                        "rotationOffset": 2,
                        "offsetY": 52.85,
                        "offsetX": 42,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  },
                  {
                        "slot": "top",
                        "psdName": "價格2（上券）",
                        "positioningMode": "absolute",
                        "x": 838,
                        "y": 51,
                        "width": 220,
                        "height": 113.7,
                        "centerX": 948,
                        "centerY": 107.85,
                        "rotation": -6,
                        "baseHeight": 113.7,
                        "baseWidth": 220,
                        "baseFontSizePx": 90,
                        "rotationOffset": -6,
                        "offsetY": -58.15,
                        "offsetX": 35,
                        "fontSizePx": 90,
                        "fontSizePt": 90,
                        "lineHeight": 97.2,
                        "lineHeightMultiplier": 1.08,
                        "letterSpacing": 0,
                        "color": "#d0011b",
                        "preserveExactSize": true,
                        "skipAutoScale": true,
                        "disableContentScale": true,
                        "disableAnchorSync": false,
                        "lockToEditedJson": true,
                        "followProduct": true,
                  }
            ],
            "anchorSource": {
                  "layerKey": "product",
                  "x": 743,
                  "y": 31,
                  "width": 340,
                  "height": 270,
                  "centerX": 913,
                  "centerY": 166,
                  "targetWidth": 340,
                  "targetHeight": 270,
                  "maxTargetHeight": 270,
                  "sizingMode": "containByPBox",
                  "keepAspectRatio": 1
            }
      }
},
    "productLayouts": {
      "vip單券蝦幣": {
            "productName": "VIP_單券_蝦幣",
            "variants": [
                  {
                        "priceIncludes": "18%蝦幣",
                        "useTemplate": "HBN_01"
                  },
                  {
                        "priceIncludes": "18%蝦幣",
                        "useTemplate": "HBN_04"
                  }
            ],
            "useTemplate": "HBN_01"
      },
      "全站券雙券": {
            "productName": "全站券_雙券",
            "variants": [
                  {
                        "priceIncludes": "$100",
                        "useTemplate": "HBN_02"
                  },
                  {
                        "priceIncludes": "93折",
                        "useTemplate": "HBN_03"
                  }
            ],
            "useTemplate": "HBN_02"
      },
      "商城券雙券": {
            "productName": "商城券_雙券",
            "variants": [
                  {
                        "priceIncludes": "$200",
                        "useTemplate": "HBN_05"
                  },
                  {
                        "priceIncludes": "92折",
                        "useTemplate": "HBN_06"
                  },
                  {
                        "priceIncludes": "93折",
                        "useTemplate": "HBN_07"
                  },
                  {
                        "priceIncludes": "9折",
                        "useTemplate": "HBN_12"
                  }
            ],
            "useTemplate": "HBN_05"
      },
      "免運車加商城券": {
            "productName": "免運車加商城券",
            "variants": [
                  {
                        "priceIncludes": "92折",
                        "useTemplate": "HBN_08"
                  },
                  {
                        "priceIncludes": "$200",
                        "useTemplate": "HBN_09"
                  },
                  {
                        "priceIncludes": "95折",
                        "useTemplate": "HBN_10"
                  }
            ],
            "useTemplate": "HBN_08"
      },
      "商城券加蝦幣": {
            "productName": "商城券加蝦幣",
            "variants": [
                  {
                        "priceIncludes": "20%",
                        "useTemplate": "HBN_11"
                  }
            ],
            "useTemplate": "HBN_11"
      }
}
  }
};


  const HBN_TITLE_LOGO_FIELDS = Object.freeze({
    title: '主標',
    subtitle: '副標',
  });

  const normalizeTitleLogoText = (value) => String(value ?? '')
    .replace(/_x000d_/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const setLayerVisible = (layer, visible) => {
    if (!layer) return;
    layer.hidden = !visible;
    layer.visible = !!visible;
  };

  const findLayerByRule = (template, key, psdName) => {
    if (!template?.layers) return null;
    if (key && template.layers[key]) return { key, layer: template.layers[key] };
    const wanted = String(psdName || '').trim();
    if (!wanted) return null;
    const entry = Object.entries(template.layers).find(([, layer]) => String(layer?.psdName || '').trim() === wanted);
    return entry ? { key: entry[0], layer: entry[1] } : null;
  };

  const ensureTitleLogoLayer = (template, key, base = {}) => {
    if (!template?.layers || !key) return null;
    if (!template.layers[key]) template.layers[key] = base;
    return template.layers[key];
  };

  const syncTitleLogoRenderOrder = (template, baseKey, logoKey, textKey) => {
    if (!template?.layers) return;
    const order = Array.isArray(template.renderOrder) ? template.renderOrder.filter(Boolean) : Object.keys(template.layers);
    const cleaned = order.filter((key) => key !== logoKey && key !== textKey);
    const baseIndex = cleaned.indexOf(baseKey);
    const insertAt = baseIndex >= 0 ? baseIndex : cleaned.length;
    cleaned.splice(insertAt, 0, logoKey, textKey);
    template.renderOrder = cleaned.filter((key) => template.layers[key] || template.generatedLayers?.[key] || key === 'subtitle_frame');
  };

  const stripVipKeyword = (text, keyword) => {
    const safeKeyword = String(keyword || 'VIP').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return normalizeTitleLogoText(text)
      .replace(new RegExp(safeKeyword, 'i'), '')
      .replace(/^\s*[+＋｜|／/・,，、-]+\s*/g, '')
      .replace(/\s*[+＋｜|／/・,，、-]+\s*$/g, '')
      .trim();
  };

  const applyHbnTitleLogoTarget = ({ template, record = {}, diagnostics = [], targetKey, targetRule, titleLogoRules }) => {
    if (!template?.layers || !targetRule) return;

    const fieldName = HBN_TITLE_LOGO_FIELDS[targetKey] || targetRule.fieldName || '';
    const baseEntry = findLayerByRule(template, targetRule.baseLayerKey, targetRule.basePsdName);
    if (!baseEntry?.layer) return;

    const logoKey = targetRule.logoLayerKey;
    const textKey = targetRule.textLayerKey;
    const logoLayout = targetRule.layout?.logo || {};
    const textLayout = targetRule.layout?.text || {};
    const keyword = titleLogoRules.vipKeyword || 'VIP';
    const safeKeyword = String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const recordText = normalizeTitleLogoText(record?.[fieldName]);
    const fullText = recordText || normalizeTitleLogoText(baseEntry.layer.text);
    const hasVip = new RegExp(safeKeyword, 'i').test(fullText);

    const logoLayer = ensureTitleLogoLayer(template, logoKey, {
      type: 'image',
      psdName: targetRule.logoPsdName || logoKey,
      assetFilename: titleLogoRules.logoAssetFilename || '蝦皮VIP_LOGO.svg',
      keepAspectRatio: true,
    });
    const textLayer = ensureTitleLogoLayer(template, textKey, {
      ...baseEntry.layer,
      type: 'text',
      psdName: targetRule.textPsdName || textKey,
      align: 'left',
    });

    if (!hasVip) {
      baseEntry.layer.text = fullText;
      delete baseEntry.layer.hbnTitleLogoGroupProxy;
      delete baseEntry.layer.hbnTitleLogoChildren;
      delete baseEntry.layer.hbnTitleLogoGroupWidth;
      setLayerVisible(baseEntry.layer, true);
      setLayerVisible(logoLayer, false);
      setLayerVisible(textLayer, false);
      return;
    }

    const splitText = stripVipKeyword(fullText, keyword);
    const gap = Number(titleLogoRules.gapPx ?? 3);

    Object.assign(logoLayer, {
      type: 'image',
      psdName: targetRule.logoPsdName || logoKey,
      assetFilename: titleLogoRules.logoAssetFilename || '蝦皮VIP_LOGO.svg',
      assetCandidates: [
        titleLogoRules.logoAssetFilename || '蝦皮VIP_LOGO.svg',
        '蝦皮VIP_LOGO.svg',
      ],
      keepAspectRatio: true,
      x: Number(logoLayout.x ?? logoLayer.x ?? baseEntry.layer.x ?? 0),
      y: Number(logoLayout.y ?? logoLayer.y ?? baseEntry.layer.y ?? 0),
      width: Number(logoLayout.width ?? logoLayer.width ?? 1),
      height: Number(logoLayout.height ?? logoLayer.height ?? 1),
      hidden: false,
      visible: true,
      locked: false,
    });
    logoLayer.centerX = Number(logoLayer.x || 0) + Number(logoLayer.width || 0) / 2;
    logoLayer.centerY = Number(logoLayer.y || 0) + Number(logoLayer.height || 0) / 2;

    Object.assign(textLayer, {
      type: 'text',
      psdName: targetRule.textPsdName || textKey,
      text: splitText,
      align: textLayer.align === 'right' ? 'right' : 'left',
      x: Number(textLayout.x ?? (Number(logoLayer.x || 0) + Number(logoLayer.width || 0) + gap)),
      y: Number(textLayout.y ?? textLayer.y ?? baseEntry.layer.y ?? 0),
      width: Number(textLayout.width ?? textLayer.width ?? baseEntry.layer.width ?? 1),
      height: Number(textLayout.height ?? textLayer.height ?? baseEntry.layer.height ?? 1),
      hidden: false,
      visible: true,
      locked: false,
    });
    textLayer.centerX = Number(textLayer.x || 0) + Number(textLayer.width || 0) / 2;
    textLayer.centerY = Number(textLayer.y || 0) + Number(textLayer.height || 0) / 2;

    const groupLeft = Math.min(Number(logoLayer.x || 0), Number(textLayer.x || 0));
    const groupTop = Math.min(Number(logoLayer.y || 0), Number(textLayer.y || 0));
    const groupRight = Math.max(
      Number(logoLayer.x || 0) + Number(logoLayer.width || 0),
      Number(textLayer.x || 0) + Number(textLayer.width || 0)
    );
    const groupBottom = Math.max(
      Number(logoLayer.y || 0) + Number(logoLayer.height || 0),
      Number(textLayer.y || 0) + Number(textLayer.height || 0)
    );
    const groupWidth = Math.max(1, groupRight - groupLeft);
    const groupHeight = Math.max(1, groupBottom - groupTop);

    baseEntry.layer.text = fullText;
    baseEntry.layer.x = groupLeft;
    baseEntry.layer.y = groupTop;
    baseEntry.layer.width = groupWidth;
    baseEntry.layer.height = groupHeight;
    baseEntry.layer.centerX = groupLeft + groupWidth / 2;
    baseEntry.layer.centerY = groupTop + groupHeight / 2;
    baseEntry.layer.hbnTitleLogoGroupProxy = true;
    baseEntry.layer.hbnTitleLogoGroupWidth = groupWidth;
    baseEntry.layer.hbnTitleLogoChildren = [logoKey, textKey];
    setLayerVisible(baseEntry.layer, false);

    syncTitleLogoRenderOrder(template, baseEntry.key, logoKey, textKey);

    diagnostics.push({
      field: targetRule.groupName || targetRule.basePsdName || targetKey,
      status: 'ok',
      value: `${titleLogoRules.logoAssetFilename || '蝦皮VIP_LOGO.svg'} + ${gap}px + ${splitText}`,
      target: 'hbn.rules.js titleLogoRules',
    });
  };

  const applyHbnTitleLogoRules = ({ template, record = {}, diagnostics = [] }) => {
    const titleLogoRules = RULES.titleLogoRules || {};
    if (titleLogoRules.enabled !== true || titleLogoRules.scope !== 'hbn-only') return;
    Object.entries(titleLogoRules.targets || {}).forEach(([targetKey, targetRule]) => {
      applyHbnTitleLogoTarget({ template, record, diagnostics, targetKey, targetRule, titleLogoRules });
    });
  };



  const HBN_TEXT_LAYER_LAYOUTS = Object.freeze({
    "HBN_01": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 22.5,
            "y": 207,
            "width": 631,
            "height": 63,
            "centerX": 338,
            "centerY": 229.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "legal": {
            "x": 195,
            "y": 285,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 119,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 210,
            "centerY": 229.5,
            "hidden": 0,
            "visible": 1
        },
        "副標題_文字": {
            "x": 304,
            "y": 218,
            "width": 253,
            "height": 43,
            "centerX": 430.5,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "left",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_02": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 22.5,
            "y": 207,
            "width": 631,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_03": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 100.5,
            "y": 207,
            "width": 475,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_04": {
        "title": {
            "x": 51,
            "y": 69,
            "width": 608,
            "height": 111,
            "centerX": 355,
            "centerY": 124.5,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "subtitle": {
            "x": 51,
            "y": 206,
            "width": 608,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 283,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 51,
            "y": 69,
            "width": 316,
            "height": 111,
            "centerX": 209,
            "centerY": 124.5,
            "hidden": 0,
            "visible": 1
        },
        "主標題_文字": {
            "x": 370,
            "y": 107,
            "width": 289,
            "height": 73,
            "centerX": 514.5,
            "centerY": 143.5,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "left",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_05": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 33,
            "y": 207,
            "width": 610,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_06": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 126,
            "y": 207,
            "width": 424,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_07": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 125.5,
            "y": 207,
            "width": 425,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_08": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 22.5,
            "y": 207,
            "width": 631,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_09": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 22.5,
            "y": 207,
            "width": 631,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_10": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 22.5,
            "y": 207,
            "width": 631,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_11": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 45,
            "y": 207,
            "width": 586,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    },
    "HBN_12": {
        "title": {
            "x": 24,
            "y": 105,
            "width": 628,
            "height": 76,
            "centerX": 338,
            "centerY": 143,
            "fontSizePx": 80,
            "fontSizePt": 80,
            "lineHeight": 96,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 0,
            "visible": 1
        },
        "subtitle": {
            "x": 72,
            "y": 207,
            "width": 532,
            "height": 53,
            "centerX": 337.5,
            "centerY": 233.5,
            "fontSizePx": 57,
            "fontSizePt": 57,
            "lineHeight": 68.4,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 0,
            "visible": 1
        },
        "legal": {
            "x": 195,
            "y": 284,
            "width": 287,
            "height": 23,
            "centerX": 338.5,
            "centerY": 295.5,
            "fontSizePx": 24,
            "fontSizePt": 24,
            "lineHeight": 35.0,
            "letterSpacing": 0,
            "align": "center",
            "color": "#113366",
            "hidden": 0
        },
        "主標題_蝦皮VIP_LOGO": {
            "x": 29,
            "y": 70,
            "width": 316,
            "height": 109,
            "centerX": 187,
            "centerY": 124.5,
            "hidden": 1,
            "visible": 0
        },
        "主標題_文字": {
            "x": 349,
            "y": 108,
            "width": 300,
            "height": 72,
            "centerX": 499,
            "centerY": 144,
            "fontSizePx": 75.78,
            "fontSizePt": 75.78,
            "lineHeight": 90.94,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFFFF",
            "hidden": 1,
            "visible": 0
        },
        "副標題_蝦皮VIP_LOGO": {
            "x": 111,
            "y": 198,
            "width": 182,
            "height": 63,
            "centerX": 202,
            "centerY": 229.5,
            "hidden": 1,
            "visible": 0
        },
        "副標題_文字": {
            "x": 299,
            "y": 218,
            "width": 268,
            "height": 43,
            "centerX": 433,
            "centerY": 239.5,
            "fontSizePx": 46,
            "fontSizePt": 46,
            "lineHeight": 55.2,
            "letterSpacing": 0,
            "align": "center",
            "color": "#FFFF3C",
            "hidden": 1,
            "visible": 0
        },
        "cta": {
            "x": 938,
            "y": 290,
            "width": 240,
            "height": 44,
            "centerX": 1058,
            "centerY": 312
        }
    }
});

  const resolveHbnTemplateId = (template = {}) => {
    const labels = [
      template?.templateId,
      template?.pricePresetMeta?.templateId,
      template?.sheetTemplateRoute?.sourceTemplateId,
      template?.batchSourceName,
      template?.source?.psdName,
    ].filter(Boolean).map(String);
    const normalize = (value) => String(value || '').toLowerCase().replace(/[\s_\-]+/g, '');
    return Object.keys(HBN_TEXT_LAYER_LAYOUTS).find((id) =>
      labels.some((label) => normalize(label).includes(normalize(id)))
    ) || '';
  };

  const applyHbnEditedLayerLayouts = ({ template, helpers = {} } = {}) => {
    const templateId = resolveHbnTemplateId(template);
    const presets = HBN_TEXT_LAYER_LAYOUTS[templateId];
    if (!template?.layers || !presets) return;
    const roundValue = helpers?.round || ((value) => Math.round(Number(value || 0) * 100) / 100);

    Object.entries(presets).forEach(([key, preset]) => {
      const layer = template.layers[key];
      if (!layer || !preset) return;
      Object.entries(preset).forEach(([prop, value]) => {
        layer[prop] = typeof value === 'number' ? roundValue(value, 2) : value;
      });
    });
  };

  RULES.afterApplyRecordToTemplate = applyHbnTitleLogoRules;
  RULES.layoutRules = {
    applyProgrammaticLayout({ template, helpers = {} }) {
      applyHbnTitleLogoRules({
        template,
        record: template?.batchRecord || {},
        diagnostics: template?.batchDiagnostics || [],
      });
      applyHbnEditedLayerLayouts({ template, helpers });
    },
  };


  window.TemplateRuleRegistry?.register?.("hbn", {
    family: "hbn",
    label: "HBN",
    priority: 20,
    tokens: [
  "hbn",
  "han"
],
    targets: [
  "hbn",
  "han"
],
    rules: RULES,
  });
})();
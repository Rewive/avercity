import {
	ViewWidth,
    ViewHeight,
} from '@vkontakte/vkui';
var DESKTOP_SIZE = 1000;
var TABLET_SIZE = 900;
var SMALL_TABLET_SIZE = 768;
var MOBILE_SIZE = 320;
var MOBILE_LANDSCAPE_HEIGHT = 414;
var MEDIUM_HEIGHT = 720;
export const calculateAdaptivity = (windowWidth, windowHeight) => {
    var viewWidth = ViewWidth.SMALL_MOBILE;
    var viewHeight = ViewHeight.SMALL;
  
    if (windowWidth >= DESKTOP_SIZE) {
      viewWidth = ViewWidth.DESKTOP;
    } else if (windowWidth >= TABLET_SIZE) {
      viewWidth = ViewWidth.TABLET;
    } else if (windowWidth >= SMALL_TABLET_SIZE) {
      viewWidth = ViewWidth.SMALL_TABLET;
    } else if (windowWidth >= MOBILE_SIZE) {
      viewWidth = ViewWidth.MOBILE;
    } else {
      viewWidth = ViewWidth.SMALL_MOBILE;
    }
  
    if (windowHeight >= MEDIUM_HEIGHT) {
      viewHeight = ViewHeight.MEDIUM;
    } else if (windowHeight > MOBILE_LANDSCAPE_HEIGHT) {
      viewHeight = ViewHeight.SMALL;
    } else {
      viewHeight = ViewHeight.EXTRA_SMALL;
    }
    return {
      viewWidth: viewWidth,
      viewHeight: viewHeight,
    };
  }
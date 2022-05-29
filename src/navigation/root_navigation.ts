import {
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import type {RootStackParamList} from '@/navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type Action = [Function, unknown[]];
const actionQueue: Action[] = [];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCurrentRoute() {
  let currentRoute = {name: ''};
  if (navigationRef.isReady()) {
    currentRoute = navigationRef.getCurrentRoute() || currentRoute;
  }
  return currentRoute;
}

export async function onReady() {
  while (actionQueue.length) {
    const [action, options] = actionQueue.shift() as Action;
    action(...options);
    if (actionQueue.length) await sleep(10);
  }
}

export function navigate(
  ...options: Parameters<typeof navigationRef.navigate>
): ReturnType<typeof navigationRef.navigate> {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...options);
  } else {
    actionQueue.push([navigate, options]);
  }
}

export function dispatch(
  ...options: Parameters<typeof navigationRef.dispatch>
): ReturnType<typeof navigationRef.dispatch> {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(...options);
  } else {
    actionQueue.push([dispatch, options]);
  }
}

export function push(...options: Parameters<typeof StackActions.push>) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(...options));
  } else {
    actionQueue.push([push, options]);
  }
}

export function replace(...options: Parameters<typeof StackActions.push>) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(...options));
  } else {
    actionQueue.push([replace, options]);
  }
}

export function popToTop() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.popToTop());
  } else {
    actionQueue.push([popToTop, []]);
  }
}

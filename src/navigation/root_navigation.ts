import {
  createNavigationContainerRef,
  Route,
  StackActions,
} from '@react-navigation/native';
import type {RootStackParamList} from '@/navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type Action = {
  fn: Function;
  args: unknown[];
};
let todoAction: Action | undefined = undefined;

export function getCurrentRoute(): Route<string, object | undefined> {
  let currentRoute = {name: '', key: ''};
  if (navigationRef.isReady()) {
    currentRoute = navigationRef.getCurrentRoute() || currentRoute;
  }
  return currentRoute;
}

export async function onReady() {
  if (todoAction) {
    todoAction.fn(...todoAction.args);
  }
}

type NavigateType = typeof navigationRef.navigate;

export const navigate = ((...options: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Home');
    navigationRef.navigate(...options);
  } else {
    todoAction = {
      fn: navigate,
      args: options,
    };
  }
}) as NavigateType;

export function dispatch(
  ...options: Parameters<typeof navigationRef.dispatch>
): ReturnType<typeof navigationRef.dispatch> {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(...options);
  } else {
    todoAction = {
      fn: dispatch,
      args: options,
    };
  }
}

export function push(...options: Parameters<typeof StackActions.push>) {
  if (navigationRef.isReady()) {
    if (
      options.length &&
      navigationRef.getCurrentRoute()?.name !== options[0]
    ) {
      navigationRef.dispatch(StackActions.push(...options));
    }
  } else {
    todoAction = {
      fn: push,
      args: options,
    };
  }
}

export function replace(...options: Parameters<typeof StackActions.push>) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(...options));
  } else {
    todoAction = {
      fn: replace,
      args: options,
    };
  }
}

export function popToTop() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.popToTop());
  } else {
    todoAction = {
      fn: popToTop,
      args: [],
    };
  }
}

type setParamsType = typeof navigationRef.setParams;

export const setRouteParams = function setRouteParams(
  ...options: Parameters<setParamsType>
) {
  if (navigationRef.isReady()) {
    navigationRef.setParams(...options);
  } else {
    todoAction = {
      fn: setRouteParams,
      args: options,
    };
  }
} as setParamsType;

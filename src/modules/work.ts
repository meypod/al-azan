import {NativeModules} from 'react-native';

const WorkModule = (
  NativeModules.WorkModule
    ? NativeModules.WorkModule
    : new Proxy(
        {},
        {
          get() {
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking work module');
            }
          },
        },
      )
) as WorkModuleInterface;

interface WorkModuleInterface {
  cancelWorkByName(): Promise<void>;
  cancelWorkById(): Promise<void>;
  scheduleWork(
    taskName: string,
    epochMilli: string,
    keepAwake: boolean,
    allowedInForeground: boolean,
    extra: string | null,
  ): Promise<void>;
}

export const cancelWorkByName = WorkModule.cancelWorkByName;
export const cancelWorkById = WorkModule.cancelWorkById;

export type ScheduleWorkOptions = {
  taskName: string;
  // time milliseconds as string
  timestamp: number;
  keepAwake?: boolean;
  allowedInForeground?: boolean;
  extra?: string;
};

export function scheduleWork(options: ScheduleWorkOptions) {
  const {
    taskName,
    timestamp = 0,
    keepAwake = false,
    allowedInForeground = false,
    extra = null,
  } = options;
  return WorkModule.scheduleWork(
    taskName,
    timestamp.toString(),
    keepAwake,
    allowedInForeground,
    extra,
  );
}

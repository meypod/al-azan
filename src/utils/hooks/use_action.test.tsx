import {renderHook, act} from '@testing-library/react-hooks';
import {useAction} from '@/utils/hooks/use_action';

jest.useFakeTimers();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('use_action', () => {
  it('prevents running a function more than one at a time if it doesnt support abort. only first call completes.', async () => {
    const mock = jest.fn();
    const {result} = renderHook(() =>
      useAction(
        async (arg: string) => {
          mock();
          sleep(999999999);
          return arg;
        },
        {supportsAbort: false},
      ),
    );

    let theAct = act(() =>
      Promise.all([
        result.current.runAction('a'),
        result.current.runAction('b'),
        result.current.runAction('c'),
        result.current.runAction('d'),
      ]).then(() => {}),
    );
    expect(result.current.pending).toBe(true);
    expect(result.current.error).toBeFalsy();
    expect(result.current.result).toBe(undefined);
    setTimeout(jest.runAllTimers, 1);
    await theAct;
    expect(result.current.result).toBe('a'); // only first one get to set result
    expect(result.current.pending).toBe(false);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('aborts previous running function if abort is supported. last call sets result.', async () => {
    const mock = jest.fn();
    const {result} = renderHook(() =>
      useAction(
        async (arg: string) => {
          mock();
          sleep(999999999);
          return arg;
        },
        {supportsAbort: true}, // this is default
      ),
    );

    let theAct = act(() =>
      Promise.all([
        result.current.runAction('a'),
        result.current.runAction('b'),
        result.current.runAction('c'),
        result.current.runAction('d'),
      ]).then(() => {}),
    );
    expect(result.current.pending).toBe(true);
    expect(result.current.error).toBeFalsy();
    expect(result.current.result).toBe(undefined);
    setTimeout(jest.runAllTimers, 1);
    await theAct;
    expect(result.current.result).toBe('d'); // only first one get to set result
    expect(result.current.pending).toBe(false);
    expect(mock).toHaveBeenCalledTimes(4);
  });
});

import { Transducer } from "../api";
import { iterator1 } from "../iterator";
import { throttle } from "./throttle";

/**
 * Time-based version of {@link throttle}. Ignores any new values in the
 * `delay` interval since the last accepted value.
 *
 * **Only to be used in async contexts and NOT with {@link transduce}
 * directly.**
 *
 * Also see: {@link @thi.ng/rstream# | @thi.ng/rstream} and {@link @thi.ng/csp# | @thi.ng/csp} packages.
 *
 * @param delay -
 */
export function throttleTime<T>(delay: number): Transducer<T, T>;
export function throttleTime<T>(
    delay: number,
    src: Iterable<T>
): IterableIterator<T>;
export function throttleTime<T>(delay: number, src?: Iterable<T>): any {
    return src
        ? iterator1(throttleTime(delay), src)
        : throttle<T>(() => {
              let last = 0;
              return () => {
                  const t = Date.now();
                  return t - last >= delay ? ((last = t), true) : false;
              };
          });
}

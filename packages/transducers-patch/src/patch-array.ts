import { illegalArgs, illegalArity } from "@thi.ng/errors";
import { reduce, reducer, Reducer } from "@thi.ng/transducers";
import { Patch, PatchArrayOp } from "./api";

/**
 * Reducer for {@link Patch} based array edits. Only numeric indices are
 * supported (i.e. NO nested edits, use {@link patchObj} for that
 * purpose).
 *
 * @remarks
 * Unless `immutable` is false (default: true), all edits are performed
 * in a non-destructive manner.
 *
 * The following patch types are supported:
 * - SET
 * - UPDATE
 * - INSERT
 * - DELETE
 *
 * @example
 * ```ts
 * // direct invocation
 * patchArray(
 *     true,
 *     [1, 2, 3],
 *     [
 *         [Patch.SET, 0, 42],
 *         [Patch.UPDATE, 1, (x, n) => x * n, 10],
 *         [Patch.INSERT, 2, [10, 11]],
 *         [Patch.DELETE, 3]
 *     ]
 * );
 * // [ 42, 20, 10, 3 ]
 * ```
 */
export function patchArray<T>(
    immutable?: boolean
): Reducer<T[], PatchArrayOp<T>>;
export function patchArray<T>(
    immutable: boolean,
    init: T[],
    patches: Iterable<PatchArrayOp<T>>
): T[];
export function patchArray<T>(...args: any[]) {
    let immutable: boolean;
    let init: T[];
    let patches: Iterable<PatchArrayOp<T>> | undefined;
    switch (args.length) {
        case 0:
            immutable = true;
            break;
        case 1:
            immutable = args[0];
            break;
        case 3:
            immutable = args[0];
            init = args[1];
            patches = args[2];
            break;
        default:
            illegalArity(args.length);
    }
    return patches
        ? reduce(patchArray<T>(), init!, patches)
        : reducer<T[], PatchArrayOp<T>>(
              () => [],
              (acc, x) => {
                  immutable && (acc = acc.slice());
                  switch (x[0]) {
                      case Patch.SET:
                          acc[x[1]] = x[2];
                          break;
                      case Patch.UPDATE:
                          acc[x[1]] = x[2](acc[x[1]], ...x.slice(3));
                          break;
                      case Patch.INSERT:
                          acc.splice(x[1], 0, ...x[2]);
                          break;
                      case Patch.DELETE:
                          acc.splice(x[1], 1);
                          break;
                      default:
                          illegalArgs(`patch op: ${x}`);
                  }
                  return acc;
              }
          );
}
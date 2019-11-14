import { commonKeysObj } from "./common-keys";
import { indexed } from "./indexed";
import { invertObj } from "./invert";
import { mergeObj } from "./merge";
import { renameKeysObj } from "./rename-keys";
import { selectKeysObj } from "./select-keys";
import { empty, first, objValues } from "./utils";

/**
 * Computes the natural join between the two sets of relations. Each set
 * is assumed to have plain objects as values with at least one of the
 * keys present in both sides. Furthermore the objects in each set are
 * assumed to have the same internal structure (i.e. sets of keys).
 * Returns new set of same type as `a`.
 *
 * @example
 * ```ts
 * join(
 *   new Set([
 *     {id: 1, name: "foo"},
 *     {id: 2, name: "bar"},
 *     {id: 3, name: "baz"}]),
 *   new Set([
 *     {id: 1, color: "red"},
 *     {id: 2, color: "blue"}])
 * )
 * // Set {
 * //   { id: 1, color: 'red', name: 'foo' },
 * //   { id: 2, color: 'blue', name: 'bar' }
 * // }
 * ```
 *
 * @param a -
 * @param b -
 */
export const join = <A, B>(
    a: Set<A>,
    b: Set<B>
): Set<Pick<A, keyof A> & Pick<B, keyof B>> => {
    if (a.size && b.size) {
        const ks = commonKeysObj(first(a) || {}, first(b) || {});
        let aa: Set<any>, bb: Set<any>;
        if (a.size <= b.size) {
            aa = a;
            bb = b;
        } else {
            aa = b;
            bb = a;
        }
        const idx = indexed(aa, ks);
        const res: Set<any> = empty(a, Set);
        for (let x of bb) {
            const found = idx.get(selectKeysObj(x, ks));
            if (found) {
                for (let f of found) {
                    res.add(mergeObj({ ...f }, x));
                }
            }
        }
        return res;
    }
    return empty(a, Set);
};

/**
 * Similar to {@link join}, computes the join between two sets of relations,
 * using the given keys in `kmap` only for joining and ignoring others.
 * `kmap` can also be used to translate join keys in `b` where
 * needed. Else, if no renaming is desired, the values in `kmap` should
 * be the same as their respective keys, e.g. `{id: "id"}`. Returns new
 * set of same type as `a`.
 *
 * @example
 * ```ts
 * joinWith(
 *   new Set([
 *     {id: 1, name: "foo"},
 *     {id: 2, name: "bar"},
 *     {id: 3, name: "baz"}]),
 *   new Set([
 *     {type: 1, color: "red"},
 *     {type: 2, color: "blue"}]),
 *   {id: "type"}
 * )
 * // Set {
 * //   { type: 1, color: 'red', id: 1, name: 'foo' },
 * //   { type: 2, color: 'blue', id: 2, name: 'bar' } }
 * ```
 *
 * @param a -
 * @param b -
 * @param kmap - keys to compute join for
 */
export const joinWith = <A, B>(
    a: Set<A>,
    b: Set<B>,
    kmap: { [id in keyof A]?: keyof B }
): Set<any> => {
    if (a.size && b.size) {
        let aa: Set<any>, bb: Set<any>;
        let k: { [id in keyof A]?: keyof B };
        if (a.size <= b.size) {
            aa = a;
            bb = b;
            k = <any>invertObj(<any>kmap);
        } else {
            aa = b;
            bb = a;
            k = kmap;
        }
        const idx = indexed(aa, objValues(k));
        const ks = Object.keys(k);
        const res: Set<any> = empty(a, Set);
        for (let x of bb) {
            const found = idx.get(renameKeysObj(<any>selectKeysObj(x, ks), k));
            if (found) {
                for (let f of found) {
                    res.add(mergeObj({ ...f }, x));
                }
            }
        }
        return res;
    }
    return empty(a, Set);
};

joinWith(new Set([{ a: 1, b: 2 }]), new Set([{ id: 1, c: 2 }]), { a: "id" });

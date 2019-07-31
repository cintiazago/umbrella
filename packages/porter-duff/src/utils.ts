import { Color, ReadonlyColor } from "./api";

export const setC4 = (
    out: Color,
    a: number,
    b: number,
    c: number,
    d: number
) => ((out[0] = a), (out[1] = b), (out[2] = c), (out[3] = d), out);

export const setN4 = (out: Color, n: number) => setC4(out, n, n, n, n);

export const setV4 = (out: Color, a: ReadonlyColor) =>
    setC4(out, a[0], a[1], a[2], a[3]);
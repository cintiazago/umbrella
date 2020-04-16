import type { Parser } from "../api";

export const seq = <T>(parsers: Parser<T>[], id = "seq"): Parser<T> => (
    ctx
) => {
    if (ctx.done) return false;
    ctx.start(id);
    for (let i = 0, n = parsers.length; i < n; i++) {
        if (!parsers[i](ctx)) {
            return ctx.discard();
        }
    }
    return ctx.end();
};
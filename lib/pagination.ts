import {
    constant,
    either,
    maybe,
    number,
    object,
    optional,
    string,
} from "decoders";

type Page = {
    size: number;
    page: number;
};

type Paginated<T> = Page & {
    pages: number;
    data: T[];
};

const paginated = <T>(data: T[], total: number, page: Page): Paginated<T> => {
    return {
        ...page,
        pages: Math.ceil(total / page.size),
        data,
    };
};

const paginationString = (def: number) =>
    either(
        maybe(
            string
                .transform((s) => parseInt(s))
                .then(number.decode)
                .refine((n) => n >= 0, "Must be non-negative"),
            def
        ),
        constant(def)
    );

const paginationParams = (size: number) =>
    object({
        page: paginationString(0),
        size: paginationString(size),
        search: optional(string),
    });

export { type Page, type Paginated, paginated, paginationParams };
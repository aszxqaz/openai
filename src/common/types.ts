export type OmitPartial<T, K extends keyof T> = Partial<Omit<T, K>>;

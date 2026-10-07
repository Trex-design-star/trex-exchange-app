export declare class RatesService {
    decimals(ccy: string): number;
    /** Reference rate: 1 unit of `from` in units of `to`. Null when unknown. */
    refRate(from: string, to: string): number | null;
    /** Convert minor units between currencies at the reference rate. */
    convert(minor: number, from: string, to: string): number | null;
}

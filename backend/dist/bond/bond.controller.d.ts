import { BondService } from './bond.service';
export declare class BondController {
    private bond;
    constructor(bond: BondService);
    topup(b: any, key?: string): Promise<{
        caps: any;
        duplicate: boolean;
    }>;
    release(b: any, key?: string): Promise<{
        queued: boolean;
        reference: string;
        caps?: undefined;
        transfer?: undefined;
    } | {
        caps: any;
        reference: string;
        transfer: any;
        queued?: undefined;
    }>;
    switch(b: any): Promise<never>;
}

export type Clipping = {
    uuid: string;
    domain: string;
    path?: string;
    text:string
};

export type ClippingCreate = Omit<Clipping, 'uuid'>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ISSLCommerz{
    amount: number;
    transactionId: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;

    
}

export interface ISSLResponse {
    GatewayPageURL: string;
    [key: string]: any; // অন্য কোনো response field থাকলেও ধরে নেবে
}
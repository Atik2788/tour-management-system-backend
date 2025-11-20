/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS{
    PAID = "PAID",
    UNPAID = "UNPAID",
    CANCLED = "CANCLED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export interface IPayment{
    booking: Types.ObjectId;
    transactionId: string;
    amount: number;
    paymentGetwayData?: any;
    invoiceUrl?: string;
    status: PAYMENT_STATUS;
    

}
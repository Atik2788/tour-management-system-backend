import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";
import { SSLService } from "../sslcommers/slcommerz.service";


const successPayment = catchAsync(async(req:Request, res: Response) =>{
    const query = req.query;

    const result = await PaymentService.successPayment(query as Record<string, string>);   
    if(result.success){
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`);
    }
})

const failPayment = catchAsync(async(req:Request, res: Response) =>{
// update booking status to faild
// update payment status to faild
    const query = req.query;

    const result = await PaymentService.failPayment(query as Record<string, string>);   
    if(!result.success){
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`);
    }

})

const canclePayment = catchAsync(async(req:Request, res: Response) =>{
// update booking status to cencel
// update payment status to cencel
    const query = req.query;

    const result = await PaymentService.cancelPayment(query as Record<string, string>);   
    if(!result.success){
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`);
    }

})

const initPayment = catchAsync(async(req:Request, res: Response) =>{
    const bookingId = req.params.bookingId;

    const result = await PaymentService.initPayment(bookingId as string);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Payment done successfully",
        data: result,
    })
})

const getInvoiceDownloadURL = catchAsync(async(req:Request, res: Response) =>{
    const paymentId =  req.params.paymentId;
    console.log(paymentId, "hitted")

    const result = await PaymentService.getInvoiceDownloadURL(paymentId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Invoice download URL fetched successfully",
        data: result,
    })
})

const validatePayment = catchAsync(async(req:Request, res: Response) =>{
    console.log("sslcommerz ipn url body", req.body)
    await SSLService.validatePayment(req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment validated successfully",
        data: null,
    })
})




export const PaymentController = {
    successPayment,
    failPayment,
    canclePayment,
    initPayment,
    getInvoiceDownloadURL,
    validatePayment
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz, ISSLResponse } from "./sslcommerz.interface";
import axios from "axios";


const sslPaymentInit = async (payload: ISSLCommerz): Promise<ISSLResponse> => {
  try {
    const data = {
      store_id: envVars.SSL.SSL_STORE_ID,
      store_passwd: envVars.SSL.SSL_STORE_PASS,
      total_amount: payload.amount,
      currency: "BDT",
      tran_id: payload.transactionId,
      success_url: `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
      fail_url: `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
      cancel_url: `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
      ipn_url: envVars.SSL.SSL_IPN_URL,
      shipping_method: "N/A",
      product_name: "Tour",
      product_category: "General",
      cus_name: payload.name,
      cus_email: payload.email,
      cus_add1: payload.address,
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: payload.phoneNumber,
      cus_fax: "015464949",
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 10000,
      ship_country: "N/A",
    };

   /*  const response  = await axios({
      method: "POST",
      url: envVars.SSL.SSL_PAYMENT_API,
      data: data,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }); */

        const response = await axios.post<ISSLResponse>(
      envVars.SSL.SSL_PAYMENT_API,
      data,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data as ISSLResponse;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    console.log("Payment error occured", error);
    throw new AppError(201, error.message);
  }


};


const validatePayment = async (payload: any) => {
  try {
      const response = await axios({
      method: "POST",
      url: `${envVars.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${envVars.SSL.SSL_STORE_ID}&store_passwd=${envVars.SSL.SSL_STORE_PASS}`,
    })

    console.log(response.data)

    await Payment.updateOne(
      {transactionId: payload.tran_id}, 
      {paymentGetwayData: response.data},
      {runValidators: true}
    );

  } catch (error: any) {
    console.log(error)
    throw new AppError(400, `Payment validation error occured ${error.message}`);
  }

}

export const SSLService = {sslPaymentInit, validatePayment}

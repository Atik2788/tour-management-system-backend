import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DivisionService } from "./division.service";
import { sendResponse } from "../../utils/sendResponse";
import { IDivision } from "./division.interface";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";


const createDivision = catchAsync(async (req: Request, res: Response) => {
    let thumbnailUrl: string | undefined;

    if (req.body.thumbnailBase64) { // ফ্রন্টএন্ড থেকে base64 অথবা buffer পাঠাতে হবে
        const buffer = Buffer.from(req.body.thumbnailBase64, 'base64');
        const uploadResult = await uploadBufferToCloudinary(buffer, "division-thumbnail");
        thumbnailUrl = uploadResult?.secure_url;
    }

    const payload: IDivision = {
        ...req.body,
        thumbnail: thumbnailUrl
    };

    const result = await DivisionService.createDevision(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Division created successfully",
        data: result
    });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllDivisions = catchAsync(async(req: Request, res: Response)=>{
    const result = await DivisionService.getAllDivisions();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All Divisions retrieved successfully",
        data: result
    })
    
})

const getSingleDivision = catchAsync (async (req: Request, res: Response) =>{
    const slug = req.params.slug
    const result = await DivisionService.getSingleDivision(slug)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Single Division retrieved successfully",
        data: result
    })
})

const updateDivision = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    let thumbnailUrl: string | undefined;

    if (req.body.thumbnailBase64) {
        const buffer = Buffer.from(req.body.thumbnailBase64, 'base64');
        const uploadResult = await uploadBufferToCloudinary(buffer, "division-thumbnail");
        thumbnailUrl = uploadResult?.secure_url;
    }

    const payload: Partial<IDivision> = {
        ...req.body,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl })
    };

    const result = await DivisionService.updateDivision(id, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division Updated",
        data: result
    });
});


const deleteDivision = catchAsync(async (req: Request, res: Response)=>{
    const result = await DivisionService.deleteDivision(req.params.id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division deleted successfully",
        data: result
    })
})


export const DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision, 
    deleteDivision
}
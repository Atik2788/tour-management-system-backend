import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DivisionService } from "./division.service";
import { sendResponse } from "../../utils/sendResponse";
import { IDivision } from "./division.interface";


const createDivision = catchAsync(async (req: Request, res: Response)=>{

    const payload: IDivision = {
        ...req.body,
        thumbnail: req.file?.path
    }

    const result = await DivisionService.createDevision(payload);

    console.log({
        file: req.file,
        body: req.body
    })

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Division created successfully",
        data: result
    })

}) 

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

const updateDivision = catchAsync(async (req: Request, res: Response)=>{
    const id = req.params.id;
    const result = await DivisionService.updateDivision(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true, 
        message: "Division Updated",
        data: result
    })
})

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
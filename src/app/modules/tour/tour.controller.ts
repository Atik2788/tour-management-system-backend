import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";
import { ITour } from "./tour.interface";


/* ------------------ TOUR  CONTROLLERS -------------------- */
const createTour = catchAsync(async (req: Request, res: Response)=>{
    const payload: ITour = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
    }

    const result = await TourService.createTour(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tour created successfully",
        data: result,
    })
})

const getAllTours =  catchAsync(async (req: Request, res: Response)=>{
    const query = req.query;
    const result = await TourService.getAllTours(query as Record<string, string>);



    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All Tours retrieved successfully",
        data: result
    })
})


const updateTour = catchAsync(async (req: Request, res: Response)=>{
    const id = req.params.id;
    
        const payload: ITour = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
    }
    
    const result = await TourService.updateTour(id, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour updated successfully",
        data: result
    })
} )



const deleteTour = catchAsync(async (req: Request, res: Response)=>{
    const result = await TourService.deleteTour(req.params.id)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour deleted successfully",
        data: result
    })
})


/* ------------------ TOUR TYPE CONTROLLERS -------------------- */
const getAllTourTypes = catchAsync(async (req: Request, res: Response)=>{
    const result = await TourService.getAllTourTypes();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All Tour Types retrieved successfully",
        data: result
    })
})

const createTourType = catchAsync(async (req: Request, res: Response) =>{
    const result = await TourService.createTourType(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Tour Type created successfully",
        data: result
    })
})


const updateTourType = catchAsync(async(req: Request, res: Response)=>{
    const id = req.params.id;
    const result = await TourService.updateTourType(id, req.body)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour Type updated successfully",
        data: result
    })
})

const deleteTourType = catchAsync(async (req: Request, res: Response)=>{
    const result = await TourService.deleteTourType(req.params.id)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tour Type deleted successfully",
        data: result
    })
})




export const TourController = {
    getAllTourTypes,
    createTourType,
    updateTourType,
    deleteTourType,

    createTour,
    getAllTours,
    updateTour,
    deleteTour
}
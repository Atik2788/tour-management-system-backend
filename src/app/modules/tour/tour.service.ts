import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface"
import { Tour, TourType } from "./tour.model"
import { QueryBuilder } from "../../utils/QueryBuilder";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";


/* ------------------ TOUR SERVICE -------------------- */

const createTour = async(payload: ITour) => {

    const existingtour = await Tour.findOne({title: payload.title});

    if(existingtour){
        throw new Error("Tour already exist")
    }

   const createdTour = await Tour.create(payload);
    return createdTour;
}




const getAllTours = async(query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Tour.find(), query)
    const tours = await queryBuilder
                .search(tourSearchableFields)
                .filter()
                .sort()
                .fields()
                .paginate()

    // const meta = await queryBuilder.getMeta()

    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])

        return {
        data,
        meta
        }    
    }


const updateTour = async(id: string, payload: Partial<ITour>) => {
    const existingtour = await Tour.findById(id);
    if(!existingtour){
        throw new Error("Tour does not exist")
    }


    if(payload.images && payload.images.length && existingtour.images && existingtour.images.length){
        payload.images = [...payload.images, ...existingtour.images];
    }


    if(payload.deleteImages && payload.deleteImages.length && existingtour.images && existingtour.images.length){
        const restDBImages = existingtour.images.filter(imgUrl => !payload.deleteImages?.includes(imgUrl));

        const updatedImages = (payload.images || [])
            .filter(imgUrl => !payload.deleteImages?.includes(imgUrl))
            .filter(imgUrl => !restDBImages.includes(imgUrl));
        
        payload.images = [...restDBImages, ...updatedImages];
    }


    const updatedTour = await Tour.findByIdAndUpdate(id, payload, {new: true, runValidators: true});

    if(payload.deleteImages && payload.deleteImages.length && existingtour.images && existingtour.images.length){
        await Promise.all(payload.deleteImages.map(url => deleteImageFromCLoudinary(url)));
    }

    return updatedTour;
}



const deleteTour = async(id: string) =>{
    const existingtour = await Tour.findById(id);
    if(!existingtour){
        throw new Error("Tour does not exist")
    }

    const result = await Tour.findByIdAndDelete(id);

    return result
}





/* ------------------ TOUR TYPE SERVICE -------------------- */
const getAllTourTypes = async() =>{
    return await TourType.find({})
}

const createTourType =  async(payload: ITourType) => {
    const existingTourType = await TourType.findOne({name: payload.name})
    if(existingTourType){
        throw new Error("Tour Type already exist")
    }
    return await TourType.create(payload);
}

const updateTourType = async(id: string, payload: Partial<ITourType>) =>{
    const existingTourType  = await TourType.findById(id);
    if(!existingTourType){
        throw new Error("Tour Type does not exist")
    };

    const updateTourType = await TourType.findByIdAndUpdate(id, payload, {new: true, runValidators: true});

    return updateTourType
}

const deleteTourType = async(id: string) => {
    const existingTourType = await TourType.findById(id);
    if(!existingTourType){
        throw new Error("Tour Type does not exist")
    }

    const result = await TourType.findByIdAndDelete(id);

    return result;
}

export const TourService = {
    getAllTourTypes,
    createTourType,
    updateTourType,
    deleteTourType,

    createTour,
    getAllTours,
    updateTour,
    deleteTour
}
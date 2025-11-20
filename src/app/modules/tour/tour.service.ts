import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface"
import { Tour, TourType } from "./tour.model"
import { QueryBuilder } from "../../utils/QueryBuilder";


/* ------------------ TOUR SERVICE -------------------- */

const createTour = async(payload: ITour) => {
    const existingtour = await Tour.findOne({title: payload.title});
    if(existingtour){
        throw new Error("Tour already exist")
    }

    // const baseSlug = payload.title.toLocaleLowerCase().split(" ").join("-");
    // let slug = `${baseSlug}-tour`

    // let counter = 0
    // while(await Tour.exists({slug})){
    //     slug = `${slug}-${counter++}`
    // }

    // payload.slug = slug

   const createdTour = await Tour.create(payload);
    return createdTour;
}

// const getAllTours = async(query: Record<string, string>) => {
//     const filter = query;
//     const searchTerm = query.searchTerm || "";
//     const sort = query.sort || "createdAt";
//     const fields = query.fields?.split(",").join(" ") || "";
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit

//     // delete filter["searchTerm"]
//     // delete filter["sort"];

//     for(const field of excludeField){
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete filter[field]
//     }    


//     const searchArray = tourSearchableFields.map(field => ({[field]: {$regex: searchTerm, $options: "i"}}))
//     const searchQuery = {$or: searchArray}
    
//     // const getTour = await Tour.find(searchQuery).find(filter).sort(sort).select(fields).skip(skip).limit(limit);
//     const filterQuery = Tour.find(filter)
//     const tours = filterQuery.find(searchQuery)
//     const getTour = await tours.sort(sort).select(fields).skip(skip).limit(limit);



//     const totalTours = await Tour.countDocuments()
//     const totalPage = Math.ceil(totalTours / limit)

//     const meta = {
//         page: page,
//         limit: limit,
//         total: totalTours,
//         totalPage: totalPage,
//     }

//         return {
//         data: getTour,
//         meta
//         }
    
//     }



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

    // if(payload.title){
    //     const baseSlug = payload.title.toLowerCase().split(" ").join("-");
    //     let slug = `${baseSlug}-dividion`
                                                                                             
    //     let counter = 0
    //     while(await Tour.exists({slug})){
    //     slug = `${slug}-${counter++}` 
    //     }

    //     payload.slug = slug;
    // }

    const updatedTour = await Tour.findByIdAndUpdate(id, payload, {new: true, runValidators: true});
    return updatedTour
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
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";


const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params:{
        public_id: (req, file) =>{
            const fileName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, "-") // emplty space remove with hyphen
            .replace(/\./g, "-") // dot(.) replace with hyphen
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-\.]/g, ""); // special character remove

            const extension = file.originalname.split(".").pop();
            const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName + "." + extension;

            return uniqueFileName;
        } 
    }
})


export const multerUpload = multer({storage: storage})
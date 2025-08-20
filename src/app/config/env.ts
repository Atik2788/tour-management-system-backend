import dotenv from "dotenv";

dotenv.config();

export interface EnvConfig{
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production";
}


const loadEventVariables = () : EnvConfig => {

    const requiredEnvVariables: string[] = ["PORT", "DB_URL", "NODE_ENV"];  

    requiredEnvVariables.forEach((key) => {
        if(!process.env[key]) {
            throw new Error(`Environment variable ${key} is not defined`);
        }
    })


    return {
    PORT: process.env.PORT as string,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    DB_URL: process.env.DB_URL!,
    NODE_ENV: process.env.NODE_ENV as "development" | "production"
}
}



export const envVars: EnvConfig = loadEventVariables();
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/Handlers/asyncHandler";
import ApiError from "../../utils/Handlers/apiError";
import ApiResponse from "../../utils/Handlers/apiResponse";
import prisma from "../../cofig/db.config";
import s3Client from "../../cofig/s3.config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {z} from "zod";
import { randomUUID } from "crypto";

//presign zod schema
const presignSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
});

const addDocumentSchema=z.object({
    s3Key:z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    mimeType: z.string(),
    type: z.enum(["tenthCertificate", "twelthCertificate", "recentMarksheet", "identityCard", "certification", "other"]),

})



//Getting a presigned url from aws-s3 bucket
// api/v1/documents/presign
// Access- Student (privet)

export const getPresignedUrl=asyncHandler(async(req:Request,res:Response)=>{
    const studentId=req.user!.id;

    //validating the incomming req body
    const validation=presignSchema.safeParse(req.body);

    if(!validation.success){
        throw new ApiError("validation", "Validation failed", validation.error.flatten().fieldErrors, 422);
    }

    const {fileName,fileType}=validation.data;

    const uniqueKey=`documents/${studentId}/${randomUUID()}-${fileName}`;

    const command= new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!, 
        Key: uniqueKey,
        ContentType: fileType, 
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const responseData = {
        uploadUrl: uploadUrl,
        key: uniqueKey, // The client needs this key to confirm the upload later
    };

    const response = ApiResponse.success(responseData, { message: "Presigned URL generated successfully" });
    return res.status(response.statusCode).json(response.body);
    
});

export const addDocumentMetadata=asyncHandler(async(req:Request,res:Response)=>{
    const studentId=req.user!.id;

    const validation=addDocumentSchema.safeParse(req.body);

    if(!validation.success){
        throw new ApiError("validation", "Validation failed", validation.error.flatten().fieldErrors, 422);
    }

    //Student->Documents .... Document -> Document []
    const documentData={
        type:validation.data.type,
        url: validation.data.s3Key, 
        fileName: validation.data.fileName,
        fileSize: validation.data.fileSize,
        mimeType: validation.data.mimeType,

    }

    const studentDocuments = await prisma.documents.upsert({
        where: { studentId: studentId },
        update: {
            documents: {
                push: documentData,
            },
        },
        create: {
            studentId: studentId,
            documents: [documentData],
        },
    })

    const response = ApiResponse.success(studentDocuments, { message: "Document metadata saved successfully" }, 201);
    return res.status(response.statusCode).json(response.body);
})


import { CreateSubjectRequest, CreateSubjectResponse } from "@/types/subject/CreateSubject";
import { AxiosResponse } from "axios";

export const createSubject  = async( data: CreateSubjectRequest): Promise<AxiosResponse<CreateSubjectResponse>> => {}
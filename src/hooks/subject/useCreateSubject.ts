import { SUBJECT_DESCRIPTION_MAX_LENGTH_ERROR, SUBJECT_TITLE_EMPTY, SUBJECT_TITLE_ERROR } from "@/constants/error/errorMessages";
import { FormEvent, useState } from "react"

export const useCreateSubject = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const validateTitle = (): boolean => {
        if(title.trim() === "") {
            setErrorMessage(SUBJECT_TITLE_EMPTY)
            return false
        }

        if(title.trim().length < 3 || title.trim().length > 50) {
            setErrorMessage(SUBJECT_TITLE_ERROR)
            return false
        }
         return true
    } 

    const validateDescription = (): boolean => {
        if(description.trim() !== "" && description.trim().length > 2000) {
            setErrorMessage(SUBJECT_DESCRIPTION_MAX_LENGTH_ERROR)
            return false
        }
        return true
    }

    const isFormValid = (): boolean => {
        return validateTitle() && validateDescription()
    };

    const handleSubmit = async(e: FormEvent) => {
        e.preventDefault();
        setErrorMessage("")
        if (!isFormValid()) return
    }


    return {title, description, errorMessage, setErrorMessage, setTitle, setDescription, handleSubmit, isFormValid}
}
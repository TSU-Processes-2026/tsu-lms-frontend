import { FormEvent, useState } from "react"

export const useCreateSubject = () => {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isError, setIsError] = useState<boolean>(false)

    const handleSubmit = async(e: FormEvent) => {}

    const isFormValid = (): boolean => { return false}

    return {title, description, isError, errorMessage, setErrorMessage, setTitle, setDescription, handleSubmit, isFormValid}
}
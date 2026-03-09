import { act, renderHook } from "@testing-library/react";
import { useCreateSubject } from "./useCreateSubject";
import { SUBJECT_TITLE_EMPTY, SUBJECT_TITLE_ERROR } from "@/constants/error/errorMessages";

const mockEvent = {
  preventDefault: jest.fn(),
} as unknown as React.FormEvent;

describe("useCreateSubject: Валидация данных", () => {
    const getMockedHook = () => {
        const { result } = renderHook(() => useCreateSubject())
        return result.current
    }
    test("Поля формы должны инициализироваться пустыми значениями", () => {
        const hook = getMockedHook()

        expect(hook.title).toBe("")
        expect(hook.description).toBe("")
    })
    test("При пустом значении названия возвращается сообщение с ошибкой", async() => {
        const hook = getMockedHook()
        
        await act(async() => {
            await hook.handleSubmit(mockEvent)
        })

        expect(hook.errorMessage).toEqual(SUBJECT_TITLE_EMPTY)
    })
    test("При длине названия менее 3 символов возвращается сообщение с ошибкой", async() => {
        const hook = getMockedHook()
        
        act(() => {
            hook.setTitle("te")
        })

        await act(async() => {
            await hook.handleSubmit(mockEvent)
        })

        expect(hook.errorMessage).toEqual(SUBJECT_TITLE_ERROR)
    })

    test("При длине названия в 3 символа сообщение с ошибкой пустое", async() => {
        const hook = getMockedHook()
        act(() => {
            hook.setTitle("tes")
        })
        await act(async() => {
            await hook.handleSubmit(mockEvent)
        })

        expect(hook.errorMessage).toEqual("")
    })

    test("При длине названия более 50 символов возвращается сообщение с ошибкой", async() => {
        const hook = getMockedHook()
        
        act(() => {
            hook.setTitle("123456789123456789123456789123456789123456789123456789123456789")
        })

        await act(async() => {
            await hook.handleSubmit(mockEvent)
        })
        expect(hook.errorMessage).toEqual(SUBJECT_TITLE_ERROR)
    })

    test("При длине названия в 50 символов сообщение с ошибкой пустое", async() => {
        const hook = getMockedHook()

        act(() => {
            hook.setTitle("12345678901234567890123456789012345678901234567890")
        })
        await act(async() => {
            await hook.handleSubmit(mockEvent)
        })

        expect(hook.errorMessage).toEqual("")
    })
})
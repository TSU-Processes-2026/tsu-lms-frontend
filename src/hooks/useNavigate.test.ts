import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "./useNavigate";

describe("useNavigate tests", () => {
  test("Должен перенаправлять пользователя по указанному URL", () => {
    const URL = "/source";
    const { result } = renderHook(() => useNavigate(URL));

    act(() => {
      result.current.navigate();
    });

    expect(window.location.href).toBe(URL);
  });

  test("Должен перенаправлять пользователя на корневую страницу, если не передан URL", () => {
    const { result } = renderHook(() => useNavigate());

    act(() => {
      result.current.navigate();
    });

    expect(window.location.href).toBe("/");
  });
});

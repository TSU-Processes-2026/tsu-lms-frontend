export const useNavigate = (path: string = "/") => {
  const navigate = (navTo: string = path) => {
    window.location.href = navTo;
  };

  return { navigate };
};

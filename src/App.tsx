import { RouterProvider } from "react-router-dom";
import { JSX } from "react";
import { router } from "./router/router";

/**
 * Main application component. Sets up the router using the router instance from './router/router'.
 * @returns {JSX.Element} The root element of the application with routing enabled.
 */
function App(): JSX.Element {
  return (
    <RouterProvider router={ router } />
  );
}

export default App;

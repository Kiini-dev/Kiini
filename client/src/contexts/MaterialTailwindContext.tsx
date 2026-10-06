import React, { createContext, useContext, useReducer, ReactNode } from "react";

export type SidenavType = "dark" | "white" | "transparent";
export type SidenavColor = 
  | "blue" | "red" | "green" | "orange" | "purple" | "pink" | "teal" | "cyan" | "indigo";

interface ControllerState {
  openSidenav: boolean;
  openRightSidebar: boolean;
  sidenavType: SidenavType;
  sidenavColor: SidenavColor;
  transparentNavbar: boolean;
  fixedNavbar: boolean;
  openConfigurator: boolean;
}

type ActionType =
  | { type: "OPEN_SIDENAV"; value: boolean }
  | { type: "OPEN_RIGHT_SIDEBAR"; value: boolean }
  | { type: "SIDENAV_TYPE"; value: SidenavType }
  | { type: "SIDENAV_COLOR"; value: SidenavColor }
  | { type: "TRANSPARENT_NAVBAR"; value: boolean }
  | { type: "FIXED_NAVBAR"; value: boolean }
  | { type: "OPEN_CONFIGURATOR"; value: boolean };

const MaterialTailwindContext = createContext<
  [ControllerState, React.Dispatch<ActionType>] | null
>(null);

function reducer(state: ControllerState, action: ActionType): ControllerState {
  switch (action.type) {
    case "OPEN_SIDENAV":
      return { ...state, openSidenav: action.value };
    case "OPEN_RIGHT_SIDEBAR":
      return { ...state, openRightSidebar: action.value };
    case "SIDENAV_TYPE":
      return { ...state, sidenavType: action.value };
    case "SIDENAV_COLOR":
      return { ...state, sidenavColor: action.value };
    case "TRANSPARENT_NAVBAR":
      return { ...state, transparentNavbar: action.value };
    case "FIXED_NAVBAR":
      return { ...state, fixedNavbar: action.value };
    case "OPEN_CONFIGURATOR":
      return { ...state, openConfigurator: action.value };
    default:
      return state;
  }
}

interface MaterialTailwindControllerProviderProps {
  children: ReactNode;
}

export function MaterialTailwindControllerProvider({
  children,
}: MaterialTailwindControllerProviderProps) {
  const initialState: ControllerState = {
    openSidenav: false,
    openRightSidebar: false,
    sidenavType: "white",
    sidenavColor: "blue",
    transparentNavbar: true,
    fixedNavbar: false,
    openConfigurator: false,
  };

  const [controller, dispatch] = useReducer(reducer, initialState);

  return (
    <MaterialTailwindContext.Provider value={[controller, dispatch]}>
      {children}
    </MaterialTailwindContext.Provider>
  );
}

export function useMaterialTailwindController() {
  const context = useContext(MaterialTailwindContext);

  if (!context) {
    throw new Error(
      "useMaterialTailwindController must be used within MaterialTailwindControllerProvider"
    );
  }

  return context;
}

// Action creators
export const setOpenSidenav = (dispatch: React.Dispatch<ActionType>, value: boolean) =>
  dispatch({ type: "OPEN_SIDENAV", value });

export const setOpenRightSidebar = (dispatch: React.Dispatch<ActionType>, value: boolean) =>
  dispatch({ type: "OPEN_RIGHT_SIDEBAR", value });

export const setSidenavType = (dispatch: React.Dispatch<ActionType>, value: SidenavType) =>
  dispatch({ type: "SIDENAV_TYPE", value });

export const setSidenavColor = (dispatch: React.Dispatch<ActionType>, value: SidenavColor) =>
  dispatch({ type: "SIDENAV_COLOR", value });

export const setTransparentNavbar = (dispatch: React.Dispatch<ActionType>, value: boolean) =>
  dispatch({ type: "TRANSPARENT_NAVBAR", value });

export const setFixedNavbar = (dispatch: React.Dispatch<ActionType>, value: boolean) =>
  dispatch({ type: "FIXED_NAVBAR", value });

export const setOpenConfigurator = (dispatch: React.Dispatch<ActionType>, value: boolean) =>
  dispatch({ type: "OPEN_CONFIGURATOR", value });


import { useContext } from "react";
import { TutorContext } from "./TutorContext"; // caminho pode variar

export const useTutorContext = () => {
    const context = useContext(TutorContext);
    if (!context) {
        throw new Error("useTutorContext deve ser usado dentro de um TutorProvider");
    }
    return context;
};

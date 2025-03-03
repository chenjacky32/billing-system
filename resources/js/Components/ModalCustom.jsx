import React from "react";
import { Dialog } from "@material-tailwind/react";
export default function ModalCustom({ children, isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <Dialog
            size="lg"
            open={isOpen}
            handler={onClose}
            overlay="blur"
            className="p-4 "
            animate={{
                mount: {
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    transition: { type: "spring" },
                },
                unmount: {
                    scale: 0.9,
                    y: -100,
                    opacity: 0,
                    transition: { type: "spring" },
                },
            }}
        >
            {children}
        </Dialog>
    );
}

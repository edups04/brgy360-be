    import React from "react";

    interface LightboxProps {
    isOpen: boolean;
    imageUrl: string;
    title?: string;
    date?: string;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    }

    const Lightbox: React.FC<LightboxProps> = ({
    isOpen,
    imageUrl,
    title,
    date,
    onClose,
    onPrev,
    onNext,
    }) => {
    if (!isOpen) return null;

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        onClick={onClose}
        >
        <button
            onClick={(e) => {
            e.stopPropagation();
            onClose();
            }}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full"
        >
            ✕
        </button>

        <button
            onClick={(e) => {
            e.stopPropagation();
            onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full"
        >
            ‹
        </button>

        <button
            onClick={(e) => {
            e.stopPropagation();
            onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full"
        >
            ›
        </button>

        <img
            src={imageUrl}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
        />

        <div className="absolute bottom-10 text-center text-white">
            <p className="text-lg font-semibold">{title}</p>
            {date && <p className="text-sm">{date}</p>}
        </div>
        </div>
    );
    };

    export default Lightbox;

"use client";

import Image from "next/image";
import { memo } from "react";

interface CardProps {
    imageUrl: string;
    alt?: string;
    className?: string;
}

function Card({ imageUrl, alt = "Product image", className = "" }: CardProps) {
    return (
        <div className={`w-full h-[100px] flex items-center justify-center ${className}`}>
            <div className="w-[80px] h-[80px] rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={alt}
                    width={80}
                    height={80}
                    className="object-contain"
                    loading="lazy"
                />
                ) : (
                <span className="text-sm bg-gray-100 text-black">Sin imagen</span>
                )}
            </div>
        </div>
    );
}

export default memo(Card);
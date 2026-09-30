"use client";

import {
    FaFacebookF,
    FaStar,
    FaTwitter,
    FaTelegram,
    FaLinkedinIn,
    FaPinterest,
} from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { TbSwitch3 } from "react-icons/tb";
import { FaRegStar } from "react-icons/fa6";
import Link from "next/link";
import { useState } from "react";
import AddToBasket from "@/components/modules/main/addToBasket";
import AddToFavoriteList from "@/components/modules/main/addToFavorite";

const Details = ({
    product,
    productComments,
    selectedVariant,
    onVariantChange,
}) => {
    const variants = product.variants || [];

    const attributes = [
        ...new Set(
            variants.flatMap((variant) =>
                Object.keys(variant?.attributes || {})
            )
        ),
    ];

    const [selectedAttributes, setSelectedAttributes] =
        useState(
            selectedVariant?.attributes || {}
        );

    const handleAttributeChange = (attribute, value) => {
        const newSelection = {
            ...selectedAttributes,
            [attribute]: value,
        };

        setSelectedAttributes(newSelection);

        const matchedVariant = variants.find((variant) =>
            Object.entries(newSelection).every(
                ([key, selectedValue]) =>
                    String(
                        variant?.attributes?.[key]
                    ) === String(selectedValue)
            )
        );

        if (matchedVariant) {
            onVariantChange(matchedVariant);
        }
    };

    return (
        <main className="w-full md:w-[63%]">
            <h2 className="text-xl sm:text-2xl">
                {product.name}
            </h2>

            {/* Rating */}
            <div className="mt-8 flex items-center gap-1">
                <p>Comments ({productComments})</p>

                {[...Array(5)].map((_, index) =>
                    index < product.score ? (
                        <FaStar
                            key={index}
                            className="text-xl text-coral-300"
                        />
                    ) : (
                        <FaRegStar
                            key={index}
                            className="text-xl text-coral-300"
                        />
                    )
                )}
            </div>

            {/* Price */}
            <p className="my-6 font-shabnam-bold text-2xl text-sage-400">
                {selectedVariant?.price ?? product.price} $
            </p>

            {/* Description */}
            <span className="block w-full text-[15px] text-[rgb(160,151,151)] sm:w-[93%]">
                {product.shortDescription}
            </span>

            <hr className="my-5" />

            {/* Availability */}
            <div className="mb-12 flex items-center gap-1.5">
                <IoCheckmark className="text-2xl" />

                <p>
                    {selectedVariant?.stock > 0
                        ? "Available"
                        : "Unavailable"}
                </p>
            </div>

            {/* Variant selection */}
            {attributes.length > 0 && (
                <div className="mb-8 flex flex-col gap-5">
                    <strong>AVAILABLE OPTIONS:</strong>

                    {attributes.map((attribute) => {
                        const values = [
                            ...new Set(
                                variants
                                    .map(
                                        (variant) =>
                                            variant?.attributes?.[
                                                attribute
                                            ]
                                    )
                                    .filter(
                                        (value) =>
                                            value !== undefined &&
                                            value !== null &&
                                            value !== ""
                                    )
                                    .map(String)
                            ),
                        ];

                        return (
                            <div
                                key={attribute}
                                className="flex flex-col gap-2"
                            >
                                <span className="font-semibold capitalize">
                                    {attribute}:
                                </span>

                                <div className="flex flex-wrap gap-2">
                                    {values.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                handleAttributeChange(
                                                    attribute,
                                                    value
                                                )
                                            }
                                            className={`rounded border px-3 py-1 text-sm ${
                                                String(
                                                    selectedAttributes?.[
                                                        attribute
                                                    ]
                                                ) === String(value)
                                                    ? "border-sage-400 bg-sage-400 text-white"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add to basket */}
            <AddToBasket
                name={product.name}
                price={
                    selectedVariant?.price ?? product.price
                }
                img={product.images?.[0] || ""}
                id={product._id}
            />

            {/* Favorite + Compare */}
            <section className="mb-8 mt-6 flex flex-wrap gap-5">
                <AddToFavoriteList
                    productId={product._id}
                />

                <div className="flex items-center gap-1">
                    <TbSwitch3 className="text-xl text-sage-400" />

                    <Link
                        href="/"
                        className="text-sm transition-all hover:cursor-pointer hover:text-gray-700"
                    >
                        Compare
                    </Link>
                </div>
            </section>

            <hr className="my-5" />

            {/* Product information */}
            <div className="mt-8 flex flex-col gap-5">
                <strong>
                    Product ID: {product._id}
                </strong>

                <p>
                    <strong>TAGS:</strong>{" "}
                    {product.tags?.length
                        ? product.tags.join(", ")
                        : "No tags"}
                </p>

                {selectedVariant && (
                    <div>
                        <strong className="mb-3 block">
                            SELECTED VARIANT:
                        </strong>

                        <div className="flex flex-col gap-2 text-sm">
                            {Object.entries(
                                selectedVariant.attributes || {}
                            ).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex gap-2"
                                >
                                    <span className="font-semibold capitalize">
                                        {key}:
                                    </span>

                                    <span>
                                        {String(value)}
                                    </span>
                                </div>
                            ))}

                            <div className="flex gap-2">
                                <span className="font-semibold">
                                    Price:
                                </span>

                                <span>
                                    {selectedVariant.price} $
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <span className="font-semibold">
                                    Stock:
                                </span>

                                <span>
                                    {selectedVariant.stock}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center gap-2 text-sage-400">
                <p className="text-text dark:text-gray-100">
                    Share:
                </p>

                <Link href="/">
                    <FaTelegram className="text-lg" />
                </Link>

                <Link href="/">
                    <FaLinkedinIn className="text-lg" />
                </Link>

                <Link href="/">
                    <FaPinterest className="text-lg" />
                </Link>

                <Link href="/">
                    <FaTwitter className="text-lg" />
                </Link>

                <Link href="/">
                    <FaFacebookF className="text-lg" />
                </Link>
            </div>

            <hr className="my-5" />
        </main>
    );
};

export default Details;

const MoreInfoes = ({ variant }) => {
    const attributes = variant?.attributes || {};

    return (
        <div>
            <p>More Information :</p>

            <hr className="my-4" />
            <main className="flex flex-col gap-3">
                {Object.entries(attributes).map(
                    ([key, value]) => (
                        <div
                            key={key}
                            className="flex justify-between gap-4"
                        >
                            <p className="capitalize">
                                {key}
                            </p>

                            <p>
                                {String(value)}
                            </p>
                        </div>
                    )
                )}

                {variant?.price !== undefined && (
                    <div className="flex justify-between">
                        <p>Price</p>
                        <p>{variant.price} $</p>
                    </div>
                )}

                {variant?.stock !== undefined && (
                    <div className="flex justify-between">
                        <p>Stock</p>
                        <p>{variant.stock}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MoreInfoes;

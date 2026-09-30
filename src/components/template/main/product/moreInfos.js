const MoreInfoes = ({ specs = {} }) => {
    const entries = Object.entries(specs).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
    );

    if (!entries.length) {
        return (
            <p className="text-gray-500 dark:text-gray-400">
                No additional information available.
            </p>
        );
    }

    return (
        <dl className="mx-auto max-w-xl divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 dark:divide-white/10 dark:border-white/10">
            {entries.map(([key, value], index) => (
                <div
                    key={key}
                    className={`flex justify-between gap-4 px-4 py-3 text-sm sm:text-base ${
                        index % 2 === 0 ? "bg-gray-50 dark:bg-white/5" : ""
                    }`}
                >
                    <dt className="font-medium capitalize text-gray-600 dark:text-gray-300">
                        {key}
                    </dt>
                    <dd className="text-right">{String(value)}</dd>
                </div>
            ))}
        </dl>
    );
};

export default MoreInfoes;
// Title row at the top of every panel page
export default function PageHeader({ title, description, actions }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
                {description && <p className="mt-1 text-sm text-gray-700 dark:text-gray-500">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

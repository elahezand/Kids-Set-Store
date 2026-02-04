export default function RouteSkeleton() {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}

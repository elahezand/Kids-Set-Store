"use client"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import styles from "./map.module.css"

export default function Map() {
    const position = [51.505, -0.09]
    return (
        <MapContainer
            className={styles.map}
            center={position} zoom={20} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; 
                <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    SET-KIDS
                </Popup>
            </Marker>
        </MapContainer>
    )
}

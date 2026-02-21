import React from "react";

const MoreInfoes = ({ color, material, availableSizes }) => {
  return (
    <div>
      <p> More Informatiom :</p>
      <hr />
      <main>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Color</p>
          <p>{color}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>availableSizes</p>
          {availableSizes?.map((size, index) => <p key={index}>{size}</p>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Material</p>
          <p>{material}</p>
        </div>
      </main>
    </div>
  );
};

export default MoreInfoes;

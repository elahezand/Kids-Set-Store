import React from "react";

const MoreInfoes = ({ product }) => {
  return (
    <div>
      <p> More Informatiom :</p>
      <hr />
      <main>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Color</p>
          <p>{product.color}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>SuitableFor</p>
          <p>{product.suitableFor}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Size</p>
          <p>{product.size}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Material</p>
          <p>{product.material}</p>
        </div>
      </main>
    </div>
  );
};

export default MoreInfoes;

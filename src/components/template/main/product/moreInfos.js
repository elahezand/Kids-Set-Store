const MoreInfoes = ({ color, material, availableSizes }) => {
  return (
    <div>
      <p>More Informatiom :</p>
      <hr className="my-4" />
      <main className="flex flex-col gap-3">
        <div className="flex justify-between">
          <p>Color</p>
          <p>{color}</p>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <p>availableSizes</p>
          {availableSizes?.map((size, index) => <p key={index}>{size}</p>)}
        </div>
        <div className="flex justify-between">
          <p>Material</p>
          <p>{material}</p>
        </div>
      </main>
    </div>
  );
};

export default MoreInfoes;

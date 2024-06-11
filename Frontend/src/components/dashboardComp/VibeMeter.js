import bulb from "../images/bulb.png";
const VibeMeter = ({ vibeScore }) => {
  return (
    <div className="card vibeMeter">
      <div className="card-body">
        <div className="row chart-res text-center justify-content-center">
          <div className="col-lg-12 col-md-10 col-sm-10">
            <span className="sentiment fs-5 fw-bolder vibeMeter-t">
              The Vibe Meter
            </span>
          </div>
          <div>
            <span className="vibe-t fs-6 text-nowrap p-0">
              Your Customer's Mood So Far
            </span>
          </div>
          <div className="vibe-img mt-3">
            <img src={bulb} />
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-sm btn-white w-100 fw-bold"
            >
              Vibe Score: {vibeScore}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeMeter;

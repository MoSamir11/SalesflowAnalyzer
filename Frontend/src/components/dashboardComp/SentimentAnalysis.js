const SentimentAnalysis = () => {
  return (
    <div className="card chart">
      <div className="card-body p-4 pt-3">
        <div className="row chart-res">
          <div className="col-lg-12 col-md-10 col-sm-10 pt-1">
            <span className="sentiment fs-5 fw-bold customer-vibe">
              Sentiment Analysis
            </span>
          </div>
        </div>
        <div className="chart-res d-flex justify-content-center align-items-center pt-2">
          <canvas
            id="sentiment-chart"
            aria-label="chart"
            height="294"
            width="400"
            data-labels="Positive, Negative, Neutral"
            data-data="20, 40, 22"
            data-bg-color="#b597f0"
            data-point-bg-color="#b597f0"
            data-border-color="black"
            data-border-width="1"
            data-point-radius="2"
            data-line-width="3"
            data-responsive="false"
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;

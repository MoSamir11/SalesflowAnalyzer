import React from "react";
import Charts from "react-apexcharts";
const ChartComponent = ({chartState, selected}) => {
  return (
    <div className="accordian">
      <div className={!selected ? "content show" : "content"}>
        <div className="col-lg-12 col-md-12 col-sm-12 col-sm-12">
          <div className="card ">
            <div className="card-body p-3">
              <p>Sentiment and Emotion Trend Analysis.</p>

              <Charts
                options={chartState.options}
                series={chartState.series}
                type="line"
                style={{ width: "80%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
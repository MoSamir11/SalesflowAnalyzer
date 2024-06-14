import React from "react";
const ExpressionAnalysis = () => {
    return (
      <div className="card chart">
        <div className="card-body p-4 pt-3">
          <div className="row chart-res">
            <div className="col-lg-12 col-md-10 col-sm-10 pt-1">
              <span className="sentiment fs-3 fw-bold customer-emo">
                {" "}
                Expression Analysis
              </span>
            </div>
          </div>
  
          <div className="skill-bars pt-2">
            <div
              className="bar"
              data-label="Happy"
              data-value="70"
              data-color="#712cf9"
              id="happy"
            ></div>
            <div
              className="bar"
              data-label="Sad"
              data-value="30"
              data-color="#FFA500"
              id="sad"
            ></div>
            <div
              className="bar"
              data-label="Neutral"
              data-value="50"
              data-color="#712cf9"
              id="disgusted"
            ></div>
            <div
              className="bar"
              data-label="Content"
              data-value="25"
              data-color="#FFA500"
              id="neutral"
            ></div>
            <div
              className="bar"
              data-label="Angry"
              data-value="10"
              data-color="#cc1717"
              id="angry"
            ></div>
            <div
              className="bar"
              data-label="Surprised"
              data-value="10"
              data-color="#712cf9"
              id="surprised"
            ></div>
            <div
              className="bar"
              data-label="Fearful"
              data-value="30"
              data-color="#FFA500"
              id="fearful"
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ExpressionAnalysis;
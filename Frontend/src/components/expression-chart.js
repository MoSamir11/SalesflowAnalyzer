export const ExpressionChart = (props) => {
  // console.log('2-->',props);
  return (
    <div className="col-lg-6 col-md-12 col-sm-12 pb-res">
      <div className="card chart">
        <div className="card-body p-4 pt-3">
          <div className="row chart-res">
            <div className="col-lg-12 col-md-10 col-sm-10 pt-1">
              <span className="sentiment fs-3 fw-bold customer-emo">
                {" "}
                {props.title}
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
          {/* {props.expressionNumber && props.expressionNumber.length ? (
            props.expressionNumber((data) => {
              return (
                <>
                  <div className="skill-bars pt-2">
                    <div className="bar" data-label="Happy" data-value="70" data-color="#712cf9" id="happy">
                      <div className="progress-line">
                        <span style={{   width: data["Happy"],   background: "#712cf9", }}></span>
                      </div>
                      <div className="info">
                        <span>Happy</span>
                      </div>
                      <div className="value-display">{data["Happy"]}</div>
                    </div>
                    <div className="bar" data-label="Sad" data-value="30" data-color="#FFA500" id="sad">
                      <div className="progress-line">
                        <span style={{ width: data["Sad"], background: "#FFA500" }}></span>
                      </div>
                      <div className="info">
                        <span>Sad</span>
                      </div>
                      <div className="value-display">{data["Sad"]}</div>
                    </div>
                    <div className="bar" data-label="Neutral" data-value="50" data-color="#712cf9" id="disgusted">
                      <div className="progress-line">
                        <span style={{   width: data["Neutral"],   background: "#712cf9", }}></span>
                      </div>
                      <div className="info">
                        <span>Neutral</span>
                      </div>
                      <div className="value-display">{data["Neutral"]}</div>
                    </div>
                    <div className="bar" data-label="Disgusted" data-value="25" data-color="#FFA500" id="neutral">
                      <div className="progress-line">
                        <span style={{   width: data["Disgusted"],   background: "#FFA500", }}></span>
                      </div>
                      <div className="info">
                        <span>Disgusted</span>
                      </div>
                      <div className="value-display">{data["Disgusted"]}</div>
                    </div>
                    <div className="bar" data-label="Angry" data-value="10" data-color="#cc1717" id="angry">
                    <div className="progress-line">
                        <span style={{   width: data["Angry"],   background: "#cc1717", }}></span>
                      </div>
                      <div className="info">
                        <span>Angry</span>
                      </div>
                      <div className="value-display">{data["Angry"]}</div>
                    </div>
                    <div className="bar" data-label="Surprised" data-value="10" data-color="#712cf9" id="surprised">
                    <div className="progress-line">
                        <span style={{   width: data["Surprised"],   background: "#712cf9", }}></span>
                      </div>
                      <div className="info">
                        <span>Surprised</span>
                      </div>
                      <div className="value-display">{data["Surprised"]}</div>
                    </div>
                    <div className="bar" data-label="Fearful" data-value="30" data-color="#FFA500" id="fearful">
                    <div className="progress-line">
                        <span style={{   width: data["Fearful"],   background: "#FFA500", }}></span>
                      </div>
                      <div className="info">
                        <span>Fearful</span>
                      </div>
                      <div className="value-display">{data["Fearful"]}</div>
                    </div>
                  </div>
                </>
              );
            })
          ) : (
            <div></div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export const SentimentGraph = (props) => {
  return (
    <div className="col-lg-6 col-md-12 col-sm-12 col-sm-12" style={{ paddingLeft: "10px" }}>
      <div className="card chart">
        <div className="card-body p-4 pt-3">
          <div className="row chart-res">
            <div className="col-lg-12 col-md-10 col-sm-10 pt-1">
              <span className="sentiment fs-5 fw-bold customer-vibe">
                {props.title}
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
    </div>
  );
};

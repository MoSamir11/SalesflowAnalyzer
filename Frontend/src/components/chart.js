import Charts from "react-apexcharts";
import { ExpressionChart, SentimentGraph } from "./expression-chart";

export const ChartComp = (props) => {
  return (
    // <div className="wrapper-accordian">
    //                   <div className="accordian">
    //                     <div
    //                       className={!props.selected ? "content show" : "content"}
    //                     >
    //                       <div className="col-lg-12 col-md-12 col-sm-12 col-sm-12">
    //                         <div
    //                           className="card "

    //                         >
    //                           <div className="card-body p-3">
    //                             <p>Sentiment and Emotion Trend Analysis.</p>

    //                             <ExpressionChart/>
    //                 <SentimentGraph />
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    <>
    <div className="col-lg-6 col-md-12 col-sm-12 pb-res">
      <div className="card chart">
        <div className="card-body p-4 pt-3">
          <div className="row chart-res">
            <div className="col-lg-12 col-md-10 col-sm-10 p-1">
              <span className="sentiment fs-3 fw-bold customer-emo">
                {" "}
                Expression Graph
              </span>
            </div>
          </div>
          <div className="skill-bars pt-2">
          <Charts
            options={props.expressionChart.options}
            series={props.expressionChart.series}
            type="line"
            width="350"
          />
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
    <div className="col-lg-6 col-md-12 col-sm-12 pb-res">
      <div className="card chart">
        <div className="card-body pl-4 pt-3">
          <div className="row chart-res">
            <div className="col-lg-12 col-md-10 col-sm-10 p-1">
              <span className="sentiment fs-3 fw-bold customer-emo">
                {" "}
                Sentiment Graph
              </span>
            </div>
          </div>
          <div className="skill-bars pt-2">
          <Charts options={props.sentimentChart.options} series={props.sentimentChart.series} type="line" width="350"
          />
          </div>
          
        </div>
      </div>
    </div>
    </>
  );
};

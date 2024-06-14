
import Charts from "react-apexcharts";

export const ChartComp = (props) =>{
    return(
        <div className="wrapper-accordian">
                          <div className="accordian">
                            <div
                              className={!props.selected ? "content show" : "content"}
                            >
                              <div className="col-lg-12 col-md-12 col-sm-12 col-sm-12">
                                <div
                                  className="card "
                                  
                                >
                                  <div className="card-body p-3">
                                    <p>Sentiment and Emotion Trend Analysis.</p>

                                    <Charts
                                      options={props.chartState.options}
                                      series={props.chartState.series}
                                      type="line"
                                      style={{ width: "80%" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
    )
}
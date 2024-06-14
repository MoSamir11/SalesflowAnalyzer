import React from "react";

const PitchSummaryInfoModal = ({callOpenAI, pitchInfo}) => {
  return (
    <>
      <div className="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header px-4">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="px-4">
              <button type="button" className="btn btn-dark btn-sm p-2">
                <div
                  className="d-flex justify-content-center align-items-center"
                  onClick={() => callOpenAI()}
                >
                  <div className="circle d-flex justify-content-center align-items-center">
                    <i className="bx bx-microphone"></i>
                  </div>
                  <span className="text">Help Me Pitch!</span>
                </div>
              </button>
            </div>
            <div className="row pt-4 px-4">
              {pitchInfo.map((data, index) => {
                return (
                  <div
                    className="col-lg-12 col-md-12 col-sm-12"
                    style={{ paddingBottom: "1.5em" }}
                    key={index}
                  >
                    <div className="d-flex">
                      <div className="circleBot d-flex justify-content-center align-items-center">
                        <i className="bi bi-patch-question"></i>
                      </div>
                      <div className="d-flex gap-2 pb-2 align-items-center">
                        <span>
                          magic
                          <span
                            style={{
                              color: "#D273F2",
                              fontSize: "1rem",
                            }}
                          >
                            CX
                          </span>{" "}
                          <span className="timeBotText">
                            {data.time} <span>{data.type}</span>
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="chatBox">
                      <p className="p-text">{data.info}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PitchSummaryInfoModal;

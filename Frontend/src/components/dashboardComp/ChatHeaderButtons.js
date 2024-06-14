import React from "react";

const ChatHeaderButtons = (props) => {
  const { callOpenAI, hasAiFeature, setSelectedAIFeature, aiFeature } = props;
  return (
    <>
      <div className="d-flex gap-3 pt-2 tab-1-buttons">
        <button type="button" className="btn btn-light-grey btn-sm p-2">
          <div
            className="d-flex justify-content-center align-items-center"
            onClick={() => callOpenAI()}
          >
            <div className="circle2 d-flex justify-content-center align-items-center">
              <i className="bx bx-microphone"></i>
            </div>
            <span className="text">Help me Pitch!</span>
          </div>
        </button>
        <button type="button" className="btn btn-light-grey btn-sm p-2">
          <div className="d-flex justify-content-center align-items-center">
            <div className="circle2 d-flex justify-content-center align-items-center">
              <i className="bx bxs-file"></i>
            </div>
            <span className="text">Summarize</span>
          </div>
        </button>
        {hasAiFeature ? (
          <button
            type="button"
            onClick={() => setSelectedAIFeature("productInfo")}
            className={
              aiFeature == "productInfo"
                ? "btn btn-dark btn-sm p-2"
                : "btn btn-light-grey btn-sm p-2"
            }
          >
            <div className="d-flex justify-content-center align-items-center">
              <div className="circle3 d-flex justify-content-center align-items-center">
                <i className="bx bxs-detail"></i>
              </div>
              <span className="text">Product Info</span>
            </div>
          </button>
        ) : (
          <button type="button" className="btn btn-light-grey btn-sm p-2">
            <div className="d-flex justify-content-center align-items-center">
              <div className="circle3 d-flex justify-content-center align-items-center">
                <i className="bx bxs-detail"></i>
              </div>
              <span className="text">Product Info</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
};

export default ChatHeaderButtons;

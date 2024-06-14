import React from "react";

const ButtonControls = (props) => {
  const {
    muted,
    unmuteMySelf,
    muteMySelf,
    leaveCall,
    webCamStatus,
    toggleVideo,
    salesPerson,
    salesPersonLeave
  } = props;
  return (
    <div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
      <div className={salesPerson ? "controls" : "controls-client"}>
        {muted ? (
          <button
            className={`btn ${
              salesPerson ? "control-circle" : "control-circle-client"
            }`}
            onClick={() => unmuteMySelf()}
          >
            <i className="bi bi-mic-mute"></i>
          </button>
        ) : (
          <button
            className={`btn ${
              salesPerson ? "control-circle" : "control-circle-client"
            }`}
            onClick={() => muteMySelf()}
          >
            <i className="bi bi-mic"></i>
          </button>
        )}
        {salesPerson ? (
          <button
            className={`${
              !salesPersonLeave ? "btn control-circle-red-client" : "border-0"
            }`}
            onClick={() => leaveCall()}
            disabled={salesPersonLeave}
          >
            {!salesPersonLeave ? (
              <i class="bi bi-telephone-fill"></i>
            ) : (
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </button>
        ) : (
          <button
            className="btn control-circle-red-client"
            onClick={() => leaveCall()}
          >
            <i className="bi bi-telephone-fill"></i>
          </button>
        )}

        {webCamStatus ? (
          <button
            className={`btn ${
              salesPerson ? "control-circle" : "control-circle-client"
            }`}
            onClick={() => toggleVideo()}
          >
            <i className="bi bi-camera-video"></i>
          </button>
        ) : (
          <button
            className={`btn ${
              salesPerson ? "control-circle" : "control-circle-client"
            }`}
            onClick={() => toggleVideo()}
          >
            <i className="bi bi-camera-video-off"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default ButtonControls;

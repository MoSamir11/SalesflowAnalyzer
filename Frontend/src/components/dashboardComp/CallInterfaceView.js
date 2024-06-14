import React from "react";
import ButtonControls from "./ButtonControls";
const CallInterfaceView = (props) => {
  const {
    peers,
    muteSalesPerson,
    salespersonVideo,
    userVideo,
    webCamStatus,
    leaveCall,
    toggleVideo,
    muteMySelf,
    unmuteMySelf,
    muted,
    videoRef,
    mutePerson,
    OtherPeers,
  } = props;
  return (
    <main className="content-client  px-3 py-2">
      <div className="container-fluid">
        <div className="row mt-3 ">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="row pt-3">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <div className="card">
                  <div className="client-video-container">
                    {peers.map((peer, index) => {
                      return (
                        <video
                          key={peer.peerID}
                          playsInline
                          muted={muteSalesPerson}
                          ref={salespersonVideo}
                          autoPlay
                        ></video>
                      );
                    })}
                    {OtherPeers.map((peer, index) => {
                      return (
                        <video
                          key={index}
                          playsInline
                          muted={mutePerson}
                          ref={videoRef}
                          autoPlay
                        ></video>
                      );
                    })}

                    <div className="profile-overlay-client">
                      {userVideo && (
                        <video
                          playsInline
                          muted
                          ref={userVideo}
                          autoPlay
                          loop
                        ></video>
                      )}
                    </div>
                  </div>

                  <ButtonControls
                    muted={muted}
                    unmuteMySelf={unmuteMySelf}
                    muteMySelf={muteMySelf}
                    leaveCall={leaveCall}
                    webCamStatus={webCamStatus}
                    toggleVideo={toggleVideo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CallInterfaceView;

const ClientDealerView = (props) => {
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
    OtherPeers
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

                  <div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
                    <div className="controls-client">
                      {muted ? (
                        <button
                          className="btn control-circle-client"
                          onClick={() => unmuteMySelf()}
                        >
                          <i className="bi bi-mic-mute"></i>
                        </button>
                      ) : (
                        <button
                          className="btn control-circle-client"
                          onClick={() => muteMySelf()}
                        >
                          <i className="bi bi-mic"></i>
                        </button>
                      )}

                      <button
                        className="btn control-circle-red-client"
                        onClick={() => leaveCall()}
                      >
                        <i className="bi bi-telephone-fill"></i>
                      </button>
                      {webCamStatus ? (
                        <button
                          className="btn control-circle-client"
                          onClick={() => toggleVideo()}
                        >
                          <i className="bi bi-camera-video"></i>
                        </button>
                      ) : (
                        <button
                          className="btn control-circle-client"
                          onClick={() => toggleVideo()}
                        >
                          <i className="bi bi-camera-video-off"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ClientDealerView;

import React from "react";
import Avatar from "react-avatar";


const ChatHistoryModal = ({chatBoxData, getClassName}) => {
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
          <div className="modal-body px-5" id="tabbbs">
            <div className="row px-1">
              <div className="col-lg-12 col-md-12 col-sm-12">
                {chatBoxData.map((data, index) => {
                  return (
                    <div className="col-lg-12 col-md-12 col-sm-12" key={index}>
                      <div
                        className={
                          data.name == "You"
                            ? "d-flex justify-content-end position-relative"
                            : "d-flex align-items-center"
                        }
                      >
                        <div className="circleBotImg d-flex justify-content-center align-items-center"></div>
                        <div className="d-flex gap-2 pb-2 align-items-center">
                          <span className="textBot">
                            <Avatar
                              name={data.name == "You" ? "S" : data.name}
                              size={30}
                              round={true}
                            />
                            {data.name}
                          </span>
                          <span className="timeBotText">{data.time}</span>
                          <br />
                          <span className="timeBotText">{data.email}</span>
                        </div>
                      </div>
                      <div
                        className={
                          data.name == "Client"
                            ? "chatBox-1 position-relative"
                            : data.name == "You"
                            ? "chatBox-2 position-relative"
                            : "chatBox-3 position-relative"
                        }
                      >
                        <p className="p-text">{data.msg}</p>
                        <div className={getClassName(data.sentiment)}></div>
                      </div>
                      <br></br>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistoryModal;

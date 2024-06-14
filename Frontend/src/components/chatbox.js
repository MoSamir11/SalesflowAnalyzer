import Avatar from "react-avatar";

export const ChatBox = (props) => {
  return (
    <>
      {props.chatBoxData.map((data, index) => {
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
                    size={30}
                    round={true}
                    name={data.name == "You" ? "S" : data.name}
                  />{" "}
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
              <div className={props.getClassName(data.sentiment)}></div>
            </div>
            <br></br>
          </div>
        );
      })}
    </>
  );
};


export const PitchInfo =(props) =>{
    return(
        <>
            {props.pitchInfo.map((data, index) => {
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
        </>
    )
}


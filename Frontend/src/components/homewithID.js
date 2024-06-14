import React, { useEffect, useRef, useState, useCallback } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import io from "socket.io-client";
import indeximg from "./index.svg";
import $ from "jquery";
//import { useSocket } from "./context/SocketProvider";
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { v4 as uuid } from "uuid";
import { Header } from "./common_comp/header";

function HomeWithID() {
  const { id } = useParams();
  const [email, setemail] = useState("");
  const roomId = uuid();
  const [room, setRoom] = useState(id);
  const [showErr,setShowErr] = useState(false);
  //const socket = useSocket();
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  useEffect(() => {
    document.getElementById('openModal').click();
    var body = document.getElementsByTagName("body")[0];
    var script = document.createElement("script");
    script.src = "/js/script-index.js";
    body.appendChild(script);
    // $('#exampleModal').modal({ backdrop: 'static', keyboard: false });
  }, []);

  const JoinRoom = async () => {
    var room = document.getElementById("user_id").value;
    navigate(`/dashboard/${room}?email=${email}&person=Client`);
  };

  function login(){
    if(loginEmail==="" || loginPwd===""){
      setShowErr(true);
      return
    }
    document.getElementById("btn-close").click();
    if(loginEmail=="sujit_s@pursuitsoftware.biz"){
      navigate(`/dashboard/${room}?email=${loginEmail}&person=Dealer`);
      } else if(loginEmail=="magiccxsme@gmail.com"){
      navigate(`/dashboard/${room}?email=${loginEmail}&person=SalesPerson`);
      }
  }

  function joinCustomer(){
    if(loginEmail==""){
      setShowErr(true);
      return; 
    }
    document.getElementById("btn-close1").click()
    navigate(`/dashboard/${room}?email=${loginEmail}&person=Client`);
  }

  return (
    <section className="main-layout">
      
      <Header/>

      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-end px-4">
          <div className="btn-group pt-2">
            <button type="button" className="btn text-white bg-dark" id="openModal" style={{ display: "none" }} data-bs-toggle="modal" data-bs-target="#exampleModal">
              <i className="bi bi-camera-video me-2"></i>Call
            </button>
            <p type="button"
                data-bs-toggle="modal"
              data-bs-target="#exampleModal2" 
            id="openModal">
            </p>
            <p type="button"
              data-bs-toggle="modal" data-bs-target="#exampleModal2"  id="openModal1">
            </p>
          </div>
        </div>
      </div>

      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel"></h1>
              <button type="button" id="btn-close" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="text-center pb-3">
						  <h2>Login</h2>
						  </div>
              <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-keyboard-fill fs-5"></i>
                </span>
                <input type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="addon-wrapping" id="email" onChange={(e) =>{ setLoginEmail(e.target.value);setShowErr(false)}}/>
              </div>
              </div>
              <br/>
              <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-key-fill fs-5"></i>
                </span>
                <input type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="addon-wrapping" id="email" onChange={(e) =>{ setLoginPwd(e.target.value);setShowErr(false)}}/>
              </div>
              </div>
              {showErr &&<p className="text-danger">*Mandatory fields required</p>}
              <div className="row pt-5" style={{paddingLeft: '35%'}}>
                <div className="col-lg-6 col-md-6 col-sm-6 text-center">
                  <button type="button" className="btn text-white bg-success" onClick={()=>login()}>
                    Login
                  </button>
                </div>
              </div>
              <div className="row pt-2" style={{paddingLeft: '30%'}}>
                {/* <div className="col-lg-6 col-md-6 col-sm-6 text-center"> */}
                  <a href="#" onClick={()=>{
                    document.getElementById("btn-close").click();
                    document.getElementById("openModal1").click();
                  }}>Continue as a customer</a>
                {/* </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel"></h1>
              <button type="button" id="btn-close1" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="text-center pb-3">
						  <h2>Login</h2>
						  </div>
              <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-keyboard-fill fs-5"></i>
                </span>
                <input type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="addon-wrapping" id="email" onChange={(e) => {setLoginEmail(e.target.value);setShowErr(false)}}/>
              </div>
              </div>
              <br/>
              {showErr &&<p className="text-danger">*Mandatory fields required</p>}
              <div className="row pt-3" style={{paddingLeft: '35%'}}>
                <div className="col-lg-6 col-md-6 col-sm-6 text-center">
                  <button type="button" className="btn text-white bg-dark" onClick={()=>joinCustomer()}>
                  <i className="bi bi-camera-video me-2"></i>Join
                  </button>
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col-lg-6 col-md-12 col-sm-12 px-5">
          <div className="row pt-res">
            <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="">
                <p>
                  <a style={{fontSize: '1.7rem'}}>
                    magic<span style={{color: '#D273F2', fontSize: '2.25rem', fontWeight: 600}}>CX</span>
                  </a>
                </p>
                <p className="pt-4">
                  We re-engineered the service we built for secure business
                  meetings.
                  <br />
                  <a>
                    magic<span style={{color: '#D273F2', fontSize: '1.25rem', fontWeight: 600}}>CX</span>
                  </a>, AI Companion is your trusted
                  digital assistant that empowers you.{" "}
                </p>
              </div>
            </div>
          </div>
          <div className="row pt-5 align-items-center res-align">
            <div className="col-lg-3 col-md-12 col-sm-12">
              <div className="btn-group pb-res">
                <button
                  type="button"
                  className="btn-hover btn text-white bg-violet"
                  id="copyButton"
                  data-toggle="tooltip"
                  data-placement="top"
                  data-text-to-copy={room}
                >
                  <i className="bi bi-camera-video me-2"></i>New Meeting
                </button>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-keyboard-fill fs-5"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Email"
                  aria-label="Email"
                  aria-describedby="addon-wrapping"
                  id="email"
                  onChange={(e) => setemail(e.target.value)}
                />
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-keyboard-fill fs-5"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Meeting Link"
                  aria-label="Meeting"
                  aria-describedby="addon-wrapping"
                  id="user_id"
                  disabled
                  value={id}
                />
              </div>
            </div>

            <div className="col-lg-2 col-md-12 col-sm-12 pb-res">
              <button
                type="button"
                className="btn text-white bg-dark"
                id="joinbutton"
                onClick={JoinRoom}
              >
                <i className="bi bi-camera-video me-2"></i>Join
              </button>
            </div>
          </div>
          <div
            className="toast"
            id="copyToast"
            data-autohide="true"
            style={{ position: "fixed", bottom: "10px", left: "10px" }}
          >
            <div className="toast-body bg-secondary text-white">
              Meeting code copied!
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12">
          <div className="d-flex justify-content-center align-items-center pt-5">
            <img
              src={indeximg}
              width="500px"
              height="500px"
              className="img-res"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeWithID;

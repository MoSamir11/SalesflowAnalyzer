import React, { useEffect, useRef, useState, useCallback } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import io from "socket.io-client"
import indeximg from './index.svg'
import * as $ from 'jquery';
//import { useSocket } from "./context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from 'uuid';
import { Header } from "./common_comp/header";


function Home() {
  const [ email, setemail ] = useState("")
  const roomId = uuid()
  const [ room, setRoom ] = useState(roomId)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showErr,setShowErr] = useState(false);
  const [meetingId, setMeetingId] = useState();
  //const socket = useSocket();
  const navigate = useNavigate();

  useEffect( () => {
    var body= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.src= '/js/script-index.js';
    document.getElementById('openModal').click();
    //body.appendChild(script);
	}, [])

  const JoinRoom = async () => {
    var room = document.getElementById("user_id").value
    navigate(`/dashboard/${room}?email=${email}&person=Client`);
  };

  function login(){
    // if(loginEmail==="" || loginPwd===""){
    //   setShowErr(true);
    //   return
    // }
    document.getElementById("btn-close").click();
    // if(loginEmail=="sujit_s@pursuitsoftware.biz"){
    //   navigate(`/dashboard/${room}?email=${loginEmail}&person=Dealer`);
    //   } else if(loginEmail=="magiccxsme@gmail.com"){
    //   navigate(`/dashboard/${room}?email=${loginEmail}&person=SalesPerson`);
    //   }
    navigate(`/dashboard/${meetingId}?email=magiccxsme@gmail.com&person=SalesPerson`)
  }

  return (
    <section className="main-layout">

        <Header/>

        <div className="row">
        	<div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-end px-4">
        		<div className="btn-group pt-2">
					    <button type="button" className="btn text-white bg-dark" id="openModal" style={{'display' : 'none'}} data-bs-toggle="modal" data-bs-target="#exampleModal">
					        <i className="bi bi-camera-video me-2"></i>Call
					    </button>

              <button type="button" className="btn text-white bg-dark" onClick={() => { navigate(`/salesmen`)}}>
					        <i className="bi bi-camera-video me-2"></i>Join as Salesmen
					    </button>
                &nbsp;
              <button type="button" className="btn text-white bg-dark" onClick={() => { navigate(`/dealer`)}}>
					        <i className="bi bi-camera-video me-2"></i>Join as Dealer
					    </button>
				    </div>
        	</div>
        </div>

        {/* <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel"></h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="text-center pt-3">
                  <h2>User is Calling</h2>
                </div>
                <div className="row pt-3">
                  <div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center user">
                    <i className="bi bi-person-circle text-secondary"></i>
                  </div>
                </div>
                <div className="row pt-5">
                  <div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
                    <button type="button" className="btn text-white bg-success">
                    Accept Call
                  </button>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
                    <button type="button" className="btn text-white bg-danger">
                    Reject Call
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Login Modal */}
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
              {/* <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-keyboard-fill fs-5"></i>
                </span>
                <input type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="addon-wrapping" id="email" onChange={(e) =>{ setLoginEmail(e.target.value);setShowErr(false)}}/>
              </div> */}
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-keyboard-fill fs-5"></i>
                </span>
                <input type="text" className="form-control" placeholder="Enter meeting id" aria-label="Email" aria-describedby="addon-wrapping" id="meetingId" onChange={(e) =>{ setMeetingId(e.target.value);setShowErr(false)}}/>
              </div>
              </div>
              <br/>
              {/* <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="input-group flex-nowrap pb-res">
                <span className="input-group-text" id="addon-wrapping">
                  <i className="bi bi-key-fill fs-5"></i>
                </span>
                <input type="password" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="addon-wrapping" id="email" onChange={(e) =>{ setLoginPwd(e.target.value);setShowErr(false)}}/>
              </div>
              </div> */}
              {showErr &&<p className="text-danger">*Mandatory fields required</p>}
              <div className="row pt-5" style={{paddingLeft: '35%'}}>
                <div className="col-lg-6 col-md-6 col-sm-6 text-center">
                  <button type="button" className="btn text-white bg-success" onClick={()=>login()}>
                    Join
                  </button>
                </div>
              </div>
              <div className="row pt-2" style={{paddingLeft: '30%'}}>
                {/* <div className="col-lg-6 col-md-6 col-sm-6 text-center"> */}
                  {/* <a href="#" onClick={()=>{
                    document.getElementById("btn-close").click();
                    document.getElementById("openModal1").click();
                  }}>Continue as a customer</a> */}
                {/* </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Login Modal End */}

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
            				<p className="pt-4">We re-engineered the service we built for secure business meetings.
                    <br/><a>
                    magic<span style={{color: '#D273F2', fontSize: '1.25rem', fontWeight: 600}}>CX</span>
                  </a>, AI Companion is your trusted digital assistant that empowers you. </p>
            			</div>
            		</div>
            	</div>
              <div className="row pt-5 align-items-center res-align">
                    <div className="col-lg-3 col-md-12 col-sm-12">
					            <div className="btn-group pb-res">
                      <CopyToClipboard text={room}>
                        <button type="button" className="btn-hover btn text-white bg-violet" id="copyButton" data-toggle="tooltip" data-placement="top" data-text-to-copy={room}>
                            <i className="bi bi-camera-video me-2"></i>New Meeting
                        </button>
                        </CopyToClipboard>
					            </div>

					          </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="input-group flex-nowrap pb-res">
                            <span className="input-group-text" id="addon-wrapping"><i className="bi bi-keyboard-fill fs-5"></i></span>
                            <input type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="addon-wrapping" id="email" onChange={(e) => setemail(e.target.value)} />
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6 col-sm-12">
                        <div className="input-group flex-nowrap pb-res">
                            <span className="input-group-text" id="addon-wrapping"><i className="bi bi-keyboard-fill fs-5"></i></span>
                            <input type="text" className="form-control" placeholder="Meeting Link" aria-label="Meeting" aria-describedby="addon-wrapping" id="user_id" onChange={(e) => setRoom(e.target.value)} />
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-12 col-sm-12 pb-res">
                        
                        <button type="button" className="btn text-white bg-dark" id="joinbutton" onClick={JoinRoom} >
                            <i className="bi bi-camera-video me-2"></i>Join
                        </button>
                        
                    </div>
              </div>
                <div className="toast" id="copyToast" data-autohide="true" style={{'position': 'fixed', 'bottom': '10px', 'left': '10px'}}>
                    <div className="toast-body bg-secondary text-white">
                        Meeting code copied!
                    </div>
                </div>
            </div>

            <div className="col-lg-6 col-md-12 col-sm-12">
            	<div className="d-flex justify-content-center align-items-center pt-5">
            		<img src={indeximg} width="500px" height="500px" className="img-res" />
            	</div>
            </div>
        </div>
  </section>
  );
}

export default Home;

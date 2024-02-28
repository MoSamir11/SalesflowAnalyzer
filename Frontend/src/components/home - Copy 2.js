import React, { useEffect, useRef, useState, useCallback } from "react"
import Button from "@material-ui/core/Button"
import AssignmentIcon from "@material-ui/icons/Assignment"
import { CopyToClipboard } from "react-copy-to-clipboard"
import io from "socket.io-client"
import indeximg from './index.svg'
import * as $ from 'jquery';
import { useSocket } from "./context/SocketProvider";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from 'uuid';

//const socket = io.connect('http://localhost:3001')
function Home() {
  const [ me, setMe ] = useState("")
  const [ name, setName ] = useState("")
  const roomId = uuid()
  const [ room, setRoom ] = useState(roomId)

  const socket = useSocket();
  const navigate = useNavigate();

  useEffect( () => {
		
    //console.log(me)
	}, [me])

  useEffect( () => {
    //console.log("Testing")
    socket.on("me", (id) => {
			setMe(id)
		})

    var body= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.src= '/js/script-index.js';
    body.appendChild(script);
	}, [])

  const JoinRoom = async () => {
    //console.log({ name, room })
    var room = document.getElementById("user_id").value
    socket.emit("room:join", { name, room });
    
  };

  const handleJoinRoom = useCallback(
    (data) => {
      //console.log(data)
      const { name, room, id } = data;
      navigate(`/dashboard/${id}/${room}`, {state : {data : name}});
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <section className="main-layout">

        <header>
            <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
              <div className="container-fluid">
                  <div className="index-logo p-2">
                      <a href="#">Magic <span>CX</span></a>
                  </div>
                  {/* <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                      <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarText">
                      <span className="navbar-text ml-auto">
                          Navbar text with an inline element
                      </span>
                  </div> */}
              </div>
			      </nav>
        </header>

        <div className="row">
        	<div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-end px-4">
        		<div className="btn-group pt-2">
					    <button type="button" className="btn text-white bg-dark" id="openModal" style={{'display' : 'none'}} data-bs-toggle="modal" data-bs-target="#exampleModal">
					        <i className="bi bi-camera-video me-2"></i>Call
					    </button>
				    </div>
        	</div>
        </div>

        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
        </div>

        <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 col-sm-12 px-5">
            	<div className="row pt-res">
            		<div className="col-lg-12 col-md-12 col-sm-12">
            			<div className="">
            				<h1>Premium Video Meetings</h1>
            				<p className="pt-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            				tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            				quis nostrud exercitation ullamco l</p>
            			</div>
            		</div>
            	</div>
              <div className="row pt-5 align-items-center res-align">
                    <div className="col-lg-3 col-md-12 col-sm-12">
					            <div className="btn-group pb-res">
                        <button type="button" className="btn-hover btn text-white bg-violet" id="copyButton" data-toggle="tooltip" data-placement="top" data-text-to-copy={room}>
                            <i className="bi bi-camera-video me-2"></i>New Meeting
                        </button>
					            </div>

					          </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                        <div className="input-group flex-nowrap pb-res">
                            <span className="input-group-text" id="addon-wrapping"><i className="bi bi-keyboard-fill fs-5"></i></span>
                            <input type="text" className="form-control" placeholder="Name" aria-label="Name" aria-describedby="addon-wrapping" id="name" onChange={(e) => setName(e.target.value)} />
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

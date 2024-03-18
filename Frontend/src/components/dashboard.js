import React, { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import Navbar from "./navbar.js";
// import Header from "./header.js";
import OpenAI from "openai";
import $ from "jquery";
import * as faceapi from "face-api.js";
import axios from "axios";
import { isWithGender } from "face-api.js";
import Chart from "chart.js/auto";
import { getRelativePosition } from "chart.js/helpers";
import {
  TextAnalyticsClient,
  AzureKeyCredential,
} from "@azure/ai-text-analytics";
import { useRecordWebcam } from "react-record-webcam";
import RecordRTC, { RecordRTCPromiseHandler } from "recordrtc";
import useScreenRecorder from "use-screen-recorder";
import { useReactMediaRecorder } from "react-media-recorder";
import girlImg from "./images/girl.png";
import video2 from "./images/video-2.mp4";
import video3 from "./images/video-3.mp4";
import bulb from "./images/bulb.png";
import img1 from "./images/image-1.png";
import { deepOrange, deepPurple } from "@mui/material/colors";
import Avatar from "react-avatar";
import LoginModal from "./login/login-modal.js";
import { Sidebar } from "./sedebar.js";
import { Header } from "./common_comp/header.js";
import ReactPlayer from "react-player";
import MagicCX from './document/MagicCX.mp4'
// import PDFViewer from "./common_comp/pdf-viewer.js";

//V-1.11
//loadModels(); & doContinuousRecognition(); These functions need to be called for SalesPerson
//doContinuousRecognition() need to be called for Client
//onRecognizedResult() for Client needs to be handled

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      // //console.log("Hi", stream);
      ref.current.srcObject = stream;
    });
  }, []);

  return <video playsInline ref={ref} autoPlay></video>;
};

const ClientVideo1 = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });

    var body = document.getElementsByTagName("body")[0];
    var link = document.createElement("link");
    link.src = "/css/style.css";
    //body.appendChild(link)
  }, []);

  return (
    <div className="client-video-1">
      <video playsInline ref={ref} autoPlay></video>
    </div>
  );
};

const ClientVideo2 = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return (
    <div className="client-video-2">
      <video playsInline ref={ref} autoPlay></video>
    </div>
  );
};

function Dashboard() {
  const { chatroom } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const [roomID, setRoomID] = useState(chatroom);
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [ClientPeers, setClientPeers] = useState([]);
  const [DealerPeers, setDealerPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const clientVideo = useRef({});
  const salespersonVideo = useRef({});
  const dealerVideo = useRef({});
  const [salespersonSocketId, setSalespersonSocketId] = useState("");
  const peersRef = useRef([]);
  const [userType, setUserType] = useState(urlParams.get("person"));
  const authorizationEndpoint =
    "https://magiccx-backend.azurewebsites.net/api/get-speech-token";
  let subscriptionKey = "b728cec31ab14a2da7749569701f599d";
  let openai_subscription_key =
    "";
  let conversation_history = "";
  let [conversation, setConversation] = useState("");
  const [muted, setMuted] = useState(false);
  const [muteSalesPerson, setMuteSalesPerson] = useState(false);
  const [muteDealer, setMuteDealer] = useState(false);
  const [muteClient, setMuteClient] = useState(false);
  const [stream, setStream] = useState(null);
  const [clientStream, setClientStream] = useState(null);
  const [salesPersonStream, setSalesPersonStream] = useState(null);
  const [dealerStream, setDealerStream] = useState(null);
  const [webCamStatus, setWebCamStatus] = useState(true);

  const [hideClientVideo, setHideClientVideo] = useState(false);
  const [hideSalesPersonVideo, setHideSalesPersonVideo] = useState(false);
  const [hideDealerVideo, setHideDealerVideo] = useState(false);
  let facialExp = "";
  const [clientFE, setClientFE] = useState("");
  const [bolburl, setBlobUrl] = useState("");
  let customerResponse = "";
  ////console.log(peers)
  ////console.log(ClientPeers)

  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email"));
  const [person, setPerson] = useState(searchParams.get("person"));
  const [userEmail, setUserEmail] = useState(searchParams.get("email"));
  const [chatBoxData, setChatBoxData] = useState([]);
  const [pitchInfo, setPitchInfo] = useState([]);
  let userAudioStream = undefined;
  let [passedTime, setTimePassed] = useState('00:00:00')
  let expressions = {};
  let transcript = {};

  let expressions_transcript = {};
  let last_speech_recognised_timestamp = 0;

  const canvasRef = useRef();

  let SpeechSDK = undefined;
  //let [SpeechSDK, setSpeechSDK] = useState()

  const [isRecording, setIsRecording] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const remoteVideoRef = useRef(null);
  const [show, setShow] = useState(true);
  const [recordingId, setRecordingId] = useState("");
  const [videoBlob, setVideoBlob] = useState(null);
  const [type, setType] = useState(null);
  const [tab, setTab] = useState("tab2");
  const [vibeScore, setVibeScore] = useState("");
  const [aiFeature, setSelectedAIFeature] = useState("pitch");
  // let url ="https://magiccx.azurewebsites.net/";
  let url = "http://localhost:3000/";
  const pdfFiles = [
    { name: "Introduction", path: `${url}document/Introduction.pdf` },
    { name: "Features", path: `${url}document/Features.pdf` },
    { name: "Summary", path: `${url}document/Summarization and Product Info.pdf` },
    { name: "AI Assistant", path: `${url}document/AI Assisted Pitch.pdf` },
    { name: "Vibe Meter", path: `${url}document/The Vibe Meter.pdf` },
  ];
  //   const {startRecording,pauseRecording,blobUrl,resetRecording,resumeRecording,status,stopRecording} = useScreenRecorder({ audio: true });
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true, audio: true });
  // //console.log(`164--> ${searchParams.get("email")}`);
  if (!!window.SpeechSDK) {
    SpeechSDK = window.SpeechSDK;
    //setSpeechSDK(window.SpeechSDK)
  }

  let region = "eastus";
  var reco;
  let authorizationToken = undefined;

  useEffect(() => {
    // //console.log("Hello World");
    socketRef.current = io.connect("http://localhost:3001");
    // socketRef.current = io.connect("https://magiccx-backend.azurewebsites.net");
    // document.getElementById("speech-container").innerHTML += `
    // <div class="row px-1">
    // 	<div class="col-lg-12 col-md-12 col-sm-12">
    // 		<div class="d-flex align-items-center">
    // 			<div class="circleBotImg d-flex justify-content-center align-items-center">
    // 				<img src="images/girl.png">
    // 			</div>
    // 			<div class="d-flex gap-2 pb-2 align-items-center">
    // 				<span class="textBot">Jane Doe</span>
    // 					<span class="timeBotText">11:13</span>
    // 			  </div>
    // 				</div>
    // 				<div class="chatBox-1 position-relative">
    // 					<p class="p-text">Hello World</p>
    // 				<div class="green-dot"></div>
    // 		</div>
    // 	</div>
    // </div>
    // `;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        setStream(stream);
        socketRef.current.emit("join room", { roomID, email, person });
        doContinuousRecognition();
        socketRef.current.on("all users", (users) => {
          const peers = [];
          const client_peers = [];
          const dealer_peers = [];
          users.forEach((obj) => {
            // //console.log(`146--> ${JSON.stringify(obj.audio)}`);
            const peer = createPeer(
              obj.id,
              socketRef.current.id,
              stream,
              obj.role
            );
            peersRef.current.push({
              peerID: obj.id,
              peer,
            });
            if (obj.role == "SalesPerson") {
              peer.on("stream", (stream) => {
                salespersonVideo.current.srcObject = stream;
                ////console.log(salespersonVideo)
              });
              setSalespersonSocketId(obj.id);
              peers.push(peer);
              setMuteSalesPerson(!obj.audio);
              callSentimentScore();
            } else if (obj.role == "Client") {
              peer.on("stream", (stream) => {
                clientVideo.current.srcObject = stream;
                setClientStream(stream);
              });
              client_peers.push(peer);
              //delay(3000)
              loadModels();
              setMuteClient(!obj.audio);
              // doContinuousRecognition()
            } else if (obj.role == "Dealer") {
              peer.on("stream", (stream) => {
                dealerVideo.current.srcObject = stream;
              });
              dealer_peers.push(peer);
              setMuteDealer(!obj.audio);
              //delay(3000)
              //loadModels()
              // doContinuousRecognition()
            }
            // doContinuousRecognition()
          });
          setPeers(peers);
          setClientPeers(client_peers);
          setDealerPeers(dealer_peers);
          // //console.log(ClientPeers);
        });
        // Set Back Button Event
        window.addEventListener("popstate", leaveCall);
        socketRef.current.on("user joined", (payload) => {
          // //console.log("user joined", payload.callerID);
          const peer = addPeer(
            payload.signal,
            payload.callerID,
            stream,
            payload.role
          );
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          if (payload.role == "SalesPerson") {
            peer.on("stream", (stream) => {
              salespersonVideo.current.srcObject = stream;
              setSalesPersonStream(stream);
              // //console.log(salespersonVideo);
            });
            setSalespersonSocketId(payload.callerID);
            setPeers((users) => [...users, peer]);
            // doContinuousRecognition()
          } else if (payload.role == "Client") {
            peer.on("stream", (stream) => {
              clientVideo.current.srcObject = stream;
              setClientStream(stream);
            });
            setClientPeers((users) => [...users, peer]);
            //delay(3000)
            loadModels();
            // doContinuousRecognition()
          } else if (payload.role == "Dealer") {
            peer.on("stream", (stream) => {
              dealerVideo.current.srcObject = stream;
              setDealerStream(stream);
            });
            setDealerPeers((users) => [...users, peer]);
            //delay(3000)
            //loadModels()
            // doContinuousRecognition()
          }
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("mute:user", (data) => {
          // //console.log(`223--> ${data.person}`);
          if (data.person == "SalesPerson") {
            setMuteSalesPerson(true);
          } else if (data.person == "Client") {
            setMuteClient(true);
          } else if (data.person == "Dealer") {
            setMuteDealer(true);
          }
        });

        socketRef.current.on("unmute:user", (data) => {
          if (data.person == "SalesPerson") {
            setMuteSalesPerson(false);
          } else if (data.person == "Client") {
            setMuteClient(false);
          } else if (data.person == "Dealer") {
            setMuteDealer(false);
          }
        });

        socketRef.current.on("hide:user", (data) => {
          //console.log(`250--> ${JSON.stringify(data)}`);
          let track = clientVideo.current.srcObject.getTracks()[1];
          //console.log(track);
          track.enabled = false;
          // if(data.person === "Client"){
          // 	let track = clientVideo.current.srcObject.getTracks()[1];;
          //console.log(track);
          // }
        });

        // socketRef.current.on("show:user",(data)=>{
        //console.log(`250--> ${JSON.stringify(data)}`);
        // 	let track = clientVideo.current.srcObject.getTracks()[1];
        //console.log(track);
        // 	track.enabled = true;
        // })

        socketRef.current.on("disconnected",async(data)=>{
        console.log("user-disconnected")
        	console.log('354-->',data,peersRef);
          // await peersRef.current.filter((data)=>data.peerID !== data);
        });

        // socketRef.current.on("user:left",(id)=>{
        //console.log(`288--> ${id}`);
        // 	const peerObj = peersRef.current.find(p=>p.peerID === id);
        //console.log(id, peerObj);
        // 	if(peerObj){
        // 		peerObj.peer.destroy();
        // 		ClientPeers.peer.destroy();
        // 	}
        // 	const peers = peersRef.current.filter(p=>p.peerID !== id);
        // 	peersRef.current = peers;
        // 	setPeers(peers);
        // })

        socketRef.current.on("disconnect:user", (data) => {
          const peerIdx = findPeer(data.userId);
          //console.log("305-->", peerIdx, ClientPeers);
          peerIdx.peer.destroy();
          // setHideClientVideo(true);
          clientVideo.current.srcObject.getTracks()[0] = false;
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          setClientPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          peersRef.current = peersRef.current.filter(
            ({ peerID }) => peerID !== data.userId
          );
        });

        socketRef.current.on("sp-disconnect", (data) => {
          window.location.href = "/";
        });
      });

    Initialize(async function (speechSdkParam) {
      SpeechSDK = speechSdkParam;

      // in case we have a function for getting an authorization token, call it.
      if (typeof RequestAuthorizationToken === "function") {
        await RequestAuthorizationToken();
      }
    });

    var time=0;
        setInterval(() => {
          time+=1
          let hours = String(Math.floor(time/3600)).padStart(2,'0');
          let minutes = String(Math.floor(time/60)).padStart(2,'0');
          let sec = String(time%60).padStart(2,'0');
          $("#timer").text(`${hours}: ${minutes}: ${sec}`);
          setTimePassed(`${hours}: ${minutes}: ${sec}`)
        }, 1000);
  }, []);

  function callSentimentScore() {
    setInterval(() => {
      getSentimentScore();
    }, 3000);
  }

  function reconnectWithPeer(person) {
    var peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("stream", (stream) => {
      clientVideo.current.srcObject = stream;
      setClientStream(stream);
    });
  }

  const leaveCall = () => {
    console.log('433-->',customerResponse);
    if (person === "SalesPerson") {
      socketRef.current.emit("salesperson-disconnected", {
        roomID: roomID,
        id: socketRef.current.id,
        msg: customerResponse,
        sentiment: customerResponse
      });
      window.location.href = "/";
      return;
    }
    
    socketRef.current.emit("disconnectUser", {
      roomID,
      id: socketRef.current.id,
      msg: conversation,
    });
    window.location.href = "/";
  };

  const callOpenAI = async () => {
    const openai = new OpenAI({
      apiKey: openai_subscription_key,
      dangerouslyAllowBrowser: true,
    });

    let system_prompt =
      "Act as a car salesman.  Given below is a HTML conversation which shows the customer's emotion based on words spoken by the Salesman. Suggest what you should say next to make the Customer pleasantly surprised. Remove \"Salesman Says\" from your response. I don't need customer's side conversation.";
    //console.log("449-->", conversation_history);
    let messages = [
      { role: "system", content: system_prompt },
      { role: "user", content: conversation_history },
    ];

    // //console.log('455-->',messages)

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      const text = chatCompletion.choices[0].message.content;
      //return text;
      //console.log("465-->", text);
      let date = new Date();
      let time = date
        .toLocaleString([], {
          hour: "numeric",
          minute: "2-digit",
        })
        .toUpperCase();
      setPitchInfo((prevState) => [
        { info: text, time: time, type: "Pitching" },
        ...prevState
      ]);
      // document.getElementById("aiFeatureTab").scrollTop =
      //   document.getElementById("aiFeatureTab").scrollHeight;
    } catch (err) {
      console.error(err);
    }
  };

  const addSummary = async () => {
    const openai = new OpenAI({
      apiKey: openai_subscription_key,
      dangerouslyAllowBrowser: true,
    });

    let system_prompt =
      "Summarize the below conversationAct as a summarizer for a conversation between three parties. You are provided with a dialogue involving SalesPerson,Dealer, and Customer. SalesPerson speaks about the features of car and concerns customer presents their counter-arguments, and salesperson offers a neutral opinion and attempts to mediate. Summarize this conversation, capturing the key points raised by each party and highlighting any potential areas of agreement or disagreement. Keep the summary concise, yet comprehensive, providing a well-rounded overview of the conversation's main points to facilitate understanding and aid decision-making.";
    //console.log("495-->", conversation_history);
    let messages = [
      { role: "system", content: system_prompt },
      { role: "user", content: conversation_history },
    ];

    // //console.log('455-->',messages)

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      const text = chatCompletion.choices[0].message.content;
      //console.log(`510--> ${text}`);
      let date = new Date();
      let time = date
        .toLocaleString([], {
          hour: "numeric",
          minute: "2-digit",
        })
        .toUpperCase();
      setPitchInfo((prevState) => [
        { info: text, time: time, type: "Summary" },
        ...prevState
      ]);

      // document.getElementById("aiFeatureTab").scrollTop =
      //   document.getElementById("aiFeatureTab").scrollHeight;
    } catch (e) {
      //console.log(e);
    }
  };

  function getTime() {
    let date = new Date();
    let time = date
      .toLocaleString([], {
        hour: "numeric",
        minute: "2-digit",
      })
      .toUpperCase();
    return time;
  }

  function addProductInfo() {
    setPitchInfo((prevState) => [
      {
        info: "Magic CX is an innovative application designed to facilitate meetings between dealers, salesmen, and potential customers interested in purchasing. Magic CX focuses on scheduling and facilitating meetings between dealers, salesmen, and customers. Its primary objective is to enhance the purchasing process by integrating facial recognition, sentiment analysis, and AI-driven assistance to improve sales efficiency and customer satisfaction",
        time: getTime(),
        type: "Product Info",
      },
      ...prevState,
    ]);
  }

  const getSentimentScore = async () => {
    //console.log("527--> Called");
    if (customerResponse == "") {
      return;
    }
    const openai = new OpenAI({
      apiKey: openai_subscription_key,
      dangerouslyAllowBrowser: true,
    });

    let system_prompt =
      "Act as a sentiment analysis expert to generate a vibe score from 1 to 100 for the sentiment and facial expression recorded at different points in time. Consider that facial expressions are polled every second, while sentiment is recorded at the end of each sentence. The vibe score should reflect a combination of emotions, with 1 indicating sadness, 100 indicating happiness, and values in between representing varying emotions. Please provide your response as only a single number avoid any supporting text";
    let messages = [
      { role: "system", content: system_prompt },
      { role: "user", content: customerResponse },
    ];

    console.log("543-->", customerResponse);

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      console.log("550-->", chatCompletion);
      const text = chatCompletion.choices[0].message.content;
      //return text;
      console.log("553-->", text);
      var score = text;
      setVibeScore(score);
      // let date = new Date();
      // let time = date
      //   .toLocaleString([], {
      //     hour: "numeric",
      //     minute: "2-digit",
      //   })
      //   .toUpperCase();
      // setPitchInfo((prevState) => [...prevState, { info: text, time: time }]);
      // document.getElementById("aidivspeech").innerHTML += `<div class="pt-4">
      // 	<span>
      // 		${text}
      // 	</span>
      // </div>
      // `;
      // document.getElementById("aidivspeech").scrollTop =
      //   document.getElementById("aidivspeech").scrollHeight;

      // document.getElementById("aibutton").disabled = false;
    } catch (err) {
      console.error(`575--> ${err}`);
    }
  };

  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  function createPeer(userToSignal, callerID, stream, role) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:standard.relay.metered.ca:80",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
          {
            urls: "turn:standard.relay.metered.ca:80?transport=tcp",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
          {
            urls: "turn:standard.relay.metered.ca:443",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
          {
            urls: "turns:standard.relay.metered.ca:443?transport=tcp",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
        ],
      },
      stream,
    });
    //console.log("Hi 5");

    peer.on("signal", (signal) => {
      //console.log("Hi 6");
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        person,
      });
    });

    /*
		if(role == "Client"){
			peer.on("stream", (stream) => {
				////console.log("Hi2")
				if(clientVideoStream.current){
					//console.log("assigned")
					clientVideoStream.current.srcObject = stream
				}
				else{
					//console.log("not assigned")
				}
				
			})
		}
		*/

    //console.log("Hi 7");

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream, role) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:standard.relay.metered.ca:80",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
          {
            urls: "turn:standard.relay.metered.ca:80?transport=tcp",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
          {
            urls: "turn:standard.relay.metered.ca:443",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
          {
            urls: "turns:standard.relay.metered.ca:443?transport=tcp",
            username: "4f036f4af058d524b3fff8cc",
            credential: "pPXGlN4NrqCgspQZ",
          },
        ],
      },
      stream,
    });
    //console.log("Hi 1");

    peer.on("signal", (signal) => {
      //console.log("Hi 2");
      socketRef.current.emit("returning signal", { signal, callerID, role });
    });

    peer.signal(incomingSignal);
    //console.log("Hi 3");

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  useEffect(() => {
    if (person == "SalesPerson") {
      if (!document.getElementById("chartJS")) {
        var body = document.getElementsByTagName("body")[0];
        var script = document.createElement("script");
        script.src = "/js/script.js";
        script.id = "chartJS";
        body.appendChild(script);
      }

      $(".bar").each(function () {
        var $bar = $(this);
        var label = $bar.data("label");
        var value = $bar.data("value");
        var color = $bar.data("color");

        var barHtml =
          '<div class="progress-line"><span style="width: ' +
          value +
          "%; background: " +
          color +
          ';"></span></div>';
        var labelHtml = '<div class="info"><span>' + label + "</span></div>";
        var valueHtml = '<div class="value-display">' + value + "</div>";

        $bar.html(labelHtml + barHtml + valueHtml);
      });

      let $chart = $("#sentiment-chart");
      let labels = $chart
        .data("labels")
        .split(", ")
        .map((label) => label.trim());
      let data = $chart
        .data("data")
        .split(", ")
        .map((value) => parseInt(value.trim()));
      let bgColor = $chart.data("bg-color");
      let pointBgColor = $chart.data("point-bg-color");
      let borderColor = $chart.data("border-color");
      let borderWidth = parseInt($chart.data("border-width"));
      let pointRadius = parseInt($chart.data("point-radius"));
      let lineWidth = parseInt($chart.data("line-width"));
      let isResponsive = $chart.data("responsive") === "true";

      var chrt = $chart[0].getContext("2d");

      var chart = new Chart(chrt, {
        type: "radar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "",
              data: data,
              backgroundColor: [bgColor],
              pointBackgroundColor: [pointBgColor, pointBgColor, pointBgColor],
              borderColor: [borderColor],
              borderWidth: borderWidth,
              pointRadius: pointRadius,
            },
          ],
        },
        options: {
          responsive: isResponsive,
          maintainAspectRatio: false,
          elements: {
            line: {
              borderWidth: lineWidth,
            },
          },
        },
      });

      ////console.log(socketRef.current)
      if (socketRef.current) {
        //loadModels()
        socketRef.current.on("sendMSGToSalesmen", async (data) => {
          // //console.log(`471--> ${JSON.stringify(data)}, ${facialExp}`);
          if (data.userType == "Client") {
            conversation_history += `${getCurrentDate()} ${data.time.toUpperCase()} : ${
              data.userType
            } : ${data.sentiment} : ${facialExp} : ${data.message}\n`;
            customerResponse += `${data.time}: Speech Expression: ${data.sentiment}\n`;
            console.log(`783--> ${customerResponse}`);
          } else if (data.userType == "Dealer") {
            conversation_history += `${getCurrentDate()} ${data.time.toUpperCase()} : ${
              data.userType
            } : ${data.sentiment} : ${data.message}\n`;
          }
          setConversation(conversation_history);
          // //console.log("588-->", conversation_history);
          setChatBoxData((prevstate) => [
            {
              msg: data.message,
              time: data.time,
              sentiment: data.sentiment,
              img: { girlImg },
              name: data.userType == "Dealer" ? "Intermediary" : "Customer",
              email: data.email,
              class:
                data.sentiment == "Negative"
                  ? "red-dot"
                  : data.sentiment == "Positive"
                  ? "green-dot"
                  : "",
            },
            ...prevstate,
          ]);
          // document.getElementById("tabs").scrollTop =
          //   document.getElementById("tabs").scrollHeight;

          // document.getElementById("tabbbs").scrollTop =
          //   document.getElementById("tabbbs").scrollHeight;

          const sentimentObj = await SentimentRecognition(data.message);
          // //console.log(`579--> 557 ${JSON.stringify(sentimentObj)}`);
          if (sentimentObj) {
            ////console.log(sentimentObj.aggregate_sentiment)
            ////console.log(chart)
            let aggregate_sentiment_obj = sentimentObj.aggregate_sentiment;
            let positive =
              aggregate_sentiment_obj.positive > 0
                ? aggregate_sentiment_obj.positive * 40
                : Math.floor(Math.random() * (15 - 10 + 1)) + 10;
            let negative =
              aggregate_sentiment_obj.negative > 0
                ? aggregate_sentiment_obj.negative * 40
                : Math.floor(Math.random() * (15 - 10 + 1)) + 10;
            let neutral =
              aggregate_sentiment_obj.neutral > 0
                ? aggregate_sentiment_obj.neutral * 40
                : Math.floor(Math.random() * (15 - 10 + 1)) + 10;
            //let mixed = Math.floor(Math.random() * (15 - 10 + 1)) + 15
            //let ambiguous = Math.floor(Math.random() * (20 - 15 + 1)) + 10

            ////console.log(positive, negative, neutral, mixed, ambiguous)
            if (chart) {
              chart.data.datasets[0].data = [positive, negative, neutral];
              chart.update();
            }
          }
        });
      }
    }
  }, [socketRef]);

  const SentimentRecognition = async (inputtext) => {
    const endpoint = "https://ocm-chatbot.cognitiveservices.azure.com/";
    const key = "87c2908acfab47bb89745ba8ff6a8103";
    const client = new TextAnalyticsClient(
      endpoint,
      new AzureKeyCredential(key)
    );
    const documents = [inputtext];
    try {
      const response = await client.analyzeSentiment(documents);
      const result = {
        aggregate_sentiment: response[0].confidenceScores,
        overall_sentiment: response[0].sentiment,
      };
      //console.log(`579-->2. ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      // //console.log(`579-->3. ${e}`);
      return undefined;
    }
  };

  async function RequestAuthorizationToken() {
    if (authorizationEndpoint) {
      try {
        const res = await axios.get(authorizationEndpoint);
        const token = res.data.token;
        const regionValue = res.data.region;
        region = regionValue;
        authorizationToken = token;

        ////console.log('Token fetched from back-end: ' + token);
      } catch (err) {
        //console.log(err);
      }
    }
  }

  function Initialize(onComplete) {
    ////console.log(window.SpeechSDK)
    if (!!window.SpeechSDK) {
      onComplete(window.SpeechSDK);
    } else {
      //window.alert("Hi")
    }
  }

  function getAudioConfig() {
    // If an audio file was specified, use it. Otherwise, use the microphone.
    // Depending on browser security settings, the user may be prompted to allow microphone use. Using
    // continuous recognition allows multiple phrases to be recognized from a single use authorization.
    ////console.log(SpeechSDK)
    return SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  }

  function getAudioStream(audioFile, cb) {
    var fr = new FileReader();
    fr.readAsArrayBuffer(audioFile);
    fr.addEventListener(
      "loadend",
      (e) => {
        var buf = e.target.result;
        cb(buf);
      },
      false
    );
  }

  function getAudioConfigFromStream() {
    ////console.log(userAudioStream)
    if (userAudioStream) {
      let audioFormat = SpeechSDK.AudioStreamFormat.getWaveFormatPCM(
        16000,
        16,
        1
      );
      let audioStream = SpeechSDK.AudioInputStream.createPushStream();
      getAudioStream(userAudioStream, (b) => {
        audioStream.write(b.slice());
        audioStream.close();
      });
      return SpeechSDK.AudioConfig.fromStreamInput(audioStream, audioFormat);
    } else {
      window.alert("No Audio Source Found.");
      return;
    }
  }

  function getSpeechConfig(sdkConfigType) {
    let speechConfig;
    if (authorizationToken) {
      speechConfig = sdkConfigType.fromAuthorizationToken(
        authorizationToken,
        region
      );
    } else {
      speechConfig = sdkConfigType.fromSubscription(subscriptionKey, region);
    }

    // Defines the language(s) that speech should be translated to.
    // Multiple languages can be specified for text translation and will be returned in a map.
    if (sdkConfigType == SpeechSDK.SpeechTranslationConfig) {
      speechConfig.addTargetLanguage("en-US");
    }

    speechConfig.speechRecognitionLanguage = "en-US";
    return speechConfig;
  }

  function doContinuousRecognition() {
    var audioConfig = getAudioConfig();
    var speechConfig = getSpeechConfig(SpeechSDK.SpeechConfig);
    ////console.log(speechConfig)
    if (!speechConfig) return;

    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    ////console.log(reco)
    applyCommonConfigurationTo(reco);

    // Start the continuous recognition. Note that, in this continuous scenario, activity is purely event-
    // driven, as use of continuation (as is in the single-shot sample) isn't applicable when there's not a
    // single result.
    reco.startContinuousRecognitionAsync();
  }

  function applyCommonConfigurationTo(recognizer) {
    // The 'recognizing' event signals that an intermediate recognition result is received.
    // Intermediate results arrive while audio is being processed and represent the current "best guess" about
    // what's been spoken so far.
    recognizer.recognizing = onRecognizing;

    // The 'recognized' event signals that a finalized recognition result has been received. These results are
    // formed across complete utterance audio (with either silence or eof at the end) and will include
    // punctuation, capitalization, and potentially other extra details.
    //
    // * In the case of continuous scenarios, these final results will be generated after each segment of audio
    //   with sufficient silence at the end.
    // * In the case of intent scenarios, only these final results will contain intent JSON data.
    // * Single-shot scenarios can also use a continuation on recognizeOnceAsync calls to handle this without
    //   event registration.
    recognizer.recognized = onRecognized;

    // The 'canceled' event signals that the service has stopped processing speech.
    // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
    // This can happen for two broad classes of reasons:
    // 1. An error was encountered.
    //    In this case, the .errorDetails property will contain a textual representation of the error.
    // 2. No additional audio is available.
    //    This is caused by the input stream being closed or reaching the end of an audio file.
    recognizer.canceled = onCanceled;

    // The 'sessionStarted' event signals that audio has begun flowing and an interaction with the service has
    // started.
    recognizer.sessionStarted = onSessionStarted;

    // The 'sessionStopped' event signals that the current interaction with the speech service has ended and
    // audio has stopped flowing.
    recognizer.sessionStopped = onSessionStopped;

    // PhraseListGrammar allows for the customization of recognizer vocabulary.
    // The semicolon-delimited list of words or phrases will be treated as additional, more likely components
    // of recognition results when applied to the recognizer.
    //
    // See https://docs.microsoft.com/azure/cognitive-services/speech-service/get-started-speech-to-text#improve-recognition-accuracy
  }

  function onRecognizing(sender, recognitionEventArgs) {
    var result = recognitionEventArgs.result;
    // Update the hypothesis line in the phrase/result view (only have one)
    //phraseDiv.innerHTML = phraseDiv.innerHTML.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2') + `${result.text} [...]\r\n`;
    //phraseDiv.scrollTop = phraseDiv.scrollHeight;
    ////console.log("onRecognizing", result.text)
  }

  function onRecognized(sender, recognitionEventArgs) {
    var result = recognitionEventArgs.result;
    onRecognizedResult(recognitionEventArgs.result);
  }

  async function onRecognizedResult(result) {
    // //console.log(`827--> Called`);
    ////console.log(result.reason == SpeechSDK.ResultReason.RecognizedSpeech)
    // //console.log(result.text);
    ////console.log(person)
    if (!result.text) {
      return;
    }
    var sentiment = await SentimentRecognition(result.text);
    // //console.log(`579--> 780 ${JSON.stringify(sentiment)}, ${result.text}`);
    ////console.log(person)
    getSentimentScore();
    if (person == "SalesPerson") {
      //phraseDiv.scrollTop = phraseDiv.scrollHeight;
      //phraseDiv.innerHTML = phraseDiv.innerHTML.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2');

      switch (result.reason) {
        case SpeechSDK.ResultReason.NoMatch:
        case SpeechSDK.ResultReason.Canceled:
        case SpeechSDK.ResultReason.RecognizedSpeech:
          ////console.log("Salesperson", result.text)
          let date = new Date();
          let time = date
            .toLocaleString([], {
              hour: "numeric",
              minute: "2-digit",
            })
            .toLowerCase();
          // document.getElementById(
          //   "speech-container"
          // ).innerHTML += `<div class="salesman-speech speech-bubble">
          // <p style="font-size: 11px; margin-bottom: 0.18rem; font-weight: bold; color: #ffc107">You</p>
          // 	<p style="font-size: 10px; margin-bottom: 0.1rem">${result.text.replace(
          //     /(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/,
          //     "$1$2"
          //   )}</p>
          // 	<p style="font-size: 8px; margin-bottom: 0.1rem; text-align: right; padding-left: 15px;">${time}</p>
          // </div>`;
          // chatBoxData.push({})

          // document.getElementById("tabs").scrollTop =
          //   document.getElementById("tabs").scrollHeight;
          // document.getElementById("tabbbs").scrollTop =
          //   document.getElementById("tabbbs").scrollHeight;

          ////console.log("Hi")
          //phraseDiv.value += `${result.text}\r\n`;
          /*
					var intentJson = result.properties
						.getProperty(SpeechSDK.PropertyId.LanguageUnderstandingServiceResponse_JsonResult);
					if (intentJson) {
						//phraseDiv.value += `${intentJson}\r\n`;
					}

					if (result.translations) {
						var resultJson = JSON.parse(result.json);
						resultJson['privTranslationPhrase']['Translation']['Translations'].forEach(
							function (translation) {
							phraseDiv.value += ` [${translation.Language}] ${translation.Text}\r\n`;
						});
					}
					*/

          transcript[new Date().getTime()] = result.text;
          last_speech_recognised_timestamp = new Date().getTime();
          let nweDate = new Date();
          let newTime = nweDate
            .toLocaleString([], {
              hour: "numeric",
              minute: "2-digit",
            })
            .toUpperCase();
          expressions_transcript[new Date().getTime()] = {
            transcript: result.text,
          };
          var sentiment = await SentimentRecognition(result.text);
          let capitalizedSentiment =
            sentiment.overall_sentiment.charAt(0).toUpperCase() +
            sentiment.overall_sentiment.slice(1);
          conversation_history +=
            `${getCurrentDate()} ${newTime} : Salesman : ${capitalizedSentiment}` +
            " : " +
            result.text +
            "\n";
          setChatBoxData((prevState) => [
            {
              msg: result.text,
              time: time,
              sentiment: capitalizedSentiment,
              img: { girlImg },
              name: "You",
              email: "",
              class:
                capitalizedSentiment == "Positive"
                  ? "green-dot"
                  : capitalizedSentiment == "Negative"
                  ? "red-dot"
                  : "",
            },
            ...prevState,
          ]);
          // document.getElementById("tabs").scrollTop =
          //   document.getElementById("tabs").scrollHeight;
          // document.getElementById("tabbbs").scrollTop =
          //   document.getElementById("tabbbs").scrollHeight;

          ////console.log(expressions_transcript)

          break;
        case SpeechSDK.ResultReason.TranslatedSpeech:
        case SpeechSDK.ResultReason.RecognizedIntent:
      }
    } else {
      switch (result.reason) {
        case SpeechSDK.ResultReason.NoMatch:
        case SpeechSDK.ResultReason.Canceled:
        case SpeechSDK.ResultReason.RecognizedSpeech:
          let date = new Date();
          let time = date
            .toLocaleString([], {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })
            .toLowerCase();
          let capitalizedSentiment =
            sentiment.overall_sentiment.charAt(0).toUpperCase() +
            sentiment.overall_sentiment.slice(1);
          //console.log("911-->", facialExp);
          socketRef.current.emit("sendMSG", {
            to: roomID,
            message: result.text,
            time: time,
            person: person,
            sentiment: capitalizedSentiment,
            email: userEmail,
          });

          break;
        case SpeechSDK.ResultReason.TranslatedSpeech:
        case SpeechSDK.ResultReason.RecognizedIntent:
      }
    }
  }

  function onSessionStarted(sender, sessionEventArgs) {}

  function onSessionStopped(sender, sessionEventArgs) {}

  function onCanceled(sender, cancellationEventArgs) {
    window.console.log(cancellationEventArgs);
  }

  const loadModels = () => {
    if (person == "SalesPerson") {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]).then(() => {
        faceDetection();
      });
    }
  };

  const faceDetection = async () => {
    let interval = setInterval(async () => {
      ////console.log(clientVideoStream.current)
      if (clientVideo.current) {
        const detections = await faceapi
          .detectAllFaces(
            clientVideo.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections) {
          if (detections.length > 0) {
            let date = new Date();
            let time = date
              .toLocaleString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })
              .toLowerCase();
            ////console.log(detections[0].expressions)
            let ExpressionKeyArray = Object.keys(detections[0].expressions);
            // console.log(detections[0].expressions)
            ExpressionKeyArray.map((obj) => {});
            console.log(
              "1230-->",
              Object.keys(detections[0].expressions).reduce((a, b) =>
                detections[0].expressions[a] > detections[0].expressions[b]
                  ? a
                  : b
              )
            );
            var fExp = Object.keys(detections[0].expressions).reduce((a, b) =>
              detections[0].expressions[a] > detections[0].expressions[b]
                ? a
                : b
            );
            customerResponse += `${time} Facial Expression: ${fExp}\n`;
            ExpressionKeyArray.map((obj) => {
              //   //console.log("962--> 1.", obj);
              facialExp = obj;

              setClientFE(obj);
              //   //console.log(`962--> 2. ${facialExp}, ${clientFE}`);

              if (obj == "happy") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["happy"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#712cf9" +
                  ';"></span></div>';
                var labelHtml = '<div class="info"><span>Happy</span></div>';
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("happy").innerHTML =
                  labelHtml + barHtml + valueHtml;

                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              } else if (obj == "sad") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["sad"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#FFA500" +
                  ';"></span></div>';
                var labelHtml =
                  '<div class="info"><span>' + "Sad" + "</span></div>";
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("sad").innerHTML =
                  labelHtml + barHtml + valueHtml;
                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              } else if (obj == "angry") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["angry"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#cc1717" +
                  ';"></span></div>';
                var labelHtml =
                  '<div class="info"><span>' + "Angry" + "</span></div>";
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("angry").innerHTML =
                  labelHtml + barHtml + valueHtml;
                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              } else if (obj == "disgusted") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["disgusted"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#cc1717" +
                  ';"></span></div>';
                var labelHtml =
                  '<div class="info"><span>' + "Disgusted" + "</span></div>";
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("disgusted").innerHTML =
                  labelHtml + barHtml + valueHtml;
                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              } else if (obj == "neutral") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["neutral"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#712cf9" +
                  ';"></span></div>';
                var labelHtml =
                  '<div class="info"><span>' + "Neutral" + "</span></div>";
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("neutral").innerHTML =
                  labelHtml + barHtml + valueHtml;
                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              } else if (obj == "surprised") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["surprised"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#712cf9" +
                  ';"></span></div>';
                var labelHtml =
                  '<div class="info"><span>' + "Surprised" + "</span></div>";
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("surprised").innerHTML =
                  labelHtml + barHtml + valueHtml;
                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              } else if (obj == "fearful") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["fearful"]) * 10
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                var barHtml =
                  '<div class="progress-line"><span style="width: ' +
                  expressionNumber +
                  "%; background: " +
                  "#FFA500" +
                  ';"></span></div>';
                var labelHtml =
                  '<div class="info"><span>' + "Fearful" + "</span></div>";
                var valueHtml =
                  '<div class="value-display">' + expressionNumber + "</div>";

                document.getElementById("fearful").innerHTML =
                  labelHtml + barHtml + valueHtml;
                // customerResponse+= `${time} Facial Expression: ${obj}: ${expressionNumber}\n`
              }
            });

            ////console.log(Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b))
            //let date = new Date();
            //let showTime = date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds();
            //expressions[(new Date).getTime()] = Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)
            ////console.log(expressions)
            /*
						if(Number((new Date).getTime()) - last_speech_recognised_timestamp <= 1000){
							expressions_transcript[(new Date).getTime()] = {"emotion" : Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)}

							//console.log(expressions_transcript)
							
							speechDiv.innerHTML = speechDiv.innerHTML + Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b) + `[...]\r\n`;
							speechDiv.scrollTop = speechDiv.scrollHeight;
						}
						*/
            if (
              Number(new Date().getTime()) - last_speech_recognised_timestamp <=
              3000
            ) {
              if (
                expressions_transcript[
                  Object.keys(expressions_transcript)[
                    Object.keys(expressions_transcript).length - 1
                  ]
                ].transcript
              ) {
                expressions_transcript[new Date().getTime()] = {
                  emotion: Object.keys(detections[0].expressions).reduce(
                    (a, b) =>
                      detections[0].expressions[a] >
                      detections[0].expressions[b]
                        ? a
                        : b
                  ),
                };

                ////console.log(expressions_transcript)

                //speechDiv.innerHTML = speechDiv.innerHTML + Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b) + `[...]\r\n`;
                //speechDiv.scrollTop = speechDiv.scrollHeight;

                // conversation_history += '\nCustomer Emotion: '+ Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)

                ////console.log(conversation_history)
              }
            }
          }
        }
      } else {
        //clearInterval(interval)
      }
    }, 1000);
  };

  const muteMySelf = () => {
    setMuted(!muted);
    //console.log(`942--> ${muted}`);
    // if(muted==true){
    socketRef.current.emit("mute:me", { roomID, person });
    // stopContinuousRecognition();
    // } else {
    // 	socketRef.current.emit("mute:me",{roomID, person })
    // }
  };

  const unmuteMySelf = () => {
    setMuted(!muted);
    socketRef.current.emit("unmute:me", { roomID, person });
    // doContinuousRecognition();
  };

  const toggleVideo = () => {
    //console.log("Function Called");
    setWebCamStatus(!webCamStatus);
    let track = stream.getTracks()[1];
    //console.log(track);
    //console.log(webCamStatus);
    if (webCamStatus) {
      track.enabled = false;
      //console.log(userVideo);
    } else {
      track.enabled = true;
      //console.log(userVideo);
      setWebCamStatus(true);
      // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      // 	userVideo.current.srcObject = stream;
      // 	setStream(stream)
      // });
    }
  };

  function getCurrentDate() {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    return `${day}-${month}-${year}`;
  }
  // //console.log(clientVideo.current.srcObject);
  // const isCameraOff = stream.getTracks()[1].enabled;

  async function recording() {
    setIsRecording(true);
    startRecording();
    // setBlobUrl(mediaBlobUrl)
  }

  const stopRecord = async () => {
    setIsRecording(false);
    stopRecording();
    setTimeout(() => {
      var bUrl = document.getElementById("bloburls").innerHTML;
      //console.log("1332-->", bUrl);
      socketRef.current.emit("upload-meeting", bUrl);
    }, 1000);
    var name = document.getElementById("Samir").innerHTML;
    //console.log("1332-->", name);
  };

  function getBlobUrl() {
    //console.log("1336-->", status);
    return mediaBlobUrl;
  }

  function getClassName(sentiment) {
    // //console.log(`1392--> ${sentiment}`);
    if (sentiment == "Positive") {
      return "green-dot";
    } else if (sentiment == "Negative") {
      return "red-dot";
    } else {
      return "grey-dot";
    }
  }

  return (
    /*
	<div>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
			{
				(person == "SalesPerson") ? 
				<>
					<p> ---------------------------------------------------------------------------------------------- </p>
					<br />
					<p> Salesmen </p>
					{peers.map((peer, index) => {
						return (
							<Video key={index} peer={peer} />
						);
					})}
					<p> ---------------------------------------------------------------------------------------------- </p>
					<br />
					<p> Client </p>
					{ClientPeers.map((peer, index) => {
						return (
							<ClientVideo1 key={index} peer={peer} />
						);
					})}
				</>
				:
				<>
					<p> ---------------------------------------------------------------------------------------------- </p>
					<br />
					<p> Salesmen 2 </p>
					{peers.map((peer, index) => {
						return (
							<Video key={index} peer={peer} />
						);
					})}
					<p> ---------------------------------------------------------------------------------------------- </p>
					<br />
					<p> Client 2 </p>
					{ClientPeers.map((peer, index) => {
						return (
							<ClientVideo1 key={index} peer={peer} />
						);
					})}
				</>
			}
    </div>
	*/

    <>
      {/* <div className="main fixed"> */}
      {person == "SalesPerson" ? (
        <>
          <div class="wrapper">
            <Sidebar />

            <div class="main fixed">
              {/* <header id="header" class="header">
                <nav class="navbar navbar-expand px-2 border-bottom">
                  <button
                    class="btn navbar-btn"
                    type="button"
                    data-bs-theme="dark"
                  >
                    <span class="navbar-toggler-icon"></span>
                  </button>{" "}
                  &nbsp;
                  <div className="index-logo p-2">
              <a href="#">
                magic<span>CX</span>
              </a>
            </div>
                  <div class="w-100"></div>
                  <a class="navbar-text mx-3" href="#">
                    <i class="bi bi-gear fs-5"></i>
                  </a>
                  <a class="navbar-text mx-3 pr-1 position-relative" href="#">
                    <i class="bi bi-bell fs-5 position-relative">
                      <span
                        class="badge bg-danger rounded-circle position-absolute top-0 end-0 translate-middle"
                        style={{
                          width: "10px",
                          height: "10px",
                          transform: "translate(-50%, -50%)",
                        }}
                      ></span>
                    </i>
                  </a>
                  <div class="navbar-profile mx-2">
                    <div class="profile-img">
                      <span role="button">WK</span>
                    </div>
                  </div>
                </nav>
              </header> */}
              <Header />
              <main class="content-salesman px-2 py-2">
                <div class="container-fluid">
                  <div class="row pt-3">
                    <div class="col-lg-8 col-md-6 col-sm-6  px-4">
                      <div>
                        <i class="bi bi-chevron-left fw-bold"></i> &nbsp;{" "}
                        <span class="fw-bold">Meeting Details</span>
                      </div>
                      <div>
                        <p>Recording Time: {passedTime}</p>
                      </div>
                      <div class="row pt-4 px-3">
                        <div class="col-lg-9 col-md-12 col-sm-12">
                          <div class="card">
                            <div class="salesman-video-container">
                              <div class="salesman-video">
                                {ClientPeers.map((peer, index) => {
                                  return (
                                    <div key={index} className="client-video-1">
                                      <video
                                        playsInline
                                        muted={muteClient}
                                        ref={clientVideo}
                                        autoPlay
                                      ></video>
                                    </div>
                                  );
                                })}
                              </div>
                              <div class="profile-overlay-salesman">
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
                              <div class="profile-overlay-salesman-2">
                                {DealerPeers.map((peer, index) => {
                                  return (
                                    <video
                                      key={index}
                                      playsInline
                                      muted={muteDealer}
                                      ref={dealerVideo}
                                      autoPlay
                                    ></video>
                                  );
                                })}
                              </div>
                            </div>
                            <div class="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
                              <div class="controls">
                                {/* <button class="btn control-circle">
                                  <i class="bi bi-volume-up"></i>
                                </button> */}
                                {muted ? (
                                  <button
                                    className="btn control-circle"
                                    onClick={() => unmuteMySelf()}
                                  >
                                    <i className="bi bi-mic-mute"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="btn control-circle"
                                    onClick={() => muteMySelf()}
                                  >
                                    <i className="bi bi-mic"></i>
                                  </button>
                                )}
                                <button
                                  class="btn control-circle-red"
                                  onClick={() => leaveCall()}
                                >
                                  <i class="bi bi-telephone-fill"></i>
                                </button>
                                {webCamStatus ? (
                                  <button
                                    className="btn control-circle"
                                    onClick={() => toggleVideo()}
                                  >
                                    <i className="bi bi-camera-video"></i>
                                  </button>
                                ) : (
                                  <button
                                    class="btn control-circle"
                                    onClick={() => toggleVideo()}
                                  >
                                    <i className="bi bi-camera-video-off"></i>
                                  </button>
                                )}
                                {/* <button class="btn control-circle">
                                  <i class="bi bi-people"></i>
                                </button> */}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-lg-3 col-md-12 col-sm-12 pb-res">
                          <div class="card vibeMeter">
                            <div class="card-body">
                              <div class="row chart-res text-center justify-content-center">
                                <div class="col-lg-12 col-md-10 col-sm-10">
                                  <span class="sentiment fs-5 fw-bolder vibeMeter-t">
                                    The Vibe Meter
                                  </span>
                                </div>
                                <div>
                                  <span class="vibe-t fs-6 text-nowrap p-0">
                                    Your Customer's Mood So Far
                                  </span>
                                </div>
                                <div class="vibe-img mt-3">
                                  <img src={bulb} />
                                </div>
                                <div class="mt-4">
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-white w-100 fw-bold"
                                  >
                                    Vibe Score: {vibeScore}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="row pt-3 px-3">
                        <div class="col-lg-6 col-md-12 col-sm-12 pb-res">
                          <div class="card chart">
                            <div class="card-body p-4 pt-3">
                              <div class="row chart-res">
                                <div class="col-lg-12 col-md-10 col-sm-10 pt-1">
                                  <span class="sentiment fs-3 fw-bold customer-emo">
                                    {" "}
                                    Expression Analysis
                                  </span>
                                </div>
                              </div>

                              <div class="skill-bars pt-2">
                                <div
                                  className="bar"
                                  data-label="Happy"
                                  data-value="70"
                                  data-color="#712cf9"
                                  id="happy"
                                ></div>
                                <div
                                  className="bar"
                                  data-label="Sad"
                                  data-value="30"
                                  data-color="#FFA500"
                                  id="sad"
                                ></div>
                                <div
                                  className="bar"
                                  data-label="Neutral"
                                  data-value="50"
                                  data-color="#712cf9"
                                  id="disgusted"
                                ></div>
                                <div
                                  className="bar"
                                  data-label="Content"
                                  data-value="25"
                                  data-color="#FFA500"
                                  id="neutral"
                                ></div>
                                <div
                                  className="bar"
                                  data-label="Angry"
                                  data-value="10"
                                  data-color="#cc1717"
                                  id="angry"
                                ></div>
                                <div
                                  className="bar"
                                  data-label="Surprised"
                                  data-value="10"
                                  data-color="#712cf9"
                                  id="surprised"
                                ></div>
                                <div
                                  className="bar"
                                  data-label="Fearful"
                                  data-value="30"
                                  data-color="#FFA500"
                                  id="fearful"
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="col-lg-6 col-md-12 col-sm-12 col-sm-12">
                          <div class="card chart">
                            <div class="card-body p-4 pt-3">
                              <div class="row chart-res">
                                <div class="col-lg-12 col-md-10 col-sm-10 pt-1">
                                  <span class="sentiment fs-5 fw-bold customer-vibe">
                                    Sentiment Analysis
                                  </span>
                                </div>
                              </div>
                              <div class="chart-res d-flex justify-content-center align-items-center pt-2">
                                <canvas
                                  id="sentiment-chart"
                                  aria-label="chart"
                                  height="294"
                                  width="400"
                                  data-labels="Positive, Negative, Neutral"
                                  data-data="20, 40, 22"
                                  data-bg-color="#b597f0"
                                  data-point-bg-color="#b597f0"
                                  data-border-color="black"
                                  data-border-width="1"
                                  data-point-radius="2"
                                  data-line-width="3"
                                  data-responsive="false"
                                ></canvas>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="modal fade"
                      id="tab1ModalLabel"
                      tabindex="-1"
                      aria-labelledby="tab1ModalLabel"
                      aria-hidden="true"
                    >
                      <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content">
                          <div class="modal-header px-4">
                            <button
                              type="button"
                              class="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                            ></button>
                          </div>
                          <div class="modal-body">
                            <div class="px-4">
                              <button
                                type="button"
                                class="btn btn-dark btn-sm p-2"
                              >
                                <div
                                  class="d-flex justify-content-center align-items-center"
                                  onClick={() => callOpenAI()}
                                >
                                  <div class="circle d-flex justify-content-center align-items-center">
                                    <i class="bx bx-microphone"></i>
                                  </div>
                                  <span class="text">Help Me Pitch!</span>
                                </div>
                              </button>
                            </div>
                            <div class="row pt-4 px-4">
                              {pitchInfo.map((data, index) => {
                                return (
                                  <div class="col-lg-12 col-md-12 col-sm-12" style={{ paddingBottom: "1.5em" }} key={index}
                                  >
                                    <div class="d-flex">
                                      <div class="circleBot d-flex justify-content-center align-items-center">
                                        <i class="bi bi-patch-question"></i>
                                      </div>
                                      <div class="d-flex gap-2 pb-2 align-items-center">
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
                                          <span class="timeBotText">
                                            {data.time} <span>{data.type}</span>
                                          </span>
                                        </span>
                                      </div>
                                    </div>

                                    <div class="chatBox">
                                      <p class="p-text">{data.info}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="modal fade"
                      id="tab2ModalLabel"
                      tabindex="-1"
                      aria-labelledby="tab2ModalLabel"
                      aria-hidden="true"
                    >
                      <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content">
                          <div class="modal-header px-4">
                            <button
                              type="button"
                              class="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                            ></button>
                          </div>
                          <div class="modal-body px-5" id="tabbbs">
                            <div class="row px-1">
                              <div class="col-lg-12 col-md-12 col-sm-12">
                                {chatBoxData.map((data, index) => {
                                  return (
                                    <div
                                      class="col-lg-12 col-md-12 col-sm-12"
                                      key={index}
                                    >
                                      <div
                                        class={
                                          data.name == "You"
                                            ? "d-flex justify-content-end position-relative"
                                            : "d-flex align-items-center"
                                        }
                                      >
                                        <div class="circleBotImg d-flex justify-content-center align-items-center">
                                          {/* <div class="profile-img1">
                                            <span role="button"> */}

                                          {/* </span>
								                          </div> */}
                                        </div>
                                        <div class="d-flex gap-2 pb-2 align-items-center">
                                          <span class="textBot">
                                            <Avatar
                                              name={
                                                data.name == "You"
                                                  ? "S"
                                                  : data.name
                                              }
                                              size={30}
                                              round={true}
                                            />{" "}
                                            {data.name}
                                          </span>
                                          <span class="timeBotText">
                                            {data.time}
                                          </span>
                                          <br />
                                          <span class="timeBotText">
                                            {data.email}
                                          </span>
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
                                        <p class="p-text">{data.msg}</p>
                                        <div
                                          className={getClassName(
                                            data.sentiment
                                          )}
                                        ></div>
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
                    </div>

                    <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="row h-100">
                        <div class="col-lg-12 col-md-12 col-sm-12 pb-res">
                          <div class="card genAi h-100">
                            <div class="card-body p-0">
                              <div class="tabs">
                                <input
                                  type="radio"
                                  class="tabs__radio"
                                  name="tabs-example"
                                  id="tab1"
                                  onChange={() => setTab("tab1")}
                                  checked={tab === "tab1"}
                                />
                                <label for="tab1" class="tabs__label">
                                  <i class="bx bxs-brain fs-4"></i>
                                </label>
                                <div
                                  class="tabs__content tab_1_content p-2"
                                  id="aiFeatureTab"
                                >
                                  <div class="d-flex pt-2 tab-1-buttons">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedAIFeature("pitch")
                                      }
                                      className={
                                        aiFeature == "pitch"
                                          ? "btn btn-dark btn-sm p-2"
                                          : "btn btn-light-grey btn-sm p-2"
                                      }
                                    >
                                      <div
                                        class="d-flex justify-content-center align-items-center"
                                        onClick={() => callOpenAI()}
                                      >
                                        <div class="circle d-flex justify-content-center align-items-center">
                                          <i class="bx bx-microphone"></i>
                                        </div>
                                        <span class="text">Help Me Pitch!</span>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedAIFeature("summarize")
                                      }
                                      className={
                                        aiFeature == "summarize"
                                          ? "btn btn-dark btn-sm p-2"
                                          : "btn btn-light-grey btn-sm p-2"
                                      }
                                    >
                                      <div
                                        class="d-flex justify-content-center align-items-center"
                                        onClick={() => addSummary()}
                                      >
                                        <div class="circle2 d-flex justify-content-center align-items-center">
                                          <i class="bx bxs-file"></i>
                                        </div>
                                        <span class="text">Summarize</span>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedAIFeature("productInfo")
                                      }
                                      className={
                                        aiFeature == "productInfo"
                                          ? "btn btn-dark btn-sm p-2"
                                          : "btn btn-light-grey btn-sm p-2"
                                      }
                                    >
                                      <div
                                        class="d-flex justify-content-center align-items-center"
                                        onClick={() => addProductInfo()}
                                      >
                                        <div class="circle3 d-flex justify-content-center align-items-center">
                                          <i class="bx bxs-detail"></i>
                                        </div>
                                        <span class="text">Product Info</span>
                                      </div>
                                    </button>
                                  </div>

                                  <div class="row px-2 pt-1 showAll">
                                    <div class="col-lg-12 col-md-12 col-sm-12">
                                      <div class="text-end">
                                        <p class="mb-1">
                                          <span
                                            class="text-showAll"
                                            data-bs-toggle="collapse"
                                            href="#collapseExample"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="collapseExample"
                                          >
                                            {" "}
                                            Show all
                                          </span>
                                          <i class="bi bi-caret-down-fill icon-s"></i>
                                        </p>
                                      </div>
                                    </div>

                                    <div
                                      class="collapse p-1 pb-2"
                                      id="collapseExample"
                                    >
                                      <div class="">
                                        <div class="d-flex gap-3 pt-2 tab-1-buttons">
                                          <button
                                            type="button"
                                            class="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div
                                              class="d-flex justify-content-center align-items-center"
                                              onClick={() => callOpenAI()}
                                            >
                                              <div class="circle2 d-flex justify-content-center align-items-center">
                                                <i class="bx bx-microphone"></i>
                                              </div>
                                              <span class="text">
                                                Help me Pitch!
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            class="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div class="d-flex justify-content-center align-items-center">
                                              <div class="circle2 d-flex justify-content-center align-items-center">
                                                <i class="bx bxs-file"></i>
                                              </div>
                                              <span class="text">
                                                Summarize
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedAIFeature(
                                                "productInfo"
                                              )
                                            }
                                            className={
                                              aiFeature == "productInfo"
                                                ? "btn btn-dark btn-sm p-2"
                                                : "btn btn-light-grey btn-sm p-2"
                                            }
                                          >
                                            <div class="d-flex justify-content-center align-items-center">
                                              <div class="circle3 d-flex justify-content-center align-items-center">
                                                <i class="bx bxs-detail"></i>
                                              </div>
                                              <span class="text">
                                                Product Info
                                              </span>
                                            </div>
                                          </button>
                                        </div>
                                        <div class="d-flex gap-3 pt-2 tab-1-buttons">
                                          <button
                                            type="button"
                                            class="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div
                                              class="d-flex justify-content-center align-items-center"
                                              onClick={() => callOpenAI()}
                                            >
                                              <div class="circle2 d-flex justify-content-center align-items-center">
                                                <i class="bx bx-microphone"></i>
                                              </div>
                                              <span class="text">
                                                Help me Pitch!
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            class="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div class="d-flex justify-content-center align-items-center">
                                              <div class="circle2 d-flex justify-content-center align-items-center">
                                                <i class="bx bxs-file"></i>
                                              </div>
                                              <span class="text">
                                                Summarize
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            class="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div class="d-flex justify-content-center align-items-center">
                                              <div class="circle3 d-flex justify-content-center align-items-center">
                                                <i class="bx bxs-detail"></i>
                                              </div>
                                              <span class="text">
                                                Product Info
                                              </span>
                                            </div>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div class="row pt-2 tabExpandBorder">
                                    <div class="col-lg-12 col-md-12 col-sm-12">
                                      <div class="d-flex justify-content-end ">
                                        <i
                                          class="bi bi-arrows-angle-expand btn btn-primary"
                                          type="button"
                                          data-bs-toggle="modal"
                                          data-bs-target="#tab1ModalLabel"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>

                                  <div class="row pt-1 px-3">
                                    {pitchInfo.map((data, index) => {
                                      return (
                                        <div
                                          class="col-lg-12 col-md-12 col-sm-12"
                                          style={{ paddingBottom: "1.5em" }}
                                          key={index}
                                        >
                                          <div class="d-flex">
                                            <div class="circleBot d-flex justify-content-center align-items-center">
                                              <i class="bi bi-patch-question"></i>
                                            </div>
                                            <div class="d-flex gap-2 pb-2 align-items-center">
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
                                                <span class="timeBotText">
                                                  {data.time}{" "}
                                                  <span>{data.type}</span>
                                                </span>
                                              </span>
                                            </div>
                                          </div>

                                          <div class="chatBox">
                                            <p class="p-text">{data.info}</p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <input
                                  type="radio"
                                  class="tabs__radio"
                                  name="tabs-example"
                                  id="tab2"
                                  onChange={() => setTab("tab2")}
                                  checked={tab === "tab2"}
                                />
                                <label for="tab2" class="tabs__label">
                                  <i class="bx bxs-message fs-4"></i>
                                </label>
                                <div
                                  class="tabs__content tab_2_content"
                                  id="tabs"
                                >
                                  <div class="row">
                                    <div class="col-lg-12 col-md-12 col-sm-12">
                                      <div class="d-flex justify-content-end ">
                                        <i
                                          class="bi bi-arrows-angle-expand btn btn-primary"
                                          type="button"
                                          data-bs-toggle="modal"
                                          data-bs-target="#tab2ModalLabel"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>

                                  <div class="row px-1">
                                    {chatBoxData.map((data, index) => {
                                      return (
                                        <div
                                          class="col-lg-12 col-md-12 col-sm-12"
                                          key={index}
                                        >
                                          <div
                                            class={
                                              data.name == "You"
                                                ? "d-flex justify-content-end position-relative"
                                                : "d-flex align-items-center"
                                            }
                                          >
                                            <div class="circleBotImg d-flex justify-content-center align-items-center">
                                              {/* <Avatar
                                                size={30}
                                                round={true}
                                                name={
                                                  data.name == "You"
                                                    ? "S"
                                                    : data.name
                                                }
                                              /> */}
                                            </div>
                                            <div class="d-flex gap-2 pb-2 align-items-center">
                                              <span class="textBot">
                                                <Avatar
                                                  size={30}
                                                  round={true}
                                                  name={
                                                    data.name == "You"
                                                      ? "S"
                                                      : data.name
                                                  }
                                                />{" "}
                                                {data.name}
                                              </span>
                                              <span class="timeBotText">
                                                {data.time}
                                              </span>
                                              <br />
                                              <span class="timeBotText">
                                                {data.email}
                                              </span>
                                            </div>
                                          </div>
                                          <div
                                            className={data.name == "Client"  ? "chatBox-1 position-relative"  : data.name == "You"  ? "chatBox-2 position-relative"  : "chatBox-3 position-relative"}
                                          >
                                            <p class="p-text">{data.msg}</p>
                                            <div className={getClassName(   data.sentiment )}></div>
                                          </div>
                                          <br></br>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <input type="radio" class="tabs__radio" name="tabs-example" id="tab3" onChange={() => setTab("tab3")} checked={tab === "tab3"}/>
                                <label for="tab3" class="tabs__label">
                                  <i class="bx bxs-file fs-4"></i>
                                </label>
                                <div class="tabs__content tab_1_content p-2" id="aiFeatureTab">
                                  {pdfFiles.map((data, index) => {
                                    return (
                                      <div class="col-lg-12 col-md-12 col-sm-12" style={{ paddingBottom: "1.5em" }} key={index}>
                                    <div class="d-flex">
                                      <div class="d-flex gap-2 pb-2 align-items-center">
                                        <span>magic<span style={{   color: "#D273F2",   fontSize: "1rem", }}>CX</span>{" "}</span>
                                      </div>
                                    </div>

                                    <div class="chatBox">
                                    <span>Visit here for {data.name}</span>: <a href={data.path} rel="noopener" target="_blank" className="p-text" style={{color: '#006EDF',textDecoration:'underline'}}> {data.name} </a> 
                                    </div>
                                  </div>
                                    );
                                  })}
                                </div>

                                <input type="radio" class="tabs__radio" name="tabs-example" id="tab4" onChange={() => setTab("tab4")} checked={tab === "tab4"}/>
                                <label for="tab4" class="tabs__label">
                                  <i class="bx bxs-video fs-4"></i>
                                </label>
                                <div class="tabs__content tab_1_content p-2" id="aiFeatureTab">
                                <div class="col-lg-12 col-md-12 col-sm-12" style={{ paddingBottom: "1.5em" }}>
                                    <div class="d-flex">
                                      <div class="d-flex gap-2 pb-2 align-items-center">
                                        <span>magic<span style={{   color: "#D273F2",   fontSize: "1rem", }}>CX</span>{" "}</span>
                                      </div>
                                    </div>

                                    <div class="chatBox" onClick={()=>{
                                      // <Redire
                                    }}>
                                    <ReactPlayer url='/document/MagicCX.mp4' height="20%" width="100%" onClick={()=>{
                                      window.open("/document/MagicCX.mp4")
                                    }}
                                    controls
                                    />
                                    </div>
                                  </div>
                                  {/* <div class="row pt-1 px-3">
                                    <ReactPlayer url="https://ak.picdn.net/shutterstock/videos/1070767552/preview/stock-footage-beef-burger-ingredients-falling-and-landing-in-the-bun-one-by-one-in-slow-motion-fps.webm" playing loop autoPlay height="20%" width="100%"/>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </>
      ) : person == "Client" ? (
        <>
          <main className="content-client  px-3 py-2">
            <div className="container-fluid">
              <div className="row mt-3 ">
                <div className="col-lg-12 col-md-12 col-sm-12">
                  <div className="row pt-3">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                      <div className="card">
                        <div className="client-video-container">
                          {
                            //(peers.length == 1) &&
                            //<ClientVideo1 peer={peers[0]} />
                          }
                          {
                            //(peers.length == 2) &&
                            //<>
                            //<ClientVideo1 peer={peers[0]} />
                            //</><ClientVideo2 peer={peers[1]} />
                            //</>
                          }
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
                          {DealerPeers.map((peer, index) => {
                            return (
                              <video
                                key={index}
                                playsInline
                                muted={muteDealer}
                                ref={dealerVideo}
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
                            {/* <button className="btn control-circle-client">
                              <i className="bi bi-volume-up"></i>
                            </button> */}
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
                            {/* <button className="btn control-circle-client" onClick={()=>muteMySelf()}>
																<i className={muted?"bi bi-mic-mute": "bi bi-mic"}></i>
															</button> */}
                            <button
                              className="btn control-circle-red-client"
                              onClick={() => leaveCall()}
                            >
                              <i className="bi bi-telephone-fill"></i>
                            </button>
                            {webCamStatus ? (
                              <button
                                class="btn control-circle-client"
                                onClick={() => toggleVideo()}
                              >
                                <i className="bi bi-camera-video"></i>
                              </button>
                            ) : (
                              <button
                                class="btn control-circle-client"
                                onClick={() => toggleVideo()}
                              >
                                <i className="bi bi-camera-video-off"></i>
                              </button>
                            )}
                            {/* <button className="btn control-circle-client">
                              <i className="bi bi-people"></i>
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <>
          <main className="content-client  px-3 py-2">
            <div className="container-fluid">
              <div className="row mt-3 ">
                <div className="col-lg-12 col-md-12 col-sm-12">
                  <div className="row pt-3">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                      <div className="card">
                        <div className="client-video-container">
                          {
                            //(peers.length == 1) &&
                            //<ClientVideo1 peer={peers[0]} />
                          }
                          {
                            //(peers.length == 2) &&
                            //<>
                            //<ClientVideo1 peer={peers[0]} />
                            //</><ClientVideo2 peer={peers[1]} />
                            //</>
                          }
                          {peers.map((peer, index) => {
                            return (
                              <video
                                key={peer.peerID}
                                playsInline
                                ref={salespersonVideo}
                                muted={muteSalesPerson}
                                autoPlay
                              ></video>
                            );
                          })}
                          {ClientPeers.map((peer, index) => {
                            return (
                              <video
                                key={index}
                                playsInline
                                muted={muteClient}
                                ref={clientVideo}
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
                            {/* <button className="btn control-circle-client">
                              <i className="bi bi-volume-up"></i>
                            </button> */}
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
                            {/* <button className="btn control-circle-client" onClick={()=>muteMySelf()}>
																<i className={muted?"bi bi-mic-mute": "bi bi-mic"}></i>
															</button> */}
                            <button
                              className="btn control-circle-red-client"
                              onClick={() => leaveCall()}
                            >
                              <i className="bi bi-telephone-fill"></i>
                            </button>
                            {webCamStatus ? (
                              <button
                                class="btn control-circle-client"
                                onClick={() => toggleVideo()}
                              >
                                <i className="bi bi-camera-video"></i>
                              </button>
                            ) : (
                              <button
                                class="btn control-circle-client"
                                onClick={() => toggleVideo()}
                              >
                                <i className="bi bi-camera-video-off"></i>
                              </button>
                            )}
                            {/* <button className="btn control-circle-client">
                              <i className="bi bi-people"></i>
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
      {/* </div> */}
    </>
  );
}
// const Video = (props) =>{
//     var ref = useRef();

//     useEffect(()=>{
//         props.peer.on("stream",(stream)=>{
//             ref.current.srcObject = stream;
//         })
//     },[])
//     return(
//         <video playsInline autoPlay muted ref={ref} style={{width: 300}}/>
//     )
// }
export default Dashboard;

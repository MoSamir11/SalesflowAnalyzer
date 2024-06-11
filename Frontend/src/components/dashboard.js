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
import img1 from "./images/image-1.png";
import { deepOrange, deepPurple } from "@mui/material/colors";
import Avatar from "react-avatar";
import LoginModal from "./login/login-modal.js";
import { Sidebar } from "./sedebar.js";
import { Header } from "./common_comp/header.js";
import ReactPlayer from "react-player";
import MagicCX from "./document/MagicCX.mp4";
// import PDFViewer from "./common_comp/pdf-viewer.js";
import Charts from "react-apexcharts";
// components import
import VibeMeter from "./dashboardComp/VibeMeter.js";
import ExpressionAnalysis from "./dashboardComp/ExpressionAnalysis.js";
import SentimentAnalysis from "./dashboardComp/SentimentAnalysis.js";
import ChartComponent from "./dashboardComp/Chart.js";
import ClientDealerView from "./dashboardComp/ClientDealerView.js";

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
  // console.log(chatroom);
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
  let [customerResp, setCustomerResp] = useState("");
  ////console.log(peers)
  ////console.log(ClientPeers)

  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email"));
  const [person, setPerson] = useState(searchParams.get("person"));
  const [userEmail, setUserEmail] = useState(searchParams.get("email"));
  const [chatBoxData, setChatBoxData] = useState([]);
  const [pitchInfo, setPitchInfo] = useState([]);
  const [summary, setSummary] = useState("");
  let userAudioStream = undefined;
  let [passedTime, setTimePassed] = useState("00:00:00");
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
  // let url = "https://magiccx.azurewebsites.net/";
  const [selected, setSelected] = useState(true);
  const [salesPersonLeave, setSalesPersonLeave] = useState(false);
  const toggle = () => {
    // if (selected == i) {
    //   return setSelected(null);
    // }
    setSelected(!selected);
  };
  const accordianData = [
    {
      question: "Question 1",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      question: "Question 2",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
  ];
  let chartState = {
    options: {
      colors: ["#D273F2", "#6f42c1"],
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [],
      },
    },
    series: [
      {
        name: "Expression Score",
        data: [],
      },
      {
        name: "Sentiment Scroe",
        data: [],
      },
    ],
  };
  var expression_array = [];
  var expression_time = [];
  var sentiment_array = [];
  let url = "http://localhost:3000/";
  const pdfFiles = [
    { name: "Introduction", path: `${url}document/Introduction.pdf` },
    { name: "Features", path: `${url}document/Features.pdf` },
    {
      name: "Summary",
      path: `${url}document/Summarization and Product Info.pdf`,
    },
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
        setRoomID(roomID);
        doContinuousRecognition();
        socketRef.current.on("all users", (users) => {
          let peers = [];
          let client_peers = [];
          let dealer_peers = [];
          users.forEach((obj) => {
            // //console.log(`146--> ${JSON.stringify(obj.audio)}`);
            const peer = createPeer(
              obj.id,
              socketRef.current.id,
              stream,
              obj.role
            );
            peersRef.current.push({ peerID: obj.id, peer });
            if (obj.role == "SalesPerson") {
              peer.on("stream", (stream) => {
                salespersonVideo.current.srcObject = stream;
                ////console.log(salespersonVideo)
              });
              setSalespersonSocketId(obj.id);
              peers = [];
              setPeers([]);
              peers.push(peer);
              setMuteSalesPerson(!obj.audio);
              callSentimentScore();
            } else if (obj.role == "Client") {
              peer.on("stream", (stream) => {
                clientVideo.current.srcObject = stream;
                setClientStream(stream);
              });
              client_peers = [];
              setClientPeers([]);
              client_peers.push(peer);
              //delay(3000)
              loadModels();
              setMuteClient(!obj.audio);
              // doContinuousRecognition()
            } else if (obj.role == "Dealer") {
              peer.on("stream", (stream) => {
                dealerVideo.current.srcObject = stream;
              });
              dealer_peers = [];
              setDealerPeers([]);
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

        socketRef.current.on("disconnected", async (data) => {
          // console.log("363-->", data);
          if (data.role == "Client") {
            setClientPeers([]);
            setClientStream(null);
          } else if (data.role == "Dealer") {
            setDealerPeers([]);
            setDealerStream(null);
          }
          // setClientPeers([])
        });

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

        socketRef.current.on("leave:room", (data) => {
          // console.log("406-->", data);
          if (data.role == "Dealer") {
            setDealerPeers([]);
            setDealerStream(null);
          } else if (data.role == "Client") {
            setClientPeers([]);
            setClientStream(null);
          }
        });
      });

    Initialize(async function (speechSdkParam) {
      SpeechSDK = speechSdkParam;

      // in case we have a function for getting an authorization token, call it.
      if (typeof RequestAuthorizationToken === "function") {
        await RequestAuthorizationToken();
      }
    });

    var time = 0;
    setInterval(() => {
      time += 1;
      let hours = String(Math.floor(time / 3600)).padStart(2, "0");
      let minutes = String(Math.floor(time / 60)).padStart(2, "0");
      let sec = String(time % 60).padStart(2, "0");
      $("#timer").text(`${hours}: ${minutes}: ${sec}`);
      setTimePassed(`${hours}: ${minutes}: ${sec}`);
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

  const leaveCall = async () => {
    // console.log("452-->", customerResp);
    // console.log("453-->", conversation);
    if (person === "SalesPerson") {
      // setSalesPersonLeave(true);
      // var conversationSummary = await addSummary();
      // console.log("454-->", conversationSummary);
      socketRef.current.emit("salesperson-disconnected", {
        roomID: roomID,
        id: socketRef.current.id,
        msg: "", //conversationSummary,
        sentiment: customerResp,
        history: conversation,
      });
      window.location.href = "/";
      return;
    }

    socketRef.current.emit("disconnectUser", {
      roomId: roomID,
      id: socketRef.current.id,
      msg: conversation,
      person: person,
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
        ...prevState,
      ]);
      // document.getElementById("aiFeatureTab").scrollTop =
      //   document.getElementById("aiFeatureTab").scrollHeight;
    } catch (err) {
      // console.error(err);
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
        .toLocaleString([], { hour: "numeric", minute: "2-digit" })
        .toUpperCase();
      setSummary(text);
      setPitchInfo((prevState) => [
        { info: text, time: time, type: "Summary" },
        ...prevState,
      ]);
      return text;
    } catch (e) {
      // console.log("568-->", e);
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
    // console.log("569-->", time);
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

    // console.log("543 customerResponse-->", customerResponse);

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      // console.log("550-->", chatCompletion);
      const text = chatCompletion.choices[0].message.content;
      //return text;
      // console.log("553-->", text);
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
      // console.error(`575--> ${err}`);
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

      // if (socketRef.current) {
      //loadModels()
      socketRef.current.on("sendMSGToSalesmen", async (data) => {
        if (data.userType == "Client") {
          conversation_history += `${getCurrentDate()} ${data.time.toUpperCase()} : ${
            data.userType
          } : ${data.sentiment} : ${facialExp} : ${data.message}\n`;
          customerResponse += `${data.time}: Speech Expression: ${data.sentiment}\n`;
          setCustomerResp(customerResponse);
          // console.log(`783--> ${customerResponse}`);
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
      // }
    }
  }, []);

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
      var userSentiment = result["overall_sentiment"];
      var userSentimentScore =
        userSentiment === "neutral"
          ? 0
          : userSentiment === "positive"
          ? 100
          : -100;
      sentiment_array = [...sentiment_array, userSentimentScore];

      // console.log('971-->',expression_time);
      // setChartState((prevState) => ({
      //   ...prevState,
      //   options: {
      //     ...prevState.options,
      //     xaxis: {
      //       ...prevState.options.xaxis,
      //       categories: expression_time,
      //     },
      //   },
      //   series: [
      //     {
      //       ...prevState.series[0],
      //       data: expression_array,
      //     },
      //     {
      //       ...prevState.series[1],
      //       data: sentiment_array,
      //     },
      //   ],
      // }));
      // console.log(`968--> ${userSentimentScore}`);
      chartState = {
        ...chartState,
        options: {
          ...chartState.options,
          xaxis: {
            ...chartState.options.xaxis,
            categories: expression_time,
          },
        },
        series: [
          {
            name: "Expression Score",
            data: expression_array,
          },
          {
            name: "Sentiment Score",
            data: sentiment_array,
          },
        ],
      };
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
    try {
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
    } catch (e) {
      console.log("Speech Error-->", e);
    }
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
    try {
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
            await socketRef.current.emit("sendMSG", {
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
    } catch (e) {
      console.log("Speech Error-->", e);
    }
  }

  function onSessionStarted(sender, sessionEventArgs) {}

  function onSessionStopped(sender, sessionEventArgs) {}

  function onCanceled(sender, cancellationEventArgs) {
    // window.console.log(cancellationEventArgs);
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
            // console.log(
            //   "1230-->",
            //   Object.keys(detections[0].expressions).reduce((a, b) =>
            //     detections[0].expressions[a] > detections[0].expressions[b]
            //       ? a
            //       : b
            //   )
            // );
            var fExp = Object.keys(detections[0].expressions).reduce((a, b) =>
              detections[0].expressions[a] > detections[0].expressions[b]
                ? a
                : b
            );
            customerResponse += `${time} Facial Expression: ${fExp}\n`;
            setCustomerResp(customerResponse);
            var maxExp = [];
            ExpressionKeyArray.map((obj) => {
              // console.log("962--> ", obj);
              facialExp = obj;

              setClientFE(obj);
              // console.log(`962--> 2. ${obj}`);

              if (obj == "happy") {
                let expressionNumber = Math.floor(
                  Number(detections[0].expressions["happy"]) * 100
                );
                if (expressionNumber == 0) {
                  expressionNumber = 1;
                }
                // console.log("1247--> happy", expressionNumber);
                // expression_array = [...expression_array, expressionNumber];
                // maxExp.push({ sentiment: "happy", score: expressionNumber });

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
                maxExp.push({ sentiment: "sad", score: expressionNumber });
                // console.log("1247--> sad", expressionNumber);
                // expression_array = [...expression_array,expressionNumber];
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
                maxExp.push({ sentiment: "angry", score: expressionNumber });
                // console.log("1247--> angry", expressionNumber);
                // expression_array = [...expression_array,expressionNumber];
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
                maxExp.push({
                  sentiment: "disgusted",
                  score: expressionNumber,
                });
                // console.log("1247--> disgusted", expressionNumber);
                // expression_array = [...expression_array,expressionNumber];
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
                maxExp.push({ sentiment: "neutral", score: expressionNumber });
                // console.log("1247--> neutral", expressionNumber);
                // expression_array = [...expression_array,expressionNumber];
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
                maxExp.push({
                  sentiment: "surprised",
                  score: expressionNumber,
                });
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
                maxExp.push({ sentiment: "fearful", score: expressionNumber });
                // console.log("1247--> fearful", expressionNumber);
                // expression_array = [...expression_array,expressionNumber];
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

            var maximumSentiment = maxExp.reduce((max, current) => {
              return current.score > max.score ? current : max;
            });
            if (maximumSentiment["sentiment"] === "happy") {
              expression_array = [
                ...expression_array,
                Math.floor(maximumSentiment["score"]),
              ];
            } else if (maximumSentiment["sentiment"] === "content") {
              expression_array = [...expression_array, 50];
            } else if (maximumSentiment["sentiment"] === "surprised") {
              expression_array = [...expression_array, 50];
            } else if (maximumSentiment["sentiment"] === "neutral") {
              expression_array = [...expression_array, 0];
            } else if (maximumSentiment["sentiment"] === "angry") {
              expression_array = [...expression_array, -100];
            } else if (maximumSentiment["sentiment"] === "fearful") {
              expression_array = [...expression_array, -100];
            } else if (maximumSentiment["sentiment"] === "sad") {
              expression_array = [...expression_array, -100];
            }
            // console.log("1408-->", maxExp,maximumSentiment['score']);
            // expression_time.push(getTime().split(" ")[0]);

            // expression_time = [...expression_time, getTime().split(" ")[0]];
            // console.log(
            //   "1505-->",
            //   expression_time,
            //   sentiment_array,
            //   expression_array
            // );
            // setChartState((prevState) => ({
            //   ...prevState,
            //   options: {
            //     ...prevState.options,
            //     xaxis: {
            //       ...prevState.options.xaxis,
            //       categories: expression_time,
            //     },
            //   },
            //   series: [
            //     {
            //       ...prevState.series[0],
            //       data: expression_array,
            //     },
            //     {
            //       ...prevState.series[1],
            //       data: sentiment_array,
            //     },
            //   ],
            // }));
            // console.log('1524-->',expression_array);
            maxExp = [];

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

                // console.log(conversation_history);
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
      // socketRef.current.emit("upload-meeting", bUrl);
    }, 1000);
    var name = document.getElementById("bloburls").innerHTML;
    // console.log("1332-->", name, mediaBlobUrl);
    const response = await fetch(mediaBlobUrl);
    const blob = await response.blob();
    // console.log("1579-->", blob);
    return blob;
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

  async function recording() {
    setIsRecording(true);
    startRecording();
    // setBlobUrl(mediaBlobUrl)
  }

  return (
    <>
      {person == "SalesPerson" ? (
        <>
          <div className="wrapper">
            <Sidebar />

            <div className="main fixed">
              {/* <header id="header" className="header">
                <nav className="navbar navbar-expand px-2 border-bottom">
                  <button className="btn navbar-btn" type="button" data-bs-theme="dark">
                    <span className="navbar-toggler-icon"></span>
                  </button>{" "}
                  &nbsp;
                  <div className="index-logo p-2">
              <a href="#">
                magic<span>CX</span>
              </a>
            </div>
                  <div className="w-100"></div>
                  <a className="navbar-text mx-3" href="#">
                    <i className="bi bi-gear fs-5"></i>
                  </a>
                  <a className="navbar-text mx-3 pr-1 position-relative" href="#">
                    <i className="bi bi-bell fs-5 position-relative">
                      <span
                        className="badge bg-danger rounded-circle position-absolute top-0 end-0 translate-middle"
                        style={{
                          width: "10px",
                          height: "10px",
                          transform: "translate(-50%, -50%)",
                        }}
                      ></span>
                    </i>
                  </a>
                  <div className="navbar-profile mx-2">
                    <div className="profile-img">
                      <span role="button">WK</span>
                    </div>
                  </div>
                </nav>
              </header> */}
              <Header />
              <main className="content-salesman">
                <div className="container-fluid">
                  <div className="row pt-2">
                    <div className="col-lg-8 col-md-6 col-sm-6">
                      <div className="row px-3">
                        <div className="col-lg-9 col-md-12 col-sm-12">
                          <div className="card">
                            <div className="salesman-video-container">
                              <div className="salesman-video">
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
                              <div className="profile-overlay-salesman">
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
                              <div className="profile-overlay-salesman-2">
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
                            <div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
                              <div className="controls">
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
                                  className={`${
                                    !salesPersonLeave
                                      ? "btn control-circle-red-client"
                                      : "border-0"
                                  }`}
                                  onClick={() => leaveCall()}
                                  disabled={salesPersonLeave}
                                >
                                  {!salesPersonLeave ? (
                                    <i class="bi bi-telephone-fill"></i>
                                  ) : (
                                    <div
                                      className="spinner-border text-danger"
                                      role="status"
                                    >
                                      <span className="visually-hidden">
                                        Loading...
                                      </span>
                                    </div>
                                  )}
                                  {/* <i class="bi bi-telephone-fill"></i>  */}
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
                                    className="btn control-circle"
                                    onClick={() => toggleVideo()}
                                  >
                                    <i className="bi bi-camera-video-off"></i>
                                  </button>
                                )}
                                {/* <button className="btn control-circle">
                                  <i className="bi bi-people"></i>
                                </button> */}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-3 col-md-12 col-sm-12 pb-res">
                          <VibeMeter vibeScore={vibeScore} />
                        </div>
                        {/* {(status === "idle" || status === "permission-requested" || status === "error") && (
                        <button onClick={() => recording()}>
                          Start recording
                        </button>
                        )}
                        {(status === "recording" || status === "paused") && (
                        <button onClick={() => stopRecord()}>Stop recording</button>
                        )}
					              <p id="bloburls">{mediaBlobUrl}</p>
					              <p id="Samir">Hello World</p> */}
                      </div>

                      <div className="row px-3">
                        {/* <div className="col-lg-4 col-md-12 col-sm-12 pb-res">
                          <div className="card chart">
                            <div className="card-body p-4 pt-3">
                              <div className="row chart-res">
                                <div className="col-lg-12 col-md-10 col-sm-10 pt-1">
                                  <span className="sentiment fs-3 fw-bold customer-emo">
                                    {" "}
                                    Expression Analysis
                                  </span>
                                </div>
                              </div>

                              <div className="skill-bars pt-2">
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

                        <div className="col-lg-4 col-md-12 col-sm-12 col-sm-12">
                          <div className="card chart">
                            <div className="card-body p-4 pt-3">
                              <div className="row chart-res">
                                <div className="col-lg-12 col-md-10 col-sm-10 pt-1">
                                  <span className="sentiment fs-5 fw-bold customer-vibe">
                                    Sentiment Analysis
                                  </span>
                                </div>
                              </div>
                              <div className="chart-res d-flex justify-content-center align-items-center pt-2">
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
                        </div> */}

                        <div className="col-lg-12 col-md-12 col-sm-12 col-sm-12">
                          <div className="wrapper-accordian">
                            <div className="accordian">
                              <div className="">
                                <div className="title" onClick={() => toggle()}>
                                  <p></p>
                                  <span style={{ fontSize: "1rem" }}>
                                    {selected ? "-" : "+"}
                                  </span>
                                </div>
                                <div
                                  className={
                                    selected ? "content show" : "content"
                                  }
                                  style={{ display: "flex" }}
                                >
                                  <div className="col-lg-6 col-md-12 col-sm-12 pb-res">
                                    <ExpressionAnalysis />
                                  </div>

                                  <div
                                    className="col-lg-6 col-md-12 col-sm-12 col-sm-12"
                                    style={{ paddingLeft: "10px" }}
                                  >
                                    <SentimentAnalysis />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="wrapper-accordian">
                          <ChartComponent
                            chartState={chartState}
                            selected={selected}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="modal fade"
                      id="tab1ModalLabel"
                      tabIndex="-1"
                      aria-labelledby="tab1ModalLabel"
                      aria-hidden="true"
                    >
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
                          <div className="modal-body">
                            <div className="px-4">
                              <button
                                type="button"
                                className="btn btn-dark btn-sm p-2"
                              >
                                <div
                                  className="d-flex justify-content-center align-items-center"
                                  onClick={() => callOpenAI()}
                                >
                                  <div className="circle d-flex justify-content-center align-items-center">
                                    <i className="bx bx-microphone"></i>
                                  </div>
                                  <span className="text">Help Me Pitch!</span>
                                </div>
                              </button>
                            </div>
                            <div className="row pt-4 px-4">
                              {pitchInfo.map((data, index) => {
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="modal fade"
                      id="tab2ModalLabel"
                      tabIndex="-1"
                      aria-labelledby="tab2ModalLabel"
                      aria-hidden="true"
                    >
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
                                    <div
                                      className="col-lg-12 col-md-12 col-sm-12"
                                      key={index}
                                    >
                                      <div
                                        className={
                                          data.name == "You"
                                            ? "d-flex justify-content-end position-relative"
                                            : "d-flex align-items-center"
                                        }
                                      >
                                        <div className="circleBotImg d-flex justify-content-center align-items-center">
                                          {/* <div className="profile-img1">
                                            <span role="button"> */}

                                          {/* </span>
								                          </div> */}
                                        </div>
                                        <div className="d-flex gap-2 pb-2 align-items-center">
                                          <span className="textBot">
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
                                          <span className="timeBotText">
                                            {data.time}
                                          </span>
                                          <br />
                                          <span className="timeBotText">
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
                                        <p className="p-text">{data.msg}</p>
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

                    <div className="col-lg-4 col-md-6 col-sm-6">
                      <div className="row h-100">
                        <div className="col-lg-12 col-md-12 col-sm-12 pb-res">
                          <div className="card genAi h-100">
                            <div className="card-body p-0">
                              <div className="tabs">
                                <input
                                  type="radio"
                                  className="tabs__radio"
                                  name="tabs-example"
                                  id="tab1"
                                  onChange={() => setTab("tab1")}
                                  checked={tab === "tab1"}
                                />
                                <label htmlFor="tab1" className="tabs__label">
                                  <i className="bx bxs-brain fs-4"></i>
                                </label>
                                <div
                                  className="tabs__content tab_1_content p-2"
                                  id="aiFeatureTab"
                                >
                                  <div className="d-flex pt-2 tab-1-buttons">
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
                                        className="d-flex justify-content-center align-items-center"
                                        onClick={() => callOpenAI()}
                                      >
                                        <div className="circle d-flex justify-content-center align-items-center">
                                          <i className="bx bx-microphone"></i>
                                        </div>
                                        <span className="text">
                                          Help Me Pitch!
                                        </span>
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
                                        className="d-flex justify-content-center align-items-center"
                                        onClick={() => addSummary()}
                                      >
                                        <div className="circle2 d-flex justify-content-center align-items-center">
                                          <i className="bx bxs-file"></i>
                                        </div>
                                        <span className="text">Summarize</span>
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
                                        className="d-flex justify-content-center align-items-center"
                                        onClick={() => addProductInfo()}
                                      >
                                        <div className="circle3 d-flex justify-content-center align-items-center">
                                          <i className="bx bxs-detail"></i>
                                        </div>
                                        <span className="text">
                                          Product Info
                                        </span>
                                      </div>
                                    </button>
                                  </div>

                                  <div className="row px-2 pt-1 showAll">
                                    <div className="col-lg-12 col-md-12 col-sm-12">
                                      <div className="text-end">
                                        <p className="mb-1">
                                          <span
                                            className="text-showAll"
                                            data-bs-toggle="collapse"
                                            href="#collapseExample"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="collapseExample"
                                          >
                                            {" "}
                                            Show all
                                          </span>
                                          <i className="bi bi-caret-down-fill icon-s"></i>
                                        </p>
                                      </div>
                                    </div>

                                    <div
                                      className="collapse p-1 pb-2"
                                      id="collapseExample"
                                    >
                                      <div className="">
                                        <div className="d-flex gap-3 pt-2 tab-1-buttons">
                                          <button
                                            type="button"
                                            className="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div
                                              className="d-flex justify-content-center align-items-center"
                                              onClick={() => callOpenAI()}
                                            >
                                              <div className="circle2 d-flex justify-content-center align-items-center">
                                                <i className="bx bx-microphone"></i>
                                              </div>
                                              <span className="text">
                                                Help me Pitch!
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div className="d-flex justify-content-center align-items-center">
                                              <div className="circle2 d-flex justify-content-center align-items-center">
                                                <i className="bx bxs-file"></i>
                                              </div>
                                              <span className="text">
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
                                            <div className="d-flex justify-content-center align-items-center">
                                              <div className="circle3 d-flex justify-content-center align-items-center">
                                                <i className="bx bxs-detail"></i>
                                              </div>
                                              <span className="text">
                                                Product Info
                                              </span>
                                            </div>
                                          </button>
                                        </div>
                                        <div className="d-flex gap-3 pt-2 tab-1-buttons">
                                          <button
                                            type="button"
                                            className="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div
                                              className="d-flex justify-content-center align-items-center"
                                              onClick={() => callOpenAI()}
                                            >
                                              <div className="circle2 d-flex justify-content-center align-items-center">
                                                <i className="bx bx-microphone"></i>
                                              </div>
                                              <span className="text">
                                                Help me Pitch!
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div className="d-flex justify-content-center align-items-center">
                                              <div className="circle2 d-flex justify-content-center align-items-center">
                                                <i className="bx bxs-file"></i>
                                              </div>
                                              <span className="text">
                                                Summarize
                                              </span>
                                            </div>
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-light-grey btn-sm p-2"
                                          >
                                            <div className="d-flex justify-content-center align-items-center">
                                              <div className="circle3 d-flex justify-content-center align-items-center">
                                                <i className="bx bxs-detail"></i>
                                              </div>
                                              <span className="text">
                                                Product Info
                                              </span>
                                            </div>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="row pt-2 tabExpandBorder">
                                    <div className="col-lg-12 col-md-12 col-sm-12">
                                      <div className="d-flex justify-content-end ">
                                        <i
                                          className="bi bi-arrows-angle-expand btn btn-primary"
                                          type="button"
                                          data-bs-toggle="modal"
                                          data-bs-target="#tab1ModalLabel"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="row pt-1 px-3">
                                    {pitchInfo.map((data, index) => {
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
                                                  {data.time}{" "}
                                                  <span>{data.type}</span>
                                                </span>
                                              </span>
                                            </div>
                                          </div>

                                          <div className="chatBox">
                                            <p className="p-text">
                                              {data.info}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <input
                                  type="radio"
                                  className="tabs__radio"
                                  name="tabs-example"
                                  id="tab2"
                                  onChange={() => setTab("tab2")}
                                  checked={tab === "tab2"}
                                />
                                <label htmlFor="tab2" className="tabs__label">
                                  <i className="bx bxs-message fs-4"></i>
                                </label>
                                <div
                                  className="tabs__content tab_2_content"
                                  id="tabs"
                                >
                                  <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12">
                                      <div className="d-flex justify-content-end ">
                                        <i
                                          className="bi bi-arrows-angle-expand btn btn-primary"
                                          type="button"
                                          data-bs-toggle="modal"
                                          data-bs-target="#tab2ModalLabel"
                                        ></i>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="row px-1">
                                    {chatBoxData.map((data, index) => {
                                      return (
                                        <div
                                          className="col-lg-12 col-md-12 col-sm-12"
                                          key={index}
                                        >
                                          <div
                                            className={
                                              data.name == "You"
                                                ? "d-flex justify-content-end position-relative"
                                                : "d-flex align-items-center"
                                            }
                                          >
                                            <div className="circleBotImg d-flex justify-content-center align-items-center">
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
                                            <div className="d-flex gap-2 pb-2 align-items-center">
                                              <span className="textBot">
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
                                              <span className="timeBotText">
                                                {data.time}
                                              </span>
                                              <br />
                                              <span className="timeBotText">
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
                                            <p className="p-text">{data.msg}</p>
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

                                <input
                                  type="radio"
                                  className="tabs__radio"
                                  name="tabs-example"
                                  id="tab3"
                                  onChange={() => setTab("tab3")}
                                  checked={tab === "tab3"}
                                />
                                <label htmlFor="tab3" className="tabs__label">
                                  <i className="bx bxs-file fs-4"></i>
                                </label>
                                <div
                                  className="tabs__content tab_1_content p-2"
                                  id="aiFeatureTab"
                                >
                                  {pdfFiles.map((data, index) => {
                                    return (
                                      <div
                                        className="col-lg-12 col-md-12 col-sm-12"
                                        style={{ paddingBottom: "1.5em" }}
                                        key={index}
                                      >
                                        <div className="d-flex">
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
                                            </span>
                                          </div>
                                        </div>

                                        <div className="chatBox">
                                          <span>
                                            Visit here for {data.name}
                                          </span>
                                          :{" "}
                                          <a
                                            href={data.path}
                                            rel="noopener"
                                            target="_blank"
                                            className="p-text"
                                            style={{
                                              color: "#006EDF",
                                              textDecoration: "underline",
                                            }}
                                          >
                                            {" "}
                                            {data.name}{" "}
                                          </a>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <input
                                  type="radio"
                                  className="tabs__radio"
                                  name="tabs-example"
                                  id="tab4"
                                  onChange={() => setTab("tab4")}
                                  checked={tab === "tab4"}
                                />
                                <label htmlFor="tab4" className="tabs__label">
                                  <i className="bx bxs-video fs-4"></i>
                                </label>
                                <div
                                  className="tabs__content tab_1_content p-2"
                                  id="aiFeatureTab"
                                >
                                  <div
                                    className="col-lg-12 col-md-12 col-sm-12"
                                    style={{ paddingBottom: "1.5em" }}
                                  >
                                    <div className="d-flex">
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
                                        </span>
                                      </div>
                                    </div>

                                    <div
                                      className="chatBox"
                                      onClick={() => {
                                        // <Redire
                                      }}
                                    >
                                      <ReactPlayer
                                        url="/document/MagicCX.mp4"
                                        height="20%"
                                        width="100%"
                                        onClick={() => {
                                          window.open("/document/MagicCX.mp4");
                                        }}
                                        controls
                                      />
                                    </div>
                                  </div>
                                  {/* <div className="row pt-1 px-3">
                                    <ReactPlayer url="https://ak.picdn.net/shutterstock/videos/1070767552/preview/stock-footage-beef-burger-ingredients-falling-and-landing-in-the-bun-one-by-one-in-slow-motion-fps.webm" playing loop autoPlay height="20%" width="100%"/>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <Charts
                      options={chartState.options}
                      series={chartState.series}
                      type="line"
                      width="450"
                    /> */}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </>
      ) : person == "Client" ? (
        <ClientDealerView
          peers={peers}
          muteSalesPerson={muteSalesPerson}
          salespersonVideo={salespersonVideo}
          userVideo={userVideo}
          webCamStatus={webCamStatus}
          leaveCall={leaveCall}
          toggleVideo={toggleVideo}
          muteMySelf={muteMySelf}
          unmuteMySelf={unmuteMySelf}
          muted={muted}
          videoRef={dealerVideo}
          mutePerson={muteDealer}
          OtherPeers={DealerPeers}
        />
      ) : (
        <ClientDealerView
          peers={peers}
          muteSalesPerson={muteSalesPerson}
          salespersonVideo={salespersonVideo}
          userVideo={userVideo}
          webCamStatus={webCamStatus}
          leaveCall={leaveCall}
          toggleVideo={toggleVideo}
          muteMySelf={muteMySelf}
          unmuteMySelf={unmuteMySelf}
          muted={muted}
          videoRef={clientVideo}
          mutePerson={muteClient}
          OtherPeers={ClientPeers}
        />
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

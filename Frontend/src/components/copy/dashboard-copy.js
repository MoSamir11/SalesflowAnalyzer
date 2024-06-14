import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import Navbar from "./navbar.js";
import Header from "./header.js";
import OpenAI from "openai";
import $ from "jquery";
import * as faceapi from "face-api.js";
import axios from "axios";
import { isWithGender } from "face-api.js";
import Chart from "chart.js/auto";
import { getRelativePosition } from "chart.js/helpers";
import {TextAnalyticsClient,AzureKeyCredential,} from "@azure/ai-text-analytics";
import { useRecordWebcam } from "react-record-webcam";
import RecordRTC, { RecordRTCPromiseHandler } from "recordrtc";
import useScreenRecorder from "use-screen-recorder";
import { useReactMediaRecorder } from "react-media-recorder";
//V-1.11
//loadModels(); & doContinuousRecognition(); These functions need to be called for SalesPerson
//doContinuousRecognition() need to be called for Client
//onRecognizedResult() for Client needs to be handled

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      console.log("Hi", stream);
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
    "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";
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
  const [bolburl, setBlobUrl] = useState('');
  //console.log(peers)
  //console.log(ClientPeers)

  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email"));
  const [person, setPerson] = useState(searchParams.get("person"));

  let userAudioStream = undefined;

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

  const [recordingId, setRecordingId] = useState("");
  const [videoBlob, setVideoBlob] = useState(null);
  const [type, setType] = useState(null);

//   const {startRecording,pauseRecording,blobUrl,resetRecording,resumeRecording,status,stopRecording} = useScreenRecorder({ audio: true });
const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: true, audio: true })
  if (!!window.SpeechSDK) {
    SpeechSDK = window.SpeechSDK;
    //setSpeechSDK(window.SpeechSDK)
  }

  let region = "eastus";
  var reco;
  let authorizationToken = undefined;

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:3001");
    // socketRef.current = io.connect("https://magiccx-backend.azurewebsites.net");

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
            console.log(`146--> ${JSON.stringify(obj.audio)}`);
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
                //console.log(salespersonVideo)
              });
              setSalespersonSocketId(obj.id);
              peers.push(peer);
              setMuteSalesPerson(!obj.audio);
              // doContinuousRecognition()
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
          console.log(ClientPeers);
        });
        // Set Back Button Event
        window.addEventListener("popstate", leaveCall);
        socketRef.current.on("user joined", (payload) => {
          console.log("user joined", payload.callerID);
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
              console.log(salespersonVideo);
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
          console.log(
            "237--> ClientsPeers",
            JSON.stringify(ClientPeers),
            JSON.stringify(DealerPeers)
          );
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("mute:user", (data) => {
          console.log(`223--> ${data.person}`);
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
          console.log(`250--> ${JSON.stringify(data)}`);
          let track = clientVideo.current.srcObject.getTracks()[1];
          console.log(track);
          track.enabled = false;
          // if(data.person === "Client"){
          // 	let track = clientVideo.current.srcObject.getTracks()[1];;
          // 	console.log(track);
          // }
        });

        // socketRef.current.on("show:user",(data)=>{
        // 	console.log(`250--> ${JSON.stringify(data)}`);
        // 	let track = clientVideo.current.srcObject.getTracks()[1];
        // 	console.log(track);
        // 	track.enabled = true;
        // })

        // socketRef.current.on("disconnected",()=>{
        // 	console.log("user-disconnected")
        // 	navigate("/");
        // 	window.location.reload()
        // });

        // socketRef.current.on("user:left",(id)=>{
        // 	console.log(`288--> ${id}`);
        // 	const peerObj = peersRef.current.find(p=>p.peerID === id);
        // 	console.log(id, peerObj);
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
          console.log("305-->", peerIdx, ClientPeers);
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
  }, []);

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
    if (person === "SalesPerson") {
      socketRef.current.emit("salesperson-disconnected", {
        roomID,
        id: socketRef.current.id,
        msg: conversation,
      });
      window.location.href = "/";
      return;
    }
    // e.preventDefault();
    console.log("348-->", conversation);
    socketRef.current.emit("disconnectUser", {
      roomID,
      id: socketRef.current.id,
      msg: conversation,
    });
    window.location.href = "/";
    // socketRef.current.disconnect();
    // navigate("/");
    // window.location.reload();
  };

  const callOpenAI = async () => {
    //console.log("Hi from callOpenAI")
    //conversation_history += ""
    //console.log(conversation_history)

    const openai = new OpenAI({
      apiKey: openai_subscription_key,
      dangerouslyAllowBrowser: true,
    });

    document.getElementById("aibutton").disabled = true;

    //let prompt  = conversation_history

    let system_prompt =
      "Act as a car salesman.  Given below is a HTML conversation which shows the customer's emotion based on words spoken by the Salesman. Suggest what you should say next to make the Customer pleasantly surprised. Remove \"Salesman Says\" from your response. I don't need customer's side conversation.";

    let messages = [
      { role: "system", content: system_prompt },
      { role: "user", content: conversation_history },
    ];

    //console.log(messages)

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      const text = chatCompletion.choices[0].message.content;
      //return text;
      //console.log(text)

      document.getElementById("aidivspeech").innerHTML += `<div class="pt-4">
				<span>
					${text}
				</span>
			</div>
			`;
      document.getElementById("aidivspeech").scrollTop =
        document.getElementById("aidivspeech").scrollHeight;

      document.getElementById("aibutton").disabled = false;
    } catch (err) {
      console.error(err);

      document.getElementById("aibutton").disabled = false;
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
    console.log("Hi 5");

    peer.on("signal", (signal) => {
      console.log("Hi 6");
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
				//console.log("Hi2")
				if(clientVideoStream.current){
					console.log("assigned")
					clientVideoStream.current.srcObject = stream
				}
				else{
					console.log("not assigned")
				}
				
			})
		}
		*/

    console.log("Hi 7");

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
    console.log("Hi 1");

    peer.on("signal", (signal) => {
      console.log("Hi 2");
      socketRef.current.emit("returning signal", { signal, callerID, role });
    });

    peer.signal(incomingSignal);
    console.log("Hi 3");

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

      //console.log(socketRef.current)
      if (socketRef.current) {
        //loadModels()
        socketRef.current.on("sendMSGToSalesmen", async (data) => {
          console.log(`471--> ${JSON.stringify(data)}, ${facialExp}`);
          if (data.userType == "Client") {
            conversation_history += `${getCurrentDate()} ${data.time.toUpperCase()} : ${
              data.userType
            } : ${data.sentiment} : ${facialExp} : ${data.message}\n`;
          } else if (data.userType == "Dealer") {
            conversation_history += `${getCurrentDate()} ${data.time.toUpperCase()} : ${
              data.userType
            } : ${data.sentiment} : ${data.message}\n`;
          }
          setConversation(conversation_history);
          console.log("588-->", conversation_history);
          document.getElementById(
            "speech-container"
          ).innerHTML += `<div class="client-speech speech-bubble">
					<p style="font-size: 11px; margin-bottom: 0.18rem; font-weight: bold; color: #e542a3">${
            data.userType
          }</p>
						<p style="font-size: 10px; margin-bottom: 0.1rem">${data.message.replace(
              /(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/,
              "$1$2"
            )}</p>
						<p style="font-size: 8px; margin-bottom: 0.1rem; text-align: right; padding-left: 15px">${
              data.time
            } ${data.sentiment}</p>
					</div>`;
          document.getElementById("speech-container").scrollTop =
            document.getElementById("speech-container").scrollHeight;

          const sentimentObj = await SentimentRecognition(data.message);
          console.log(`579--> 557 ${JSON.stringify(sentimentObj)}`);
          if (sentimentObj) {
            //console.log(sentimentObj.aggregate_sentiment)
            //console.log(chart)
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

            //console.log(positive, negative, neutral, mixed, ambiguous)
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
    // console.log(`579--> 1. ${time}`);
    // const options = {
    // 	method: 'POST',
    // 	url: 'https://magiccx-backend.azurewebsites.net/get-sentiment',
    // 	headers: {
    // 	  'content-type': 'application/json',
    // 	},
    // 	data: {"data" : inputtext}
    // };

    // try {

    // 	const response = await axios.request(options);
    // 	console.log(`579--> 592 ${JSON.stringify(response.data)}, `);
    // 	return response.data
    // }
    // catch (error) {
    // 	console.error(error);
    // 	return undefined
    // }

    // Call from Front End
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
      console.log(`579-->2. ${JSON.stringify(result)}`);
      return result;
    } catch (e) {
      console.log(`579-->3. ${e}`);
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

        //console.log('Token fetched from back-end: ' + token);
      } catch (err) {
        console.log(err);
      }
    }
  }

  function Initialize(onComplete) {
    //console.log(window.SpeechSDK)
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
    //console.log(SpeechSDK)
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
    //console.log(userAudioStream)
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
    //console.log(speechConfig)
    if (!speechConfig) return;

    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    //console.log(reco)
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
    //console.log("onRecognizing", result.text)
  }

  function onRecognized(sender, recognitionEventArgs) {
    var result = recognitionEventArgs.result;
    onRecognizedResult(recognitionEventArgs.result);
  }

  async function onRecognizedResult(result) {
    console.log(`827--> Called`);
    //console.log(result.reason == SpeechSDK.ResultReason.RecognizedSpeech)
    console.log(result.text);
    //console.log(person)
    if (!result.text) {
      return;
    }
    var sentiment = await SentimentRecognition(result.text);
    console.log(`579--> 780 ${JSON.stringify(sentiment)}, ${result.text}`);
    //console.log(person)

    if (person == "SalesPerson") {
      //phraseDiv.scrollTop = phraseDiv.scrollHeight;
      //phraseDiv.innerHTML = phraseDiv.innerHTML.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2');

      switch (result.reason) {
        case SpeechSDK.ResultReason.NoMatch:
        case SpeechSDK.ResultReason.Canceled:
        case SpeechSDK.ResultReason.RecognizedSpeech:
          //console.log("Salesperson", result.text)
          let date = new Date();
          let time = date
            .toLocaleString([], {
              hour: "numeric",
              minute: "2-digit",
            })
            .toLowerCase();
          document.getElementById(
            "speech-container"
          ).innerHTML += `<div class="salesman-speech speech-bubble">
					<p style="font-size: 11px; margin-bottom: 0.18rem; font-weight: bold; color: #ffc107">You</p>
						<p style="font-size: 10px; margin-bottom: 0.1rem">${result.text.replace(
              /(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/,
              "$1$2"
            )}</p>
						<p style="font-size: 8px; margin-bottom: 0.1rem; text-align: right; padding-left: 15px;">${time}</p>
					</div>`;
          document.getElementById("speech-container").scrollTop =
            document.getElementById("speech-container").scrollHeight;

          //console.log("Hi")
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

          //console.log(expressions_transcript)

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
            })
            .toLowerCase();
          let capitalizedSentiment =
            sentiment.overall_sentiment.charAt(0).toUpperCase() +
            sentiment.overall_sentiment.slice(1);
          console.log("911-->", facialExp);
          socketRef.current.emit("sendMSG", {
            to: roomID,
            message: result.text,
            time: time,
            person: person,
            sentiment: capitalizedSentiment,
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
      //console.log(clientVideoStream.current)
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
            //console.log(detections[0].expressions)
            let ExpressionKeyArray = Object.keys(detections[0].expressions);
            //console.log(ExpressionKeyArray)
            ExpressionKeyArray.map((obj) => {
            //   console.log("962--> 1.", obj);
              facialExp = obj;

              setClientFE(obj);
            //   console.log(`962--> 2. ${facialExp}, ${clientFE}`);
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
              }
            });

            //console.log(Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b))
            //let date = new Date();
            //let showTime = date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds();
            //expressions[(new Date).getTime()] = Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)
            //console.log(expressions)
            /*
						if(Number((new Date).getTime()) - last_speech_recognised_timestamp <= 1000){
							expressions_transcript[(new Date).getTime()] = {"emotion" : Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)}

							console.log(expressions_transcript)
							
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

                //console.log(expressions_transcript)

                //speechDiv.innerHTML = speechDiv.innerHTML + Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b) + `[...]\r\n`;
                //speechDiv.scrollTop = speechDiv.scrollHeight;

                // conversation_history += '\nCustomer Emotion: '+ Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)

                //console.log(conversation_history)
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
    console.log(`942--> ${muted}`);
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
    console.log("Function Called");
    setWebCamStatus(!webCamStatus);
    let track = stream.getTracks()[1];
    console.log(track);
    console.log(webCamStatus);
    if (webCamStatus) {
      track.enabled = false;
      console.log(userVideo);
    } else {
      track.enabled = true;
      console.log(userVideo);
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
  console.log(clientVideo.current.srcObject);
  // const isCameraOff = stream.getTracks()[1].enabled;

  async function recording() {
    setIsRecording(true);
    startRecording();
	// setBlobUrl(mediaBlobUrl)
  }

  const stopRecord = async () => {
    setIsRecording(false);
    stopRecording()
	setTimeout(()=>{
		var bUrl = document.getElementById("bloburls").innerHTML;
		console.log('1332-->', bUrl);
		socketRef.current.emit("upload-meeting",bUrl)
	},1000)
	var name = document.getElementById("Samir").innerHTML;
	console.log('1332-->',name);
  };

  function getBlobUrl(){
	console.log('1336-->', status);
	return mediaBlobUrl;
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

    <div className="wrapper">
      <div className="main fixed">
        {person == "SalesPerson" ? (
          <>
            <main className="content-salesman px-3 py-2">
              <div className="container-fluid">
                <div className="row mt-3 ">
                  <div className="col-lg-5 col-md-12 col-sm-12">
                    <div className="row">
                      <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="card">
                          <div className="salesman-video-container">
                            <div className="salesman-video">
                              {hideClientVideo ? (
                                <p>Hide Client Video</p>
                              ) : (
                                ClientPeers.map((peer, index) => {
                                  console.log(ClientPeers);
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
                                })
                              )}
                            </div>

                            <div className="profile-overlay-salesman">
                              {userVideo && (
                                <video
                                  playsInline
                                  muted={muted}
                                  ref={userVideo}
                                  autoPlay
                                  loop
                                ></video>
                              )}
                            </div>
                            <div className="profile-overlay-salesman-2">
                              {
                                /* 
															peers.map((peer, index) => {
																return (
																	<video key={index} playsInline peer={peer}  ref={salespersonVideo} autoPlay></video>
																);
															}) 
															*/

                                DealerPeers.map((peer, index) => {
                                  return (
                                    <video
                                      key={index}
                                      playsInline
                                      muted={muteDealer}
                                      ref={dealerVideo}
                                      autoPlay
                                    ></video>
                                  );
                                })
                              }
                            </div>
                          </div>

                          <div className="controls-wrapper position-absolute bottom-0 start-80 translate-middle-x">
                            <div className="controls">
                              <button className="btn control-circle">
                                <i className="bi bi-volume-up"></i>
                              </button>
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
                              {/* <button className="btn control-circle" onClick={()=>muteMySelf()}>
															<i className={muted?"bi bi-mic-mute": "bi bi-mic"}></i>
														</button> */}
                              <button
                                className="btn control-circle-red"
                                onClick={() => leaveCall()}
                              >
                                <i className="bi bi-telephone-fill"></i>
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
                              <button className="btn control-circle">
                                <i className="bi bi-people"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row pt-4">
                      <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="card">
                          <div className="card-header p-3 text-center">
                            <button
                              className="generate-response-button"
                              id="aibutton"
                              onClick={() => callOpenAI()}
                            >
                              <b>Generate AI Response</b>
                            </button>
                          </div>
                          <div className="card-body" id="aidivspeech" style={{ maxHeight: "350px", overflowY: "scroll" }}></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      {(status === "idle" || status === "permission-requested" || status === "error") && (
                        <button onClick={() => recording()}>
                          Start recording
                        </button>
                      )}
                      {(status === "recording" || status === "paused") && (
                        <button onClick={() => stopRecord()}>
                          Stop recording
                        </button>
                      )}
					            <p id="bloburls">{mediaBlobUrl}</p>
					            <p id="Samir">Hello World</p>
                    </div>
                  </div>

                  <div className="col-lg-7 col-md-12 col-sm-12">
                    <div className="row">
                      <div className="col-lg-6 col-md-12 col-sm-12 pb-res">
                        <div className="card">
                          <div className="card-body p-4">
                            <div className="row chart-res">
                              <div className="col-lg-10 col-md-10 col-sm-10 pt-1">
                                <span className="sentiment fs-5 fw-bold">
                                  <b>Expression Score</b>
                                </span>
                              </div>
                              <div className="col-lg-2 col-md-2 col-sm-2 d-flex justify-content-center align-items-center">
                                <i className="sentiment-i bi bi-info-circle fs-5 violet"></i>
                              </div>
                              <div>
                                <span className="sentiment-t fs-6 pt-2">
                                  See their facial expression in one sheet
                                </span>
                              </div>
                            </div>

                            <div className="skill-bars pt-3">
                              <div
                                className="bar"
                                data-label="Happy"
                                data-value="90"
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
                                data-label="Disgusted"
                                data-value="25"
                                data-color="#cc1717"
                                id="disgusted"
                              ></div>
                              <div
                                className="bar"
                                data-label="Neutral"
                                data-value="50"
                                data-color="#712cf9"
                                id="neutral"
                              ></div>
                              <div
                                className="bar"
                                data-label="Angry"
                                data-value="25"
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

                      <div className="col-lg-6 col-md-12 col-sm-12 col-sm-12">
                        <div className="card">
                          <div className="card-body p-4">
                            <div className="row chart-res">
                              <div className="col-lg-10 col-md-10 col-sm-10 pt-1">
                                <span className="sentiment fs-5 fw-bold">
                                  <b>Sentiment Score</b>
                                </span>
                              </div>
                              <div className="col-lg-2 col-md-2 col-sm-2 d-flex justify-content-center align-items-center">
                                <i className="sentiment-i bi bi-info-circle fs-5 violet"></i>
                              </div>
                              <div>
                                <span className="sentiment-t fs-6 pt-2">
                                  See their Tone in one sheet
                                </span>
                              </div>
                            </div>
                            <div className="chart-res d-flex justify-content-center align-items-center pt-4">
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

                        <div className="row pt-4 pb-res">
                          <div className="col-lg-12 col-md-12 col-sm-12">
                            <div className="card">
                              <div className="card-header p-1 text-center">
                                <span>
                                  <b>Speech to Text</b>
                                </span>
                              </div>
                              <div className="chat-container">
                                <div
                                  className="speech-container"
                                  id="speech-container"
                                ></div>
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
                                  muted={muted}
                                  ref={userVideo}
                                  autoPlay
                                  loop
                                ></video>
                              )}
                            </div>
                          </div>

                          <div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
                            <div className="controls-client">
                              <button className="btn control-circle-client">
                                <i className="bi bi-volume-up"></i>
                              </button>
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
                              <button className="btn control-circle-client">
                                <i className="bi bi-people"></i>
                              </button>
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
                                <video key={peer.peerID} playsInline ref={salespersonVideo} muted={muteSalesPerson} autoPlay></video>
                              );
                            })}
                            {ClientPeers.map((peer, index) => {
                              return (
                                <video key={index} playsInline muted={muteClient} ref={clientVideo} autoPlay></video>
                              );
                            })}

                            <div className="profile-overlay-client">
                              {userVideo && (
                                <video playsInline muted={muted} ref={userVideo} autoPlay loop></video>
                              )}
                            </div>
                          </div>

                          <div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
                            <div className="controls-client">
                              <button className="btn control-circle-client">
                                <i className="bi bi-volume-up"></i>
                              </button>
                              {muted ? (
                                <button className="btn control-circle-client" onClick={() => unmuteMySelf()}>
                                  <i className="bi bi-mic-mute"></i>
                                </button>
                              ) : (
                                <button className="btn control-circle-client" onClick={() => muteMySelf()}>
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
                                <button class="btn control-circle-client" onClick={() => toggleVideo()}>
                                  <i className="bi bi-camera-video"></i>
                                </button>
                              ) : (
                                <button class="btn control-circle-client" onClick={() => toggleVideo()}
                                >
                                  <i className="bi bi-camera-video-off"></i>
                                </button>
                              )}
                              <button className="btn control-circle-client">
                                <i className="bi bi-people"></i>
                              </button>
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
      </div>
    </div>
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
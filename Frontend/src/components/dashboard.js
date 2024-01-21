import $ from 'jquery';
import React, { useEffect, useRef, useState } from "react"
import Navbar from './navbar.js'
import Header from './header.js'
import {useLocation, useParams, useSearchParams} from 'react-router-dom';
import Peer from "simple-peer"
import * as faceapi from "face-api.js";
import axios from "axios";
import OpenAI from 'openai';
import io from "socket.io-client"
import { useSocket } from "./context/SocketProvider";
import { isWithGender } from 'face-api.js';
import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
/*
  ChartJS.register(
	RadialLinearScale,
	PointElement,
	LineElement,
	Filler,
	Tooltip,
	Legend
  );
*/
//V-1.11

//const socket = io.connect('http://localhost:3001')
//const authorizationEndpoint = "http://localhost:3001/api/get-speech-token";
const authorizationEndpoint = "https://facial-emotion-recognition-backend-dev-v2.azurewebsites.net/api/get-speech-token";
let subscriptionKey = "b728cec31ab14a2da7749569701f599d"
let openai_subscription_key = "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"
let conversation_history = ""

function Dashboard(props) {

	const { chatroom } = useParams();
	//console.log("Room ID", { id, chatroom }); 
	let location = useLocation();
	//console.log("name", location.state.data)
	const socket = useSocket();

	const [ room, setRoom ] = useState(chatroom)

  	const [ me, setMe ] = useState("")

	const [ stream, setStream ] = useState()
	//const [ userAudioStream, setUserAudioStream ] = useState()
	let userAudioStream = undefined

	const [searchParams, setSearchParams] = useSearchParams();
	const [ name, setName ] = useState(searchParams.get('email'))
	const [ callerName, setCallerName ] = useState("")

	//const [ person, setPerson ] = useState("")
	const [ person, setPerson ] = useState(searchParams.get('person'))

	let [ caller, setCaller ] = useState("")
	const [ idToCall, setIdToCall ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()

	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ callEnded, setCallEnded] = useState(false)

	let myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

  	let expressions = {}
	let transcript = {}

	let expressions_transcript = {}
	let last_speech_recognised_timestamp = 0
	

	const canvasRef = useRef();

	let SpeechSDK = undefined;
	//let [SpeechSDK, setSpeechSDK] = useState()

	if (!!window.SpeechSDK) {
		SpeechSDK = window.SpeechSDK;
		//setSpeechSDK(window.SpeechSDK)
	}



  	let region = "eastus";
  	var reco;
  	let authorizationToken = undefined;
	let phraseDiv = document.getElementById("phraseDiv");
	let speechDiv = document.getElementById("speechDiv");
	let AISpeechDiv = document.getElementById("AISpeechDiv");
	let customerPhraseDiv = document.getElementById("customerPhraseDiv");
	let sentimentDiv = document.getElementById("sentimentDiv");

  	const openai = new OpenAI({
		apiKey: openai_subscription_key,
		dangerouslyAllowBrowser: true
	});

	let render_flag_useState = 0
	let render_flag_user_joined = 0
	let render_flag_callUser = 0

	let chartData = {}

	const [chartId, setChartId] = useState()

  	useEffect( () => {
		if(person == "SalesPerson"){
			let $chart = $("#sentiment-chart");
			let labels = $chart.data("labels").split(", ").map(label => label.trim());
			let data = $chart.data("data").split(", ").map(value => parseInt(value.trim()));
			let bgColor = $chart.data("bg-color");
			let pointBgColor = $chart.data("point-bg-color");
			let borderColor = $chart.data("border-color");
			let borderWidth = parseInt($chart.data("border-width"));
			let pointRadius = parseInt($chart.data("point-radius"));
			let lineWidth = parseInt($chart.data("line-width"));
			let isResponsive = $chart.data("responsive") === "true";
		
			var chrt = $chart[0].getContext("2d");
		
			var chart = new Chart(chrt, {
				type: 'radar',
				data: {
					labels: labels,
					datasets: [{
						label: "",
						data: data,
						backgroundColor: [bgColor],
						pointBackgroundColor: [pointBgColor, pointBgColor, pointBgColor],
						borderColor: [borderColor],
						borderWidth: borderWidth,
						pointRadius: pointRadius,
					}],
				},
				options: {
					responsive: isResponsive,
					maintainAspectRatio: false,
					elements: {
						line: {
							borderWidth: lineWidth,
						}
					}
				}
			});

			//console.log(chart)
			setChartId(chart)

			socket.on("sendMSGToSalesmen", async (data) => {
				console.log(data)
				//console.log(me)
				console.log(me)
				//if(data.to == me){
	
					document.getElementById("speech-container").innerHTML += 
					`<div class="client-speech speech-bubble">
						<p style="font-size: 10px; margin-bottom: 0.3rem">${data.message.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2')}</p>
					</div>`
					document.getElementById("speech-container").scrollTop = document.getElementById("speech-container").scrollHeight;
					
					const sentimentObj = await SentimentRecognition(data.message)
					if(sentimentObj){
						//console.log(sentimentObj.aggregate_sentiment)
						//console.log(chart)
						let aggregate_sentiment_obj = sentimentObj.aggregate_sentiment
						let positive = (aggregate_sentiment_obj.positive > 0) ? (aggregate_sentiment_obj.positive * 40) : Math.floor(Math.random() * (15 - 10 + 1)) + 10
						let negative = (aggregate_sentiment_obj.negative > 0) ? (aggregate_sentiment_obj.negative * 40) : Math.floor(Math.random() * (15 - 10 + 1)) + 10
						let neutral = (aggregate_sentiment_obj.neutral > 0) ? (aggregate_sentiment_obj.neutral * 40) : Math.floor(Math.random() * (15 - 10 + 1)) + 10
						//let mixed = Math.floor(Math.random() * (15 - 10 + 1)) + 15
						//let ambiguous = Math.floor(Math.random() * (20 - 15 + 1)) + 10

						//console.log(positive, negative, neutral, mixed, ambiguous)
						if(chart){
							chart.data.datasets[0].data = [positive, negative, neutral]
							chart.update();
						}
					}
					
				//}
			})
		}
	}, [person])

	useEffect(() => {
		if (myVideo.current) {
			myVideo.current.srcObject = stream
		}
	}, [stream])

	/*
	useEffect( () => {
		//console.log(chartId)
	}, [chartId])
	*/

  	useEffect( () => {
		socket.emit("getId", {id: socket.id})

		socket.on("me", (id) => {
			setMe(id)
		})

		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
			//console.log(myVideo)
			/*
			if (myVideo.current) {
				myVideo.current.srcObject = stream
			}
			*/
		})

		//if(render_flag_useState == 0){
			//console.log("Hi From Testing")

			socket.on("callUser", (data) => {
				//if(render_flag_callUser == 0){
					//console.log(data)
					//console.log(me)
					if(data.from != me){
						setReceivingCall(true)
						setCaller(data.from)
						setCallerName(data.name)
						setCallerSignal(data.signal)
						//setPerson("Client")
					}
					document.getElementById('openModal').click()
					//answerCall()
				//}
				render_flag_callUser = 1
			})

			socket.on("callEnded", (data) => {
				if(speechDiv){
					speechDiv.innerHTML = ""
					speechDiv.style.display = "none";
				}
				if(phraseDiv){
					phraseDiv.innerHTML = ""
					phraseDiv.style.display = "none";
				}
				
				setReceivingCall(false)
				setCallAccepted(false)
				setCallEnded(false)
				setCaller("")
				setCallerName("")
				setCallerSignal("")
				setIdToCall("")
				window.location.href="/";
			})

			Initialize(async function (speechSdkParam) {
				SpeechSDK = speechSdkParam;

				// in case we have a function for getting an authorization token, call it.
				if (typeof RequestAuthorizationToken === "function") {
					await RequestAuthorizationToken();
				}
			});
			

			//console.log(document.getElementById("chartJS"))
			render_flag_useState = 1
		//}

	}, [])

	useEffect(() => {
		if(me != ""){
			socket.emit("room:join", { name, room, person });
		}

		socket.on("user:joined", (data) => {
			let caller_details = {}

			if(data.users.length > 2){
				alert("Max 2 Users are allowed")
				window.location.href = "/"
			}

			if(person == "SalesPerson"){
				if(me != "" && data.id != me){
					setCallerName(data.name)
					setCaller(data.id)
					//callUser(data.id)
					document.getElementById('openModal2').click()
				}
				else if(data.id == me){
					//console.log(data.users.length)
					//console.log(data.users)
					//console.log(me)
					if(data.users.length == 2){
						data.users.map((obj) => {
							if(obj != me){
								setCallerName(obj)
								setCaller(obj)
								//callUser(data.id)
								document.getElementById('openModal2').click()
								return
							}
						})
					}
				}
			}
			else if(person == "Client"){
				if(me != "" && data.id == me){
					alert("Please wait our agent will call you soon")
				}
			}
			render_flag_user_joined = 1
		})

	}, [me])

	/*
	useEffect( () => {
		//console.log(person)
		
	}, [person]) 
	*/
	


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
		}
		else{
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
		fr.addEventListener("loadend", (e) => {
			var buf = e.target.result;
			cb(buf);
		}, false);
	}

	function getAudioConfigFromStream() {
		//console.log(userAudioStream)
		if (userAudioStream) {
			let audioFormat = SpeechSDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
			let audioStream = SpeechSDK.AudioInputStream.createPushStream();
			getAudioStream(userAudioStream, (b) => {
				audioStream.write(b.slice());
				audioStream.close();
			});
			return SpeechSDK.AudioConfig.fromStreamInput(audioStream, audioFormat);
		} else {
			window.alert('No Audio Source Found.');
			return;
		}
	}

	function getSpeechConfig(sdkConfigType) {
		let speechConfig;
		if (authorizationToken) {
			speechConfig = sdkConfigType.fromAuthorizationToken(authorizationToken, region);
		}
		else {
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
		//console.log(person)
		if(person == "SalesPerson"){
			//phraseDiv.style.display = "inline-block";
			//customerPhraseDiv.style.display = "inline-block";
		}
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

	function doContinuousRecognitionClient() {
		var audioConfig = getAudioConfigFromStream();
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

	function onRecognizedResult(result) {
		//console.log(result.reason == SpeechSDK.ResultReason.RecognizedSpeech)
		//console.log(result.text)
		//console.log(person)
		if(!result.text){
			return
		}

		//console.log(person)

		if(person == "Client"){
			switch (result.reason) {
				case SpeechSDK.ResultReason.NoMatch:
				case SpeechSDK.ResultReason.Canceled:
				case SpeechSDK.ResultReason.RecognizedSpeech:
					//console.log("Client",result.text)
					
					socket.emit("sendMSG", { to: caller, message: result.text })

					break;
				case SpeechSDK.ResultReason.TranslatedSpeech:
				case SpeechSDK.ResultReason.RecognizedIntent:
			}
		}
		else {
			//phraseDiv.scrollTop = phraseDiv.scrollHeight;
			//phraseDiv.innerHTML = phraseDiv.innerHTML.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2');

			switch (result.reason) {
				case SpeechSDK.ResultReason.NoMatch:
				case SpeechSDK.ResultReason.Canceled:
				case SpeechSDK.ResultReason.RecognizedSpeech:
					//console.log("Salesperson", result.text)
					document.getElementById("speech-container").innerHTML += 
					`<div class="salesman-speech speech-bubble">
						<p style="font-size: 10px; margin-bottom: 0.3rem">${result.text.replace(/(.*)(^|[\r\n]+).*\[\.\.\.\][\r\n]+/, '$1$2')}</p>
					</div>`
					document.getElementById("speech-container").scrollTop = document.getElementById("speech-container").scrollHeight;

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
					
					
					transcript[(new Date).getTime()] = result.text
					last_speech_recognised_timestamp = (new Date).getTime()
					expressions_transcript[(new Date).getTime()] = {"transcript" : result.text}

					conversation_history += '<br> Salesman says: '+ result.text

					//console.log(expressions_transcript)
					

					break;
				case SpeechSDK.ResultReason.TranslatedSpeech:
				case SpeechSDK.ResultReason.RecognizedIntent:
			}
		}
	}

	function onSessionStarted(sender, sessionEventArgs) {	
	}

	function onSessionStopped(sender, sessionEventArgs) {
	}

	function onCanceled (sender, cancellationEventArgs) {
		window.console.log(cancellationEventArgs);
	}

	const callUser = (id) => {
		//console.log("From CallUser")
		//setPerson("SalesPerson")
		setCaller(id)
		if(!document.getElementById("chartJS")){
			var body= document.getElementsByTagName('body')[0];
			var script= document.createElement('script');
			script.src= '/js/script.js';
			script.id= 'chartJS';
			body.appendChild(script);
		}
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
				]
			},
			stream: stream
		})
		peer.on("signal", (data) => {
			//console.log("call from signal", data)
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			//console.log("Hi2")
			userVideo.current.srcObject = stream
		})
		socket.on("callAccepted", (data) => {
			//console.log(data)
			setCallAccepted(true)
			peer.signal(data.signal)
			//setCaller(data.from)
			setCallerName(data.name)
			loadModels();
			doContinuousRecognition();
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		//console.log("From answerCall")
		//setPerson("Client")
		let render_emit_flag = 0
		setCallAccepted(true)
		//setPerson("SalesPerson")
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})

		peer.on("signal", (data) => {
			//if(render_emit_flag == 0){
				//console.log("call from answer")
				//console.log({ signal: data, to: caller, name: name })
				socket.emit("answerCall", { signal: data, to: caller, name: name })
			//}
			//render_emit_flag = 1
		})
		peer.on("stream", (stream) => {
				//console.log("Hi")
				//console.log(stream.getAudioTracks()[0])
				//setUserAudioStream(stream.getAudioTracks()[0])
				//userAudioStream = stream.getAudioTracks()[0]
				userVideo.current.srcObject = stream
			
		})
		
		peer.signal(callerSignal)
		connectionRef.current = peer
		//loadModels();

		doContinuousRecognition()
	}

	const rejectCall = () => {
		setCallEnded(false)
		setCallAccepted(false)
		setReceivingCall(false)
		setCaller("")
		setCallerName("")
		setCallerSignal(null)
		setIdToCall("")
	}

	const leaveCall = () => {
		
		socket.emit("callEnded")
		connectionRef.current.destroy()

		if(speechDiv){
			speechDiv.innerHTML = ""
			speechDiv.style.display = "none";
		}
		if(phraseDiv){
			phraseDiv.innerHTML = ""
			phraseDiv.style.display = "none";
		}
			
		setReceivingCall(false)
		setCallAccepted(false)
		setCallEnded(false)
		setCaller("")
		setCallerName("")
		setCallerSignal("")
		setIdToCall("")
		
		window.location.href = "/"
	}

	const loadModels = () => {
		Promise.all([
		  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
		  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
		  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
		  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
		]).then(() => {
		  faceDetection();
		})
	}

	const faceDetection = async () => {
		let interval = setInterval(async() => {
			if(userVideo.current){
				const detections = await faceapi.detectAllFaces(userVideo.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

				if(detections){
					if(detections.length > 0){
						//console.log(detections[0].expressions)
						let ExpressionKeyArray = Object.keys(detections[0].expressions)
						//console.log(ExpressionKeyArray)
						ExpressionKeyArray.map((obj) => {
							if(obj == "happy"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["happy"])*100)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#712cf9" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>Happy</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("happy").innerHTML = labelHtml + barHtml + valueHtml
							}
							else if(obj == "sad"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["sad"])*100)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#FFA500" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>' + "Sad" + '</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("sad").innerHTML = labelHtml + barHtml + valueHtml
							}
							else if(obj == "angry"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["angry"])*100)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#cc1717" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>' + "Angry" + '</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("angry").innerHTML = labelHtml + barHtml + valueHtml
							}
							else if(obj == "disgusted"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["disgusted"])*100)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#cc1717" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>' + "Disgusted" + '</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("disgusted").innerHTML = labelHtml + barHtml + valueHtml
							}
							else if(obj == "neutral"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["neutral"])*100)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#712cf9" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>' + "Neutral" + '</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("neutral").innerHTML = labelHtml + barHtml + valueHtml
							}
							else if(obj == "surprised"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["surprised"])*100)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#712cf9" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>' + "Surprised" + '</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("surprised").innerHTML = labelHtml + barHtml + valueHtml
							}
							else if(obj == "fearful"){
								let expressionNumber = Math.floor(Number(detections[0].expressions["fearful"])*10)
								if(expressionNumber == 0){
									expressionNumber = 1
								}
								var barHtml = '<div class="progress-line"><span style="width: ' + expressionNumber + '%; background: ' + "#FFA500" + ';"></span></div>';
								var labelHtml = '<div class="info"><span>' + "Fearful" + '</span></div>';
								var valueHtml = '<div class="value-display">' + expressionNumber + '</div>';

								document.getElementById("fearful").innerHTML = labelHtml + barHtml + valueHtml
							}
						})

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
						if(Number((new Date).getTime()) - last_speech_recognised_timestamp <= 3000){
							if(expressions_transcript[Object.keys(expressions_transcript)[Object.keys(expressions_transcript).length - 1]].transcript){
								expressions_transcript[(new Date).getTime()] = {"emotion" : Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)}

								//console.log(expressions_transcript)
								
								//speechDiv.innerHTML = speechDiv.innerHTML + Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b) + `[...]\r\n`;
								//speechDiv.scrollTop = speechDiv.scrollHeight;

								conversation_history += '<br> Customer Emotion: '+ Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b)

								//console.log(conversation_history)
							}
						}
						
					}
				}
			}
			else{
				clearInterval(interval)
			}
		}, 1000)
	}

	const callOpenAI = async () => {
		//conversation_history += ""
		//console.log(conversation_history)
		
		document.getElementById("aibutton").disabled = true;

		//let prompt  = conversation_history

		let system_prompt="Act as a car salesman.  Given below is a HTML conversation which shows the customer's emotion based on words spoken by the Salesman. Suggest what you should say next to make the Customer pleasantly surprised. Remove \"Salesman Says\" from your response. I don't need customer's side conversation."

		let messages = [
			{"role": "system", "content": system_prompt},
			{"role": "user", "content": conversation_history},
		]

		//console.log(messages)

		try {
			/*
			const config = new Configuration({
				apiKey: openai_subscription_key,
			})
			
			const openai = new OpenAIApi({
				apiKey: openai_subscription_key
			});
			*/

			const chatCompletion = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: messages,
			});
		
			const text = chatCompletion.choices[0].message.content;
			//return text;
			//console.log(text)

			document.getElementById("aidivspeech").innerHTML +=
			`<div class="pt-4">
				<span>
					${text}
				</span>
			</div>
			`
			document.getElementById("aidivspeech").scrollTop = document.getElementById("aidivspeech").scrollHeight;
			
			document.getElementById("aibutton").disabled = false;

		} catch (err) {
			console.error(err);
		}
	}

	const SentimentRecognition = async (inputtext) => {
		const options = {
			method: 'POST',
			url: 'https://facial-emotion-recognition-backend-dev-v2.azurewebsites.net/get-sentiment',
			headers: {
			  'content-type': 'application/json',
			},
			data: {"data" : inputtext}
		};
		
		try {
			const response = await axios.request(options);
			//console.log(response.data);
			return(response.data)
		} 
		catch (error) {
			console.error(error);
			return undefined
		}
	}


  return (
    <div className="wrapper">
        <Navbar />

        <div className="main fixed">
           <Header />
		   {
				(person=="SalesPerson") ? 
				<>
					<main className="content-salesman px-3 py-2">
						<div className="container-fluid">
							<div className="row mt-3 ">
								<div className="col-lg-5 col-md-12 col-sm-12">
									<div className="row">
										<div className="col-lg-12 col-md-12 col-sm-12">
											<div className="card">
												<div className="video-container">
													<div className="salesman-video">
														{
															callAccepted && !callEnded ?
															<>
																<video playsInline  ref={userVideo} autoPlay>
																</video>
															</>
															:
															null
														}
													</div>
													<div className="profile-overlay-salesman">
														{
															stream &&
															<video playsInline muted ref={myVideo} autoPlay loop>
															</video>
														}
													</div>
												</div>
												<div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
													<div className="controls">
														<button className="btn control-circle">
															<i className="bi bi-volume-up"></i>
														</button>
														<button className="btn control-circle">
															<i className="bi bi-mic"></i>
														</button>
														<button className="btn control-circle-red" onClick={() => leaveCall()}>
															<i className="bi bi-telephone-fill"></i>
														</button>
														<button class ="btn control-circle">
															<i className="bi bi-camera-video"></i>
														</button>
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
															<button className="generate-response-button" id="aibutton"
																onClick={() => callOpenAI()} ><b>Generate AI Response</b></button>
														</div>
														<div className="card-body" id="aidivspeech" style={{"maxHeight" : "350px", "overflowY" : "scroll"}}>
														</div>
													</div>
												</div>
									</div>
								</div>
								<div className="col-lg-7 col-md-12 col-sm-12">
									<div className="row">
										<div className="col-lg-6 col-md-12 col-sm-12 pb-res">
											<div className="card">
												<div className="card-body p-4">
													<div className="row chart-res">
														<div className="col-lg-10 col-md-10 col-sm-10 pt-1">
															<span className="sentiment fs-5 fw-bold"><b>Expression Score</b></span>
														</div>
														<div className="col-lg-2 col-md-2 col-sm-2 d-flex justify-content-center align-items-center">
															<i className="sentiment-i bi bi-info-circle fs-5 violet"></i>
														</div>
														<div>
															<span className="sentiment-t fs-6 pt-2">See their facial expression in one sheet</span>
														</div>
													</div>
													
													<div className="skill-bars pt-3">
																<div className="bar" data-label="Happy" data-value="90" data-color="#712cf9" id="happy"></div>
																<div className="bar" data-label="Sad" data-value="30" data-color="#FFA500" id="sad"></div>
																<div className="bar" data-label="Disgusted" data-value="25" data-color="#cc1717" id="disgusted"></div>
																<div className="bar" data-label="Neutral" data-value="50" data-color="#712cf9" id="neutral"></div>
																<div className="bar" data-label="Angry" data-value="25" data-color="#cc1717" id="angry"></div>
																<div className="bar" data-label="Surprised" data-value="10" data-color="#712cf9" id="surprised"></div>
																<div className="bar" data-label="Fearful" data-value="30" data-color="#FFA500" id="fearful"></div>
													</div>
												</div>
											</div>
										</div>

										<div className="col-lg-6 col-md-12 col-sm-12 col-sm-12">
											<div className="card">

												<div className="card-body p-4">
													<div className="row chart-res">
														<div className="col-lg-10 col-md-10 col-sm-10 pt-1">
															<span className="sentiment fs-5 fw-bold"><b>Sentiment Score</b></span>
														</div>
														<div className="col-lg-2 col-md-2 col-sm-2 d-flex justify-content-center align-items-center">
															<i className="sentiment-i bi bi-info-circle fs-5 violet"></i>
														</div>
														<div>
															<span className="sentiment-t fs-6 pt-2">See their Tone in one sheet</span>
														</div>
													</div>
													<div className="chart-res d-flex justify-content-center align-items-center pt-4">
														<canvas id="sentiment-chart" aria-label="chart" height="294" width="400" data-labels="Positive, Negative, Neutral" data-data="20, 40, 22" data-bg-color="#b597f0" data-point-bg-color="#b597f0" data-border-color="black" data-border-width="1" data-point-radius="2" data-line-width="3" data-responsive="false"></canvas>
													</div>
												</div>

											</div>

											<div className="row pt-4 pb-res">
												<div className="col-lg-12 col-md-12 col-sm-12">
													<div className="card">
														<div className="card-header p-1 text-center">
															<span><b>Speech to Text</b></span>
														</div>
														<div className="chat-container">
															<div className="speech-container" id="speech-container">
															</div>
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
				:
				<>
					<main className="content-client  px-3 py-2">
						<div className="container-fluid">
							<div className="row mt-3 ">
								<div className="col-lg-12 col-md-12 col-sm-12">
									<div className="row pt-3">
										<div className="col-lg-12 col-md-12 col-sm-12">
											<div className="card">
												<div className="video-container">
													<div className="client-video">
														{
															callAccepted && !callEnded ?
															<>
																<video playsInline  ref={userVideo} autoPlay>
																</video>
															</>
															:
															null
														}
													</div>
													<div className="profile-overlay-client">
														{
															stream &&
															<video playsInline muted ref={myVideo} autoPlay loop>
															</video>
														}
													</div>
												</div>
												<div className="controls-wrapper position-absolute bottom-0 start-50 translate-middle-x">
													<div className="controls-client">
														<button className="btn control-circle-client">
															<i className="bi bi-volume-up"></i>
														</button>
														<button className="btn control-circle-client">
															<i className="bi bi-mic"></i>
														</button>
														<button className="btn control-circle-red-client" onClick={ () => leaveCall()}>
															<i className="bi bi-telephone-fill"></i>
														</button>
														<button class ="btn control-circle-client">
															<i className="bi bi-camera-video"></i>
														</button>
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
		   }

			<div className="row">
				<div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-end px-4">
					<div className="btn-group pt-2">
							<button type="button" className="btn text-white bg-dark" id="openModal" style={{'display' : 'none'}} data-bs-toggle="modal" data-bs-target="#exampleModal">
								<i className="bi bi-camera-video me-2"></i>Call
							</button>
							<button type="button" className="btn text-white bg-dark" id="openModal2" style={{'display' : 'none'}} data-bs-toggle="modal" data-bs-target="#exampleModal2">
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
						<h2>Agent is Calling</h2>
						</div>
						<div className="row pt-3">
						<div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center user">
							<i className="bi bi-person-circle text-secondary"></i>
						</div>
						</div>
						<div className="row pt-5">
						<div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
							<button type="button" className="btn text-white bg-success" onClick={() => answerCall()} data-bs-dismiss="modal">
							Accept Call
						</button>
						</div>
						<div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
							<button type="button" className="btn text-white bg-danger" onClick={rejectCall} data-bs-dismiss="modal">
							Reject Call
						</button>
						</div>
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
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
						<div className="text-center pt-3">
						<h2>Client has Joined</h2>
						</div>
						<div className="row pt-3">
						<div className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center user">
							<i className="bi bi-person-circle text-secondary"></i>
						</div>
						</div>
						<div className="row pt-5">
						<div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
							<button type="button" className="btn text-white bg-success" onClick={() => callUser(caller)} data-bs-dismiss="modal">
							Call
						</button>
						</div>
						<div className="col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center">
							<button type="button" className="btn text-white bg-danger" data-bs-dismiss="modal">
							Reject Call
						</button>
						</div>
						</div>
					</div>
					</div>
				</div>
			</div>
			</div>
	</div>
  );
}

export default Dashboard;

import React, { useState, useEffect, useRef } from 'react';

const VideoChatRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Function to set up local video stream
    const setupLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    // Call the setup function when the component mounts
    setupLocalVideo();

    return () => {
      // Cleanup function to stop local video stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Function to set up remote video stream
    const setupRemoteVideo = async () => {
      try {
        const stream = new MediaStream();
        if (remoteStream) {
          stream.addTrack(remoteStream.getTracks()[0]);
          remoteVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error setting up remote video:', error);
      }
    };

    setupRemoteVideo();

  }, [remoteStream]);

  const startRecording = () => {
    try {
      const recorder = new MediaRecorder(remoteStream);
      recorder.ondataavailable = (e) => {
        setRecordedChunks(prevChunks => [...prevChunks, e.data]);
      };
      recorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log(recordedBlob);
      };

      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
      {isRecording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
    </div>
  );
};

export default VideoChatRecorder;

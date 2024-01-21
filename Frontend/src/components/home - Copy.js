import React, { useEffect, useRef, useState } from "react"
import Button from "@material-ui/core/Button"
import AssignmentIcon from "@material-ui/icons/Assignment"
import { CopyToClipboard } from "react-copy-to-clipboard"
import io from "socket.io-client"


const socket = io.connect('http://localhost:3001')
function Home() {
  const [ me, setMe ] = useState("")

  useEffect( () => {
		socket.on("me", (id) => {
			setMe(id)
		})
	}, [me])

  const JoinButton = async () => {
    window.location.href = "http://localhost:3000/dashboard/" + me
  }

  return (
    <section className="main-layout">
      <div className="row">
        <div className="col-lg-6">
          <div className="row join">
          <div className="col-lg-3">
            <div className="btn-group">
              <CopyToClipboard text={`http://localhost:3000/dashboard/${me}`} style={{ marginBottom: "2rem" }}>
                <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
                  Copy Link
                </Button>
              </CopyToClipboard>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">@</span>
              <input type="text" className="form-control" placeholder="Meeting ID" aria-label="Meeting" aria-describedby="addon-wrapping" />
            </div>
          </div>
          <div className="col-lg-4">
            <button onClick={JoinButton} type="button" className="btn btn-sm btn-primary">Join</button>
          </div>
          </div>
        </div>
        <div className="col-lg-6"></div>
      </div>
    </section>
  );
}

export default Home;
